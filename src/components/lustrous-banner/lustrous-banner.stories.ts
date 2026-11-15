import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../lustrous-flex/lustrous-flex.js";
import "./lustrous-banner.js";

const meta: Meta = {
  title: "Components/Banner",
  component: "lustrous-banner",
};
export default meta;
type Story = StoryObj;

export const Variants: Story = {
  render: () => html`
    <lustrous-flex direction="column" gap="l" width="640" padding="l">
      <lustrous-banner
        heading="Upgrade to Enterprise"
        description="Dedicated regional clusters, audit log exports, and SAML SSO."
        icon="rocketLaunch"
        primary-action="Upgrade"
        secondary-action="Compare plans"
        dismissible
      ></lustrous-banner>
      <lustrous-banner
        variant="inline"
        heading="Scheduled database maintenance tonight at 22:00 UTC."
        icon="info"
        dismissible
      ></lustrous-banner>
      <lustrous-banner
        variant="warning"
        heading="Certificate renewal pending"
        description="Verify DNS ownership records before Friday to avoid downtime."
        icon="warning"
        media-placement="inline-title"
        primary-action="Verify DNS"
      ></lustrous-banner>
      <lustrous-banner
        variant="inline"
        heading="Directory sync"
        description="Connect your identity provider to provision workspace roles automatically."
        icon="domain"
        media-placement="inline-title"
        badge="Paused"
      ></lustrous-banner>
    </lustrous-flex>
  `,
};
