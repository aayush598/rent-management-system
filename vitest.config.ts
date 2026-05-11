import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./lib/test-setup.ts"],
    include: ["__tests__/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["app/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
      exclude: ["node_modules", ".next", "__tests__"],
    },
    css: true,
    mockReset: true,
    restoreMocks: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
});
