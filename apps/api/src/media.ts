import type { FastifyInstance } from "fastify";
import { extname } from "node:path";
import type { UploadResult } from "@kidrue/shared";

export type MediaConfig = {
  imgurClientId?: string;
  imgurAccessToken?: string;
  maxImageBytes: number;
  maxVideoBytes: number;
  fetch?: typeof globalThis.fetch;
};
function reject(statusCode: number, message: string): never {
  throw Object.assign(new Error(message), { statusCode });
}
function detect(bytes: Buffer): string | undefined {
  if (
    bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    return "png";
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "jpeg";
  if (/^GIF8[79]a/.test(bytes.subarray(0, 6).toString())) return "gif";
  if (bytes.length >= 12 && bytes.subarray(4, 8).toString() === "ftyp")
    return "mp4";
  if (
    bytes.subarray(0, 4).equals(Buffer.from([26, 69, 223, 163])) &&
    bytes.subarray(0, 4096).includes(Buffer.from("webm"))
  )
    return "webm";
}
export async function uploadMedia(app: FastifyInstance, config: MediaConfig) {
  app.post("/api/admin/uploads", async (request) => {
    const part = await request.file({
      limits: {
        fileSize: Math.max(config.maxImageBytes, config.maxVideoBytes),
        files: 1,
        fields: 0,
      },
    });
    if (!part || part.fieldname !== "file") reject(400, "请选择要上传的文件");
    const bytes = await part.toBuffer();
    if (part.file.truncated) reject(413, "文件超过上传大小限制");
    const kind = detect(bytes);
    const ext = extname(part.filename).slice(1).toLowerCase();
    const video = kind === "mp4" || kind === "webm";
    const normalizedExt = ext === "jpg" ? "jpeg" : ext;
    const mime = kind ? `${video ? "video" : "image"}/${kind}` : "";
    if (!kind || normalizedExt !== kind || part.mimetype.toLowerCase() !== mime)
      reject(
        415,
        "文件内容、扩展名或媒体类型不匹配，仅支持 JPEG、PNG、GIF、MP4 和 WebM",
      );
    const limit = video ? config.maxVideoBytes : config.maxImageBytes;
    if (!bytes.length || bytes.length > limit)
      reject(413, `文件大小超过 ${Math.floor(limit / 1024 / 1024)}MB 限制`);
    const name = part.filename.replace(/[\r\n]/g, "").slice(0, 200);
    if (!config.imgurClientId && !config.imgurAccessToken)
      reject(503, "Imgur 尚未配置，请在项目根目录 .env 设置 IMGUR_CLIENT_ID");
    const form = new FormData();
    form.append("type", "file");
    form.append("name", name);
    form.append(
      video ? "video" : "image",
      new Blob([new Uint8Array(bytes)], { type: mime }),
      name,
    );
    try {
      const response = await (config.fetch ?? globalThis.fetch)(
        "https://api.imgur.com/3/upload",
        {
          method: "POST",
          body: form,
          headers: {
            Authorization: config.imgurAccessToken
              ? `Bearer ${config.imgurAccessToken}`
              : `Client-ID ${config.imgurClientId}`,
          },
          signal: AbortSignal.timeout(90_000),
        },
      );
      if (response.status === 429)
        reject(429, "Imgur 上传额度暂时用尽，请稍后重试");
      if (response.status === 401 || response.status === 403)
        reject(
          502,
          "Imgur 认证失败，请检查 Client ID 或 Access Token 是否有效",
        );
      if (!response.ok)
        reject(502, "Imgur 上传失败，请检查文件格式、大小及视频时长后重试");
      const data: unknown = await response.json();
      if (
        !data ||
        typeof data !== "object" ||
        !("success" in data) ||
        data.success !== true ||
        !("status" in data) ||
        typeof data.status !== "number" ||
        data.status < 200 ||
        data.status >= 300 ||
        !("data" in data) ||
        !data.data ||
        typeof data.data !== "object" ||
        !("link" in data.data)
      )
        reject(502, "Imgur 未返回可用的媒体地址，文件未插入文章");
      const link =
        video && "mp4" in data.data && data.data.mp4
          ? data.data.mp4
          : data.data.link;
      if (typeof link !== "string") reject(502, "Imgur 返回了无效的媒体地址");
      const url = new URL(link);
      if (
        url.protocol !== "https:" ||
        url.hostname !== "i.imgur.com" ||
        url.username ||
        url.password ||
        url.port
      )
        reject(502, "Imgur 返回了无效的媒体地址");
      if (video && !/\.(mp4|webm)$/i.test(url.pathname))
        reject(502, "Imgur 视频尚未返回可播放地址，文件未插入文章");
      return {
        type: video ? "video" : "image",
        name,
        url: url.href,
      } satisfies UploadResult;
    } catch (error) {
      if (error instanceof Error && "statusCode" in error) throw error;
      reject(502, "Imgur 服务暂不可用，文件未插入文章，请重试");
    }
  });
}
