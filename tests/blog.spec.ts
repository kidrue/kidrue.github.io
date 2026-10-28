import { expect, test, localPostCount } from "./fixtures";

test("移动菜单展开后的 Tab 进入导航，Escape 返回菜单按钮", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "仅移动端显示折叠菜单");
  await page.goto("/blog");
  const toggle = page.getByRole("button", { name: "打开导航菜单" });
  await toggle.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("navigation", { name: "主导航" }).getByRole("link").first(),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
});

test("分类只显示对应文章，并能恢复全部导入文章", async ({ page }) => {
  await page.goto("/blog");
  await expect(page.getByRole("article")).toHaveCount(localPostCount);
  await page.getByRole("button", { name: "技术", exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(localPostCount - 1);
  await expect(
    page
      .getByRole("article")
      .filter({
        has: page.getByRole("button", { name: "阅读：2022-07", exact: true }),
      }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "生活", exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(
    page
      .getByRole("article")
      .filter({
        has: page.getByRole("button", { name: "阅读：2022-07", exact: true }),
      }),
  ).toHaveCount(1);
  await page
    .getByRole("group", { name: "文章分类" })
    .getByRole("button", { name: "全部", exact: true })
    .click();
  await expect(page.getByRole("article")).toHaveCount(localPostCount);
});

test("阅读弹窗显示正文，支持 Escape 并将焦点还给原文章", async ({ page }) => {
  await page.goto("/blog");
  const read = page.getByRole("button", {
    name: "阅读：typescript循环依赖error",
  });
  await read.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("heading", { name: "typescript循环依赖error" }),
  ).toBeVisible();
  await expect(dialog.getByText("解决办法：", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(read).toBeFocused();
});

test("阅读弹窗关闭按钮和遮罩可关闭内容", async ({ page }) => {
  await page.goto("/blog");
  await page
    .getByRole("button", { name: "阅读：typescript循环依赖error" })
    .click();
  await page.getByRole("button", { name: "关闭文章" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page
    .getByRole("button", { name: "阅读：typescript循环依赖error" })
    .click();
  await page.mouse.click(3, 3);
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("页面无横向溢出，主按钮能到达文章区域", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("link", { name: "进入博客" }).click();
  await expect(page).toHaveURL(/\/blog#articles$/);
  await expect(
    page.getByRole("heading", { name: "最近，写了这些。" }),
  ).toBeInViewport();
});

test("移动导航可展开并在跳转后收起", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "仅移动端显示折叠菜单");
  await page.goto("/blog");
  const toggle = page.getByRole("button", { name: "打开导航菜单" });
  await toggle.click();
  await expect(page.getByRole("navigation", { name: "主导航" })).toBeVisible();
  await page
    .getByRole("navigation", { name: "主导航" })
    .getByRole("link", { name: "关于" })
    .click();
  await expect(page).toHaveURL(/#about$/);
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
});
