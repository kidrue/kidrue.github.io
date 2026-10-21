# 文章编辑、Node 后端与 CSS-in-JS

用户要求：保留 React + Vite（暂不迁移 Astro），设计可编辑文章的界面，支持图片及视频上传；媒体使用 Imgur（用户已更正服务为 imgur.com）；引入 styled 编写 CSS-in-JS；使用 monorepo 分别管理前后端。数据库参考 `C:/project/byecode-server` 的 PostgreSQL + Prisma 方案。

## 结构与职责

- `apps/web`：现有 React 19 / Vite / TypeScript 网站、资源和编辑页。
- `apps/api`：Node / Fastify / Prisma 后端，文章、身份验证、上传与媒体读取。
- `packages/shared`：Zod 输入约束、文章及上传结果类型。
- 根目录保留文档、Playwright、检查脚本及 workspace 启动、构建命令。
- 仅参考 byecode-server 的技术，不修改其代码、表、凭据或已有数据。博客使用独立数据库与 `kidrue_*` 表。

## 编辑体验

`/editor` 为管理入口，支持登录后新建与选择文章、Markdown 工具栏、实时预览、标题、摘要、技术/生活分类、标签、封面、保存草稿、发布和撤回为草稿。窄屏切换编辑和预览，保留寒蝉全圆体、暗色主题及 Miyako 排版。未保存内容在本机恢复；后端保存和本机恢复提示严格区分，切换未保存文章时提醒。

公开博客从 API 读取已发布文章，与现有六篇示例区分；草稿不对匿名访客公开。阅读组件支持安全 Markdown 图片、代码、列表和视频，不执行用户 HTML。已发布文章可重新编辑。

## 接口契约

全部同源 `/api`，错误 JSON `{ message: string }`。会话使用 HttpOnly / SameSite cookie，写操作验证 Origin，生产要求设置管理员密码，开发默认密码仅用于回环地址。

- `GET /api/health`：服务与数据库状态。
- `GET /api/articles`：`{ articles: Article[] }`，仅已发布。
- `GET /api/admin/session`：`{ authenticated, development, uploads: { configured, maxImageBytes, maxVideoBytes } }`。
- `POST /api/admin/login`：`{ password }`，成功 `{ authenticated: true }`。
- `POST /api/admin/logout`：204。
- `GET /api/admin/articles`：`{ articles: Article[] }`，包括草稿。
- `POST /api/admin/articles`：`ArticleInput`，201 `{ article }`。
- `PUT /api/admin/articles/:id`：`ArticleInput & { revision }`，`{ article }`。revision 冲突返回 409，防止多窗口覆盖。
- `DELETE /api/admin/articles/:id`：204，界面确认。
- `POST /api/admin/uploads`：multipart `file`，`{ url, type: 'image' | 'video', name }`。
- `GET /uploads/videos/:name`：只读视频，支持 Range，Content-Type 正确。

Article: `{ id, title, description, category, tags, body, coverUrl, status, date, readTime, revision, createdAt, updatedAt }`。ArticleInput 包含 title / description / category / tags / body / coverUrl / status；category 为技术或生活，status 为 draft 或 published。

## 上传

固定向官方 `https://api.imgur.com/3/upload` 转发 multipart；图片使用 `image` 字段，视频使用 `video` 字段，`type=file`。配置 `IMGUR_CLIENT_ID` 后以 Client-ID 认证匿名上传；可选 `IMGUR_ACCESS_TOKEN` 使用 Bearer 认证，归入授权账户。无需 Client Secret，当前不实现 OAuth 自动续期。凭据只在后端环境变量中保存。

支持 JPEG / PNG / GIF、MP4 / WebM，校验扩展名、MIME、文件头；默认图片 10MiB、视频 100MiB，可配置且前后端同步。校验 HTTP 状态及业务成功标记，只接受 `i.imgur.com` 的 HTTPS 直链，视频优先使用 MP4 地址；处理票据或网页链接不能作为成功结果。认证失败、额度耗尽、上游失败或未配置均明确报错。新上传均托管在 Imgur，已有本地视频仍支持读取及 Range。上传显示进度，可取消、失败重试，成功后插入正文。Markdown 图片标准语法，视频使用 `![视频说明](URL "video")` 并由受控 React 组件渲染。

## 数据库与开发运行

采用与参考项目一致的 PostgreSQL / Prisma。当前本机没有正在运行的 PostgreSQL，也未发现 Docker / psql；提供独立 Docker Compose 与可选开发 PostgreSQL 兼容实例（PGlite），用于本地运行及真实 SQL 集成验证。生产使用标准 PostgreSQL，禁止静默回退到临时内存存储。

## CSS-in-JS

使用 styled-components 6.6，ThemeProvider 管理暗色主题，createGlobalStyle 只承载字体、reset 与基础 token。编辑器所有布局和控件使用 styled；现有页面迁移为按页面/组件作用域组织的 styled 模块，保留现有交互及截图结果。流星和纸飞机动画采用 keyframes，动态样式不泄漏为 DOM 属性。

## 验收

后端验证未登录拒绝写入、草稿隔离、持久化、修订冲突、Imgur 凭据及上游失败、图片与视频表单、视频直链及既有本地视频 Range；不向第三方上传测试文件。前端验证保存、发布、恢复、媒体插入、失败提示及安全预览。运行完整浏览器回归、前后端构建与类型检查，在 390 / 768 / 1440px 查看入口、博客及编辑器并检查可访问性。真实 Imgur 上传待用户配置凭据，未执行部署或外部数据库变更。
