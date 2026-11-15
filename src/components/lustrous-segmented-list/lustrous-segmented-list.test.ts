import { describe, expect, it } from "vitest";
import { css, fixture } from "../../test/fixture.js";
import type {
  LustrousSegmentedList,
  LustrousSegmentedListButton,
  LustrousSegmentedListItem,
  LustrousSegmentedListLink,
} from "./lustrous-segmented-list.js";
import "./lustrous-segmented-list.js";

describe("lustrous-segmented-list", () => {
  it("rounds outer corners of first/last items and uses 4px inner seam radii", async () => {
    const list = await fixture<LustrousSegmentedList>(`
      <lustrous-segmented-list label="Items">
        <lustrous-segmented-list-item id="first" padding="m">First</lustrous-segmented-list-item>
        <lustrous-segmented-list-item id="mid" padding="m">Middle</lustrous-segmented-list-item>
        <lustrous-segmented-list-item id="last" padding="m">Last</lustrous-segmented-list-item>
      </lustrous-segmented-list>
    `);
    const first = list.querySelector<LustrousSegmentedListItem>("#first")!;
    const mid = list.querySelector<LustrousSegmentedListItem>("#mid")!;
    const last = list.querySelector<LustrousSegmentedListItem>("#last")!;
    await Promise.all([first.updateComplete, mid.updateComplete, last.updateComplete]);

    expect(css(list, "row-gap")).toBe("4px");
    expect(css(first, "border-top-left-radius")).toBe("14px");
    expect(css(first, "border-bottom-left-radius")).toBe("4px");
    expect(css(mid, "border-top-left-radius")).toBe("4px");
    expect(css(mid, "border-bottom-left-radius")).toBe("4px");
    expect(css(last, "border-top-left-radius")).toBe("4px");
    expect(css(last, "border-bottom-left-radius")).toBe("14px");
  });

  it("collapses gap and seam radius to 0px and marks children when divider is set", async () => {
    const list = await fixture<LustrousSegmentedList>(`
      <lustrous-segmented-list divider border-radius="xl">
        <lustrous-segmented-list-button id="btn" padding="m">Run check</lustrous-segmented-list-button>
        <lustrous-segmented-list-link id="lnk" href="/logs" padding="m">View logs</lustrous-segmented-list-link>
      </lustrous-segmented-list>
    `);
    const btn = list.querySelector<LustrousSegmentedListButton>("#btn")!;
    const lnk = list.querySelector<LustrousSegmentedListLink>("#lnk")!;
    await Promise.all([btn.updateComplete, lnk.updateComplete]);

    expect(css(list, "row-gap")).toBe("0px");
    expect(btn.hasAttribute("data-segmented-divider")).toBe(true);
    expect(lnk.hasAttribute("data-segmented-divider")).toBe(true);
    expect(css(btn, "border-top-left-radius")).toBe("20px");
    expect(css(btn, "border-bottom-left-radius")).toBe("0px");
    expect(lnk.shadowRoot!.querySelector("a.inner")?.getAttribute("href")).toBe("/logs");

    list.divider = false;
    await list.updateComplete;
    expect(btn.hasAttribute("data-segmented-divider")).toBe(false);
  });

  it("renders action row layout when slot='action' is populated", async () => {
    const list = await fixture<LustrousSegmentedList>(`
      <lustrous-segmented-list>
        <lustrous-segmented-list-item id="row" padding="m">
          <span>Primary label</span>
          <button slot="action" type="button">Edit</button>
        </lustrous-segmented-list-item>
      </lustrous-segmented-list>
    `);
    const row = list.querySelector<LustrousSegmentedListItem>("#row")!;
    await row.updateComplete;
    expect(row.shadowRoot!.querySelector("[part=row]")).toBeTruthy();
    expect(row.shadowRoot!.querySelector("[part=action]")).toBeTruthy();
  });
});
