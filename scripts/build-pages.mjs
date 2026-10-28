import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { preparePages } from "./prepare-pages.mjs";

if (!process.env.npm_execpath)
  throw new Error("请使用 npm run build:pages 构建。");
const result = spawnSync(
  process.execPath,
  [process.env.npm_execpath, "run", "build:web"],
  {
    cwd: fileURLToPath(new URL("../", import.meta.url)),
    env: { ...process.env, VITE_STATIC_SITE: "true" },
    stdio: "inherit",
    windowsHide: true,
  },
);
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
await preparePages(
  fileURLToPath(new URL("../apps/web/dist/", import.meta.url)),
);
console.log("GitHub Pages 静态产物已生成：apps/web/dist/");
