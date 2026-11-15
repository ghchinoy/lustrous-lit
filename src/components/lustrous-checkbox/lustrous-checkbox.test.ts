import { describe, expect, it } from "vitest";
import { fixture } from "../../test/fixture.js";
import type { LustrousCheckbox } from "./lustrous-checkbox.js";
import "./lustrous-checkbox.js";

describe("lustrous-checkbox", () => {
  it("participates in FormData, clears indeterminate on toggle, and resets", async () => {
    const form = await fixture<HTMLFormElement>(
      `<form><lustrous-checkbox name="terms" value="yes" indeterminate>Accept</lustrous-checkbox></form>`,
    );
    const cb = form.querySelector<LustrousCheckbox>("lustrous-checkbox")!;
    await cb.updateComplete;
    expect(new FormData(form).get("terms")).toBeNull();

    cb.shadowRoot!.querySelector("label")!.click();
    await cb.updateComplete;
    expect(cb.checked).toBe(true);
    expect(cb.indeterminate).toBe(false);
    expect(new FormData(form).get("terms")).toBe("yes");

    form.reset();
    await cb.updateComplete;
    expect(cb.checked).toBe(false);
  });
});
