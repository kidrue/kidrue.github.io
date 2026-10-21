import type {
  Article,
  ArticleInput,
  EditorSession,
  UploadResult,
} from "@kidrue/shared";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: "same-origin",
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new ApiError(
      typeof result?.message === "string"
        ? result.message
        : "服务暂不可用，请重试",
      response.status,
    );
  }
  return response.status === 204 ? (undefined as T) : response.json();
}
export const getSession = () => api<EditorSession>("/api/admin/session");
export const getArticles = () =>
  api<{ articles: Article[] }>("/api/admin/articles");
export function saveArticle(
  input: ArticleInput,
  article?: Pick<Article, "id" | "revision"> | null,
) {
  return api<{ article: Article }>(
    article
      ? `/api/admin/articles/${encodeURIComponent(article.id)}`
      : "/api/admin/articles",
    {
      method: article ? "PUT" : "POST",
      body: JSON.stringify({
        ...input,
        ...(article ? { revision: article.revision } : {}),
      }),
    },
  );
}
export function uploadFile(
  file: File,
  onProgress: (value: number) => void,
  signal: AbortSignal,
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    const abort = () => request.abort();
    const finish = () => signal.removeEventListener("abort", abort);
    request.open("POST", "/api/admin/uploads");
    request.timeout = 180_000;
    request.upload.onprogress = (event) => {
      if (event.lengthComputable)
        onProgress(
          Math.min(99, Math.round((event.loaded / event.total) * 100)),
        );
    };
    request.onload = () => {
      finish();
      let data: unknown;
      try {
        data = JSON.parse(request.responseText);
      } catch {
        reject(new Error("上传服务返回无效结果，请重试"));
        return;
      }
      if (request.status < 200 || request.status >= 300) {
        reject(
          new ApiError(
            data && typeof data === "object" && "message" in data
              ? String(data.message)
              : "上传失败，请重试",
            request.status,
          ),
        );
        return;
      }
      if (
        !data ||
        typeof data !== "object" ||
        !("url" in data) ||
        typeof data.url !== "string" ||
        !("type" in data) ||
        !["image", "video"].includes(String(data.type))
      ) {
        reject(new Error("上传结果不完整，请重试"));
        return;
      }
      onProgress(100);
      resolve(data as UploadResult);
    };
    request.onerror = () => {
      finish();
      reject(new Error("网络连接失败，文件未上传，请重试"));
    };
    request.ontimeout = () => {
      finish();
      reject(new Error("上传超时，请重试"));
    };
    request.onabort = () => {
      finish();
      reject(new DOMException("上传已取消", "AbortError"));
    };
    if (signal.aborted) {
      reject(new DOMException("上传已取消", "AbortError"));
      return;
    }
    signal.addEventListener("abort", abort, { once: true });
    const body = new FormData();
    body.append("file", file);
    request.send(body);
  });
}
