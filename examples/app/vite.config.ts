import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const repoPath = (rel: string) => fileURLToPath(new URL(rel, import.meta.url));

const COMPONENTS = [
  "lustrous-action-bar",
  "lustrous-badge",
  "lustrous-badge-indicator",
  "lustrous-banner",
  "lustrous-bottom-sheet",
  "lustrous-box",
  "lustrous-button",
  "lustrous-checkbox",
  "lustrous-chevron-icon",
  "lustrous-code-block",
  "lustrous-collapsible-card",
  "lustrous-collapsible-container",
  "lustrous-dialog",
  "lustrous-flex",
  "lustrous-grid",
  "lustrous-icon",
  "lustrous-icon-button",
  "lustrous-image",
  "lustrous-kbd",
  "lustrous-keyboard-shortcuts-modal",
  "lustrous-link",
  "lustrous-list",
  "lustrous-menu",
  "lustrous-modal",
  "lustrous-photo-lightbox",
  "lustrous-popover",
  "lustrous-pressable",
  "lustrous-progress-bar",
  "lustrous-prose-text",
  "lustrous-radio-group",
  "lustrous-scrollable-box",
  "lustrous-search-bar",
  "lustrous-segmented-control",
  "lustrous-segmented-list",
  "lustrous-select",
  "lustrous-side-panel",
  "lustrous-sidebar",
  "lustrous-skeleton",
  "lustrous-snackbar",
  "lustrous-spinner",
  "lustrous-split-button",
  "lustrous-switch",
  "lustrous-tabs",
  "lustrous-text",
  "lustrous-text-area",
  "lustrous-text-input",
  "lustrous-timeline",
  "lustrous-togglable-button",
  "lustrous-togglable-icon-button",
  "lustrous-tooltip",
  "lustrous-video-lightbox",
] as const;

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@ghchinoy\/lustrous-lit\/fonts\.css$/,
        replacement: repoPath("../../fonts/lustrous-fonts.css"),
      },
      {
        find: /^@ghchinoy\/lustrous-lit\/theme\.css$/,
        replacement: repoPath("../../dist/lustrous-theme.css"),
      },
      {
        find: /^@ghchinoy\/lustrous-lit\/theme$/,
        replacement: repoPath("../../src/theme/index.ts"),
      },
      ...COMPONENTS.map((name) => ({
        find: new RegExp(`^@ghchinoy/lustrous-lit/components/${name}$`),
        replacement: repoPath(`../../src/components/${name}/${name}.ts`),
      })),
      {
        find: /^@ghchinoy\/lustrous-lit$/,
        replacement: repoPath("../../src/index.ts"),
      },
    ],
  },
  server: {
    allowedHosts: ["localhost", "127.0.0.1", "::1"],
    fs: {
      allow: [repoPath("../..")],
    },
  },
});
