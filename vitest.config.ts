import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

// Set CHROMIUM_PATH to use a system Chromium instead of Playwright's download.
const executablePath = process.env.CHROMIUM_PATH || undefined;
// LUSTROUS_BROWSERS=chromium,firefox,webkit runs the suite across engines.
const browsers = (process.env.LUSTROUS_BROWSERS || "chromium")
  .split(",")
  .map((b) => b.trim()) as ("chromium" | "firefox" | "webkit")[];

export default defineConfig({
  // Pre-bundle Lit entry points and directives so Vite doesn't re-optimize mid-run.
  optimizeDeps: {
    include: [
      "lit",
      "lit/decorators.js",
      "lit/directives/if-defined.js",
      "lit/directives/live.js",
      "lit/directives/repeat.js",
    ],
  },
  test: {
    include: ["src/**/*.test.ts"],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: browsers.map((browser) =>
        browser === "chromium"
          ? { browser, provider: playwright({ launchOptions: { executablePath } }) }
          : { browser },
      ),
    },
  },
});
