import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { readFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { setImmediate } from "node:timers/promises";

export async function startDevDatabase({
  directory,
  port = 5434,
}: {
  directory: string;
  port?: number;
}) {
  await mkdir(directory, { recursive: true });
  const db = await PGlite.create(directory);
  const result = await db.query<{ table: string | null }>(
    "SELECT to_regclass('public.kidrue_articles')::text AS \"table\"",
  );
  if (!result.rows[0]?.table) {
    const migration = await readFile(
      new URL(
        "../prisma/migrations/202610200001_initial/migration.sql",
        import.meta.url,
      ),
      "utf8",
    ).catch(() =>
      readFile(
        new URL(
          "../../prisma/migrations/202610200001_initial/migration.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    await db.exec(migration);
  }
  const server = new PGLiteSocketServer({ db, port, host: "127.0.0.1" });
  await server.start();
  const actualPort = Number(server.getServerConn().split(":").at(-1));
  let closing: Promise<void> | undefined;
  return {
    databaseUrl: `postgresql://postgres:postgres@127.0.0.1:${actualPort}/postgres?connection_limit=1`,
    close: () => {
      closing ??= (async () => {
        await server.stop();
        // pglite-socket 的 close 事件通过 setImmediate 调度 detach；
        // 等这些回调完成后再销毁 WASM，避免回调访问已关闭的数据库。
        await setImmediate();
        await db.close();
      })();
      return closing;
    },
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const database = await startDevDatabase({
    directory: fileURLToPath(
      new URL("../../../.data/postgres", import.meta.url),
    ),
  });
  console.log("开发 PostgreSQL 实例已启动：127.0.0.1:5434");
  const stop = async () => {
    await database.close();
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}
