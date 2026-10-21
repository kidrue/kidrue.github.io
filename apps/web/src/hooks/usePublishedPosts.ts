import { useEffect, useState } from "react";
import type { Article } from "@kidrue/shared";
import { posts as examples, type Post } from "../data/posts";

export default function usePublishedPosts() {
  const [posts, setPosts] = useState<Post[]>(examples);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/articles", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok)
          throw new Error("文章服务暂不可用，当前展示内置示例文章。");
        const data = await response.json();
        if (!Array.isArray(data.articles))
          throw new Error("文章服务返回无效结果，当前展示内置示例文章。");
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
            readTime: article.readTime,
            category: article.category,
            tags: article.tags,
            body: article.body,
            coverUrl: article.coverUrl,
            artwork: "none",
            sections: [],
            example: false,
          }));
        setPosts([...published, ...examples]);
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
