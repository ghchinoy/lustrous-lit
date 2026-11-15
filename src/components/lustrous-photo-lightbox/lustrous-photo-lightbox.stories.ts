import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../lustrous-action-bar/lustrous-action-bar.js";
import "../lustrous-box/lustrous-box.js";
import "../lustrous-button/lustrous-button.js";
import "../lustrous-icon-button/lustrous-icon-button.js";
import "../lustrous-image/lustrous-image.js";
import "./lustrous-photo-lightbox.js";

const PHOTO = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#38bdf8"/><stop offset=".55" stop-color="#1d4ed8"/><stop offset="1" stop-color="#0f172a"/></linearGradient></defs><rect width="900" height="600" fill="url(#g)"/><circle cx="640" cy="200" r="100" fill="#e0f2fe" opacity=".8"/><path d="M0 470 L230 310 L420 450 L610 330 L900 500 L900 600 L0 600Z" fill="#0b1120" opacity=".85"/></svg>`,
)}`;

const actions = html`
  <lustrous-action-bar slot="actions" variant="floating" label="Photo actions">
    <lustrous-button size="s" variant="tonal" icon="share">Share</lustrous-button>
    <lustrous-icon-button size="s" variant="tonal" icon="download" aria-label="Download image"></lustrous-icon-button>
  </lustrous-action-bar>
`;

const meta: Meta = {
  title: "Overlays/PhotoLightbox",
  component: "lustrous-photo-lightbox",
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

export const Open: Story = {
  render: () => html`
    <lustrous-box height="640">
      <lustrous-photo-lightbox open heading="Alpine ridge twilight" src=${PHOTO}>
        ${actions}
      </lustrous-photo-lightbox>
    </lustrous-box>
  `,
};

export const MissingImage: Story = {
  render: () => html`
    <lustrous-box height="640">
      <lustrous-photo-lightbox open heading="Missing image"></lustrous-photo-lightbox>
    </lustrous-box>
  `,
};

export const Interactive: Story = {
  tags: ["skip-visual"],
  render: () => html`
    <lustrous-box padding="l">
      <lustrous-photo-lightbox heading="Alpine ridge twilight" src=${PHOTO}>
        <lustrous-image
          slot="trigger"
          src=${PHOTO}
          alt="Alpine ridge twilight (open preview)"
          aspect-ratio="16/9"
          object-fit="cover"
          border-radius="l"
          width="240"
          cursor="pointer"
        ></lustrous-image>
        ${actions}
      </lustrous-photo-lightbox>
    </lustrous-box>
  `,
};
