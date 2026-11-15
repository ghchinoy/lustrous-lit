import { describe, expect, it } from "vitest";
import { css, fixture } from "../../test/fixture.js";
import "./lustrous-skeleton.js";
import type { LustrousSkeleton } from "./lustrous-skeleton.js";

describe("lustrous-skeleton", () => {
  it("marks host aria-hidden=true and applies width, height, shape, and border-radius", async () => {
    const el = await fixture<LustrousSkeleton>(
      `<lustrous-skeleton width="120" height="24" border-radius="m"></lustrous-skeleton>`,
    );
    expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(css(el, "width")).toBe("120px");
    expect(css(el, "height")).toBe("24px");
    expect(css(el, "border-top-left-radius")).toBe("10px");
  });

  it("supports circle and text shapes", async () => {
    const circle = await fixture<LustrousSkeleton>(`<lustrous-skeleton shape="circle" width="48"></lustrous-skeleton>`);
    expect(css(circle, "width")).toBe("48px");
    expect(css(circle, "height")).toBe("48px");
    expect(css(circle, "border-top-left-radius")).toBe("9999px");

    const text = await fixture<LustrousSkeleton>(`<lustrous-skeleton shape="text" width="80"></lustrous-skeleton>`);
    expect(css(text, "border-top-left-radius")).toBe("9999px");
  });
});
