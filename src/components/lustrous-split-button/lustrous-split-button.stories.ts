import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../lustrous-flex/lustrous-flex.js";
import "./lustrous-split-button.js";

const ACTIONS = [
  { id: "run", label: "Run checks" },
  { id: "watch", label: "Run in watch mode" },
  { id: "clean", label: "Clear cache & run" },
];

const meta: Meta = {
  title: "Actions/Split Button",
  component: "lustrous-split-button",
};
export default meta;

export const VariantsAndSizes: StoryObj = {
  render: () => html`
    <lustrous-flex wrap="wrap" align="center" gap="m" padding="l">
      <lustrous-split-button variant="accent" size="m" .actions=${ACTIONS}></lustrous-split-button>
      <lustrous-split-button variant="tonal" size="m" .actions=${ACTIONS}></lustrous-split-button>
      <lustrous-split-button variant="outline" size="s" .actions=${ACTIONS}></lustrous-split-button>
      <lustrous-split-button variant="bright" size="xs" .actions=${ACTIONS}></lustrous-split-button>
    </lustrous-flex>
  `,
};
