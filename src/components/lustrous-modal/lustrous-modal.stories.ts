import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../lustrous-box/lustrous-box.js";
import "../lustrous-text/lustrous-text.js";
import "./lustrous-modal.js";

const meta: Meta = {
  title: "Overlays/Modal",
  component: "lustrous-modal",
  parameters: { layout: "fullscreen" },
};
export default meta;

export const CustomSurface: StoryObj = {
  render: () => html`
    <div style="height: 360px;">
      <lustrous-modal open label="Quick command">
        <lustrous-box padding="xl" background="surface" border border-radius="l" shadow="2" width="360">
          <lustrous-text variant="headline-small" heading="2">Custom Modal Surface</lustrous-text>
          <lustrous-text muted block>Built on native showModal() with top-layer scrim.</lustrous-text>
        </lustrous-box>
      </lustrous-modal>
    </div>
  `,
};
