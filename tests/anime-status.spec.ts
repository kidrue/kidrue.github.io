import { expect, test, localAnimeCount } from "./fixtures";

test("番剧按全部、看过、想看、搁置筛选并同步数量", async ({ page }) => {
  await page.goto("/interests");
  const collection = page.getByRole("region", { name: "兴趣，认真收藏。" });
  const filters = collection.getByRole("group", { name: "番剧状态" });
  await expect(filters).toBeVisible();
  await expect(
    filters.getByRole("button", { name: "全部", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(collection.getByRole("listitem")).toHaveCount(localAnimeCount);
  for (const [status, count, firstTitle] of [
    ["看过", 195, "关于我转生变成史莱姆这档事 转生史莱姆日记"],
    ["想看", 1, "政宗君的复仇"],
    ["搁置", 0, ""],
  ] as const) {
    await filters.getByRole("button", { name: status, exact: true }).click();
    await expect(collection.getByRole("listitem")).toHaveCount(count);
    if (count > 0) {
      await expect(
        collection.getByRole("listitem").first().getByRole("heading"),
      ).toHaveText(firstTitle);
    } else {
      await expect(
        collection.getByText("这个分类还没有番剧记录"),
      ).toBeVisible();
    }
    await expect(
      filters.getByRole("button", { name: status, exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(collection.getByRole("status")).toContainText(
      `${String(count).padStart(2, "0")} 部番剧`,
    );
  }
  await filters.getByRole("button", { name: "全部", exact: true }).click();
  await expect(collection.getByRole("listitem")).toHaveCount(localAnimeCount);
});

test("手办不显示番剧筛选，切回番剧保留状态且可用键盘操作", async ({ page }) => {
  await page.goto("/interests");
  const collection = page.getByRole("region", { name: "兴趣，认真收藏。" });
  const filters = collection.getByRole("group", { name: "番剧状态" });
  const want = filters.getByRole("button", { name: "搁置", exact: true });
  await want.focus();
  await page.keyboard.press("Enter");
  await expect(collection.getByRole("listitem")).toHaveCount(0);
  await expect(collection.getByText("这个分类还没有番剧记录")).toBeVisible();
  await collection
    .getByRole("button", { name: "收藏的手办", exact: true })
    .click();
  await expect(filters).not.toBeVisible();
  await expect(collection.getByRole("listitem")).toHaveCount(3);
  await collection
    .getByRole("button", { name: "番剧记录", exact: true })
    .click();
  await expect(want).toHaveAttribute("aria-pressed", "true");
  await expect(collection.getByRole("listitem")).toHaveCount(0);
  await expect(collection.getByText("这个分类还没有番剧记录")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
