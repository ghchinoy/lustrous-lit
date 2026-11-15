import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./lustrous-togglable-icon-button.js";

const meta: Meta = {
  title: "Components/TogglableIconButton",
  component: "lustrous-togglable-icon-button",
};
export default meta;

export const States: StoryObj = {
  render: () => html`
    <div style="display: flex; align-items: center; gap: 10px;">
      <lustrous-togglable-icon-button icon="star" aria-label="Favorite"></lustrous-togglable-icon-button>
      <lustrous-togglable-icon-button icon="star" selected aria-label="Favorite (selected)"></lustrous-togglable-icon-button>
      <lustrous-togglable-icon-button
        icon="micOff"
        selected-icon="mic"
        variant="tonal"
        aria-label="Microphone"
      ></lustrous-togglable-icon-button>
      <lustrous-togglable-icon-button
        icon="micOff"
        selected-icon="mic"
        variant="tonal"
        selected
        aria-label="Microphone (active)"
      ></lustrous-togglable-icon-button>
      <lustrous-togglable-icon-button
        icon="bookmark"
        variant="outline"
        size="s"
        aria-label="Bookmark"
      ></lustrous-togglable-icon-button>
      <lustrous-togglable-icon-button
        icon="bookmark"
        selected
        disabled
        aria-label="Bookmark (disabled)"
      ></lustrous-togglable-icon-button>
    </div>
  `,
};
