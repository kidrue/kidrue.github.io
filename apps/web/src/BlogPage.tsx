import { useState } from "react";
import { Code2, Coffee, Feather } from "lucide-react";
import avatar from "../avatar.jpg";
import type { Post } from "./data/posts";
import ArticlesSection from "./components/ArticlesSection";
import ReadingDialog from "./components/ReadingDialog";
import QuotesSection from "./components/QuotesSection";

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
      <QuotesSection />

      <section id="about" className="about-section container">
        <div className="about-card">
          <div className="about-avatar">
            <img src={avatar} alt="" loading="lazy" />
            <span className="avatar-status" />
          </div>
          <div className="about-copy">
            <div className="eyebrow">A LITTLE MORE ABOUT ME</div>
            <h2>
              保持好奇，慢慢积累<span className="brand-dot">。</span>
            </h2>
            <p>
              这里是 kidrue 的个人空间。分享学到的新东西，记录认真生活的片刻。
              <br className="desktop-break" />
              如果某一段文字恰好对你有用，或让你会心一笑，那就很好。
            </p>
          </div>
          <div className="about-side">
            <span>
              <Code2 size={15} />
              技术探索
            </span>
            <span>
              <Coffee size={15} />
              生活观察
            </span>
            <span>
              <Feather size={15} />
              自由记录
            </span>
          </div>
          <span className="about-decoration" aria-hidden="true">
            *
          </span>
        </div>
      </section>
      <ReadingDialog
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </>
  );
}
