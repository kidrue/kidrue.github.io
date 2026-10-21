import { useEffect, useRef } from "react";
import { ArrowUpRight, Clock3, X } from "lucide-react";
import type { Post } from "../data/posts";
import MarkdownContent from "./MarkdownContent";

export default function ReadingDialog({
  post,
  onClose,
}: {
  post: Post | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !post) return;
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, [post]);

  return (
    <dialog
      ref={ref}
      className="reading-dialog"
      aria-labelledby="reading-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            onClose();
        }
      }}
    >
      {post && (
        <>
          <div className="reading-toolbar">
            <span>
              kidrue<span className="brand-dot">.</span>{" "}
              <ArrowUpRight size={14} /> 阅读时光
            </span>
            <button
              type="button"
              aria-label="关闭文章"
              onClick={onClose}
              autoFocus
            >
              <X size={21} />
            </button>
          </div>
          <div className="reading-body">
            <div className="reading-eyebrow">
              {post.category}手记{" "}
              <span>{post.example !== false ? "示例文章" : "原创文章"}</span>
            </div>
            <h2 id="reading-title">{post.title}</h2>
            <div className="reading-meta">
              <time dateTime={post.date}>{post.date.replaceAll("-", ".")}</time>
              <span>
                <Clock3 size={14} />
                {post.readTime} 分钟阅读
              </span>
            </div>
            <p className="reading-intro">{post.description}</p>
            {post.coverUrl && (
              <img
                src={post.coverUrl}
                alt="文章封面"
                style={{
                  width: "100%",
                  maxHeight: 420,
                  objectFit: "cover",
                  marginBottom: 24,
                  borderRadius: 6,
                }}
              />
            )}
            {post.body !== undefined && <MarkdownContent body={post.body} />}
            {post.sections.map((section) => (
              <section key={section.title}>
                <h3>{section.title}</h3>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.code && (
                  <pre>
                    <code>{section.code}</code>
                  </pre>
                )}
              </section>
            ))}
            <div className="reading-end">
              感谢阅读，愿你今天也有所收获。<span>— kidrue</span>
            </div>
          </div>
        </>
      )}
    </dialog>
  );
}
