import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./lustrous-icon-button.js";

const meta: Meta = {
  title: "Components/IconButton",
  component: "lustrous-icon-button",
};
export default meta;

export const Default: StoryObj = {
  render: () => html`
    <div style="display: flex; align-items: center; gap: 10px;">
      <lustrous-icon-button icon="search" aria-label="Search"></lustrous-icon-button>
      <lustrous-icon-button icon="settings" variant="tonal" aria-label="Settings"></lustrous-icon-button>
      <lustrous-icon-button icon="bell" variant="outline" badge aria-label="Notifications (unread)"></lustrous-icon-button>
      <lustrous-icon-button icon="add" variant="accent" size="s" aria-label="Add"></lustrous-icon-button>
    </div>
  `,
};
