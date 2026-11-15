import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../lustrous-button/lustrous-button.js";
import "../lustrous-flex/lustrous-flex.js";
import "../lustrous-icon-button/lustrous-icon-button.js";
import "../lustrous-text/lustrous-text.js";
import "./lustrous-action-bar.js";

const meta: Meta = {
  title: "Components/ActionBar",
  component: "lustrous-action-bar",
};
export default meta;
type Story = StoryObj;

const actions = html`
  <lustrous-text variant="body-medium-emphasized" padding-inline="s">3 selected</lustrous-text>
  <lustrous-button size="s" variant="tonal" icon="share">Share</lustrous-button>
  <lustrous-icon-button size="s" variant="tonal" icon="folder" aria-label="Move to folder"></lustrous-icon-button>
  <lustrous-icon-button size="s" variant="tonal" icon="close" aria-label="Clear selection"></lustrous-icon-button>
`;

export const Variants: Story = {
  render: () => html`
    <lustrous-flex
      direction="column"
      gap="l"
      align="flex-start"
      padding="l"
      background="surface-container"
      border-radius="l"
    >
      <lustrous-action-bar label="Selection actions">${actions}</lustrous-action-bar>
      <lustrous-action-bar variant="floating" label="Floating selection actions">${actions}</lustrous-action-bar>
    </lustrous-flex>
  `,
};
