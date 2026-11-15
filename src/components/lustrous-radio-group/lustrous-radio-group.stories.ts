import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./lustrous-radio-group.js";

const meta: Meta = {
  title: "Forms/RadioGroup",
  component: "lustrous-radio-group",
};
export default meta;

export const VerticalWithSupportingText: StoryObj = {
  render: () => html`
    <div style="max-width: 400px;">
      <lustrous-radio-group
        label="Replication topology"
        name="topology"
        value="multi-region"
        supporting-text="Determines failover guarantees and RPO."
      >
        <lustrous-radio value="single-zone" supporting-text="Lowest latency within a single availability zone.">
          Single zone
        </lustrous-radio>
        <lustrous-radio value="multi-zone" supporting-text="Automatic failover across zones in one region.">
          Regional multi-zone
        </lustrous-radio>
        <lustrous-radio value="multi-region" supporting-text="Zero-RPO synchronous quorum across continents.">
          Global multi-region
        </lustrous-radio>
        <lustrous-radio value="dedicated" disabled supporting-text="Requires enterprise agreement.">
          Dedicated bare metal
        </lustrous-radio>
      </lustrous-radio-group>
    </div>
  `,
};

export const HorizontalAndStates: StoryObj = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px; max-width: 520px;">
      <lustrous-radio-group label="Billing cycle" orientation="horizontal" value="annual">
        <lustrous-radio value="monthly">Monthly</lustrous-radio>
        <lustrous-radio value="quarterly">Quarterly</lustrous-radio>
        <lustrous-radio value="annual">Annual</lustrous-radio>
      </lustrous-radio-group>

      <lustrous-radio-group label="Required plan" required error="Select a plan to continue">
        <lustrous-radio value="starter">Starter</lustrous-radio>
        <lustrous-radio value="pro">Pro</lustrous-radio>
      </lustrous-radio-group>

      <lustrous-radio-group label="Locked environment" value="production" disabled>
        <lustrous-radio value="staging">Staging</lustrous-radio>
        <lustrous-radio value="production">Production</lustrous-radio>
      </lustrous-radio-group>
    </div>
  `,
};
