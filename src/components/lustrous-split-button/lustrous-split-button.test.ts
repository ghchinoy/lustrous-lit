import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { css, fixture } from "../../test/fixture.js";
import type { LustrousMenu } from "../lustrous-menu/lustrous-menu.js";
import type { LustrousSplitButton, LustrousSplitButtonAction } from "./lustrous-split-button.js";
import "./lustrous-split-button.js";

const ACTIONS: readonly LustrousSplitButtonAction[] = [
  { id: "once", label: "Allow once" },
  { id: "always", label: "Always allow" },
  { id: "never", label: "Deny" },
];

const face = (el: LustrousSplitButton) => el.shadowRoot!.querySelector<HTMLButtonElement>("[part=face]")!;
const caret = (el: LustrousSplitButton) => el.shadowRoot!.querySelector<HTMLButtonElement>("[part=caret]")!;
const menuEl = (el: LustrousSplitButton) => el.shadowRoot!.querySelector<LustrousMenu>("lustrous-menu")!;

async function make(actions: readonly LustrousSplitButtonAction[] = ACTIONS, attrs = "") {
  const wrap = await fixture<HTMLElement>(`<div style="padding: 24px"><lustrous-split-button ${attrs}></lustrous-split-button></div>`);
  const el = wrap.querySelector<LustrousSplitButton>("lustrous-split-button")!;
  const onAction = vi.fn();
  el.actions = actions;
  el.onAction = onAction;
  await el.updateComplete;
  await menuEl(el).updateComplete;
  return { el, face: face(el), caret: caret(el), onAction };
}

describe("lustrous-split-button", () => {
  it("dispatches lustrous-action for actions[0] when clicking the face without opening the menu", async () => {
    const { el, face, onAction } = await make();
    const events: Array<{ action: LustrousSplitButtonAction; index: number }> = [];
    el.addEventListener("lustrous-action", (e) => events.push(e.detail));

    await userEvent.click(face);
    expect(onAction).toHaveBeenCalledWith(ACTIONS[0], 0);
    expect(events).toEqual([{ action: ACTIONS[0], index: 0 }]);
    expect(menuEl(el).open).toBe(false);
  });

  it("opens the caret menu anchored to the group and emits the chosen item", async () => {
    const { el, caret, onAction } = await make();
    await userEvent.click(caret);
    await menuEl(el).updateComplete;
    expect(menuEl(el).open).toBe(true);

    await userEvent.keyboard("{ArrowDown}{Enter}");
    await menuEl(el).updateComplete;
    expect(onAction).toHaveBeenCalledWith(ACTIONS[1], 1);
    expect(el.shadowRoot!.activeElement).toBe(caret);
  });

  it("supports m (44px), s (36px), xs (28px) sizes, outline/accent/tonal/bright variants, and caret-aria-label", async () => {
    const { el, face, caret } = await make(ACTIONS, 'variant="outline" size="m" caret-aria-label="Permission options"');
    expect(css(face, "height")).toBe("44px");
    expect(caret.getAttribute("aria-label")).toBe("Permission options");

    el.size = "s";
    await el.updateComplete;
    expect(css(face, "height")).toBe("36px");

    el.size = "xs";
    await el.updateComplete;
    expect(css(face, "height")).toBe("28px");
  });
});
