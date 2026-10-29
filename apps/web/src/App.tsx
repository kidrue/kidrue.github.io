import { lazy, Suspense, useEffect, type ComponentType } from "react";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useLocation,
  useNavigation,
} from "react-router";
import { RouterProvider } from "react-router/dom";
import LandingHero from "./components/LandingHero";
import SiteLayout from "./components/SiteLayout";
import { SiteSurface } from "./styles/SiteSurface";
import {
  loadPage,
  pageFromPath,
  prefetchLightPages,
  type PublicPage,
} from "./navigation/pages";
import { NavigationSession } from "./navigation/Session";
import RouteLoadError from "./navigation/RouteLoadError";

const legacySectionRoutes: Record<string, string> = {
  "#collections": "/interests",
  "#projects": "/projects",
  "#quotes": "/quotes",
};

function PublicLayout() {
  const location = useLocation();
  const navigation = useNavigation();
  const page = pageFromPath(location.pathname) ?? "blog";
  const legacy =
    page === "blog" ? legacySectionRoutes[location.hash] : undefined;
  useEffect(() => prefetchLightPages(), [page]);
  return (
    <SiteLayout page={page} loading={navigation.state !== "idle"}>
      {legacy ? <Navigate to={legacy} replace /> : <Outlet />}
    </SiteLayout>
  );
}

function EntryPage() {
  return (
    <main className="entry-page" tabIndex={-1}>
      <LandingHero />
    </main>
  );
}

// 兼容旧锚点时原地替换 URL，不额外请求 HTML。
const initialUrl = new URL(window.location.href);
if (
  initialUrl.pathname.replace(/\/+$/, "") === "/blog" &&
  legacySectionRoutes[initialUrl.hash]
) {
  window.history.replaceState(
    window.history.state,
    "",
    legacySectionRoutes[initialUrl.hash],
  );
}

function pageRoute(
  path: string,
  load: () => Promise<{ default: ComponentType }>,
) {
  const Page = lazy(load);
  return {
    path,
    loader: async () => {
      await load();
      return null;
    },
    Component: () => (
      <Suspense
        fallback={
          <div className="route-loading" role="status">
            正在打开页面…
          </div>
        }
      >
        <Page />
      </Suspense>
    ),
    ErrorBoundary: RouteLoadError,
    shouldRevalidate: () => false,
  };
}

const router = createBrowserRouter([
  {
    Component: NavigationSession,
    HydrateFallback: () => (
      <main className="route-loading" aria-busy="true">
        正在打开页面…
      </main>
    ),
    ErrorBoundary: RouteLoadError,
    children: [
      { index: true, Component: EntryPage },
      {
        Component: PublicLayout,
        children: (
          ["blog", "diary", "interests", "projects", "quotes"] as PublicPage[]
        ).map((page) => pageRoute(page, () => loadPage(page))),
      },
      ...(import.meta.env.VITE_STATIC_SITE !== "true"
        ? [pageRoute("editor", () => import("./editor/EditorPage"))]
        : []),
      { path: "*", Component: EntryPage },
    ],
  },
]);

if (import.meta.hot) import.meta.hot.dispose(() => router.dispose());

export default function App() {
  return (
    <SiteSurface>
      <RouterProvider router={router} />
    </SiteSurface>
  );
}
