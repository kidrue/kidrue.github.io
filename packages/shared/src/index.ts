import { z } from "zod";

const mediaUrl = z
  .string()
  .max(2048)
  .refine(
    (value) =>
      value === "" || /^https?:\/\//i.test(value) || /^\/uploads\//.test(value),
    "请输入有效的图片或视频地址",
  );
export const articleInputSchema = z.object({
  title: z.string().trim().min(1, "请填写文章标题").max(160),
  description: z.string().trim().max(400).default(""),
  category: z.enum(["技术", "生活"]),
  tags: z
    .array(z.string().trim().min(1).max(32))
    .max(12)
    .transform((tags) => [...new Set(tags)]),
  body: z.string().max(200_000),
  coverUrl: mediaUrl.default(""),
  status: z.enum(["draft", "published"]),
});
export type ArticleInput = z.infer<typeof articleInputSchema>;
export type Article = ArticleInput & {
  id: string;
  date: string;
  readTime: number;
  revision: number;
  createdAt: string;
  updatedAt: string;
};
export type UploadResult = {
  url: string;
  type: "image" | "video";
  name: string;
};
export type EditorSession = {
  authenticated: boolean;
  development: boolean;
  uploads: {
    configured: boolean;
    maxImageBytes: number;
    maxVideoBytes: number;
  };
};
