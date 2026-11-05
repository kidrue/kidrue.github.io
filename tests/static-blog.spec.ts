import { test, expect, localPostCount } from "./fixtures";

test("无 API 时所有访客栏目可直接访问、刷新，且没有管理员入口", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const requests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      url.origin === "http://127.0.0.1:5173" &&
      /^\/(api|uploads)\//.test(url.pathname)
    )
      requests.push(url.pathname);
  });
  await page.route("**/api/**", (route) => route.abort());
  for (const path of [
    "/blog/",
    "/diary/",
    "/interests/",
    "/projects/",
    "/quotes/",
    "/about/",
  ]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "写作", exact: true }),
    ).toHaveCount(0);
  }
  await page.goto("/blog");
  await expect(page.getByRole("article")).toHaveCount(localPostCount);
  await page.goto("/diary");
  await page
    .getByRole("button", {
      name: "阅读：收到一封来自青春的信，很快乐，很寂寞",
      exact: true,
    })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("所以，很快乐，也很寂寞。");
  const image = dialog.getByRole("img", { name: "旧楼前开满白花的树" });
  await image.scrollIntoViewIfNeeded();
  await expect
    .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0);
  expect(requests).toEqual([]);
  await page.goto("/editor");
  await expect(page.getByLabel("管理密码")).toHaveCount(0);
});
