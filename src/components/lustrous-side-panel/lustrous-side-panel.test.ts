import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { css, fixture } from "../../test/fixture.js";
import "../lustrous-icon-button/lustrous-icon-button.js";
import "../lustrous-modal/lustrous-modal.js";
import type { LustrousSidePanel } from "./lustrous-side-panel.js";
import "./lustrous-side-panel.js";

const aside = (el: LustrousSidePanel) => el.shadowRoot!.querySelector<HTMLElement>("aside");
const card = (el: LustrousSidePanel) => el.shadowRoot!.querySelector<HTMLElement>("[part=card]")!;
const status = (el: LustrousSidePanel) => el.shadowRoot!.querySelector<HTMLElement>("[role=status]")!;

async function layout(attrs = "") {
  const wrap = await fixture<HTMLElement>(`<div style="height: 400px; display: grid; grid-template-columns: 1fr 320px">
    <main><button id="opener">Open</button><input id="composer" aria-label="Composer" /></main>
    <lustrous-side-panel label="Inspector" ${attrs}>
      <div slot="header"><h2>Inspector</h2><button id="close">Close</button></div>
      <p>Body</p>
    </lustrous-side-panel>
  </div>`);
  const el = wrap.querySelector<LustrousSidePanel>("lustrous-side-panel")!;
  el.addEventListener("lustrous-close-request", (e) => {
    if (e.target === el) el.open = false;
  });
  await el.updateComplete;
  return {
    el,
    wrap,
    opener: wrap.querySelector<HTMLButtonElement>("#opener")!,
    composer: wrap.querySelector<HTMLInputElement>("#composer")!,
  };
}

describe("lustrous-side-panel", () => {
  it("stays hidden when closed and renders an aside landmark card when open", async () => {
    const { el } = await layout();
    expect(css(el, "display")).toBe("none");
    expect(aside(el)).toBeNull();

    el.open = true;
    await el.updateComplete;
    expect(aside(el)!.getAttribute("aria-label")).toBe("Inspector");
    expect(css(card(el), "border-top-left-radius")).toBe("28px");
    expect(css(card(el), "margin-top")).toBe("12px");
  });

  it("handles focus-on-open, Escape in split vs takeover, and polite announcements", async () => {
    const { el, opener, composer } = await layout(`focus-on-open`);
    opener.focus();
    el.open = true;
    await el.updateComplete;
    expect(el.shadowRoot!.activeElement).toBe(aside(el));
    expect(status(el).textContent).toBe("");

    await userEvent.keyboard("{Escape}");
    await el.updateComplete;
    expect(el.open).toBe(false);
    expect(document.activeElement).toBe(opener);

    // Split mode ignores Escape when focus is outside; takeover handles Escape from anywhere.
    const onClose = vi.fn();
    el.addEventListener("lustrous-close-request", onClose);
    el.focusOnOpen = false;
    el.announcement = "Inspector ready";
    composer.focus();
    el.open = true;
    await el.updateComplete;
    expect(status(el).textContent).toBe("Inspector ready");

    await userEvent.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();

    el.presentation = "takeover";
    await el.updateComplete;
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("yields Escape when hasOpenModalDialog() is true", async () => {
    const { el } = await layout(`open presentation="takeover"`);
    const modal = document.createElement("lustrous-modal") as HTMLElement & {
      open: boolean;
      updateComplete: Promise<unknown>;
    };
    modal.setAttribute("label", "Nested modal");
    modal.innerHTML = `<button>Inside modal</button>`;
    el.append(modal);
    modal.open = true;
    await modal.updateComplete;

    await userEvent.keyboard("{Escape}");
    await el.updateComplete;
    expect(modal.open).toBe(false);
    expect(el.open).toBe(true);
    modal.remove();
  });

  it("supports framing attributes (border, shadow, margin, scrollable, scrim)", async () => {
    const { el } = await layout('open border="false" shadow="2" margin="l" scrim="none" scrollable="false"');
    expect(css(card(el), "border-top-width")).toBe("0px");
    expect(css(card(el), "box-shadow")).not.toBe("none");
    expect(css(card(el), "margin-top")).toBe("16px");
    expect(el.shadowRoot!.querySelector("lustrous-scrollable-box")).toBeNull();

    el.scrollable = true;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector("lustrous-scrollable-box")!.getAttribute("scrim")).toBe("none");
  });
});
