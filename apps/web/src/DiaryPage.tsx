import { useState } from "react";
import type { Post } from "./data/posts";
import { diaries } from "./data/diaries";
import SiteLayout from "./components/SiteLayout";
import ArticleTimeline from "./components/ArticleTimeline";
import ReadingDialog from "./components/ReadingDialog";

export default function DiaryPage() {
  const [selectedEntry, setSelectedEntry] = useState<Post | null>(null);
  return (
    <>
      <SiteLayout page="diary">
        <div className="container blog-intro">
          <div className="eyebrow">KIDRUE / DIARY</div>
          <h1>
            日常，慢慢记<span className="brand-dot">。</span>
          </h1>
        </div>
        <section
          className="articles-section container"
          aria-labelledby="diary-title"
        >
          <div className="section-heading">
            <div>
              <div className="eyebrow section-eyebrow">
                <span className="little-diamond" />
                LITTLE MOMENTS
              </div>
              <h2 id="diary-title">
                留住平凡的一天<span className="brand-dot">。</span>
              </h2>
            </div>
            <span className="collection-count">{diaries.length} 篇日记</span>
          </div>
          {diaries.length ? (
            <ArticleTimeline
              posts={diaries}
              onRead={setSelectedEntry}
              label="日记时间轴"
            />
          ) : (
            <div className="article-empty">
              <h3>还没有日记</h3>
              <p>把日子里的小事，慢慢写在这里。</p>
            </div>
          )}
        </section>
      </SiteLayout>
      <ReadingDialog
        post={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        kind="diary"
      />
    </>
  );
}
