import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";

const browser = await chromium.launch({ channel: "chrome" });
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  const url = process.argv[2] ?? "http://127.0.0.1:5174";
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(url, {
      waitUntil: "domcontentloaded",
    });
    await page.getByRole("heading", { level: 1 }).waitFor();
    for (const state of [
      "入口页",
      "博客首页",
      "阅读弹窗",
      "兴趣页",
      "手办收藏详情",
      "项目详情",
      "一句话页",
      "搜索无结果",
    ]) {
      if (state === "博客首页") {
        await page.goto(new URL("/blog", url).href);
        await page.getByRole("heading", { level: 1 }).waitFor();
      }
      if (state === "阅读弹窗") {
        await page
          .getByRole("button", { name: /^阅读：/ })
          .first()
          .click();
        await page.locator("dialog .markdown-content").waitFor();
      }
      if (state === "兴趣页") {
        await page.goto(new URL("/interests", url).href);
        await page.getByRole("heading", { level: 1 }).waitFor();
      }
      if (state === "手办收藏详情") {
        await page
          .getByRole("button", { name: "收藏的手办", exact: true })
          .click();
        await page.locator("#collections summary").first().click();
      }
      if (state === "项目详情") {
        await page.goto(new URL("/projects", url).href);
        await page.locator("#project-list summary").first().click();
      }
      if (state === "搜索无结果") {
        await page.goto(new URL("/blog", url).href);
        await page
          .getByRole("searchbox", { name: "搜索文章" })
          .fill("没有匹配的文章关键词");
      }
      if (state === "一句话页") {
        await page.goto(new URL("/quotes", url).href);
        await page.getByRole("heading", { level: 1 }).waitFor();
      }
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      console.log(
        JSON.stringify({
          width,
          state,
          violations: results.violations.map((violation) => ({
            id: violation.id,
            impact: violation.impact,
            elements: violation.nodes.map((node) => ({
              target: node.target,
              summary: node.failureSummary,
            })),
          })),
        }),
      );
      if (results.violations.length) process.exitCode = 1;
      if (state === "阅读弹窗") await page.keyboard.press("Escape");
    }
  }
} finally {
  await browser.close();
}
