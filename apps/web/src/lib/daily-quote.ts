export type DailyQuote = {
  text: string;
  source: string;
  author: string | null;
  uuid: string | null;
};

const CACHE_KEY = "kidrue:daily-hitokoto:v1";
const pending = new Map<string, Promise<DailyQuote>>();
const ENDPOINT =
  "https://v1.hitokoto.cn/?c=a&c=d&c=i&encode=json&min_length=8&max_length=60";

export function localDayKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function isQuote(value: unknown): value is DailyQuote {
  if (!value || typeof value !== "object") return false;
  const quote = value as Partial<DailyQuote>;
  return (
    typeof quote.text === "string" &&
    quote.text.trim().length > 0 &&
    typeof quote.source === "string" &&
    (quote.author === null || typeof quote.author === "string") &&
    (quote.uuid === null || typeof quote.uuid === "string")
  );
}

function readCache(day: string): DailyQuote | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache: unknown = JSON.parse(raw);
    if (
      !cache ||
      typeof cache !== "object" ||
      !("day" in cache) ||
      cache.day !== day ||
      !("quote" in cache)
    )
      return null;
    return isQuote(cache.quote) ? cache.quote : null;
  } catch {
    return null;
  }
}

async function fetchQuote(day: string): Promise<DailyQuote> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(ENDPOINT, { signal: controller.signal });
    if (!response.ok) throw new Error(`Hitokoto HTTP ${response.status}`);
    const data: unknown = await response.json();
    if (
      !data ||
      typeof data !== "object" ||
      !("hitokoto" in data) ||
      typeof data.hitokoto !== "string" ||
      !data.hitokoto.trim()
    ) {
      throw new Error("Invalid Hitokoto response");
    }
    const payload = data as Record<string, unknown>;
    const quote: DailyQuote = {
      text: (payload.hitokoto as string).trim(),
      source:
        typeof payload.from === "string" && payload.from.trim()
          ? payload.from.trim()
          : "一言",
      author:
        typeof payload.from_who === "string" && payload.from_who.trim()
          ? payload.from_who.trim()
          : null,
      uuid:
        typeof payload.uuid === "string" && payload.uuid.trim()
          ? payload.uuid.trim()
          : null,
    };
    try {
      if (day === localDayKey()) {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ day, quote }));
      }
    } catch {
      // 存储被禁用或已满时，仍显示已取得的一言。
    }
    return quote;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function loadDailyQuote(day: string): Promise<DailyQuote> {
  const cached = readCache(day);
  if (cached) return Promise.resolve(cached);
  const existing = pending.get(day);
  if (existing) return existing;
  const request = fetchQuote(day).finally(() => pending.delete(day));
  pending.set(day, request);
  return request;
}
