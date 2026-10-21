# kidrue 的个人博客

暗色星空主题的个人博客，延续 Miyako PaperGrid 排版，使用本地寒蝉全圆体。独立的一屏入口保留头像、每日一言、社交链接、纸飞机按钮与二十道循环流星；博客包含文章、番剧、手办和开发项目。

现在采用 npm workspaces 管理 React 前端、Node 后端和共享契约，支持登录写作、Markdown 预览、草稿保存、发布与媒体上传。

## 本地启动

需要 Node.js 22.14 或更新的 Node.js 22 版本，以及 npm。

```sh
npm install
npm run dev
```

- 入口：<http://127.0.0.1:5174/>
- 博客：<http://127.0.0.1:5174/blog>
- 写作工作台：<http://127.0.0.1:5174/editor>
- API 健康检查：<http://127.0.0.1:3001/api/health>

未配置环境变量时，开发管理员密码为 `kidrue-local`。后端仅绑定本机回环地址。前端由 Vite 提供热更新；后端由 Vite 监听构建，成功后自动关闭旧进程并重启 Node。后端构建报错时保留上一次运行中的服务，修复后继续更新。修改根 `.env` 后需重启开发命令。

使用 `Ctrl+C` 停止联合开发服务，启动器会通知后端关闭数据库并退出。启动前会检查 API、开发数据库及前端端口；如果已有实例运行，请使用现有地址，或先在原终端停止它，再重新启动。

没有 `DATABASE_URL` 时，开发模式自动运行 PGlite，通过 PostgreSQL 协议连接 Prisma，数据持久保存在 `.data/postgres/`。请只启动一个使用该目录的后端实例。生产启动要求标准 PostgreSQL 和自设密码，不会使用开发默认值。

## 目录与独立命令

```text
apps/web/              React 19、Vite、TypeScript、styled-components
apps/api/              Node、Vite 服务端构建、Fastify 5、Prisma、PostgreSQL
packages/shared/       Zod 输入约束、文章及媒体接口类型
tests/                 Playwright 桌面与移动端测试
scripts/               联合启动、截图、无障碍检查
docs/deployment.md     生产部署说明
```

| 命令                                    | 用途                                   |
| --------------------------------------- | -------------------------------------- |
| `npm run dev`                           | 联合开发，监听共享包、前端和后端       |
| `npm run dev:web`                       | 单独启动前端与共享包监听，默认 5174    |
| `npm run dev:api`                       | 单独启动后端与共享包监听，自动重启     |
| `npm run build`                         | 依次构建共享包、后端和前端，并检查类型 |
| `npm run build:web` / `build:api`       | 分别构建前端或后端，先准备共享包       |
| `npm run typecheck`                     | 检查全部工作区类型                     |
| `npm test`                              | 后端 SQL 集成测试及完整浏览器测试      |
| `npm run test:tooling`                  | Vite 产物和后端监听重启的集成测试      |
| `npm run test:api` / `npm run test:web` | 分别运行后端、前端测试                 |
| `npm run db:generate`                   | 修改 Prisma schema 后生成客户端        |
| `npm run db:migrate`                    | 对配置的 PostgreSQL 应用已提交的迁移   |
| `npm run start`                         | 启动构建后的生产 API                   |
| `npm run preview`                       | 在 4173 预览前端产物，需单独运行 API   |

根目录的 `build:web`、`build:api` 会先构建共享包。直接使用工作区命令 `npm run build -w @kidrue/api`、`npm run build -w @kidrue/web` 时，需已构建共享包。安装依赖时会自动构建共享包和生成 Prisma 客户端。Windows 下安装依赖或重新生成客户端前请停止后端，避免正在加载的引擎文件被锁定。

前端构建输出为 `apps/web/dist/`，后端生产输出为 `apps/api/dist/`，开发输出为 `apps/api/.dev/`，互不覆盖。后端使用 Vite 的 Node 服务端构建，Prisma、Fastify 等依赖仍由 Node 加载；共享包使用 TypeScript 生成代码与类型声明。

前端开发和预览统一读取根环境配置，将 `/api`、`/uploads` 代理至 `http://127.0.0.1:PORT`（默认 `3001`）。可在根 `.env` 设置 `WEB_PORT`、`PREVIEW_PORT` 和 `API_PROXY_URL`，环境变量优先于文件值。临时修改前端端口也可使用 `npm run dev:web -- --port 5180`。端口占用时退出，不自动跳到其他端口。Playwright 独立使用 `5173`。

只有 `VITE_` 前缀的环境变量可以进入客户端代码。数据库地址、会话密钥、管理员密码和 Imgur 凭据必须保留为后端变量，不要使用 `VITE_` 前缀。

## 写作与上传

工作台支持文章列表与搜索、标题、摘要、分类、标签、封面、Markdown 工具栏、实时预览、草稿、发布、撤回和删除。手机上可切换编辑与预览。

未保存的文字保存在当前浏览器，刷新并登录后恢复；状态会区分「本机备份」与「已保存到服务器」。切换文章和关闭页面时提示未保存内容。服务器通过 `revision` 检查多窗口修改，冲突时返回 409 并保留当前文字。

