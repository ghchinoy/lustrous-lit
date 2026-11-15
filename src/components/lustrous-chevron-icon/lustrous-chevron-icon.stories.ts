import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./lustrous-chevron-icon.js";

const meta: Meta = {
  title: "Components/ChevronIcon",
  component: "lustrous-chevron-icon",
};
export default meta;

export const States: StoryObj = {
  render: () => html`
    <div style="display: flex; align-items: center; gap: 16px;">
      <lustrous-chevron-icon></lustrous-chevron-icon>
      <lustrous-chevron-icon expanded></lustrous-chevron-icon>
      <lustrous-chevron-icon direction="end"></lustrous-chevron-icon>
      <lustrous-chevron-icon direction="end" expanded></lustrous-chevron-icon>
    </div>
  `,
};
