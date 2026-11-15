import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../lustrous-text/lustrous-text.js";
import "./lustrous-dialog.js";

const meta: Meta = {
  title: "Overlays/Dialog",
  component: "lustrous-dialog",
  parameters: { layout: "fullscreen" },
};
export default meta;

export const Modal: StoryObj = {
  render: () => html`
    <div style="height: 420px; padding: 32px;">
      <lustrous-dialog
        modal
        open
        dismissible
        heading="Archive workspace?"
        primary-action="Archive"
        secondary-action="Cancel"
      >
        <lustrous-text muted block>
          Archived workspaces become read-only and can be restored by an administrator at any time.
        </lustrous-text>
      </lustrous-dialog>
    </div>
  `,
};

export const InlineCard: StoryObj = {
  render: () => html`
    <div style="padding: 32px;">
      <lustrous-dialog size="s" heading="Session expiring" primary-action="Extend session">
        <lustrous-text muted block>Your session will lock in 2 minutes due to inactivity.</lustrous-text>
      </lustrous-dialog>
    </div>
  `,
};
