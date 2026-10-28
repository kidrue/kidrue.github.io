import LandingHero from "./components/LandingHero";
import { SiteSurface } from "./styles/SiteSurface";
import { lazy, Suspense, useEffect } from "react";

const EditorPage = lazy(() => import("./editor/EditorPage"));
const BlogPage = lazy(() => import("./BlogPage"));
const InterestsPage = lazy(() => import("./InterestsPage"));
const DiaryPage = lazy(() => import("./DiaryPage"));

function LegacyInterestsRedirect() {
  useEffect(() => {
    window.location.replace("/interests");
  }, []);
  return <main style={{ padding: 40 }}>正在打开兴趣页…</main>;
}

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, "");
  useEffect(() => {
    if (path !== "/blog") return;
    const onHashChange = () => {
      if (window.location.hash === "#collections") {
        window.location.replace("/interests");
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [path]);

  return (
    <SiteSurface>
      {path === "/editor" && import.meta.env.VITE_STATIC_SITE !== "true" ? (
        <Suspense
          fallback={<main style={{ padding: 40 }}>正在打开写作工作台…</main>}
        >
          <EditorPage />
        </Suspense>
      ) : path === "/diary" ? (
        <Suspense fallback={<main style={{ padding: 40 }}>正在打开日记…</main>}>
          <DiaryPage />
        </Suspense>
      ) : path === "/interests" ? (
        <Suspense
          fallback={<main style={{ padding: 40 }}>正在打开兴趣页…</main>}
        >
          <InterestsPage />
        </Suspense>
      ) : path === "/blog" && window.location.hash === "#collections" ? (
        <LegacyInterestsRedirect />
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
