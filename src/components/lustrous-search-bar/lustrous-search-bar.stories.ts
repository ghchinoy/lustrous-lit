import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../lustrous-icon-button/lustrous-icon-button.js";
import "./lustrous-search-bar.js";

const meta: Meta = {
  title: "Forms/SearchBar",
  component: "lustrous-search-bar",
};
export default meta;

export const Variants: StoryObj = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px; padding: 16px; border-radius: 14px; background: var(--lustrous-color-surface-container);">
      <lustrous-search-bar placeholder="Search components"></lustrous-search-bar>
      <lustrous-search-bar value="design tokens" aria-label="Search tokens"></lustrous-search-bar>
      <lustrous-search-bar variant="outlined" placeholder="Outlined search"></lustrous-search-bar>
      <lustrous-search-bar variant="transparent" value="elevation" aria-label="Transparent search"></lustrous-search-bar>
      <lustrous-search-bar size="s" placeholder="Compact toolbar search"></lustrous-search-bar>
      <lustrous-search-bar disabled placeholder="Disabled search"></lustrous-search-bar>
    </div>
  `,
};

export const WithTrailingAction: StoryObj = {
  render: () => html`
    <div style="max-width: 480px;">
      <lustrous-search-bar value="cluster:us-east" aria-label="Search logs">
        <lustrous-icon-button slot="trailing" icon="sliders" size="s" aria-label="Filter options"></lustrous-icon-button>
      </lustrous-search-bar>
    </div>
  `,
};
