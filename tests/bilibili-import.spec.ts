import { expect, test } from "./fixtures";

test("Bilibili 追番归并同作品，保留重制版、续作与本地看过状态", async ({
  page,
}) => {
  await page.goto("/interests");
  const list = page.getByRole("list", { name: "番剧记录", exact: true });
  await expect(list.getByRole("listitem")).toHaveCount(339);
  const old = list.getByRole("listitem").filter({
    has: page.getByRole("heading", { name: "中二病也要谈恋爱", exact: true }),
  });
  await old.locator("summary").click();
  await expect(old.locator(".timeline-label")).toHaveText("看过");
  await expect(
    old.getByRole("link", { name: "Bilibili：中二病也要谈恋爱！" }),
  ).toHaveAttribute("href", "https://www.bilibili.com/bangumi/play/ss4340");
  await expect(old.getByText(/原始记录/)).toBeVisible();
  await expect(
    list.getByRole("heading", { name: "通灵王", exact: true }),
  ).toHaveCount(1);
  await expect(
    list.getByRole("heading", { name: "通灵王（2021）", exact: true }),
  ).toHaveCount(1);
  await expect(
    list.getByRole("heading", { name: "小林家的龙女仆 第二季", exact: true }),
  ).toHaveCount(1);
  await expect(
    list.getByRole("heading", { name: "凸变英雄X", exact: true }),
  ).toHaveCount(1);
  await expect(
    list.getByRole("heading", { name: "凸变英雄X 日语版", exact: true }),
  ).toHaveCount(0);
  const pending = list.getByRole("listitem").filter({
    has: page.getByRole("heading", { name: "李诗雅", exact: true }),
  });
  await expect(pending.locator("time")).toHaveCount(0);
  await expect(pending.getByText("时间待确认", { exact: true })).toBeVisible();
});

test("Bilibili 新记录显示封面与原始追番状态，出处在展开后可访问", async ({
  page,
}) => {
  await page.goto("/interests");
  await expect(
    page.getByRole("link", { name: "我的 Bilibili 追番列表" }),
  ).toHaveAttribute("href", "https://space.bilibili.com/25857856/bangumi");
  await page.getByRole("button", { name: "在看", exact: true }).click();
  const record = page.getByRole("listitem").filter({
    has: page.getByRole("heading", { name: "凡人修仙传", exact: true }),
  });
  await expect(record.locator("time")).toHaveText("2020-07-25");
  await expect(record.getByRole("img")).toHaveAttribute(
    "src",
    /\/images\/anime\/bilibili-28747\.webp$/,
  );
  await record.locator("summary").click();
  await expect(
    record.getByRole("link", { name: "Bilibili：凡人修仙传" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "想看", exact: true }).click();
  await expect(page.getByRole("listitem")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "政宗君的复仇", exact: true }),
  ).toBeVisible();
});
