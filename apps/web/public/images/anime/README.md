# 番剧示例封面与评分

封面、首播年份、评分来自 AniList 公开 API，获取日期：2026-10-21。图片保存为本地资源；评分为当时的 `averageScore / 10` 静态快照，页面未实时更新，也不代表博主个人打分。观看状态和笔记均为布局示例。

| 文件             | 作品来源                                         |
| ---------------- | ------------------------------------------------ |
| `frieren.jpg`    | [葬送的芙莉莲](https://anilist.co/anime/154587)  |
| `bocchi.png`     | [孤独摇滚！](https://anilist.co/anime/130003)    |
| `natsume.jpg`    | [夏目友人帐](https://anilist.co/anime/4081)      |
| `violet.png`     | [紫罗兰永恒花园](https://anilist.co/anime/21827) |
| `your-name.png`  | [你的名字。](https://anilist.co/anime/21519)     |
| `lycoris.jpg`    | [莉可丽丝](https://anilist.co/anime/143270)      |
| `odd-taxi.jpg`   | [奇巧计程车](https://anilist.co/anime/128547)    |
| `weathering.png` | [天气之子](https://anilist.co/anime/106286)      |

海报版权属于对应作品的权利人，不作为本站原创素材或代码许可证的一部分。替换个人观看清单时，可将自己的封面放到此目录并更新 `apps/web/src/data/collections.ts` 的 `image`、`year`、`rating`，替换真实状态与笔记后将 `example` 设为 `false`。不提供评分时显示「暂无评分」。
