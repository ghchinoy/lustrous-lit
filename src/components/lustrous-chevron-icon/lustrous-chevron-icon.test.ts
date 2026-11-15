import { describe, expect, it } from "vitest";
import { fixture } from "../../test/fixture.js";
import type { LustrousChevronIcon } from "./lustrous-chevron-icon.js";
import "./lustrous-chevron-icon.js";

describe("lustrous-chevron-icon", () => {
  it("toggles expanded class on state change", async () => {
    const el = await fixture<LustrousChevronIcon>(`<lustrous-chevron-icon direction="end"></lustrous-chevron-icon>`);
    const span = el.shadowRoot!.querySelector(".lustrous-chevron")!;
    expect(span.classList.contains("expanded")).toBe(false);
    el.expanded = true;
    await el.updateComplete;
    expect(span.classList.contains("expanded")).toBe(true);
  });
});
