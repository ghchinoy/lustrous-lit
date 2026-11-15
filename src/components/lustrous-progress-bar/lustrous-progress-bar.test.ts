import { describe, expect, it } from "vitest";
import { css, fixture } from "../../test/fixture.js";
import "./lustrous-progress-bar.js";
import type { LustrousProgressBar } from "./lustrous-progress-bar.js";

const fill = (el: LustrousProgressBar) => el.shadowRoot!.querySelector<HTMLElement>("[part=fill]")!;

describe("lustrous-progress-bar", () => {
  it("sets --_lustrous-progress via setHostVar and exposes role=progressbar", async () => {
    const wrap = await fixture<HTMLElement>(
      `<div style="width: 200px"><lustrous-progress-bar value="40" label="Upload"></lustrous-progress-bar></div>`,
    );
    const el = wrap.querySelector<LustrousProgressBar>("lustrous-progress-bar")!;
    await el.updateComplete;

    expect(el.style.getPropertyValue("--_lustrous-progress")).toBe("40%");
    expect(el.internals?.role).toBe("progressbar");
    expect(el.internals?.ariaValueNow).toBe("40");
    expect(el.internals?.ariaValueMax).toBe("100");
    expect(el.internals?.ariaLabel).toBe("Upload");

    await new Promise((r) => setTimeout(r, 300));
    expect(css(fill(el), "width")).toBe("80px");
  });

  it("clamps out-of-range values, supports tones, and hides ARIA semantics when decorative", async () => {
    const el = await fixture<LustrousProgressBar>(
      `<lustrous-progress-bar value="140" tone="positive" label="Check"></lustrous-progress-bar>`,
    );
    expect(el.clampedValue).toBe(100);
    expect(el.style.getPropertyValue("--_lustrous-progress")).toBe("100%");
    expect(el.internals?.ariaValueNow).toBe("100");

    el.value = -10;
    el.decorative = true;
    await el.updateComplete;
    expect(el.clampedValue).toBe(0);
    expect(el.style.getPropertyValue("--_lustrous-progress")).toBe("0%");
    expect(el.internals?.role).toBeNull();
    expect(el.internals?.ariaHidden).toBe("true");
  });
});
