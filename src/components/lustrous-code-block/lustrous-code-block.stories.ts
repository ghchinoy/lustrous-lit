import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../lustrous-flex/lustrous-flex.js";
import "./lustrous-code-block.js";

const meta: Meta = {
  title: "Components/CodeBlock",
  component: "lustrous-code-block",
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <lustrous-flex direction="column" gap="l" width="560" padding="l">
      <lustrous-code-block
        label="Install"
        code="pnpm add @ghchinoy/lustrous-lit lit"
      ></lustrous-code-block>

      <lustrous-code-block
        label="lustrous.config.ts"
        wrap
        .code=${`import { installLustrousTheme, setLustrousTheme } from "@ghchinoy/lustrous-lit/theme";\n\ninstallLustrousTheme();\nsetLustrousTheme("system", { storageKey: "lustrous.theme" });`}
      ></lustrous-code-block>
    </lustrous-flex>
  `,
};

export const Slotted: Story = {
  render: () => html`
    <lustrous-flex direction="column" width="560" padding="l">
      <lustrous-code-block label="index.html"
        >&lt;lustrous-button variant="tonal"&gt;Deploy release&lt;/lustrous-button&gt;</lustrous-code-block
      >
    </lustrous-flex>
  `,
};
