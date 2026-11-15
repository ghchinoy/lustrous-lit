import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./lustrous-link.js";

const meta: Meta = {
  title: "Components/Link",
  component: "lustrous-link",
};
export default meta;

export const Variants: StoryObj = {
  render: () => html`
    <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 20px;">
      <lustrous-link href="#primary" variant="primary">Primary link</lustrous-link>
      <lustrous-link href="#default" variant="default">Default link</lustrous-link>
      <lustrous-link href="#muted" variant="muted">Muted link</lustrous-link>
      <lustrous-link href="https://example.com" target="_blank" external>External docs</lustrous-link>
      <lustrous-link>Button action link</lustrous-link>
      <lustrous-link href="#disabled" disabled>Disabled link</lustrous-link>
    </div>
  `,
};

export const UnderlineModes: StoryObj = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <p style="margin: 0; max-width: 540px;">
        Inline links keep <lustrous-link href="#tokens">always-on underlines</lustrous-link> inside body prose so they remain
        distinguishable independent of color.
      </p>
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 20px;">
        <lustrous-link href="#always" underline="always">Underline always</lustrous-link>
        <lustrous-link href="#hover" underline="hover">Underline on hover</lustrous-link>
        <lustrous-link href="#none" underline="none">No underline</lustrous-link>
      </div>
    </div>
  `,
};
