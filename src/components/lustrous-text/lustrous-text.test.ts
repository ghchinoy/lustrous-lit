import { describe, expect, it } from "vitest";
import { css, fixture } from "../../test/fixture.js";
import type { LustrousText } from "./lustrous-text.js";
import "./lustrous-text.js";

describe("lustrous-text", () => {
  it("applies typography variants and exposes ARIA heading via ElementInternals", async () => {
    const el = await fixture<LustrousText>(`<lustrous-text variant="headline-medium" heading="2">Section</lustrous-text>`);
    expect(css(el, "display")).toBe("block");
    expect(el.internals?.role).toBe("heading");
    expect(el.internals?.ariaLevel).toBe("2");
  });
});
