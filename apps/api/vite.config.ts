import { isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = fileURLToPath(new URL("./", import.meta.url));
const source = fileURLToPath(new URL("./src/", import.meta.url));

export default defineConfig(({ mode }) => ({
  root,
  publicDir: false,
  build: {
    ssr: true,
    target: "node22",
    outDir: mode === "development" ? ".dev" : "dist",
    emptyOutDir: true,
    minify: false,
    sourcemap: true,
    rollupOptions: {
      input: {
        production: `${source}production.ts`,
        index: `${source}index.ts`,
        "dev-database": `${source}dev-database.ts`,
      },
      // Node resolves installed packages, including Prisma engines and PGlite WASM.
      external: (id) =>
        !id.startsWith(".") && !id.startsWith("\0") && !isAbsolute(id),
      output: {
        format: "es",
        preserveModules: true,
        preserveModulesRoot: source,
        entryFileNames: "[name].js",
        minifyInternalExports: false,
      },
    },
  },
  plugins: [
    {
      name: "watch-shared-contracts",
      buildStart() {
        this.addWatchFile(
          fileURLToPath(
            new URL("../../packages/shared/dist/index.js", import.meta.url),
          ),
        );
      },
    },
  ],
}));
