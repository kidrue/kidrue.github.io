import { expect, test } from "./fixtures";
import type { Article } from "@kidrue/shared";

const saved: Article = {
  id: "article-1",
  title: "云下的手记",
  description: "",
  category: "生活",
  tags: [],
  body: "第一段文字",
  coverUrl: "",
  status: "draft",
  date: "2026-10-20",
  readTime: 1,
  revision: 1,
  createdAt: "2026-10-20T00:00:00Z",
  updatedAt: "2026-10-20T00:00:00Z",
};

test("保存等待期间继续编辑，返回结果不能覆盖后续文字", async ({ page }) => {
  let release: (() => Promise<void>) | undefined;
  await page.route("**/api/admin/articles", async (route) => {
    if (route.request().method() === "GET")
      return route.fulfill({ json: { articles: [saved] } });
    release = () =>
      route.fulfill({
        status: 201,
        json: { article: { ...saved, ...route.request().postDataJSON() } },
      });
  });
  await page.goto("/editor");
  await page.getByLabel("文章标题").fill("持续写作");
  await page.getByLabel("Markdown 正文").fill("提交时的文字");
  await page.getByRole("button", { name: "保存草稿", exact: true }).click();
  await expect.poll(() => Boolean(release)).toBe(true);
  await page.getByLabel("Markdown 正文").fill("保存期间写下的后续文字");
  await release!();
  await expect(page.getByLabel("Markdown 正文")).toHaveValue(
    "保存期间写下的后续文字",
  );
  await expect(page.getByRole("status")).toContainText("后续编辑尚未保存");
});

test.beforeEach(async ({ page }) => {
  await page.route("**/uploads/videos/test.mp4", (route) =>
    route.fulfill({ status: 404, body: "" }),
  );
  await page.route("**/api/admin/session", (route) =>
    route.fulfill({
      json: {
        authenticated: true,
        development: true,
        uploads: {
          configured: false,
          maxImageBytes: 10485760,
          maxVideoBytes: 104857600,
        },
      },
    }),
  );
  await page.route("**/api/admin/articles", async (route) => {
    if (route.request().method() === "GET")
      return route.fulfill({ json: { articles: [saved] } });
    return route.fulfill({
      status: 201,
      json: { article: { ...saved, ...route.request().postDataJSON() } },
    });
  });
});

test("保存草稿后发布，并把服务端保存与本机备份区分", async ({ page }) => {
  await page.goto("/editor");
  await page.getByLabel("文章标题").fill("今天也记录一点");
  await page.getByLabel("Markdown 正文").fill("## 好奇心\n\n继续写下去。");
  await page.getByRole("button", { name: "保存草稿", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("已保存到服务器");
  await page.route("**/api/admin/articles/article-1", (route) =>
    route.fulfill({
      json: {
        article: { ...saved, ...route.request().postDataJSON(), revision: 2 },
      },
    }),
  );
  await page.getByRole("button", { name: "发布文章", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("已发布");
  await expect(page.getByRole("button", { name: "转为草稿" })).toBeVisible();
});

test("修订冲突保留正在编辑的文字，刷新可从本机恢复", async ({
  page,
}, testInfo) => {
  await page.route("**/api/admin/articles/article-1", (route) =>
    route.fulfill({ status: 409, json: { message: "文章已被其他窗口修改" } }),
  );
  await page.goto("/editor");
  await expect(page.getByLabel("文章标题")).toBeVisible();
  if (testInfo.project.name === "mobile")
    await page.getByRole("button", { name: "我的文章", exact: true }).click();
  await page.getByRole("button", { name: /云下的手记/ }).click();
  await page.getByLabel("Markdown 正文").fill("不能丢失的文字");
  await page.getByRole("button", { name: "保存草稿", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("其他窗口");
  await expect(page.getByLabel("Markdown 正文")).toHaveValue("不能丢失的文字");
  page.on("dialog", (dialog) => dialog.accept());
  await page.reload();
  await expect(page.getByLabel("Markdown 正文")).toHaveValue("不能丢失的文字");
  await expect(page.getByRole("status")).toContainText("本机已恢复");
});

test("安全预览渲染视频且不会执行正文 HTML 或危险链接", async ({
  page,
}, testInfo) => {
  await page.goto("/editor");
  await page
    .getByLabel("Markdown 正文")
    .fill(
      '![小片段](/uploads/videos/test.mp4 "video")\n\n[危险链接](javascript:alert(1))\n\n<script>alert(1)</script>',
    );
  if (testInfo.project.name === "mobile")
    await page.getByRole("tab", { name: "预览" }).click();
  await expect(page.locator("video")).toHaveAttribute(
    "src",
    "/uploads/videos/test.mp4",
  );
  await expect(page.locator('a[href^="javascript:"]')).toHaveCount(0);
  await expect(page.locator("main script")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
