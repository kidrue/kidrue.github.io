import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

test("安装、开发和阅读无需服务端或数据库", () => {
  const pkg = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url)),
  );
  assert.equal(pkg.scripts.postinstall, undefined);
  assert.equal(
    existsSync(new URL("../apps/api/package.json", import.meta.url)),
    false,
  );
  const articles = readFileSync(
    new URL("../apps/web/src/components/ArticlesSection.tsx", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(articles, /usePublishedPosts/);
  const config = readFileSync(
    new URL("../apps/web/vite.config.ts", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(config, /API_PROXY_URL|proxy,/);
});
