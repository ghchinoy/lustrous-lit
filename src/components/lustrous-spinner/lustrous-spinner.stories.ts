import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./lustrous-spinner.js";

const meta: Meta = {
  title: "Components/Spinner",
  component: "lustrous-spinner",
};
export default meta;

export const Variants: StoryObj = {
  render: () => html`
    <div style="display: flex; align-items: center; gap: 20px;">
      <lustrous-spinner label="Loading"></lustrous-spinner>
      <lustrous-spinner size="l" tone="tertiary" label="Syncing"></lustrous-spinner>
      <lustrous-spinner variant="ring" icon="bolt" label="Deploying"></lustrous-spinner>
    </div>
  `,
};
