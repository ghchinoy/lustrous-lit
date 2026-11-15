import { svg } from "lit";
import { afterEach, describe, expect, it } from "vitest";
import { css, fixture } from "../../test/fixture.js";
import { clearCustomLustrousIcons, LUSTROUS_ICON_NAMES, LustrousIcon, registerLustrousIcons } from "./lustrous-icon.js";

describe("lustrous-icon", () => {
  afterEach(() => {
    clearCustomLustrousIcons();
  });

  it("renders decorative by default and role=img when labelled", async () => {
    const deco = await fixture<LustrousIcon>(`<lustrous-icon name="search" size="m"></lustrous-icon>`);
    const decoSvg = deco.shadowRoot!.querySelector("svg")!;
    expect(decoSvg.getAttribute("aria-hidden")).toBe("true");
    expect(decoSvg.getAttribute("width")).toBe("24");

    const named = await fixture<LustrousIcon>(`<lustrous-icon name="info" label="Information"></lustrous-icon>`);
    const namedSvg = named.shadowRoot!.querySelector("svg")!;
    expect(namedSvg.getAttribute("role")).toBe("img");
    expect(namedSvg.getAttribute("aria-label")).toBe("Information");
  });

  it("renders every core icon with non-empty SVG children", async () => {
    const el = await fixture<LustrousIcon>(`<lustrous-icon></lustrous-icon>`);
    for (const name of LUSTROUS_ICON_NAMES) {
      el.name = name;
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector("svg")!.children.length, name).toBeGreaterThan(0);
    }
  });

  it("supports runtime custom icons via registerLustrousIcons() including RTL mirroring", async () => {
    registerLustrousIcons({
      customArrow: {
        paths: svg`<path id="custom-p" d="M4 12h16" />`,
        directional: true,
      },
    });
    const wrap = await fixture<HTMLDivElement>(`<div dir="rtl"><lustrous-icon name="customArrow"></lustrous-icon></div>`);
    const icon = wrap.querySelector("lustrous-icon")!;
    await icon.updateComplete;
    const svgEl = icon.shadowRoot!.querySelector("svg")!;
    expect(svgEl.querySelector("#custom-p")).not.toBeNull();
    expect(svgEl.classList.contains("lustrous-icon-directional")).toBe(true);
    expect(css(svgEl, "transform")).not.toBe("none");
  });
});
