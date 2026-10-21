# 文章编辑与前后端 monorepo 实现计划

**目标：** 在保留现有页面的基础上完成 Node 后端、PostgreSQL 数据层、文章编辑及媒体上传，并采用 styled-components。

**依据：** `docs/superpowers/specs/2026-10-20-article-editor-design.md`。

用户已授权前后端 monorepo 和 Node 服务，暂不迁移 Astro。目录不是 Git 仓库，直接在当前目录实现，不初始化或提交。并行任务按文件隔离，统一由主任务负责根配置、依赖与联调。

- [x] 建立 npm workspaces：迁移现有应用到 apps/web，创建 apps/api、packages/shared，共享校验及接口类型，保留原资源。
- [x] 后端：Fastify、Prisma/PostgreSQL 数据层、管理员会话、文章 CRUD、修订检查、Imgur 媒体代理及既有视频读取；先写并验证失败测试，再实现和验证。
- [x] 前端：styled 编辑工作台与安全 Markdown 预览，调用共享契约，登录、草稿恢复、保存发布和媒体上传；编写关键交互测试。
- [x] 样式：主题、全局字体/reset、现有页面和动画迁移为 styled 模块；保留语义类名供验证脚本使用。
- [x] 集成：公开列表读取 API、读取已发布 Markdown、博客管理入口；根命令可分别或同时运行前后端，提供开发数据库及部署文档。
- [x] 验证：真实 SQL/Prisma 数据层、后端测试、完整浏览器测试、生产构建、三档截图和无障碍检查；记录凭据配置及运行限制。

## 验证记录

- `npm test`：10 项后端 SQL 集成测试通过；56 项 Playwright 测试通过，2 项只适用移动端的测试在桌面跳过。
- `npm run build`：shared、api、web 均通过 TypeScript 检查并完成生产构建；编辑器与 Markdown 按需加载。
- `npm run capture`：390 / 768 / 1440px 入口一屏展示，博客无横向溢出；字体、头像、减少动态效果与运行时错误检查通过。
- `npm run check:a11y`：桌面、移动端的入口、博客、阅读、手办、项目和空状态共 12 个场景均无 WCAG A/AA 违规。
- 真实浏览器联调：登录、上传可解码的 MP4、Range 播放、保存草稿、发布、公开列表及视频正文阅读通过；临时文章与 MP4 已清理。
- 编辑器 1440 / 768 / 390px 截图已生成；1440 / 390px 无障碍检查无违规。
- `npm install --package-lock-only --ignore-scripts`：锁文件同步，审计无已知漏洞。
- 生产入口在缺少必需配置时拒绝启动；当前开发 API 健康检查返回 PostgreSQL 正常。

实际后端采用 Fastify 5 及对应插件，避免旧版本依赖的已知漏洞。Windows 构建不再重复覆盖运行中的 Prisma 引擎；PGlite 关闭前等待 socket 的延迟回调，消除测试退出时的未处理异常。

用户已更正服务为 Imgur（imgur.com）。真实上传尚待自行配置 `IMGUR_CLIENT_ID` 或 OAuth Access Token；已用模拟响应验证图片与视频上传、未配置提示、上游失败、Client-ID / Bearer 认证与可播放链接校验，未向第三方发送测试文件。外部 PostgreSQL 与公开部署尚未执行，步骤见 `docs/deployment.md`。
