import { useEffect, useState } from "react";
import { siteStartedAt } from "../data/site";

const startedAt = Date.parse(siteStartedAt);
const startedAtLabel = new Date(startedAt).toLocaleString("zh-CN", {
  timeZone: "Asia/Shanghai",
  hour12: false,
});

export default function SiteUptime() {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const seconds = Math.max(0, Math.floor((now - startedAt) / 1000));
  const days = Math.floor(seconds / 86400);
  const hours = String(Math.floor(seconds / 3600) % 24).padStart(2, "0");
  const minutes = String(Math.floor(seconds / 60) % 60).padStart(2, "0");
  const remainingSeconds = String(seconds % 60).padStart(2, "0");

  return (
    <p
      className="site-uptime"
      role="timer"
      aria-live="off"
      aria-label="博客运行时间"
      title={`自 ${startedAtLabel}（北京时间）首次上线起`}
    >
      <span className="uptime-dot" aria-hidden="true" />
      本站已运行 {days} 天 {hours} 时 {minutes} 分 {remainingSeconds} 秒
    </p>
  );
}
