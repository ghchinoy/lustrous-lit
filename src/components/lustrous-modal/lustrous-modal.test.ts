import { describe, expect, it } from "vitest";
import { fixture } from "../../test/fixture.js";
import type { LustrousModal } from "./lustrous-modal.js";
import "./lustrous-modal.js";

describe("lustrous-modal", () => {
  it("opens from trigger click and closes on Escape unless canceled", async () => {
    const el = await fixture<LustrousModal>(
      `<lustrous-modal label="Preview"><button slot="trigger">Open</button><button id="inside">OK</button></lustrous-modal>`,
    );
    el.querySelector<HTMLButtonElement>('button[slot="trigger"]')!.click();
    await el.updateComplete;
    expect(el.open).toBe(true);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await el.updateComplete;
    expect(el.open).toBe(false);
  });
});
