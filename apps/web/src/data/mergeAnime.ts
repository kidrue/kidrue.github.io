import type { CollectionRecord } from "./collections";

export type AnimeRecord = Extract<CollectionRecord, { kind: "anime" }>;
export type BilibiliEntry = {
  seasonId: number;
  title: string;
  status: string;
  airDate?: string;
  awaitingRelease: boolean;
  image: string;
  url: string;
};
type Matches = {
  existingRecords: Record<string, string>;
  versions: Record<string, number>;
  displayTitles: Record<string, string>;
};

export function mergeAnime(
  watched: AnimeRecord[],
  imported: BilibiliEntry[],
  matches: Matches,
): AnimeRecord[] {
  const records = new Map(watched.map((record) => [record.id, { ...record }]));
  const bySeason = new Map(imported.map((entry) => [entry.seasonId, entry]));
  for (const entry of imported) {
    const primary = bySeason.get(matches.versions[entry.seasonId]) ?? entry;
    const existingId = matches.existingRecords[primary.seasonId];
    if (existingId && !records.has(existingId))
      throw new Error(`追番合并目标不存在：${existingId}`);
    const id = existingId ?? `bilibili-${primary.seasonId}`;
    let record = records.get(id);
    if (!record) {
      if (!["看过", "在看", "想看"].includes(primary.status))
        throw new Error(`未知 Bilibili 追番状态：${primary.status}`);
      record = {
        id,
        kind: "anime",
        title: matches.displayTitles[primary.seasonId] ?? primary.title,
        status: primary.status as AnimeRecord["status"],
        subtitle: "我的 Bilibili 追番",
        tags: ["Bilibili"],
        example: false,
        tone: "mint",
        image: primary.image,
        airDate: primary.airDate,
        note: primary.awaitingRelease
          ? "尚未开播，播出时间待确认。"
          : "已收藏于 Bilibili 追番列表，感想待补。",
      };
      records.set(id, record);
    }
    record.bilibili = [
      ...(record.bilibili ?? []),
      {
        seasonId: entry.seasonId,
        title: entry.title,
        url: entry.url,
        status: entry.status,
      },
    ];
  }
  return [...records.values()];
}
