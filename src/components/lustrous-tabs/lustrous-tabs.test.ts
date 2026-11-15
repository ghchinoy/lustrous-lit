import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { css, fixture } from "../../test/fixture.js";
import "./lustrous-tabs.js";
import type { LustrousTabs } from "./lustrous-tabs.js";

async function make(panels = true) {
  const el = await fixture<LustrousTabs>(
    `<lustrous-tabs label="Sections">${panels ? `<p slot="general">General panel</p><p slot="privacy">Privacy panel</p><p slot="billing">Billing panel</p>` : ""}</lustrous-tabs>`,
  );
  el.tabs = [
    { value: "general", label: "General" },
    { value: "privacy", label: "Privacy", disabled: true },
    { value: "billing", label: "Billing" },
  ];
  await el.updateComplete;
  return el;
}

const tabs = (el: LustrousTabs) => [...el.shadowRoot!.querySelectorAll<HTMLButtonElement>("[role=tab]")];
const panel = (el: LustrousTabs) => el.shadowRoot!.querySelector<HTMLElement>("[role=tabpanel]");

describe("lustrous-tabs", () => {
  it("renders a labelled tablist selecting the first enabled tab and linking its tabpanel", async () => {
    const el = await make();
    expect(el.shadowRoot!.querySelector("[role=tablist]")!.getAttribute("aria-label")).toBe("Sections");
    expect(tabs(el).map((t) => t.getAttribute("aria-selected"))).toEqual(["true", "false", "false"]);
    expect(tabs(el).map((t) => t.tabIndex)).toEqual([0, -1, -1]);
    expect(tabs(el)[1].getAttribute("aria-disabled")).toBe("true");
    const p = panel(el)!;
    expect(p.getAttribute("aria-labelledby")).toBe(tabs(el)[0].id);
    expect(p.querySelector("slot")!.assignedElements()[0].textContent).toBe("General panel");
    expect(css(tabs(el)[0], "height")).toBe("36px");
  });

  it("navigates with arrow/Home/End keys, focusing disabled tabs without selecting them, and emits lustrous-change", async () => {
    const el = await make();
    const onChange = vi.fn();
    el.addEventListener("lustrous-change", (e) => onChange(e.detail.value));
    tabs(el)[0].focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(el.shadowRoot!.activeElement).toBe(tabs(el)[1]);
    expect(onChange).not.toHaveBeenCalled();

    await userEvent.keyboard("{ArrowRight}");
    await el.updateComplete;
    expect(onChange).toHaveBeenCalledWith("billing");
    expect(el.value).toBe("billing");
    expect(panel(el)!.querySelector("slot")!.assignedElements()[0].textContent).toBe("Billing panel");

    await userEvent.keyboard("{Home}");
    await el.updateComplete;
    expect(el.value).toBe("general");
  });

  it("supports standalone tab bar mode without panels and underline variant", async () => {
    const el = await make(false);
    el.variant = "underline";
    await el.updateComplete;
    expect(panel(el)).toBeNull();
    expect(tabs(el)[0].hasAttribute("aria-controls")).toBe(false);
    expect(css(tabs(el)[0], "height")).toBe("40px");

    tabs(el)[2].click();
    await el.updateComplete;
    expect(el.value).toBe("billing");

    tabs(el)[1].click();
    await el.updateComplete;
    expect(el.value).toBe("billing");
  });
});
