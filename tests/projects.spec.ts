import { expect, test } from "./fixtures";

test("项目从导航进入独立页面，直接访问和刷新保持项目内容", async ({
  page,
}, testInfo) => {
  await page.goto("/blog");
  await expect(page.locator("#articles, #quotes")).toHaveCount(2);
  await expect(page.locator("#project-list, #projects")).toHaveCount(0);
  if (testInfo.project.name === "mobile")
    await page.getByRole("button", { name: "打开导航菜单" }).click();
  await page
    .getByRole("navigation", { name: "主导航" })
    .getByRole("link", { name: /^项目/ })
    .click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "我的项目。",
  );
  await expect(
    page.getByRole("link", { name: /^项目/, includeHidden: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    page.locator("#articles, #quotes, #collections, #about"),
  ).toHaveCount(0);
  await expect(
    page
      .getByRole("region", { name: "把想法，做成作品。" })
      .getByRole("listitem"),
  ).toHaveCount(3);
  await page.goto("/projects/");
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "我的项目。",
  );
  await expect(page.locator("#projects")).toHaveCount(1);
  await expect(page.locator("#articles, #quotes")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("projects-page.png") });
});

test("旧项目锚点跳转至独立项目页，同页锚点变更也兼容", async ({ page }) => {
  await page.goto("/blog#projects");
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "我的项目。",
  );
  await page.goto("/blog");
  await expect(page.locator("#articles")).toBeVisible();
  await page.evaluate(() => {
    window.location.hash = "projects";
  });
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.locator("#articles, #quotes")).toHaveCount(0);
});
