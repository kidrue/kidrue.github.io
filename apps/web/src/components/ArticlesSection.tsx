import { useRef, useState } from "react";
import {
  ChevronDown,
  Feather,
  RotateCcw,
  Search,
  SearchX,
  Tags,
  X,
} from "lucide-react";
import { type Category, type Post } from "../data/posts";
import usePublishedPosts from "../hooks/usePublishedPosts";
import PostCard from "./PostCard";

function matchesQuery(post: Post, query: string): boolean {
  const text = [
    post.title,
    post.description,
    post.body ?? "",
    ...post.tags,
    ...post.sections.flatMap((section) => [
      section.title,
      ...section.paragraphs,
      section.code ?? "",
    ]),
  ]
    .join(" ")
    .toLowerCase();
  return text.includes(query);
}

export default function ArticlesSection({
  onRead,
}: {
  onRead: (post: Post) => void;
}) {
  const { posts, error } = usePublishedPosts();
  const allTags = [...new Set(posts.flatMap((post) => post.tags))];
  const [category, setCategory] = useState<"全部" | Category>("全部");
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const normalizedQuery = query.trim().toLowerCase();
  const hasFilters =
    category !== "全部" || normalizedQuery !== "" || tag !== "";
  const visiblePosts = posts.filter(
    (post) =>
      (category === "全部" || post.category === category) &&
      (tag === "" || post.tags.includes(tag)) &&
      (normalizedQuery === "" || matchesQuery(post, normalizedQuery)),
  );

  function clearSearch() {
    setQuery("");
    searchRef.current?.focus();
  }

  function resetFilters() {
    setCategory("全部");
    setTag("");
    clearSearch();
  }

  return (
    <section
      id="articles"
      className="articles-section container"
      aria-labelledby="articles-title"
    >
      <div className="section-heading">
        <div>
          <div className="eyebrow section-eyebrow">
            <span className="little-diamond" />
            LATEST STORIES
          </div>
          <h2 id="articles-title">
            最近，写了这些<span className="brand-dot">。</span>
          </h2>
        </div>
        <div className="filters" role="group" aria-label="文章分类">
          {(["全部", "技术", "生活"] as const).map((value) => (
            <button
              key={value}
              type="button"
              className={category === value ? "selected" : ""}
              aria-pressed={category === value}
              onClick={() => setCategory(value)}
            >
              {value}
              {value === "全部" && (
                <span aria-hidden="true">
                  {String(posts.length).padStart(2, "0")}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="article-toolbar">
        <div className="article-search">
          <Search size={17} aria-hidden="true" />
          <input
            ref={searchRef}
            type="search"
            aria-label="搜索文章"
            placeholder="找一段文字，或一个感兴趣的话题…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape" && query) {
                event.preventDefault();
                clearSearch();
              }
            }}
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              type="button"
              className="clear-search"
              aria-label="清空搜索"
              onClick={clearSearch}
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="article-tag-select">
          <Tags size={16} aria-hidden="true" />
          <select
            aria-label="文章标签"
            value={tag}
            onChange={(event) => setTag(event.target.value)}
          >
            <option value="">全部标签</option>
            {allTags.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="select-chevron"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="article-result-row">
        <span role="status" aria-live="polite" aria-atomic="true">
          {hasFilters
            ? `找到 ${visiblePosts.length} 篇文章`
            : posts.every((post) => post.example !== false)
              ? `共 ${posts.length} 篇示例文章，欢迎随意翻翻。`
              : `共 ${posts.length} 篇文章，欢迎随意翻翻。`}
        </span>
        {hasFilters && (
          <button type="button" onClick={resetFilters}>
            <RotateCcw size={12} aria-hidden="true" />
            重置筛选
          </button>
        )}
      </div>

      {error && (
        <p style={{ color: "var(--muted)", fontSize: 12 }} role="status">
          {error}
        </p>
      )}
      {visiblePosts.length > 0 ? (
        <div className="posts-grid">
          {visiblePosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              featured={post.id === "my-little-corner"}
              onRead={onRead}
            />
          ))}
        </div>
      ) : (
        <div className="article-empty">
          <div className="empty-search-icon">
            <SearchX size={29} strokeWidth={1.5} aria-hidden="true" />
          </div>
          <h3>暂时没有找到相关文章</h3>
          <p>
            换个关键词试试，或调整分类和标签。
            <br />
            总有一段文字，会与你刚好相遇。
          </p>
          <button type="button" onClick={resetFilters}>
            查看全部文章
            <RotateCcw size={14} aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="articles-end">
        <span className="end-line" />
        <Feather size={14} aria-hidden="true" />
        <span>故事不多，正在慢慢积累。</span>
        <span className="end-line" />
      </div>
    </section>
  );
}
