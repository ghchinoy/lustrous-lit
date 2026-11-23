import { describe, expect, it } from "vitest";
import { css, fixture, setViewport } from "../../test/fixture.js";
import type { LustrousButton } from "./lustrous-button.js";
import "./lustrous-button.js";

describe("lustrous-button", () => {
  it("submits and resets native forms and renders links when href is set", async () => {
    let submitted = false;
    const form = await fixture<HTMLFormElement>(
      `<form><input name="q" value="a" /><lustrous-button type="submit">Send</lustrous-button></form>`,
    );
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      submitted = true;
    });
    const btn = form.querySelector<LustrousButton>("lustrous-button")!;
    await btn.updateComplete;
    btn.shadowRoot!.querySelector("button")!.click();
    expect(submitted).toBe(true);

    const link = await fixture<LustrousButton>(`<lustrous-button href="/docs">Docs</lustrous-button>`);
    expect(link.shadowRoot!.querySelector("a")!.getAttribute("href")).toBe("/docs");
  });

  it("supports variant=primary and expands size=s to a 44px minimum touch target at <=768px", async () => {
    await setViewport(1200, 800);
    const el = await fixture<LustrousButton>(
      `<lustrous-button variant="primary" size="s">Save</lustrous-button>`,
    );
    const btn = el.shadowRoot!.querySelector<HTMLButtonElement>("button")!;
    expect(btn.classList.contains("variant-primary")).toBe(true);
    expect(css(btn, "height")).toBe("36px");

    await setViewport(400, 800);
    await expect.poll(() => parseFloat(css(btn, "height"))).toBeGreaterThanOrEqual(44);
    await setViewport(1200, 800);
  });
});
