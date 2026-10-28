import { watchedAnimeRecords } from "./watched-anime";

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
    | {
        kind: "anime";
        status: AnimeStatus;
        year?: number;
        rating?: number;
        airDate?: string;
      }
    | { kind: "figure"; status: string }
  );

// 番剧来自博主的实际观看清单；手办仍为明确标注的布局示例。
export const collectionRecords: CollectionRecord[] = [
  ...watchedAnimeRecords,
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
