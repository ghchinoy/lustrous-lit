import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./lustrous-togglable-button.js";

const meta: Meta = {
  title: "Components/TogglableButton",
  component: "lustrous-togglable-button",
};
export default meta;

export const States: StoryObj = {
  render: () => html`
    <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 10px;">
      <lustrous-togglable-button icon="bookmark">Save view</lustrous-togglable-button>
      <lustrous-togglable-button icon="bookmark" selected>Saved</lustrous-togglable-button>
      <lustrous-togglable-button variant="outline" shape="pill" icon="filter">Errors only</lustrous-togglable-button>
      <lustrous-togglable-button variant="outline" shape="pill" icon="filter" selected>Errors only</lustrous-togglable-button>
      <lustrous-togglable-button variant="on-surface" size="s">Live tail</lustrous-togglable-button>
      <lustrous-togglable-button disabled>Disabled</lustrous-togglable-button>
      <lustrous-togglable-button selected disabled>Selected disabled</lustrous-togglable-button>
    </div>
  `,
};
