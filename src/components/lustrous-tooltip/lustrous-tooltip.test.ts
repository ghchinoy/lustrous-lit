import { describe, expect, it } from "vitest";
import { fixture } from "../../test/fixture.js";
import type { LustrousTooltip } from "./lustrous-tooltip.js";
import "./lustrous-tooltip.js";

describe("lustrous-tooltip", () => {
  it(" stays hidden when closed and opens into top layer when open=true", async () => {
    const el = await fixture<LustrousTooltip>(
      `<div style="padding: 40px"><lustrous-tooltip content="Save"><button>S</button></lustrous-tooltip></div>`,
    );
    const tip = el.querySelector<LustrousTooltip>("lustrous-tooltip")!;
    await tip.updateComplete;
    const bubble = tip.querySelector<HTMLElement>('[slot="bubble"]')!;
    expect(bubble.checkVisibility()).toBe(false);

    tip.open = true;
    await tip.updateComplete;
    expect(bubble.matches(":popover-open")).toBe(true);
    expect(bubble.checkVisibility()).toBe(true);
  });
});
