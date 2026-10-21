import { expect, test } from "./fixtures";

test("追番展示竖版海报、状态、年份与评分，没有音乐游戏分类", async ({
  page,
}, testInfo) => {
  await page.goto("/blog#collections");
  const section = page.getByRole("region", { name: "兴趣，认真收藏。" });
  const list = section.getByRole("list", { name: "番剧记录" });
  await expect(list.getByRole("listitem")).toHaveCount(8);
  const first = list.getByRole("listitem").first();
  const cover = first.getByRole("img", { name: "葬送的芙莉莲封面" });
  await cover.scrollIntoViewIfNeeded();
  await expect(cover).toBeVisible();
  await expect
    .poll(() =>
      cover.evaluate(
        (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
      ),
    )
    .toBe(true);
  await expect(first.getByText("2023", { exact: true })).toBeVisible();
  await expect(first.getByLabel("AniList 评分 9.1 分")).toBeVisible();
  await expect(first.getByText("看过", { exact: true })).toBeVisible();
  await expect(section.getByRole("button", { name: /音乐|游戏/ })).toHaveCount(
    0,
  );
  const coverBox = await cover.boundingBox();
  expect(coverBox!.height / coverBox!.width).toBeGreaterThan(1.4);
  const columns = await list.evaluate(
    (element) =>
      getComputedStyle(element).gridTemplateColumns.split(" ").length,
  );
  expect(columns).toBe(testInfo.project.name === "mobile" ? 2 : 4);
});

test("六种番剧筛选计数正确，空状态可以回到全部", async ({ page }) => {
  await page.goto("/blog#collections");
  const section = page.getByRole("region", { name: "兴趣，认真收藏。" });
  const filters = section.getByRole("group", { name: "番剧状态" });
  for (const [status, count] of [
    ["全部", 8],
    ["看过", 4],
    ["在看", 1],
    ["想看", 2],
    ["搁置", 1],
    ["抛弃", 0],
  ] as const) {
    const button = filters.getByRole("button", { name: status, exact: true });
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(button.locator("sup")).toHaveText(String(count));
    await expect(section.getByRole("listitem")).toHaveCount(count);
  }
  await expect(section.getByText("这个分类还没有番剧记录")).toBeVisible();
  await section.getByRole("button", { name: "查看全部番剧" }).click();
  await expect(section.getByRole("listitem")).toHaveCount(8);
});
