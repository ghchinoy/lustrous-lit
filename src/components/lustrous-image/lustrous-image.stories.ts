import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../lustrous-flex/lustrous-flex.js";
import "../lustrous-text/lustrous-text.js";
import "./lustrous-image.js";

const SRC = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#93c5fd"/><stop offset="1" stop-color="#1d4ed8"/></linearGradient></defs><rect width="800" height="500" fill="url(#g)"/><circle cx="560" cy="180" r="90" fill="#ffffff" opacity=".55"/></svg>`,
)}`;

const meta: Meta = {
  title: "Components/Image",
  component: "lustrous-image",
};
export default meta;
type Story = StoryObj;

export const AspectRatios: Story = {
  render: () => html`
    <lustrous-flex gap="m" align="flex-start" wrap="wrap">
      ${(["16/9", "4/3", "1/1", "3/4"] as const).map(
        (ratio) => html`
          <lustrous-flex direction="column" gap="xs" width="160">
            <lustrous-image
              src=${SRC}
              alt="Sapphire gradient study"
              aspect-ratio=${ratio}
              object-fit="cover"
              border-radius="l"
              loading="lazy"
            ></lustrous-image>
            <lustrous-text variant="body-small" muted>${ratio}</lustrous-text>
          </lustrous-flex>
        `,
      )}
    </lustrous-flex>
  `,
};
