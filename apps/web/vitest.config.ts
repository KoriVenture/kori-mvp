import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^next\/server$/,
        replacement: "next/server.js",
      },
    ],
    dedupe: ["react", "react-dom"],
    noExternal: ["next-intl"],
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    exclude: configDefaults.exclude,
    setupFiles: ["./test/setup.ts"],
  },
});
