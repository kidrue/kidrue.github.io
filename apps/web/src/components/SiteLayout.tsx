import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUp, Menu, X } from "lucide-react";
import { useLocation } from "react-router";
import AppLink from "../navigation/AppLink";

const navigation = [
  { id: "home", label: "首页", href: "/" },
  { id: "articles", label: "文章", href: "/blog#articles" },
  { id: "diary", label: "日记", href: "/diary" },
  { id: "interests", label: "兴趣", href: "/interests" },
  { id: "quotes", label: "一句话", href: "/quotes" },
  { id: "projects", label: "项目", href: "/projects" },
  { id: "about", label: "关于", href: "/blog#about" },
  { id: "editor", label: "写作", href: "/editor" },
].filter(
  (item) => import.meta.env.VITE_STATIC_SITE !== "true" || item.id !== "editor",
);

function Brand() {
  return (
    <AppLink className="brand" to="/" aria-label="kidrue 首页">
      <span className="brand-symbol" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      kidrue<span className="brand-dot">.</span>
    </AppLink>
  );
}

export default function SiteLayout({
  page,
  children,
  loading = false,
}: {
  page: "blog" | "interests" | "diary" | "projects" | "quotes";
  children: ReactNode;
  loading?: boolean;
}) {
  const location = useLocation();
  const topId = page === "blog" ? "articles" : page;
  const contentLabel = {
    blog: "文章",
    interests: "兴趣",
    diary: "日记",
    projects: "项目",
    quotes: "一句话",
  }[page];
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [activeSection, setActiveSection] = useState<string>(topId);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => setMenuOpen(false), [location.key]);

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
  }, [page, location.key]);

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
      <AppLink className="skip-link" to={`#${topId}`}>
        跳转到{contentLabel}内容
      </AppLink>
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
                <AppLink
                  key={item.id}
                  to={
                    page === "blog" && item.href.startsWith("/blog#")
                      ? `#${item.id}`
                      : item.href
                  }
                  onClick={() => setMenuOpen(false)}
                  reloadDocument={item.id === "editor"}
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
                </AppLink>
              ))}
            </nav>
            <span className="header-note">
              <span className="status-dot" />
              保持好奇，持续生长
            </span>
          </div>
        </div>
        {loading && (
          <progress className="navigation-progress" aria-label="正在切换栏目" />
        )}
      </header>

      <main
        id={page !== "blog" ? page : undefined}
        tabIndex={-1}
        aria-busy={loading}
      >
        {children}
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
        <AppLink className="back-to-top" to={`#${topId}`} aria-label="回到顶部">
          <ArrowUp size={19} />
        </AppLink>
      )}
    </>
  );
}
