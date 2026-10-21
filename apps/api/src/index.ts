import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { readConfig } from "./config.js";

const config = readConfig();
let database: { databaseUrl: string; close(): Promise<void> } | undefined;
if (!config.databaseUrl) {
  const { startDevDatabase } = await import("./dev-database.js");
  database = await startDevDatabase({
    directory: fileURLToPath(
      new URL("../../../.data/postgres", import.meta.url),
    ),
  });
  config.databaseUrl = database.databaseUrl;
  console.log(
    "使用本地持久化开发 PostgreSQL 实例（PGlite），生产请配置 DATABASE_URL。",
  );
}
const app = await createApp({ ...config, databaseUrl: config.databaseUrl });
await app.listen({ port: config.port, host: config.host });
if (config.development)
  console.log(
    `本地文章管理：http://127.0.0.1:${process.env.WEB_PORT ?? 5174}/editor；开发密码：kidrue-local（如已配置则使用 ADMIN_PASSWORD）。`,
  );
let closing = false;
const close = async () => {
  if (closing) return;
  closing = true;
  await app.close();
  await database?.close();
  process.exit(0);
};
process.on("SIGINT", close);
process.on("SIGTERM", close);
process.on("message", (message) => {
  if (
    message &&
    typeof message === "object" &&
    "type" in message &&
    message.type === "shutdown"
  )
    void close();
});
if (process.connected) process.on("disconnect", close);
