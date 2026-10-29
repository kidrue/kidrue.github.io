import { test, expect } from "./fixtures";

test("日记有独立入口，直接访问与刷新保持导航高亮", async ({
  page,
}, testInfo) => {
  await page.goto("/blog");
  if (testInfo.project.name === "mobile")
    await page.getByRole("button", { name: "打开导航菜单" }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: /^日记/ })
    .click();
  await expect(page).toHaveURL(/\/diary$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "日常，慢慢记。",
  );
  await expect(
    page.getByRole("link", { name: /^日记/, includeHidden: true }),
  ).toHaveAttribute("aria-current", "page");
  await page.goto("/diary/");
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "日常，慢慢记。",
  );
  for (const width of [390, 641, 768, 1024, 1101, 1200, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `页面在 ${width}px 宽度时不应横向溢出`,
    ).toBe(true);
  }
});
