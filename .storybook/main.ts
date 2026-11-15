import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/web-components-vite";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));

const config: StorybookConfig = {
  framework: "@storybook/web-components-vite",
  stories: ["../src/**/*.stories.ts"],
  addons: ["@storybook/addon-docs"],
  core: { disableTelemetry: true },
  viteFinal(viteConfig) {
    viteConfig.server ??= {};
    if (viteConfig.server.allowedHosts !== true) {
      const existing = Array.isArray(viteConfig.server.allowedHosts) ? viteConfig.server.allowedHosts : [];
      viteConfig.server.allowedHosts = [...new Set([...existing, "localhost", "127.0.0.1", "::1"])];
    }
    viteConfig.server.fs ??= {};
    const fsAllow = Array.isArray(viteConfig.server.fs.allow) ? viteConfig.server.fs.allow : [];
    viteConfig.server.fs.allow = [...new Set([...fsAllow, repoRoot])];
    return viteConfig;
  },
};
export default config;
