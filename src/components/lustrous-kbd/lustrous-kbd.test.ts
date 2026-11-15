import { describe, expect, it } from "vitest";
import { css, fixture } from "../../test/fixture.js";
import type { LustrousKbd } from "./lustrous-kbd.js";
import "./lustrous-kbd.js";

describe("lustrous-kbd", () => {
  it("renders a single semantic <kbd> for slotted content and scales up with size='m'", async () => {
    const el = await fixture<LustrousKbd>(`<lustrous-kbd>Esc</lustrous-kbd>`);
    await el.updateComplete;

    const kbd = el.shadowRoot!.querySelector<HTMLElement>("kbd:not([hidden])")!;
    expect(kbd).toBeTruthy();
    expect(el.textContent).toBe("Esc");
    expect(css(kbd, "font-size")).toBe("12px");

    el.size = "m";
    await el.updateComplete;
    expect(css(kbd, "font-size")).toBe("14px");
    expect(css(kbd, "padding-left")).toBe("8px");
  });

  it("parses declarative string chords and renders array keycaps in a dir='ltr' group", async () => {
    const fromAttr = await fixture<LustrousKbd>(`<lustrous-kbd keys="Shift+Escape"></lustrous-kbd>`);
    await fromAttr.updateComplete;
    const attrKeys = Array.from(fromAttr.shadowRoot!.querySelectorAll("kbd")).map((k) => k.textContent);
    expect(attrKeys.at(-1)).toBe("Esc");
    expect(attrKeys.length).toBe(2);

    const fromArray = await fixture<LustrousKbd>(`<lustrous-kbd></lustrous-kbd>`);
    fromArray.keys = ["⇧", "⌘", "O"];
    await fromArray.updateComplete;
    const group = fromArray.shadowRoot!.querySelector<HTMLElement>("[part=group]")!;
    expect(group.getAttribute("dir")).toBe("ltr");
    expect(Array.from(fromArray.shadowRoot!.querySelectorAll("kbd")).map((k) => k.textContent)).toEqual(["⇧", "⌘", "O"]);
  });

  it("renders no visible keycaps when keys is empty or slot is empty", async () => {
    const emptyKeys = await fixture<LustrousKbd>(`<lustrous-kbd></lustrous-kbd>`);
    emptyKeys.keys = [];
    await emptyKeys.updateComplete;
    expect(emptyKeys.shadowRoot!.querySelectorAll("kbd")).toHaveLength(0);

    const emptySlot = await fixture<LustrousKbd>(`<lustrous-kbd></lustrous-kbd>`);
    await emptySlot.updateComplete;
    expect(emptySlot.shadowRoot!.querySelectorAll("kbd:not([hidden])")).toHaveLength(0);
  });
});
