import { ArrowUpRight, RefreshCw, Sparkles } from "lucide-react";
import avatar from "../../avatar.jpg";
import useDailyQuote from "../hooks/useDailyQuote";
import EnterBlogLink from "./EnterBlogLink";
import MeteorShower from "./MeteorShower";
import SiteUptime from "./SiteUptime";

const socialLinks = [
  {
    label: "Bilibili",
    href: "https://space.bilibili.com/25857856?spm_id_from=333.1007.0.0",
    icon: "/icons/bilibili.ico",
  },
  {
    label: "GitHub",
    href: "https://github.com/kidrue",
    icon: "/icons/github.svg",
  },
  {
    label: "V2EX",
    href: "https://www.v2ex.com/member/kidrue",
    icon: "/icons/v2ex.png",
  },
];

export default function LandingHero() {
  const { quote, status, day, retry } = useDailyQuote();
  const source = quote?.author
    ? `${quote.author} ·《${quote.source}》`
    : `《${quote?.source ?? "一言"}》`;
  return (
    <section
      id="home"
      className="hero entry-hero"
      aria-labelledby="entry-title"
    >
      <img
        className="entry-sky"
        src="/images/your-name-sky.jpg"
        alt=""
        fetchPriority="high"
      />
      <div className="entry-shade" aria-hidden="true" />
      <MeteorShower />
      <div className="container entry-inner">
        <div className="entry-profile">
          <div className="entry-identity">
            <div className="avatar-frame entry-avatar">
              <img src={avatar} alt="kidrue 的头像" fetchPriority="high" />
            </div>
            <h1 id="entry-title">
              kidrue<span aria-hidden="true">.</span>
            </h1>
          </div>
          <figure
            className="daily-quote"
            aria-label="每日一言"
            aria-busy={status === "loading"}
          >
            <div className="daily-quote-label">
              <Sparkles size={12} aria-hidden="true" />
              <span>{status === "error" ? "小站寄语" : "每日一言"}</span>
              <span className="quote-label-line" />
              <time dateTime={day}>{day.replaceAll("-", ".")}</time>
            </div>
            <blockquote>
              <p>
                {status === "loading"
                  ? "正在拾取今天的一句话…"
                  : (quote?.text ?? "保持好奇，慢慢积累。")}
              </p>
            </blockquote>
            <figcaption>
              {status === "ready" && quote && (
                <a
                  href={
                    quote.uuid
                      ? `https://hitokoto.cn/?uuid=${encodeURIComponent(quote.uuid)}`
                      : "https://hitokoto.cn/"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`一言出处：${source}`}
                >
                  — {source}
                  <ArrowUpRight size={12} aria-hidden="true" />
                </a>
              )}
              {status === "loading" && <span>让相遇，慢一点也没关系。</span>}
              {status === "error" && (
                <>
                  <span>一言暂未送达，先留一句自己的话。</span>
                  <button type="button" onClick={retry} aria-label="重试一言">
                    <RefreshCw size={12} aria-hidden="true" />
                    重试
                  </button>
                </>
              )}
            </figcaption>
          </figure>
          <div className="entry-socials" aria-label="我的社交主页">
            {socialLinks.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="social-brand-icon"
                  src={icon}
                  alt=""
                  width="19"
                  height="19"
                />
                <span>{label}</span>
                <ArrowUpRight
                  size={11}
                  className="social-outward"
                  aria-hidden="true"
                />
              </a>
            ))}
          </div>
          <div className="entry-actions">
            <EnterBlogLink />
          </div>
          <SiteUptime />
        </div>
      </div>
      <a
        className="entry-art-credit"
        href="https://www.kiminona.com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        背景 ·《你的名字。》
      </a>
    </section>
  );
}
