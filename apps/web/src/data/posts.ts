import { parse } from "yaml";
import duplicateGroups from "./post-duplicates.json";

export type Category = "技术" | "生活";
export type Post = {
  id: string;
  category: Category;
  title: string;
  description: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
  author?: string;
  source?: string;
  sourceType?: string;
  sourceUrl?: string;
  readTime: number;
  tags: string[];
  searchAliases?: string[];
  artwork: "code" | "mountain" | "none";
  body?: string;
  coverUrl?: string;
  example?: boolean;
  sections: { title: string; paragraphs: string[]; code?: string }[];
};

type PostMetadata = Pick<
  Post,
  | "id"
  | "title"
  | "description"
  | "date"
  | "category"
  | "tags"
  | "createdAt"
  | "updatedAt"
  | "author"
  | "source"
  | "sourceType"
  | "sourceUrl"
>;

const files = import.meta.glob<string>("../content/posts/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

const importedPosts: Post[] = Object.entries(files)
  .map(([path, raw]): Post => {
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) throw new Error(`文章缺少 Markdown 元数据：${path}`);
    const metadata = parse(match[1]) as PostMetadata;
    if (
      !metadata.id ||
      !metadata.title ||
      !metadata.createdAt ||
      !Number.isFinite(Date.parse(metadata.createdAt)) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(metadata.date) ||
      !["技术", "生活"].includes(metadata.category) ||
      !Array.isArray(metadata.tags) ||
      !match[2].trim()
    )
      throw new Error(`文章元数据或正文不完整：${path}`);
    return {
      ...metadata,
      body: match[2].trim(),
      readTime: Math.max(1, Math.ceil(match[2].length / 500)),
      artwork: "none",
      example: false,
      sections: [],
    };
  })
  .sort((a, b) => Date.parse(b.createdAt!) - Date.parse(a.createdAt!));

if (new Set(importedPosts.map((post) => post.id)).size !== importedPosts.length)
  throw new Error("本地 Markdown 文章存在重复 ID");

// 只合并人工核对过的重复组，避免同主题或同名文章被自动误删。
const postsById = new Map(importedPosts.map((post) => [post.id, post]));
const duplicateIds = new Set<string>();
for (const group of duplicateGroups) {
  const canonical = postsById.get(group.canonicalId);
  if (!canonical) throw new Error(`去重主版本不存在：${group.canonicalId}`);
  const aliases = new Set<string>();
  const tags = new Map(canonical.tags.map((tag) => [tag.toLowerCase(), tag]));
  for (const id of group.duplicateIds) {
    const duplicate = postsById.get(id);
    if (!duplicate) throw new Error(`去重原始版本不存在：${id}`);
    duplicateIds.add(id);
    if (duplicate.title !== canonical.title) aliases.add(duplicate.title);
    for (const tag of duplicate.tags) {
      if (!tags.has(tag.toLowerCase())) tags.set(tag.toLowerCase(), tag);
    }
  }
  canonical.searchAliases = [...aliases];
  canonical.tags = [...tags.values()];
}

export const posts = importedPosts.filter((post) => !duplicateIds.has(post.id));
