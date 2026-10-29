import { expect, test, localAnimeCount } from "./fixtures";

test("番剧按首播年月分组倒序排列，筛选后保持分组", async ({ page }) => {
  await page.goto("/interests");
  const list = page.getByRole("list", { name: "番剧记录", exact: true });
  const headings = list.locator(".anime-month-heading");
  await expect(headings.first()).toContainText("2026-07");
  await expect(
    list.getByRole("listitem").first().getByRole("heading"),
  ).toHaveText("百日成王");
  const months = await headings.locator("h3").allTextContents();
  expect(months.at(-1)).toBe("播出时间待确认");
  expect(months.slice(0, -1)).toEqual(
    [...months.slice(0, -1)].sort().reverse(),
  );
  expect(new Set(months).size).toBe(months.length);
  const dates = await list
    .locator("li[data-air-date]")
    .evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-air-date")!),
    );
  expect(dates).toEqual([...dates].sort().reverse());
  await expect(list.getByRole("listitem")).toHaveCount(localAnimeCount);
  const sword = list.getByRole("listitem").filter({
    has: page.getByRole("heading", {
      name: "刀剑神域（第 1、2 季）",
      exact: true,
    }),
  });
  await expect(sword.locator("time")).toHaveAttribute("datetime", "2012-07-07");
  await expect(sword.locator("time")).toHaveText("2012-07-07");
  await page.getByRole("button", { name: "看过", exact: true }).click();
  await expect(list.getByRole("listitem")).toHaveCount(195);
  const watchedMonths = await headings.locator("h3").allTextContents();
  expect(watchedMonths.slice(0, -1)).toEqual(
    [...watchedMonths.slice(0, -1)].sort().reverse(),
  );
  await page.getByRole("button", { name: "搁置", exact: true }).click();
  await expect(headings).toHaveCount(0);
  await page.getByRole("button", { name: "查看全部番剧" }).click();
  await expect(headings.locator("h3")).toHaveText(months);
  await page.screenshot({ path: test.info().outputPath("anime-months.png") });
});
