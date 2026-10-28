import { parseDiaryFiles } from "./parseDiaries";

const files = import.meta.glob<string>(
  [
    "../../../../日记/**/*.md",
    "!../../../../日记/**/README.md",
    "!../../../../日记/**/readme.md",
    "!../../../../日记/**/_*.md",
    "!../../../../日记/**/_*/**",
  ],
  { eager: true, query: "?raw", import: "default" },
);

export const diaries = parseDiaryFiles(files);
