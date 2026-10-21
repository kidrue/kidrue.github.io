import { expect, test } from "./fixtures";

test("已发布文章进入公开列表、正文搜索和媒体阅读", async ({ page }) => {
  await page.route("**/api/articles", route => route.fulfill({ json: { articles: [{ id: "published-1", title: "写作的新章节", description: "来自文章后台", category: "技术", tags: ["写作"], body: '## 持续记录\n\n专属搜索暗号。\n\n![片段](/uploads/videos/test.mp4 "video")', coverUrl: "", status: "published", date: "2026-10-20", readTime: 1, revision: 1, createdAt: "2026-10-20T00:00:00Z", updatedAt: "2026-10-20T00:00:00Z" }] } }));
  await page.route("**/uploads/videos/test.mp4", route => route.fulfill({ status: 404, body: "" }));
  await page.goto("/blog");
  await expect(page.getByRole("article")).toHaveCount(7);
  await page.getByRole("searchbox", { name: "搜索文章" }).fill("专属搜索暗号");
  await expect(page.getByRole("article")).toHaveCount(1);
  await page.getByRole("button", { name: "阅读：写作的新章节" }).click();
  await expect(page.getByRole("dialog").getByText("原创文章", { exact: true })).toBeVisible();
  await expect(page.locator("dialog video")).toHaveAttribute("src", "/uploads/videos/test.mp4");
});

test("文章服务失败时保留示例且明确提示状态", async ({ page }) => {
  await page.route("**/api/articles", route => route.fulfill({ status: 503, json: { message: "不可用" } }));
  await page.goto("/blog");
  await expect(page.getByRole("article")).toHaveCount(6);
  await expect(page.getByText("文章服务暂不可用，当前展示内置示例文章。", { exact: true })).toBeVisible();
});
