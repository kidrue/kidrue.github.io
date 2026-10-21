import { expect, test as base } from "@playwright/test";

export const hitokotoFixture = {
  id: 100,
  uuid: "11111111-1111-4111-8111-111111111111",
  hitokoto: "让好奇心带你去更远的地方。",
  from: "测试语录",
  from_who: "测试作者",
};

export const test = base.extend<{ mockHitokoto: void }>({
  mockHitokoto: [
    async ({ page }, use) => {
      await page.route("**/api/articles", (route) =>
        route.fulfill({ json: { articles: [] } }),
      );
      await page.route("https://v1.hitokoto.cn/**", (route) =>
        route.fulfill({ json: hitokotoFixture }),
      );
      await use();
    },
    { auto: true },
  ],
});

export { expect };
