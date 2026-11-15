import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./lustrous-switch.js";

const meta: Meta = {
  title: "Forms/Switch",
  component: "lustrous-switch",
};
export default meta;

export const Sizes: StoryObj = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      ${(["m", "s"] as const).map(
        (size) => html`
          <div style="display: flex; align-items: center; gap: 16px;">
            <lustrous-switch size=${size} aria-label="Off (${size})"></lustrous-switch>
            <lustrous-switch size=${size} checked aria-label="On (${size})"></lustrous-switch>
            <lustrous-switch size=${size} disabled aria-label="Disabled off (${size})"></lustrous-switch>
            <lustrous-switch size=${size} checked disabled aria-label="Disabled on (${size})"></lustrous-switch>
          </div>
        `,
      )}
    </div>
  `,
};

export const WithIcons: StoryObj = {
  render: () => html`
    <div style="display: flex; align-items: center; gap: 16px;">
      <lustrous-switch icon="check" off-icon="close" aria-label="Thumb icons off"></lustrous-switch>
      <lustrous-switch icon="check" off-icon="close" checked aria-label="Thumb icons on"></lustrous-switch>
      <lustrous-switch icon="check" checked aria-label="Checked icon only"></lustrous-switch>
    </div>
  `,
};

export const WithLabel: StoryObj = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 12px; max-width: 380px;">
      <lustrous-switch checked supporting-text="Send weekly reliability summaries every Monday.">
        Weekly reliability digest
      </lustrous-switch>
      <lustrous-switch>Automatic failover</lustrous-switch>
      <lustrous-switch disabled checked supporting-text="Managed by organization policy.">
        Audit trail retention
      </lustrous-switch>
    </div>
  `,
};
