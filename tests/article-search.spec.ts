import { expect, test, localPostCount } from "./fixtures";

test("文章搜索忽略英文大小写及首尾空格，并能清空", async ({ page }) => {
  await page.goto("/blog#articles");
  const search = page.getByRole("searchbox", { name: "搜索文章" });
  await expect(search).toBeVisible();
  await search.fill("  tYpEsCrIpT循环依赖  ");
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("article").getByRole("heading")).toHaveText(
    "typescript循环依赖error",
  );
  await page
    .getByRole("button", { name: "阅读：typescript循环依赖error" })
    .click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("heading", { name: "typescript循环依赖error" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(search).toHaveValue("  tYpEsCrIpT循环依赖  ");
  await expect(page.getByRole("article")).toHaveCount(1);
  await page.getByRole("button", { name: "清空搜索" }).click();
  await expect(search).toHaveValue("");
  await expect(search).toBeFocused();
  await expect(page.getByRole("article")).toHaveCount(localPostCount);
});

test("搜索能找到正文、摘要和标签中的关键词", async ({ page }) => {
  await page.goto("/blog#articles");
  const search = page.getByRole("searchbox", { name: "搜索文章" });
  await search.fill("navigator.platform");
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("article").getByRole("heading")).toHaveText(
    "js获取当前平台类型",
  );
  await search.fill("契约之吻");
  await expect(page.getByRole("article").getByRole("heading")).toHaveText(
    "2022-07",
  );
  await search.fill("踩坑记录");
  await expect(page.getByRole("article").getByRole("heading")).toHaveText(
    "typescript循环依赖error",
  );
});

test("分类、标签和搜索可以组合，重置后恢复全部文章", async ({ page }) => {
  await page.goto("/blog#articles");
  const search = page.getByRole("searchbox", { name: "搜索文章" });
  const tags = page.getByRole("combobox", { name: "文章标签" });
  await tags.selectOption("常用框架网站");
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
  await search.fill("swiper");
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("article").getByRole("heading")).toHaveText(
    "前端常用css库",
  );
  await page.getByRole("button", { name: "重置筛选" }).click();
  await expect(search).toHaveValue("");
  await expect(tags).toHaveValue("");
  await expect(page.getByRole("article")).toHaveCount(localPostCount);
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
  await expect(page.getByRole("article")).toHaveCount(localPostCount);
  await expect(search).toHaveValue("");
  await search.fill("   ");
  await expect(page.getByRole("article")).toHaveCount(localPostCount);
});
