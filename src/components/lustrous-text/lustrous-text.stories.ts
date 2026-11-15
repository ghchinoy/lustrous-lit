import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./lustrous-text.js";

const meta: Meta = {
  title: "Primitives/Text",
  component: "lustrous-text",
};
export default meta;

export const Scale: StoryObj = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 10px;">
      <lustrous-text variant="overline" muted block>Lustrous Typography</lustrous-text>
      <lustrous-text variant="display-small" heading="1">Architectural Clarity</lustrous-text>
      <lustrous-text variant="lead" block>Clean proportions, variable font axes, and WCAG AA contrast.</lustrous-text>
      <lustrous-text variant="body-medium" block>Body medium (15px / 22px) is the default UI text variant.</lustrous-text>
      <lustrous-text variant="code" block>const theme = "lustrous";</lustrous-text>
    </div>
  `,
};
