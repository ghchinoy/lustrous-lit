import { beforeEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { css, fixture, setViewport } from "../../test/fixture.js";
import type { LustrousTooltip } from "../lustrous-tooltip/lustrous-tooltip.js";
import type { LustrousSidebar, LustrousSidebarDrawer, LustrousSidebarItem } from "./lustrous-sidebar.js";
import "./lustrous-sidebar.js";

const settle = () => new Promise((r) => setTimeout(r, 300));
const row = (el: LustrousSidebarItem) => el.shadowRoot!.querySelector<HTMLElement>("[part=row]")!;

async function make(attrs = "") {
  const wrap = await fixture<HTMLElement>(`<div style="height: 600px; display: flex">
    <lustrous-sidebar label="Main" ${attrs}>
      <lustrous-sidebar-header label="Studio"><span slot="logo">◆</span></lustrous-sidebar-header>
      <lustrous-sidebar-nav>
        <lustrous-sidebar-item id="home" icon="home" label="Overview" active></lustrous-sidebar-item>
        <lustrous-sidebar-item id="docs" icon="book" label="Docs" href="/docs"></lustrous-sidebar-item>
        <lustrous-sidebar-scroll-area>
          <lustrous-sidebar-section heading="Recent" collapsible>
            <lustrous-sidebar-item id="recent" label="Q4 Architecture" meta="5m" pinned badge></lustrous-sidebar-item>
          </lustrous-sidebar-section>
        </lustrous-sidebar-scroll-area>
      </lustrous-sidebar-nav>
      <lustrous-sidebar-footer>
        <lustrous-sidebar-item id="settings" icon="settings" label="Settings"></lustrous-sidebar-item>
      </lustrous-sidebar-footer>
    </lustrous-sidebar>
  </div>`);
  const el = wrap.querySelector<LustrousSidebar>("lustrous-sidebar")!;
  const items = [...wrap.querySelectorAll<LustrousSidebarItem>("lustrous-sidebar-item")];
  await Promise.all([el.updateComplete, ...items.map((i) => i.updateComplete)]);
  const item = (id: string) => wrap.querySelector<LustrousSidebarItem>(`#${id}`)!;
  return { el, wrap, item };
}

describe("lustrous-sidebar", () => {
  beforeEach(() => setViewport(1200, 800));

  it("collapses smoothly from 272px to 56px with cancelable lustrous-change and keeps icon x-alignment", async () => {
    const { el, wrap, item } = await make();
    await expect.poll(() => css(el, "width")).toBe("272px");

    const onChange = vi.fn();
    el.addEventListener("lustrous-change", (e) => onChange(e.detail.collapsed));
    const iconLeftBefore = row(item("home")).querySelector(".icon")!.getBoundingClientRect().left;

    const toggle = wrap.querySelector("lustrous-sidebar-header")!.shadowRoot!.querySelector("lustrous-icon-button")!;
    toggle.shadowRoot!.querySelector("button")!.click();
    await el.updateComplete;
    await settle();

    expect(onChange).toHaveBeenCalledWith(true);
    expect(el.collapsed).toBe(true);
    await expect.poll(() => css(el, "width")).toBe("56px");
    expect(Math.round(row(item("home")).querySelector(".icon")!.getBoundingClientRect().left)).toBe(
      Math.round(iconLeftBefore),
    );
  });

  it("syncs truncationTarget on lustrous-tooltip in updated() and supports overflow actions + badges", async () => {
    const { item } = await make();
    const home = item("home");
    const tip = home.shadowRoot!.querySelector<LustrousTooltip>("lustrous-tooltip.row-tip")!;
    expect(tip.onlyWhenTruncated).toBe(true);
    expect(tip.truncationTarget).toBe(home.shadowRoot!.querySelector(".label"));

    const recent = item("recent");
    recent.actions = [
      { type: "action", label: "Rename" },
      { type: "action", label: "Delete", destructive: true },
    ];
    await recent.updateComplete;
    const overflow = recent.shadowRoot!.querySelector<HTMLElement>("lustrous-icon-button.overflow")!;
    expect(overflow.getAttribute("aria-label")).toBe("More options for Q4 Architecture");
    overflow.focus();
    await settle();
    await userEvent.keyboard("{Enter}");
    await settle();
    const actionsMenu = recent.shadowRoot!.querySelector<HTMLElement & { open: boolean }>("lustrous-menu.actions")!;
    expect(actionsMenu.open).toBe(true);
  });

  it("applies mobile touch sizing below 960px and dismisses lustrous-sidebar-drawer from the header close button", async () => {
    try {
      await setViewport(400, 800);
      const wrap = await fixture<HTMLElement>(`<div>
        <button id="opener">Menu</button>
        <lustrous-sidebar-drawer label="Side navigation">
          <lustrous-sidebar label="Main">
            <lustrous-sidebar-header label="Studio"><span slot="logo">◆</span></lustrous-sidebar-header>
            <lustrous-sidebar-nav>
              <lustrous-sidebar-item id="a" icon="home" label="Overview"></lustrous-sidebar-item>
            </lustrous-sidebar-nav>
          </lustrous-sidebar>
        </lustrous-sidebar-drawer>
      </div>`);
      const drawer = wrap.querySelector<LustrousSidebarDrawer>("lustrous-sidebar-drawer")!;
      const opener = wrap.querySelector<HTMLButtonElement>("#opener")!;
      opener.focus();
      drawer.returnFocus = opener;
      drawer.open = true;
      await drawer.updateComplete;

      const itemEl = wrap.querySelector<LustrousSidebarItem>("#a")!;
      await itemEl.updateComplete;
      expect(css(row(itemEl), "height")).toBe("44px");

      const reasons: string[] = [];
      drawer.addEventListener("lustrous-close-request", (e) => reasons.push(e.detail.reason));
      const headerBtn = wrap
        .querySelector("lustrous-sidebar-header")!
        .shadowRoot!.querySelector("lustrous-icon-button")!
        .shadowRoot!.querySelector("button")!;
      headerBtn.click();
      await drawer.updateComplete;

      expect(reasons).toEqual(["dismiss"]);
      expect(drawer.open).toBe(false);
      expect(document.activeElement).toBe(opener);
    } finally {
      await setViewport(1200, 800);
    }
  });
});
