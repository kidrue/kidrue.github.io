import { expect, hitokotoFixture, test, localPostCount } from "./fixtures";
import type { Route } from "@playwright/test";

test("进入博客先播放起飞效果，返回入口后仍可再次进入", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "进入博客", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page).toHaveURL(/\/blog#articles$/);
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "kidrue", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "进入博客", exact: true })
    .press("Enter");
  await expect(page).toHaveURL(/\/blog#articles$/);
});

test("减少动态效果时无需等待动画即可进入博客", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install({ time: new Date("2026-10-20T12:00:00+08:00") });
  await page.clock.pauseAt(new Date("2026-10-20T12:00:10+08:00"));
  await page.goto("/");
  await page.getByRole("link", { name: "进入博客", exact: true }).click();
  await expect(page).toHaveURL(/\/blog#articles$/);
});

test("跨午夜延迟返回的旧响应不能覆盖新日期缓存", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-20T23:59:50+08:00") });
  await page.clock.pauseAt(new Date("2026-10-20T23:59:58+08:00"));
  let previousRoute: Route | undefined;
  let requests = 0;
  await page.route("https://v1.hitokoto.cn/**", async (route) => {
    requests += 1;
    if (requests === 1) {
      previousRoute = route;
      return;
    }
    await route.fulfill({
      json: { ...hitokotoFixture, hitokoto: "今天的新故事。" },
    });
  });
  await page.goto("/");
  await expect.poll(() => Boolean(previousRoute)).toBe(true);
  // 取得真实服务共享的旧请求，等待它的缓存写入结束后再断言。
  await page.evaluate(async () => {
    const modulePath = "/src/lib/daily-quote.ts";
    const { loadDailyQuote } = await import(/* @vite-ignore */ modulePath);
    const browserWindow = window as Window & {
      __previousQuoteRequest?: Promise<unknown>;
    };
    browserWindow.__previousQuoteRequest = loadDailyQuote("2026-10-20");
  });
  await page.clock.fastForward(3100);
  await expect(page.getByText("今天的新故事。", { exact: true })).toBeVisible();
  await previousRoute!.fulfill({
    json: { ...hitokotoFixture, hitokoto: "昨天迟到的故事。" },
  });
  await page.evaluate(
    () =>
      (window as Window & { __previousQuoteRequest?: Promise<unknown> })
        .__previousQuoteRequest,
  );
  const cache = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("kidrue:daily-hitokoto:v1")!),
  );
  expect(cache.day).toBe("2026-10-21");
  expect(cache.quote.text).toBe("今天的新故事。");
  await page.reload();
  await expect(page.getByText("今天的新故事。", { exact: true })).toBeVisible();
  expect(requests).toBe(2);
});

test("暗色入口展示昵称、头像、社交链接和每日一言", async ({ page }) => {
  await page.goto("/");
  const hero = page.getByRole("region", { name: "kidrue" });
  await expect(hero).toBeVisible();
  await expect(hero.getByRole("img", { name: "kidrue 的头像" })).toBeVisible();
  await expect(
    hero.getByText(hitokotoFixture.hitokoto, { exact: true }),
  ).toBeVisible();
  await expect(hero.getByText("测试作者 ·《测试语录》")).toBeVisible();
  await expect(
    hero.getByRole("link", { name: "Bilibili", exact: true }),
  ).toHaveAttribute(
    "href",
    "https://space.bilibili.com/25857856?spm_id_from=333.1007.0.0",
  );
  await expect(
    hero.getByRole("link", { name: "GitHub", exact: true }),
  ).toHaveAttribute("href", "https://github.com/kidrue");
  await expect(
    hero.getByRole("link", { name: "V2EX", exact: true }),
  ).toHaveAttribute("href", "https://www.v2ex.com/member/kidrue");
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).colorScheme,
    ),
  ).toBe("dark");
  await expect(page.locator("nav, header, footer")).toHaveCount(0);
  await expect(page.getByRole("article")).toHaveCount(0);
  await expect(
    page.locator("#articles, #collections, #projects, #about"),
  ).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollHeight <= innerHeight,
    ),
  ).toBe(true);
  await hero.getByRole("link", { name: "进入博客", exact: true }).click();
  await expect(page).toHaveURL(/\/blog#articles$/);
  await expect(
    page.getByRole("navigation", { name: "主导航", includeHidden: true }),
  ).toHaveCount(1);
  await expect(page.getByRole("article")).toHaveCount(localPostCount);
  await page.getByRole("link", { name: "kidrue 首页" }).first().click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("navigation")).toHaveCount(0);
});

test("同一天刷新页面沿用一言，跨日自动获取新一句", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-20T12:00:00+08:00") });
  let requests = 0;
  await page.route("https://v1.hitokoto.cn/**", (route) => {
    requests += 1;
    return route.fulfill({
      json: {
        ...hitokotoFixture,
        hitokoto:
          requests === 1 ? "今天也要保持好奇。" : "新的一天，新的故事。",
      },
    });
  });
  await page.goto("/");
  await expect(
    page.getByText("今天也要保持好奇。", { exact: true }),
  ).toBeVisible();
  expect(requests).toBe(1);
  await page.reload();
  await expect(
    page.getByText("今天也要保持好奇。", { exact: true }),
  ).toBeVisible();
  expect(requests).toBe(1);
  await page.clock.fastForward(12 * 60 * 60 * 1000 + 4000);
  await expect(
    page.getByText("新的一天，新的故事。", { exact: true }),
  ).toBeVisible();
  expect(requests).toBe(2);
});

test("一言请求失败显示小站寄语，并可重试恢复", async ({ page }) => {
  let failed = true;
  await page.route("https://v1.hitokoto.cn/**", (route) =>
    failed
      ? route.fulfill({ status: 503, body: "Service unavailable" })
      : route.fulfill({ json: hitokotoFixture }),
  );
  await page.goto("/");
  await expect(
    page
      .getByRole("figure", { name: "每日一言" })
      .getByText("保持好奇，慢慢积累。", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("小站寄语", { exact: true })).toBeVisible();
  failed = false;
  await page.getByRole("button", { name: "重试一言" }).click();
  await expect(
    page.getByText(hitokotoFixture.hitokoto, { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "重试一言" }),
  ).not.toBeVisible();
});

test("损坏的本地缓存不影响加载，非法接口响应不会成为名言", async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("kidrue:daily-hitokoto:v1", "broken-json"),
  );
  await page.route("https://v1.hitokoto.cn/**", (route) =>
    route.fulfill({ json: { hitokoto: 42, from: "bad-data" } }),
  );
  await page.goto("/");
  await expect(page.getByRole("button", { name: "重试一言" })).toBeVisible();
  await expect(
    page
      .getByRole("figure", { name: "每日一言" })
      .getByText("保持好奇，慢慢积累。", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("bad-data", { exact: true })).toHaveCount(0);
});
