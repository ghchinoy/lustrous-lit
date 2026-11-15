import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./lustrous-badge-indicator.js";

const meta: Meta = {
  title: "Components/BadgeIndicator",
  component: "lustrous-badge-indicator",
};
export default meta;

export const Default: StoryObj = {
  render: () => html`<lustrous-badge-indicator></lustrous-badge-indicator>`,
};
