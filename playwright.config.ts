import { defineConfig, devices } from "@playwright/test";

export default defineConfig({ testDir: "./tests/e2e", timeout: 30_000, use: { baseURL: "http://127.0.0.1:8081", ...devices["Desktop Chrome"] }, webServer: { command: "CI=1 pnpm exec expo start --web", url: "http://127.0.0.1:8081", reuseExistingServer: true, timeout: 120_000 } });
