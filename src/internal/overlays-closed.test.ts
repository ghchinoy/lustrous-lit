import { describe, expect, it } from "vitest";
import "../index.js";
import { fixture } from "../test/fixture.js";

describe("overlays closed visibility", () => {
  it.each([
    [
      "lustrous-tooltip",
      `<lustrous-tooltip content="Hello"><button>T</button></lustrous-tooltip>`,
      (el: HTMLElement) => el.querySelector<HTMLElement>('[slot="bubble"]')!,
    ],
    [
      "lustrous-popover",
      `<lustrous-popover heading="Card" content="Details"><button>P</button></lustrous-popover>`,
      (el: HTMLElement) => el.shadowRoot!.querySelector<HTMLElement>("[popover]")!,
    ],
    [
      "lustrous-menu",
      `<lustrous-menu><button slot="trigger">M</button></lustrous-menu>`,
      (el: HTMLElement) => el.shadowRoot!.querySelector<HTMLElement>("[popover]")!,
    ],
    [
      "lustrous-select",
      `<lustrous-select label="Role"><option value="a">Admin</option></lustrous-select>`,
      (el: HTMLElement) => el.shadowRoot!.querySelector<HTMLElement>("[popover]")!,
    ],
    [
      "lustrous-modal",
      `<lustrous-modal label="Modal"><div>Body</div></lustrous-modal>`,
      (el: HTMLElement) => el.shadowRoot!.querySelector<HTMLElement>("dialog")!,
    ],
    [
      "lustrous-dialog",
      `<lustrous-dialog modal heading="Confirm">Body</lustrous-dialog>`,
      (el: HTMLElement) =>
        el.shadowRoot!.querySelector("lustrous-modal")!.shadowRoot!.querySelector<HTMLElement>("dialog")!,
    ],
    [
      "lustrous-bottom-sheet",
      `<lustrous-bottom-sheet label="Sheet">Body</lustrous-bottom-sheet>`,
      (el: HTMLElement) => el.shadowRoot!.querySelector<HTMLElement>("dialog")!,
    ],
  ])("%s does not paint its overlay surface while closed", async (_name, markup, findSurface) => {
    const el = await fixture<HTMLElement>(markup);
    const surface = findSurface(el);
    expect(surface).not.toBeNull();
    expect(surface.checkVisibility()).toBe(false);
  });
});
