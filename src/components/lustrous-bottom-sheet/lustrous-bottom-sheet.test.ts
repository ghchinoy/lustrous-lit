import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { css, fixture, setViewport } from "../../test/fixture.js";
import type { LustrousBottomSheet } from "./lustrous-bottom-sheet.js";
import "./lustrous-bottom-sheet.js";

const sheet = (el: LustrousBottomSheet) => el.shadowRoot!.querySelector<HTMLElement>("[part=sheet]")!;
const handle = (el: LustrousBottomSheet) => el.shadowRoot!.querySelector<HTMLElement>("[part=handle]")!;
const sheetY = (el: LustrousBottomSheet) => parseFloat(sheet(el).style.getPropertyValue("--_lustrous-sheet-y") || "0");
const settle = () => new Promise((r) => setTimeout(r, 350));

async function make(contentHeight: number) {
  await setViewport(400, 800);
  return fixture<LustrousBottomSheet>(
    `<lustrous-bottom-sheet label="Share"><button slot="trigger">Open</button><div style="height: ${contentHeight}px"><button id="first">First</button></div></lustrous-bottom-sheet>`,
  );
}

function drag(el: LustrousBottomSheet, dy: number) {
  const h = handle(el);
  const r = h.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const startY = r.top + r.height / 2;
  h.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 1, button: 0, clientX: x, clientY: startY, bubbles: true }));
  h.dispatchEvent(new PointerEvent("pointermove", { pointerId: 1, clientX: x, clientY: startY + dy, bubbles: true }));
  h.dispatchEvent(new PointerEvent("pointerup", { pointerId: 1, clientX: x, clientY: startY + dy, bubbles: true }));
}

describe("lustrous-bottom-sheet", () => {
  it("opens from the trigger as a bottom-anchored modal sheet", async () => {
    const el = await make(100);
    await userEvent.click(el.querySelector("[slot=trigger]")!);
    await el.updateComplete;
    await settle();
    const dialog = el.shadowRoot!.querySelector("dialog")!;
    expect(dialog.matches(":modal")).toBe(true);
    expect(dialog.getAttribute("aria-label")).toBe("Share");
    expect(document.activeElement).toBe(el.querySelector("#first"));
    expect(Math.round(sheet(el).getBoundingClientRect().bottom)).toBe(800);
    expect(css(sheet(el), "border-top-left-radius")).toBe("28px");
    expect(css(sheet(el), "border-bottom-left-radius")).toBe("0px");
    expect(sheetY(el)).toBe(0);
  });

  it("peeks tall content at 50%, expands on upward drag, and collapses on downward drag", async () => {
    const el = await make(1200);
    el.open = true;
    await el.updateComplete;
    await settle();
    expect(sheetY(el)).toBeGreaterThan(0);
    expect(800 - (sheet(el).offsetHeight - sheetY(el))).toBe(400);

    drag(el, -100);
    await el.updateComplete;
    expect(el.expanded).toBe(true);
    expect(sheetY(el)).toBe(0);

    drag(el, 120);
    await el.updateComplete;
    expect(el.expanded).toBe(false);
    expect(el.open).toBe(true);
  });

  it("dispatches cancelable lustrous-close-request with reason 'swipe' when swiped down from peek", async () => {
    const el = await make(100);
    el.open = true;
    await el.updateComplete;
    const onClose = vi.fn();
    el.addEventListener("lustrous-close-request", (e) => onClose(e.detail.reason));

    drag(el, 40);
    await el.updateComplete;
    expect(el.open).toBe(true);

    drag(el, 120);
    await el.updateComplete;
    expect(onClose).toHaveBeenCalledWith("swipe");
    expect(el.open).toBe(false);
  });

  it("opens fully expanded when default-snap-point=1", async () => {
    const el = await make(1200);
    el.defaultSnapPoint = 1;
    el.open = true;
    await el.updateComplete;
    await settle();
    expect(el.expanded).toBe(true);
    expect(sheetY(el)).toBe(0);
  });

  it("wraps body in lustrous-scrollable-box by default and supports header/footer slots and scrollable=false", async () => {
    await setViewport(400, 800);
    const el = await fixture<LustrousBottomSheet>(
      `<lustrous-bottom-sheet open default-snap-point="1" body-scrim="end"><div slot="header">Header</div><div>Body</div><div slot="footer">Footer</div></lustrous-bottom-sheet>`,
    );
    await el.updateComplete;
    const scrollBox = el.shadowRoot!.querySelector("lustrous-scrollable-box");
    expect(scrollBox).not.toBeNull();
    expect(scrollBox!.getAttribute("scrim")).toBe("end");
    expect(el.shadowRoot!.querySelector<HTMLElement>("[part=header]")!.hidden).toBe(false);
    expect(el.shadowRoot!.querySelector<HTMLElement>("[part=footer]")!.hidden).toBe(false);

    el.scrollable = false;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector("lustrous-scrollable-box")).toBeNull();
    el.open = false;
    await el.updateComplete;
  });
});
