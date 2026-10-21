export type CollectionKind = "anime" | "figure";
export type AnimeStatus = "看过" | "在看" | "想看" | "搁置" | "抛弃";
type CollectionRecordBase = {
  id: string;
  title: string;
  subtitle: string;
  tags: string[];
  note: string;
  tone: "mint" | "rose" | "sand";
  example: boolean;
  image?: string;
};
export type CollectionRecord = CollectionRecordBase &
  (
    | { kind: "anime"; status: AnimeStatus; year?: number; rating?: number }
    | { kind: "figure"; status: string }
  );

// 以下是布局示例，不代表博主实际看过或拥有这些作品、藏品。
// 有自己的图片后，可添加 image: "/images/your-photo.jpg"，图片放入 public/images/。
export const collectionRecords: CollectionRecord[] = [
  {
    id: "anime-frieren",
    image: "/images/anime/frieren.jpg",
    year: 2023,
    rating: 9.1,
    example: true,
    kind: "anime",
    title: "葬送的芙莉莲",
    subtitle: "把一段旅途，留在记忆里。",
    status: "看过",
    tags: ["观看记录", "观后感"],
    note: "这里可以写下观后感、喜欢的角色，以及想要重温的片段。",
    tone: "mint",
  },
  {
    id: "anime-bocchi",
    image: "/images/anime/bocchi.png",
    year: 2022,
    rating: 8.7,
    example: true,
    kind: "anime",
    title: "孤独摇滚！",
    subtitle: "给平凡的日子，加一点音量。",
    status: "想看",
    tags: ["待看清单", "想看理由"],
    note: "先记下为什么想看、是谁推荐的，等合适的时候开始这段新的故事。",
    tone: "rose",
  },
  {
    id: "anime-natsume",
    image: "/images/anime/natsume.jpg",
    year: 2008,
    rating: 8.0,
    example: true,
    kind: "anime",
    title: "夏目友人帐",
    subtitle: "先留个位置，等合适的时候再继续。",
    status: "搁置",
    tags: ["暂时搁置", "追番记录"],
    note: "记录看到的进度和暂时搁置的原因。等想继续的时候，就从上次停下的地方出发。",
    tone: "sand",
  },
  {
    id: "anime-violet",
    kind: "anime",
    example: true,
    title: "紫罗兰永恒花园",
    subtitle: "把无法说出口的心意，写成一封信。",
    status: "看过",
    tone: "mint",
    tags: ["成长", "书信"],
    note: "示例观看笔记：可以记录最喜欢的一封信，以及故事中令你停留的片刻。",
    image: "/images/anime/violet.png",
    year: 2018,
    rating: 8.5,
  },
  {
    id: "anime-your-name",
    kind: "anime",
    example: true,
    title: "你的名字。",
    subtitle: "在流星划过的时候，记住一个名字。",
    status: "看过",
    tone: "rose",
    tags: ["电影", "相遇"],
    note: "示例观看笔记：记下喜欢的镜头、音乐，以及看完后想留下的感受。",
    image: "/images/anime/your-name.png",
    year: 2016,
    rating: 8.5,
  },
  {
    id: "anime-lycoris",
    kind: "anime",
    example: true,
    title: "莉可丽丝",
    subtitle: "在咖啡香与日常之间，追赶下一段故事。",
    status: "在看",
    tone: "rose",
    tags: ["追番", "日常"],
    note: "示例追番笔记：记录当前看到的集数、喜欢的角色和下次想继续的地方。",
    image: "/images/anime/lycoris.jpg",
    year: 2022,
    rating: 8.1,
  },
  {
    id: "anime-odd-taxi",
    kind: "anime",
    example: true,
    title: "奇巧计程车",
    subtitle: "每个乘客，都带着自己的故事。",
    status: "看过",
    tone: "sand",
    tags: ["悬疑", "都市"],
    note: "示例观看笔记：可以在这里整理伏笔与人物之间的联系，留下自己的理解。",
    image: "/images/anime/odd-taxi.jpg",
    year: 2021,
    rating: 8.5,
  },
  {
    id: "anime-weathering",
    kind: "anime",
    example: true,
    title: "天气之子",
    subtitle: "把晴天的期待，先放进待看清单。",
    status: "想看",
    tone: "mint",
    tags: ["电影", "待看"],
    note: "示例想看笔记：记录推荐来源和想看的理由，等一个合适的时间开始。",
    image: "/images/anime/weathering.png",
    year: 2019,
    rating: 8.1,
  },
  {
    id: "figure-traveler",
    example: true,
    kind: "figure",
    title: "魔女旅人",
    subtitle: "收藏柜里的一小段奇幻旅程。",
    status: "已入柜",
    tags: ["比例手办", "收藏示例"],
    note: "这里可以记录入手时间、收藏故事与展示方式，之后配上自己的实拍照片。",
    tone: "mint",
  },
  {
    id: "figure-blue-note",
    example: true,
    kind: "figure",
    title: "蓝色音符",
    subtitle: "让喜欢的角色，陪在桌边。",
    status: "已收藏",
    tags: ["Q 版摆件", "收藏示例"],
    note: "从开箱时的小惊喜，到桌面布置的变化，每一件收藏都可以有属于自己的小故事。",
    tone: "rose",
  },
  {
    id: "figure-afternoon",
    example: true,
    kind: "figure",
    title: "午后咖啡",
    subtitle: "把日常里的温柔，摆成风景。",
    status: "已入柜",
    tags: ["场景摆件", "收藏示例"],
    note: "可以在这里补充角色、厂商、尺寸和入手日期，也可以单纯记录为什么喜欢它。",
    tone: "sand",
  },
];
