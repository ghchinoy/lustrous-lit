import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { css, fixture, setViewport } from "../../test/fixture.js";
import type { LustrousBottomSheet } from "../lustrous-bottom-sheet/lustrous-bottom-sheet.js";
import type { LustrousPopover } from "./lustrous-popover.js";
import "./lustrous-popover.js";

const panel = (el: LustrousPopover) => el.shadowRoot!.querySelector<HTMLElement>("[part=panel]")!;
const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms));

async function make(attrs = "", inner = "") {
  const wrap = await fixture<HTMLElement>(
    `<div style="padding: 140px"><lustrous-popover heading="Context window" content="Older snapshots are archived." ${attrs}><button id="trig">Info</button>${inner}</lustrous-popover><button id="after">After</button></div>`,
  );
  const el = wrap.querySelector<LustrousPopover>("lustrous-popover")!;
  await el.updateComplete;
  return { el, wrap, btn: wrap.querySelector<HTMLButtonElement>("#trig")! };
}

describe("lustrous-popover", () => {
  it("stays display:none when closed and opens with arrow + square corner alignment", async () => {
    const { el, btn } = await make('side="bottom" align="start"');
    expect(css(panel(el), "display")).toBe("none");

    await userEvent.click(btn);
    await el.updateComplete;
    await tick(30);
    panel(el).getAnimations().forEach((a) => a.finish());

    expect(panel(el).matches(":popover-open")).toBe(true);
    expect(panel(el).dataset.corner).toBe("top-left");
    expect(css(panel(el), "border-top-left-radius")).toBe("0px");
    expect(panel(el).querySelector("svg.arrow.corner")).toBeTruthy();

    // arrow="false" removes the SVG arrow and restores flat rounded corners.
    el.arrow = false;
    await el.updateComplete;
    expect(panel(el).querySelector("svg.arrow")).toBeNull();
    expect(panel(el).dataset.corner).toBeUndefined();
    expect(css(panel(el), "border-top-left-radius")).not.toBe("0px");
  });

  it("supports size presets (s | m | l) and cancelable lustrous-action events", async () => {
    const { el } = await make('open size="m" primary-action="Apply" secondary-action="Reset"');
    await tick(30);
    expect(css(panel(el), "width")).toBe("320px");

    const actions: string[] = [];
    el.addEventListener("lustrous-action", (e) => {
      actions.push(e.detail.action);
      if (e.detail.action === "secondary") e.preventDefault();
    });

    const [reset, apply] = [...el.shadowRoot!.querySelectorAll("lustrous-button")];
    reset.shadowRoot!.querySelector("button")!.click();
    await el.updateComplete;
    expect(el.open).toBe(true);

    apply.shadowRoot!.querySelector("button")!.click();
    await el.updateComplete;
    expect(actions).toEqual(["secondary", "primary"]);
    expect(el.open).toBe(false);
  });

  it("opens on hover when open-on-hover is set without stealing focus", async () => {
    const { el, btn } = await make('open-on-hover delay="0"', '<a slot="content" href="#more">Details</a>');
    await userEvent.hover(btn);
    await expect.poll(() => el.open).toBe(true);
    expect(document.activeElement).not.toBe(el.querySelector("a"));
  });

  it("adds a close icon button, traps focus, and marks outside siblings inert when close-label is set", async () => {
    const { el, wrap, btn } = await make('close-label="Close popover"', '<a slot="content" href="#x">Learn more</a>');
    const outside = wrap.querySelector<HTMLButtonElement>("#after")!;

    await userEvent.click(btn);
    await el.updateComplete;

    expect(el.open).toBe(true);
    expect(panel(el).getAttribute("aria-modal")).toBe("true");
    expect(outside.inert).toBe(true);
    expect(page.getByRole("button", { name: "After" }).elements()).toHaveLength(0);

    const closeBtn = el.shadowRoot!.querySelector<HTMLElement>("[part=close-button]")!;
    expect(closeBtn).toBeTruthy();
    expect(document.activeElement).toBe(el.querySelector("a"));

    await userEvent.tab();
    expect(el.shadowRoot!.activeElement).toBe(closeBtn);
    await userEvent.tab();
    expect(document.activeElement).toBe(el.querySelector("a"));

    closeBtn.shadowRoot!.querySelector("button")!.click();
    await el.updateComplete;
    expect(el.open).toBe(false);
    expect(outside.inert).toBe(false);
    expect(document.activeElement).toBe(btn);
  });

  it("renders as lustrous-bottom-sheet at <= 768px when mobile-drawer is set", async () => {
    try {
      await setViewport(390, 844);
      const { el, btn } = await make("mobile-drawer", '<a slot="content" href="#d">Details</a>');
      await userEvent.click(btn);
      await el.updateComplete;
      await tick(30);

      expect(el.open).toBe(true);
      expect(panel(el).matches(":popover-open")).toBe(false);
      const sheet = el.shadowRoot!.querySelector<LustrousBottomSheet>("lustrous-bottom-sheet")!;
      expect(sheet).toBeTruthy();
      await sheet.updateComplete;
      expect(sheet.open).toBe(true);

      const onToggle = vi.fn();
      el.addEventListener("lustrous-toggle", (e) => onToggle(e.detail.open));
      await userEvent.keyboard("{Escape}");
      await sheet.updateComplete;
      await el.updateComplete;
      expect(el.open).toBe(false);
      expect(onToggle).toHaveBeenCalledWith(false);
    } finally {
      await setViewport(1200, 800);
    }
  });
});
