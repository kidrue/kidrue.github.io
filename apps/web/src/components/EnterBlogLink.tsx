import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { Send } from "lucide-react";
import { entryPlaneLaunch } from "../styles/entry-button";

const destination = "/blog#articles";

export default function EnterBlogLink() {
  const [launching, setLaunching] = useState(false);
  const navigated = useRef(false);
  const navigate = useCallback(() => {
    if (navigated.current) return;
    navigated.current = true;
    window.location.assign(destination);
  }, []);

  useEffect(() => {
    if (!launching) return;
    // 动画事件被浏览器或扩展中断时，仍然能够进入博客。
    const fallback = window.setTimeout(navigate, 1600);
    return () => window.clearTimeout(fallback);
  }, [launching, navigate]);

  useEffect(() => {
    const reset = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      navigated.current = false;
      setLaunching(false);
    };
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    event.preventDefault();
    setLaunching(true);
  };

  return (
    <a
      className={`entry-primary${launching ? " is-launching" : ""}`}
      href={destination}
      aria-label="进入博客"
      aria-busy={launching}
      onClick={onClick}
    >
      <span className="entry-button-label" aria-hidden="true">
        进入博客
        <Send size={16} strokeWidth={1.6} />
      </span>
      <span className="entry-launch-status" aria-hidden="true">
        出发…
      </span>
      <svg
        className="entry-flight-trail"
        viewBox="0 0 200 120"
        fill="none"
        aria-hidden="true"
      >
        <path d="M12 109C66 110 102 82 137 40" />
        <path d="M36 118C91 114 126 86 157 46" />
      </svg>
      <span
        className="entry-plane"
        aria-hidden="true"
        onAnimationEnd={(event) => {
          if (
            event.target === event.currentTarget &&
            event.animationName === entryPlaneLaunch.getName()
          )
            navigate();
        }}
      >
        <span className="entry-fold entry-wing-left" />
        <span className="entry-fold entry-body-left" />
        <span className="entry-fold entry-body-right" />
        <span className="entry-fold entry-wing-right" />
      </span>
    </a>
  );
}
