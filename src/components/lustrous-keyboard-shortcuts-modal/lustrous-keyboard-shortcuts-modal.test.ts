import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { fixture, setViewport } from "../../test/fixture.js";
import type { LustrousKbd } from "../lustrous-kbd/lustrous-kbd.js";
import type { LustrousKeyboardShortcutsModal } from "./lustrous-keyboard-shortcuts-modal.js";
import "./lustrous-keyboard-shortcuts-modal.js";

describe("lustrous-keyboard-shortcuts-modal", () => {
  it("renders non-empty sections using <section>/<dl>/<dt>/<dd> and <lustrous-kbd size='m'>", async () => {
    await setViewport(1200, 800);
    const el = await fixture<LustrousKeyboardShortcutsModal>(
      `<lustrous-keyboard-shortcuts-modal open heading="Keyboard shortcuts" close-label="Close"></lustrous-keyboard-shortcuts-modal>`,
    );
    el.sections = [
      { title: "Unused", rows: [] },
      {
        title: "General",
        rows: [
          { description: "New document", keys: ["⇧", "⌘", "N"] },
          { description: "Search", keys: ["⌘", "K"] },
        ],
      },
      {
        title: "Actions",
        rows: [{ description: "Confirm", keys: ["Enter"] }],
      },
    ];
    await el.updateComplete;
    const dialog = el.shadowRoot!.querySelector("lustrous-dialog")!;
    await dialog.updateComplete;

    const sectionTitles = Array.from(el.shadowRoot!.querySelectorAll(".section-title")).map((n) => n.textContent);
    expect(sectionTitles).toEqual(["General", "Actions"]);

    const terms = Array.from(el.shadowRoot!.querySelectorAll("dt")).map((n) => n.textContent);
    expect(terms).toEqual(["New document", "Search", "Confirm"]);

    const firstDd = el.shadowRoot!.querySelector("dd")!;
    expect(firstDd.getAttribute("dir")).toBe("ltr");
    const firstKbd = firstDd.querySelector<LustrousKbd>("lustrous-kbd")!;
    expect(firstKbd.size).toBe("m");
    await firstKbd.updateComplete;
    expect(Array.from(firstKbd.shadowRoot!.querySelectorAll("kbd")).map((k) => k.textContent)).toEqual(["⇧", "⌘", "N"]);

    const onToggle = vi.fn();
    el.addEventListener("lustrous-toggle", (e) => onToggle(e.detail.open));
    await userEvent.keyboard("{Escape}");
    await dialog.updateComplete;
    await el.updateComplete;
    expect(el.open).toBe(false);
    expect(onToggle).toHaveBeenCalledWith(false);
  });
});
