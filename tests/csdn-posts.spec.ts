import { expect, test } from "./fixtures";

test("作者补充的 WSL2 完整文章展示后半部分、参考资料和本地图片", async ({
  page,
}) => {
  await page.goto("/blog");
  await page
    .getByRole("button", {
      name: "阅读：wsl2配置转发规则，便于局域网内访问",
      exact: true,
    })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByText("发布于 2023-03-20 10:39", { exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("heading", { name: "以下命令用于补充用法：" }),
  ).toBeVisible();
  await expect(dialog.locator("pre").nth(1)).toContainText(
    "netsh interface portproxy show all",
  );
  await expect(dialog.locator("pre").nth(2)).toContainText("ip a");
  await expect(
    dialog.getByRole("link", { name: "wsl2设置端口转发方法" }),
  ).toHaveAttribute("href", "https://www.notevm.com/a/6283.html");
  const image = dialog.locator(".markdown-content img");
  await image.scrollIntoViewIfNeeded();
  await expect(image).toHaveAttribute(
    "src",
    "/images/posts/csdn/9f589e7147e0ec1c.png",
  );
  await expect
    .poll(() => image.evaluate((node: HTMLImageElement) => node.naturalWidth))
    .toBeGreaterThan(0);
});

test("CSDN 文章保留原始发布日期、来源链接与本地图片", async ({ page }) => {
  await page.goto("/blog");
  await page
    .getByRole("searchbox", { name: "搜索文章" })
    .fill("vscode的终端无法识别pnpm命令");
  await page
    .getByRole("button", {
      name: "阅读：vscode的终端无法识别pnpm命令",
      exact: true,
    })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByText("发布于 2022-09-16 11:26", { exact: true }),
  ).toBeVisible();
  await expect(dialog.getByRole("link", { name: "CSDN原文" })).toHaveAttribute(
    "href",
    "https://blog.csdn.net/weixin_43295106/article/details/126887112",
  );
  const image = dialog.locator(".markdown-content img").first();
  await image.scrollIntoViewIfNeeded();
  await expect(image).toHaveAttribute("src", /^\/images\/posts\/csdn\//);
  await expect
    .poll(() => image.evaluate((node: HTMLImageElement) => node.naturalWidth))
    .toBeGreaterThan(0);
});

test("转载文章明确标注转载并保留原作者链接", async ({ page }) => {
  await page.goto("/blog");
  await page
    .getByRole("searchbox", { name: "搜索文章" })
    .fill("粘贴图片到网页");
  await expect(
    page.getByRole("article").getByText("转载", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "阅读：粘贴图片到网页", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("转载文章", { exact: true })).toBeVisible();
  await expect(
    dialog.locator(
      'a[href="https://www.zhangxinxu.com/wordpress/2018/09/ajax-upload-image-from-clipboard/"]',
    ),
  ).toBeVisible();
  await expect(dialog.locator("pre")).toContainText("clipboardData");
});
