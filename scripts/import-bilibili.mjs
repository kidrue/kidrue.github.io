import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const sourceUrl = "https://space.bilibili.com/25857856/bangumi";
const statuses = { 1: "想看", 2: "在看", 3: "看过" };

export async function collectBangumi(loadPage) {
  const entries = new Map();
  let total;
  for (let pn = 1; pn <= 1000; pn++) {
    const response = await loadPage(pn);
    if (response.code !== 0)
      throw new Error(`Bilibili ${response.code}: ${response.message}`);
    const data = response.data;
    if (
      !Number.isSafeInteger(data?.total) ||
      data.total < 0 ||
      !Array.isArray(data.list)
    )
      throw new Error("Bilibili 返回的列表格式不正确");
    if (total !== undefined && data.total !== total)
      throw new Error("读取期间追番总数发生变化，请重新导入");
    total = data.total;
    if (!total) return [];
    if (!data.list.length) throw new Error(`第 ${pn} 页为空，尚未读完全部记录`);
    const previousSize = entries.size;
    for (const entry of data.list) {
      normalizeBangumi(entry);
      entries.set(entry.season_id, entry);
    }
    if (entries.size === previousSize)
      throw new Error("分页重复，没有读取到新记录");
    if (entries.size === total) return [...entries.values()];
    if (entries.size > total)
      throw new Error("追番记录数超过接口总数，请重新导入");
  }
  throw new Error("追番页数超过上限");
}

function releaseDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return undefined;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
    ? value
    : undefined;
}

export function isImage(bytes) {
  return (
    bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])) ||
    bytes
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) ||
    (bytes.toString("ascii", 0, 4) === "RIFF" &&
      bytes.toString("ascii", 8, 12) === "WEBP")
  );
}

export function normalizeBangumi(entry) {
  const status = statuses[entry.follow_status];
  if (!status) throw new Error(`未知追番状态：${entry.follow_status}`);
  if (
    !Number.isSafeInteger(entry.season_id) ||
    entry.season_id <= 0 ||
    !entry.title?.trim()
  )
    throw new Error("追番条目缺少有效 season_id 或标题");
  const cover = new URL(entry.cover);
  if (
    !/^https?:$/.test(cover.protocol) ||
    !cover.hostname.endsWith(".hdslb.com")
  )
    throw new Error(`封面来源不受支持：${cover.hostname}`);
  cover.protocol = "https:";
  const extension = path.extname(cover.pathname).toLowerCase();
  if (![".jpg", ".jpeg", ".png", ".webp"].includes(extension))
    throw new Error(`不支持的封面格式：${extension}`);
  return {
    seasonId: entry.season_id,
    title: entry.title.trim(),
    status,
    airDate: entry.is_started
      ? releaseDate(entry.publish?.release_date)
      : undefined,
    awaitingRelease: !entry.is_started,
    coverUrl: cover.href,
    image: `/images/anime/bilibili-${entry.season_id}.webp`,
    url: `https://www.bilibili.com/bangumi/play/ss${entry.season_id}`,
  };
}

async function fetchPublic(url) {
  const response = await fetch(url, {
    headers: { Referer: sourceUrl },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response;
}

async function main() {
  const cacheIndex = process.argv.indexOf("--from");
  const cached =
    cacheIndex >= 0
      ? JSON.parse(
          await readFile(path.resolve(process.argv[cacheIndex + 1]), "utf8"),
        )
      : undefined;
  const list =
    cached?.list ??
    (await collectBangumi(async (pn) => {
      const response = await fetchPublic(
        `https://api.bilibili.com/x/space/bangumi/follow/list?type=1&follow_status=0&vmid=25857856&pn=${pn}&ps=30`,
      );
      const result = await response.json();
      console.log(`读取第 ${pn} 页`);
      return result;
    }));
  if (
    cached &&
    (list.length !== cached.total ||
      new Set(list.map((x) => x.season_id)).size !== cached.total)
  )
    throw new Error("缓存记录不完整或重复");
  const records = list.map(normalizeBangumi);
  const coverDirectory = path.join(root, "apps/web/public/images/anime");
  await mkdir(coverDirectory, { recursive: true });
  // 分批下载，避免同时请求所有海报；全部成功后才替换静态快照。
  for (let offset = 0; offset < records.length; offset += 4) {
    await Promise.all(
      records.slice(offset, offset + 4).map(async (record) => {
        const destination = path.join(
          coverDirectory,
          path.basename(record.image),
        );
        if (
          await stat(destination).then(
            (s) => s.size > 0,
            () => false,
          )
        )
          return;
        const response = await fetchPublic(`${record.coverUrl}@480w.webp`);
        const bytes = Buffer.from(await response.arrayBuffer());
        // 部分历史海报返回 Content-Type: jpg，按文件签名检查实际图片。
        if (!isImage(bytes))
          throw new Error(`封面不是有效图片：${record.title}`);
        await writeFile(destination, bytes);
      }),
    );
  }
  const snapshot = {
    sourceUrl,
    fetchedAt: cached?.fetchedAt ?? new Date().toISOString(),
    total: records.length,
    records,
  };
  await writeFile(
    path.join(root, "apps/web/src/data/bilibili-bangumi.json"),
    `${JSON.stringify(snapshot, null, 2)}\n`,
  );
  console.log(`已保存 ${records.length} 条追番记录及本地封面。`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
