import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./lustrous-checkbox.js";

const meta: Meta = {
  title: "Forms/Checkbox",
  component: "lustrous-checkbox",
};
export default meta;

export const States: StoryObj = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 6px; max-width: 360px;">
      <lustrous-checkbox checked supporting-text="Receive weekly engineering summaries">Weekly digest</lustrous-checkbox>
      <lustrous-checkbox indeterminate>Select all regions</lustrous-checkbox>
      <lustrous-checkbox disabled checked>Audit logging (required)</lustrous-checkbox>
    </div>
  `,
};
