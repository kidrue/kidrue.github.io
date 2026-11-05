import { defineConfig } from "@playwright/test";
import config from "./playwright.config";

export default defineConfig({
  ...config,
  testMatch: ["**/static-blog.spec.ts", "**/about.spec.ts"],
  webServer: {
    command:
      "node node_modules/vite/bin/vite.js preview apps/web --host 127.0.0.1 --port 5173 --strictPort",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: false,
  },
});
