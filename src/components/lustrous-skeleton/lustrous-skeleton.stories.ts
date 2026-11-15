import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../lustrous-flex/lustrous-flex.js";
import "./lustrous-skeleton.js";

const meta: Meta = {
  title: "Components/Skeleton",
  component: "lustrous-skeleton",
};
export default meta;
type Story = StoryObj;

export const LoadingCard: Story = {
  render: () => html`
    <lustrous-flex
      direction="column"
      gap="m"
      width="360"
      padding="l"
      border
      border-radius="l"
      aria-busy="true"
      aria-label="Loading workspace card"
    >
      <lustrous-flex gap="m" align="center">
        <lustrous-skeleton shape="circle" width="44"></lustrous-skeleton>
        <lustrous-flex direction="column" gap="xs" grow>
          <lustrous-skeleton shape="text" width="60%" height="14"></lustrous-skeleton>
          <lustrous-skeleton shape="text" width="40%" height="12"></lustrous-skeleton>
        </lustrous-flex>
      </lustrous-flex>
      <lustrous-skeleton shape="rect" height="96" border-radius="m"></lustrous-skeleton>
    </lustrous-flex>
  `,
};
