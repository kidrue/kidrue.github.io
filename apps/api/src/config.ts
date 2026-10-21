import "dotenv/config";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

loadEnv({ path: fileURLToPath(new URL("../../../.env", import.meta.url)) });

export const workspaceData = fileURLToPath(
  new URL("../../../.data/", import.meta.url),
);
export function readConfig() {
  const production = process.env.NODE_ENV === "production";
  const adminPassword =
    process.env.ADMIN_PASSWORD ?? (production ? "" : "kidrue-local");
  const sessionSecret =
    process.env.SESSION_SECRET ??
    (production ? "" : "kidrue-local-session-development-secret");
  if (
    production &&
    (adminPassword.length < 12 ||
      sessionSecret.length < 32 ||
      !process.env.DATABASE_URL)
  ) {
    throw new Error(
      "生产环境必须设置 DATABASE_URL、至少 12 字符的 ADMIN_PASSWORD 和至少 32 字符的 SESSION_SECRET",
    );
  }
  return {
    databaseUrl: process.env.DATABASE_URL,
    adminPassword,
    sessionSecret,
    development: !production,
    port: Number(process.env.PORT ?? 3001),
    host: process.env.HOST ?? "127.0.0.1",
    origin: process.env.PUBLIC_ORIGIN,
    trustProxy:
      process.env.TRUST_PROXY?.split(",")
        .map((value) => value.trim())
        .filter(Boolean) ?? (false as const),
    imgurClientId: process.env.IMGUR_CLIENT_ID,
    imgurAccessToken: process.env.IMGUR_ACCESS_TOKEN,
    mediaDirectory:
      process.env.MEDIA_DIRECTORY ??
      fileURLToPath(new URL("../../../.data/videos/", import.meta.url)),
    maxImageBytes: Number(process.env.MAX_IMAGE_BYTES ?? 10 * 1024 * 1024),
    maxVideoBytes: Number(process.env.MAX_VIDEO_BYTES ?? 100 * 1024 * 1024),
    logger: true,
  };
}
