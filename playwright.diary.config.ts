import { defineConfig } from "@playwright/test";
import config from "./playwright.config";

export default defineConfig({
  ...config,
  testMatch: "**/diary-files.integration.ts",
  fullyParallel: false,
  workers: 1,
});
