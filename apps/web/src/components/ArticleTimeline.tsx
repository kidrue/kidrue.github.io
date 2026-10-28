import { Fragment } from "react";
import { ArrowRight } from "lucide-react";
import type { Post } from "../data/posts";
import { Timeline } from "./Timeline.styles";

export default function ArticleTimeline({
  posts,
  onRead,
  label = "文章时间轴",
}: {
  posts: Post[];
  onRead: (post: Post) => void;
  label?: string;
}) {
  const months = new Map<string, Post[]>();
  for (const post of [...posts].sort((a, b) => b.date.localeCompare(a.date))) {
    const month = post.date.slice(0, 7);
    const group = months.get(month) ?? [];
    group.push(post);
    months.set(month, group);
  }
  return (
    <Timeline as="div" aria-label={label}>
      {[...months].map(([month, entries]) => (
        <Fragment key={month}>
          <div className="timeline-month">
            <h3>{month}</h3>
            <span>{entries.length} 篇</span>
          </div>
          {entries.map((post) => (
            <article className="timeline-item" key={post.id}>
              <div className="timeline-row">
                <time dateTime={post.date}>{post.date}</time>
                <ArrowRight
                  className="timeline-arrow"
                  size={16}
                  aria-hidden="true"
                />
                <h4>
                  <button
                    className="timeline-title"
                    type="button"
                    aria-label={`阅读：${post.title}`}
                    onClick={() => onRead(post)}
                  >
                    {post.title}
                  </button>
                </h4>
                {post.sourceType === "转载" && (
                  <span className="timeline-label">转载</span>
                )}
                {post.example !== false && (
                  <span className="timeline-label">示例</span>
                )}
              </div>
            </article>
          ))}
        </Fragment>
      ))}
    </Timeline>
  );
}
