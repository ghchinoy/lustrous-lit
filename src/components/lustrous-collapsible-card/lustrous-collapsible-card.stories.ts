import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../lustrous-button/lustrous-button.js";
import "../lustrous-flex/lustrous-flex.js";
import "../lustrous-text/lustrous-text.js";
import "./lustrous-collapsible-card.js";

const meta: Meta = {
  title: "Components/CollapsibleCard",
  component: "lustrous-collapsible-card",
};
export default meta;
type Story = StoryObj;

export const Open: Story = {
  render: () => html`
    <lustrous-flex direction="column" gap="m" width="560" padding="l">
      <lustrous-collapsible-card
        heading="Environment variables"
        icon="settingsAlt"
        badge="4 active"
        badge-tone="emerald"
        subtitle="Updated 10m ago"
      >
        <lustrous-button slot="actions" size="xs" variant="tonal" icon="sliders">Manage</lustrous-button>
        <lustrous-text block>
          Runtime configuration variables are encrypted at rest and injected at container startup.
        </lustrous-text>
      </lustrous-collapsible-card>
    </lustrous-flex>
  `,
};

export const Collapsed: Story = {
  render: () => html`
    <lustrous-flex direction="column" gap="m" width="560" padding="l">
      <lustrous-collapsible-card
        heading="Audit retention policy"
        icon="shield"
        badge="90 days"
        badge-tone="cobalt"
        .open=${false}
      >
        <lustrous-text block>Immutable audit trails export nightly to cold archive buckets.</lustrous-text>
      </lustrous-collapsible-card>
    </lustrous-flex>
  `,
};
