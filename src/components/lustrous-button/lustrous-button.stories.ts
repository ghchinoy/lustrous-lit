import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./lustrous-button.js";

const meta: Meta = {
  title: "Components/Button",
  component: "lustrous-button",
};
export default meta;

export const Variants: StoryObj = {
  render: () => html`
    <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 10px;">
      <lustrous-button icon="bolt">Accent</lustrous-button>
      <lustrous-button variant="tonal">Tonal</lustrous-button>
      <lustrous-button variant="outline">Outline</lustrous-button>
      <lustrous-button variant="bright">Bright</lustrous-button>
      <lustrous-button variant="on-surface">On surface</lustrous-button>
      <lustrous-button shape="pill" icon="add">Pill</lustrous-button>
      <lustrous-button disabled>Disabled</lustrous-button>
    </div>
  `,
};
