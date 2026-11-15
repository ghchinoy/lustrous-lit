import { describe, expect, it } from "vitest";
import { css, fixture, setViewport } from "../../test/fixture.js";
import type { LustrousFlex } from "./lustrous-flex.js";
import "./lustrous-flex.js";

describe("lustrous-flex", () => {
  it("lays out flex children and stacks on mobile-direction=column", async () => {
    await setViewport(1200, 800);
    const el = await fixture<LustrousFlex>(
      `<lustrous-flex direction="row" mobile-direction="column" gap="m" align="center"><div>A</div><div>B</div></lustrous-flex>`,
    );
    expect(css(el, "display")).toBe("flex");
    expect(css(el, "flex-direction")).toBe("row");
    expect(css(el, "column-gap")).toBe("12px");

    await setViewport(500, 800);
    await expect.poll(() => css(el, "flex-direction")).toBe("column");
    await setViewport(1200, 800);
  });
});
