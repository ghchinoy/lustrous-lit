import { describe, expect, it } from "vitest";
import { fixture } from "../../test/fixture.js";
import type { LustrousScrollableBox } from "./lustrous-scrollable-box.js";
import "./lustrous-scrollable-box.js";

describe("lustrous-scrollable-box", () => {
  it("becomes focusable and named region when overflowing", async () => {
    const el = await fixture<LustrousScrollableBox>(
      `<lustrous-scrollable-box height="80" label="Logs"><div style="height: 240px">Tall</div></lustrous-scrollable-box>`,
    );
    await expect.poll(() => el.scrollElement.getAttribute("tabindex")).toBe("0");
    expect(el.scrollElement.getAttribute("role")).toBe("region");
    expect(el.scrollElement.getAttribute("aria-label")).toBe("Logs");
  });

  it("applies scrim-size per viewport without leaking into nested scroll boxes", async () => {
    const outer = await fixture<LustrousScrollableBox>(
      `<lustrous-scrollable-box height="100" scrim-size="16">
        <lustrous-scrollable-box id="inner" height="60"><div style="height: 200px">Inner</div></lustrous-scrollable-box>
      </lustrous-scrollable-box>`,
    );
    const inner = outer.querySelector<LustrousScrollableBox>("#inner")!;
    await inner.updateComplete;
    expect(outer.scrollElement.style.getPropertyValue("--_lustrous-scrim-size")).toBe("16px");
    expect(inner.scrollElement.style.getPropertyValue("--_lustrous-scrim-size")).toBe("36px");
  });
});
