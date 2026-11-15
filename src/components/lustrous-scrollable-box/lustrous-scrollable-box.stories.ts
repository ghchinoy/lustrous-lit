import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./lustrous-scrollable-box.js";

const meta: Meta = {
  title: "Primitives/ScrollableBox",
  component: "lustrous-scrollable-box",
};
export default meta;

export const Default: StoryObj = {
  render: () => html`
    <lustrous-scrollable-box height="140" width="320" padding="m" background="surface-container" border border-radius="m" label="Activity log">
      <p>Line 1 — System initialized</p>
      <p>Line 2 — Connected to cluster</p>
      <p>Line 3 — Loaded configuration</p>
      <p>Line 4 — Verified TLS certificates</p>
      <p>Line 5 — Ready to serve traffic</p>
    </lustrous-scrollable-box>
  `,
};
