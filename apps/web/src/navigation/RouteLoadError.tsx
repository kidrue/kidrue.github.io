import { useLocation } from "react-router";

export default function RouteLoadError() {
  const location = useLocation();
  return (
    <div className="container route-loading" role="alert">
      <h1>页面暂时未能加载</h1>
      <p>请检查网络，或重新加载页面。</p>
      <a href={`${location.pathname}${location.search}${location.hash}`}>
        重新加载页面
      </a>
    </div>
  );
}
