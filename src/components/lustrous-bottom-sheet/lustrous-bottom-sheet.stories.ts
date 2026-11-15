import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../lustrous-button/lustrous-button.js";
import "../lustrous-flex/lustrous-flex.js";
import "../lustrous-text/lustrous-text.js";
import "./lustrous-bottom-sheet.js";

const meta: Meta = {
  title: "Overlays/Bottom Sheet",
  component: "lustrous-bottom-sheet",
  parameters: { layout: "fullscreen" },
};
export default meta;

export const Default: StoryObj = {
  render: () => html`
    <div style="height: 420px; padding: 32px;">
      <lustrous-bottom-sheet open label="Share workspace">
        <lustrous-flex direction="column" gap="m">
          <lustrous-text variant="headline-small" heading="2">Share workspace</lustrous-text>
          <lustrous-text muted block>Invite teammates or copy a read-only preview link.</lustrous-text>
          <lustrous-flex gap="s">
            <lustrous-button variant="accent" icon="copy">Copy link</lustrous-button>
            <lustrous-button variant="tonal" icon="mail">Send invite</lustrous-button>
          </lustrous-flex>
        </lustrous-flex>
      </lustrous-bottom-sheet>
    </div>
  `,
};

export const FullSnapPoint: StoryObj = {
  render: () => html`
    <div style="height: 420px; padding: 32px;">
      <lustrous-bottom-sheet open default-snap-point="1" label="Export options">
        <lustrous-flex direction="column" gap="s">
          <lustrous-text variant="headline-small" heading="2">Export report</lustrous-text>
          <lustrous-text muted block>Select a format to download the current metrics snapshot.</lustrous-text>
          <lustrous-button variant="tonal" icon="download">Download CSV</lustrous-button>
        </lustrous-flex>
      </lustrous-bottom-sheet>
    </div>
  `,
};
