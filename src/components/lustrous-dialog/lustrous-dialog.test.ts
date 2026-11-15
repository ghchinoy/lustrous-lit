import { beforeEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { css, fixture, setViewport } from "../../test/fixture.js";
import "../lustrous-tooltip/lustrous-tooltip.js";
import type { LustrousDialog } from "./lustrous-dialog.js";
import "./lustrous-dialog.js";

const card = (el: LustrousDialog) => el.shadowRoot!.querySelector<HTMLElement>("[part=card]")!;
const buttons = (el: LustrousDialog) => [...el.shadowRoot!.querySelectorAll("lustrous-button")];

describe("lustrous-dialog", () => {
  beforeEach(async () => {
    await setViewport(1200, 800);
  });

  it("renders inline as a labelled dialog with s | m | l sizes", async () => {
    const el = await fixture<LustrousDialog>(
      `<lustrous-dialog heading="Rename" primary-action="Save" secondary-action="Cancel">Body</lustrous-dialog>`,
    );
    const c = card(el);
    expect(c.getAttribute("role")).toBe("dialog");
    expect(el.shadowRoot!.getElementById(c.getAttribute("aria-labelledby")!)!.textContent).toBe("Rename");
    expect(css(c, "width")).toBe("420px");

    el.size = "s";
    await el.updateComplete;
    expect(css(c, "width")).toBe("320px");

    el.size = "l";
    await el.updateComplete;
    expect(css(c, "width")).toBe("560px");
  });

  it("opens from slot='trigger' in modal mode, fires cancelable lustrous-action, and ignores nested tooltip toggles", async () => {
    const el = await fixture<LustrousDialog>(
      `<lustrous-dialog modal heading="Delete?" primary-action="Delete" secondary-action="Cancel"><button slot="trigger">Open</button><lustrous-tooltip content="Help"><button>?</button></lustrous-tooltip></lustrous-dialog>`,
    );
    await userEvent.click(el.querySelector('button[slot="trigger"]')!);
    await el.updateComplete;
    expect(el.open).toBe(true);

    // Nested tooltip toggle does not close the dialog.
    const tip = el.querySelector<HTMLElement & { open: boolean; updateComplete: Promise<boolean> }>("lustrous-tooltip")!;
    tip.open = true;
    await tip.updateComplete;
    tip.open = false;
    await tip.updateComplete;
    await el.updateComplete;
    expect(el.open).toBe(true);

    // Canceling lustrous-action keeps modal open.
    const onAction = vi.fn();
    el.addEventListener("lustrous-action", (e) => {
      onAction(e.detail.action);
      if (e.detail.action === "primary") e.preventDefault();
    });
    const [cancelBtn, deleteBtn] = buttons(el);
    deleteBtn.shadowRoot!.querySelector("button")!.click();
    await el.updateComplete;
    expect(el.open).toBe(true);

    cancelBtn.shadowRoot!.querySelector("button")!.click();
    await el.updateComplete;
    expect(onAction.mock.calls.map((c) => c[0])).toEqual(["primary", "secondary"]);
    expect(el.open).toBe(false);
  });

  it("renders a dismissible close button defaulting to getLustrousLabels().close and respecting close-disabled", async () => {
    const el = await fixture<LustrousDialog>(`<lustrous-dialog modal open dismissible heading="Details">Body</lustrous-dialog>`);
    await el.updateComplete;
    const closeBtn = el.shadowRoot!.querySelector<HTMLElement & { disabled: boolean }>("[part=close-button]")!;
    expect(closeBtn.getAttribute("aria-label")).toBe("Close");

    const reasons: string[] = [];
    el.addEventListener("lustrous-close-request", (e) => {
      reasons.push(e.detail.reason);
      e.preventDefault();
    }, { once: true });

    closeBtn.shadowRoot!.querySelector("button")!.click();
    await el.updateComplete;
    expect(reasons).toEqual(["dismiss"]);
    expect(el.open).toBe(true);

    el.closeDisabled = true;
    await el.updateComplete;
    expect(closeBtn.disabled).toBe(true);
  });
});
