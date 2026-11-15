import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../lustrous-icon-button/lustrous-icon-button.js";
import "./lustrous-tooltip.js";

const meta: Meta = {
  title: "Overlays/Tooltip",
  component: "lustrous-tooltip",
};
export default meta;

export const Default: StoryObj = {
  render: () => html`
    <div style="padding: 48px; display: flex; justify-content: center;">
      <lustrous-tooltip content="Copy share link" open>
        <lustrous-icon-button icon="copy" variant="tonal" aria-label="Copy link"></lustrous-icon-button>
      </lustrous-tooltip>
    </div>
  `,
};
