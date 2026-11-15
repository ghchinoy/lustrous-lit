import { afterEach, describe, expect, it, vi } from "vitest";
import { css, fixture } from "../../test/fixture.js";
import { DEFAULT_LUSTROUS_LABELS, setLustrousLabels } from "../../theme/labels.js";
import "./lustrous-snackbar.js";
import { dismissSnack, showSnack, type LustrousSnackbar } from "./lustrous-snackbar.js";

const snacks = (el: LustrousSnackbar) => [...el.shadowRoot!.querySelectorAll<HTMLElement>("[part=snack]")];
const live = (el: LustrousSnackbar, role: string) => el.shadowRoot!.querySelector(`.sr-only[role=${role}]`)!;
const frame = () => new Promise((r) => requestAnimationFrame(() => r(undefined)));

afterEach(() => {
  document.querySelectorAll("lustrous-snackbar").forEach((s) => s.remove());
  setLustrousLabels(DEFAULT_LUSTROUS_LABELS);
});

describe("lustrous-snackbar", () => {
  it("keeps the closed viewport hidden and opens in the top layer with polite live announcement", async () => {
    const el = await fixture<LustrousSnackbar>(`<lustrous-snackbar></lustrous-snackbar>`);
    const viewport = el.shadowRoot!.querySelector<HTMLElement>("[part=viewport]")!;
    expect(css(viewport, "display")).toBe("none");

    el.show("Project archived", { duration: 0 });
    await el.updateComplete;
    await frame();
    await el.updateComplete;

    const [s] = snacks(el);
    expect(s.textContent).toContain("Project archived");
    expect(viewport.matches(":popover-open")).toBe(true);
    expect(css(s, "border-top-left-radius")).toBe("14px");
    expect(s.querySelector("lustrous-icon-button")).toBeTruthy();
    expect(live(el, "status").textContent).toBe("Project archived");
  });

  it("supports positive, warning, and error variants and announces errors assertively", async () => {
    const el = await fixture<LustrousSnackbar>(`<lustrous-snackbar max="4"></lustrous-snackbar>`);
    el.show("Saved", { variant: "positive", duration: 0 });
    el.show("Quota high", { variant: "warning", duration: 0 });
    el.show("Save failed", { variant: "error", duration: 0 });
    await frame();
    await el.updateComplete;

    expect(snacks(el).map((s) => s.dataset.variant)).toEqual(["positive", "warning", "error"]);
    expect(live(el, "alert").textContent).toBe("Save failed");
    expect(live(el, "alert").getAttribute("aria-live")).toBe("assertive");
  });

  it("auto-dismisses after duration and pauses while hovered", async () => {
    const el = await fixture<LustrousSnackbar>(`<lustrous-snackbar></lustrous-snackbar>`);
    const onDismiss = vi.fn();
    el.addEventListener("lustrous-snack-dismiss", (e) => onDismiss(e.detail.reason));
    el.show("Saved", { duration: 150 });
    await el.updateComplete;
    snacks(el)[0].dispatchEvent(new PointerEvent("pointerenter"));
    await new Promise((r) => setTimeout(r, 250));
    expect(snacks(el)).toHaveLength(1);
    snacks(el)[0].dispatchEvent(new PointerEvent("pointerleave"));
    await new Promise((r) => setTimeout(r, 250));
    await el.updateComplete;
    expect(snacks(el)).toHaveLength(0);
    expect(onDismiss).toHaveBeenCalledWith("timeout");
  });

  it("runs action callback and dismisses, and respects localized getLustrousLabels()", async () => {
    setLustrousLabels({ notifications: "Meldungen", close: "Schließen" });
    const el = await fixture<LustrousSnackbar>(`<lustrous-snackbar></lustrous-snackbar>`);
    const undo = vi.fn();
    el.show("Archived", { action: { label: "Undo", onClick: undo }, duration: 0 });
    await el.updateComplete;

    const viewport = el.shadowRoot!.querySelector<HTMLElement>("[part=viewport]")!;
    expect(viewport.getAttribute("aria-label")).toBe("Meldungen");
    const [s] = snacks(el);
    expect(s.querySelector("lustrous-icon-button")!.getAttribute("aria-label")).toBe("Schließen");

    s.querySelector("lustrous-button")!.shadowRoot!.querySelector("button")!.click();
    await el.updateComplete;
    expect(undo).toHaveBeenCalledOnce();
    expect(snacks(el)).toHaveLength(0);
  });

  it("creates a snackbar via showSnack() and clears via dismissSnack()", async () => {
    showSnack("Hello", { duration: 0 });
    const el = document.querySelector("lustrous-snackbar")!;
    await el.updateComplete;
    expect(snacks(el)).toHaveLength(1);
    dismissSnack();
    await el.updateComplete;
    expect(snacks(el)).toHaveLength(0);
  });
});
