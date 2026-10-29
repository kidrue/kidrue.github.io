import type { ComponentType } from "react";

export const pageLoaders = {
  blog: () => import("../BlogPage"),
  interests: () => import("../InterestsPage"),
  diary: () => import("../DiaryPage"),
  projects: () => import("../ProjectsPage"),
};
export type PublicPage = keyof typeof pageLoaders;
const pendingPages = new Map<PublicPage, Promise<{ default: ComponentType }>>();

export function loadPage(page: PublicPage) {
  let pending = pendingPages.get(page);
  if (!pending) {
    pending = pageLoaders[page]().catch((error) => {
      pendingPages.delete(page);
      throw error;
    });
    pendingPages.set(page, pending);
  }
  return pending;
}

export function pageFromPath(pathname: string): PublicPage | undefined {
  const path = pathname.replace(/\/+$/, "").slice(1);
  return Object.hasOwn(pageLoaders, path) ? (path as PublicPage) : undefined;
}

export function allowsPrefetch() {
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  return (
    document.visibilityState !== "hidden" &&
    !connection?.saveData &&
    !["slow-2g", "2g"].includes(connection?.effectiveType ?? "")
  );
}

export function prefetchPage(href: string) {
  if (!allowsPrefetch()) return;
  const url = new URL(href, window.location.href);
  if (url.origin !== window.location.origin) return;
  const page = pageFromPath(url.pathname);
  if (page) void loadPage(page).catch(() => {});
}

export function prefetchLightPages() {
  if (!allowsPrefetch()) return () => {};
  const prefetch = () => {
    prefetchPage("/diary");
    prefetchPage("/projects");
  };
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(prefetch, { timeout: 1500 });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(prefetch, 1200);
  return () => clearTimeout(id);
}
