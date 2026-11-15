import { describe, expect, it, vi } from "vitest";
import { css, fixture } from "../../test/fixture.js";
import type { LustrousPressable } from "./lustrous-pressable.js";
import "./lustrous-pressable.js";

describe("lustrous-pressable", () => {
  it("renders an inner button with class 'inner state-layer focus-ring' and applies padding inside .inner", async () => {
    const el = await fixture<LustrousPressable>(
      `<lustrous-pressable padding="l" border-radius="m" aria-label="Select plan">Pro</lustrous-pressable>`,
    );
    const btn = el.shadowRoot!.querySelector<HTMLButtonElement>("button.inner")!;
    expect(btn).toBeTruthy();
    expect(btn.classList.contains("inner")).toBe(true);
    expect(btn.classList.contains("state-layer")).toBe(true);
    expect(btn.classList.contains("focus-ring")).toBe(true);
    expect(btn.getAttribute("aria-label")).toBe("Select plan");
    expect(css(el, "padding-top")).toBe("0px");
    expect(css(btn, "padding-top")).toBe("16px");
    expect(css(btn, "padding-left")).toBe("16px");
  });

  it("renders an anchor when href is set and forwards target, rel, and download", async () => {
    const el = await fixture<LustrousPressable>(
      `<lustrous-pressable href="/report.csv" target="_blank" download="report.csv">Export</lustrous-pressable>`,
    );
    const a = el.shadowRoot!.querySelector<HTMLAnchorElement>("a.inner")!;
    expect(a).toBeTruthy();
    expect(a.getAttribute("href")).toBe("/report.csv");
    expect(a.getAttribute("target")).toBe("_blank");
    expect(a.getAttribute("rel")).toBe("noopener noreferrer");
    expect(a.getAttribute("download")).toBe("report.csv");
  });

  it("supports selected, disabled, and focusable='false'", async () => {
    const el = await fixture<LustrousPressable>(
      `<lustrous-pressable selected focusable="false">Option A</lustrous-pressable>`,
    );
    const btn = el.shadowRoot!.querySelector<HTMLButtonElement>("button.inner")!;
    expect(el.hasAttribute("selected")).toBe(true);
    expect(el.focusable).toBe(false);
    expect(btn.classList.contains("focus-ring")).toBe(false);
    expect(btn.getAttribute("tabindex")).toBe("-1");

    const disabledLink = await fixture<LustrousPressable>(
      `<lustrous-pressable href="/secret" disabled>Locked</lustrous-pressable>`,
    );
    const onClick = vi.fn();
    disabledLink.addEventListener("click", onClick);
    const a = disabledLink.shadowRoot!.querySelector<HTMLAnchorElement>("a.inner")!;
    expect(a.hasAttribute("href")).toBe(false);
    expect(a.getAttribute("aria-disabled")).toBe("true");
    expect(a.getAttribute("role")).toBe("link");
    a.click();
    expect(onClick).not.toHaveBeenCalled();
  });
});
