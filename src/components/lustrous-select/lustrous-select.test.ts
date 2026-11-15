import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { css, fixture } from "../../test/fixture.js";
import type { LustrousSelect, LustrousSelectOption } from "./lustrous-select.js";
import "./lustrous-select.js";

const combobox = (el: LustrousSelect) => el.shadowRoot!.querySelector<HTMLButtonElement>("[role=combobox]")!;
const listbox = (el: LustrousSelect) => el.shadowRoot!.querySelector<HTMLElement>("[role=listbox]")!;
const options = (el: LustrousSelect) => [...el.shadowRoot!.querySelectorAll<HTMLElement>("[role=option]")];

const SAMPLE_OPTIONS: readonly LustrousSelectOption[] = [
  { value: "alpha", label: "Alpha", icon: "bolt", group: "Primary" },
  { value: "bravo", label: "Bravo", description: "Secondary tier", group: "Primary" },
  { value: "charlie", label: "Charlie", disabled: true, group: "Secondary" },
  { value: "delta", label: "Delta", group: "Secondary" },
];

describe("lustrous-select", () => {
  it("renders a 44px combobox frame (36px at s) with ARIA linkage and parses light-DOM <option> children", async () => {
    const el = await fixture<LustrousSelect>(`
      <lustrous-select label="Tier" style="width: 260px">
        <option value="free">Free</option>
        <option value="pro">Pro</option>
        <option value="team">Team</option>
      </lustrous-select>
    `);
    const btn = combobox(el);
    expect(css(btn, "height")).toBe("44px");
    expect(btn.getAttribute("aria-haspopup")).toBe("listbox");
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    expect(btn.getAttribute("aria-controls")).toBe(listbox(el).id);
    expect(options(el)).toHaveLength(3);

    const small = await fixture<LustrousSelect>(`<lustrous-select size="s" aria-label="Compact"></lustrous-select>`);
    expect(css(combobox(small), "height")).toBe("36px");
    expect(combobox(small).getAttribute("aria-label")).toBe("Compact");
  });

  it("opens in top layer matching trigger min-width, navigates via keyboard + typeahead, selects, and closes on Escape", async () => {
    const el = await fixture<LustrousSelect>(`<lustrous-select label="Cluster" style="width: 280px"></lustrous-select>`);
    el.options = SAMPLE_OPTIONS;
    await el.updateComplete;

    const onChange = vi.fn();
    const onNativeChange = vi.fn();
    const onInput = vi.fn();
    el.addEventListener("lustrous-change", (e) => onChange(e.detail.value));
    el.addEventListener("change", onNativeChange);
    el.addEventListener("input", onInput);

    // Open with click
    combobox(el).click();
    await el.updateComplete;
    expect(el.open).toBe(true);
    expect(combobox(el).getAttribute("aria-expanded")).toBe("true");
    expect(el.style.getPropertyValue("--_lustrous-select-min-width")).toBe("280px");

    // Escape closes and returns focus to combobox
    await userEvent.keyboard("{Escape}");
    await el.updateComplete;
    expect(el.open).toBe(false);
    expect(el.shadowRoot!.activeElement).toBe(combobox(el));

    // Reopen with ArrowDown, skip disabled "charlie" on navigation, test Home/End and typeahead
    await userEvent.keyboard("{ArrowDown}");
    await el.updateComplete;
    expect(el.open).toBe(true);

    // Typeahead "d" jumps to Delta
    await userEvent.keyboard("d");
    await el.updateComplete;
    await userEvent.keyboard("{Enter}");
    await el.updateComplete;

    expect(el.open).toBe(false);
    expect(el.value).toBe("delta");
    expect(onChange).toHaveBeenCalledWith("delta");
    expect(onNativeChange).toHaveBeenCalledTimes(1);
    expect(onInput).toHaveBeenCalledTimes(1);
    expect(el.shadowRoot!.activeElement).toBe(combobox(el));

    // Selected option shows check icon
    const deltaOpt = options(el)[3]!;
    expect(deltaOpt.getAttribute("aria-selected")).toBe("true");
    expect(deltaOpt.querySelector(".opt-check svg")).toBeTruthy();
  });

  it("participates in FormData, required validity, formResetCallback, and formDisabledCallback", async () => {
    const form = await fixture<HTMLFormElement>(`
      <form>
        <fieldset>
          <lustrous-select name="region" label="Region" required>
            <option value="us">US</option>
            <option value="eu">EU</option>
          </lustrous-select>
        </fieldset>
      </form>
    `);
    const el = form.querySelector<LustrousSelect>("lustrous-select")!;
    const fieldset = form.querySelector("fieldset")!;
    await el.updateComplete;

    expect(new FormData(form).get("region")).toBeNull();
    expect(form.checkValidity()).toBe(false);
    expect(el.validity?.valueMissing).toBe(true);

    el.open = true;
    await el.updateComplete;
    options(el)[1]!.click();
    await el.updateComplete;

    expect(el.value).toBe("eu");
    expect(new FormData(form).get("region")).toBe("eu");
    expect(form.checkValidity()).toBe(true);

    form.reset();
    await el.updateComplete;
    expect(el.value).toBe("");
    expect(form.checkValidity()).toBe(false);

    fieldset.disabled = true;
    await el.updateComplete;
    expect(combobox(el).disabled).toBe(true);
  });
});
