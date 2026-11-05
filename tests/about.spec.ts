import { test, expect } from "./fixtures";

test("关于有独立路由，展示个人介绍并支持刷新和旧链接", async ({
  page,
}, testInfo) => {
  await page.goto("/blog");
  await expect(page.locator("#about")).toHaveCount(0);
  if (testInfo.project.name === "mobile")
    await page.getByRole("button", { name: "打开导航菜单" }).click();
  await page
    .getByRole("navigation", { name: "主导航" })
    .getByRole("link", { name: /^关于/ })
    .click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("关于我。");
  await expect(page.locator("#about")).toContainText("我是 kidrue");
  await page.screenshot({
    path: testInfo.outputPath("about.png"),
    fullPage: true,
  });
  await expect(
    page.getByRole("link", { name: /^关于/, includeHidden: true }),
  ).toHaveAttribute("aria-current", "page");
  await page.goto("/about/");
  await page.reload();
  await expect(page.locator("#about")).toContainText("我是 kidrue");
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto("/blog#about");
  await expect(page).toHaveURL(/\/about$/);
  await page.goto("/blog");
  await page.evaluate(() => {
    location.hash = "about";
  });
  await expect(page).toHaveURL(/\/about$/);
});
