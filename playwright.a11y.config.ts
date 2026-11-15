import { defineConfig, devices } from "@playwright/test";

// Accessibility checks: axe-core over every Storybook story (light + dark).
// Requires `pnpm build-storybook` first. Set CHROMIUM_PATH to use a system Chromium.
const executablePath = process.env.CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: "tests/a11y",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"], ["html", { outputFolder: "playwright-report-a11y", open: "never" }]],
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://localhost:6008",
    viewport: { width: 1024, height: 640 },
    launchOptions: { executablePath },
  },
  webServer: {
    command: "node scripts/serve-static.mjs storybook-static 6008",
    url: "http://localhost:6008/index.json",
    reuseExistingServer: !process.env.CI,
  },
});
