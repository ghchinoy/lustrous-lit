import { describe, expect, it, vi } from "vitest";
import { fixture } from "../../test/fixture.js";
import type { LustrousTogglableButton } from "./lustrous-togglable-button.js";
import "./lustrous-togglable-button.js";

describe("lustrous-togglable-button", () => {
  it("defaults to variant='tonal', exposes aria-pressed, and toggles via cancelable lustrous-change", async () => {
    const el = await fixture<LustrousTogglableButton>(
      `<lustrous-togglable-button icon="pin">Pin</lustrous-togglable-button>`,
    );
    const btn = () => el.shadowRoot!.querySelector("button")!;
    expect(el.variant).toBe("tonal");
    expect(el.selected).toBe(false);
    expect(btn().getAttribute("aria-pressed")).toBe("false");

    const seen: boolean[] = [];
    el.addEventListener("lustrous-change", (e) => {
      seen.push(Boolean(e.detail.selected));
    });

    btn().click();
    await el.updateComplete;
    expect(el.selected).toBe(true);
    expect(el.hasAttribute("selected")).toBe(true);
    expect(btn().getAttribute("aria-pressed")).toBe("true");
    expect(btn().classList.contains("selected")).toBe(true);
    expect(seen).toEqual([true]);

    // Cancelable controlled mode
    el.addEventListener("lustrous-change", (e) => e.preventDefault(), { once: true });
    btn().click();
    await el.updateComplete;
    expect(el.selected).toBe(true);
  });

  it("does not toggle when disabled", async () => {
    const el = await fixture<LustrousTogglableButton>(
      `<lustrous-togglable-button disabled>Mute</lustrous-togglable-button>`,
    );
    const onChange = vi.fn();
    el.addEventListener("lustrous-change", onChange);
    el.shadowRoot!.querySelector("button")!.click();
    await el.updateComplete;
    expect(el.selected).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });
});
