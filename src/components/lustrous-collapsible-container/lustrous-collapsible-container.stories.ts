import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../lustrous-box/lustrous-box.js";
import "../lustrous-button/lustrous-button.js";
import "../lustrous-flex/lustrous-flex.js";
import "../lustrous-text/lustrous-text.js";
import "./lustrous-collapsible-container.js";

const meta: Meta = {
  title: "Components/CollapsibleContainer",
  component: "lustrous-collapsible-container",
};
export default meta;
type Story = StoryObj;

export const Disclosure: Story = {
  render: () => html`
    <lustrous-flex direction="column" gap="m" width="440" padding="l">
      <lustrous-collapsible-container expanded>
        <lustrous-button slot="trigger" variant="on-surface">Replication topology</lustrous-button>
        <lustrous-text block muted padding-top="s" padding-inline="m">
          Primary writes replicate synchronously across three availability zones with automatic failover under 5 seconds.
        </lustrous-text>
      </lustrous-collapsible-container>

      <lustrous-box background="surface-container" border border-radius="l" overflow="hidden" padding="xs">
        <lustrous-collapsible-container>
          <lustrous-button slot="trigger" variant="on-surface">Diagnostic headers (collapsed)</lustrous-button>
          <lustrous-text block muted padding="m">
            Request trace headers, regional edge cache status, and TLS cipher negotiation metadata.
          </lustrous-text>
        </lustrous-collapsible-container>
      </lustrous-box>
    </lustrous-flex>
  `,
};
