import { afterEach, describe, expect, it } from "vitest";
import { css, fixture, setViewport } from "../test/fixture.js";
import {
  darkColors,
  DEFAULT_LUSTROUS_LABELS,
  getLustrousLabels,
  installLustrousTheme,
  lightColors,
  readLustrousThemePreference,
  resolveLustrousTheme,
  setLustrousLabels,
  setLustrousTheme,
  type LustrousColorToken,
} from "./index.js";

function hexLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  const r = Number.parseInt(clean.slice(0, 2), 16) / 255;
  const g = Number.parseInt(clean.slice(2, 4), 16) / 255;
  const b = Number.parseInt(clean.slice(4, 6), 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(fg: string, bg: string): number {
  const l1 = hexLuminance(fg);
  const l2 = hexLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("Lustrous theme & tokens", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-theme");
    setLustrousLabels();
  });

  it("installs @layer lustrous tokens on document and switches light/dark via data-theme", async () => {
    installLustrousTheme();
    const el = await fixture<HTMLDivElement>(`<div>hello</div>`);
    setLustrousTheme("light");
    expect(css(el, "--lustrous-color-surface")).toBe("#ffffff");
    expect(css(el, "--lustrous-color-accent")).toBe("#1d4ed8");

    setLustrousTheme("dark");
    expect(css(el, "--lustrous-color-surface")).toBe("#111827");
    expect(css(el, "--lustrous-color-accent")).toBe("#60a5fa");
  });

  it("supports nested light-DOM theme islands and resolveLustrousTheme()", async () => {
    installLustrousTheme();
    setLustrousTheme("light");
    const island = await fixture<HTMLDivElement>(`<div data-theme="dark"><span id="child">inside</span></div>`);
    const child = island.querySelector("#child")!;
    expect(resolveLustrousTheme(child)).toBe("dark");
    expect(css(child, "--lustrous-color-surface")).toBe("#111827");
  });

  it("persists and reads theme preferences in localStorage", () => {
    const key = "lustrous-test-theme";
    localStorage.removeItem(key);
    expect(readLustrousThemePreference(key, "system")).toBe("system");
    setLustrousTheme("dark", { storageKey: key });
    expect(readLustrousThemePreference(key)).toBe("dark");
    localStorage.removeItem(key);
  });

  it("steps down display and headline typography classes at <=768px", async () => {
    installLustrousTheme();
    await setViewport(1200, 800);
    const el = await fixture<HTMLHeadingElement>(`<h1 class="lustrous-display-large">Title</h1>`);
    expect(css(el, "font-size")).toBe("44px");
    await setViewport(500, 800);
    await expect.poll(() => css(el, "font-size")).toBe("36px");
    await setViewport(1200, 800);
  });

  it("enforces WCAG AA >= 4.5:1 text contrast and >= 3:1 outline contrast across both themes", () => {
    const textPairs: Array<[LustrousColorToken, LustrousColorToken]> = [
      ["on-background", "background"],
      ["on-surface", "surface"],
      ["on-surface", "surface-container"],
      ["on-surface-variant", "surface"],
      ["on-surface-variant", "surface-container"],
      ["on-surface-variant", "surface-container-high"],
      ["primary", "surface"],
      ["on-primary", "primary"],
      ["on-primary-container", "primary-container"],
      ["on-accent", "accent"],
      ["on-accent-container", "accent-container"],
      ["tertiary", "surface"],
      ["on-tertiary-container", "tertiary-container"],
      ["positive", "surface"],
      ["on-positive-container", "positive-container"],
      ["warning", "surface"],
      ["on-warning-container", "warning-container"],
      ["error", "surface"],
      ["on-error-container", "error-container"],
      ["on-category-cobalt", "category-cobalt"],
      ["on-category-emerald", "category-emerald"],
      ["on-category-amber", "category-amber"],
      ["on-category-rose", "category-rose"],
      ["on-category-violet", "category-violet"],
      ["on-category-teal", "category-teal"],
    ];

    for (const [fgKey, bgKey] of textPairs) {
      const lFg = lightColors[fgKey];
      const lBg = lightColors[bgKey];
      expect(contrastRatio(lFg, lBg), `light ${fgKey} on ${bgKey}`).toBeGreaterThanOrEqual(4.5);

      const dFg = darkColors[fgKey] ?? lightColors[fgKey];
      const dBg = darkColors[bgKey] ?? lightColors[bgKey];
      expect(contrastRatio(dFg, dBg), `dark ${fgKey} on ${bgKey}`).toBeGreaterThanOrEqual(4.5);
    }

    // WCAG 1.4.11 non-text 3:1 contrast for control outlines
    expect(contrastRatio(lightColors.outline, lightColors.surface)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(darkColors.outline!, darkColors.surface!)).toBeGreaterThanOrEqual(3);
  });

  it("merges and resets localized default labels via setLustrousLabels()", () => {
    expect(getLustrousLabels()).toEqual(DEFAULT_LUSTROUS_LABELS);
    setLustrousLabels({ close: "Fermer" });
    expect(getLustrousLabels().close).toBe("Fermer");
    expect(getLustrousLabels().dismiss).toBe("Dismiss");
    setLustrousLabels();
    expect(getLustrousLabels()).toEqual(DEFAULT_LUSTROUS_LABELS);
  });
});
