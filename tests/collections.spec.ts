import { expect, test, localAnimeCount } from "./fixtures";

test("兴趣收藏可以切换动漫和手办，并显示对应记录", async ({ page }) => {
  await page.goto("/interests");
  const section = page.getByRole("region", { name: "兴趣，认真收藏。" });
  await expect(section.getByRole("listitem")).toHaveCount(localAnimeCount);
  await expect(
    section.getByRole("heading", { name: "刀剑神域（第 1、2 季）" }),
  ).toBeVisible();
  await section
    .getByRole("button", { name: "收藏的手办", exact: true })
    .click();
  await expect(section.getByRole("listitem")).toHaveCount(3);
  await expect(
    section.getByRole("heading", { name: "魔女旅人" }),
  ).toBeVisible();
  await expect(
    section.getByRole("heading", { name: "刀剑神域（第 1、2 季）" }),
  ).toHaveCount(0);
  await section.getByRole("button", { name: "番剧记录", exact: true }).click();
  await expect(
    section.getByRole("heading", { name: "刀剑神域（第 1、2 季）" }),
  ).toBeVisible();
  await expect(section.getByRole("heading", { name: "魔女旅人" })).toHaveCount(
    0,
  );
});

test("动漫和手办记录可展开详情，切换分类后恢复收起", async ({ page }) => {
  await page.goto("/interests");
  const section = page.getByRole("region", { name: "兴趣，认真收藏。" });
  const firstRecord = section.getByRole("listitem").filter({
    has: page.getByRole("heading", {
      name: "刀剑神域（第 1、2 季）",
      exact: true,
    }),
  });
  await firstRecord
    .getByLabel("查看观后感：刀剑神域（第 1、2 季）", { exact: true })
    .click();
  await expect(
    firstRecord.getByText(
      "看过第 1、2 季，合并为一条观看记录；封面使用第 1 季海报。",
    ),
  ).toBeVisible();
  await section
    .getByRole("button", { name: "收藏的手办", exact: true })
    .click();
  await section
    .getByRole("listitem")
    .first()
    .getByText("查看收藏记录", { exact: true })
    .click();
  await expect(
    section.getByText(
      "这里可以记录入手时间、收藏故事与展示方式，之后配上自己的实拍照片。",
    ),
  ).toBeVisible();
  await section.getByRole("button", { name: "番剧记录", exact: true }).click();
  await expect(
    firstRecord.getByText(
      "看过第 1、2 季，合并为一条观看记录；封面使用第 1 季海报。",
    ),
  ).not.toBeVisible();
});

test("开发项目区展示真实本站和明确标注的示例，项目说明可展开", async ({
  page,
}) => {
  await page.goto("/blog#projects");
  const section = page.getByRole("region", { name: "把想法，做成作品。" });
  await expect(section.getByRole("listitem")).toHaveCount(3);
  await expect(
    section.getByRole("heading", { name: "kidrue 个人博客" }),
  ).toBeVisible();
  await expect(section.getByText("示例项目", { exact: true })).toHaveCount(2);
  const blog = section.getByRole("listitem").first();
  await blog.getByText("开发记录", { exact: true }).click();
  await expect(
    blog.getByText(
      "从首页原型开始，逐步加入文章阅读、动漫与手办收藏，以及项目展示。",
    ),
  ).toBeVisible();
  await blog.getByRole("link", { name: "浏览本站" }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("兴趣有独立导航与页面，跨页导航和窄屏菜单正常", async ({
  page,
}, testInfo) => {
  await page.goto("/blog");
  const nav = page.getByRole("navigation", { name: "主导航" });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "记录代码，也收藏日常。",
  );
  await expect(page.locator("#collections")).toHaveCount(0);
  for (const [name, url] of [
    ["兴趣", /\/interests$/],
    ["项目", /\/blog#projects$/],
  ] as const) {
    if (testInfo.project.name === "mobile")
      await page.getByRole("button", { name: "打开导航菜单" }).click();
    await nav.getByRole("link", { name: new RegExp(name) }).click();
    await expect(page).toHaveURL(url);
    if (name === "兴趣") {
      await expect(
        page.getByRole("link", { name: /^兴趣/, includeHidden: true }),
      ).toHaveAttribute("aria-current", "page");
      await expect(
        page.getByRole("list", { name: "番剧记录" }).getByRole("listitem"),
      ).toHaveCount(localAnimeCount);
      await expect(page.locator("#articles, #projects, #about")).toHaveCount(0);
      await page.reload();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "我的兴趣。",
      );
      await expect(
        page.getByRole("list", { name: "番剧记录" }).getByRole("listitem"),
      ).toHaveCount(localAnimeCount);
      await page.screenshot({ path: testInfo.outputPath("interests.png") });
    } else {
      await expect(
        page.getByRole("heading", { name: "把想法，做成作品。" }),
      ).toBeInViewport();
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (testInfo.project.name === "mobile")
      await expect(
        page.getByRole("button", { name: "打开导航菜单" }),
      ).toHaveAttribute("aria-expanded", "false");
  }
  for (const width of [641, 768, 1024]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(nav).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("旧收藏链接跳转到兴趣页，直接访问与返回文章正常", async ({
  page,
}, testInfo) => {
  await page.goto("/blog#collections");
  await expect(page).toHaveURL(/\/interests$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "我的兴趣。",
  );
  await page.goto("/interests/");
  await expect(
    page.getByRole("list", { name: "番剧记录" }).getByRole("listitem"),
  ).toHaveCount(localAnimeCount);
  if (testInfo.project.name === "mobile")
    await page.getByRole("button", { name: "打开导航菜单" }).click();
  await page
    .getByRole("navigation", { name: "主导航" })
    .getByRole("link", { name: /文章/ })
    .click();
  await expect(page).toHaveURL(/\/blog#articles$/);
  await expect(
    page.getByRole("heading", { name: "最近，写了这些。" }),
  ).toBeInViewport();
  await expect(page.locator("#collections")).toHaveCount(0);
  await page.evaluate(() => {
    window.location.hash = "collections";
  });
  await expect(page).toHaveURL(/\/interests$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "我的兴趣。",
  );
});
