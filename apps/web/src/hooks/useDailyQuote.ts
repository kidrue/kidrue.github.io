import { useEffect, useState } from "react";
import {
  loadDailyQuote,
  localDayKey,
  type DailyQuote,
} from "../lib/daily-quote";

type QuoteState = {
  status: "loading" | "ready" | "error";
  quote: DailyQuote | null;
};

export default function useDailyQuote() {
  const [day, setDay] = useState(localDayKey);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<QuoteState>({
    status: "loading",
    quote: null,
  });

  useEffect(() => {
    function refreshDay() {
      setDay(localDayKey());
    }
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const timer = window.setTimeout(
      refreshDay,
      midnight.getTime() - Date.now() + 30,
    );
    document.addEventListener("visibilitychange", refreshDay);
    window.addEventListener("focus", refreshDay);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", refreshDay);
      window.removeEventListener("focus", refreshDay);
    };
  }, [day]);

  useEffect(() => {
    let active = true;
    setState({ status: "loading", quote: null });
    loadDailyQuote(day).then(
      (quote) => {
        if (active) setState({ status: "ready", quote });
      },
      () => {
        if (active) setState({ status: "error", quote: null });
      },
    );
    return () => {
      active = false;
    };
  }, [day, attempt]);

  return { ...state, day, retry: () => setAttempt((value) => value + 1) };
}
