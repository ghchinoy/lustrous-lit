import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { css, fixture } from "../../test/fixture.js";
import type { LustrousRadio, LustrousRadioGroup } from "./lustrous-radio-group.js";
import "./lustrous-radio-group.js";

const radioBtn = (r: LustrousRadio) => r.shadowRoot!.querySelector<HTMLButtonElement>("[role=radio]")!;

describe("lustrous-radio-group", () => {
  it("renders role=radiogroup and role=radio buttons with 44px min-height, 20px ring, 10px dot, and roving tabindex", async () => {
    const group = await fixture<LustrousRadioGroup>(`
      <lustrous-radio-group label="Plan" value="pro">
        <lustrous-radio value="free" supporting-text="Up to 3 projects">Free</lustrous-radio>
        <lustrous-radio value="pro">Pro</lustrous-radio>
        <lustrous-radio value="enterprise" disabled>Enterprise</lustrous-radio>
      </lustrous-radio-group>
    `);
    const radios = [...group.querySelectorAll<LustrousRadio>("lustrous-radio")];
    for (const r of radios) await r.updateComplete;

    const rg = group.shadowRoot!.querySelector<HTMLElement>("[role=radiogroup]")!;
    const labelId = rg.getAttribute("aria-labelledby")!;
    expect(group.shadowRoot!.getElementById(labelId)?.textContent?.trim()).toBe("Plan");

    expect(css(radioBtn(radios[0]!), "min-height")).toBe("44px");
    expect(css(radios[0]!.shadowRoot!.querySelector("[part=ring]")!, "width")).toBe("20px");
    expect(css(radios[1]!.shadowRoot!.querySelector("[part=dot]")!, "width")).toBe("10px");
    expect(radioBtn(radios[0]!).getAttribute("aria-describedby")).toBeTruthy();

    // Roving tabindex: checked radio ("pro") has tabindex 0, others -1
    expect(radioBtn(radios[0]!).tabIndex).toBe(-1);
    expect(radioBtn(radios[1]!).tabIndex).toBe(0);
    expect(radioBtn(radios[1]!).getAttribute("aria-checked")).toBe("true");
    expect(radioBtn(radios[2]!).getAttribute("aria-disabled")).toBe("true");
  });

  it("navigates and selects via ArrowDown/ArrowRight/ArrowUp/ArrowLeft/Home/End, skipping disabled radios and firing lustrous-change", async () => {
    const group = await fixture<LustrousRadioGroup>(`
      <lustrous-radio-group label="Region">
        <lustrous-radio value="us">US</lustrous-radio>
        <lustrous-radio value="eu" disabled>EU</lustrous-radio>
        <lustrous-radio value="apac">APAC</lustrous-radio>
        <lustrous-radio value="latam">LATAM</lustrous-radio>
      </lustrous-radio-group>
    `);
    const radios = [...group.querySelectorAll<LustrousRadio>("lustrous-radio")];
    for (const r of radios) await r.updateComplete;

    const onChange = vi.fn();
    const onNativeChange = vi.fn();
    group.addEventListener("lustrous-change", (e) => onChange(e.detail.value));
    group.addEventListener("change", onNativeChange);

    // First enabled radio has tabindex 0 when unset
    expect(radioBtn(radios[0]!).tabIndex).toBe(0);

    radios[0]!.click();
    await group.updateComplete;
    expect(group.value).toBe("us");
    expect(onChange).toHaveBeenLastCalledWith("us");
    expect(onNativeChange).toHaveBeenCalledTimes(1);

    // ArrowDown skips disabled "eu" and selects "apac"
    radios[0]!.focus();
    await userEvent.keyboard("{ArrowDown}");
    await group.updateComplete;
    expect(group.value).toBe("apac");
    expect(onChange).toHaveBeenLastCalledWith("apac");

    // End selects "latam", Home selects "us"
    await userEvent.keyboard("{End}");
    await group.updateComplete;
    expect(group.value).toBe("latam");

    await userEvent.keyboard("{Home}");
    await group.updateComplete;
    expect(group.value).toBe("us");
  });

  it("syncs FormData, required valueMissing validity, formResetCallback, and formDisabledCallback", async () => {
    const form = await fixture<HTMLFormElement>(`
      <form>
        <fieldset>
          <lustrous-radio-group name="cadence" label="Cadence" value="monthly" required>
            <lustrous-radio value="monthly">Monthly</lustrous-radio>
            <lustrous-radio value="annual">Annual</lustrous-radio>
          </lustrous-radio-group>
        </fieldset>
      </form>
    `);
    const group = form.querySelector<LustrousRadioGroup>("lustrous-radio-group")!;
    const radios = [...group.querySelectorAll<LustrousRadio>("lustrous-radio")];
    const fieldset = form.querySelector("fieldset")!;
    await group.updateComplete;

    expect(new FormData(form).get("cadence")).toBe("monthly");
    expect(form.checkValidity()).toBe(true);

    group.value = "";
    await group.updateComplete;
    expect(new FormData(form).get("cadence")).toBeNull();
    expect(form.checkValidity()).toBe(false);
    expect(group.validity?.valueMissing).toBe(true);

    radioBtn(radios[1]!).click();
    await group.updateComplete;
    expect(group.value).toBe("annual");
    expect(new FormData(form).get("cadence")).toBe("annual");

    form.reset();
    await group.updateComplete;
    expect(group.value).toBe("monthly");
    expect(radios[0]!.checked).toBe(true);
    expect(radios[1]!.checked).toBe(false);

    fieldset.disabled = true;
    await group.updateComplete;
    for (const r of radios) await r.updateComplete;
    expect(radioBtn(radios[0]!).disabled).toBe(true);
  });
});
