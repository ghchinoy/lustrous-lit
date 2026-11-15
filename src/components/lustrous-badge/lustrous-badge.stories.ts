import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./lustrous-badge.js";

const meta: Meta = {
  title: "Components/Badge",
  component: "lustrous-badge",
};
export default meta;

export const Tones: StoryObj = {
  render: () => html`
    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
      <lustrous-badge>Default</lustrous-badge>
      <lustrous-badge tone="accent" icon="bolt">Accent</lustrous-badge>
      <lustrous-badge tone="positive" icon="check">Healthy</lustrous-badge>
      <lustrous-badge tone="warning" icon="warning">Pending</lustrous-badge>
      <lustrous-badge tone="error" icon="error">Failed</lustrous-badge>
      <lustrous-badge tone="cobalt">Cobalt</lustrous-badge>
      <lustrous-badge tone="emerald">Emerald</lustrous-badge>
      <lustrous-badge tone="amber">Amber</lustrous-badge>
      <lustrous-badge tone="rose">Rose</lustrous-badge>
      <lustrous-badge tone="violet">Violet</lustrous-badge>
      <lustrous-badge tone="teal">Teal</lustrous-badge>
    </div>
  `,
};
