import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Outlet, useLocation, useNavigationType } from "react-router";

type Point = { x: number; y: number };
type Location = ReturnType<typeof useLocation>;
type Session = { values: Map<string, unknown>; captureScroll: () => void };
const SessionContext = createContext<Session | null>(null);

function targetKey(location: Location) {
  const path = location.pathname.replace(/\/+$/, "") || "/";
  const hash =
    path === "/blog" && (!location.hash || location.hash === "#articles")
      ? "#articles"
      : location.hash;
  return `${path}${location.search}${hash}`;
}

function findAnchor(hash: string) {
  const raw = hash.slice(1);
  try {
    return document.getElementById(decodeURIComponent(raw));
  } catch {
    return document.getElementById(raw);
  }
}

export function NavigationSession() {
  const location = useLocation();
  const action = useNavigationType();
  const values = useRef(new Map<string, unknown>()).current;
  const historyPositions = useRef(new Map<string, Point>());
  const tabPositions = useRef(new Map<string, Point>());
  const committed = useRef(location);
  const restoring = useRef(true);
  const initial = useRef(true);
  const captureScroll = useCallback(() => {
    if (restoring.current) return;
    const point = { x: window.scrollX, y: window.scrollY };
    historyPositions.current.set(committed.current.key, point);
    tabPositions.current.set(targetKey(committed.current), point);
  }, []);

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    window.addEventListener("scroll", captureScroll, { passive: true });
    window.addEventListener("popstate", captureScroll);
    return () => {
      window.history.scrollRestoration = previous;
      window.removeEventListener("scroll", captureScroll);
      window.removeEventListener("popstate", captureScroll);
    };
  }, [captureScroll]);

  useLayoutEffect(() => {
    const previous = committed.current;
    const first = initial.current;
    initial.current = false;
    committed.current = location;
    restoring.current = true;
    const samePage =
      previous.pathname.replace(/\/+$/, "") ===
      location.pathname.replace(/\/+$/, "");
    const point =
      action === "POP"
        ? historyPositions.current.get(location.key)
        : !samePage
          ? tabPositions.current.get(targetKey(location))
          : undefined;
    let cancelled = false;
    const frame = requestAnimationFrame(async () => {
      await document.fonts.ready;
      if (cancelled) return;
      const target = location.hash ? findAnchor(location.hash) : null;
      if (point)
        window.scrollTo({ left: point.x, top: point.y, behavior: "instant" });
      else if (target)
        target.scrollIntoView({ behavior: "instant", block: "start" });
      else window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      if (!first && !samePage)
        document
          .querySelector<HTMLElement>("main")
          ?.focus({ preventScroll: true });
      restoring.current = false;
      captureScroll();
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [location, action, captureScroll]);

  return (
    <SessionContext.Provider value={{ values, captureScroll }}>
      <Outlet />
    </SessionContext.Provider>
  );
}

export function useNavigationSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error("页面必须位于 NavigationSession 内");
  return session;
}

export function useTabState<T>(
  key: string,
  initial: T,
): [T, Dispatch<SetStateAction<T>>] {
  const { values } = useNavigationSession();
  const [value, setValue] = useState<T>(() =>
    values.has(key) ? (values.get(key) as T) : initial,
  );
  const setCachedValue = useCallback<Dispatch<SetStateAction<T>>>(
    (next) => {
      setValue((previous) => {
        const value =
          typeof next === "function"
            ? (next as (previous: T) => T)(previous)
            : next;
        values.set(key, value);
        return value;
      });
    },
    [key, values],
  );
  return [value, setCachedValue];
}
