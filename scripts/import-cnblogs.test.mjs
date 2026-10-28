import assert from "node:assert/strict";
import test from "node:test";
import { convertArticle } from "./import-cnblogs.mjs";

test("导入以正文发布时间为准，保留更新时间、代码与原站分类", () => {
  const html = `<script type="application/ld+json">{"datePublished":"2022-12-30T16:06:00+08:00"}</script>
    <h1><a id="cb_post_title_url">循环依赖</a></h1>
    <div id="cnblogs_post_body"><pre><code class="language-TypeScript">const a = &lt;T&gt;(value: T) =&gt; value;\n</code></pre>
    <img src="https://img2023.cnblogs.com/example.png"></div>
    <span id="post-date" data-date-updated="2022-12-30 16:06">2022-12-30 16:05</span>`;
  const article = convertArticle(
    html,
    "https://www.cnblogs.com/Kidrue/p/17015145.html",
    '<div id="BlogPostCategory"><a>踩坑记录</a></div>',
  );
  assert.equal(article.metadata.createdAt, "2022-12-30T16:05:00+08:00");
  assert.equal(article.metadata.updatedAt, "2022-12-30T16:06:00+08:00");
  assert.deepEqual(article.metadata.sourceCategories, ["踩坑记录"]);
  assert.match(
    article.body,
    /```typescript\nconst a = <T>\(value: T\) => value;/,
  );
  assert.deepEqual(article.images, ["https://img2023.cnblogs.com/example.png"]);
});

test("Vue 模板示例转为代码块，不丢失 HTML 或误下载示例资源", () => {
  const html = `<a id="cb_post_title_url">Vue 示例</a><div id="cnblogs_post_body"><template><img src="../assets/logo.png"><h1>{{ $route.params }}</h1></template></div><span id="post-date">2021-06-15 17:45</span>`;
  const article = convertArticle(
    html,
    "https://www.cnblogs.com/Kidrue/p/14886471.html",
    "",
  );
  assert.match(article.body, /```html\n<template>/);
  assert.match(article.body, /\{\{ \$route.params \}\}/);
  assert.match(article.body, /src="\.\.\/assets\/logo.png"/);
  assert.deepEqual(article.images, []);
  assert.equal(article.metadata.updatedAt, undefined);
});
