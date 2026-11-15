import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../lustrous-flex/lustrous-flex.js";
import "./lustrous-segmented-control.js";

const meta: Meta = {
  title: "Components/SegmentedControl",
  component: "lustrous-segmented-control",
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <lustrous-flex direction="column" gap="m" align="flex-start">
      <lustrous-segmented-control
        label="Layout"
        value="grid"
        .options=${[
          { value: "grid", label: "Grid" },
          { value: "list", label: "List" },
          { value: "compact", label: "Compact", disabled: true },
        ]}
      ></lustrous-segmented-control>
      <lustrous-segmented-control
        size="m"
        variant="transparent"
        label="Time range"
        value="7d"
        .options=${[
          { value: "24h", label: "24h" },
          { value: "7d", label: "7 days" },
          { value: "30d", label: "30 days" },
        ]}
      ></lustrous-segmented-control>
    </lustrous-flex>
  `,
};

export const WithIconsAndBadges: Story = {
  render: () => html`
    <lustrous-segmented-control
      label="Issue filter"
      value="all"
      .options=${[
        { value: "all", label: "All", icon: "layers", badge: 24 },
        { value: "open", label: "Open", icon: "info", badge: 3 },
        { value: "done", label: "Resolved", icon: "checkCircle" },
      ]}
    ></lustrous-segmented-control>
  `,
};
