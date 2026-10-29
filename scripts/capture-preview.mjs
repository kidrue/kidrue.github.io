import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const url = process.argv[2] ?? "http://127.0.0.1:5174";
const browser = await chromium.launch({ channel: "chrome" });
await mkdir("artifacts", { recursive: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto(url);
    await page.locator('.daily-quote[aria-busy="false"]').waitFor();
    await page.evaluate(() =>
      Promise.race([
        document.fonts.ready,
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ]),
    );
    await page.screenshot({
      path: `artifacts/home-${width}.png`,
      fullPage: true,
    });
    const layout = await page.evaluate(() => ({
      width: innerWidth,
      height: innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      contentSections: document.querySelectorAll(
        "header, nav, #articles, #collections, #projects, footer",
      ).length,
      imageLoaded: document.querySelector(".avatar-frame img").naturalWidth > 0,
    }));
    if (
      layout.scrollWidth > layout.width ||
      layout.scrollHeight > layout.height ||
      layout.contentSections ||
      !layout.imageLoaded
    )
      throw new Error(`布局检查失败：${JSON.stringify(layout)}`);
    console.log(JSON.stringify(layout));
    await page.goto(new URL("/blog", url).href);
    await page.getByRole("heading", { name: "最近，写了这些。" }).waitFor();
    await page.screenshot({
      path: `artifacts/blog-${width}.png`,
      fullPage: true,
    });
    const blog = await page.evaluate(() => ({
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      cards: document.querySelectorAll("article").length,
      columns: document.querySelector(".posts-grid")
        ? getComputedStyle(document.querySelector(".posts-grid"))
            .gridTemplateColumns
        : "timeline",
    }));
    if (blog.scrollWidth > blog.width || blog.cards < 6)
      throw new Error(`博客布局检查失败：${JSON.stringify(blog)}`);
    console.log(JSON.stringify(blog));
    await page.locator("#articles").screenshot({
      path: `artifacts/articles-${width}.png`,
      style: ".site-header, .skip-link, .back-to-top { visibility: hidden; }",
    });
    await page.goto(new URL("/quotes", url).href);
    await page
      .getByRole("heading", { level: 1, name: "喜欢的一句话。" })
      .waitFor();
    await page.locator("#quote-list").screenshot({
      path: `artifacts/quotes-${width}.png`,
      style: ".site-header, .skip-link, .back-to-top { visibility: hidden; }",
    });
    await page.goto(new URL("/projects", url).href);
    await page.getByRole("heading", { level: 1, name: "我的项目。" }).waitFor();
    await page.locator("#project-list").screenshot({
      path: `artifacts/projects-${width}.png`,
      style: ".site-header, .skip-link, .back-to-top { visibility: hidden; }",
    });
    await page.goto(new URL("/interests", url).href);
    await page.getByRole("heading", { level: 1, name: "我的兴趣。" }).waitFor();
    await page.locator("#collections").scrollIntoViewIfNeeded();
    await page.screenshot({
      path: `artifacts/collections-${width}.png`,
    });
    await page.getByRole("button", { name: "收藏的手办", exact: true }).click();
    await page.locator("#collections").screenshot({
      path: `artifacts/figures-${width}.png`,
      style: ".site-header, .skip-link, .back-to-top { visibility: hidden; }",
    });
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  const motion = await page.evaluate(
    () => getComputedStyle(document.documentElement).scrollBehavior,
  );
  if (motion !== "auto") throw new Error("减少动态效果偏好未生效");
  if (errors.length) throw new Error(errors.join("\n"));
  console.log("三种宽度检查、头像加载、减少动态效果和页面运行时错误检查通过。");
} finally {
  await browser.close();
}
