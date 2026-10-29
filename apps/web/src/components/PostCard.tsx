import { ArrowUpRight, Clock3, Code2, Feather, Pin } from "lucide-react";
import type { Post } from "../data/posts";
import PostArtwork from "./PostArtwork";
import { preloadReading } from "../lib/reading";

export default function PostCard({
  post,
  featured,
  onRead,
}: {
  post: Post;
  featured: boolean;
  onRead: (post: Post) => void;
}) {
  const CategoryIcon = post.category === "技术" ? Code2 : Feather;
  return (
    <article
      className={`post-card ${featured ? "featured" : ""} ${post.artwork !== "none" ? "with-art" : ""}`}
    >
      {post.coverUrl ? (
        <img
          src={post.coverUrl}
          alt=""
          loading="lazy"
          style={{
            width: "100%",
            height: 180,
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        post.artwork !== "none" && <PostArtwork kind={post.artwork} />
      )}
      <div className="post-content">
        <div className="post-topline">
          <span
            className={`category-label ${post.category === "生活" ? "life" : ""}`}
          >
            <CategoryIcon size={14} />
            {post.category}手记
          </span>
          <span className="post-marker">
            {featured && (
              <>
                <Pin size={11} /> 精选 ·{" "}
              </>
            )}
            {post.example !== false
              ? "示例"
              : post.sourceType === "转载"
                ? "转载"
                : "原创"}
          </span>
        </div>
        <h3>
          <button
            type="button"
            className="post-title-button"
            aria-label={`阅读：${post.title}`}
            onClick={() => onRead(post)}
            onMouseEnter={preloadReading}
            onFocus={preloadReading}
          >
            {post.title}
          </button>
        </h3>
        <p className="post-description">{post.description}</p>
        <div className="post-tags">
          {post.tags.map((tag) => (
            <span key={tag}># {tag}</span>
          ))}
        </div>
        <div className="post-footer">
          <time dateTime={post.date}>{post.date.replaceAll("-", ".")}</time>
          <span>
            <Clock3 size={12} />
            {post.readTime} 分钟阅读
          </span>
          <ArrowUpRight size={18} className="card-arrow" aria-hidden="true" />
        </div>
      </div>
    </article>
  );
}
