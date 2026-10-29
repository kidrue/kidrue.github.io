import { expect, test } from "./fixtures";

test("一句话导航收藏原文，跨页与窄屏均可阅读", async ({ page }, testInfo) => {
  await page.goto("/interests");
  if (testInfo.project.name === "mobile")
    await page.getByRole("button", { name: "打开导航菜单" }).click();
  await page
    .getByRole("navigation", { name: "主导航" })
    .getByRole("link", { name: /一句话/ })
    .click();
  await expect(page).toHaveURL(/\/blog#quotes$/);
  const section = page.getByRole("region", { name: "把喜欢的话，留在这里。" });
  await expect(section.getByRole("heading")).toBeInViewport();
  await expect(section.locator("blockquote")).toHaveText([
    "至亲的离去不是一场暴雨，而是此生漫长的潮湿，我困在这潮湿当中，是清晨空荡的厨房，是晚归漆黑的窗，在每一个波澜不惊的日子里，掀起狂风骤雨",
    "白头并非雪可替，牵手还需人名币",
  ]);
  await page.reload();
  await expect(section.getByRole("heading")).toBeInViewport();
  await expect
    .poll(async () => {
      const heading = await section.getByRole("heading").boundingBox();
      const header = await page.getByRole("banner").boundingBox();
      return heading!.y >= header!.y + header!.height;
    })
    .toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("favorite-quotes.png") });
});

test("入口按首次上线时间计时，每秒更新且刷新不会重置", async ({
  page,
}, testInfo) => {
  await page.clock.install({ time: new Date("2026-10-29T08:15:39Z") });
  await page.clock.pauseAt(new Date("2026-10-29T08:15:40Z"));
  await page.goto("/");
  const uptime = page.getByLabel("博客运行时间");
  await expect(uptime).toHaveText("本站已运行 1 天 01 时 02 分 03 秒");
  await page.clock.runFor(1000);
  await expect(uptime).toHaveText("本站已运行 1 天 01 时 02 分 04 秒");
  await page.reload();
  await expect(uptime).toHaveText("本站已运行 1 天 01 时 02 分 04 秒");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollHeight <= innerHeight,
    ),
  ).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("landing-uptime.png") });
});

test("早于上线日期的客户端时钟不会显示负运行时间", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-01T00:00:00Z") });
  await page.goto("/");
  await expect(page.getByLabel("博客运行时间")).toHaveText(
    "本站已运行 0 天 00 时 00 分 00 秒",
  );
});
