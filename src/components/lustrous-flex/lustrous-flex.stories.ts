import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./lustrous-flex.js";

const meta: Meta = {
  title: "Primitives/Flex",
  component: "lustrous-flex",
};
export default meta;

export const RowAndColumn: StoryObj = {
  render: () => html`
    <lustrous-flex gap="m" align="center">
      <lustrous-box padding="m" background="surface-container" border-radius="s">First</lustrous-box>
      <lustrous-flex-item grow padding="m" background="primary-container" border-radius="s">Grows</lustrous-flex-item>
      <lustrous-box padding="m" background="surface-container" border-radius="s">Last</lustrous-box>
    </lustrous-flex>
  `,
};
