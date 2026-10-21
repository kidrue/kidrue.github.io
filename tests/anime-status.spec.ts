import { expect, test } from "./fixtures";

test("番剧按全部、看过、想看、搁置筛选并同步数量", async ({ page }) => {
  await page.goto("/blog#collections");
  const collection = page.getByRole("region", { name: "兴趣，认真收藏。" });
  const filters = collection.getByRole("group", { name: "番剧状态" });
  await expect(filters).toBeVisible();
  await expect(
    filters.getByRole("button", { name: "全部", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(collection.getByRole("listitem")).toHaveCount(8);
  for (const [status, title, count] of [
    ["看过", "葬送的芙莉莲", 4],
    ["想看", "孤独摇滚！", 2],
    ["搁置", "夏目友人帐", 1],
  ] as const) {
    await filters.getByRole("button", { name: status, exact: true }).click();
    await expect(collection.getByRole("listitem")).toHaveCount(count);
    await expect(
      collection.getByRole("listitem").first().getByRole("heading"),
    ).toHaveText(title);
    await expect(
      filters.getByRole("button", { name: status, exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(collection.getByRole("status")).toContainText(
      `0${count} 部番剧`,
    );
  }
  await filters.getByRole("button", { name: "全部", exact: true }).click();
  await expect(collection.getByRole("listitem")).toHaveCount(8);
});

test("手办不显示番剧筛选，切回番剧保留状态且可用键盘操作", async ({ page }) => {
  await page.goto("/blog#collections");
  const collection = page.getByRole("region", { name: "兴趣，认真收藏。" });
  const filters = collection.getByRole("group", { name: "番剧状态" });
  const want = filters.getByRole("button", { name: "想看", exact: true });
  await want.focus();
  await page.keyboard.press("Enter");
  await expect(collection.getByRole("listitem")).toHaveCount(2);
  await collection
    .getByRole("button", { name: "收藏的手办", exact: true })
    .click();
  await expect(filters).not.toBeVisible();
  await expect(collection.getByRole("listitem")).toHaveCount(3);
  await collection
    .getByRole("button", { name: "番剧记录", exact: true })
    .click();
  await expect(want).toHaveAttribute("aria-pressed", "true");
  await expect(
    collection.getByRole("listitem").first().getByRole("heading"),
  ).toHaveText("孤独摇滚！");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
