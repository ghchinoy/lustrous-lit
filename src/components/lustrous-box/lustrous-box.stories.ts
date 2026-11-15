import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./lustrous-box.js";

const meta: Meta = {
  title: "Primitives/Box",
  component: "lustrous-box",
};
export default meta;

export const Surfaces: StoryObj = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
      <lustrous-box padding="l" background="surface" border border-radius="m">surface</lustrous-box>
      <lustrous-box padding="l" background="surface-container" border-radius="m">surface-container</lustrous-box>
      <lustrous-box padding="l" background="primary-container" border-radius="m">primary-container</lustrous-box>
      <lustrous-box padding="l" background="accent-container" border-radius="m">accent-container</lustrous-box>
      <lustrous-box padding="l" background="positive-container" border-radius="m">positive-container</lustrous-box>
      <lustrous-box padding="l" background="surface-bright" border-radius="m" shadow>elevated</lustrous-box>
    </div>
  `,
};
