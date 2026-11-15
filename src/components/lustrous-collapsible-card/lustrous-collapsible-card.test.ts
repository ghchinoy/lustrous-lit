import { afterEach, describe, expect, it, vi } from "vitest";
import { fixture } from "../../test/fixture.js";
import "./lustrous-collapsible-card.js";
import type { LustrousCollapsibleCard } from "./lustrous-collapsible-card.js";

const q = (el: LustrousCollapsibleCard, selector: string) => el.shadowRoot!.querySelector<HTMLElement>(selector)!;

afterEach(() => {
  localStorage.removeItem("lustrous.card.open.test-card");
});

describe("lustrous-collapsible-card", () => {
  it("renders a heading containing a disclosure button, badge with badge-tone, icon, and sibling actions", async () => {
    const el = await fixture<LustrousCollapsibleCard>(
      `<lustrous-collapsible-card heading="Cluster settings" icon="settings" badge="3" badge-tone="emerald" heading-level="2"><p>Body</p><button slot="actions">Configure</button></lustrous-collapsible-card>`,
    );
    const heading = q(el, "[role=heading]");
    expect(heading.getAttribute("aria-level")).toBe("2");

    const toggle = q(el, "button.toggle");
    expect(heading.contains(toggle)).toBe(true);
    expect(toggle.textContent).toContain("Cluster settings");
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(toggle.querySelector("svg.lustrous-icon")).not.toBeNull();
    expect(toggle.querySelector(".lustrous-chevron.expanded")).not.toBeNull();

    const badge = q(el, "lustrous-badge");
    expect(badge.textContent).toBe("3");
    expect(badge.getAttribute("tone")).toBe("emerald");

    // Slotted actions remain outside the disclosure button.
    expect(toggle.querySelector("slot[name=actions]")).toBeNull();
    expect(el.hasAttribute("title")).toBe(false);
  });

  it("clamps heading-level to 2..6 and toggles open state while firing lustrous-toggle", async () => {
    const el = await fixture<LustrousCollapsibleCard>(
      `<lustrous-collapsible-card heading="Network" heading-level="9"><p>Body</p></lustrous-collapsible-card>`,
    );
    expect(q(el, "[role=heading]").getAttribute("aria-level")).toBe("6");

    const onToggle = vi.fn();
    el.addEventListener("lustrous-toggle", (e) => onToggle(e.detail.open));
    q(el, "button.toggle").click();
    await el.updateComplete;

    expect(el.open).toBe(false);
    expect(onToggle).toHaveBeenCalledWith(false);
    expect(q(el, "button.toggle").getAttribute("aria-expanded")).toBe("false");
    expect(q(el, "#body").hidden).toBe(true);
  });

  it("persists and restores open state with storage-key", async () => {
    localStorage.setItem("lustrous.card.open.test-card", "false");
    const el = await fixture<LustrousCollapsibleCard>(
      `<lustrous-collapsible-card heading="Security" storage-key="test-card"></lustrous-collapsible-card>`,
    );
    expect(el.open).toBe(false);

    el.toggle();
    await el.updateComplete;
    expect(el.open).toBe(true);
    expect(localStorage.getItem("lustrous.card.open.test-card")).toBe("true");
  });
});
