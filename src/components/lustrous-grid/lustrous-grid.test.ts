import { describe, expect, it } from "vitest";
import { css, fixture } from "../../test/fixture.js";
import type { LustrousGrid } from "./lustrous-grid.js";
import "./lustrous-grid.js";

describe("lustrous-grid", () => {
  it("resolves equal columns and col-span", async () => {
    const el = await fixture<LustrousGrid>(
      `<lustrous-grid columns="3" gap="s" width="316">
        <lustrous-grid-item col-span="2">A</lustrous-grid-item>
        <lustrous-grid-item>B</lustrous-grid-item>
      </lustrous-grid>`,
    );
    expect(css(el, "display")).toBe("grid");
    const first = el.firstElementChild!.getBoundingClientRect();
    expect(Math.abs(first.width - 208)).toBeLessThan(1);
  });
});
