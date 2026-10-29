import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const baseUrl = process.argv[2] ?? "http://127.0.0.1:4173";
const output = resolve(
  process.argv[3] ?? "artifacts/navigation-performance.json",
);
const browser = await chromium.launch({ channel: "chrome" });
const samples = [];
try {
  for (const width of [1440, 390]) {
    for (let run = 0; run < 3; run++) {
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
      });
      const page = await context.newPage();
      let documents = 0;
      let apiRequests = 0;
      page.on("request", (request) => {
        if (request.resourceType() === "document") documents++;
        if (new URL(request.url()).pathname.startsWith("/api/")) apiRequests++;
      });
      await page.goto(new URL("/blog", baseUrl).href);
      await page.getByRole("heading", { level: 1 }).waitFor();
      await page.evaluate(() => document.fonts.ready);
      const startDocuments = documents;
      for (const [index, name] of [
        "兴趣",
        "项目",
        "文章",
        "兴趣",
        "项目",
      ].entries()) {
        if (width === 390)
          await page.getByRole("button", { name: "打开导航菜单" }).click();
        const link = page
          .getByRole("navigation", { name: "主导航" })
          .getByRole("link", { name: new RegExp(`^${name}`) });
        const began = performance.now();
        await link.click();
        const heading = {
          兴趣: "我的兴趣。",
          项目: "我的项目。",
          文章: "记录代码，也收藏日常。",
        }[name];
        await page.getByRole("heading", { level: 1, name: heading }).waitFor();
        if (name === "兴趣")
          await page
            .locator("#collections .timeline-item")
            .last()
            .waitFor({ state: "attached" });
        await page.evaluate(
          () => new Promise((resolve) => requestAnimationFrame(resolve)),
        );
        samples.push({
          width,
          run,
          target: name,
          phase: index < 2 ? "first" : "repeat",
          ms: Math.round(performance.now() - began),
        });
      }
      samples.push({
        width,
        run,
        extraDocuments: documents - startDocuments,
        apiRequests,
      });
      await context.close();
    }
  }
} finally {
  await browser.close();
}

const medians = [];
for (const width of [1440, 390]) {
  for (const phase of ["first", "repeat"]) {
    const values = samples
      .filter((sample) => sample.width === width && sample.phase === phase)
      .map((sample) => sample.ms)
      .sort((a, b) => a - b);
    const middle = Math.floor(values.length / 2);
    const medianMs =
      values.length % 2
        ? values[middle]
        : (values[middle - 1] + values[middle]) / 2;
    medians.push({ width, phase, medianMs });
  }
}
const report = {
  baseUrl,
  measuredAt: new Date().toISOString(),
  medians,
  samples,
};
await mkdir(dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(
  JSON.stringify(
    {
      medians,
      requests: samples.filter((sample) => sample.extraDocuments !== undefined),
      output,
    },
    null,
    2,
  ),
);
