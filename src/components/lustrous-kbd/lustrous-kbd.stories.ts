import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../lustrous-flex/lustrous-flex.js";
import "../lustrous-text/lustrous-text.js";
import "./lustrous-kbd.js";

const meta: Meta = {
  title: "Data Display/Kbd",
  component: "lustrous-kbd",
};
export default meta;

export const Default: StoryObj = {
  render: () => html`
    <lustrous-flex direction="column" gap="m" padding="l">
      <lustrous-flex align="center" gap="s">
        <lustrous-text>Command palette:</lustrous-text>
        <lustrous-kbd keys="Mod+K"></lustrous-kbd>
      </lustrous-flex>
      <lustrous-flex align="center" gap="s">
        <lustrous-text>Modal size:</lustrous-text>
        <lustrous-kbd size="m" .keys=${["⇧", "⌘", "P"]}></lustrous-kbd>
        <lustrous-kbd size="m">Esc</lustrous-kbd>
      </lustrous-flex>
    </lustrous-flex>
  `,
};
