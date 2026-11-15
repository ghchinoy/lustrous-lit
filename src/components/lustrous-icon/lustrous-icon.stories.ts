import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./lustrous-icon.js";

const meta: Meta = {
  title: "Components/Icon",
  component: "lustrous-icon",
};
export default meta;

export const SizesAndTones: StoryObj = {
  render: () => html`
    <div style="display: flex; align-items: center; gap: 16px;">
      <lustrous-icon name="bolt" size="xs"></lustrous-icon>
      <lustrous-icon name="bolt" size="s"></lustrous-icon>
      <lustrous-icon name="bolt" size="m" tone="primary"></lustrous-icon>
      <lustrous-icon name="checkCircle" size="l" tone="positive"></lustrous-icon>
      <lustrous-icon name="warning" size="xl" tone="warning"></lustrous-icon>
      <lustrous-icon name="error" size="l" tone="error"></lustrous-icon>
    </div>
  `,
};
