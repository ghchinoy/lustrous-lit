import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../lustrous-box/lustrous-box.js";
import "../lustrous-text/lustrous-text.js";
import "./lustrous-timeline.js";

const meta: Meta = {
  title: "Components/Timeline",
  component: "lustrous-timeline",
};
export default meta;
type Story = StoryObj;

export const RoadmapMilestones: Story = {
  render: () => html`
    <lustrous-box width="440">
      <lustrous-timeline label="Platform roadmap">
        <lustrous-timeline-item
          status="past"
          marker-label="Completed"
          heading="Token architecture finalized"
          time-label="Q1 2026"
        >
          <lustrous-text muted>Published dual-theme mineral slate and sapphire palettes.</lustrous-text>
        </lustrous-timeline-item>
        <lustrous-timeline-item
          status="active"
          marker-label="In progress"
          heading="Core component rollout"
          time-label="Q2 2026"
        >
          <lustrous-text muted>Shipping accessible form controls and top-layer overlays.</lustrous-text>
        </lustrous-timeline-item>
        <lustrous-timeline-item
          status="future"
          marker-label="Scheduled"
          heading="Multi-brand theme builder"
          time-label="Q3 2026"
        ></lustrous-timeline-item>
      </lustrous-timeline>
    </lustrous-box>
  `,
};

export const DeploymentAuditLog: Story = {
  render: () => html`
    <lustrous-box width="440">
      <lustrous-timeline label="Deployment audit log">
        <lustrous-timeline-item icon="package" heading="Built release v2.4.0" heading-variant="body-medium-emphasized" time-label="10:14 UTC">
          <lustrous-text muted variant="body-small">Compiled TypeScript bundle and generated custom elements manifest.</lustrous-text>
        </lustrous-timeline-item>
        <lustrous-timeline-item icon="verifiedUser" heading="Passed security scan" heading-variant="body-medium-emphasized" time-label="10:16 UTC"></lustrous-timeline-item>
        <lustrous-timeline-item icon="rocketLaunch" heading="Promoted to us-east4" heading-variant="body-medium-emphasized" time-label="10:19 UTC"></lustrous-timeline-item>
      </lustrous-timeline>
    </lustrous-box>
  `,
};
