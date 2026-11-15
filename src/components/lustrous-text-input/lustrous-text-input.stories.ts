import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../lustrous-icon-button/lustrous-icon-button.js";
import "./lustrous-text-input.js";

const meta: Meta = {
  title: "Forms/TextInput",
  component: "lustrous-text-input",
  args: {
    label: "Work email",
    value: "",
    size: "m",
    placeholder: "name@example.com",
    "supporting-text": "Used for account security alerts.",
    disabled: false,
    required: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["m", "s"] },
  },
  render: (args) => html`
    <div style="max-width: 360px;">
      <lustrous-text-input
        label=${args.label}
        .value=${args.value}
        size=${args.size}
        placeholder=${args.placeholder}
        supporting-text=${args["supporting-text"]}
        ?disabled=${args.disabled}
        ?required=${args.required}
      ></lustrous-text-input>
    </div>
  `,
};
export default meta;

export const Default: StoryObj = {};

export const States: StoryObj = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; max-width: 740px;">
      <lustrous-text-input label="Full name" value="Ada Lovelace"></lustrous-text-input>
      <lustrous-text-input label="Email" placeholder="ada@example.com"></lustrous-text-input>
      <lustrous-text-input label="Project slug" required caption="Required" supporting-text="Lowercase letters and hyphens."></lustrous-text-input>
      <lustrous-text-input aria-label="Quick filter" placeholder="Unlabelled (named via aria-label)"></lustrous-text-input>
      <lustrous-text-input label="Domain" value="invalid.." error="Enter a valid hostname"></lustrous-text-input>
      <lustrous-text-input label="Instance ID" value="inst-98412" readonly></lustrous-text-input>
      <lustrous-text-input label="Organization" value="Lustrous Labs" disabled></lustrous-text-input>
      <lustrous-text-input label="Tagline" character-count maxlength="40" value="Precision UI primitives"></lustrous-text-input>
    </div>
  `,
};

export const ValidationStates: StoryObj = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 360px;">
      <lustrous-text-input
        label="Handle"
        value="adalovelace"
        validation-state="validating"
        supporting-text="Checking availability…"
      ></lustrous-text-input>
      <lustrous-text-input
        label="Handle"
        value="adalovelace"
        validation-state="success"
        supporting-text="Handle is available."
      ></lustrous-text-input>
      <lustrous-text-input
        label="Handle"
        value="admin"
        validation-state="error"
        error="Handle is reserved."
      ></lustrous-text-input>
    </div>
  `,
};

export const IconsAffixesAndSizes: StoryObj = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 360px;">
      <lustrous-text-input label="Search endpoints" leading-icon="search" value="/v1/deployments">
        <lustrous-icon-button slot="trailing" icon="close" size="s" aria-label="Clear filter"></lustrous-icon-button>
      </lustrous-text-input>
      <lustrous-text-input label="Compute budget" leading-text="$" trailing-text="USD" value="1,250"></lustrous-text-input>
      <lustrous-text-input size="s" label="Compact filter" leading-icon="filterList" placeholder="Filter by tag"></lustrous-text-input>
    </div>
  `,
};
