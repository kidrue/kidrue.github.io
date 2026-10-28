import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { load } from "cheerio";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { stringify } from "yaml";

const blog = "https://www.cnblogs.com/Kidrue";
const root = fileURLToPath(new URL("../", import.meta.url));
const articlePath = /^\/Kidrue\/(p|articles)\/(\d+)\.html$/i;

function timestamp(value) {
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(value))
    throw new Error(`原站日期格式不正确：${value}`);
  return `${value.replace(" ", "T")}:00+08:00`;
}

export function convertArticle(html, sourceUrl, taxonomyHtml) {
  const $ = load(html);
  const body = $("#cnblogs_post_body");
  const title = $("#cb_post_title_url").text().trim();
  const createdAt = timestamp($("#post-date").text().trim());
  const updated = $("#post-date").attr("data-date-updated");
  const match = new URL(sourceUrl).pathname.match(articlePath);
  if (!title || !body.length || !match)
    throw new Error(`无法提取文章：${sourceUrl}`);
  const taxonomy = load(taxonomyHtml);
  const sourceCategories = taxonomy("#BlogPostCategory a")
    .map((_, node) => taxonomy(node).text().trim())
    .get();
  const sourceTags = taxonomy(
    "#EntryTag a[rel='tag'], #EntryTag a[href*='/tag/']",
  )
    .map((_, node) => taxonomy(node).text().trim())
    .get();

  // 早期文章把 Vue 示例直接写成 HTML；保留为代码，避免被 Markdown 渲染器丢弃。
  body.find("template, router-link, .copy").each((_, node) => {
    const code = $("<code>").attr("class", "language-html").text($.html(node));
    $(node).replaceWith($("<pre>").append(code));
  });
  body.find("script, style").remove();
  const images = new Set();
  body.find("img").each((_, node) => {
    const src = $(node).attr("src");
    if (!src) throw new Error(`图片缺少地址：${sourceUrl}`);
    const absolute = new URL(src, sourceUrl).href;
    images.add(absolute);
    $(node).attr("src", absolute);
  });
  body.find("a[href]").each((_, node) => {
    const href = $(node).attr("href");
    if (href && !href.startsWith("#"))
      $(node).attr("href", new URL(href, sourceUrl).href);
  });
  const converter = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
  });
  converter.use(gfm);
  converter.addRule("preserveCode", {
    filter: "pre",
    replacement: (_, node) => {
      const code = node.querySelector("code") ?? node;
      const language =
        code.className.match(/language-([\w+-]+)/)?.[1]?.toLowerCase() ?? "";
      const text = code.textContent.replace(/\r\n/g, "\n").replace(/\n$/, "");
      const fence = "`".repeat(
        Math.max(
          3,
          ...Array.from(text.matchAll(/`+/g), (match) => match[0].length + 1),
        ),
      );
      return `\n\n${fence}${language}\n${text}\n${fence}\n\n`;
    },
  });
  const markdown = converter.turndown(body.html()).trim() + "\n";
  if (!markdown.trim()) throw new Error(`文章正文为空：${sourceUrl}`);
  const summary = body.clone();
  summary.find("pre").remove();
  const description = (
    summary.text().replace(/\s+/g, " ").trim() || title
  ).slice(0, 160);
  return {
    metadata: {
      id: `cnblogs-${match[2]}`,
      title,
      author: "kidrue",
      date: createdAt.slice(0, 10),
      createdAt,
      ...(updated ? { updatedAt: timestamp(updated) } : {}),
      category: sourceCategories.includes("追番记录") ? "生活" : "技术",
      tags: [...new Set([...sourceCategories, ...sourceTags])],
      description,
      source: "博客园",
      sourceUrl,
      sourceType: match[1] === "p" ? "随笔" : "文章",
      sourceCategories,
      sourceTags,
    },
    body: markdown,
    images: [...images],
  };
}

async function get(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`下载失败 ${response.status}：${url}`);
  return response;
}

async function importBlog() {
  const stats = load(await (await get(`${blog}/ajax/blogStats`)).text());
  const expected = ["#stats_post_count", "#stats_article_count"].reduce(
    (count, selector) =>
      count + Number(stats(selector).text().match(/\d+/)?.[0]),
    0,
  );
  if (!expected) throw new Error("无法读取原站文章总数");
  const sidebar = load(
    await (await get(`${blog}/ajax/sidecolumn.aspx`)).text(),
  );
  const queue = [
    blog,
    ...sidebar("#sidebar_articlearchive a")
      .map((_, node) => sidebar(node).attr("href"))
      .get(),
  ];
  const visited = new Set();
  const urls = new Set();
  while (queue.length) {
    const url = queue.shift();
    if (visited.has(url)) continue;
    visited.add(url);
    const $ = load(await (await get(url)).text());
    $("a[href]").each((_, node) => {
      const target = new URL($(node).attr("href"), url);
      if (target.origin !== new URL(blog).origin) return;
      if (articlePath.test(target.pathname)) urls.add(target.href);
      if ($(node).text().trim() === "下一页") queue.push(target.href);
    });
  }
  if (urls.size !== expected)
    throw new Error(`目录不完整：原站 ${expected} 篇，发现 ${urls.size} 篇`);

  const contentDirectory = join(root, "apps/web/src/content/posts");
  const imageDirectory = join(root, "apps/web/public/images/posts/cnblogs");
  const sourceDirectory = join(root, "artifacts/cnblogs-source");
  for (const directory of [contentDirectory, imageDirectory, sourceDirectory])
    await mkdir(directory, { recursive: true });
  const assets = new Map();
  const articles = [];
  for (const url of urls) {
    const id = new URL(url).pathname.match(articlePath)[2];
    const html = await (await get(url)).text();
    const blogId = html.match(/\bcb_blogId\s*=\s*(\d+)/)?.[1];
    if (!blogId) throw new Error(`无法读取博客标识：${url}`);
    const taxonomy = await (
      await get(
        `${blog}/ajax/CategoriesTags.aspx?blogId=${blogId}&postId=${id}`,
      )
    ).text();
    await writeFile(join(sourceDirectory, `${id}.html`), html);
    await writeFile(join(sourceDirectory, `${id}-taxonomy.html`), taxonomy);
    const article = convertArticle(html, url, taxonomy);
    for (const image of article.images) {
      if (!assets.has(image)) {
        const response = await get(image);
        if (!response.headers.get("content-type")?.startsWith("image/"))
          throw new Error(`图片地址返回非图片内容：${image}`);
        const bytes = Buffer.from(await response.arrayBuffer());
        const extension = extname(new URL(image).pathname).toLowerCase();
        if (!/^\.(png|jpg|jpeg|gif|webp|svg|avif)$/.test(extension))
          throw new Error(`无法识别图片扩展名：${image}`);
        const name = `${createHash("sha256").update(bytes).digest("hex").slice(0, 16)}${extension}`;
        await writeFile(join(imageDirectory, name), bytes);
        assets.set(image, `/images/posts/cnblogs/${name}`);
      }
      article.body = article.body.replaceAll(image, assets.get(image));
    }
    const filename = `${article.metadata.date}-${id}.md`;
    await writeFile(
      join(contentDirectory, filename),
      `---\n${stringify(article.metadata, { lineWidth: 0 })}---\n\n${article.body}`,
    );
    articles.push({
      ...article.metadata,
      file: `apps/web/src/content/posts/${filename}`,
    });
    console.log(
      `已导入 ${articles.length}/${expected}：${article.metadata.title}`,
    );
  }
  articles.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const report = {
    source: blog,
    importedAt: new Date().toISOString(),
    expectedCount: expected,
    importedCount: articles.length,
    imageCount: assets.size,
    articles,
    images: Object.fromEntries(assets),
  };
  const reportPath = join(root, "docs/cnblogs-import.json");
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, JSON.stringify(report, null, 2) + "\n");
  console.log(`完成：${articles.length} 篇文章，${assets.size} 张图片。`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
)
  await importBlog();
