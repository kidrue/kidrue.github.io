# CSDN 文章归档

来源：[kidrue 的 CSDN 博客](https://blog.csdn.net/weixin_43295106)。公开文章列表共 45 篇，时间范围为 2018-10-25 至 2023-03-20。

已完整收录 45 篇文章和 22 张去重后的正文图片，待补全清单为空。《wsl2配置转发规则，便于局域网内访问》（129662309）的公开响应受 VIP 限制，现已使用作者在会话中提供的完整正文补齐，包括补充命令、截图和参考资料。保留原站发布时间与更新时间，不以补录时间替代。

## 文件位置

- Markdown：`apps/web/src/content/posts/YYYY-MM-DD-csdn-文章ID.md`。
- 正文图片：`apps/web/public/images/posts/csdn/`。
- 完整清单、图片来源及待补全原因：[csdn-import.json](csdn-import.json)。
- 导入脚本：`scripts/import-csdn.mjs`。

文章使用 `csdn-文章ID` 作为独立标识，保留原来的博客园文章。两个平台上的同名文章分别保存，避免因标题相同丢失不同版本的正文或日期。

## 保留的信息

每篇 Markdown 包含 YAML front matter，记录标题、作者或转载者、原始发布日期 `date`、带时区的发布时间 `createdAt`、最后更新时间 `updatedAt`、原文链接、来源平台、原创/转载类型、原站专栏和标签。

发布时间优先取页面的 `article:published_time`，更新时间取 `article:modified_time`。不把页面中的「最新推荐文章于……发布」当作原文章日期。原站类型保存在 `sourceType`，前端卡片和阅读弹窗明确区分原创与转载；转载文章原有的出处链接保留在正文中。

正文来自公开页面的 `#content_views`，转换为 Markdown，保留代码块、列表、表格、链接和图片。排除平台导航、推荐、评论和广告，不改写原文技术观点。图片下载到本地并替换正文地址，来源映射留在清单中。原站的代码示例和表述按原文保留。

## 再次运行

```sh
node scripts/import-csdn.mjs
```

脚本默认复用 `artifacts/csdn-source/` 中的页面缓存，缺少时低频下载公开页面；使用 `--refresh` 可重新获取。标有 `contentOrigin: author-provided` 的文章会保留作者提供的正文及图片映射，包括使用 `--refresh` 时。其他同名 Markdown 会被重新导入覆盖，请先保存本地修改。文章或图片下载失败、VIP 内容受限且没有作者完整正文时，会记录为待补全，进程以非零状态退出。

本地文章由前端自动读取，不写入服务端数据库，也不会出现在后台编辑器的文章列表中。发布后的网页仍可以合并展示后台新发布的文章。
