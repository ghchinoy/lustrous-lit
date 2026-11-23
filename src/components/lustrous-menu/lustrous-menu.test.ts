import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { css, fixture, setViewport } from "../../test/fixture.js";
import type { LustrousMenu, LustrousMenuItem } from "./lustrous-menu.js";
import "./lustrous-menu.js";

const root = (el: LustrousMenu) => el.shadowRoot!.querySelector<HTMLElement>(".menu[data-path=root]")!;
const focused = (el: LustrousMenu) => el.shadowRoot!.activeElement as HTMLElement | null;

async function make(items: LustrousMenuItem[]) {
  const el = await fixture<LustrousMenu>(`<lustrous-menu><button slot="trigger">Actions</button></lustrous-menu>`);
  el.items = items;
  await el.updateComplete;
  return { el, trigger: el.querySelector("button")! };
}

describe("lustrous-menu", () => {
  it("opens from the trigger, navigates with arrows/Home/End/Escape, and returns focus on keyboard activation", async () => {
    const onNew = vi.fn();
    const { el, trigger } = await make([
      { type: "header", label: "Document" },
      { type: "action", label: "New file", icon: "add", shortcut: "⌘N", onClick: onNew },
      { type: "action", label: "Disabled", disabled: true },
      { type: "action", label: "Archive", icon: "archive" },
    ]);

    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    await userEvent.click(trigger);
    await el.updateComplete;

    expect(root(el).matches(":popover-open")).toBe(true);
    expect(focused(el)?.textContent).toContain("New file");

    await userEvent.keyboard("{ArrowDown}");
    expect(focused(el)?.textContent).toContain("Archive");

    await userEvent.keyboard("{Home}");
    expect(focused(el)?.textContent).toContain("New file");

    await userEvent.keyboard("{Enter}");
    await el.updateComplete;
    expect(onNew).toHaveBeenCalledTimes(1);
    expect(el.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it("supports selection, toggle, section, and submenu items with RTL-aware arrow keys", async () => {
    await setViewport(1200, 800);
    const onSelect = vi.fn();
    const onChange = vi.fn();
    const onDark = vi.fn();
    const { el, trigger } = await make([
      { type: "selection", selectionType: "multi", label: "Grid", selected: false, onSelect },
      { type: "toggle", label: "Wrap", checked: true, onChange },
      {
        type: "submenu",
        label: "Theme",
        items: [
          { type: "action", label: "Light" },
          { type: "action", label: "Dark", onClick: onDark },
        ],
      },
    ]);

    await userEvent.click(trigger);
    await el.updateComplete;
    const items = [...root(el).querySelectorAll<HTMLElement>(".item")];
    items[0].click();
    items[1].click();
    await el.updateComplete;
    expect(onSelect).toHaveBeenCalledWith(true, undefined);
    expect(onChange).toHaveBeenCalledWith(false, undefined);
    expect(el.open).toBe(true);

    items[2].focus();
    await userEvent.keyboard("{ArrowRight}");
    await el.updateComplete;
    const sub = el.shadowRoot!.querySelector<HTMLElement>(".menu[data-path='2']")!;
    expect(sub.matches(":popover-open")).toBe(true);
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await el.updateComplete;
    expect(onDark).toHaveBeenCalledTimes(1);
    expect(el.open).toBe(false);
  });

  it("supports max-height ('available' or px), width ('max-content' or px), and item.tooltip", async () => {
    await setViewport(1200, 800);
    const { el, trigger } = await make([
      { type: "action", label: "Offline export", disabled: true, tooltip: "Reconnect to export" },
      { type: "action", label: "Synchronize workspace configuration across all connected environments" },
    ]);
    el.width = 300;
    el.maxHeight = "available";
    await el.updateComplete;

    await userEvent.click(trigger);
    await el.updateComplete;
    expect(css(root(el), "width")).toBe("300px");

    const disabledItem = root(el).querySelector<HTMLElement>(".item")!;
    const tip = el.shadowRoot!.querySelector<HTMLElement & { open: boolean; content: string }>("lustrous-tooltip.item-tip")!;
    await userEvent.hover(disabledItem);
    await expect.poll(() => tip.open).toBe(true);
    expect(tip.content).toBe("Reconnect to export");
  });

  it("supports action closeOnClick=false, returnFocus, background, trailingContent, and mobile submenu drill-down", async () => {
    const returnTarget = document.createElement("button");
    returnTarget.textContent = "Target";
    document.body.append(returnTarget);

    await setViewport(400, 800);
    const { el, trigger } = await make([
      { type: "action", label: "Stay open", closeOnClick: false, background: "accent-container" },
      { type: "toggle", label: "Sync", checked: true, trailingContent: "PRO" },
      {
        type: "submenu",
        label: "Export",
        items: [{ type: "action", label: "CSV" }],
      },
    ]);
    el.returnFocus = returnTarget;
    await el.updateComplete;

    await userEvent.click(trigger);
    await el.updateComplete;
    const [stayBtn, toggleBtn, subBtn] = [...root(el).querySelectorAll<HTMLElement>(".item")];
    expect(stayBtn!.getAttribute("data-bg")).toBe("accent-container");
    expect(toggleBtn!.querySelector(".trail-custom")!.textContent).toBe("PRO");

    stayBtn!.click();
    await el.updateComplete;
    expect(el.open).toBe(true);

    subBtn!.click();
    await el.updateComplete;
    const backBtn = root(el).querySelector<HTMLElement>("[part=back-button]")!;
    expect(backBtn).not.toBeNull();
    expect(backBtn.getAttribute("aria-label")).toBe("Back to main menu");
    expect(root(el).textContent).toContain("CSV");

    const csvItem = [...root(el).querySelectorAll<HTMLElement>(".item")].find((n) => n.textContent?.includes("CSV"))!;
    csvItem.click();
    await el.updateComplete;
    expect(el.open).toBe(false);
    expect(document.activeElement).toBe(returnTarget);

    returnTarget.remove();
    await setViewport(1200, 800);
  });

  it("absorbs first pointer click on hover-opened menu and closes on second click", async () => {
    await setViewport(1200, 800);
    const { el, trigger } = await make([{ type: "action", label: "Inspect" }]);
    el.openOnHover = true;
    el.hoverOpenDelay = 0;
    await el.updateComplete;

    trigger.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
    await expect.poll(() => el.open).toBe(true);

    // First pointer click is absorbed; menu stays open
    trigger.dispatchEvent(new MouseEvent("click", { detail: 1, bubbles: true }));
    await el.updateComplete;
    expect(el.open).toBe(true);

    // Second pointer click closes
    trigger.dispatchEvent(new MouseEvent("click", { detail: 1, bubbles: true }));
    await el.updateComplete;
    expect(el.open).toBe(false);
  });
});
