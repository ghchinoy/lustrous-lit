import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { LustrousSelectOption } from "./lustrous-select.js";
import "./lustrous-select.js";

const REGION_OPTIONS: readonly LustrousSelectOption[] = [
  { value: "us-east1", label: "US East (South Carolina)", description: "Low-latency North America", icon: "globe", group: "Americas" },
  { value: "us-west1", label: "US West (Oregon)", description: "Hydro-powered region", icon: "globe", group: "Americas" },
  { value: "europe-west1", label: "Europe West (Belgium)", description: "EU data residency", icon: "shield", group: "Europe" },
  { value: "asia-northeast1", label: "Asia Northeast (Tokyo)", description: "APAC backbone", icon: "bolt", group: "Asia Pacific" },
  { value: "antarctica-south1", label: "Antarctica Research", description: "Invite-only capacity", icon: "lock", disabled: true, group: "Restricted" },
];

const meta: Meta = {
  title: "Forms/Select",
  component: "lustrous-select",
};
export default meta;

export const Default: StoryObj = {
  render: () => html`
    <div style="max-width: 360px;">
      <lustrous-select
        label="Deployment region"
        supporting-text="Choose where workloads are scheduled."
        .options=${REGION_OPTIONS}
      ></lustrous-select>
    </div>
  `,
};

export const StatesAndSizes: StoryObj = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; max-width: 740px;">
      <lustrous-select label="Light-DOM options" value="standard">
        <option value="starter">Starter</option>
        <option value="standard">Standard</option>
        <option value="enterprise">Enterprise</option>
      </lustrous-select>
      <lustrous-select
        label="Required with caption"
        caption="Required"
        required
        .options=${REGION_OPTIONS}
      ></lustrous-select>
      <lustrous-select
        label="Validation error"
        error="Select a compliant region"
        .options=${REGION_OPTIONS}
      ></lustrous-select>
      <lustrous-select
        label="Validating quota"
        value="europe-west1"
        validation-state="validating"
        supporting-text="Checking regional quota…"
        .options=${REGION_OPTIONS}
      ></lustrous-select>
      <lustrous-select
        size="s"
        label="Compact size (s)"
        value="us-east1"
        .options=${REGION_OPTIONS}
      ></lustrous-select>
      <lustrous-select
        label="Disabled"
        value="us-west1"
        disabled
        .options=${REGION_OPTIONS}
      ></lustrous-select>
    </div>
  `,
};
