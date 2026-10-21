import { expect, test } from "./fixtures";

test("文章搜索忽略英文大小写及首尾空格，并能清空", async ({ page }) => {
  await page.goto("/blog#articles");
  const search = page.getByRole("searchbox", { name: "搜索文章" });
  await expect(search).toBeVisible();
  await search.fill("  tYpEsCrIpT  ");
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("article").getByRole("heading")).toHaveText(
    "和 TypeScript 再熟悉一点",
  );
  await page
    .getByRole("button", { name: "阅读：和 TypeScript 再熟悉一点" })
    .click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("heading", { name: "和 TypeScript 再熟悉一点" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(search).toHaveValue("  tYpEsCrIpT  ");
  await expect(page.getByRole("article")).toHaveCount(1);
  await page.getByRole("button", { name: "清空搜索" }).click();
  await expect(search).toHaveValue("");
  await expect(search).toBeFocused();
  await expect(page.getByRole("article")).toHaveCount(6);
});

test("搜索能找到正文、摘要和标签中的关键词", async ({ page }) => {
  await page.goto("/blog#articles");
  const search = page.getByRole("searchbox", { name: "搜索文章" });
  await search.fill("苔藓");
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("article").getByRole("heading")).toHaveText(
    "周末，去山野里充个电",
  );
  await search.fill("循环的歌");
  await expect(page.getByRole("article").getByRole("heading")).toHaveText(
    "一些让日子发光的小事",
  );
  await search.fill("开发手记");
  await expect(page.getByRole("article").getByRole("heading")).toHaveText(
    "和 TypeScript 再熟悉一点",
  );
});

test("分类、标签和搜索可以组合，重置后恢复全部文章", async ({ page }) => {
  await page.goto("/blog#articles");
  const search = page.getByRole("searchbox", { name: "搜索文章" });
  const tags = page.getByRole("combobox", { name: "文章标签" });
  await tags.selectOption("CSS");
  await expect(page.getByRole("article")).toHaveCount(1);
  await page.getByRole("button", { name: "生活", exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "暂时没有找到相关文章" }),
  ).toBeVisible();
  await page
    .getByRole("group", { name: "文章分类" })
    .getByRole("button", { name: "全部", exact: true })
    .click();
  await search.fill("Grid");
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("article").getByRole("heading")).toHaveText(
    "CSS Grid：让布局回归秩序",
  );
  await page.getByRole("button", { name: "重置筛选" }).click();
  await expect(search).toHaveValue("");
  await expect(tags).toHaveValue("");
  await expect(page.getByRole("article")).toHaveCount(6);
  await expect(search).toBeFocused();
});

test("无结果时能恢复列表，特殊字符按普通文本搜索", async ({ page }) => {
  await page.goto("/blog#articles");
  const search = page.getByRole("searchbox", { name: "搜索文章" });
  await search.fill("[])?不存在的关键词");
  await expect(page.getByRole("article")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "暂时没有找到相关文章" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "查看全部文章", exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(6);
  await expect(search).toHaveValue("");
  await search.fill("   ");
  await expect(page.getByRole("article")).toHaveCount(6);
});
