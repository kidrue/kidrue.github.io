# GitHub Pages 自动发布

仓库：`kidrue/kidrue.github.io`。默认地址：`https://kidrue.github.io/`。自定义域名：`kidrue.top`。

每次推送到 main，`.github/workflows/deploy-pages.yml` 自动安装依赖、验证静态路由、运行 `npm run build:pages`，把 `apps/web/dist/` 发布到 GitHub Pages。也可在 Actions 中手动运行。无需 VPS 或额外部署密钥；仓库 Settings → Pages 的 Source 必须为 GitHub Actions。

静态构建保留本地文章、日记、兴趣、项目和关于页面。静态站点不提供数据库与在线写作接口，因此不请求 `/api/articles`，不显示在线写作入口。普通开发和完整服务端构建保持原行为。

构建为 `/blog/`、`/diary/`、`/interests/` 生成独立 index.html，支持直接访问与刷新。站点位于用户主页仓库和自定义域名根路径，Vite base 为 `/`。仅上传前端构建目录，不上传 env.local 或数据库。

## 域名手动配置

GitHub Pages 的自定义域名必须在仓库 Settings → Pages 中设置为 `kidrue.top`。Actions 发布不会自动读取 CNAME 文件来绑定域名。

根域名 `kidrue.top`：

- 如果 DNS 服务支持 ALIAS / ANAME 或根域 CNAME flattening：主机记录 `@` 指向 `kidrue.github.io`。
- 如果不支持：添加四条 A 记录，主机记录均为 `@`，记录值分别为 `185.199.108.153`、`185.199.109.153`、`185.199.110.153`、`185.199.111.153`。
- 可选 www：CNAME 主机记录 `www`，记录值 `kidrue.github.io`。不要填写 https:// 或路径。

普通 CNAME 不适用于 DNS 根域。配置前检查同名记录，避免旧服务器 A/AAAA 与新记录冲突。DNS 由域名持有人手动修改，工作流不会调用 DNS 服务商接口。

自定义域名启用后，GitHub 默认地址通常会跳转到自定义域名。在 DNS 尚未指向 Pages 时，这个跳转目标可能暂时不可访问。DNS 生效并签发证书后，在 Pages 设置中启用 Enforce HTTPS。

参考：[GitHub 自定义域名文档](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)、[Vite 静态部署文档](https://vite.dev/guide/static-deploy)。
