import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createServer } from "node:net";
import { startApiDevelopment } from "./api-development.mjs";
import { stopChild } from "./process-lifecycle.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
try {
  process.loadEnvFile(fileURLToPath(new URL("../.env", import.meta.url)));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
process.env.NODE_ENV = "development";
const args = process.argv.slice(2);
const webOnly = args.includes("--web");
const apiOnly = args.includes("--api");
if (webOnly && apiOnly)
  throw new Error(
    "--web 和 --api 不能同时指定；联合开发请直接使用 npm run dev。",
  );
const runWeb = !apiOnly;
const runApi = !webOnly;
const webArgs = args.filter((arg) => arg !== "--web" && arg !== "--api");
function option(name, fallback) {
  const equal = webArgs.find((arg) => arg.startsWith(`${name}=`));
  if (equal) return equal.slice(name.length + 1);
  const index = webArgs.indexOf(name);
  return index < 0 ? fallback : webArgs[index + 1];
}
const webPort = option("--port", process.env.WEB_PORT ?? "5174");
const webHost = option("--host", "127.0.0.1");
process.env.WEB_PORT = webPort;

async function checkPort(host, port) {
  const probe = createServer();
  await new Promise((resolve, reject) => {
    probe.once("error", (error) => {
      reject(
        error.code === "EADDRINUSE"
          ? new Error(
              `端口 ${host}:${port} 已被占用。请先在原终端停止对应服务，或修改端口后重试。`,
            )
          : error,
      );
    });
    probe.listen(Number(port), host, () => probe.close(resolve));
  });
}

const children = new Set();
let api;
let closing;
async function close(code = 0) {
  if (closing) return closing;
  process.exitCode = code;
  closing = Promise.all([api?.close(), ...Array.from(children, stopChild)]);
  await closing;
  if (process.connected) process.disconnect();
}
function launch(argv, captureOutput = false) {
  const child = spawn(process.execPath, argv, {
    cwd: root,
    stdio: captureOutput ? ["inherit", "pipe", "inherit"] : "inherit",
    windowsHide: true,
  });
  children.add(child);
  child.once("error", (error) => {
    console.error(error.message);
    void close(1);
  });
  child.once("exit", (code) => {
    children.delete(child);
    if (!closing) void close(code ?? 1);
  });
  return child;
}
function watchShared() {
  return new Promise((resolve, reject) => {
    const child = launch(
      [
        "node_modules/typescript/bin/tsc",
        "-p",
        "packages/shared/tsconfig.json",
        "--watch",
        "--preserveWatchOutput",
        "--pretty",
        "false",
      ],
      true,
    );
    let output = "";
    child.stdout.on("data", (chunk) => {
      process.stdout.write(chunk);
      output = (output + chunk.toString()).slice(-2000);
      if (/Found 0 errors\. Watching for file changes\./.test(output))
        resolve(true);
    });
    child.once("error", reject);
    child.once("exit", () => resolve(false));
  });
}
process.on("SIGINT", () => void close());
process.on("SIGTERM", () => void close());
process.on("message", (message) => {
  if (message?.type === "shutdown") void close();
});
if (process.connected) process.on("disconnect", () => void close());

try {
  if (runApi) {
    await checkPort(
      process.env.HOST ?? "127.0.0.1",
      process.env.PORT ?? "3001",
    );
    if (!process.env.DATABASE_URL) await checkPort("127.0.0.1", "5434");
  }
  if (runWeb) await checkPort(webHost, webPort);
  if (!closing) await watchShared();
  if (runApi && !closing) {
    api = await startApiDevelopment({
      configFile: fileURLToPath(
        new URL("../apps/api/vite.config.ts", import.meta.url),
      ),
      entry: fileURLToPath(
        new URL("../apps/api/.dev/index.js", import.meta.url),
      ),
      cwd: root,
      onFatal: (error) => {
        console.error(error.message);
        void close(1);
      },
    });
    if (closing) await api.close();
  }
  if (runWeb && !closing)
    launch([
      "node_modules/vite/bin/vite.js",
      "apps/web",
      "--host",
      webHost,
      "--port",
      webPort,
      ...webArgs,
    ]);
} catch (error) {
  console.error(error.message);
  await close(1);
}
