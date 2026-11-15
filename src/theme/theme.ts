import { css, unsafeCSS, type CSSResult } from "lit";
import {
  breakpoints,
  darkColors,
  durations,
  easings,
  fonts,
  lightColors,
  mobileTypographySteps,
  motion,
  radius,
  spacing,
  typography,
  zIndex,
  type LustrousTextVariant,
  type TypographyVariantSpec,
} from "./tokens.js";

const colorDecls = (colors: Record<string, string | undefined>): string =>
  Object.entries(colors)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `--lustrous-color-${k}: ${v};`)
    .join("\n");

/**
 * Derived tokens that reference color tokens must be re-declared wherever colors
 * change, because CSS custom properties resolve `var()` on the declaring element.
 */
const derivedDecls = `
--lustrous-elevation-level1: 0 1px 2px 0 var(--lustrous-color-elevation1), 0 4px 12px -2px var(--lustrous-color-elevation1);
--lustrous-elevation-level2: 0 4px 8px -2px var(--lustrous-color-elevation1), 0 16px 32px -4px var(--lustrous-color-elevation2);
--lustrous-text-muted: var(--lustrous-color-on-surface-variant);
`;

const staticDecls = [
  ...Object.entries(spacing).map(([k, v]) => `--lustrous-space-${k}: ${v};`),
  ...Object.entries(radius).map(([k, v]) => `--lustrous-radius-${k}: ${v};`),
  ...Object.entries(zIndex).map(([k, v]) => `--lustrous-z-${k}: ${v};`),
  ...Object.entries(fonts).map(([k, v]) => `--lustrous-font-${k}: ${v};`),
  ...Object.entries(durations).map(([k, v]) => `--lustrous-duration-${k}: ${v};`),
  ...Object.entries(easings).map(([k, v]) => `--lustrous-easing-${k}: ${v};`),
  ...Object.entries(motion).map(([k, v]) => `--lustrous-motion-${k}: ${v};`),
].join("\n");

const lightDecls = `${colorDecls(lightColors)}\n${derivedDecls}\ncolor-scheme: light;`;
const darkDecls = `${colorDecls(darkColors)}\n${derivedDecls}\ncolor-scheme: dark;`;

const DARK = `[data-theme="dark"], [data-lustrous-theme="dark"]`;
const LIGHT = `[data-theme="light"], [data-lustrous-theme="light"]`;
const SYSTEM = `[data-theme="system"], [data-lustrous-theme="system"]`;

/** CSS declarations (no selector) for one typography variant. */
export function typographyDeclarations(variant: LustrousTextVariant): string {
  const t: TypographyVariantSpec = typography[variant];
  const parts = [
    `font-family: var(--lustrous-font-${t.family});`,
    `font-size: ${t.size};`,
    `line-height: ${t.lineHeight};`,
    `font-weight: ${t.weight ?? 400};`,
    `font-style: ${t.italic ? "italic" : "normal"};`,
    `font-variation-settings: ${t.axes ?? "normal"};`,
  ];
  if (t.letterSpacing) parts.push(`letter-spacing: ${t.letterSpacing};`);
  if (t.textTransform) parts.push(`text-transform: ${t.textTransform};`);
  return parts.join(" ");
}

/**
 * Typography declarations for use inside component styles:
 *
 * ```ts
 * static styles = css`.label { ${lustrousType("body-small-emphasized")} }`;
 * ```
 */
export function lustrousType(variant: LustrousTextVariant): CSSResult {
  return unsafeCSS(typographyDeclarations(variant));
}

const typographyClasses = [
  ...(Object.keys(typography) as LustrousTextVariant[]).map((v) => `.lustrous-${v} { ${typographyDeclarations(v)} }`),
  `@media ${breakpoints.mobile} {`,
  ...Object.entries(mobileTypographySteps).map(
    ([v, to]) => `.lustrous-${v} { ${typographyDeclarations(to as LustrousTextVariant)} }`,
  ),
  "}",
].join("\n");

/**
 * Complete document-level Lustrous theme stylesheet (raw CSS text).
 * Identical to `dist/lustrous-theme.css`.
 *
 * Wrapped in `@layer lustrous` so any unlayered consumer CSS wins without `!important`.
 */
export const lustrousThemeCssText = `@layer lustrous {
:root {
${lightDecls}
${staticDecls}
}
${LIGHT} {
${lightDecls}
}
${DARK} {
${darkDecls}
}
@media (prefers-color-scheme: dark) {
  ${SYSTEM} {
${darkDecls}
  }
}
.lustrous-root {
  background-color: var(--lustrous-color-background);
  color: var(--lustrous-color-on-background);
  font-family: var(--lustrous-font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
${typographyClasses}
}
`;

/** `lustrousThemeCssText` as a Lit `CSSResult`. Prefer `installLustrousTheme()` or `lustrous-theme.css`. */
export const lustrousTheme: CSSResult = unsafeCSS(lustrousThemeCssText);

/** Typography utility classes (`.lustrous-body-medium`, `.lustrous-headline-small`, …) for shadow roots. */
export const lustrousTypography: CSSResult = unsafeCSS(typographyClasses);

