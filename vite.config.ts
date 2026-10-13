import { defineConfig } from "vitest/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const nodeModule = (names: string) => new RegExp(`[\\\\/]node_modules[\\\\/](${names})[\\\\/]`);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "vendor",
              test: nodeModule("react|react-dom|react-router|react-router-dom|scheduler"),
            },
            {
              name: "redux",
              test: nodeModule("@reduxjs|react-redux|redux|immer|reselect|redux-thunk"),
            },
            { name: "charts", test: nodeModule("lightweight-charts|fancy-canvas") },
          ],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/test/**",
        "src/main.tsx",
        "src/vite-env.d.ts",
        "src/shared/types/**",
      ],
      reporter: ["text", "html"],
      thresholds: { statements: 95, branches: 88, functions: 88, lines: 95 },
    },
  },
});
