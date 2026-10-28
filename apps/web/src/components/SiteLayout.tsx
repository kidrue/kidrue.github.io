import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUp, Menu, X } from "lucide-react";

const navigation = [
  { id: "home", label: "首页", href: "/" },
  { id: "articles", label: "文章", href: "/blog#articles" },
  { id: "diary", label: "日记", href: "/diary" },
  { id: "interests", label: "兴趣", href: "/interests" },
  { id: "projects", label: "项目", href: "/blog#projects" },
  { id: "about", label: "关于", href: "/blog#about" },
  { id: "editor", label: "写作", href: "/editor" },
].filter(
  (item) => import.meta.env.VITE_STATIC_SITE !== "true" || item.id !== "editor",
);

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

export default function SiteLayout({
  page,
  children,
}: {
  page: "blog" | "interests" | "diary";
  children: ReactNode;
}) {
  const topId = page === "blog" ? "articles" : page;
  const contentLabel = { blog: "文章", interests: "兴趣", diary: "日记" }[page];
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [activeSection, setActiveSection] = useState<string>(topId);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    // 跨页链接的原生锚点滚动可能早于 lazy 页面挂载，内容就绪后补做定位。
    const target = document.getElementById(window.location.hash.slice(1));
    target?.scrollIntoView();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 600);
      if (page !== "blog") {
        setActiveSection(page);
        return;
      }
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
    return () => window.removeEventListener("scroll", onScroll);
  }, [page]);

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
      <a className="skip-link" href={`#${topId}`}>
        跳转到{contentLabel}内容
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
              {navigation.map((item, index) => (
                <a
                  key={item.id}
                  href={
                    page === "blog" && item.href.startsWith("/blog#")
                      ? `#${item.id}`
                      : item.href
                  }
                  onClick={() => setMenuOpen(false)}
                  className={activeSection === item.id ? "active" : ""}
                  aria-current={
                    activeSection === item.id
                      ? page !== "blog"
                        ? "page"
                        : "location"
                      : undefined
                  }
                >
                  {item.label}
                  <span className="nav-number">0{index + 1}</span>
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

      <main id={page !== "blog" ? page : undefined}>{children}</main>

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
        <a className="back-to-top" href={`#${topId}`} aria-label="回到顶部">
          <ArrowUp size={19} />
        </a>
      )}
    </>
  );
}
