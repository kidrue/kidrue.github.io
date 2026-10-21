# 部署

推送 main 自动 Docker 部署、从 `env.local` 同步 GitHub 配置并绑定 kidrue.top，见 [Docker 自动部署](docker-deployment.md)。下文是直接运行 Node 的手动部署方案。

前端输出静态文件，Node API 独立运行。通过同一 HTTPS 域名代理 `/api/` 与 `/uploads/`，浏览器使用同源 Cookie。以下以 Linux、Node.js 22、Nginx、PostgreSQL 16 为例。

## 数据库和环境变量

创建独立 PostgreSQL 数据库及用户。仓库提供 `compose.yaml`，可在已安装 Docker 的服务器运行 `docker compose up -d postgres`；先在根 `.env` 设置 `POSTGRES_PASSWORD`，其端口为本机 `5433`。已有 PostgreSQL 也可直接配置连接地址。

复制根 `.env.example` 为 `.env`，设置：

```dotenv
NODE_ENV=production
HOST=127.0.0.1
PORT=3001
DATABASE_URL=postgresql://kidrue:URL编码后的密码@127.0.0.1:5433/kidrue_blog
ADMIN_PASSWORD=自行设置至少12字符的独立密码
SESSION_SECRET=自行生成至少32字符的随机密钥
PUBLIC_ORIGIN=https://blog.example.com
MEDIA_DIRECTORY=/srv/kidrue-data/videos
IMGUR_CLIENT_ID=你的ClientID
# 可选：上传内容归入对应 Imgur 账户。
IMGUR_ACCESS_TOKEN=
```

`PUBLIC_ORIGIN` 填完整访问源，不带末尾斜杠。生产 Cookie 设置 `Secure`，必须使用 HTTPS。可用 `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` 生成会话密钥。凭据只保存在后端环境变量，禁止以 `VITE_` 前缀暴露。

## 安装、迁移和启动

在仓库根目录执行：

```sh
npm ci
npm run build
npm run db:migrate
npm start
```

先安装包含开发工具的完整依赖完成构建和迁移。安装过程会生成 Prisma 客户端，构建无需重写引擎文件。更新 schema 后，停止 API，运行 `npm run db:generate`，再重新构建、迁移与启动。

前端和后端均由 Vite 构建，TypeScript 另行检查类型。前端静态产物在 `apps/web/dist/`；后端 ESM 产物在 `apps/api/dist/`，启动入口仍为 `production.js`。后端将 Prisma、Fastify 和共享包作为运行时依赖，部署时需保留对应依赖、生成的 Prisma Client、`packages/shared/dist/` 和 `apps/api/prisma/`。不要仅复制后端的 JavaScript 文件到空目录运行。构建及迁移阶段需要开发依赖中的 Vite、TypeScript 和 Prisma CLI；生产入口不会启用 PGlite。

本地可用 `npm run preview` 在 `127.0.0.1:4173` 检查前端产物，其代理配置与开发环境相同，但不会自动启动 API。生产仍由 Nginx 提供静态文件和同源代理。

`npm start` 强制生产模式；缺少数据库、管理员密码或会话密钥时拒绝启动。使用进程管理器或系统服务保持运行，并将工作目录设为仓库根目录。生产连接标准 PostgreSQL，PGlite 仅用于本地开发和测试。

## Nginx 示例

将 `apps/web/dist/` 放到 `/srv/kidrue-web/`。在已配置证书的 HTTPS `server` 块内加入：

```nginx
root /srv/kidrue-web;
index index.html;
client_max_body_size 110m;

location /api/ {
    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 200s;
    proxy_send_timeout 200s;
}

location /uploads/ {
    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Host $host;
    proxy_read_timeout 130s;
}

location / {
    try_files $uri $uri/ /index.html;
}
```

保留原始 Host，并设置 `PUBLIC_ORIGIN`，才能正确通过写操作的来源校验。SPA 回退支持直接访问和刷新 `/blog`、`/editor`。前端与 API 可分开部署，但公开域名仍需将这两个前缀路由到 API。

## 持久化与检查

- PostgreSQL：备份博客数据库。Compose 使用 `kidrue-postgres` 数据卷。
- 视频：备份 `MEDIA_DIRECTORY`，更新代码时保留该目录。删除文章不会自动删除媒体，避免破坏其他文章引用。
- 图片与新上传的视频：托管在 Imgur，文章数据库保存 URL。请同时保留重要媒体的原文件；Client ID 匿名上传不归入账户，配置 OAuth Access Token 后归入授权账户。
- 凭据：保管 `.env`。更换 `SESSION_SECRET` 会使已有登录失效。

部署后检查 `/api/health`，再验证 `/editor` 登录、保存草稿、发布及视频播放。当前仓库仅完成本地构建与联调，未对外部署或操作外部数据库。
