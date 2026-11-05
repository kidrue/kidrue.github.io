import { useState } from "react";
import type { Post } from "./data/posts";
import ArticlesSection from "./components/ArticlesSection";
import ReadingDialog from "./components/ReadingDialog";

export default function BlogPage() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  return (
    <>
      <div className="container blog-intro">
        <div className="eyebrow">KIDRUE / JOURNAL</div>
        <h1>
          记录代码，也收藏日常<span className="brand-dot">。</span>
        </h1>
      </div>
      <ArticlesSection onRead={setSelectedPost} />

      <ReadingDialog
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </>
  );
}
