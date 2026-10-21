# main 自动部署到阿里云

本方案复用现有服务器的 Docker Compose、宿主机 Nginx 和 Certbot，与 `mewCat-service` 分开部署。现有 `api.mewcat.kidrue.top` 和本机 `3000` 端口保留；博客使用 `https://kidrue.top`，前端和 API 分别绑定本机 `18080`、`13001`，PostgreSQL 不开放宿主机端口。

GitHub Actions 执行测试与构建，按提交 SHA 生成 API、前端、迁移工具和 PostgreSQL 镜像，打包后通过 SSH 直传。不需要镜像仓库账号，也不需要服务器访问 Docker Hub。数据库数据和旧视频分别保存在独立命名卷中。

## 1. 填写 env.local

项目根目录已经提供 `env.local` 待填写文件。它不提交到 Git，也不进入 Docker 构建上下文；模板为 `env.local.example`。不要改成 `.env.local`，后者会被 Vite 当作应用环境文件读取。

必填项目：

- `GITHUB_REPOSITORY`：已有 GitHub 仓库的 `owner/repo`，例如 `kidrue/你的博客仓库`。
- `ALIYUN_HOST`、`ALIYUN_USER`、`ALIYUN_SSH_PORT`：现有服务器 SSH 地址、用户和端口。用户需为 root 或具备免密 sudo，并能运行 Docker。
- `ALIYUN_SSH_PRIVATE_KEY_PATH`：本机无口令 OpenSSH 私钥文件路径，对应公钥已加入服务器 `authorized_keys`。推荐为博客单独生成密钥；不会读取 mewCat 的密钥。
- `ALIYUN_SSH_KNOWN_HOSTS_PATH`：已核验的服务器主机密钥记录文件路径。
- `ALIYUN_PUBLIC_IPV4`：服务器真实公网 IPv4。代理软件返回的 `198.18.x.x` 不能用于 DNS。
- `CERTBOT_EMAIL`：接收证书通知的邮箱。
- `ALIYUN_DNS_ACCESS_KEY_ID`、`ALIYUN_DNS_ACCESS_KEY_SECRET`：专用 RAM 用户的 DNS 凭据；临时 STS 凭据另填 `ALIYUN_DNS_SECURITY_TOKEN`。
- `POSTGRES_PASSWORD`：至少 16 字符，初次部署后保持稳定。
- `ADMIN_PASSWORD`：至少 12 字符，不能使用开发默认密码。
- `SESSION_SECRET`：至少 32 字符的随机值。

`IMGUR_CLIENT_ID`、`IMGUR_ACCESS_TOKEN` 可选，未配置时可以保存、发布文章，但不能自动上传图片视频。

生成随机密钥：

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

密码包含 `$`、`#` 或引号时，在 env.local 中按 dotenv 规则加引号；脚本会正确编码数据库 URL 和转义 Compose 插值，不将配置文件作为 shell 脚本执行。

主机身份需要先核验：在阿里云控制台终端运行 `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub`；在本机用 `ssh-keyscan -t ed25519 -p 22 服务器IP` 保存 known_hosts 行，并核对对应指纹。不要仅保存 SHA256 指纹字符串，也不要关闭主机校验。私钥和 known_hosts 路径可以使用 Windows 的 `C:/Users/...` 或相对项目目录的路径。

