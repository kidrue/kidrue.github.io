# 番剧首播年月

兴趣页按首播日期从新到旧展示，以 `YYYY-MM` 分组；同月内按日期倒序，同日保留原清单顺序。筛选状态后重新计算分组和数量，手办保持原顺序。

`apps/web/src/data/watched-anime.ts` 的 `airDate` 保存日期，主要来自已有的 `docs/anime-cover-sources.json` 中对应作品的 `date`。影视作品按首播或日本首次公映日期处理，不使用观看日期。

补充来源：

- 夏目友人帐：2008-07-07，[东京电视台首集信息](https://www.tv-tokyo.co.jp/contents/natsume/episodes/episodes01/index.html)。
- 你的名字。：2016-08-26，[东宝官方预告](https://www.youtube.com/watch?v=hmjRKCFb1Do)。

刀剑神域第 1、2 季合并记录按第 1 季的 2012-07 归类。Fate 系列、Fate/Grand Order、心跳回忆尚未明确具体观看作品，不能仅凭借用海报确定播出日期，因此保留在末尾的“播出时间待确认”分组。

验证：新增年月分组与倒序、日期显示、筛选恢复测试，更新依赖旧清单顺序的用例，并运行收藏相关测试及前端构建。
