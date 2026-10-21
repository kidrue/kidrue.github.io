import { spawn } from "node:child_process";
import { build } from "vite";
import { stopChild } from "./process-lifecycle.mjs";

export async function startApiDevelopment({
  configFile,
  entry,
  cwd,
  env = process.env,
  onOutput,
  onBuildError = (error) => console.error(error.message),
  onFatal = (error) => console.error(error.message),
}) {
  let child;
  let closing;
  let failed = false;
  let revision = 0;
  let pending = Promise.resolve();
  const watcher = await build({
    configFile,
    mode: "development",
    build: { watch: {} },
  });

  async function close() {
    closing ??= (async () => {
      await watcher.close();
      await pending;
      const previous = child;
      child = undefined;
      await stopChild(previous);
    })();
    return closing;
  }

  watcher.on("event", (event) => {
    if (event.code === "START") failed = false;
    if (event.code === "ERROR") {
      failed = true;
      onBuildError(event.error);
    }
    if (event.code === "BUNDLE_END") void event.result.close();
    if (event.code !== "END" || failed || closing) return;
    const currentRevision = ++revision;
    pending = pending
      .then(async () => {
        if (closing || currentRevision !== revision) return;
        const previous = child;
        child = undefined;
        await stopChild(previous);
        if (closing || currentRevision !== revision) return;
        const next = spawn(process.execPath, ["--enable-source-maps", entry], {
          cwd,
          env: { ...env, NODE_ENV: "development" },
          stdio: [
            "inherit",
            onOutput ? "pipe" : "inherit",
            onOutput ? "pipe" : "inherit",
            "ipc",
          ],
          windowsHide: true,
        });
        child = next;
        if (onOutput) {
          next.stdout.on("data", (chunk) => onOutput(chunk.toString()));
          next.stderr.on("data", (chunk) => onOutput(chunk.toString()));
        }
        const fail = (error) => {
          if (child !== next || closing) return;
          onFatal(error);
          void close();
        };
        next.once("error", fail);
        next.once("exit", (code, signal) =>
          fail(new Error(`开发 API 已退出（${signal ?? code}）。`)),
        );
      })
      .catch((error) => {
        onFatal(error);
        void close();
      });
  });
  return { close };
}