图片和视频的自动上传接口接入 [Imgur](https://imgur.com/)，需要有效的 **Client ID** 或 OAuth Access Token。2026-10-21 核实时，官方文档列出的[应用注册页](https://api.imgur.com/oauth2/addclient)在未登录请求中跳转回首页，未能确认新应用注册流程可用。已有应用可登录[应用设置](https://imgur.com/account/settings/apps)检查凭据；没有凭据时，请先使用下方的手动上传方式。

取得有效凭据后，复制根目录 `.env.example` 为 `.env`，填写并重启服务：

```dotenv
IMGUR_CLIENT_ID=你的ClientID
# 可选：OAuth Access Token，使上传内容归入对应 Imgur 账户。
IMGUR_ACCESS_TOKEN=
```

Node 向官方 `https://api.imgur.com/3/upload` 转发文件，凭据不会打包到前端。默认使用 `Authorization: Client-ID ...` 匿名上传，不归入 Imgur 账户；配置 OAuth Access Token 后使用 `Bearer ...`，内容归入授权账户。Access Token 需要保持有效；当前通过后端环境变量配置，不提供自动续期。上传无需填写 Client Secret。接口与授权说明见 [Imgur API](https://apidocs.imgur.com/)。

没有 API 凭据时，可先在 Imgur 网站点击「New post」手动上传，再复制媒体直链到正文；桌面浏览器可右键图片选择「复制图片地址」，操作见 [Imgur 官方说明](https://help.imgur.com/hc/en-us/articles/28865654408347-How-to-locate-an-image-URL)。将以下示例中的 ID 替换为实际值，视频需使用可播放的 MP4 / WebM 直链：

```markdown
![图片说明](https://i.imgur.com/IMAGE_ID.jpg)
![视频说明](https://i.imgur.com/VIDEO_ID.mp4 "video")
```

请使用媒体直链，帖子或相册页面 URL 无法直接作为图片、视频源。手动插入链接和保存文章不需要配置 Imgur API 凭据，上传按钮仍需有效凭据才可使用。

图片支持 JPEG、PNG、GIF，本站默认上限 10MiB；视频支持 MP4、WebM，本站默认上限 100MiB。图片通过 `image` 字段、视频通过 `video` 字段上传至 Imgur；成功后校验并使用 `i.imgur.com` 的 HTTPS 直链，视频优先采用返回的 MP4 地址。Imgur 会执行自己的格式、大小、时长和额度校验，也可能转码；失败时明确显示错误，不会改用其他存储。

上传可选择文件、拖放，图片还可粘贴；提供进度与取消。成功后自动插入 Markdown，仍需保存文章。视频语法为 `![视频说明](URL "video")`。已有 `.data/videos/` 内的视频仍通过 `/uploads/videos/` 读取，支持 Range。删除文章不会删除远端媒体，匿名上传目前未提供远端删除管理。

正文格式工具栏下方提供带文字的「上传图片」「上传视频」按钮，并显示允许的格式、大小限制与保存位置。封面可通过「上传封面」单独上传。上传失败或取消时保留已写内容，同一个文件可重新选择重试。

公开列表读取已发布文章，保留并明确标注六篇内置示例。草稿只有登录后可见。Markdown 不执行原始 HTML，并过滤危险链接协议。

## 数据库与部署

推送 `main` 自动 Docker 部署到阿里云、绑定 `kidrue.top`：先填写根目录 `env.local`，运行 `npm run deploy:check`、`npm run deploy:preflight`，再用 `npm run deploy:sync` 同步 GitHub 配置。完整初始化、域名证书、备份与恢复步骤见 [Docker 自动部署](docs/docker-deployment.md)。

数据库方案参考 `C:/project/byecode-server` 的 PostgreSQL / Prisma，未修改该项目。博客使用 `kidrue_articles`、`kidrue_sessions` 表；推荐独立数据库。

生产环境至少配置 `DATABASE_URL`、`ADMIN_PASSWORD`、`SESSION_SECRET`、`PUBLIC_ORIGIN`，先迁移再启动。完整 PostgreSQL、HTTPS 反向代理、文件持久化与备份步骤见 [部署说明](docs/deployment.md)。

## 验证

```sh
npm test
npm run build
npm run check:a11y
npm run capture
```

后两个命令需要运行中的网站，默认访问 `http://127.0.0.1:5174`，可追加实际地址。截图保存在 `artifacts/`，覆盖 390 / 768 / 1440px。浏览器测试使用本机 Google Chrome；未安装时可运行 `npx playwright install chrome`。自动化测试使用临时数据库和模拟 Imgur，不会向第三方上传测试文件。

## 修改内容和样式

- `apps/web/src/data/`：内置文章、番剧、手办和项目数据。替换实际记录后，将 `example` 改为 `false`。番剧分类为全部、看过、在看、想看、搁置、抛弃；海报卡片显示 `image`、`year`、`rating`，点击可展开观看笔记。桌面四列、平板三列、手机两列。海报与评分来源见 `apps/web/public/images/anime/README.md`。
- `apps/web/src/editor/`：写作工作台及其 styled 组件。
- `apps/web/src/styles/`：ThemeProvider 主题、基础全局样式、组件作用域样式和 keyframes。原有 CSS 已迁移为 CSS-in-JS。
- `apps/web/src/components/LandingHero.tsx`：入口信息。
- `apps/web/src/components/EnterBlogLink.tsx`：纸飞机按钮，参考 [Aaron Iker 的交互](https://codepen.io/aaroniker/pen/BajabVN)。
- `apps/web/src/components/MeteorShower.tsx`：错峰循环的流星，尊重减少动态效果设置。
- `apps/web/public/images/`：封面和背景，来源见目录内 README。背景为《你的名字。》官网天空图，固定光轨已移除，流星由独立动画绘制。
- `apps/web/public/icons/`：Bilibili、GitHub、V2EX 官方图标及来源。
- `apps/web/public/fonts/`：寒蝉全圆体与 SIL OFL 1.1 许可证。

每日名言来自[一言接口](https://developer.hitokoto.cn/sentence/)，按浏览器本地日期缓存，跨日更新，失败时显示标注的寄语与重试入口。
