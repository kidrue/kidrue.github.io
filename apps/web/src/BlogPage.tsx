import { useEffect, useRef, useState } from "react";
import { ArrowUp, Code2, Coffee, Feather, Menu, X } from "lucide-react";
import avatar from "../avatar.jpg";
import type { Post } from "./data/posts";
import ArticlesSection from "./components/ArticlesSection";
import ReadingDialog from "./components/ReadingDialog";
import CollectionSection from "./components/CollectionSection";
import ProjectsSection from "./components/ProjectsSection";

const navigation = [
  { id: "home", label: "首页" },
  { id: "articles", label: "文章" },
  { id: "collections", label: "收藏" },
  { id: "projects", label: "项目" },
  { id: "about", label: "关于" },
  { id: "editor", label: "写作" },
];

function Brand() {
  return (
    <a className="brand" href="/" aria-label="kidrue 首页">
      <span className="brand-symbol" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      kidrue<span className="brand-dot">.</span>
    </a>
  );
}

export default function BlogPage() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [activeSection, setActiveSection] = useState("articles");
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 600);
      const current = [...navigation].reverse().find((item) => {
        const target = document.getElementById(item.id);
        return (
          target &&
          target.getBoundingClientRect().top <= window.innerHeight * 0.4
        );
      });
      setActiveSection(current?.id ?? "articles");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      <a className="skip-link" href="#articles">
        跳转到文章内容
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <Brand />
          <div className="header-right">
            <button
              ref={menuButtonRef}
              className="menu-toggle"
              type="button"
              aria-label={menuOpen ? "关闭导航菜单" : "打开导航菜单"}
              aria-expanded={menuOpen}
              aria-controls="main-navigation"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
            <nav
              id="main-navigation"
              className={`main-nav ${menuOpen ? "is-open" : ""}`}
              aria-label="主导航"
            >
              {navigation.map((item) => (
                <a
                  key={item.id}
                  href={
                    item.id === "home"
                      ? "/"
                      : item.id === "editor"
                        ? "/editor"
                        : `#${item.id}`
                  }
                  onClick={() => setMenuOpen(false)}
                  className={activeSection === item.id ? "active" : ""}
                  aria-current={
                    activeSection === item.id ? "location" : undefined
                  }
                >
                  {item.label}
                  <span className="nav-number">
                    0{navigation.indexOf(item) + 1}
                  </span>
                </a>
              ))}
            </nav>
            <span className="header-note">
              <span className="status-dot" />
              保持好奇，持续生长
            </span>
          </div>
        </div>
      </header>

      <main>
        <div className="container blog-intro">
          <div className="eyebrow">KIDRUE / JOURNAL</div>
          <h1>
            记录代码，也收藏日常<span className="brand-dot">。</span>
          </h1>
        </div>
        <ArticlesSection onRead={setSelectedPost} />

        <CollectionSection />
        <ProjectsSection />

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
      </main>

      <footer className="container site-footer">
        <div>
          <Brand />
          <span className="footer-motto">给想法一个落脚的地方。</span>
        </div>
        <div className="footer-right">
          <span>© {new Date().getFullYear()} kidrue</span>
          <span>
            用好奇心构建 <span className="footer-plus">+</span> 用热爱更新
          </span>
        </div>
      </footer>
      {showBackToTop && (
        <a className="back-to-top" href="#articles" aria-label="回到顶部">
          <ArrowUp size={19} />
        </a>
      )}
      <ReadingDialog
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </>
  );
}
