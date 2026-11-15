import { describe, expect, it } from "vitest";
import { css, fixture, setViewport } from "../../test/fixture.js";
import type { LustrousBox } from "./lustrous-box.js";
import "./lustrous-box.js";

describe("lustrous-box", () => {
  it("applies spacing, dimensions, radius, and responsive mobile-padding", async () => {
    await setViewport(1200, 800);
    const el = await fixture<LustrousBox>(
      `<lustrous-box padding="xl" mobile-padding="s" width="240" border-radius="l">Body</lustrous-box>`,
    );
    expect(css(el, "padding-top")).toBe("20px");
    expect(css(el, "width")).toBe("240px");
    expect(css(el, "border-top-left-radius")).toBe("14px");

    await setViewport(500, 800);
    await expect.poll(() => css(el, "padding-top")).toBe("8px");
    await setViewport(1200, 800);
  });
});
