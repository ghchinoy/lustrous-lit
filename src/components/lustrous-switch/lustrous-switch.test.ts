import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { css, fixture } from "../../test/fixture.js";
import type { LustrousSwitch } from "./lustrous-switch.js";
import "./lustrous-switch.js";

const track = (el: LustrousSwitch) => el.shadowRoot!.querySelector<HTMLButtonElement>("[part=track]")!;
const thumb = (el: LustrousSwitch) => el.shadowRoot!.querySelector<HTMLElement>("[part=thumb]")!;

describe("lustrous-switch", () => {
  it("renders a role=switch button with m (52x32) and s (32x20) dimensions and 44x44 touch target", async () => {
    const el = await fixture<LustrousSwitch>(`<lustrous-switch aria-label="Wi-Fi"></lustrous-switch>`);
    const t = track(el);
    expect(t.getAttribute("role")).toBe("switch");
    expect(t.getAttribute("aria-checked")).toBe("false");
    expect(t.getAttribute("aria-label")).toBe("Wi-Fi");
    expect(css(t, "width")).toBe("52px");
    expect(css(t, "height")).toBe("32px");
    expect(css(thumb(el), "width")).toBe("16px");

    const small = await fixture<LustrousSwitch>(`<lustrous-switch size="s" aria-label="Compact"></lustrous-switch>`);
    const st = track(small);
    expect(css(st, "width")).toBe("32px");
    expect(css(st, "height")).toBe("20px");
    const after = getComputedStyle(st, "::after");
    expect(after.minWidth).toBe("44px");
    expect(after.minHeight).toBe("44px");
  });

  it("toggles via click and keyboard Space, dispatching lustrous-change { checked }", async () => {
    const el = await fixture<LustrousSwitch>(`<lustrous-switch aria-label="Dark mode"></lustrous-switch>`);
    const onChange = vi.fn();
    el.addEventListener("lustrous-change", (e) => onChange(e.detail.checked));

    track(el).click();
    await el.updateComplete;
    expect(el.checked).toBe(true);
    expect(track(el).getAttribute("aria-checked")).toBe("true");
    expect(onChange).toHaveBeenLastCalledWith(true);
    await expect.poll(() => css(thumb(el), "width")).toBe("24px");

    el.focus();
    await userEvent.keyboard(" ");
    await el.updateComplete;
    expect(el.checked).toBe(false);
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it("links slotted label and supporting-text via aria-labelledby / aria-describedby and toggles from label", async () => {
    const el = await fixture<LustrousSwitch>(
      `<lustrous-switch supporting-text="Every Monday morning">Weekly digest</lustrous-switch>`,
    );
    const t = track(el);
    const labelId = t.getAttribute("aria-labelledby")!;
    const descId = t.getAttribute("aria-describedby")!;
    expect(el.shadowRoot!.getElementById(labelId)).toBeTruthy();
    expect(el.shadowRoot!.getElementById(descId)?.textContent).toBe("Every Monday morning");

    el.shadowRoot!.querySelector<HTMLElement>("[part=label]")!.click();
    await el.updateComplete;
    expect(el.checked).toBe(true);
  });

  it("renders icon and off-icon thumb glyphs at size m only", async () => {
    const m = await fixture<LustrousSwitch>(
      `<lustrous-switch icon="check" off-icon="close" aria-label="TLS"></lustrous-switch>`,
    );
    expect(thumb(m).querySelector("svg")).toBeTruthy();
    m.checked = true;
    await m.updateComplete;
    expect(thumb(m).querySelector("svg")).toBeTruthy();

    const s = await fixture<LustrousSwitch>(
      `<lustrous-switch size="s" icon="check" off-icon="close" aria-label="TLS small"></lustrous-switch>`,
    );
    expect(thumb(s).querySelector("svg")).toBeNull();
  });

  it("participates in FormData, respects disabled / fieldset disabled, and resets", async () => {
    const form = await fixture<HTMLFormElement>(
      `<form><fieldset><lustrous-switch name="alerts" value="enabled" checked aria-label="Alerts"></lustrous-switch></fieldset></form>`,
    );
    const el = form.querySelector<LustrousSwitch>("lustrous-switch")!;
    const fieldset = form.querySelector("fieldset")!;
    await el.updateComplete;
    expect(new FormData(form).get("alerts")).toBe("enabled");

    track(el).click();
    await el.updateComplete;
    expect(new FormData(form).get("alerts")).toBeNull();

    form.reset();
    await el.updateComplete;
    expect(el.checked).toBe(true);

    fieldset.disabled = true;
    await el.updateComplete;
    track(el).click();
    await el.updateComplete;
    expect(el.checked).toBe(true);
  });
});
