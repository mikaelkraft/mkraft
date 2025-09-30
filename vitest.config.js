import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setupTests.js"],
    include: [
      "src/**/*.test.{js,jsx}",
      "test/**/*.test.{js,jsx}",
      "test/**/*.{spec,test}.{js,jsx}",
      "test/ogmeta.perpost.test.jsx",
    ],
  },
});
