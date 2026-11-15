import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../lustrous-badge/lustrous-badge.js";
import "./lustrous-list.js";

const meta: Meta = {
  title: "Components/List",
  component: "lustrous-list",
};
export default meta;
type Story = StoryObj;

export const SelectionList: Story = {
  render: () => html`
    <lustrous-list label="Environments" gap="xs" width="360">
      <lustrous-list-item
        label="Production cluster"
        description="Multi-region high availability"
        start-icon="cloudDone"
        selected
      ></lustrous-list-item>
      <lustrous-list-item
        label="Staging cluster"
        description="Pre-release verification"
        start-icon="activity"
      ></lustrous-list-item>
      <lustrous-list-item
        label="Legacy archive"
        description="Read-only snapshot"
        start-icon="archive"
        disabled
      ></lustrous-list-item>
    </lustrous-list>
  `,
};

export const LinksAndStatic: Story = {
  render: () => html`
    <lustrous-list label="Resources" width="360">
      <lustrous-list-item label="API reference" href="#api" end-icon="openInNew"></lustrous-list-item>
      <lustrous-list-item label="Release changelog" href="#changelog" end-icon="chevronRight"></lustrous-list-item>
      <lustrous-list-item label="Runtime version" static>
        <lustrous-badge slot="end" tone="cobalt">v2.4.0</lustrous-badge>
      </lustrous-list-item>
    </lustrous-list>
  `,
};
