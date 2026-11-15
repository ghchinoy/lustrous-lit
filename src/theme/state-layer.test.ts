import { describe, expect, it } from "vitest";
import "../index.js";
import { fixture } from "../test/fixture.js";

describe("lustrousStateLayer containment", () => {
  it.each([
    ["lustrous-button", `<lustrous-button>Action</lustrous-button>`],
    ["lustrous-icon-button", `<lustrous-icon-button icon="bolt" aria-label="Bolt"></lustrous-icon-button>`],
    ["lustrous-pressable", `<lustrous-pressable padding="m">Tile</lustrous-pressable>`],
    ["lustrous-tabs", `<lustrous-tabs label="View"></lustrous-tabs>`],
  ])("%s keeps .state-layer positioned relative so hover overlays stay bounded", async (name, markup) => {
    const el = await fixture<HTMLElement>(markup);
    if (name === "lustrous-tabs") {
      (el as HTMLElement & { tabs: Array<{ value: string; label: string }> }).tabs = [
        { value: "a", label: "Overview" },
        { value: "b", label: "Activity" },
      ];
      await (el as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
    }
    const target = el.shadowRoot!.querySelector<HTMLElement>(".state-layer");
    expect(target, `${name} .state-layer`).not.toBeNull();
    expect(getComputedStyle(target!).position).toBe("relative");
  });
});
