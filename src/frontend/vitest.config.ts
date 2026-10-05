import { fileURLToPath, URL } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Vitest configuration for the frontend suite.
 *
 * Mirrors the `@` and `declarations` aliases from `vite.config.js` so tests
 * import application modules exactly as the app does. The DOM environment is
 * supplied by the `test` script (`--environment jsdom`); this file only wires
 * resolution and the jest-dom matchers.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(new URL("../declarations", import.meta.url)),
      },
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
  },
  test: {
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // The sandbox reports a CPU count that makes Vitest's default thread pool
    // conflict with itself ("minThreads and maxThreads must not conflict").
    // A single forked worker is deterministic and avoids the pool entirely.
    pool: "forks",
    poolOptions: {
      forks: {
        minForks: 1,
        maxForks: 1,
      },
    },
  },
});
