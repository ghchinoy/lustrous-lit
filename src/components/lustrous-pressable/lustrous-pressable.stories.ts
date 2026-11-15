import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../lustrous-flex/lustrous-flex.js";
import "../lustrous-icon/lustrous-icon.js";
import "../lustrous-text/lustrous-text.js";
import "./lustrous-pressable.js";

const meta: Meta = {
  title: "Primitives/Pressable",
  component: "lustrous-pressable",
};
export default meta;

export const Cards: StoryObj = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; max-width: 720px;">
      <lustrous-pressable padding="l" border border-radius="l" background="surface">
        <lustrous-flex direction="column" gap="xs">
          <lustrous-icon name="bolt"></lustrous-icon>
          <lustrous-text variant="body-medium-emphasized">Edge routing</lustrous-text>
          <lustrous-text variant="body-small" muted>Low-latency global ingress</lustrous-text>
        </lustrous-flex>
      </lustrous-pressable>

      <lustrous-pressable padding="l" border border-radius="l" selected>
        <lustrous-flex direction="column" gap="xs">
          <lustrous-icon name="shield"></lustrous-icon>
          <lustrous-text variant="body-medium-emphasized">Selected tier</lustrous-text>
          <lustrous-text variant="body-small" muted>Zero-trust mutual TLS enabled</lustrous-text>
        </lustrous-flex>
      </lustrous-pressable>

      <lustrous-pressable padding="l" border border-radius="l" disabled>
        <lustrous-flex direction="column" gap="xs">
          <lustrous-icon name="lock"></lustrous-icon>
          <lustrous-text variant="body-medium-emphasized">Dedicated HSM</lustrous-text>
          <lustrous-text variant="body-small" muted>Requires enterprise plan</lustrous-text>
        </lustrous-flex>
      </lustrous-pressable>
    </div>
  `,
};

export const LinkSurface: StoryObj = {
  render: () => html`
    <lustrous-pressable
      href="#guides"
      padding="l"
      border
      border-radius="l"
      background="surface-container"
      style="max-width: 360px;"
    >
      <lustrous-flex align="center" justify="space-between" gap="m">
        <lustrous-flex direction="column" gap="xs">
          <lustrous-text variant="body-medium-emphasized">Deployment guide</lustrous-text>
          <lustrous-text variant="body-small" muted>Step-by-step rollout checklist</lustrous-text>
        </lustrous-flex>
        <lustrous-icon name="arrowForward"></lustrous-icon>
      </lustrous-flex>
    </lustrous-pressable>
  `,
};
