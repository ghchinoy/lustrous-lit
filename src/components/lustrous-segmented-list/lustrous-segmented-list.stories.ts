import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../lustrous-flex/lustrous-flex.js";
import "../lustrous-icon/lustrous-icon.js";
import "../lustrous-switch/lustrous-switch.js";
import "../lustrous-text/lustrous-text.js";
import "./lustrous-segmented-list.js";

const meta: Meta = {
  title: "Components/SegmentedList",
  component: "lustrous-segmented-list",
};
export default meta;

export const SegmentedRows: StoryObj = {
  render: () => html`
    <lustrous-segmented-list label="Security settings" style="max-width: 480px;">
      <lustrous-segmented-list-item padding="l" background="surface-container">
        <lustrous-text variant="body-medium-emphasized">Hardware passkeys</lustrous-text>
        <lustrous-text variant="body-small" muted>Require FIDO2 security keys on sign-in</lustrous-text>
        <lustrous-switch slot="action" checked aria-label="Hardware passkeys"></lustrous-switch>
      </lustrous-segmented-list-item>
      <lustrous-segmented-list-item padding="l" background="surface-container">
        <lustrous-text variant="body-medium-emphasized">Session anomaly alerts</lustrous-text>
        <lustrous-text variant="body-small" muted>Notify admins on unrecognized IP ranges</lustrous-text>
        <lustrous-switch slot="action" aria-label="Session anomaly alerts"></lustrous-switch>
      </lustrous-segmented-list-item>
      <lustrous-segmented-list-button padding="l" background="surface-container">
        <lustrous-flex align="center" justify="space-between" gap="m">
          <lustrous-text variant="body-medium-emphasized">Rotate signing certificates</lustrous-text>
          <lustrous-icon name="chevronRight"></lustrous-icon>
        </lustrous-flex>
      </lustrous-segmented-list-button>
    </lustrous-segmented-list>
  `,
};

export const WithDividers: StoryObj = {
  render: () => html`
    <lustrous-segmented-list divider label="Documentation links" style="max-width: 480px;">
      <lustrous-segmented-list-link href="#quickstart" padding="l" background="surface-container">
        <lustrous-flex align="center" justify="space-between" gap="m">
          <lustrous-text variant="body-medium-emphasized">Quickstart guide</lustrous-text>
          <lustrous-icon name="arrowForward"></lustrous-icon>
        </lustrous-flex>
      </lustrous-segmented-list-link>
      <lustrous-segmented-list-link href="#tokens" padding="l" background="surface-container">
        <lustrous-flex align="center" justify="space-between" gap="m">
          <lustrous-text variant="body-medium-emphasized">Design token reference</lustrous-text>
          <lustrous-icon name="arrowForward"></lustrous-icon>
        </lustrous-flex>
      </lustrous-segmented-list-link>
      <lustrous-segmented-list-link href="#accessibility" padding="l" background="surface-container">
        <lustrous-flex align="center" justify="space-between" gap="m">
          <lustrous-text variant="body-medium-emphasized">Accessibility checklist</lustrous-text>
          <lustrous-icon name="arrowForward"></lustrous-icon>
        </lustrous-flex>
      </lustrous-segmented-list-link>
    </lustrous-segmented-list>
  `,
};
