import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { css, fixture } from "../../test/fixture.js";
import type { LustrousTextArea } from "./lustrous-text-area.js";
import "./lustrous-text-area.js";

const ta = (el: LustrousTextArea) => el.shadowRoot!.querySelector("textarea")!;
const $ = (el: LustrousTextArea, selector: string) => el.shadowRoot!.querySelector<HTMLElement>(selector)!;

describe("lustrous-text-area", () => {
  it("renders a labelled textarea with 4 default rows (112px at size m) and 10px frame radius", async () => {
    const el = await fixture<LustrousTextArea>(`<lustrous-text-area label="Summary"></lustrous-text-area>`);
    expect(($(el, "label") as HTMLLabelElement).control).toBe(ta(el));
    expect(el.rows).toBe(4);
    expect(ta(el).style.height).toBe("112px");
    expect(css($(el, "[part=field]"), "border-top-left-radius")).toBe("10px");
  });

  it("auto-grows between min-rows and max-rows and scrolls beyond max-rows", async () => {
    const el = await fixture<LustrousTextArea>(
      `<lustrous-text-area label="Message" rows="4" min-rows="1" max-rows="3"></lustrous-text-area>`,
    );
    expect(ta(el).style.height).toBe("46px");

    el.focus();
    await userEvent.keyboard("1{Enter}2");
    await el.updateComplete;
    expect(ta(el).style.height).toBe("68px");

    await userEvent.keyboard("{Enter}3{Enter}4{Enter}5");
    await el.updateComplete;
    expect(ta(el).style.height).toBe("90px");
    expect(ta(el).style.overflowY).toBe("auto");

    ta(el).scrollTop = 0;
    ta(el).dispatchEvent(new Event("scroll"));
    await expect.poll(() => ta(el).classList.contains("scrim-y-end")).toBe(true);

    ta(el).scrollTop = 22;
    ta(el).dispatchEvent(new Event("scroll"));
    await expect.poll(() => ta(el).classList.contains("scrim-y-both")).toBe(true);

    ta(el).scrollTop = 1000;
    ta(el).dispatchEvent(new Event("scroll"));
    await expect.poll(() => ta(el).classList.contains("scrim-y-start")).toBe(true);
  });

  it("clears inline height and applies resize handle when auto-grow is false", async () => {
    const el = await fixture<LustrousTextArea>(
      `<lustrous-text-area label="Notes" rows="3" auto-grow="false" resize="vertical"></lustrous-text-area>`,
    );
    expect(el.autoGrow).toBe(false);
    expect(ta(el).style.height).toBe("");
    expect(css(ta(el), "resize")).toBe("vertical");
  });

  it("supports character-count, validation, FormData, and form reset", async () => {
    const form = await fixture<HTMLFormElement>(
      `<form><lustrous-text-area name="notes" label="Notes" value="Initial" character-count maxlength="50" required></lustrous-text-area></form>`,
    );
    const el = form.querySelector<LustrousTextArea>("lustrous-text-area")!;
    await el.updateComplete;

    expect($(el, "[part=counter]").textContent).toBe("7/50");
    expect(new FormData(form).get("notes")).toBe("Initial");

    el.value = "";
    await el.updateComplete;
    expect(form.checkValidity()).toBe(false);

    form.reset();
    await el.updateComplete;
    expect(el.value).toBe("Initial");
  });
});
