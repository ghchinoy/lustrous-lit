import { describe, expect, it } from "vitest";
import { fixture } from "../../test/fixture.js";
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
});
