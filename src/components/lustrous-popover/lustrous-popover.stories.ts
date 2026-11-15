import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../lustrous-button/lustrous-button.js";
import "../lustrous-checkbox/lustrous-checkbox.js";
import "../lustrous-flex/lustrous-flex.js";
import "../lustrous-icon-button/lustrous-icon-button.js";
import "./lustrous-popover.js";

const meta: Meta = {
  title: "Overlays/Popover",
  component: "lustrous-popover",
  parameters: { layout: "fullscreen" },
};
export default meta;

export const WithArrow: StoryObj = {
  render: () => html`
    <div style="height: 420px; padding: 48px; display: flex; justify-content: center; align-items: flex-start;">
      <lustrous-popover
        open
        side="bottom"
        heading="Context retention"
        content="Pinned artifacts stay available across sessions without consuming active quota."
        primary-action="Got it"
      >
        <lustrous-icon-button icon="info" variant="tonal" aria-label="Context retention details"></lustrous-icon-button>
      </lustrous-popover>
    </div>
  `,
};

export const FlatPanel: StoryObj = {
  render: () => html`
    <div style="height: 420px; padding: 48px; display: flex; justify-content: flex-start; align-items: flex-start;">
      <lustrous-popover
        open
        arrow="false"
        side="bottom"
        align="start"
        size="m"
        heading="View filters"
        primary-action="Apply"
        secondary-action="Reset"
      >
        <lustrous-button variant="tonal" icon="sliders">Filters</lustrous-button>
        <lustrous-flex slot="content" direction="column" gap="xs">
          <lustrous-checkbox checked>Include archived items</lustrous-checkbox>
          <lustrous-checkbox>Only assigned to me</lustrous-checkbox>
        </lustrous-flex>
      </lustrous-popover>
    </div>
  `,
};