RAM 最少需要 `alidns:DescribeDomainRecords`、`alidns:AddDomainRecord`、`alidns:UpdateDomainRecord`，按阿里云控制台能力限制到 `kidrue.top`。DNS 凭据只在 Actions Runner 使用，不写入服务器。参考[阿里云 DNS API](https://help.aliyun.com/zh/dns/quick-start-1)。

## 2. 检查配置及服务器

```sh
npm run deploy:check
npm run deploy:preflight
```

`deploy:check` 只检查格式、密钥文件和必要值；不会连接 GitHub 写入配置。预检通过 SSH 读取服务器状态，不启动、停止或修改服务。

服务器需已有 Docker Engine、Compose v2（支持 `up --wait`）、Nginx、Certbot、systemd、Bash、curl、flock、sha256sum、ss、tar、gzip 和 realpath。保留现有工具，不自动重新安装。需有足够空间容纳镜像包、两组发布镜像、数据库与备份；构建在 CI 运行，不占用服务器构建内存。

内地服务器的域名需已有有效备案。防火墙放行 80/443，SSH 端口需允许 Actions Runner 连接；若只允许固定管理 IP，应使用有固定出口的 GitHub Runner。18080、13001 和 PostgreSQL 无需对公网开放。

架构默认 `linux/amd64`；服务器 `uname -m` 为 `aarch64` 时填写 `linux/arm64`。首次部署会检查架构、已有目录/容器/卷归属、端口和 Nginx 站点冲突，发现不匹配时停止，不覆盖现有项目。

## 3. 同步 GitHub 配置

先确认 `gh auth status` 已登录到拥有目标仓库管理权限的账号，再运行：

```sh
npm run deploy:sync
```

脚本创建或配置目标仓库的 `production` Environment，仅放入白名单变量和 Secrets，并加入 `main` 部署分支策略。新环境不设置人工审批；若仓库已有其他环境策略，请先核对是否符合自动发布要求。

SSH 私钥从本机路径读取并以 Secret 保存，不同步文件路径。应用密码、DNS 密钥、Imgur 凭据均作为 Secret；域名、端口、部署路径、平台和证书邮箱作为 Variable。所有值通过 stdin 传给 gh，不拼接进命令参数或输出。可选项清空后同步，会删除对应旧 Secret；运行中的容器在下一次部署时加载新值。

该命令不创建仓库、不关联 remote，也不推送代码。当前目录没有 Git 仓库；填写目标仓库并完成配置后，再进行首次关联和推送。提交前检查 `git status`，确保 `env.local` 和密钥文件未被加入。

## 4. 首次推送与自动初始化

提交到 `main` 即触发 `.github/workflows/deploy-aliyun.yml`。也可在 Actions → 部署博客到阿里云 → Run workflow 选择 main。

第一次运行将依次：

1. 安装依赖、执行类型检查和回归测试、构建及生产容器 smoke。
2. 上传并校验发布归档，导入镜像；建立 `/opt/kidrue-blog` 和独立 Compose 项目。
3. 初始化 PostgreSQL、运行 Prisma 迁移、启动 API/前端并验证本机健康状态。
4. 新增博客专用 Nginx 站点；通过阿里云 API 新增或更新根域名 `@` 的 A 记录，等待公共 DNS 生效。
5. 使用 webroot 签发博客专用证书 `kidrue-blog-kidrue.top`，启用 HTTPS 并复用或配置证书续期定时器。
6. 从 Runner 验证公网证书、当前提交版本、API 与 SPA 页面，再更新成功发布指针。

DNS 只管理根域名默认线路的一条 A 记录，保留所有子域名、邮件记录。多个根 A、根 CNAME、根 AAAA、禁用记录或非默认线路视为冲突，需要先在阿里云控制台整理。首次失败不自动撤销 DNS 变更，避免覆盖并发管理操作；排障后可重跑当前 main。

如果服务器已有非本项目管理的 `kidrue.top` Nginx 站点，会提前拒绝覆盖。证书续期只增加本项目文件，已有站点和证书不改写。

## 5. 日常更新与失败处理

后续推送 main 自动更新。发布使用 GitHub 并发控制与服务器文件锁，上传完成后核对 main SHA，过期提交跳过。正在进行的迁移不会被后续推送主动取消。

数据目录：

- 成功发布：`/opt/kidrue-blog/.deploy/current`，指向成功发布目录。
- 发布配置：`.deploy/releases/`，含受保护的运行配置、镜像版本和站点配置。
- 每次发布备份：`.deploy/backups/`，含旧版本完整发布配置、`database.dump` 和 `media.tar.gz`。
- 数据库：`kidrue-blog_postgres` 命名卷；旧本地视频：`kidrue-blog_media` 命名卷。

发布先停止博客 API，再备份和迁移。迁移尚未开始的准备/备份失败，会尝试恢复旧 API。迁移一旦开始，失败时不会自动运行旧 API 对接可能变化的数据库，也不会自动恢复旧数据库覆盖新数据；需查看迁移日志并按备份恢复。成功发布指针不变并不代表实际容器已自动回滚。

每次更新可能有博客短暂停机；已有 mewCat 容器不会停止。脚本在发布前后检查本机原服务的健康状态。镜像清理只处理本项目、未被任何容器引用的镜像，保留最近两个成功版本，不运行全局 prune。历史发布配置和备份保留，请定期复制到服务器外的安全存储并规划保留周期。

不要运行生产项目的 `docker compose down -v`。不要在首次部署后直接修改 PostgreSQL 密码，修改环境变量不能轮换已有数据库用户密码；脚本会拒绝这种变更。更换 `SESSION_SECRET` 会使已有登录失效。

## 6. 查看状态与恢复

在服务器 Bash 中：

```bash
cd /opt/kidrue-blog
release=$(readlink -f .deploy/current)
dc=(docker compose --project-directory "$PWD" --env-file "$release/image.env" \
  -p kidrue-blog -f "$release/compose.production.yaml" -f "$release/runtime.compose.json")
"${dc[@]}" ps
"${dc[@]}" logs --tail=100 api
"${dc[@]}" logs --tail=100 postgres
curl --fail http://127.0.0.1:13001/api/health
curl --fail https://kidrue.top/api/health
```

恢复会覆盖博客数据库，操作前先保留当前数据与失败发布配置。选择 `.deploy/backups/实际发布目录`，确认其中 `previous-release/image.env` 指向所需旧镜像，镜像尚存在；使用该组旧 Compose 配置暂停博客 API/前端。随后将 `database.dump` 通过 stdin 送入 PostgreSQL 容器：

```bash
# dc 数组应指向选定备份中的 previous-release 配置。
"${dc[@]}" stop api web
"${dc[@]}" exec -T postgres pg_restore -U kidrue_blog -d kidrue_blog \
  --clean --if-exists --no-owner < "$backup/database.dump"
```

将 `media.tar.gz` 解压回博客 media 卷（保留卷，不删除），恢复备份中的运行配置与博客 Nginx 配置，再执行旧版本的 `up -d --no-build --wait api web`，检查数据库、登录和域名后更新成功发布指针。若 Docker 网络重建，应通过迁移工具镜像重新运行 `scripts/deploy/runtime.mjs`，将当前网络网关写入可信代理配置。旧镜像若已清理，需要从对应提交重新构建后再恢复。

本地 PGlite 中的文章不会自动复制到生产 PostgreSQL；需要保留本地内容时另行导出迁移。首次上线默认创建空的生产数据库。

## 验证范围

部署单元测试覆盖配置、Secrets 白名单、特殊字符、DNS 幂等/冲突及代理隔离。Actions 中的容器 smoke 实际验证生产镜像、数据库迁移、登录与文章发布、视频 Range、SPA/字体、重建后的数据和会话持久化、备份恢复，以及博客和旧域名 Nginx 配置共存。

本机没有 Docker 引擎，因此本地没有宣称通过真实容器启动。填完配置后的第一次 Actions 成功，以及真实域名 HTTPS 联调结果，才是服务器上线的最终证据。
