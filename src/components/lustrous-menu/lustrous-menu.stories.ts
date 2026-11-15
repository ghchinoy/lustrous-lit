import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../lustrous-button/lustrous-button.js";
import "./lustrous-menu.js";

const meta: Meta = {
  title: "Overlays/Menu",
  component: "lustrous-menu",
  parameters: { layout: "fullscreen" },
};
export default meta;

export const Default: StoryObj = {
  render: () => html`
    <div style="height: 420px; padding: 32px;">
      <lustrous-menu
        open
        label="Workspace actions"
        .items=${[
          { type: "header", label: "File" },
          { type: "action", label: "New document", icon: "add", shortcut: "⌘N" },
          { type: "action", label: "Duplicate", icon: "copy", badge: "Beta" },
          { type: "toggle", label: "Auto-save", icon: "sync", checked: true },
          { type: "divider" },
          {
            type: "submenu",
            label: "Share",
            icon: "share",
            items: [
              { type: "action", label: "Copy public link", icon: "link" },
              { type: "action", label: "Export PDF", icon: "download" },
            ],
          },
          { type: "divider" },
          { type: "action", label: "Move to trash", icon: "delete", destructive: true },
        ]}
      >
        <lustrous-button slot="trigger" variant="tonal" trailing-icon="chevronDown">Workspace</lustrous-button>
      </lustrous-menu>
    </div>
  `,
};
