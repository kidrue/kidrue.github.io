import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv, normalizePath } from "vite";
import react from "@vitejs/plugin-react";

const root = fileURLToPath(new URL("./", import.meta.url));
const workspace = fileURLToPath(new URL("../../", import.meta.url));

export default defineConfig(({ mode }) => {
  // Only VITE_* values are exposed to the client; the rest configure the server.
  const env = { ...loadEnv(mode, workspace, ""), ...process.env };
  const proxy = Object.fromEntries(
    ["/api", "/uploads"].map((path) => [
      path,
      {
        target: env.API_PROXY_URL ?? `http://127.0.0.1:${env.PORT ?? 3001}`,
        changeOrigin: false,
      },
    ]),
  );
  return {
    root,
    envDir: workspace,
    plugins: [
      react(),
      {
        name: "watch-local-diaries",
        configureServer(server) {
          // 日记位于 Vite 根目录之外，显式监听才能发现新建和删除的文件。
          const directory = normalizePath(
            fileURLToPath(new URL("../../日记", import.meta.url)),
          );
          server.watcher.add(directory);
          const refreshDiary = (event: string, path: string) => {
            const file = normalizePath(path);
            if (
              !["add", "change", "unlink"].includes(event) ||
              !file.startsWith(`${directory}/`) ||
              !file.endsWith(".md")
            )
              return;
            const parts = file.slice(directory.length + 1).split("/");
            if (
              parts.some((part) => part.startsWith("_")) ||
              /^readme\.md$/i.test(parts.at(-1)!)
            )
              return;
            // 根目录外的 glob 新增文件在 Windows 下不会自动使导入模块失效。
            server.moduleGraph.invalidateAll();
            server.ws.send({ type: "full-reload" });
          };
          server.watcher.on("all", refreshDiary);
          server.httpServer?.once("close", () =>
            server.watcher.off("all", refreshDiary),
          );
        },
      },
    ],
    server: {
      host: "127.0.0.1",
      port: Number(env.WEB_PORT ?? 5174),
      strictPort: true,
      proxy,
    },
    preview: {
      host: "127.0.0.1",
      port: Number(env.PREVIEW_PORT ?? 4173),
      strictPort: true,
      proxy,
    },
    cacheDir:
      process.env.PLAYWRIGHT_TEST === "true"
        ? "node_modules/.vite-playwright"
        : "node_modules/.vite",
  };
});
