import { expect, test } from "./fixtures";

test("重复文章只展示完整主版本，旧标题仍可搜索", async ({ page }) => {
  await page.goto("/blog");
  await expect(page.getByRole("article")).toHaveCount(58);
  const search = page.getByRole("searchbox", { name: "搜索文章" });
  for (const title of ["git工作使用", "git工作中的使用", "git 的基础使用"]) {
    await search.fill(title);
    await expect(page.getByRole("article")).toHaveCount(1);
    await expect(page.getByRole("article").getByRole("heading")).toHaveText(
      "git工作使用",
    );
  }
  await page
    .getByRole("button", { name: "阅读：git工作使用", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("link", { name: "博客园原文" }),
  ).toHaveAttribute("href", "https://www.cnblogs.com/Kidrue/p/16168835.html");
  await expect(
    dialog.getByText("发布于 2022-04-20 10:38", { exact: true }),
  ).toBeVisible();
  await expect(dialog.locator(".markdown-content")).toContainText(
    "git config --global --add pull.rebase true",
  );
  await expect(dialog.locator(".markdown-content")).toContainText(
    "git reset --soft HEAD",
  );
  await page.keyboard.press("Escape");
  await search.fill("vue第二次进入时created方法不执行");
  await expect(page.getByRole("article")).toHaveCount(1);
  await page
    .getByRole("button", {
      name: "阅读：vue第二次进入时created方法不执行",
      exact: true,
    })
    .click();
  await expect(
    dialog.getByText("发布于 2021-10-11 16:51", { exact: true }),
  ).toBeVisible();
  await expect(dialog.locator("pre")).toContainText("$route()");
});

test("文章服务不可用时仍展示去重后的本地文章", async ({ page }) => {
  await page.route("**/api/articles", (route) =>
    route.fulfill({ status: 503, json: { message: "不可用" } }),
  );
  await page.goto("/blog");
  await expect(page.getByRole("article")).toHaveCount(58);
  await page.getByRole("button", { name: "卡片", exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(58);
});
