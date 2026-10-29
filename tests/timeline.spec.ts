import { expect, test, localPostCount, localAnimeCount } from "./fixtures";

test("文章默认展示时间到标题的时间轴，切换视图保留搜索并能阅读", async ({
  page,
}) => {
  await page.goto("/blog");
  const section = page.locator("#articles");
  await expect(
    section.getByRole("button", { name: "时间轴", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(section.locator(".timeline-item")).toHaveCount(localPostCount);
  const dates = await section
    .locator(".timeline-item time")
    .evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("datetime")!),
    );
  expect(dates).toEqual([...dates].sort().reverse());
  const first = section.locator(".timeline-row").first();
  const date = await first.locator("time").boundingBox();
  const title = await first.getByRole("heading").boundingBox();
  expect(date!.x + date!.width).toBeLessThan(title!.x);
  await page
    .getByRole("searchbox", { name: "搜索文章" })
    .fill("typescript循环依赖");
  await expect(section.getByRole("article")).toHaveCount(1);
  await section.getByRole("button", { name: "卡片", exact: true }).click();
  await expect(section.locator(".post-card")).toHaveCount(1);
  await section.getByRole("button", { name: "时间轴", exact: true }).click();
  await section
    .getByRole("button", { name: "阅读：typescript循环依赖error" })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "清空搜索" }).click();
  await expect(section.locator(".timeline-item")).toHaveCount(localPostCount);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: test.info().outputPath("article-timeline.png"),
  });
});

test("追番默认为年月时间轴，展开详情并保留卡片入口", async ({ page }) => {
  await page.goto("/interests");
  const section = page.locator("#collections");
  await expect(
    section.getByRole("button", { name: "时间轴", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(section.locator(".timeline-item")).toHaveCount(localAnimeCount);
  const first = section.getByRole("listitem").first();
  await expect(first.getByRole("heading")).toHaveText("百日成王");
  await expect(first.locator("time")).toHaveText("2026-07-03");
  await expect(first.getByRole("img")).toBeVisible();
  await expect(first.locator(".timeline-detail")).not.toBeVisible();
  await first.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(first.locator(".timeline-detail")).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(first.getByRole("img")).toBeVisible();
  await expect(first.locator(".timeline-detail")).not.toBeVisible();
  await section.getByRole("button", { name: "卡片", exact: true }).click();
  await expect(first.getByRole("img")).toBeVisible();
  await section.getByRole("button", { name: "时间轴", exact: true }).click();
  await expect(first.getByRole("img")).toBeVisible();
  await expect(first.locator(".timeline-detail")).not.toBeVisible();
  await section.getByRole("button", { name: "搁置", exact: true }).click();
  await expect(section.getByRole("listitem")).toHaveCount(0);
  await section.getByRole("button", { name: "查看全部番剧" }).click();
  await expect(section.locator(".timeline-item")).toHaveCount(localAnimeCount);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: test.info().outputPath("anime-timeline.png") });
});
