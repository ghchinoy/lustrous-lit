import { defineConfig, devices } from "@playwright/test";

// Visual regression tests: every Storybook story × light / dark / forced-colors.
// Requires `pnpm build-storybook` first. Set CHROMIUM_PATH to use a system Chromium.
const executablePath = process.env.CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: "tests/visual",
  snapshotPathTemplate: "{arg}{ext}",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"], ["html", { outputFolder: "playwright-report-visual", open: "never" }]],
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002 } },
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://localhost:6007",
    viewport: { width: 1024, height: 640 },
    launchOptions: { executablePath },
  },
  webServer: {
    command: "node scripts/serve-static.mjs storybook-static 6007",
    url: "http://localhost:6007/index.json",
    reuseExistingServer: !process.env.CI,
  },
});
