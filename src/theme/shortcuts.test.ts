import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { afterEach, describe, expect, it } from "vitest";
import { fixture } from "../test/fixture.js";
import {
  formatShortcut,
  getAriaKeyShortcuts,
  getShortcutKeyLabels,
  LustrousShortcutController,
  LustrousShortcutScopeController,
  matchesShortcut,
  resetKeyboardShortcutsForTesting,
} from "./shortcuts.js";

@customElement("test-shortcut-host")
class TestShortcutHost extends LitElement {
  count = 0;
  readonly shortcut = new LustrousShortcutController(this, {
    id: "save",
    keys: "Mod+S",
    onTrigger: () => {
      this.count += 1;
    },
  });
  override render() {
    return html`<slot></slot>`;
  }
}

@customElement("test-scope-overlay")
class TestScopeOverlay extends LitElement {
  readonly scope = new LustrousShortcutScopeController(this, { active: true });
  override render() {
    return html`<slot></slot>`;
  }
}

describe("Lustrous keyboard shortcuts", () => {
  afterEach(() => {
    resetKeyboardShortcutsForTesting();
  });

  it("formats platform key labels and W3C aria-keyshortcuts", () => {
    expect(getShortcutKeyLabels("Mod+Shift+K", true)).toEqual(["⇧", "⌘", "K"]);
    expect(getShortcutKeyLabels("Mod+Shift+K", false)).toEqual(["Ctrl", "Shift", "K"]);
    expect(formatShortcut("Mod+K", true)).toBe("⌘K");
    expect(formatShortcut("Mod+K", false)).toBe("Ctrl+K");
    expect(getAriaKeyShortcuts("Mod+K", false)).toBe("Control+K");
  });

  it("matches chords and pauses root shortcuts while an overlay scope is active", async () => {
    const ev = new KeyboardEvent("keydown", { key: "s", metaKey: true, bubbles: true, cancelable: true });
    expect(matchesShortcut(ev, "Mod+S", true)).toBe(true);

    const host = await fixture<TestShortcutHost>(`<test-shortcut-host></test-shortcut-host>`);
    const isMac = /mac/iu.test(navigator.userAgent);
    const fire = () =>
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "s",
          metaKey: isMac,
          ctrlKey: !isMac,
          bubbles: true,
          cancelable: true,
        }),
      );

    fire();
    expect(host.count).toBe(1);

    const overlay = await fixture<TestScopeOverlay>(`<test-scope-overlay></test-scope-overlay>`);
    fire();
    expect(host.count).toBe(1);

    overlay.scope.setActive(false);
    fire();
    expect(host.count).toBe(2);
  });
});
