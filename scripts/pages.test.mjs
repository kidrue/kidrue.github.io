import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  writeFile,
  readFile,
  readdir,
  unlink,
  rmdir,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { preparePages } from "./prepare-pages.mjs";

test("静态部署生成可直接访问的路由，资源保持根路径", async () => {
  const directory = await mkdtemp(join(tmpdir(), "kidrue-pages-"));
  const html = '<html><script src="/assets/app.js"></script></html>';
  try {
    await writeFile(join(directory, "index.html"), html);
    await preparePages(directory);
    for (const route of ["blog", "diary", "interests", "projects"]) {
      assert.equal(
        await readFile(join(directory, route, "index.html"), "utf8"),
        html,
      );
    }
    assert.equal(await readFile(join(directory, ".nojekyll"), "utf8"), "");
    assert.equal(await readFile(join(directory, "404.html"), "utf8"), html);
    assert.ok(!(await readdir(directory)).includes("editor"));
  } finally {
    for (const route of ["blog", "diary", "interests", "projects"]) {
      await unlink(join(directory, route, "index.html")).catch(() => {});
      await rmdir(join(directory, route)).catch(() => {});
    }
    for (const file of ["index.html", ".nojekyll", "404.html"])
      await unlink(join(directory, file)).catch(() => {});
    await rmdir(directory);
  }
});
