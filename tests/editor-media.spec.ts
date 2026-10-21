import { expect, test } from "./fixtures";

const png = {
  name: "photo.png",
  mimeType: "image/png",
  buffer: Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jbtEAAAAASUVORK5CYII=",
    "base64",
  ),
};

test.beforeEach(async ({ page }) => {
  await page.route("**/api/admin/session", (route) =>
    route.fulfill({
      json: {
        authenticated: true,
        development: true,
        uploads: {
          configured: true,
          maxImageBytes: 10485760,
          maxVideoBytes: 104857600,
        },
      },
    }),
  );
  await page.route("**/api/admin/articles", (route) =>
    route.fulfill({ json: { articles: [] } }),
  );
  await page.route("**/images/upload-test.png", (route) =>
    route.fulfill({ contentType: "image/png", body: png.buffer }),
  );
  await page.route("**/uploads/videos/test.mp4", (route) =>
    route.fulfill({ status: 404, body: "" }),
  );
});

test("编辑区展示带文字的上传入口和媒体保存位置", async ({ page }) => {
  await page.goto("/editor");
  const image = page.getByRole("button", { name: "上传图片", exact: true });
  const video = page.getByRole("button", { name: "上传视频", exact: true });
  await expect(image).toHaveText("上传图片");
  await expect(video).toHaveText("上传视频");
  await expect(
    page.getByText("图片与视频均存储于 Imgur", { exact: true }),
  ).toBeVisible();
});

test("缺少 Imgur 配置时图片和视频均说明所需的 Client ID", async ({ page }) => {
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
  await page.goto("/editor");
  for (const name of ["上传图片", "上传视频"]) {
    await page.getByRole("button", { name, exact: true }).click();
    await expect(page.getByRole("alert")).toContainText("IMGUR_CLIENT_ID");
  }
});

test("取消封面选择后，粘贴图片仍插入正文", async ({ page }) => {
  await page.route("**/api/admin/uploads", (route) =>
    route.fulfill({
      json: {
        url: "/images/upload-test.png",
        name: "pasted.png",
        type: "image",
      },
    }),
  );
  await page.goto("/editor");
  await page.getByLabel("Markdown 正文").fill("已有文字");
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "上传封面", exact: true }).click();
  await (await chooser).setFiles([]);
  await page.getByLabel("Markdown 正文").evaluate((element) => {
    const transfer = new DataTransfer();
    transfer.items.add(
      new File([new Uint8Array([137, 80, 78, 71])], "pasted.png", {
        type: "image/png",
      }),
    );
    element.dispatchEvent(
      new ClipboardEvent("paste", {
        clipboardData: transfer,
        bubbles: true,
        cancelable: true,
      }),
    );
  });
  await expect(page.getByLabel("Markdown 正文")).toHaveValue(
    /已有文字[\s\S]*!\[pasted\.png\]\(\/images\/upload-test\.png\)/,
  );
  await expect(page.getByLabel("封面地址")).toHaveValue("");
});

test("上传图片失败保留正文，可以重新选择同一个文件重试", async ({
  page,
}, testInfo) => {
  let failed = true;
  await page.route("**/api/admin/uploads", (route) =>
    failed
      ? route.fulfill({
          status: 502,
          json: { message: "Imgur 服务暂不可用，请重试" },
        })
      : route.fulfill({
          json: {
            url: "/images/upload-test.png",
            name: "photo.png",
            type: "image",
          },
        }),
  );
  await page.goto("/editor");
  const body = page.getByLabel("Markdown 正文");
  await body.fill("保留的文字");
  for (const retry of [false, true]) {
    failed = !retry;
    const chooser = page.waitForEvent("filechooser");
    await page.getByRole("button", { name: "上传图片", exact: true }).click();
    await (await chooser).setFiles(png);
    if (!retry) {
      await expect(page.getByRole("alert")).toContainText("Imgur");
      await expect(body).toHaveValue("保留的文字");
    }
  }
  await expect(body).toHaveValue(/保留的文字[\s\S]*upload-test\.png/);
  if (testInfo.project.name === "mobile")
    await page.getByRole("tab", { name: "预览" }).click();
  await expect(page.locator(".markdown-content img")).toHaveAttribute(
    "src",
    "/images/upload-test.png",
  );
});

test("视频上传等待期间继续编辑，插入播放器时保留后续文字", async ({
  page,
}, testInfo) => {
  let finish: (() => Promise<void>) | undefined;
  await page.route("**/api/admin/uploads", (route) => {
    finish = () =>
      route.fulfill({
        json: {
          url: "/uploads/videos/test.mp4",
          name: "clip.mp4",
          type: "video",
        },
      });
  });
  await page.goto("/editor");
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "上传视频", exact: true }).click();
  await (
    await chooser
  ).setFiles({
    name: "clip.mp4",
    mimeType: "video/mp4",
    buffer: Buffer.from("test video"),
  });
  await expect(
    page.getByRole("progressbar", { name: "媒体上传进度" }),
  ).toBeVisible();
  await page.getByLabel("Markdown 正文").fill("上传时继续写下的内容");
  await expect.poll(() => Boolean(finish)).toBe(true);
  await finish!();
  await expect(page.getByLabel("Markdown 正文")).toHaveValue(
    /上传时继续写下的内容[\s\S]*"video"/,
  );
  if (testInfo.project.name === "mobile")
    await page.getByRole("tab", { name: "预览" }).click();
  await expect(page.locator("video")).toHaveAttribute(
    "src",
    "/uploads/videos/test.mp4",
  );
});

test("取消上传保留正文并恢复操作按钮", async ({ page }) => {
  await page.route("**/api/admin/uploads", () => {});
  await page.goto("/editor");
  await page.getByLabel("Markdown 正文").fill("还没有上传完成的文字");
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "上传图片", exact: true }).click();
  await (await chooser).setFiles(png);
  await page.getByRole("button", { name: "取消", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("上传已取消");
  await expect(page.getByLabel("Markdown 正文")).toHaveValue(
    "还没有上传完成的文字",
  );
  await expect(
    page.getByRole("button", { name: "保存草稿", exact: true }),
  ).toBeEnabled();
  await expect(page.getByRole("progressbar")).toHaveCount(0);
});
