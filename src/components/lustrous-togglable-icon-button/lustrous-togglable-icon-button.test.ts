import { describe, expect, it } from "vitest";
import { fixture } from "../../test/fixture.js";
import type { LustrousTogglableIconButton } from "./lustrous-togglable-icon-button.js";
import "./lustrous-togglable-icon-button.js";

describe("lustrous-togglable-icon-button", () => {
  it("toggles selected and aria-pressed, supports selected-icon, and honors preventDefault()", async () => {
    const el = await fixture<LustrousTogglableIconButton>(
      `<lustrous-togglable-icon-button icon="visibilityOff" selected-icon="visibility" aria-label="Show secret"></lustrous-togglable-icon-button>`,
    );
    const btn = () => el.shadowRoot!.querySelector("button")!;
    const svgHtml = () => btn().querySelector("svg")!.innerHTML;

    expect(btn().getAttribute("aria-pressed")).toBe("false");
    const unselectedSvg = svgHtml();

    btn().click();
    await el.updateComplete;
    expect(el.selected).toBe(true);
    expect(btn().getAttribute("aria-pressed")).toBe("true");
    expect(svgHtml()).not.toBe(unselectedSvg);

    el.addEventListener("lustrous-change", (e) => e.preventDefault(), { once: true });
    btn().click();
    await el.updateComplete;
    expect(el.selected).toBe(true);
  });
});
