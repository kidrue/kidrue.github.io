import { test, expect } from "@playwright/test";
import { parseDiaryFiles } from "../apps/web/src/data/parseDiaries";

test("日记按日期倒序，支持普通 Markdown、文件名标题及可选元数据", () => {
  const entries = parseDiaryFiles({
    "日记/2026-02-03-散步.md": "# 晚风\n\n路上看到一只猫。",
    "日记/2026-02-04-下雨.md": "在家读书。",
    "日记/2026/想法.md":
      "---\ntitle: 一个想法\ndate: 2026-02-05\ntags: [日常]\n---\n\n今天学了一个新东西。",
    "日记/README.md": "说明",
    "日记/_模板.md": "# 模板",
  });
  expect(entries.map((entry) => entry.title)).toEqual([
    "一个想法",
    "下雨",
    "晚风",
  ]);
  expect(entries.map((entry) => entry.date)).toEqual([
    "2026-02-05",
    "2026-02-04",
    "2026-02-03",
  ]);
  expect(entries[2].body).toContain("路上看到一只猫。");
  expect(entries[2].body).not.toContain("# 晚风");
  expect(entries[0].tags).toEqual(["日常"]);
});

test("同一天多篇日记有独立 ID，不读取空文件和模板目录", () => {
  const entries = parseDiaryFiles({
    "日记/2026-02-03-早.md": "早上好",
    "日记/2026-02-03-晚.md": "晚安",
    "日记/空白.md": "  ",
    "日记/_草稿/未写完.md": "未写完",
  });
  expect(entries).toHaveLength(2);
  expect(new Set(entries.map((entry) => entry.id)).size).toBe(2);
});

test("无效日期及错误元数据会指出文件，避免日记静默丢失", () => {
  expect(() => parseDiaryFiles({ "日记/2026-02-30.md": "正文" })).toThrow(
    /2026-02-30.md/,
  );
  expect(() => parseDiaryFiles({ "日记/没有日期.md": "正文" })).toThrow(/日期/);
  expect(() =>
    parseDiaryFiles({ "日记/2026-02-03.md": "---\ntitle: [\n---\n正文" }),
  ).toThrow(/2026-02-03.md/);
  expect(() =>
    parseDiaryFiles({ "日记/2026-02-03.md": "---\ntags: 字符串\n---\n正文" }),
  ).toThrow(/tags/);
});
