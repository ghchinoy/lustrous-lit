import { describe, expect, it } from "vitest";
import { fixture } from "../../test/fixture.js";
import type { LustrousBadgeIndicator } from "./lustrous-badge-indicator.js";
import "./lustrous-badge-indicator.js";

describe("lustrous-badge-indicator", () => {
  it("is aria-hidden unless aria-label is set", async () => {
    const el = await fixture<LustrousBadgeIndicator>(`<lustrous-badge-indicator></lustrous-badge-indicator>`);
    expect(el.getAttribute("aria-hidden")).toBe("true");
    el.setAttribute("aria-label", "Unread");
    await el.updateComplete;
    expect(el.hasAttribute("aria-hidden")).toBe(false);
    expect(el.getAttribute("role")).toBe("img");
  });
});
