import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { setTimeout } from "node:timers/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { load } from "cheerio";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { parse, stringify } from "yaml";

const root = fileURLToPath(new URL("../", import.meta.url));
const blog = "https://blog.csdn.net/weixin_43295106";
const cache = join(root, "artifacts/csdn-source");
const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
  Referer: blog,
};

export function authorProvidedArticle(markdown, sourceUrl) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return null;
  const metadata = parse(match[1]);
  if (
    metadata?.contentOrigin !== "author-provided" ||
    metadata.sourceUrl !== sourceUrl ||
    !match[2].trim()
  )
    return null;
  return { metadata, body: match[2] };
}

export function convertCsdnArticle(html, listing) {
  if (/\bisVipArticle\s*=\s*true\b/.test(html))
    throw new Error("VIP 文章的公开正文可能被截断，需作者导出完整内容");
  const $ = load(html);
  const content = $("#content_views");
  const title = $("#articleContentId").text().trim();
  const createdAt =
    $("meta[property='article:published_time']").attr("content") ??
    `${listing.date.replace(" ", "T")}+08:00`;
  const updatedAt = $("meta[property='article:modified_time']").attr("content");
  if (!title || !content.length || !Number.isFinite(Date.parse(createdAt)))
    throw new Error("缺少文章标题、正文或原始发布时间");
  const sourceCategories = [
    ...new Set(
      $(".column-detail-name-link, .article-info-box a[href*='/category_']")
        .map((_, node) => $(node).text().trim())
        .get()
        .filter(Boolean),
    ),
  ];
  const sourceTags = [
    ...new Set(
      $("a[href*='so.csdn.net/so/search']")
        .map((_, node) => $(node).text().trim().replace(/^#/, ""))
        .get()
        .filter(Boolean),
    ),
  ];
  content
    .find(
      "script, style, svg[style*='display: none'], .hljs-button, .code-copy, .pre-numbering",
    )
    .remove();
  const images = new Set();
  content.find("img").each((_, node) => {
    const image = $(node);
    const src = image.attr("data-src") || image.attr("src");
    if (!src) throw new Error("正文图片缺少地址");
    const url = new URL(src, listing.url).href;
    image.attr("src", url);
    images.add(url);
  });
  content.find("a[href]").each((_, node) => {
    const link = $(node);
    const href = link.attr("href");
    if (!href || href.startsWith("#")) return;
    const url = new URL(href, listing.url);
    link.attr(
      "href",
      url.hostname === "link.csdn.net" && url.searchParams.has("target")
        ? url.searchParams.get("target")
        : url.href,
    );
  });
  const converter = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
  });
  converter.use(gfm);
  converter.addRule("sourceCode", {
    filter: "pre",
    replacement: (_, node) => {
      const code = node.querySelector("code") ?? node;
      const text = code.textContent.replace(/\r\n/g, "\n").replace(/\n$/, "");
      const language =
        code.className.match(/language-([\w+-]+)/)?.[1]?.toLowerCase() ?? "";
      const fence = "`".repeat(
        Math.max(
          3,
          ...Array.from(text.matchAll(/`+/g), (match) => match[0].length + 1),
        ),
      );
      return `\n\n${fence}${language}\n${text}\n${fence}\n\n`;
    },
  });
  const body = converter.turndown(content.html()).trim() + "\n";
  if (!body.trim()) throw new Error("正文为空");
  const summary = content.clone();
  summary.find("pre, table").remove();
  return {
    metadata: {
      id: `csdn-${new URL(listing.url).pathname.split("/").at(-1)}`,
      title,
      author: $("meta[property='article:author']").attr("content") ?? "kidrue",
      date: createdAt.slice(0, 10),
      createdAt,
      ...(updatedAt ? { updatedAt } : {}),
      category: "技术",
      tags: [...new Set([...sourceCategories, ...sourceTags])],
      description: (summary.text().replace(/\s+/g, " ").trim() || title).slice(
        0,
        160,
      ),
      source: "CSDN",
      sourceUrl: listing.url,
      sourceType: listing.type,
      sourceCategories,
      sourceTags,
    },
    body,
    images: [...images],
  };
}

async function get(url) {
  await setTimeout(6500);
  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`下载失败 HTTP ${response.status}`);
  return response;
}

async function page(url, filename) {
  if (!process.argv.includes("--refresh")) {
    const saved = await readFile(join(cache, filename), "utf8").catch(() => "");
    if (saved && !saved.includes('window.onload=setTimeout("jv(')) return saved;
  }
  const html = await (await get(url)).text();
  await writeFile(join(cache, filename), html);
  return html;
}

async function importBlog() {
  await mkdir(cache, { recursive: true });
  const articles = new Map();
  let expectedCount;
  for (let number = 1; ; number++) {
    const html = await page(
      `${blog}/article/list/${number}`,
      `list${number}.html`,
    );
    const $ = load(html);
    if (number === 1)
      expectedCount = Number(
        $("body")
          .text()
          .match(/博客\s*\((\d+)\)/)?.[1],
      );
    if (!expectedCount) throw new Error("无法核对原站文章总数");
    const items = $(".article-item-box");
    if (!items.length) break;
    items.each((_, node) => {
      const item = $(node);
      const link = item.find("h4 a");
      const url = link.attr("href");
      if (!url?.startsWith(`${blog}/article/details/`)) return;
      const title = link.clone();
      title.find(".article-type").remove();
      articles.set(url, {
        url,
        title: title.text().trim(),
        date: item.find(".date").text().trim(),
        type: item.find(".article-type").text().trim(),
      });
    });
    if (articles.size >= expectedCount) break;
    if (number > 100) throw new Error("分页异常");
  }
  if (articles.size !== expectedCount)
    throw new Error(`目录不完整：${articles.size}/${expectedCount}`);
  const report = {
    source: blog,
    importedAt: new Date().toISOString(),
    expectedCount,
    importedCount: 0,
    imageCount: 0,
    articles: [],
    pending: [],
    images: {},
  };
  const contentDirectory = join(root, "apps/web/src/content/posts");
  const imageDirectory = join(root, "apps/web/public/images/posts/csdn");
  await mkdir(contentDirectory, { recursive: true });
  await mkdir(imageDirectory, { recursive: true });
  const previousReport = JSON.parse(
    await readFile(join(root, "docs/csdn-import.json"), "utf8").catch(
      (error) => {
        if (error.code === "ENOENT") return "{}";
        throw error;
      },
    ),
  );
  for (const listing of articles.values()) {
    try {
      const id = listing.url.split("/").at(-1);
      const file = `apps/web/src/content/posts/${listing.date.slice(0, 10)}-csdn-${id}.md`;
      const existing = await readFile(join(root, file), "utf8").catch(
        (error) => {
          if (error.code === "ENOENT") return "";
          throw error;
        },
      );
      const supplied = authorProvidedArticle(existing, listing.url);
      if (supplied) {
        report.articles.push({ ...supplied.metadata, file });
        for (const [source, local] of Object.entries(
          previousReport.images ?? {},
        )) {
          if (supplied.body.includes(local)) report.images[source] = local;
        }
        console.log(`保留作者完整正文 ${supplied.metadata.title}`);
        continue;
      }
      const html = await page(listing.url, `${id}.html`);
      const article = convertCsdnArticle(html, listing);
      for (const image of article.images) {
        if (!report.images[image]) {
          const response = await get(image);
          const type = response.headers.get("content-type")?.split(";")[0];
          const extension = {
            "image/png": "png",
            "image/jpeg": "jpg",
            "image/gif": "gif",
            "image/webp": "webp",
            "image/svg+xml": "svg",
            "image/avif": "avif",
          }[type];
          if (!extension) throw new Error(`图片格式不正确：${image}`);
          const bytes = Buffer.from(await response.arrayBuffer());
          const name = `${createHash("sha256").update(bytes).digest("hex").slice(0, 16)}.${extension}`;
          await writeFile(join(imageDirectory, name), bytes);
          report.images[image] = `/images/posts/csdn/${name}`;
        }
        article.body = article.body.replaceAll(image, report.images[image]);
      }
      const outputFile = `apps/web/src/content/posts/${article.metadata.date}-csdn-${id}.md`;
      await writeFile(
        join(root, outputFile),
        `---\n${stringify(article.metadata, { lineWidth: 0 })}---\n\n${article.body}`,
      );
      report.articles.push({ ...article.metadata, file: outputFile });
      console.log(`已导入 ${article.metadata.title}`);
    } catch (error) {
      report.pending.push({ ...listing, reason: error.message });
      console.log(`待补全 ${listing.title}：${error.message}`);
    }
  }
  report.importedCount = report.articles.length;
  report.imageCount = new Set(Object.values(report.images)).size;
  await writeFile(
    join(root, "docs/csdn-import.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(
    `已导入 ${report.importedCount}/${expectedCount} 篇，${report.imageCount} 张图片，待补全 ${report.pending.length} 篇。`,
  );
  if (report.pending.length) process.exitCode = 1;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
)
  await importBlog();
