import { describe, expect, it } from "vitest";
import { fixture } from "../../test/fixture.js";
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
});
