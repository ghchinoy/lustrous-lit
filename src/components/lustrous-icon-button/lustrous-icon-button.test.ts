import { describe, expect, it } from "vitest";
import { css, fixture, setViewport } from "../../test/fixture.js";
import type { LustrousIconButton } from "./lustrous-icon-button.js";
import "./lustrous-icon-button.js";

describe("lustrous-icon-button", () => {
  it("forwards aria-label and renders unread badge", async () => {
    const el = await fixture<LustrousIconButton>(
      `<lustrous-icon-button icon="bell" badge aria-label="Notifications (1 unread)"></lustrous-icon-button>`,
    );
    expect(el.shadowRoot!.querySelector("button")!.getAttribute("aria-label")).toBe("Notifications (1 unread)");
    expect(el.shadowRoot!.querySelector("lustrous-badge-indicator")).not.toBeNull();
  });

  it("expands size=s to a 44px minimum touch target at <=768px", async () => {
    await setViewport(1200, 800);
    const el = await fixture<LustrousIconButton>(
      `<lustrous-icon-button icon="search" size="s" aria-label="Search"></lustrous-icon-button>`,
    );
    const btn = el.shadowRoot!.querySelector<HTMLButtonElement>("button")!;
    expect(css(btn, "width")).toBe("36px");
    await setViewport(400, 800);
    await expect.poll(() => parseFloat(css(btn, "width"))).toBeGreaterThanOrEqual(44);
    await expect.poll(() => parseFloat(css(btn, "height"))).toBeGreaterThanOrEqual(44);
    await setViewport(1200, 800);
  });
});
