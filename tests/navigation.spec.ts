import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

async function openTab(page: Page, name: string) {
  const menu = page.getByRole("button", { name: "打开导航菜单" });
  const touch = test.info().project.use.hasTouch === true;
  const clickAt = async (x: number, y: number) =>
    touch ? page.touchscreen.tap(x, y) : page.mouse.click(x, y);
  if (await menu.isVisible()) {
    const box = (await menu.boundingBox())!;
    await clickAt(box.x + box.width / 2, box.y + box.height / 2);
  }
  const link = page
    .getByRole("navigation", { name: "主导航" })
    .getByRole("link", { name: new RegExp(`^${name}`) });
  await expect(link).toBeVisible();
  // 使用可见导航的真实点击位置，避免 scrollIntoView 对 sticky 元素额外滚动。
  const box = (await link.boundingBox())!;
  await clickAt(box.x + box.width / 2, box.y + box.height / 2);
}

test("顶部导航复用文档与公共导航，跨栏目切换没有 HTML 请求", async ({
  page,
}) => {
  await page.goto("/blog");
  await expect(page.locator("#articles")).toBeVisible();
  await page.evaluate(() => {
    Object.assign(window, {
      __navigationMarker: "same-document",
      __navigationHeader: document.querySelector("header"),
    });
  });
  const documents: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "document") documents.push(request.url());
  });
  for (const [name, heading] of [
    ["兴趣", "我的兴趣。"],
    ["项目", "我的项目。"],
    ["日记", "日常，慢慢记。"],
    ["一句话", "喜欢的一句话。"],
    ["文章", "记录代码，也收藏日常。"],
  ]) {
    await openTab(page, name);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
    expect(
      await page.evaluate(() => {
        const state = window as Window & {
          __navigationMarker?: string;
          __navigationHeader?: Element;
        };
        return (
          state.__navigationMarker === "same-document" &&
          state.__navigationHeader === document.querySelector("header")
        );
      }),
    ).toBe(true);
  }
  expect(documents).toEqual([]);
});

test("跨栏目返回保留文章搜索视图、兴趣筛选及滚动位置", async ({ page }) => {
  await page.goto("/blog");
  await page
    .getByRole("searchbox", { name: "搜索文章" })
    .fill("typescript循环依赖");
  await page.getByRole("button", { name: "卡片", exact: true }).click();
  await openTab(page, "兴趣");
  await page.getByRole("button", { name: "在看", exact: true }).click();
  await page.getByRole("button", { name: "卡片", exact: true }).click();
  await page.evaluate(() =>
    window.scrollTo({ top: 1200, behavior: "instant" }),
  );
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(1200);
  await openTab(page, "项目");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "我的项目。",
  );
  await openTab(page, "兴趣");
  await expect(
    page.getByRole("button", { name: "在看", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("button", { name: "卡片", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(1200);
  await openTab(page, "文章");
  await expect(page.getByRole("searchbox", { name: "搜索文章" })).toHaveValue(
    "typescript循环依赖",
  );
  await expect(
    page.getByRole("button", { name: "卡片", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#articles article")).toHaveCount(1);
});

test("前进后退恢复位置，独立栏目和博客锚点均能跳转", async ({ page }) => {
  await page.goto("/interests");
  await expect(page.locator("#collections")).toBeVisible();
  await page.evaluate(() =>
    window.scrollTo({ top: 1400, behavior: "instant" }),
  );
  await openTab(page, "项目");
  await expect(page).toHaveURL(/\/projects$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/interests$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(1400);
  await page.goForward();
  await expect(page).toHaveURL(/\/projects$/);
  await openTab(page, "一句话");
  await expect(page).toHaveURL(/\/quotes$/);
  await expect(page.locator("#quotes-title")).toBeInViewport();
  await openTab(page, "文章");
  await expect(page.locator("#articles-title")).toBeInViewport();
  await openTab(page, "关于");
  await expect(page.locator("#about h2")).toBeInViewport();
  await openTab(page, "文章");
  await expect(page.locator("#articles-title")).toBeInViewport();
});

test("悬停预取页面与点击复用同一请求，慢加载期间当前内容与导航保持可用", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === "mobile",
    "手机意图预取由触摸导航及跨页测试覆盖",
  );
  let projectRequests = 0;
  let release: (() => void) | undefined;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/src/ProjectsPage.tsx*", async (route) => {
    projectRequests++;
    await gate;
    await route.continue();
  });
  await page.goto("/blog");
  const link = page
    .getByRole("navigation")
    .getByRole("link", { name: /^项目/ });
  await link.hover();
  await expect.poll(() => projectRequests).toBe(1);
  await link.click();
  await expect(page.getByRole("navigation")).toBeVisible();
  await expect(page.locator("#articles")).toBeVisible();
  await expect(page.getByRole("main")).toHaveAttribute("aria-busy", "true");
  release!();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "我的项目。",
  );
  expect(projectRequests).toBe(1);
});

test("正文渲染器在阅读时加载，文章列表不提前下载", async ({ page }) => {
  const rendererRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/src/components/MarkdownContent.tsx"))
      rendererRequests.push(request.url());
  });
  await page.goto("/blog");
  await expect(page.locator("#articles article")).toHaveCount(58);
  expect(rendererRequests).toEqual([]);
  await page
    .getByRole("button", { name: "阅读：typescript循环依赖error" })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("dialog").locator(".markdown-content"),
  ).toBeVisible();
  expect(rendererRequests).toHaveLength(1);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("页面代码加载失败提供恢复入口，导航仍可切到其他栏目", async ({ page }) => {
  await page.route("**/src/ProjectsPage.tsx*", (route) => route.abort());
  await page.goto("/blog");
  await expect(page.locator("#articles")).toBeVisible();
  await openTab(page, "项目");
  await expect(
    page.getByRole("heading", { name: "页面暂时未能加载" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "重新加载页面" }),
  ).toHaveAttribute("href", /\/projects$/);
  await openTab(page, "日记");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "日常，慢慢记。",
  );
});

test("省流量模式不预取页面，点击仍可正常加载目标栏目", async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "connection", {
      value: { saveData: true, effectiveType: "4g" },
      configurable: true,
    }),
  );
  const pages: string[] = [];
  page.on("request", (request) => {
    if (
      /\/src\/(DiaryPage|ProjectsPage|InterestsPage)\.tsx/.test(request.url())
    )
      pages.push(request.url());
  });
  await page.goto("/blog");
  await expect(page.locator("#articles")).toBeVisible();
  await page.evaluate(
    () => new Promise<void>((resolve) => requestIdleCallback(() => resolve())),
  );
  expect(pages).toEqual([]);
  await openTab(page, "兴趣");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "我的兴趣。",
  );
  expect(pages.some((url) => url.includes("InterestsPage"))).toBe(true);
});

