import { describe, expect, it } from "vitest";
import { css, fixture } from "../../test/fixture.js";
import "./lustrous-action-bar.js";
import type { LustrousActionBar } from "./lustrous-action-bar.js";

describe("lustrous-action-bar", () => {
  it("exposes role=toolbar with ariaLabel and elevates when variant=floating", async () => {
    const el = await fixture<LustrousActionBar>(
      `<lustrous-action-bar label="Selection"><button>A</button><button>B</button></lustrous-action-bar>`,
    );
    expect(el.internals?.role).toBe("toolbar");
    expect(el.internals?.ariaLabel).toBe("Selection");
    expect(css(el, "border-top-left-radius")).toBe("9999px");
    expect(css(el, "column-gap")).toBe("8px");
    expect(css(el, "padding-left")).toBe("12px");
    expect(css(el, "box-shadow")).toBe("none");

    el.variant = "floating";
    await el.updateComplete;
    expect(css(el, "box-shadow")).not.toBe("none");
  });
});
