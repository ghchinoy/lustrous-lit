import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../lustrous-flex/lustrous-flex.js";
import "../lustrous-text/lustrous-text.js";
import "./lustrous-progress-bar.js";

const meta: Meta = {
  title: "Components/ProgressBar",
  component: "lustrous-progress-bar",
};
export default meta;
type Story = StoryObj;

export const ValuesAndTones: Story = {
  render: () => html`
    <lustrous-flex
      direction="column"
      gap="l"
      width="380"
      padding="l"
      background="surface-container"
      border-radius="l"
    >
      <lustrous-flex direction="column" gap="xs">
        <lustrous-text variant="body-small" muted>40% uploaded</lustrous-text>
        <lustrous-progress-bar value="40" label="Upload progress"></lustrous-progress-bar>
      </lustrous-flex>
      <lustrous-flex direction="column" gap="xs">
        <lustrous-text variant="body-small" muted>100% healthy</lustrous-text>
        <lustrous-progress-bar value="100" tone="positive" label="Health checks"></lustrous-progress-bar>
      </lustrous-flex>
      <lustrous-flex direction="column" gap="xs">
        <lustrous-text variant="body-small" muted>82% quota used</lustrous-text>
        <lustrous-progress-bar value="82" tone="warning" label="Quota usage"></lustrous-progress-bar>
      </lustrous-flex>
      <lustrous-flex direction="column" gap="xs">
        <lustrous-text variant="body-small" muted>96% disk capacity</lustrous-text>
        <lustrous-progress-bar value="96" tone="error" label="Disk capacity"></lustrous-progress-bar>
      </lustrous-flex>
    </lustrous-flex>
  `,
};
