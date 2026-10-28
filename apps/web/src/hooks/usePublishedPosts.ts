import { useEffect, useState } from "react";
import type { Article } from "@kidrue/shared";
import { posts as localPosts, type Post } from "../data/posts";

export default function usePublishedPosts() {
  const [posts, setPosts] = useState<Post[]>(localPosts);
  const [error, setError] = useState("");
  useEffect(() => {
    if (import.meta.env.VITE_STATIC_SITE === "true") return;
    const controller = new AbortController();
    fetch("/api/articles", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok)
          throw new Error("文章服务暂不可用，仍可阅读本站收录的本地文章。");
        const data = await response.json();
        if (!Array.isArray(data.articles))
          throw new Error("文章服务返回无效结果，仍可阅读本站收录的本地文章。");
        const published: Post[] = data.articles
          .filter(
            (article: Article) =>
              article.status === "published" &&
              typeof article.title === "string" &&
              typeof article.body === "string" &&
              Array.isArray(article.tags),
          )
          .map((article: Article) => ({
            id: article.id,
            title: article.title,
            description: article.description,
            date: article.date,
            createdAt: article.createdAt,
            readTime: article.readTime,
            category: article.category,
            tags: article.tags,
            body: article.body,
            coverUrl: article.coverUrl,
            artwork: "none",
            sections: [],
            example: false,
          }));
        setPosts(
          [...published, ...localPosts].sort(
            (a, b) =>
              Date.parse(b.createdAt ?? b.date) -
              Date.parse(a.createdAt ?? a.date),
          ),
        );
      })
      .catch((failure) => {
        if (!controller.signal.aborted)
          setError(
            failure instanceof Error
              ? failure.message
              : "无法读取文章，请稍后重试。",
          );
      });
    return () => controller.abort();
  }, []);
  return { posts, error };
}
