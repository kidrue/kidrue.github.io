import { expect, test } from "./fixtures";

test("兴趣收藏可以切换动漫和手办，并显示对应记录", async ({ page }) => {
  await page.goto("/blog#collections");
  const section = page.getByRole("region", { name: "兴趣，认真收藏。" });
  await expect(section.getByRole("listitem")).toHaveCount(8);
  await expect(
    section.getByRole("heading", { name: "葬送的芙莉莲" }),
  ).toBeVisible();
  await section
    .getByRole("button", { name: "收藏的手办", exact: true })
    .click();
  await expect(section.getByRole("listitem")).toHaveCount(3);
  await expect(
    section.getByRole("heading", { name: "魔女旅人" }),
  ).toBeVisible();
  await expect(
    section.getByRole("heading", { name: "葬送的芙莉莲" }),
  ).toHaveCount(0);
  await section.getByRole("button", { name: "番剧记录", exact: true }).click();
  await expect(
    section.getByRole("heading", { name: "葬送的芙莉莲" }),
  ).toBeVisible();
  await expect(section.getByRole("heading", { name: "魔女旅人" })).toHaveCount(
    0,
  );
});

test("动漫和手办记录可展开详情，切换分类后恢复收起", async ({ page }) => {
  await page.goto("/blog#collections");
  const section = page.getByRole("region", { name: "兴趣，认真收藏。" });
  const firstRecord = section.getByRole("listitem").first();
  await firstRecord
    .getByLabel("查看观后感：葬送的芙莉莲", { exact: true })
    .click();
  await expect(
    firstRecord.getByText(
      "这里可以写下观后感、喜欢的角色，以及想要重温的片段。",
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
      "这里可以写下观后感、喜欢的角色，以及想要重温的片段。",
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

test("导航可以到达收藏和项目，窄屏展开菜单无溢出", async ({
  page,
}, testInfo) => {
  await page.goto("/blog");
  const nav = page.getByRole("navigation", { name: "主导航" });
  for (const [name, hash] of [
    ["收藏", "collections"],
    ["项目", "projects"],
  ]) {
    if (testInfo.project.name === "mobile")
      await page.getByRole("button", { name: "打开导航菜单" }).click();
    await nav.getByRole("link", { name: new RegExp(name) }).click();
    await expect(page).toHaveURL(new RegExp(`#${hash}$`));
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
