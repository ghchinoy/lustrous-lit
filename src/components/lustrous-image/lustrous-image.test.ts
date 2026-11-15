import { describe, expect, it } from "vitest";
import { css, fixture } from "../../test/fixture.js";
import "./lustrous-image.js";
import type { LustrousImage } from "./lustrous-image.js";

const PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
const img = (el: LustrousImage) => el.shadowRoot!.querySelector("img")!;

describe("lustrous-image", () => {
  it("renders an img with alt, aspect-ratio, object-fit, border-radius, and loading", async () => {
    const el = await fixture<LustrousImage>(
      `<lustrous-image src="${PIXEL}" alt="Architecture" aspect-ratio="16/9" object-fit="cover" border-radius="l" loading="lazy" width="320"></lustrous-image>`,
    );
    const i = img(el);
    expect(i.alt).toBe("Architecture");
    expect(i.loading).toBe("lazy");
    expect(i.decoding).toBe("async");
    expect(i.referrerPolicy).toBe("no-referrer");
    expect(css(el, "height")).toBe("180px");
    expect(css(i, "object-fit")).toBe("cover");
    expect(css(el, "border-top-left-radius")).toBe("14px");
    expect(css(el, "overflow-x")).toBe("hidden");
  });

  it("hides decorative images from assistive technology", async () => {
    const el = await fixture<LustrousImage>(`<lustrous-image src="${PIXEL}" alt="ignored" decorative></lustrous-image>`);
    expect(img(el).getAttribute("alt")).toBe("");
    expect(img(el).getAttribute("aria-hidden")).toBe("true");
  });

  it("re-dispatches load and error events", async () => {
    const el = await fixture<LustrousImage>(`<lustrous-image alt="x"></lustrous-image>`);
    const loaded = new Promise((r) => el.addEventListener("load", r, { once: true }));
    el.src = PIXEL;
    await loaded;
    const failed = new Promise((r) => el.addEventListener("error", r, { once: true }));
    el.src = "data:image/png;base64,broken";
    await failed;
  });
});
