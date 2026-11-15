import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./lustrous-grid.js";

const meta: Meta = {
  title: "Primitives/Grid",
  component: "lustrous-grid",
};
export default meta;

export const ThreeColumns: StoryObj = {
  render: () => html`
    <lustrous-grid columns="3" gap="m">
      <lustrous-grid-item col-span="2" padding="m" background="surface-container" border-radius="m">Span 2</lustrous-grid-item>
      <lustrous-grid-item padding="m" background="primary-container" border-radius="m">Span 1</lustrous-grid-item>
    </lustrous-grid>
  `,
};
