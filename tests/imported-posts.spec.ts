import { expect, test, localPostCount } from "./fixtures";

test("博客园文章在 API 不可用时仍能阅读，保留原始时间与本地图片", async ({
  page,
}) => {
  await page.route("**/api/articles", (route) =>
    route.fulfill({ status: 503, json: { message: "不可用" } }),
  );
  await page.goto("/blog");
  await expect(page.getByRole("article")).toHaveCount(localPostCount);
  await expect(page.getByRole("article").first()).toContainText(
    "wsl2配置转发规则，便于局域网内访问",
  );
  await page
    .getByRole("button", { name: "阅读：typescript循环依赖error", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByText("发布于 2022-12-30 16:05", { exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByText("更新于 2022-12-30 16:06", { exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("link", { name: "博客园原文" }),
  ).toHaveAttribute("href", "https://www.cnblogs.com/Kidrue/p/17015145.html");
  await expect(dialog.locator("pre").first()).toContainText(
    'import { b } from "./b"',
  );
  const image = dialog.locator(".markdown-content img");
  await image.scrollIntoViewIfNeeded();
  await expect(image).toHaveAttribute("src", /^\/images\/posts\/cnblogs\//);
  await expect
    .poll(() =>
      image.evaluate((element: HTMLImageElement) => element.naturalWidth),
    )
    .toBeGreaterThan(0);
  expect(
    await dialog.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
});

test("独立文章归档与最早文章均已导入，支持正文搜索", async ({ page }) => {
  await page.goto("/blog");
  const search = page.getByRole("searchbox", { name: "搜索文章" });
  await search.fill("git 的基础使用");
  await expect(page.getByRole("article")).toHaveCount(1);
  await page
    .getByRole("button", { name: "阅读：git工作使用", exact: true })
    .click();
  await expect(
    page.getByRole("dialog").getByRole("link", { name: "博客园原文" }),
  ).toHaveAttribute("href", "https://www.cnblogs.com/Kidrue/p/16168835.html");
  await page.keyboard.press("Escape");
  await search.fill("Vue动态复制");
  await expect(page.getByRole("article").locator("time")).toHaveAttribute(
    "datetime",
    "2021-04-30",
  );
  await search.fill("navigator.platform");
  await expect(page.getByRole("article").getByRole("heading")).toHaveText(
    "js获取当前平台类型",
  );
});