test("快速切换以最后选择为准，迟到的页面模块不会覆盖当前栏目", async ({
  page,
}) => {
  let release: (() => void) | undefined;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let delayedResponse: Promise<unknown> | undefined;
  await page.route("**/src/ProjectsPage.tsx*", async (route) => {
    await gate;
    delayedResponse = route.continue();
    await delayedResponse;
  });
  await page.goto("/blog");
  await expect(page.locator("#articles")).toBeVisible();
  await openTab(page, "项目");
  await expect(page.getByRole("main")).toHaveAttribute("aria-busy", "true");
  await openTab(page, "日记");
  await expect(page).toHaveURL(/\/diary$/);
  release!();
  await expect.poll(() => Boolean(delayedResponse)).toBe(true);
  await delayedResponse;
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "日常，慢慢记。",
  );
  await expect(page).toHaveURL(/\/diary$/);
});

test("包含无效转义的锚点不会使页面报错", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/blog#bad%ZZ");
  await expect(page.locator("#articles")).toBeVisible();
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
  });
  expect(errors).toEqual([]);
});

test("慢字体到达后不会把用户已经滚动的位置重置", async ({ page }) => {
  let release: (() => void) | undefined;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/fonts/*.woff2", async (route) => {
    await gate;
    await route.continue();
  });
  try {
    await page.goto("/blog", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#articles")).toBeVisible();
    await page.mouse.wheel(0, 1200);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(800);
    release!();
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);
    });
    expect(await page.evaluate(() => scrollY)).toBeGreaterThan(800);
  } finally {
    release!();
  }
});

test("跳过导航将键盘焦点交给内容，下一次 Tab 不再回到导航", async ({
  page,
}) => {
  await page.goto("/blog");
  await expect(page.locator("#articles")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.locator(".skip-link").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#articles")).toBeFocused();
  await page.keyboard.press("Tab");
  expect(
    await page.evaluate(() =>
      document.querySelector("#articles")?.contains(document.activeElement),
    ),
  ).toBe(true);
});

test("省流量时不因标题聚焦预取正文，主动阅读仍能加载", async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "connection", {
      value: { saveData: true, effectiveType: "4g" },
      configurable: true,
    }),
  );
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/src/components/MarkdownContent.tsx"))
      requests.push(request.url());
  });
  await page.goto("/blog");
  const title = page.getByRole("button", {
    name: "阅读：typescript循环依赖error",
  });
  await title.focus();
  await page.evaluate(() => new Promise(requestAnimationFrame));
  expect(requests).toEqual([]);
  await title.click();
  await expect(page.locator("dialog .markdown-content")).toBeVisible();
  expect(requests).toHaveLength(1);
});