/** Dark-theme color declarations (no selector) for scoping dark mode inside a shadow root. */
export const lustrousDarkDeclarations: CSSResult = unsafeCSS(darkDecls);
/** Light-theme color declarations (no selector); see `lustrousDarkDeclarations`. */
export const lustrousLightDeclarations: CSSResult = unsafeCSS(lightDecls);

const installed = new WeakSet<Document | ShadowRoot>();

/**
 * Adopts the Lustrous theme stylesheet into `root` (default: `document`).
 * Idempotent. Every `lustrous-*` element calls this on connect for zero-config usage;
 * link `lustrous-theme.css` in `<head>` or call `installLustrousTheme()` at startup to avoid FOUC.
 */
export function installLustrousTheme(root: Document | ShadowRoot | undefined = globalThis.document): void {
  if (!root || installed.has(root)) return;
  installed.add(root);
  const sheet = lustrousTheme.styleSheet;
  if (sheet && "adoptedStyleSheets" in root) {
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
    return;
  }
  const doc = root instanceof Document ? root : root.ownerDocument;
  const style = doc.createElement("style");
  style.dataset.lustrousTheme = "";
  style.textContent = lustrousThemeCssText;
  (root instanceof Document ? root.head : root).append(style);
}

export type LustrousThemePreference = "light" | "dark" | "system";

export interface SetLustrousThemeOptions {
  /** Element that receives `data-theme` (default: `document.documentElement`). */
  root?: HTMLElement;
  /** When set, persists the preference to `localStorage` under this key. */
  storageKey?: string;
}

/**
 * Applies a theme preference on `root` (default `<html>`). Tokens and `color-scheme`
 * update purely via CSS, so no JS re-renders are required.
 */
export function setLustrousTheme(preference: LustrousThemePreference, options: SetLustrousThemeOptions = {}): void {
  const root = options.root ?? globalThis.document?.documentElement;
  if (!root) return;
  root.dataset.theme = preference;
  if (options.storageKey) {
    try {
      globalThis.localStorage?.setItem(options.storageKey, preference);
    } catch {
      /* storage may be unavailable in sandboxed iframes or privacy modes */
    }
  }
}

/** Reads a persisted theme preference (see `setLustrousTheme({ storageKey })`). */
export function readLustrousThemePreference(
  storageKey: string,
  fallback: LustrousThemePreference = "system",
): LustrousThemePreference {
  try {
    const v = globalThis.localStorage?.getItem(storageKey);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* ignore */
  }
  return fallback;
}

/** Resolves the effective `"light" | "dark"` theme for an element by walking up to the nearest `data-theme`. */
export function resolveLustrousTheme(el: Element | null = globalThis.document?.documentElement ?? null): "light" | "dark" {
  let node: Element | null = el;
  while (node) {
    const pref = node.getAttribute("data-theme") ?? node.getAttribute("data-lustrous-theme");
    if (pref === "light" || pref === "dark") return pref;
    if (pref === "system") break;
    node = node.parentElement ?? ((node.getRootNode() as ShadowRoot).host ?? null);
  }
  return globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Alignment and RTL mirroring styles for `renderIcon()` output (included automatically in `lustrousBase`). */
export const lustrousIconStyles = css`
  svg.lustrous-icon {
    display: inline-block;
    flex-shrink: 0;
    pointer-events: none;
    vertical-align: -0.16em;
  }
  svg.lustrous-icon-directional:dir(rtl) {
    transform: scaleX(-1);
  }
`;

/** Shared base styles included first in every `lustrous-*` component (`box-sizing`, `[hidden]`, reduced motion, icons). */
export const lustrousBase = css`
  :host {
    box-sizing: border-box;
  }
  :host([hidden]) {
    display: none !important;
  }
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
    }
  }
  ${lustrousIconStyles}
`;

/**
 * Interactive state layer: hover / focus-visible / active overlay drawn with
 * `--lustrous-color-state-*`. Doubled selector survives later single-class `all: unset` resets.
 */
export const lustrousStateLayer = css`
  .state-layer.state-layer {
    position: relative;
    isolation: isolate;
  }
  .state-layer::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    border-radius: inherit;
    background-color: var(--lustrous-color-state-hover);
    opacity: 0;
    pointer-events: none;
    transition: opacity 150ms ease-in-out;
  }
  .state-layer:hover::after {
    opacity: 1;
  }
  .state-layer:focus-visible:not(:hover)::after {
    background-color: var(--lustrous-color-state-focus);
    opacity: 1;
  }
  .state-layer:active::after {
    background-color: var(--lustrous-color-state-pressed);
    opacity: 1;
  }
  .state-layer:disabled::after,
  .state-layer[aria-disabled="true"]::after {
    opacity: 0;
  }
`;

/**
 * Lustrous focus ring: 2.5px `currentColor` ring offset 2px, shown only on `:focus-visible`,
 * using `Highlight` in `forced-colors: active`.
 */
export const lustrousFocusRing = css`
  .focus-ring {
    outline: none;
  }
  .focus-ring:focus-visible {
    outline: 2.5px solid currentColor;
    outline-offset: 2px;
  }
  @media (forced-colors: active) {
    .focus-ring:focus-visible {
      outline-color: Highlight;
    }
  }
`;
