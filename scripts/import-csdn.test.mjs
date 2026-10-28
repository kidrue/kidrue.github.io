import assert from "node:assert/strict";
import test from "node:test";
import { convertCsdnArticle, authorProvidedArticle } from "./import-csdn.mjs";

test("重新导入时保留作者提供的完整正文，普通归档仍按原站处理", () => {
  const markdown =
    "---\nid: csdn-129662309\nsourceUrl: https://blog.csdn.net/weixin_43295106/article/details/129662309\ncontentOrigin: author-provided\n---\n\n完整正文\n";
  const url = "https://blog.csdn.net/weixin_43295106/article/details/129662309";
  assert.equal(authorProvidedArticle(markdown, url).body.trim(), "完整正文");
  assert.equal(
    authorProvidedArticle(
      markdown.replace("author-provided", "public-page"),
      url,
    ),
    null,
  );
  assert.equal(
    authorProvidedArticle(markdown, "https://example.com/another"),
    null,
  );
});

const listing = {
  url: "https://blog.csdn.net/weixin_43295106/article/details/126420448",
  title: "Todo规范",
  date: "2022-08-19 11:00:05",
  type: "原创",
};
const html = `<meta property="article:published_time" content="2022-08-19T11:00:05+08:00">
<meta property="article:modified_time" content="2022-08-19T13:23:31+08:00">
<meta property="article:author" content="kidrue">
<h1 id="articleContentId">Todo规范</h1><span class="blog-postTime">最新推荐文章于 2026-10-27 发布</span>
<a class="column-detail-name-link">代码规范</a><a href="https://so.csdn.net/so/search?q=typescript">#typescript</a>
<div id="content_views"><pre><code class="prism language-typescript">const a = <span class="token number">1</span>;\n</code></pre><table><thead><tr><th>名称</th></tr></thead><tbody><tr><td>FIXME</td></tr></tbody></table><img src="https://i-blog.csdnimg.cn/a.png"></div>`;

test("CSDN 使用原始日期，保留代码、表格和分类，不混入推荐时间", () => {
  const article = convertCsdnArticle(html, listing);
  assert.equal(article.metadata.createdAt, "2022-08-19T11:00:05+08:00");
  assert.equal(article.metadata.updatedAt, "2022-08-19T13:23:31+08:00");
  assert.deepEqual(article.metadata.tags, ["代码规范", "typescript"]);
  assert.match(article.body, /```typescript\nconst a = 1;/);
  assert.match(article.body, /\| FIXME \|/);
  assert.deepEqual(article.images, ["https://i-blog.csdnimg.cn/a.png"]);
});

test("VIP 截断内容不能作为完整文章导入", () => {
  assert.throws(
    () =>
      convertCsdnArticle(
        `${html}<script>var isVipArticle = true;</script>`,
        listing,
      ),
    /VIP/,
  );
});

test("转载文章保留转载标记与正文中的原作者链接", () => {
  const article = convertCsdnArticle(
    html.replace(
      "</div>",
      '<p><a href="https://example.com/original">原文</a></p></div>',
    ),
    { ...listing, type: "转载" },
  );
  assert.equal(article.metadata.sourceType, "转载");
  assert.match(article.body, /\[原文\]\(https:\/\/example.com\/original\)/);
});
