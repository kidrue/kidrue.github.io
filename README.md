# kidrue 的个人博客

React + Vite 纯静态博客，使用仓库 Markdown 维护内容，无需数据库、管理员登录或自有 API。保留暗色星空主题、文章、日记、兴趣收藏、项目、句子收藏及每日一言。

## 开发与发布

需要 Node.js 22.14 或更新的 Node.js 22 和 npm。

```sh
npm ci
npm run dev
```

本地地址 http://127.0.0.1:5174 。`dev:web` 同样仅启动前端，追加 `-- --port 5180` 可调整端口。根目录 .env 可设置 WEB_PORT 和 PREVIEW_PORT。

`npm run build`（兼容 build:web、build:pages）生成 apps/web/dist/，包含各栏目入口及 404.html；`npm run preview` 在 4173 预览。推送 main 自动发布 GitHub Pages，见 [部署说明](docs/github-pages.md)。

## 添加文章与日记

文章放在 `apps/web/src/content/posts/`，格式见 [文章模板](docs/post-template.md)。ID 必须唯一，createdAt 使用带时区的时间，category 为技术或生活；date 为 YYYY-MM-DD，tags 为列表。列表自动读取 Markdown 并按创建时间排序。

日记放在 `日记/`，见 [日记说明](日记/README.md) 和 [模板](日记/_模板.md)。开发时新增、修改、删除文件会自动刷新；线上内容需要提交推送后重新构建。

媒体放在 apps/web/public/images/ 或其他 public 子目录，正文使用网站根路径或 HTTPS 直链，例如：

```markdown
![图片说明](/images/diary/letter-from-youth.jpg)
![视频说明](/videos/example.mp4 "video")
```

Markdown 保留代码块、表格、图片和视频展示，并过滤原始 HTML 与危险链接协议。每日一言继续使用第三方公开接口，保留缓存和失败回退。

## 验证

`npm run typecheck` 检查前端类型；`npm test` 运行工具测试与桌面、手机访客测试；`npm run test:diary` 验证日记文件热更新。浏览器测试使用本机 Chrome。

`npm run check:a11y`、`npm run capture` 需要运行中的前端；`npm run import:bilibili` 更新追番快照。

## 博客园文章归档

来自 <https://www.cnblogs.com/Kidrue> 的 16 篇随笔和 1 篇文章已保存为独立 `.md` 文件，正文图片存放于 `apps/web/public/images/posts/cnblogs/`。这些文章直接随静态站点构建。

每篇文件包含 YAML front matter，保留标题、作者、原始发布日期、带 `+08:00` 时区的创建/更新时间、原文链接、原站分类和标签。页面阅读弹窗显示发布时间、更新时间与原文入口。日期取自原站正文的发布时间，不使用导入日期；原站未提供的更新时间不补写。

导入明细和图片来源见 [导入清单](docs/cnblogs-import.json)，转换说明见 [归档说明](docs/cnblogs-import.md)。以后可直接编辑这些 `.md` 文件。运行 `node scripts/import-cnblogs.mjs` 可重新抓取公开内容，但会覆盖同名归档文件，重新抓取前请保存本地修改。

## CSDN 文章归档

来自 <https://blog.csdn.net/weixin_43295106> 的公开目录共 45 篇，现已全部收录为 Markdown，保留原始发布时间、更新时间、专栏、标签、原创/转载类型和来源链接，22 张正文图片保存到 `apps/web/public/images/posts/csdn/`。与 17 篇博客园文章合并后共 62 篇，同名文章保留各自版本。

《wsl2配置转发规则，便于局域网内访问》已用作者提供的完整正文补齐，并标记为 `contentOrigin: author-provided`，重新导入时保留该版本。完整清单与处理方式见 [CSDN 归档说明](docs/csdn-import.md)和[导入清单](docs/csdn-import.json)。

## 修改内容和样式

- “一句话”入口位于导航栏，指向独立页面 `/quotes`；在 `apps/web/src/data/favorite-quotes.ts` 追加带唯一 `id` 和 `text` 的对象即可继续收藏，原文按数组顺序展示。
- 首页显示博客运行时间，以 `apps/web/src/data/site.ts` 中固定的 `siteStartedAt` 为基准（2026-10-28 15:13:37，北京时间首次 GitHub Pages 部署完成），每秒更新。重新构建、刷新和换设备不会重置；显示值取决于访客设备时间。
- 兴趣页已合并 Bilibili 公开追番列表，共 339 条记录。运行 `npm run import:bilibili` 更新本地快照和封面，再提交至 `main` 自动发布；来源、去重和维护说明见 [Bilibili 导入说明](docs/bilibili-import.md)。

- `apps/web/src/content/posts/`：博客文章的 Markdown 正文和元数据，由 `apps/web/src/data/posts.ts` 自动读取。
- `apps/web/src/data/`：内置文章、番剧、手办和项目数据。`watched-anime.ts` 收录博主提供的 151 条真实观看记录，重复项合并，原始名称和数字备注保留；整理说明见 [观看清单](docs/watched-anime.md)。番剧分类为全部、看过、在看、想看、搁置、抛弃；海报卡片显示 `image`、`year`、`rating`，点击可展开观看笔记。151 条记录均使用本地真实海报；未补充的年份和评分显示待补状态。桌面四列、平板三列、手机两列。海报与评分来源见 `apps/web/public/images/anime/README.md`。其他标为 `example: true` 的条目仍是示例。
- `apps/web/src/styles/`：ThemeProvider 主题、基础全局样式、组件作用域样式和 keyframes。原有 CSS 已迁移为 CSS-in-JS。
- `apps/web/src/components/LandingHero.tsx`：入口信息。
- `apps/web/src/components/EnterBlogLink.tsx`：纸飞机按钮，参考 [Aaron Iker 的交互](https://codepen.io/aaroniker/pen/BajabVN)。
- `apps/web/src/components/MeteorShower.tsx`：错峰循环的流星，尊重减少动态效果设置。
- `apps/web/public/images/`：封面和背景，来源见目录内 README。背景为《你的名字。》官网天空图，固定光轨已移除，流星由独立动画绘制。
- `apps/web/public/icons/`：Bilibili、GitHub、V2EX 官方图标及来源。
- `apps/web/public/fonts/`：寒蝉全圆体与 SIL OFL 1.1 许可证。

每日名言来自[一言接口](https://developer.hitokoto.cn/sentence/)，按浏览器本地日期缓存，跨日更新，失败时显示标注的寄语与重试入口。

顶部导航使用 React Router 站内切换，支持页面预加载及同次访问内恢复搜索、筛选、视图和滚动位置；刷新后重置。加载策略与验证说明见 [导航性能优化](docs/navigation-performance.md)。
