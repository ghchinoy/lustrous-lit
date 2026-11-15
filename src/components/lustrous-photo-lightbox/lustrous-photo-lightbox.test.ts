import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { css, fixture } from "../../test/fixture.js";
import "./lustrous-photo-lightbox.js";
import type { LustrousPhotoLightbox } from "./lustrous-photo-lightbox.js";

const SVG = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#1d4ed8"/></svg>')}`;
const dlg = (el: LustrousPhotoLightbox) => el.shadowRoot!.querySelector("dialog")!;
const stage = (el: LustrousPhotoLightbox) => el.shadowRoot!.querySelector<HTMLElement>("[part=stage]")!;

async function make(attrs: string) {
  const wrap = await fixture<HTMLElement>(
    `<div><button id="opener">Open</button><lustrous-photo-lightbox ${attrs}><button slot="actions" id="share">Share</button></lustrous-photo-lightbox></div>`,
  );
  const el = wrap.querySelector<LustrousPhotoLightbox>("lustrous-photo-lightbox")!;
  await el.updateComplete;
  return { el, wrap };
}

describe("lustrous-photo-lightbox", () => {
  it("opens as a dark immersive modal named by heading and shows image + ambient backdrop after load", async () => {
    const { el, wrap } = await make(`heading="Team summit"`);
    const loaded = new Promise((r) => el.addEventListener("load", r, { once: true }));
    wrap.querySelector<HTMLButtonElement>("#opener")!.focus();
    el.src = SVG;
    el.open = true;
    await el.updateComplete;
    expect(dlg(el).matches(":modal")).toBe(true);
    expect(dlg(el).getAttribute("aria-label")).toBe("Team summit");

    await loaded;
    await el.updateComplete;
    const img = stage(el).querySelector("img")!;
    expect(img.alt).toBe("Team summit");
    expect(css(img, "display")).toBe("block");
    expect(css(img, "object-fit")).toBe("contain");
    expect(el.shadowRoot!.querySelector(".ambient")).toBeTruthy();
    expect(stage(el).querySelector(".loading")).toBeNull();
    expect(css(dlg(el), "color-scheme")).toBe("dark");
    expect(el.querySelector("#share")!.assignedSlot!.name).toBe("actions");
    el.open = false;
    await el.updateComplete;
  });

  it("shows missing-media placeholder when src is empty or fails to load", async () => {
    const { el } = await make(`open`);
    expect(dlg(el).getAttribute("aria-label")).toBe("Image preview");
    expect(stage(el).querySelector(".missing")).toBeTruthy();

    const failed = new Promise((r) => el.addEventListener("error", r, { once: true }));
    el.src = "data:image/png;base64,broken";
    await failed;
    await el.updateComplete;
    expect(stage(el).querySelector(".missing")).toBeTruthy();
    expect(el.shadowRoot!.querySelector(".ambient")).toBeNull();
    el.open = false;
    await el.updateComplete;
  });

  it("closes via back button, Escape, and scrim click, restoring focus to opener", async () => {
    const { el, wrap } = await make(`src="${SVG}"`);
    const opener = wrap.querySelector<HTMLButtonElement>("#opener")!;
    const reasons: string[] = [];
    el.addEventListener("lustrous-close-request", (e) => reasons.push(e.detail.reason));

    opener.focus();
    el.open = true;
    await el.updateComplete;
    const back = el.shadowRoot!.querySelector("lustrous-icon-button.back")!;
    expect(back.getAttribute("aria-label")).toBe("Close");
    back.shadowRoot!.querySelector("button")!.click();
    await el.updateComplete;
    expect(el.open).toBe(false);
    expect(document.activeElement).toBe(opener);

    el.open = true;
    await el.updateComplete;
    await userEvent.keyboard("{Escape}");
    await el.updateComplete;

    el.open = true;
    await el.updateComplete;
    await userEvent.click(document.body, { position: { x: 5, y: 300 } });
    await el.updateComplete;

    expect(reasons).toEqual(["dismiss", "escape", "scrim"]);
    expect(el.open).toBe(false);
  });

  it("keeps lightbox open when clicking slotted actions", async () => {
    const { el, wrap } = await make(`src="${SVG}" open`);
    const onClick = vi.fn();
    wrap.querySelector("#share")!.addEventListener("click", onClick);
    await userEvent.click(wrap.querySelector("#share")!);
    expect(onClick).toHaveBeenCalledOnce();
    expect(el.open).toBe(true);
    el.open = false;
    await el.updateComplete;
  });
});
