import { expect, test } from "./fixtures";

test("151 条观看记录的本地海报均可加载，保留看过状态与已有评分", async ({
  page,
}, testInfo) => {
  await page.goto("/interests");
  await page.getByRole("button", { name: "卡片", exact: true }).click();
  const section = page.getByRole("region", { name: "兴趣，认真收藏。" });
  const list = section.getByRole("list", { name: "番剧记录" });
  await expect(list.getByRole("listitem")).toHaveCount(151);
  const first = list.getByRole("listitem").filter({
    has: page.getByRole("heading", {
      name: "刀剑神域（第 1、2 季）",
      exact: true,
    }),
  });
  await expect(first.getByRole("heading")).toHaveText("刀剑神域（第 1、2 季）");
  await expect(first.getByText("2012-07", { exact: true })).toBeVisible();
  await expect(first.getByText("暂无评分", { exact: true })).toBeVisible();
  await expect(first.getByText("看过", { exact: true })).toBeVisible();
  await expect(
    first.getByRole("img", { name: "刀剑神域（第 1、2 季）封面" }),
  ).toBeVisible();
  const images = list.getByRole("img");
  await expect(images).toHaveCount(151);
  const failedCovers = await images.evaluateAll(async (elements) =>
    (
      await Promise.all(
        elements.map(async (element) => {
          const image = element as HTMLImageElement;
          image.loading = "eager";
          try {
            await image.decode();
            return image.naturalWidth > 0 &&
              image.naturalHeight > 0 &&
              new URL(image.src).pathname.startsWith("/images/anime/")
              ? null
              : image.alt;
          } catch {
            return image.alt;
          }
        }),
      )
    ).filter(Boolean),
  );
  expect(failedCovers).toEqual([]);
  await expect(list.locator(".collection-art-label")).toHaveCount(0);
  await expect(list.getByText("示例", { exact: true })).toHaveCount(0);
  const natsume = list.getByRole("listitem").filter({
    has: page.getByRole("heading", { name: "夏目友人帐", exact: true }),
  });
  const cover = natsume.getByRole("img", { name: "夏目友人帐封面" });
  await cover.scrollIntoViewIfNeeded();
  await expect(cover).toBeVisible();
  await expect
    .poll(() =>
      cover.evaluate(
        (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
      ),
    )
    .toBe(true);
  await expect(natsume.getByText("2008-07", { exact: true })).toBeVisible();
  await expect(natsume.getByLabel("AniList 评分 8.0 分")).toBeVisible();
  await expect(natsume.getByText("看过", { exact: true })).toBeVisible();
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
  await first.scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath("anime-covers.png") });
});

test("六种番剧筛选计数正确，空状态可以回到全部", async ({ page }) => {
  await page.goto("/interests");
  const section = page.getByRole("region", { name: "兴趣，认真收藏。" });
  const filters = section.getByRole("group", { name: "番剧状态" });
  for (const [status, count] of [
    ["全部", 151],
    ["看过", 151],
    ["在看", 0],
    ["想看", 0],
    ["搁置", 0],
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
  await expect(section.getByRole("listitem")).toHaveCount(151);
});
