# 番剧封面与评分

新增 196 张 Bilibili 追番封面，使用 480px 宽 WebP，共约 9.6 MB。原始地址在 `apps/web/src/data/bilibili-bangumi.json`；更新命令和作品合并规则见 [Bilibili 导入说明](../../../../../docs/bilibili-import.md)。以下内容保留原 151 条观看清单的海报来源。

151 条真实观看记录均已配备本地海报。2026-10-27 从 Bangumi 公开 API 核对并下载 149 张，另两张沿用 2026-10-21 从 AniList 获取的「夏目友人帐」「你的名字。」海报。浏览页面时直接加载本站图片，不依赖第三方图片链接。

「夏目友人帐」「你的名字。」的年份与评分仍为原有 AniList 静态快照，评分是当时的 averageScore / 10，不代表个人评分。此次仅补图，其余作品未添加评分。系列、合并季数和简称使用下表对应作品的代表海报，不据此推断完整观看范围。

每张图片的原始下载地址、作品条目、下载日期、文件大小和 SHA-256 记录于 [来源清单](../../../../../docs/anime-cover-sources.json)。名称整理及原始笔记见 [观看清单](../../../../../docs/watched-anime.md)。

## 当前使用的海报

| 观看记录                          | 本地文件             | 来源作品                                                             |
| --------------------------------- | -------------------- | -------------------------------------------------------------------- |
| 刀剑神域（第 1、2 季）            | `bangumi-23686.jpg`  | [刀剑神域](https://bgm.tv/subject/23686)                             |
| 灼眼的夏娜                        | `bangumi-490.jpg`    | [灼眼的夏娜](https://bgm.tv/subject/490)                             |
| 零之使魔                          | `bangumi-1880.jpg`   | [零之使魔](https://bgm.tv/subject/1880)                              |
| 未来日记                          | `bangumi-16235.jpg`  | [未来日记](https://bgm.tv/subject/16235)                             |
| 绝园的暴风雨                      | `bangumi-39794.jpg`  | [绝园的暴风雨](https://bgm.tv/subject/39794)                         |
| CLANNAD                           | `bangumi-51.jpg`     | [CLANNAD](https://bgm.tv/subject/51)                                 |
| 少年同盟                          | `bangumi-14220.jpg`  | [少年同盟](https://bgm.tv/subject/14220)                             |
| 犬神                              | `bangumi-3422.jpg`   | [犬神](https://bgm.tv/subject/3422)                                  |
| 命运石之门                        | `bangumi-10380.jpg`  | [命运石之门](https://bgm.tv/subject/10380)                           |
| 尽管如此世界依然美丽              | `bangumi-93424.jpg`  | [尽管如此世界依然美丽](https://bgm.tv/subject/93424)                 |
| 进击的巨人                        | `bangumi-55770.jpg`  | [进击的巨人](https://bgm.tv/subject/55770)                           |
| 妖精的尾巴                        | `bangumi-2609.jpg`   | [妖精的尾巴](https://bgm.tv/subject/2609)                            |
| 游戏人生                          | `bangumi-79227.jpg`  | [游戏人生](https://bgm.tv/subject/79227)                             |
| 星刻的龙骑士                      | `bangumi-79225.jpg`  | [星刻的龙骑士](https://bgm.tv/subject/79225)                         |
| 极黑的布伦希尔特                  | `bangumi-89485.jpg`  | [极黑的布伦希尔德](https://bgm.tv/subject/89485)                     |
| 漆黑的子弹                        | `bangumi-84873.jpg`  | [漆黑的子弹](https://bgm.tv/subject/84873)                           |
| 未闻花名                          | `bangumi-10440.jpg`  | [我们仍未知道那天所看见的花的名字。](https://bgm.tv/subject/10440)   |
| 恶魔奶爸                          | `bangumi-9779.jpg`   | [恶魔奶爸](https://bgm.tv/subject/9779)                              |
| 农林                              | `bangumi-68756.jpg`  | [农林](https://bgm.tv/subject/68756)                                 |
| 罪恶王冠                          | `bangumi-18635.jpg`  | [罪恶王冠](https://bgm.tv/subject/18635)                             |
| 樱花庄的宠物女孩                  | `bangumi-41488.jpg`  | [樱花庄的宠物女孩](https://bgm.tv/subject/41488)                     |
| 加速世界                          | `bangumi-23685.jpg`  | [加速世界](https://bgm.tv/subject/23685)                             |
| 幻灵镇魂曲                        | `bangumi-1426.jpg`   | [幻灵镇魂曲](https://bgm.tv/subject/1426)                            |
| 尸兄                              | `bangumi-62115.jpg`  | [尸兄](https://bgm.tv/subject/62115)                                 |
| 十万个冷笑话                      | `bangumi-44120.jpg`  | [十万个冷笑话 第一季](https://bgm.tv/subject/44120)                  |
| 游戏王                            | `bangumi-12344.jpg`  | [游戏王](https://bgm.tv/subject/12344)                               |
| 通灵王                            | `bangumi-4190.jpg`   | [通灵王](https://bgm.tv/subject/4190)                                |
| 一周的朋友                        | `bangumi-88493.jpg`  | [一周的朋友。](https://bgm.tv/subject/88493)                         |
| 来自风平浪静的明天                | `bangumi-47889.jpg`  | [来自风平浪静的明天](https://bgm.tv/subject/47889)                   |
| 凉宫春日的忧郁                    | `bangumi-485.jpg`    | [凉宫春日的忧郁](https://bgm.tv/subject/485)                         |
| 食梦者                            | `bangumi-3428.jpg`   | [爆漫王。](https://bgm.tv/subject/3428)                              |
| 我们的存在                        | `bangumi-1275.jpg`   | [我们的存在](https://bgm.tv/subject/1275)                            |
| 斩赤红之瞳                        | `bangumi-94244.jpg`  | [斩·赤红之瞳！](https://bgm.tv/subject/94244)                        |
| 伪恋                              | `bangumi-74628.jpg`  | [伪恋](https://bgm.tv/subject/74628)                                 |
| 东京食尸鬼                        | `bangumi-93714.jpg`  | [东京喰种](https://bgm.tv/subject/93714)                             |
| 我的脑内恋碍选项                  | `bangumi-77570.jpg`  | [我的脑内选项正在全力妨碍学园恋爱喜剧](https://bgm.tv/subject/77570) |
| 名侦探柯南                        | `bangumi-899.jpg`    | [名侦探柯南](https://bgm.tv/subject/899)                             |
| 尸体派对                          | `bangumi-58957.jpg`  | [尸体派对 Tortured Souls](https://bgm.tv/subject/58957)              |
| 约会大作战                        | `bangumi-49131.jpg`  | [约会大作战](https://bgm.tv/subject/49131)                           |
| AIR                               | `bangumi-234.jpg`    | [AIR](https://bgm.tv/subject/234)                                    |
| 我的朋友很少                      | `bangumi-17883.jpg`  | [我的朋友很少](https://bgm.tv/subject/17883)                         |
| 凉宫春日的消失                    | `bangumi-3375.jpg`   | [凉宫春日的消失](https://bgm.tv/subject/3375)                        |
| 龙珠                              | `bangumi-9565.jpg`   | [龙珠](https://bgm.tv/subject/9565)                                  |
| 学园默示录                        | `bangumi-5647.jpg`   | [学园默示录 HIGHSCHOOL OF THE DEAD](https://bgm.tv/subject/5647)     |
| 野良神                            | `bangumi-82572.jpg`  | [野良神](https://bgm.tv/subject/82572)                               |
| 天使的心跳                        | `bangumi-1851.jpg`   | [天使的心跳！](https://bgm.tv/subject/1851)                          |
| 目隐都市的演绎者                  | `bangumi-81186.jpg`  | [目隐都市的演绎者](https://bgm.tv/subject/81186)                     |
| 青春之旅                          | `bangumi-92836.jpg`  | [青春之旅](https://bgm.tv/subject/92836)                             |
| School Days                       | `bangumi-827.jpg`    | [日在校园](https://bgm.tv/subject/827)                               |
| 无头骑士异闻录                    | `bangumi-2463.jpg`   | [无头骑士异闻录](https://bgm.tv/subject/2463)                        |
| 魔法科高校的劣等生                | `bangumi-84872.jpg`  | [魔法科高校的劣等生](https://bgm.tv/subject/84872)                   |
| LOVE STAGE!!                      | `bangumi-74755.jpg`  | [LOVE STAGE!!](https://bgm.tv/subject/74755)                         |
| 十九国                            | `bangumi-113486.jpg` | [十九国](https://bgm.tv/subject/113486)                              |
| 月刊少女野崎同学                  | `bangumi-100449.jpg` | [月刊少女野崎君](https://bgm.tv/subject/100449)                      |
| 三坪房间的侵略者                  | `bangumi-98286.jpg`  | [三坪房间的侵略者!?](https://bgm.tv/subject/98286)                   |
| 中二病也要谈恋爱                  | `bangumi-29648.jpg`  | [中二病也要谈恋爱！](https://bgm.tv/subject/29648)                   |
| 噬血狂袭                          | `bangumi-67826.jpg`  | [噬血狂袭](https://bgm.tv/subject/67826)                             |
| 寄生兽                            | `bangumi-88433.jpg`  | [寄生兽 生命的准则](https://bgm.tv/subject/88433)                    |
| 天使与龙的轮舞                    | `bangumi-109948.jpg` | [CROSS ANGE 天使与龙的轮舞](https://bgm.tv/subject/109948)           |
| 魔弹之王与战姬                    | `bangumi-79229.jpg`  | [魔弹之王与战姫](https://bgm.tv/subject/79229)                       |
| 寻找失去的未来                    | `bangumi-91985.jpg`  | [寻找失去的未来](https://bgm.tv/subject/91985)                       |
| 暗杀教室                          | `bangumi-106818.jpg` | [暗杀教室](https://bgm.tv/subject/106818)                            |
| 夏目友人帐                        | `natsume.jpg`        | [夏目友人帐](https://anilist.co/anime/4081)                          |
| 绝对双刃                          | `bangumi-108757.jpg` | [绝对双刃](https://bgm.tv/subject/108757)                            |
| 怪医黑杰克                        | `bangumi-46036.jpg`  | [怪医黑杰克](https://bgm.tv/subject/46036)                           |
| 猫眼三姐妹                        | `bangumi-9304.jpg`   | [猫眼三姐妹](https://bgm.tv/subject/9304)                            |
| 新妹魔王的契约者                  | `bangumi-100205.jpg` | [新妹魔王的契约者](https://bgm.tv/subject/100205)                    |
| 洪门剑灵传说                      | `bangumi-95825.jpg`  | [剑灵](https://bgm.tv/subject/95825)                                 |
| 择天记                            | `bangumi-140217.jpg` | [择天记](https://bgm.tv/subject/140217)                              |
| 莽荒纪                            | `bangumi-136150.jpg` | [莽荒纪](https://bgm.tv/subject/136150)                              |
| 画江湖之不良人                    | `bangumi-109677.jpg` | [画江湖之不良人](https://bgm.tv/subject/109677)                      |
| 终结的炽天使                      | `bangumi-112151.jpg` | [终结的炽天使](https://bgm.tv/subject/112151)                        |
| 妖怪名单                          | `bangumi-116045.jpg` | [妖怪名单](https://bgm.tv/subject/116045)                            |
| 噬神者                            | `bangumi-113629.jpg` | [噬神者](https://bgm.tv/subject/113629)                              |
| 小长门有希的消失                  | `bangumi-90815.jpg`  | [长门有希酱的消失](https://bgm.tv/subject/90815)                     |
| 王牌御史                          | `bangumi-107443.jpg` | [王牌御史](https://bgm.tv/subject/107443)                            |
| 城下町的蒲公英                    | `bangumi-117556.jpg` | [城下町的蒲公英](https://bgm.tv/subject/117556)                      |
| Re：从零开始的异世界生活          | `bangumi-140001.jpg` | [Re：从零开始的异世界生活](https://bgm.tv/subject/140001)            |
| 在下坂本，有何贵干？              | `bangumi-165829.jpg` | [在下坂本，有何贵干？](https://bgm.tv/subject/165829)                |
| 食戟之灵                          | `bangumi-116461.jpg` | [食戟之灵](https://bgm.tv/subject/116461)                            |
| 可塑性记忆                        | `bangumi-114685.jpg` | [可塑性记忆](https://bgm.tv/subject/114685)                          |
| 潘多拉之心                        | `bangumi-1420.jpg`   | [潘多拉之心](https://bgm.tv/subject/1420)                            |
| 甲铁城的卡巴内瑞                  | `bangumi-118781.jpg` | [甲铁城的卡巴内利](https://bgm.tv/subject/118781)                    |
| 学战都市 Asterisk                 | `bangumi-130250.jpg` | [学战都市 六芒星](https://bgm.tv/subject/130250)                     |
| 监狱学园                          | `bangumi-110048.jpg` | [监狱学园](https://bgm.tv/subject/110048)                            |
| Fate 系列                         | `bangumi-290.jpg`    | [Fate/stay night](https://bgm.tv/subject/290)                        |
| 四月是你的谎言                    | `bangumi-100444.jpg` | [四月是你的谎言](https://bgm.tv/subject/100444)                      |
| 樱子小姐的脚下埋着尸体            | `bangumi-126461.jpg` | [樱子小姐的脚下埋着尸体](https://bgm.tv/subject/126461)              |
| 我的青春恋爱物语果然有问题        | `bangumi-54433.jpg`  | [我的青春恋爱物语果然有问题](https://bgm.tv/subject/54433)           |
| 苍之彼方的四重奏                  | `bangumi-117601.jpg` | [苍之彼方的四重奏](https://bgm.tv/subject/117601)                    |
| 绯弹的亚里亚                      | `bangumi-10226.jpg`  | [绯弹的亚里亚](https://bgm.tv/subject/10226)                         |
| 境界的彼方                        | `bangumi-49278.jpg`  | [境界的彼方](https://bgm.tv/subject/49278)                           |
| 赤发白雪姬                        | `bangumi-126034.jpg` | [赤发白雪姬](https://bgm.tv/subject/126034)                          |
| 黑之宣告                          | `bangumi-134390.jpg` | [黑之宣告](https://bgm.tv/subject/134390)                            |
| 妄想学生会                        | `bangumi-5649.jpg`   | [妄想学生会](https://bgm.tv/subject/5649)                            |
| 尸鬼                              | `bangumi-5653.jpg`   | [尸鬼](https://bgm.tv/subject/5653)                                  |
| 梦幻之星                          | `bangumi-139830.jpg` | [梦幻之星online2](https://bgm.tv/subject/139830)                     |
| 寒蝉鸣泣之时                      | `bangumi-289.jpg`    | [寒蝉鸣泣之时](https://bgm.tv/subject/289)                           |
| 二舍六房的七人                    | `bangumi-4283.jpg`   | [RAINBOW 少年犯之七人](https://bgm.tv/subject/4283)                  |
| 散华礼弥                          | `bangumi-28230.jpg`  | [散华礼弥](https://bgm.tv/subject/28230)                             |
| 这个是僵尸吗？                    | `bangumi-9774.jpg`   | [这个是僵尸吗？](https://bgm.tv/subject/9774)                        |
| 双星之阴阳师                      | `bangumi-155778.jpg` | [双星之阴阳师](https://bgm.tv/subject/155778)                        |
| 黑之契约者                        | `bangumi-292.jpg`    | [DARKER THAN BLACK -黑之契约者-](https://bgm.tv/subject/292)         |
| 日常系的异能战斗                  | `bangumi-99538.jpg`  | [日常系的异能战斗](https://bgm.tv/subject/99538)                     |
| 乃木坂春香的秘密                  | `bangumi-762.jpg`    | [乃木坂春香的秘密](https://bgm.tv/subject/762)                       |
| 在盛夏等待                        | `bangumi-22657.jpg`  | [在盛夏等待](https://bgm.tv/subject/22657)                           |
| 少女爱上姐姐                      | `bangumi-3828.jpg`   | [少女爱上姐姐](https://bgm.tv/subject/3828)                          |
| 粗点心战争                        | `bangumi-146994.jpg` | [粗点心战争](https://bgm.tv/subject/146994)                          |
| 银仙                              | `bangumi-100227.jpg` | [银仙](https://bgm.tv/subject/100227)                                |
| 苍蓝钢铁的琶音                    | `bangumi-74663.jpg`  | [苍蓝钢铁的琶音](https://bgm.tv/subject/74663)                       |
| 濑户的花嫁                        | `bangumi-805.jpg`    | [濑户的花嫁](https://bgm.tv/subject/805)                             |
| 恋爱随意链接                      | `bangumi-37154.jpg`  | [恋爱随意链接](https://bgm.tv/subject/37154)                         |
| 黄昏少女×失忆                     | `bangumi-29060.jpg`  | [黄昏少女×失忆](https://bgm.tv/subject/29060)                        |
| S·A 特优生                        | `bangumi-1963.jpg`   | [SA特优生](https://bgm.tv/subject/1963)                              |
| 死后文                            | `bangumi-281.jpg`    | [死后文](https://bgm.tv/subject/281)                                 |
| 心跳回忆                          | `bangumi-1804.jpg`   | [心跳回忆Only Love](https://bgm.tv/subject/1804)                     |
| Charlotte                         | `bangumi-120925.jpg` | [夏洛特](https://bgm.tv/subject/120925)                              |
| 这个美术社大有问题！              | `bangumi-150746.jpg` | [这个美术社大有问题！](https://bgm.tv/subject/150746)                |
| 乱步奇谭                          | `bangumi-118785.jpg` | [乱步奇谭 拉普拉斯的游戏](https://bgm.tv/subject/118785)             |
| 甘城光辉游乐园                    | `bangumi-93545.jpg`  | [甘城光辉游乐园](https://bgm.tv/subject/93545)                       |
| 男子高中生的日常                  | `bangumi-24790.jpg`  | [男子高中生的日常](https://bgm.tv/subject/24790)                     |
| 食灵 -零-                         | `bangumi-885.jpg`    | [食灵-零-](https://bgm.tv/subject/885)                               |
| 白箱                              | `bangumi-110467.jpg` | [白箱](https://bgm.tv/subject/110467)                                |
| 路人女主的养成方法                | `bangumi-100403.jpg` | [路人女主的养成方法](https://bgm.tv/subject/100403)                  |
| 狗与剪刀的正确用法                | `bangumi-72940.jpg`  | [狗与剪刀的正确用法](https://bgm.tv/subject/72940)                   |
| 大家的河合庄                      | `bangumi-89216.jpg`  | [我们大家的河合庄](https://bgm.tv/subject/89216)                     |
| 在地下城寻求邂逅是否搞错了什么    | `bangumi-116287.jpg` | [在地下城寻求邂逅是否搞错了什么](https://bgm.tv/subject/116287)      |
| 吹响！上低音号                    | `bangumi-115908.jpg` | [吹响吧！上低音号](https://bgm.tv/subject/115908)                    |
| 秒速五厘米                        | `bangumi-927.jpg`    | [秒速5厘米](https://bgm.tv/subject/927)                              |
| 你的名字。                        | `your-name.png`      | [你的名字。](https://anilist.co/anime/21519)                         |
| 星之声                            | `bangumi-1936.jpg`   | [星之声](https://bgm.tv/subject/1936)                                |
| 打工吧！魔王大人                  | `bangumi-50814.jpg`  | [打工吧！魔王大人](https://bgm.tv/subject/50814)                     |
| 线上游戏的老婆不可能是女生？      | `bangumi-142758.jpg` | [线上游戏的老婆不可能是女生？](https://bgm.tv/subject/142758)        |
| 邻座的怪同学                      | `bangumi-40533.jpg`  | [邻座的怪同学](https://bgm.tv/subject/40533)                         |
| 荒川爆笑团                        | `bangumi-2464.jpg`   | [荒川爆笑团](https://bgm.tv/subject/2464)                            |
| 风夏                              | `bangumi-188412.jpg` | [风夏](https://bgm.tv/subject/188412)                                |
| 为美好的世界献上祝福！            | `bangumi-135275.jpg` | [为美好的世界献上祝福！](https://bgm.tv/subject/135275)              |
| 清恋                              | `bangumi-195229.jpg` | [清恋](https://bgm.tv/subject/195229)                                |
| 小林家的龙女仆                    | `bangumi-179949.jpg` | [小林家的龙女仆](https://bgm.tv/subject/179949)                      |
| Hand Shakers                      | `bangumi-174592.jpg` | [Hand Shakers](https://bgm.tv/subject/174592)                        |
| 超元气三姐妹                      | `bangumi-5658.jpg`   | [超元气三姐妹](https://bgm.tv/subject/5658)                          |
| 狼与香辛料                        | `bangumi-282.jpg`    | [狼与香辛料](https://bgm.tv/subject/282)                             |
| 迷糊餐厅                          | `bangumi-4255.jpg`   | [迷糊餐厅](https://bgm.tv/subject/4255)                              |
| 迷家                              | `bangumi-163046.jpg` | [迷家](https://bgm.tv/subject/163046)                                |
| 珈百璃的堕落                      | `bangumi-188091.jpg` | [珈百璃的堕落](https://bgm.tv/subject/188091)                        |
| Fate/Grand Order                  | `bangumi-196773.jpg` | [Fate/Grand Order -First Order-](https://bgm.tv/subject/196773)      |
| Fate/kaleid liner 魔法少女☆伊莉雅 | `bangumi-43951.jpg`  | [Fate/kaleid liner 魔法少女☆伊莉雅](https://bgm.tv/subject/43951)    |
| 悠久之翼                          | `bangumi-799.jpg`    | [悠久之翼](https://bgm.tv/subject/799)                               |
| 传颂之物                          | `bangumi-1044.jpg`   | [传颂之物](https://bgm.tv/subject/1044)                              |
| 普通女高中生要做当地偶像          | `bangumi-94236.jpg`  | [普通女高中生要做当地偶像](https://bgm.tv/subject/94236)             |
| 只有我不在的街道                  | `bangumi-137722.jpg` | [只有我不存在的城市](https://bgm.tv/subject/137722)                  |

## 保留的旧示例图片

以下图片仍保留来源记录，但未在当前观看清单中展示。

| 文件             | 作品来源                                         |
| ---------------- | ------------------------------------------------ |
| `frieren.jpg`    | [葬送的芙莉莲](https://anilist.co/anime/154587)  |
| `bocchi.png`     | [孤独摇滚！](https://anilist.co/anime/130003)    |
| `violet.png`     | [紫罗兰永恒花园](https://anilist.co/anime/21827) |
| `lycoris.jpg`    | [莉可丽丝](https://anilist.co/anime/143270)      |
| `odd-taxi.jpg`   | [奇巧计程车](https://anilist.co/anime/128547)    |
| `weathering.png` | [天气之子](https://anilist.co/anime/106286)      |

海报版权属于对应作品的权利人，不作为本站原创素材或代码许可证的一部分。补充或替换海报时，将图片放到此目录，更新 apps/web/src/data/watched-anime.ts 的 image，并同步登记来源。图片加载失败时，页面仍保留示意封面作为回退。
