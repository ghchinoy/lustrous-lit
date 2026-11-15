import { css, html, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { expandInCss } from "../../internal/motion.js";
import {
  attrRules,
  keywordRules,
  radiusRules,
  resolveDimension,
  setHostVar,
  spacingRules,
  toCss,
  visibilityRules,
  zIndexRules,
} from "../../internal/style-gen.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { lustrousBase } from "../../theme/theme.js";
import { breakpoints, spacing, type LustrousRadiusToken, type LustrousSpacingToken, type LustrousZIndexToken } from "../../theme/tokens.js";

export type LustrousPaddingValue = LustrousSpacingToken | "none" | "0";
export type LustrousMarginValue = LustrousPaddingValue | `-${LustrousSpacingToken}` | "auto";
export type LustrousBackground =
  | "none"
  | "code"
  | "surface"
  | "surface-accent"
  | "surface-bright"
  | "surface-dim"
  | "surface-inverted"
  | "surface-container"
  | "surface-container-low"
  | "surface-container-high"
  | "surface-container-highest"
  | "primary-container"
  | "tertiary-container"
  | "error-container"
  | "positive-container"
  | "warning-container"
  | "accent-container"
  | "on-surface-low";
export type LustrousDisplay = "block" | "flex" | "inline-block" | "inline-flex" | "none" | "grid" | "inline-grid" | "inline";
export type LustrousDimension = "full" | "auto" | "fit-content" | "min-content" | "max-content" | "viewport" | (string & {}) | number;
export type LustrousMobileWidth = "full" | "auto" | "fit-content" | "min-content" | "max-content";
export type LustrousAnimateDirection =
  | "auto"
  | "center"
  | "top"
  | "bottom"
  | "start"
  | "end"
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end";
export type LustrousAnimatePreset =
  | "fade-through"
  | "fast-fade"
  | "fade"
  | "scale"
  | "shared-axis-x"
  | "shared-axis-y"
  | "fast-shared-axis-y"
  | "bottom-sheet"
  | "container-transform";
export type LustrousAnimateValue = LustrousAnimateDirection | LustrousAnimatePreset;
export type LustrousTransitionPreset =
  | "fade-through"
  | "fast-fade"
  | "fade"
  | "scale"
  | "lateral"
  | "shared-axis-x"
  | "shared-axis-y"
  | "fast-shared-axis-y"
  | "bottom"
  | "container-transform"
  | "fast-spatial"
  | "default-spatial"
  | "slow-spatial";
export type LustrousTransitionValue = LustrousTransitionPreset | boolean;
export type LustrousBreakpointValue = "mobile" | "desktop" | "shell-mobile" | "shell-desktop";

const surface = (bg: string, fg = "var(--lustrous-color-on-surface)", muted = "var(--lustrous-color-on-surface-variant)") =>
  `background-color: ${bg}; color: ${fg}; --lustrous-text-muted: ${muted};`;
const container = (name: string) =>
  surface(
    `var(--lustrous-color-${name}-container)`,
    `var(--lustrous-color-on-${name}-container)`,
    `var(--lustrous-color-on-${name}-container)`,
  );

const backgroundRules = attrRules("background", {
  none: "background-color: transparent;",
  code: surface(
    "var(--lustrous-color-code-background)",
    "var(--lustrous-color-code-primary-text)",
    "var(--lustrous-color-code-grey-text)",
  ),
  surface: surface("var(--lustrous-color-surface)"),
  "surface-accent": surface("var(--lustrous-color-surface-accent)"),
  "surface-bright": surface("var(--lustrous-color-surface-bright)"),
  "surface-dim": surface("var(--lustrous-color-surface-dim)"),
  "surface-inverted": surface(
    "var(--lustrous-color-on-surface)",
    "var(--lustrous-color-surface)",
    "color-mix(in srgb, var(--lustrous-color-surface) 74%, var(--lustrous-color-on-surface))",
  ),
  "surface-container": surface("var(--lustrous-color-surface-container)"),
  "surface-container-low": surface("var(--lustrous-color-surface-container-low)"),
  "surface-container-high": surface("var(--lustrous-color-surface-container-high)"),
  "surface-container-highest": surface("var(--lustrous-color-surface-container-highest)"),
  "primary-container": container("primary"),
  "tertiary-container": container("tertiary"),
  "error-container": container("error"),
  "positive-container": container("positive"),
  "warning-container": container("warning"),
  "accent-container": surface("var(--lustrous-color-accent-container)", "var(--lustrous-color-on-accent-container)"),
  "on-surface-low": surface("var(--lustrous-color-on-surface-low)"),
});

const BORDER = "1px solid var(--lustrous-color-outline-variant)";
const borderRules = `
:host([border]:not([border="false"])) { border: ${BORDER}; }
:host([border-block]) { border-block: ${BORDER}; }
:host([border-inline]) { border-inline: ${BORDER}; }
:host([border-top]) { border-top: ${BORDER}; }
:host([border-bottom]) { border-bottom: ${BORDER}; }
:host([border-start]) { border-inline-start: ${BORDER}; }
:host([border-end]) { border-inline-end: ${BORDER}; }
`;

const shadowRules = `
:host([shadow]:not([shadow="false"]):not([shadow="2"])) { box-shadow: var(--lustrous-elevation-level1); }
:host([shadow="2"]) { box-shadow: var(--lustrous-elevation-level2); }
`;

const OVERFLOW = ["auto", "clip", "hidden", "scroll", "visible"] as const;
const POSITION_ATTRS = new Set(["top", "bottom", "left", "right", "start", "end", "inset"]);
const SPACE_TOKENS = new Set(Object.keys(spacing));

function resolvePosition(value: string | number | undefined, axis: "x" | "y"): string | undefined {
  if (typeof value === "string") {
    if (value === "none") return "0";
    if (SPACE_TOKENS.has(value)) return `var(--lustrous-space-${value})`;
    if (value.startsWith("-") && SPACE_TOKENS.has(value.slice(1))) {
      return `calc(-1 * var(--lustrous-space-${value.slice(1)}))`;
    }
  }
  return resolveDimension(value, axis);
}

const FREE_VALUES = [
  ["width", "width", "x"],
  ["height", "height", "y"],
  ["min-width", "min-width", "x"],
  ["min-height", "min-height", "y"],
  ["max-width", "max-width", "x"],
  ["max-height", "max-height", "y"],
  ["top", "top", "y"],
  ["bottom", "bottom", "y"],
  ["left", "left", "x"],
  ["right", "right", "x"],
  ["start", "inset-inline-start", "x"],
  ["end", "inset-inline-end", "x"],
  ["inset", "inset", "x"],
] as const;

const DISPLAY = ["block", "flex", "inline-block", "inline-flex", "none", "grid", "inline-grid", "inline"] as const;
const MOBILE_WIDTH: Record<LustrousMobileWidth, string> = {
  full: "100%",
  auto: "auto",
  "fit-content": "fit-content",
  "min-content": "min-content",
  "max-content": "max-content",
};

const mobileBoxRules = `@media ${breakpoints.mobile} {
${keywordRules("mobile-display", "display", DISPLAY)}
${attrRules("mobile-width", Object.fromEntries(Object.entries(MOBILE_WIDTH).map(([k, v]) => [k, `width: ${v};`])))}
}`;

const ANIMATE_ORIGINS: Record<Exclude<LustrousAnimateDirection, "auto">, [ltr: string, rtl?: string]> = {
  center: ["center"],
  top: ["top center"],
  bottom: ["bottom center"],
  start: ["center left", "center right"],
  end: ["center right", "center left"],
  "top-start": ["top left", "top right"],
  "top-end": ["top right", "top left"],
  "bottom-start": ["bottom left", "bottom right"],
  "bottom-end": ["bottom right", "bottom left"],
};

const PRESET_ANIMATIONS = [
  "fade-through",
  "fast-fade",
  "fade",
  "scale",
  "shared-axis-x",
  "shared-axis-y",
  "fast-shared-axis-y",
  "bottom-sheet",
  "container-transform",
] as const;
const notPresets = PRESET_ANIMATIONS.map((p) => `:not([animate="${p}"])`).join("");

const animateRules = [
  expandInCss(`:host([animate]:not([animate="false"])${notPresets})`, null),
  ":host([animate]) { transform-origin: var(--_lustrous-transform-origin, center); }",
  ...Object.entries(ANIMATE_ORIGINS).map(
    ([k, [ltr, rtl]]) =>
      `:host([animate="${k}"]) { transform-origin: ${ltr}; }${rtl ? `\n:host([animate="${k}"]:dir(rtl)) { transform-origin: ${rtl}; }` : ""}`,
  ),
  `
@keyframes lustrous-anim-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes lustrous-anim-scale-in { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
@keyframes lustrous-anim-shared-axis-x-start { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
@keyframes lustrous-anim-shared-axis-x-end { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
@keyframes lustrous-anim-shared-axis-y { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes lustrous-anim-bottom-enter { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes lustrous-anim-container-transform { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }

:host([animate="fade-through"]) { animation: lustrous-anim-fade-in var(--lustrous-duration-short50) var(--lustrous-easing-linear) both; }
:host([animate="fast-fade"]) { animation: lustrous-anim-fade-in var(--lustrous-duration-short100) var(--lustrous-easing-linear) both; }
:host([animate="fade"]) { animation: lustrous-anim-fade-in var(--lustrous-duration-short150) var(--lustrous-easing-linear) both; }
:host([animate="scale"]) { animation: lustrous-anim-scale-in var(--lustrous-duration-short150) var(--lustrous-easing-standard) both; }
:host([animate="shared-axis-x"]) { animation: lustrous-anim-shared-axis-x-start var(--lustrous-duration-medium350) var(--lustrous-easing-standard) both; }
:host([animate="shared-axis-x"]:dir(rtl)) { animation-name: lustrous-anim-shared-axis-x-end; }
:host([animate="shared-axis-y"]) { animation: lustrous-anim-shared-axis-y var(--lustrous-duration-medium350) var(--lustrous-easing-standard) both; }
:host([animate="fast-shared-axis-y"]) { animation: lustrous-anim-shared-axis-y var(--lustrous-duration-short200) var(--lustrous-easing-standard) both; }
:host([animate="bottom-sheet"]) { animation: lustrous-anim-bottom-enter var(--lustrous-duration-long450) var(--lustrous-easing-emphasized) both; }
:host([animate="container-transform"]) { animation: lustrous-anim-container-transform var(--lustrous-duration-long450) var(--lustrous-easing-emphasized) both; }
  `,
].join("\n");

const PRESET_TRANSITIONS = [
  "fade-through", "fast-fade", "fade", "scale", "lateral", "shared-axis-x",
  "shared-axis-y", "fast-shared-axis-y", "bottom", "container-transform",
  "fast-spatial", "default-spatial", "slow-spatial",
] as const;
const notTransitionPresets = PRESET_TRANSITIONS.map((p) => `:not([transition="${p}"])`).join("");

const transitionRules = `
:host([transition]:not([transition="false"])${notTransitionPresets}) {
  transition-duration: var(--lustrous-duration-short150);
  transition-property: opacity, background-color, border-color, color, fill, stroke, box-shadow;
  transition-timing-function: var(--lustrous-easing-linear);
}
:host([transition="fade-through"]) { transition-duration: var(--lustrous-duration-short50); transition-property: opacity, background-color, border-color, color, box-shadow; transition-timing-function: var(--lustrous-easing-linear); }
:host([transition="fast-fade"]) { transition-duration: var(--lustrous-duration-short100); transition-property: opacity, background-color, border-color, color, box-shadow; transition-timing-function: var(--lustrous-easing-linear); }
:host([transition="fade"]) { transition-duration: var(--lustrous-duration-short150); transition-property: opacity, background-color, border-color, color, box-shadow; transition-timing-function: var(--lustrous-easing-linear); }
:host([transition="scale"]) { transition-duration: var(--lustrous-duration-short150); transition-property: transform, opacity, background-color, box-shadow; transition-timing-function: var(--lustrous-easing-standard); }
:host([transition="lateral"]) { transition-duration: var(--lustrous-duration-medium350); transition-property: transform, width, height, max-width, max-height, flex-grow, inset-inline-start, inset-inline-end, opacity, background-color; transition-timing-function: var(--lustrous-easing-standard); }
:host([transition="shared-axis-x"]), :host([transition="shared-axis-y"]) { transition-duration: var(--lustrous-duration-medium350); transition-property: transform, opacity; transition-timing-function: var(--lustrous-easing-standard); }
:host([transition="fast-shared-axis-y"]) { transition-duration: var(--lustrous-duration-short200); transition-property: transform, opacity; transition-timing-function: var(--lustrous-easing-standard); }
:host([transition="bottom"]) { transition-duration: var(--lustrous-duration-long450); transition-property: transform, opacity; transition-timing-function: var(--lustrous-easing-emphasized); }
:host([transition="container-transform"]) { transition-duration: var(--lustrous-duration-long450); transition-property: transform, width, height, border-radius, opacity, background-color, box-shadow; transition-timing-function: var(--lustrous-easing-emphasized); }
:host([transition="fast-spatial"]) { transition-duration: var(--lustrous-duration-medium350); transition-property: transform, width, height, opacity, background-color, border-color, box-shadow; transition-timing-function: var(--lustrous-easing-spring-standard); }
:host([transition="default-spatial"]) { transition-duration: var(--lustrous-duration-long500); transition-property: transform, width, height, opacity, background-color, border-color, box-shadow; transition-timing-function: var(--lustrous-easing-spring-standard); }
:host([transition="slow-spatial"]) { transition-duration: var(--lustrous-duration-extralong750); transition-property: transform, width, height, opacity, background-color, border-color, box-shadow; transition-timing-function: var(--lustrous-easing-spring-standard); }
@media (prefers-reduced-motion: reduce) {
  :host([transition]) {
    transition-duration: var(--lustrous-duration-instant);
    transition-property: none;
  }
}
`;

const freeValueRules = FREE_VALUES.map(([attr, prop]) => `:host([${attr}]) { ${prop}: var(--_lustrous-${attr}); }`).join("\n");

/** Static styles shared by every box-based primitive (`lustrous-flex`, `lustrous-grid`, …). */
export const lustrousBoxStyles = [
  lustrousBase,
  css`
    :host {
      display: block;
      min-width: 0;
    }
    :host([align]:not([text-align])) {
      text-align: inherit;
    }
  `,
  toCss(
    keywordRules("display", "display", DISPLAY),
    keywordRules("position", "position", ["relative", "absolute", "fixed", "sticky", "static"]),
    spacingRules("padding"),
    spacingRules("margin"),
    backgroundRules,
    borderRules,
    radiusRules(),
    shadowRules,
    keywordRules("cursor", "cursor", ["default", "pointer", "not-allowed", "text", "move"]),
    keywordRules("overflow", "overflow", OVERFLOW),
    keywordRules("overflow-x", "overflow-x", OVERFLOW),
    keywordRules("overflow-y", "overflow-y", OVERFLOW),
    zIndexRules(),
    keywordRules("text-align", "text-align", ["start", "end", "center", "justify", "inherit"]),
    keywordRules("white-space", "white-space", ["normal", "nowrap", "pre", "pre-wrap", "pre-line"]),
    keywordRules("overflow-wrap", "overflow-wrap", ["normal", "break-word", "anywhere"]),
    freeValueRules,
    mobileBoxRules,
    visibilityRules(),
    animateRules,
    transitionRules,
  ),
];

/**
 * `<lustrous-box>` — Foundational layout and surface primitive.
 * Styles the host directly via static `:host([attr="value"])` rules with zero wrapper DOM.
 *
 * @slot - Box content.
 */
@customElement("lustrous-box")
export class LustrousBox extends LustrousElement {
  static override styles = lustrousBoxStyles;

  @property({ reflect: true }) padding?: LustrousPaddingValue;
  @property({ reflect: true, attribute: "padding-block" }) paddingBlock?: LustrousPaddingValue;
  @property({ reflect: true, attribute: "padding-inline" }) paddingInline?: LustrousPaddingValue;
  @property({ reflect: true, attribute: "padding-top" }) paddingTop?: LustrousPaddingValue;
  @property({ reflect: true, attribute: "padding-bottom" }) paddingBottom?: LustrousPaddingValue;
  @property({ reflect: true, attribute: "padding-start" }) paddingStart?: LustrousPaddingValue;
  @property({ reflect: true, attribute: "padding-end" }) paddingEnd?: LustrousPaddingValue;
  @property({ reflect: true, attribute: "mobile-padding" }) mobilePadding?: LustrousPaddingValue;
  @property({ reflect: true, attribute: "mobile-padding-block" }) mobilePaddingBlock?: LustrousPaddingValue;
  @property({ reflect: true, attribute: "mobile-padding-inline" }) mobilePaddingInline?: LustrousPaddingValue;

  @property({ reflect: true }) margin?: LustrousMarginValue;
  @property({ reflect: true, attribute: "margin-block" }) marginBlock?: LustrousMarginValue;
  @property({ reflect: true, attribute: "margin-inline" }) marginInline?: LustrousMarginValue;
  @property({ reflect: true, attribute: "margin-top" }) marginTop?: LustrousMarginValue;
  @property({ reflect: true, attribute: "margin-bottom" }) marginBottom?: LustrousMarginValue;
  @property({ reflect: true, attribute: "margin-start" }) marginStart?: LustrousMarginValue;
  @property({ reflect: true, attribute: "margin-end" }) marginEnd?: LustrousMarginValue;

  @property({ reflect: true }) display?: LustrousDisplay;
  @property({ reflect: true, attribute: "mobile-display" }) mobileDisplay?: LustrousDisplay;
  @property({ reflect: true }) position?: "relative" | "absolute" | "fixed" | "sticky" | "static";
  @property({ reflect: true }) background?: LustrousBackground;

  @property({ type: Boolean, reflect: true }) border = false;
  @property({ type: Boolean, reflect: true, attribute: "border-block" }) borderBlock = false;
  @property({ type: Boolean, reflect: true, attribute: "border-inline" }) borderInline = false;
  @property({ type: Boolean, reflect: true, attribute: "border-top" }) borderTop = false;
  @property({ type: Boolean, reflect: true, attribute: "border-bottom" }) borderBottom = false;
  @property({ type: Boolean, reflect: true, attribute: "border-start" }) borderStart = false;
  @property({ type: Boolean, reflect: true, attribute: "border-end" }) borderEnd = false;
  @property({ reflect: true, attribute: "border-radius" }) borderRadius?: LustrousRadiusToken;
  @property({ reflect: true }) shadow?: "" | "1" | "2";
  @property({ reflect: true }) cursor?: "default" | "pointer" | "not-allowed" | "text" | "move";
  @property({ reflect: true }) overflow?: (typeof OVERFLOW)[number];
  @property({ reflect: true, attribute: "overflow-x" }) overflowX?: (typeof OVERFLOW)[number];
  @property({ reflect: true, attribute: "overflow-y" }) overflowY?: (typeof OVERFLOW)[number];
  @property({ reflect: true, attribute: "z-index" }) zIndex?: LustrousZIndexToken | "1";
  @property({ reflect: true, attribute: "text-align" }) textAlign?: "start" | "end" | "center" | "justify" | "inherit";
  @property({ reflect: true, attribute: "white-space" }) whiteSpace?: "normal" | "nowrap" | "pre" | "pre-wrap" | "pre-line";
  @property({ reflect: true, attribute: "overflow-wrap" }) overflowWrap?: "normal" | "break-word" | "anywhere";

  @property({ reflect: true }) width?: LustrousDimension;
  @property({ reflect: true, attribute: "mobile-width" }) mobileWidth?: LustrousMobileWidth;
  @property({ reflect: true }) height?: LustrousDimension;
  @property({ reflect: true, attribute: "min-width" }) minWidth?: LustrousDimension;
  @property({ reflect: true, attribute: "min-height" }) minHeight?: LustrousDimension;
  @property({ reflect: true, attribute: "max-width" }) maxWidth?: LustrousDimension;
  @property({ reflect: true, attribute: "max-height" }) maxHeight?: LustrousDimension;
  @property({ reflect: true }) top?: string | number;
  @property({ reflect: true }) bottom?: string | number;
  @property({ reflect: true }) left?: string | number;
  @property({ reflect: true }) right?: string | number;
  @property({ reflect: true }) start?: string | number;
  @property({ reflect: true }) end?: string | number;
  @property({ reflect: true }) inset?: string | number;

  @property({
    reflect: true,
    attribute: "animate",
    converter: {
      fromAttribute: (v: string | null) =>
        v === null || v === "false" ? undefined : v === "" || v === "true" ? "auto" : (v as LustrousAnimateValue),
      toAttribute: (v: unknown) =>
        v === undefined || v === null || v === false ? null : v === true || v === "auto" ? "" : String(v),
    },
  })
  animateFrom?: LustrousAnimateValue | boolean;

  @property({
    reflect: true,
    attribute: "transition",
    converter: {
      fromAttribute: (v: string | null) =>
        v === null || v === "false" ? undefined : v === "" || v === "true" ? true : (v as LustrousTransitionPreset),
      toAttribute: (v: unknown) =>
        v === undefined || v === null || v === false ? null : v === true ? "" : String(v),
    },
  })
  transition?: LustrousTransitionValue;

  @property({ reflect: true, attribute: "hidden-on" }) hiddenOn?: LustrousBreakpointValue;
  @property({ reflect: true, attribute: "shown-on" }) shownOn?: LustrousBreakpointValue;

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    for (const [attr, , axis] of FREE_VALUES) {
      const prop = attr.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()) as keyof this;
      if (changed.has(prop)) {
        const value = this[prop] as string | number | undefined;
        setHostVar(
          this,
          `--_lustrous-${attr}`,
          POSITION_ATTRS.has(attr) ? resolvePosition(value, axis) : resolveDimension(value, axis),
        );
      }
    }
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-box": LustrousBox;
  }
}
