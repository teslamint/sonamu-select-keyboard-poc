import { defineConfig } from "@playwright/test";
export default defineConfig({
  testMatch: "poc.spec.ts",
  use: { baseURL: "http://localhost:5199" },
  webServer: { command: "npx vite", port: 5199, reuseExistingServer: false },
});
