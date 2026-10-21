import LandingHero from "./components/LandingHero";
import { SiteSurface } from "./styles/SiteSurface";
import { lazy, Suspense } from "react";

const EditorPage = lazy(() => import("./editor/EditorPage"));
const BlogPage = lazy(() => import("./BlogPage"));

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, "");
  return (
    <SiteSurface>
      {path === "/editor" ? (
        <Suspense
          fallback={<main style={{ padding: 40 }}>正在打开写作工作台…</main>}
        >
          <EditorPage />
        </Suspense>
      ) : path === "/blog" ? (
        <Suspense fallback={<main style={{ padding: 40 }}>正在打开博客…</main>}>
          <BlogPage />
        </Suspense>
      ) : (
        <main className="entry-page">
          <LandingHero />
        </main>
      )}
    </SiteSurface>
  );
}
