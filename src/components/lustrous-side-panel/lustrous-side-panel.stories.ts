import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../lustrous-box/lustrous-box.js";
import "../lustrous-flex/lustrous-flex.js";
import "../lustrous-icon-button/lustrous-icon-button.js";
import "../lustrous-text/lustrous-text.js";
import "./lustrous-side-panel.js";

const meta: Meta = {
  title: "Shell/Side Panel",
  component: "lustrous-side-panel",
  parameters: { layout: "fullscreen" },
};
export default meta;

export const Split: StoryObj = {
  render: () => html`
    <div style="height: 420px; display: grid; grid-template-columns: 1fr 340px; background: var(--lustrous-color-background);">
      <lustrous-box padding="2xl">
        <lustrous-text variant="headline-medium" heading="2">Workspace Canvas</lustrous-text>
        <lustrous-text muted block>Select an artifact to inspect its properties in the side panel.</lustrous-text>
      </lustrous-box>
      <lustrous-side-panel open label="Artifact details">
        <lustrous-flex slot="header" justify="between" align="center" padding="l">
          <lustrous-text variant="headline-small" heading="2">Details</lustrous-text>
          <lustrous-icon-button icon="close" size="s" aria-label="Close details"></lustrous-icon-button>
        </lustrous-flex>
        <lustrous-box padding-inline="l" padding-bottom="l">
          <lustrous-text muted block>Created 12 minutes ago · 3 contributors</lustrous-text>
        </lustrous-box>
      </lustrous-side-panel>
    </div>
  `,
};

export const Takeover: StoryObj = {
  render: () => html`
    <div style="height: 420px;">
      <lustrous-side-panel open presentation="takeover" label="Mobile inspector">
        <lustrous-flex slot="header" justify="between" align="center" padding="l" border-bottom>
          <lustrous-text variant="headline-small" heading="2">Inspector</lustrous-text>
          <lustrous-icon-button icon="close" size="s" aria-label="Close inspector"></lustrous-icon-button>
        </lustrous-flex>
        <lustrous-box padding="l">
          <lustrous-text block>Full-bleed takeover presentation for compact viewports.</lustrous-text>
        </lustrous-box>
      </lustrous-side-panel>
    </div>
  `,
};
