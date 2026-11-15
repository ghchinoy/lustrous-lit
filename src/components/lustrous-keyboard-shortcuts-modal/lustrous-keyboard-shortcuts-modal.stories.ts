import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./lustrous-keyboard-shortcuts-modal.js";

const meta: Meta = {
  title: "Overlays/Keyboard Shortcuts Modal",
  component: "lustrous-keyboard-shortcuts-modal",
  parameters: { layout: "fullscreen" },
};
export default meta;

export const Default: StoryObj = {
  render: () => html`
    <div style="height: 460px; padding: 32px;">
      <lustrous-keyboard-shortcuts-modal
        open
        dismissible
        heading="Keyboard shortcuts"
        .sections=${[
          {
            title: "General",
            rows: [
              { description: "Search workspace", keys: ["⌘", "K"] },
              { description: "New document", keys: ["⇧", "⌘", "N"] },
            ],
          },
          {
            title: "Editor",
            rows: [
              { description: "Save changes", keys: ["⌘", "S"] },
              { description: "Dismiss overlay", keys: ["Esc"] },
            ],
          },
        ]}
      ></lustrous-keyboard-shortcuts-modal>
    </div>
  `,
};
