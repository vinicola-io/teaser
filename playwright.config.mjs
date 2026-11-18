import { defineConfig } from "@playwright/test";

const port = Number(process.env.PW_TEST_PORT || 4187);
const browserName = process.env.PW_BROWSER || "chromium";
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("Invalid PW_TEST_PORT");
if (!["chromium", "webkit"].includes(browserName)) throw new Error("PW_BROWSER must be chromium or webkit");
const executablePath = process.env.PW_BROWSER_EXECUTABLE_PATH ||
  process.env[`PW_${browserName.toUpperCase()}_EXECUTABLE_PATH`];

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.mjs",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  workers: 1,
  retries: 0,
  timeout: 30_000,
  globalTimeout: 180_000,
  expect: { timeout: 5_000 },
  outputDir: "test-results/artifacts",
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["json", { outputFile: "test-results/results.json" }],
  ],
  use: {
    browserName,
    headless: true,
    baseURL: `http://127.0.0.1:${port}/teaser/`,
    viewport: { width: 1440, height: 1000 },
    locale: "ko-KR",
    reducedMotion: "reduce",
    serviceWorkers: "block",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
    launchOptions: executablePath ? { executablePath } : {},
  },
  webServer: {
    command: "node tests/support/serve.mjs",
    url: `http://127.0.0.1:${port}/teaser/`,
    reuseExistingServer: false,
    timeout: 15_000,
    env: { PW_TEST_PORT: String(port) },
  },
});
