import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../lustrous-box/lustrous-box.js";
import "../lustrous-text/lustrous-text.js";
import "./lustrous-tabs.js";

const meta: Meta = {
  title: "Components/Tabs",
  component: "lustrous-tabs",
};
export default meta;
type Story = StoryObj;

export const WithPanels: Story = {
  render: () => html`
    <lustrous-tabs
      label="Settings sections"
      value="general"
      .tabs=${[
        { value: "general", label: "General" },
        { value: "security", label: "Security" },
        { value: "billing", label: "Billing", disabled: true },
      ]}
    >
      <lustrous-box slot="general" padding-top="l">
        <lustrous-text>Configure workspace profile, region, and default branch policies.</lustrous-text>
      </lustrous-box>
      <lustrous-box slot="security" padding-top="l">
        <lustrous-text>Manage hardware keys, session lifetimes, and IP allowlists.</lustrous-text>
      </lustrous-box>
    </lustrous-tabs>
  `,
};

export const Underline: Story = {
  render: () => html`
    <lustrous-tabs
      variant="underline"
      label="Service views"
      value="metrics"
      .tabs=${[
        { value: "metrics", label: "Metrics", icon: "activity" },
        { value: "logs", label: "Logs", icon: "terminal" },
        { value: "traces", label: "Traces", icon: "route" },
      ]}
    >
      <lustrous-box slot="metrics" padding-top="l">
        <lustrous-text>99.98% availability over the past 30 days.</lustrous-text>
      </lustrous-box>
      <lustrous-box slot="logs" padding-top="l">
        <lustrous-text>Streaming structured logs from 4 replicas.</lustrous-text>
      </lustrous-box>
      <lustrous-box slot="traces" padding-top="l">
        <lustrous-text>p95 request latency: 42ms.</lustrous-text>
      </lustrous-box>
    </lustrous-tabs>
  `,
};
