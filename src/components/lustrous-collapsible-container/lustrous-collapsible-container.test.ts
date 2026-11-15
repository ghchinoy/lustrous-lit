import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { fixture } from "../../test/fixture.js";
import "../lustrous-button/lustrous-button.js";
import "./lustrous-collapsible-container.js";
import type {
  LustrousCollapsibleContainer,
  LustrousCollapsibleToggleEvent,
} from "./lustrous-collapsible-container.js";

const content = (el: LustrousCollapsibleContainer) => el.shadowRoot!.querySelector<HTMLElement>("[part=content]")!;

describe("lustrous-collapsible-container", () => {
  it("toggles from a native trigger button, wiring aria-expanded and an inert zero-height body", async () => {
    const el = await fixture<LustrousCollapsibleContainer>(`
      <lustrous-collapsible-container>
        <button slot="trigger">Details</button>
        <p style="margin: 0; padding: 8px 0">Body <a href="#">link</a></p>
      </lustrous-collapsible-container>
    `);
    await el.updateComplete;
    const btn = el.querySelector("button")!;
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    expect(content(el).inert).toBe(true);
    expect(content(el).getAttribute("aria-hidden")).toBe("true");
    expect(content(el).getBoundingClientRect().height).toBe(0);

    const detailSpy = vi.fn();
    el.addEventListener("lustrous-toggle", ((e: LustrousCollapsibleToggleEvent) => {
      detailSpy(e.detail);
    }) as EventListener);

    await userEvent.click(btn);
    await el.updateComplete;
    expect(el.expanded).toBe(true);
    expect(el.open).toBe(true);
    expect(detailSpy).toHaveBeenCalledWith({ open: true, expanded: true });
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    expect(content(el).inert).toBe(false);
    await expect.poll(() => content(el).getBoundingClientRect().height).toBeGreaterThan(20);
  });

  it("drives a lustrous-button expanded chevron, finds a nested trigger inside a header, and supports cancelable lustrous-toggle", async () => {
    const el = await fixture<LustrousCollapsibleContainer>(`
      <lustrous-collapsible-container expanded>
        <div slot="trigger">
          <h3><lustrous-button variant="on-surface">Diagnostics</lustrous-button></h3>
          <button id="other">Export</button>
        </div>
        <p>Body</p>
      </lustrous-collapsible-container>
    `);
    await el.updateComplete;
    const lb = el.querySelector<HTMLElement & { expanded?: boolean; updateComplete: Promise<boolean> }>(
      "lustrous-button",
    )!;
    await lb.updateComplete;
    expect(lb.expanded).toBe(true);
    expect(lb.shadowRoot!.querySelector("button")!.getAttribute("aria-expanded")).toBe("true");

    el.addEventListener("lustrous-toggle", (e) => e.preventDefault(), { once: true });
    lb.click();
    await el.updateComplete;
    expect(el.expanded).toBe(true);

    lb.click();
    await el.updateComplete;
    expect(el.expanded).toBe(false);
    expect(lb.expanded).toBe(false);

    // Sibling buttons inside the header do not toggle the container.
    el.querySelector<HTMLButtonElement>("#other")!.click();
    await el.updateComplete;
    expect(el.expanded).toBe(false);
  });

  it("supports the open property and attribute alias", async () => {
    const el = await fixture<LustrousCollapsibleContainer>(`
      <lustrous-collapsible-container open>
        <button slot="trigger">Summary</button>
        <p>Expanded via open attribute</p>
      </lustrous-collapsible-container>
    `);
    await el.updateComplete;
    expect(el.expanded).toBe(true);
    expect(el.open).toBe(true);

    el.open = false;
    await el.updateComplete;
    expect(el.expanded).toBe(false);
    expect(el.hasAttribute("expanded")).toBe(false);
  });

  it("clips only the block axis so inline bleed stays visible and inline-bleed widens .inner", async () => {
    const el = await fixture<LustrousCollapsibleContainer>(`
      <lustrous-collapsible-container expanded inline-bleed="l" style="width: 300px">
        <button slot="trigger">Code</button>
        <div id="bleed" style="margin-inline: -16px; height: 40px; background: black"></div>
      </lustrous-collapsible-container>
    `);
    await el.updateComplete;
    const inner = el.shadowRoot!.querySelector<HTMLElement>(".inner")!;
    const cs = getComputedStyle(inner);
    expect(cs.overflowX).toBe("visible");
    expect(cs.overflowY).toBe("clip");
    expect(cs.marginLeft).toBe("-16px");
    expect(cs.paddingLeft).toBe("16px");
    const bleed = el.querySelector<HTMLElement>("#bleed")!;
    expect(Math.round(bleed.getBoundingClientRect().width)).toBe(332);
  });
});
