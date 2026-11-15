import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./lustrous-text-area.js";

const meta: Meta = {
  title: "Forms/TextArea",
  component: "lustrous-text-area",
};
export default meta;

export const States: StoryObj = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; max-width: 740px;">
      <lustrous-text-area label="Notes" placeholder="Capture deployment notes…"></lustrous-text-area>
      <lustrous-text-area
        label="Description"
        caption="Optional"
        value=${"Multi-region cluster\nwith automatic failover"}
      ></lustrous-text-area>
      <lustrous-text-area
        label="Postmortem summary"
        required
        supporting-text="Include timeline and action items."
        character-count
        maxlength="240"
      ></lustrous-text-area>
      <lustrous-text-area
        label="Justification"
        value="Too brief"
        error="Provide at least 20 characters"
      ></lustrous-text-area>
      <lustrous-text-area label="Read-only policy" value="Immutable production manifest" readonly rows="2"></lustrous-text-area>
      <lustrous-text-area
        aria-label="Quick note"
        leading-icon="notes"
        placeholder="Unlabelled textarea with leading icon"
        rows="2"
      ></lustrous-text-area>
    </div>
  `,
};

export const AutoGrowAndScroll: StoryObj = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 380px;">
      <lustrous-text-area
        label="Auto-growing comment"
        rows="2"
        max-rows="5"
        placeholder="Type multiple lines to grow up to 5 rows…"
      ></lustrous-text-area>
      <lustrous-text-area
        label="At max-rows"
        rows="2"
        max-rows="3"
        value=${"Line 1\nLine 2\nLine 3\nLine 4\nLine 5"}
      ></lustrous-text-area>
      <lustrous-text-area
        label="Manual vertical resize"
        rows="3"
        auto-grow="false"
        resize="vertical"
        placeholder="Drag the bottom-right corner to resize"
      ></lustrous-text-area>
    </div>
  `,
};
