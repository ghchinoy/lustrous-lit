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
});
