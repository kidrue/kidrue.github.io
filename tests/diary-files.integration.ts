import { mkdtemp, writeFile, unlink, rmdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { test, expect } from "./fixtures";

// 使用 playwright.diary.config.ts 串行运行，避免文件热更新干扰其他页面测试。
test("本地新增修改删除 Markdown 会更新日记，可打开全文", async ({
  page,
}, testInfo) => {
  const directory = await mkdtemp(join(resolve("日记"), "自动验证-"));
  const first = join(directory, "2099-01-02-测试日记.md");
  const second = join(directory, "2099-01-03-下一天.md");
  const draft = join(directory, "_2099-01-04-不展示.md");
  try {
    await writeFile(
      first,
      "# 日记自动验证\n\n**今天的小事**\n\n- 散步\n- 看书\n\n```js\nconsole.log('hello');\n```",
      { flag: "wx" },
    );
    await writeFile(draft, "# 不展示的日记\n\n这是模板内容。", { flag: "wx" });
    await page.goto("/diary");
    const read = page.getByRole("button", {
      name: "阅读：日记自动验证",
      exact: true,
    });
    await expect(read).toBeVisible();
    await expect(page.getByText("不展示的日记")).toHaveCount(0);
    await read.click();
    const dialog = page.getByRole("dialog");
    await expect(
      dialog.getByRole("heading", { name: "日记自动验证" }),
    ).toBeVisible();
    await expect(dialog.locator("strong")).toHaveText("今天的小事");
    await expect(dialog.locator("pre")).toContainText("console.log('hello')");
    await page.getByRole("button", { name: "关闭日记" }).click();
    await expect(read).toBeFocused();
    await page.screenshot({ path: testInfo.outputPath("diary.png") });
    await Promise.all([
      page.waitForEvent("load"),
      writeFile(first, "# 日记自动验证\n\n修改后的记录。"),
    ]);
    await read.click();
    await expect(dialog.getByText("修改后的记录。")).toBeVisible();
    await page.keyboard.press("Escape");
    await writeFile(second, "# 新增的一天\n\n新的一天。", { flag: "wx" });
    await expect(
      page.getByRole("button", { name: "阅读：新增的一天", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("article").first()).toContainText("新增的一天");
    await unlink(second);
    await expect(
      page.getByRole("button", { name: "阅读：新增的一天", exact: true }),
    ).toHaveCount(0);
  } finally {
    for (const file of [first, second, draft])
      await unlink(file).catch((error) => {
        if (error.code !== "ENOENT") throw error;
      });
    await rmdir(directory);
  }
});
