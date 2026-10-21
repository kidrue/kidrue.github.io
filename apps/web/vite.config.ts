import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
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
    plugins: [react()],
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
