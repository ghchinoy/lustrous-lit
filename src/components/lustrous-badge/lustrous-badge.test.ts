import { describe, expect, it } from "vitest";
import { fixture } from "../../test/fixture.js";
import type { LustrousBadge } from "./lustrous-badge.js";
import "./lustrous-badge.js";

describe("lustrous-badge", () => {
  it("renders tone class and optional icon", async () => {
    const el = await fixture<LustrousBadge>(`<lustrous-badge tone="cobalt" icon="bolt">Active</lustrous-badge>`);
    const pill = el.shadowRoot!.querySelector(".pill")!;
    expect(pill.classList.contains("tone-cobalt")).toBe(true);
    expect(pill.querySelector("svg")).not.toBeNull();
  });
});
