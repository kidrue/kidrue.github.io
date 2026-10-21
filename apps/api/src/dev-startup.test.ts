import { expect, it } from "vitest";
import { createServer } from "node:net";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startDevDatabase } from "./dev-database.js";

it.each([false, true])(
  "端口占用时提前退出，不连接数据库（IPC=%s）",
  async (ipc) => {
    const occupied = createServer();
    await new Promise<void>((resolve) =>
      occupied.listen(0, "127.0.0.1", resolve),
    );
    const address = occupied.address();
    if (!address || typeof address === "string")
      throw new Error("No test port");
    const child = spawn(process.execPath, ["scripts/dev.mjs"], {
      cwd: fileURLToPath(new URL("../../../", import.meta.url)),
      windowsHide: true,
      env: {
        ...process.env,
        PORT: String(address.port),
        WEB_PORT: "0",
        DATABASE_URL: "postgresql://test:test@127.0.0.1:9/test",
      },
      stdio: ipc
        ? ["ignore", "pipe", "pipe", "ipc"]
        : ["ignore", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.on("data", (chunk) => {
      output += chunk;
    });
    child.stderr.on("data", (chunk) => {
      output += chunk;
    });
    try {
      const code = await new Promise<number | null>((resolve, reject) => {
        child.once("error", reject);
        child.once("exit", resolve);
      });
      expect(code).toBe(1);
      expect(output).toContain(String(address.port));
      expect(output).toContain("已被占用");
      expect(output).not.toContain("PrismaClientInitializationError");
      expect(output).not.toContain("EADDRINUSE");
    } finally {
      child.kill();
      await new Promise<void>((resolve) => occupied.close(() => resolve()));
    }
  },
  30000,
);

it("联合开发启动 Vite 前后端并在关闭后释放端口", async () => {
  const directory = await mkdtemp(join(tmpdir(), "kidrue-vite-startup-"));
  const database = await startDevDatabase({ directory, port: 0 });
  const probe = createServer();
  await new Promise<void>((resolve) => probe.listen(0, "127.0.0.1", resolve));
  const address = probe.address();
  if (!address || typeof address === "string") throw new Error("No test port");
  await new Promise<void>((resolve) => probe.close(() => resolve()));
  const child = spawn(process.execPath, ["scripts/dev.mjs"], {
    cwd: fileURLToPath(new URL("../../../", import.meta.url)),
    windowsHide: true,
    env: {
      ...process.env,
      DATABASE_URL: database.databaseUrl,
      PORT: String(address.port),
      WEB_PORT: "0",
    },
    stdio: ["ignore", "pipe", "pipe", "ipc"],
  });
  const exited = new Promise<number | null>((resolve) =>
    child.once("exit", resolve),
  );
  let output = "";
  const collect = (chunk: Buffer) => {
    output += chunk.toString().replace(/\u001b\[[0-9;]*m/g, "");
  };
  child.stdout.on("data", collect);
  child.stderr.on("data", collect);
  try {
    const deadline = Date.now() + 35000;
    let apiUrl = "";
    let webUrl = "";
    while (Date.now() < deadline) {
      if (child.exitCode !== null)
        throw new Error(`开发启动提前退出：${output}`);
      apiUrl =
        output.match(/Server listening at (http:\/\/127\.0\.0\.1:\d+)/)?.[1] ??
        "";
      webUrl = output.match(/Local:\s+(http:\/\/127\.0\.0\.1:\d+)/)?.[1] ?? "";
      if (apiUrl && webUrl) break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    expect(apiUrl, output).not.toBe("");
    expect(webUrl, output).not.toBe("");
    expect((await fetch(`${apiUrl}/api/health`)).status).toBe(200);
    const html = await (await fetch(webUrl)).text();
    expect(html).toContain("/@vite/client");
    expect((await fetch(`${webUrl}/api/health`)).status).toBe(200);
    child.send({ type: "shutdown" });
    const shutdownTimeout = setTimeout(() => child.kill("SIGKILL"), 10000);
    try {
      expect(await exited, output).toBe(0);
    } finally {
      clearTimeout(shutdownTimeout);
    }
    await expect(fetch(`${apiUrl}/api/health`)).rejects.toThrow();
    await expect(fetch(webUrl)).rejects.toThrow();
  } catch (error) {
    throw new Error(`联合开发验证失败：${output}`, { cause: error });
  } finally {
    if (child.connected) child.send({ type: "shutdown" });
    const forced = setTimeout(() => child.kill("SIGKILL"), 7000);
    await exited;
    clearTimeout(forced);
    await database.close();
    await rm(directory, { recursive: true, force: true });
  }
}, 45000);

it("开发后端收到关闭消息后退出并释放监听端口", async () => {
  const directory = await mkdtemp(join(tmpdir(), "kidrue-startup-test-"));
  const database = await startDevDatabase({ directory, port: 0 });
  const child = spawn(
    process.execPath,
    ["--import", "tsx", "apps/api/src/index.ts"],
    {
      cwd: fileURLToPath(new URL("../../../", import.meta.url)),
      windowsHide: true,
      env: {
        ...process.env,
        PORT: "0",
        NODE_ENV: "development",
        DATABASE_URL: database.databaseUrl,
      },
      stdio: ["ignore", "pipe", "pipe", "ipc"],
    },
  );
  const exited = new Promise<number | null>((resolve) =>
    child.once("exit", resolve),
  );
  let output = "";
  child.stderr.on("data", (chunk) => {
    output += chunk;
  });
  try {
    const port = await new Promise<number>((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error(`Startup timed out: ${output}`)),
        15000,
      );
      child.once("error", (error) => {
        clearTimeout(timeout);
        reject(error);
      });
      child.once("exit", () => {
        clearTimeout(timeout);
        reject(new Error(`Exited before ready: ${output}`));
      });
      child.stdout.on("data", (chunk) => {
        output += chunk;
        const match = output.match(
          /Server listening at http:\/\/127\.0\.0\.1:(\d+)/,
        );
        if (match) {
          clearTimeout(timeout);
          resolve(Number(match[1]));
        }
      });
    });
    const url = `http://127.0.0.1:${port}/api/health`;
    expect((await fetch(url)).status).toBe(200);
    child.send({ type: "shutdown" });
    expect(await exited).toBe(0);
    await expect(fetch(url)).rejects.toThrow();
  } finally {
    if (child.exitCode === null) child.kill();
    await exited;
    await database.close();
    await rm(directory, { recursive: true, force: true });
  }
}, 30000);
