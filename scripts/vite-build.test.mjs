import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawn, spawnSync } from "node:child_process";
import { build, resolveConfig } from "vite";
import { stopChild } from "./process-lifecycle.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const api = join(root, "apps/api");

test("Vite 后端产物保留运行时路径、数据库能力和生产配置校验", async () => {
  const output = await mkdtemp(join(api, ".dev-test-"));
  const data = await mkdtemp(join(tmpdir(), "kidrue-vite-db-"));
  let app;
  let database;
  let productionServer;
  let productionLogs = "";
  try {
    await build({
      configFile: join(api, "vite.config.ts"),
      logLevel: "silent",
      build: { outDir: output, emptyOutDir: true },
    });
    const compiledConfig = await import(
      pathToFileURL(join(output, "config.js"))
    );
    const previousMode = process.env.NODE_ENV;
    const previousMedia = process.env.MEDIA_DIRECTORY;
    try {
      process.env.NODE_ENV = "development";
      delete process.env.MEDIA_DIRECTORY;
      assert.equal(
        compiledConfig.readConfig().mediaDirectory,
        join(root, ".data/videos/"),
      );
    } finally {
      if (previousMode === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = previousMode;
      if (previousMedia === undefined) delete process.env.MEDIA_DIRECTORY;
      else process.env.MEDIA_DIRECTORY = previousMedia;
    }
    const production = spawnSync(
      process.execPath,
      [join(output, "production.js")],
      {
        cwd: root,
        env: {
          ...process.env,
          NODE_ENV: "development",
          DATABASE_URL: "",
          ADMIN_PASSWORD: "",
          SESSION_SECRET: "",
        },
        encoding: "utf8",
        timeout: 15000,
        windowsHide: true,
      },
    );
    assert.equal(production.status, 1);
    assert.match(production.stderr, /生产环境必须设置 DATABASE_URL/);
    assert.doesNotMatch(production.stdout, /使用本地持久化开发 PostgreSQL/);
    const { startDevDatabase } = await import(
      pathToFileURL(join(output, "dev-database.js"))
    );
    database = await startDevDatabase({
      directory: join(data, "postgres"),
      port: 0,
    });
    const { createApp } = await import(pathToFileURL(join(output, "app.js")));
    await mkdir(join(data, "videos"));
    await writeFile(join(data, "videos", "legacy.mp4"), "legacy-video-content");
    app = await createApp({
      databaseUrl: database.databaseUrl,
      adminPassword: "vite-test-password",
      sessionSecret: "vite-test-session-secret-long-enough",
      mediaDirectory: join(data, "videos"),
      origin: "http://localhost:5174",
      development: true,
      logger: false,
    });
    assert.equal((await app.inject("/api/health")).statusCode, 200);
    const media = await app.inject({
      url: "/uploads/videos/legacy.mp4",
      headers: { range: "bytes=0-5" },
    });
    assert.equal(media.statusCode, 206);
    assert.equal(media.body, "legacy");
    const source = await readFile(join(output, "app.js"), "utf8");
    assert.match(source, /from ["']@prisma\/client["']/);
    assert.match(source, /from ["']@kidrue\/shared["']/);
    await app.close();
    app = undefined;
    // The PGlite socket bridge shares prepared statements across clients.
    // Give the production process its own clean PostgreSQL test instance.
    await database.close();
    database = await startDevDatabase({
      directory: join(data, "production-postgres"),
      port: 0,
    });
    productionServer = spawn(
      process.execPath,
      [join(output, "production.js")],
      {
        cwd: root,
        env: {
          ...process.env,
          NODE_ENV: "development",
          DATABASE_URL: database.databaseUrl,
          ADMIN_PASSWORD: "production-test-password",
          SESSION_SECRET: "production-test-session-secret-long-enough",
          MEDIA_DIRECTORY: join(data, "videos"),
          PORT: "0",
          HOST: "127.0.0.1",
        },
        stdio: ["ignore", "pipe", "pipe", "ipc"],
        windowsHide: true,
      },
    );
    const url = await new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error(`生产产物启动超时：${productionLogs}`)),
        15000,
      );
      const fail = (error) => {
        clearTimeout(timeout);
        reject(error);
      };
      productionServer.once("error", fail);
      productionServer.once("exit", () =>
        fail(new Error(`生产产物提前退出：${productionLogs}`)),
      );
      productionServer.stderr.on("data", (chunk) => {
        productionLogs += chunk;
      });
      productionServer.stdout.on("data", (chunk) => {
        productionLogs += chunk;
        const match = productionLogs.match(
          /Server listening at (http:\/\/127\.0\.0\.1:\d+)/,
        );
        if (match) {
          clearTimeout(timeout);
          resolve(match[1]);
        }
      });
    });
    const health = await fetch(`${url}/api/health`, {
      signal: AbortSignal.timeout(5000),
    });
    assert.equal(health.status, 200, productionLogs);
    assert.deepEqual(await health.json(), { ok: true, database: "postgresql" });
  } finally {
    await stopChild(productionServer);
    await app?.close();
    await database?.close();
    await rm(output, { recursive: true, force: true });
    await rm(data, { recursive: true, force: true });
  }
});

test("前端开发和预览共用根配置，服务端凭据不进入客户端环境", async () => {
  const previous = { ...process.env };
  try {
    process.env.WEB_PORT = "5187";
    process.env.PREVIEW_PORT = "4187";
    process.env.API_PROXY_URL = "http://127.0.0.1:3099";
    process.env.IMGUR_ACCESS_TOKEN = "server-only-test-secret";
    const config = await resolveConfig(
      { configFile: join(root, "apps/web/vite.config.ts") },
      "serve",
    );
    assert.equal(config.server.port, 5187);
    assert.equal(config.server.strictPort, true);
    assert.equal(config.preview.port, 4187);
    assert.equal(config.preview.proxy["/api"].target, "http://127.0.0.1:3099");
    assert.equal(config.env.IMGUR_ACCESS_TOKEN, undefined);
    assert.equal(config.envDir, root.replaceAll("\\", "/").replace(/\/$/, ""));
  } finally {
    for (const key of Object.keys(process.env))
      if (!(key in previous)) delete process.env[key];
    Object.assign(process.env, previous);
  }
});
