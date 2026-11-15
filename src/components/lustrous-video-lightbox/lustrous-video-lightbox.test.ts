import { describe, expect, it, vi } from "vitest";
import { css, fixture } from "../../test/fixture.js";
import "./lustrous-video-lightbox.js";
import type { LustrousVideoLightbox } from "./lustrous-video-lightbox.js";

const POSTER = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#0f766e"/></svg>')}`;

async function makeVideo(): Promise<string> {
  const c = document.createElement("canvas");
  c.width = 160;
  c.height = 90;
  const ctx = c.getContext("2d")!;
  const rec = new MediaRecorder(c.captureStream(15), { mimeType: "video/webm" });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => chunks.push(e.data);
  const done = new Promise((r) => (rec.onstop = r));
  rec.start();
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = `hsl(${i * 40} 70% 50%)`;
    ctx.fillRect(0, 0, 160, 90);
    await new Promise((r) => setTimeout(r, 50));
  }
  rec.stop();
  await done;
  return URL.createObjectURL(new Blob(chunks, { type: "video/webm" }));
}

const video = (el: LustrousVideoLightbox) => el.shadowRoot!.querySelector("video");

describe("lustrous-video-lightbox", () => {
  it("renders a labelled native video with controls, poster ambient backdrop, and optional captions track", async () => {
    const el = await fixture<LustrousVideoLightbox>(
      `<lustrous-video-lightbox heading="Product walkthrough" poster="${POSTER}" captions-src="data:text/vtt,WEBVTT" src="about:blank#x" autoplay="false" open></lustrous-video-lightbox>`,
    );
    const v = video(el)!;
    expect(v.controls).toBe(true);
    expect(v.getAttribute("aria-label")).toBe("Product walkthrough");
    expect(v.poster).toBe(POSTER);
    expect(v.querySelector("track")?.getAttribute("kind")).toBe("captions");
    expect(css(v, "display")).toBe("block");
    expect(el.shadowRoot!.querySelector<HTMLImageElement>(".ambient")!.src).toBe(POSTER);
    expect(el.shadowRoot!.querySelector(".loading")).toBeNull();
    el.open = false;
    await el.updateComplete;
  });

  it.skipIf(typeof MediaRecorder === "undefined")(
    "loads media, fires load, autoplays when opened, and pauses on close",
    async () => {
      const src = await makeVideo();
      const el = await fixture<LustrousVideoLightbox>(`<lustrous-video-lightbox></lustrous-video-lightbox>`);
      const loaded = new Promise((r) => el.addEventListener("load", r, { once: true }));
      el.src = src;
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector(".loading")).toBeTruthy();

      const play = vi.spyOn(HTMLMediaElement.prototype, "play");
      el.open = true;
      await loaded;
      await el.updateComplete;
      expect(play).toHaveBeenCalled();
      expect(el.shadowRoot!.querySelector(".loading")).toBeNull();
      expect(css(video(el)!, "display")).toBe("block");

      const pause = vi.spyOn(HTMLMediaElement.prototype, "pause");
      el.open = false;
      await el.updateComplete;
      expect(pause).toHaveBeenCalled();

      play.mockRestore();
      pause.mockRestore();
      URL.revokeObjectURL(src);
    },
  );

  it("shows missing-media placeholder when video fails", async () => {
    const el = await fixture<LustrousVideoLightbox>(
      `<lustrous-video-lightbox open autoplay="false"></lustrous-video-lightbox>`,
    );
    const failed = new Promise((r) => el.addEventListener("error", r, { once: true }));
    el.src = "data:video/webm;base64,AAAA";
    await failed;
    await el.updateComplete;
    expect(video(el)).toBeNull();
    expect(el.shadowRoot!.querySelector(".missing")).toBeTruthy();
    expect(el.shadowRoot!.querySelector("dialog")!.getAttribute("aria-label")).toBe("Video preview");
    el.open = false;
    await el.updateComplete;
  });
});
