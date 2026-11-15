import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { css, fixture } from "../../test/fixture.js";
import "../lustrous-icon-button/lustrous-icon-button.js";
import type { LustrousTextInput } from "./lustrous-text-input.js";
import "./lustrous-text-input.js";

const $ = (el: LustrousTextInput, selector: string) => el.shadowRoot!.querySelector<HTMLElement>(selector)!;
const input = (el: LustrousTextInput) => $(el, "input") as HTMLInputElement;
const field = (el: LustrousTextInput) => $(el, "[part=field]");
const tokenColor = async (expr: string) => css(await fixture<HTMLElement>(`<div style="color: ${expr}"></div>`), "color");

describe("lustrous-text-input", () => {
  it("renders a 44px m frame (36px at s), 10px default radius, outline resting border, and 2px primary focus border", async () => {
    const el = await fixture<LustrousTextInput>(`<lustrous-text-input label="Email"></lustrous-text-input>`);
    expect(css(field(el), "height")).toBe("44px");
    expect(css(field(el), "border-top-left-radius")).toBe("10px");
    expect(css(field(el), "border-top-color")).toBe(await tokenColor("var(--lustrous-color-outline)"));

    const label = $(el, "label") as HTMLLabelElement;
    expect(label.control).toBe(input(el));

    input(el).dispatchEvent(new FocusEvent("focus"));
    await el.updateComplete;
    const primary = await tokenColor("var(--lustrous-color-primary)");
    await expect.poll(() => css(field(el), "border-top-color")).toBe(primary);
    expect(css(field(el), "outline-width")).toBe("2px");
    expect(css(field(el), "outline-color")).toBe(primary);

    const small = await fixture<LustrousTextInput>(`<lustrous-text-input size="s" label="Compact"></lustrous-text-input>`);
    expect(css(field(small), "height")).toBe("36px");
  });

  it("hides header when unlabelled and forwards aria-label, caption, and border-radius", async () => {
    const unlabelled = await fixture<LustrousTextInput>(
      `<lustrous-text-input aria-label="Search" placeholder="Search…" border-radius="full"></lustrous-text-input>`,
    );
    expect($(unlabelled, "[part=header]").hidden).toBe(true);
    expect(input(unlabelled).getAttribute("aria-label")).toBe("Search");
    expect(css(field(unlabelled), "border-top-left-radius")).toBe("9999px");

    const slottedCaption = await fixture<LustrousTextInput>(
      `<lustrous-text-input label="API key"><span slot="caption">Optional</span></lustrous-text-input>`,
    );
    await slottedCaption.updateComplete;
    expect($(slottedCaption, "[part=caption]").hidden).toBe(false);
  });

  it("supports supporting-text, error alert, character-count, and validation-state with xs spinner", async () => {
    const el = await fixture<LustrousTextInput>(
      `<lustrous-text-input label="Bio" supporting-text="Public profile" character-count maxlength="12" value="hello"></lustrous-text-input>`,
    );
    expect($(el, ".message").textContent).toBe("Public profile");
    expect(input(el).getAttribute("aria-describedby")).toBe($(el, ".message").id);
    expect($(el, "[part=counter]").textContent).toBe("5/12");

    el.validationState = "validating";
    await el.updateComplete;
    expect(input(el).getAttribute("aria-busy")).toBe("true");
    const spinner = el.shadowRoot!.querySelector("lustrous-spinner");
    expect(spinner).toBeTruthy();
    expect(spinner!.getAttribute("size")).toBe("xs");

    el.validationState = "success";
    await el.updateComplete;
    expect(input(el).hasAttribute("aria-busy")).toBe(false);
    expect($(el, "[part=trailing]").classList.contains("success")).toBe(true);

    el.error = "Too short";
    await el.updateComplete;
    expect($(el, ".message").getAttribute("role")).toBe("alert");
    expect(input(el).getAttribute("aria-invalid")).toBe("true");
  });

  it("supports leading/trailing icons, slots, affixes, and overflow scrim fade", async () => {
    const el = await fixture<LustrousTextInput>(
      `<lustrous-text-input label="Budget" leading-icon="attachMoney" leading-text="$" trailing-text="USD"><lustrous-icon-button slot="trailing" icon="close" size="s" aria-label="Clear"></lustrous-icon-button></lustrous-text-input>`,
    );
    await el.updateComplete;
    expect($(el, "[part=leading]").hidden).toBe(false);
    expect($(el, ".affix.leading-text").textContent).toBe("$");
    expect($(el, ".affix.trailing-text").textContent).toBe("USD");
    expect($(el, ".trailing.action").hidden).toBe(false);

    const long = await fixture<LustrousTextInput>(
      `<lustrous-text-input aria-label="Long" style="width: 180px" value="${"overflowing segment ".repeat(6)}"></lustrous-text-input>`,
    );
    await long.updateComplete;
    await expect.poll(() => input(long).classList.contains("scrim-x-end")).toBe(true);
  });

  it("participates in FormData, constraint validation, formResetCallback, and formDisabledCallback", async () => {
    const form = await fixture<HTMLFormElement>(
      `<form><fieldset><lustrous-text-input name="email" type="email" label="Email" value="ada@example.com" required minlength="5"></lustrous-text-input></fieldset></form>`,
    );
    const el = form.querySelector<LustrousTextInput>("lustrous-text-input")!;
    const fieldset = form.querySelector("fieldset")!;
    await el.updateComplete;

    expect(new FormData(form).get("email")).toBe("ada@example.com");
    expect(form.checkValidity()).toBe(true);

    el.value = "bad";
    await el.updateComplete;
    expect(form.checkValidity()).toBe(false);
    expect(el.validity?.typeMismatch).toBe(true);

    el.value = "";
    await el.updateComplete;
    expect(el.validity?.valueMissing).toBe(true);

    form.reset();
    await el.updateComplete;
    expect(el.value).toBe("ada@example.com");

    el.focus();
    const onInput = vi.fn();
    el.addEventListener("input", onInput);
    await userEvent.keyboard("!");
    expect(onInput).toHaveBeenCalled();

    fieldset.disabled = true;
    await el.updateComplete;
    expect(input(el).disabled).toBe(true);
  });
});
