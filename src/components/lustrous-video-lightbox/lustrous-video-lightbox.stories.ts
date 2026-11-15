import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../lustrous-box/lustrous-box.js";
import "./lustrous-video-lightbox.js";

const POSTER = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0f766e"/><stop offset="1" stop-color="#1d4ed8"/></linearGradient></defs><rect width="960" height="540" fill="url(#g)"/><circle cx="480" cy="270" r="64" fill="#ffffff" opacity=".9"/><path d="M462 236 L462 304 L516 270Z" fill="#1d4ed8"/></svg>`,
)}`;

const CAPTIONS = `data:text/vtt;charset=utf-8,${encodeURIComponent(
  "WEBVTT\n\n00:00.000 --> 00:02.000\nArchitecture walkthrough\n",
)}`;

async function clip(): Promise<string> {
  if (typeof MediaRecorder === "undefined") return "";
  const c = Object.assign(document.createElement("canvas"), { width: 320, height: 180 });
  const ctx = c.getContext("2d")!;
  const rec = new MediaRecorder(c.captureStream(15), { mimeType: "video/webm" });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => chunks.push(e.data);
  const stopped = new Promise((r) => (rec.onstop = r));
  rec.start();
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = "#1d4ed8";
    ctx.fillRect(0, 0, 320, 180);
    await new Promise((r) => setTimeout(r, 50));
  }
  rec.stop();
  await stopped;
  const url = URL.createObjectURL(new Blob(chunks, { type: "video/webm" }));
  await new Promise((r) => {
    const v = Object.assign(document.createElement("video"), { src: url, preload: "auto", muted: true });
    v.onloadeddata = v.onerror = r;
  });
  return url;
}

const meta: Meta = {
  title: "Overlays/VideoLightbox",
  component: "lustrous-video-lightbox",
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

export const PosterFrame: Story = {
  loaders: [async () => ({ src: await clip() })],
  render: (_args, { loaded }) => html`
    <lustrous-box height="640">
      <lustrous-video-lightbox
        open
        autoplay="false"
        heading="Architecture walkthrough"
        poster=${POSTER}
        captions-src=${CAPTIONS}
        src=${loaded.src as string}
      ></lustrous-video-lightbox>
    </lustrous-box>
  `,
};

export const MissingVideo: Story = {
  render: () => html`
    <lustrous-box height="640">
      <lustrous-video-lightbox open heading="Unavailable recording"></lustrous-video-lightbox>
    </lustrous-box>
  `,
};
