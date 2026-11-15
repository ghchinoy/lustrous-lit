import { unsafeCSS, type CSSResult } from "lit";
import { breakpoints, radius, spacing, zIndex } from "../theme/tokens.js";

/**
 * Helpers that generate static `:host([attr="value"])` rules from token maps,
 * keeping layout primitives pure CSS (SSR-friendly, inspectable, and overridable
 * by consumer CSS targeting the element).
 */

type Decls = string;

export function attrRules(attr: string, values: Record<string, Decls>, descendant = ""): string {
  return Object.entries(values)
    .map(([value, decls]) => `:host([${attr}="${value}"])${descendant ? ` ${descendant}` : ""} { ${decls} }`)
    .join("\n");
}

export function toCss(...chunks: string[]): CSSResult {
  return unsafeCSS(chunks.join("\n"));
}

const spaceTokens = Object.keys(spacing);

/** Values accepted by padding attributes: tokens, `none`, `0`. */
export function paddingValues(): Record<string, string> {
  const out: Record<string, string> = { none: "0px", "0": "0px" };
  for (const t of spaceTokens) out[t] = `var(--lustrous-space-${t})`;
  return out;
}

/** Values accepted by margin attributes: tokens, negative tokens, `none`, `0`, `auto`. */
export function marginValues(): Record<string, string> {
  const out: Record<string, string> = { ...paddingValues(), auto: "auto" };
  for (const t of spaceTokens) out[`-${t}`] = `calc(-1 * var(--lustrous-space-${t}))`;
  return out;
}

const SIDES: Array<[suffix: string, props: (base: string) => string[]]> = [
  ["", (b) => [b]],
  ["-block", (b) => [`${b}-block`]],
  ["-inline", (b) => [`${b}-inline`]],
  ["-top", (b) => [`${b}-top`]],
  ["-bottom", (b) => [`${b}-bottom`]],
  ["-start", (b) => [`${b}-inline-start`]],
  ["-end", (b) => [`${b}-inline-end`]],
];

const MOBILE_PADDING_SIDES = new Set(["", "-block", "-inline"]);

/**
 * Generates `padding` / `margin` and directional rules, plus `mobile-padding`,
 * `mobile-padding-block`, and `mobile-padding-inline` at ≤768px.
 */
export function spacingRules(base: "padding" | "margin", descendant = ""): string {
  const values = base === "padding" ? paddingValues() : marginValues();
  return SIDES.map(([suffix, props]) => {
    const decls = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, props(base).map((p) => `${p}: ${v};`).join(" ")]),
    );
    const rules = attrRules(`${base}${suffix}`, decls, descendant);
    if (base !== "padding" || !MOBILE_PADDING_SIDES.has(suffix)) return rules;
    return `${rules}\n@media ${breakpoints.mobile} {\n${attrRules(`mobile-${base}${suffix}`, decls, descendant)}\n}`;
  }).join("\n");
}

/** Generates `gap`, `mobile-gap` (≤768px), `row-gap`, and `column-gap`. */
export function gapRules(): string {
  const v = paddingValues();
  const map = (prop: string) => Object.fromEntries(Object.entries(v).map(([k, val]) => [k, `${prop}: ${val};`]));
  return [
    attrRules("gap", map("gap")),
    `@media ${breakpoints.mobile} {\n${attrRules("mobile-gap", map("gap"))}\n}`,
    attrRules("row-gap", map("row-gap")),
    attrRules("column-gap", map("column-gap")),
  ].join("\n");
}

export function radiusRules(): string {
  return attrRules(
    "border-radius",
    Object.fromEntries(Object.keys(radius).map((k) => [k, `border-radius: var(--lustrous-radius-${k});`])),
  );
}

export function zIndexRules(): string {
  return attrRules("z-index", {
    ...Object.fromEntries(Object.keys(zIndex).map((k) => [k, `z-index: var(--lustrous-z-${k});`])),
    "1": "z-index: 1;",
  });
}

export function keywordRules(attr: string, prop: string, keywords: readonly string[]): string {
  return attrRules(attr, Object.fromEntries(keywords.map((k) => [k, `${prop}: ${k};`])));
}

const BP_ATTR: Record<string, keyof typeof breakpoints> = {
  mobile: "mobile",
  desktop: "desktop",
  "shell-mobile": "shellMobile",
  "shell-desktop": "shellDesktop",
};

/** `hidden-on="mobile"` / `shown-on="mobile"` responsive visibility rules. */
export function visibilityRules(): string {
  return Object.entries(BP_ATTR)
    .map(([value, bp]) => {
      const q = breakpoints[bp];
      return `@media ${q} { :host([hidden-on="${value}"]) { display: none !important; } }
@media not all and ${q} { :host([shown-on="${value}"]) { display: none !important; } }`;
    })
    .join("\n");
}

/**
 * Resolves a dimension: numbers (or numeric strings) become `px`, `full` → `100%`,
 * `viewport` → `100vw` / `100vh`, and any other CSS length passes through.
 */
export function resolveDimension(value: string | number | undefined | null, axis: "x" | "y"): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "number" || /^-?\d+(\.\d+)?$/.test(value)) return `${value}px`;
  if (value === "full") return "100%";
  if (value === "viewport") return axis === "x" ? "100vw" : "100vh";
  return value;
}

/**
 * Sets or clears a private custom property on the host. No-op during SSR
 * (where `host.style` is unavailable); applies cleanly upon hydration.
 */
export function setHostVar(host: HTMLElement, name: string, value: string | undefined): void {
  if (!host.style) return;
  if (value === undefined) host.style.removeProperty(name);
  else host.style.setProperty(name, value);
}
