import { parse } from "yaml";
import type { Post } from "./posts";

export function parseDiaryFiles(files: Record<string, string>): Post[] {
  const entries: Post[] = [];
  for (const [path, raw] of Object.entries(files)) {
    const parts = path.replaceAll("\\", "/").split("/");
    const filename = parts.at(-1)!;
    if (
      parts.some((part) => part.startsWith("_")) ||
      /^readme\.md$/i.test(filename) ||
      !raw.trim()
    )
      continue;
    try {
      let body = raw.replace(/^\uFEFF/, "").trim();
      let metadata: Record<string, unknown> = {};
      if (/^---\r?\n/.test(body)) {
        const match = body.match(
          /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/,
        );
        if (!match) throw new Error("文件头缺少结束的 ---");
        const parsed = parse(match[1]);
        if (
          parsed !== null &&
          (typeof parsed !== "object" || Array.isArray(parsed))
        )
          throw new Error("文件头必须是 YAML 字段");
        metadata = parsed ?? {};
        body = match[2].trim();
      }
      if (!body) continue;
      const basename = filename.replace(/\.md$/i, "");
      const filenameDate = basename.match(
        /^(\d{4}-\d{2}-\d{2})(?:[-_ ]|$)/,
      )?.[1];
      const date = metadata.date ?? filenameDate;
      if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date))
        throw new Error("请在文件名或 date 字段填写 YYYY-MM-DD 日期");
      const timestamp = Date.parse(`${date}T00:00:00Z`);
      if (
        !Number.isFinite(timestamp) ||
        new Date(timestamp).toISOString().slice(0, 10) !== date
      )
        throw new Error("日期不存在");
      const heading = body.match(/^#\s+(.+)(?:\r?\n|$)/);
      const title =
        metadata.title ??
        heading?.[1].trim() ??
        (basename.replace(/^\d{4}-\d{2}-\d{2}[-_ ]*/, "") || date);
      if (typeof title !== "string" || !title.trim())
        throw new Error("title 必须是非空文字");
      if (
        metadata.tags !== undefined &&
        (!Array.isArray(metadata.tags) ||
          metadata.tags.some((tag) => typeof tag !== "string"))
      )
        throw new Error("tags 必须是文字列表");
      if (
        metadata.description !== undefined &&
        typeof metadata.description !== "string"
      )
        throw new Error("description 必须是文字");
      if (heading && heading[1].trim() === title.trim())
        body = body.slice(heading[0].length).trim();
      entries.push({
        id: `diary-${parts.join("/")}`,
        title: title.trim(),
        date,
        body,
        description: (metadata.description as string) ?? "",
        tags: (metadata.tags as string[]) ?? [],
        category: "生活",
        artwork: "none",
        sections: [],
        example: false,
        readTime: Math.max(1, Math.ceil(body.length / 500)),
      });
    } catch (error) {
      throw new Error(
        `日记格式错误（${path}）：${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  return entries.sort(
    (a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id),
  );
}
