import { css, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { attrRules, gapRules, keywordRules, setHostVar, toCss } from "../../internal/style-gen.js";
import { breakpoints } from "../../theme/tokens.js";
import { LustrousBox, lustrousBoxStyles, type LustrousPaddingValue } from "../lustrous-box/lustrous-box.js";

export type LustrousFlexDirection = "row" | "column" | "row-reverse" | "column-reverse";
export type LustrousFlexAlign = "stretch" | "flex-start" | "center" | "flex-end" | "baseline";
export type LustrousFlexJustify = "flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "space-evenly";
export type LustrousFlexWrap = "nowrap" | "wrap" | "wrap-reverse";

const ALIGN = ["stretch", "flex-start", "center", "flex-end", "baseline"] as const;

const flexItemRules = toCss(
  `:host([grow]) { flex-grow: var(--_lustrous-grow); }
   :host([shrink]) { flex-shrink: var(--_lustrous-shrink); }
   :host([basis]) { flex-basis: var(--_lustrous-basis); }
   :host([order]) { order: var(--_lustrous-order); }`,
  keywordRules("align-self", "align-self", ALIGN),
);

const flexOrNum = (v: number | boolean | string | undefined, whenTrue: string): string | undefined => {
  if (v === undefined || v === null || v === false || v === "false") {
    return v === false || v === "false" ? "0" : undefined;
  }
  if (v === true || v === "" || v === "true") return whenTrue;
  return String(v);
};

/**
 * `<lustrous-flex-item>` — Box with flex-item placement/sizing controls (`grow`, `shrink`, `basis`, `align-self`, `order`).
 *
 * @slot - Item content.
 */
@customElement("lustrous-flex-item")
export class LustrousFlexItem extends LustrousBox {
  static override styles = [...lustrousBoxStyles, flexItemRules];

  @property({ reflect: true }) grow?: number | boolean | string;
  @property({ reflect: true }) shrink?: number | boolean | string;
  @property({ reflect: true }) basis?: string | number;
  @property({ reflect: true, attribute: "align-self" }) alignSelf?: LustrousFlexAlign;
  @property({ type: Number, reflect: true }) order?: number;

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (changed.has("grow")) setHostVar(this, "--_lustrous-grow", flexOrNum(this.grow, "1"));
    if (changed.has("shrink")) setHostVar(this, "--_lustrous-shrink", flexOrNum(this.shrink, "1"));
    if (changed.has("basis")) {
      const b = this.basis;
      setHostVar(this, "--_lustrous-basis", b === undefined ? undefined : typeof b === "number" || /^\d+$/.test(b) ? `${b}px` : b);
    }
    if (changed.has("order")) setHostVar(this, "--_lustrous-order", this.order === undefined ? undefined : String(this.order));
  }
}

const DIRECTIONS = ["row", "column", "row-reverse", "column-reverse"] as const;
const JUSTIFY = ["flex-start", "center", "flex-end", "space-between", "space-around", "space-evenly"] as const;

const flexRules = [
  css`
    :host {
      display: flex;
    }
    :host([inline]) {
      display: inline-flex;
    }
  `,
  toCss(
    keywordRules("direction", "flex-direction", DIRECTIONS),
    keywordRules("wrap", "flex-wrap", ["nowrap", "wrap", "wrap-reverse"]),
    keywordRules("align", "align-items", ALIGN),
    keywordRules("justify", "justify-content", JUSTIFY),
    gapRules(),
    `@media ${breakpoints.mobile} {\n${attrRules(
      "mobile-direction",
      Object.fromEntries(DIRECTIONS.map((d) => [d, `flex-direction: ${d};`])),
    )}\n${attrRules("mobile-align", Object.fromEntries(ALIGN.map((a) => [a, `align-items: ${a};`])))}\n${attrRules(
      "mobile-justify",
      Object.fromEntries(JUSTIFY.map((j) => [j, `justify-content: ${j};`])),
    )}\n}`,
  ),
];

/**
 * `<lustrous-flex>` — 1-D flexbox container accepting all `<lustrous-box>` and `<lustrous-flex-item>` attributes.
 *
 * @slot - Flex children.
 */
@customElement("lustrous-flex")
export class LustrousFlex extends LustrousFlexItem {
  static override styles = [...lustrousBoxStyles, flexItemRules, ...flexRules];

  @property({ reflect: true }) direction?: LustrousFlexDirection;
  @property({ reflect: true, attribute: "mobile-direction" }) mobileDirection?: LustrousFlexDirection;
  @property({ reflect: true }) align?: LustrousFlexAlign;
  @property({ reflect: true, attribute: "mobile-align" }) mobileAlign?: LustrousFlexAlign;
  @property({ reflect: true }) justify?: LustrousFlexJustify;
  @property({ reflect: true, attribute: "mobile-justify" }) mobileJustify?: LustrousFlexJustify;
  @property({ reflect: true }) wrap?: LustrousFlexWrap;
  @property({ reflect: true }) gap?: LustrousPaddingValue;
  @property({ reflect: true, attribute: "mobile-gap" }) mobileGap?: LustrousPaddingValue;
  @property({ reflect: true, attribute: "row-gap" }) rowGap?: LustrousPaddingValue;
  @property({ reflect: true, attribute: "column-gap" }) columnGap?: LustrousPaddingValue;
  @property({ type: Boolean, reflect: true }) inline = false;
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-flex": LustrousFlex;
    "lustrous-flex-item": LustrousFlexItem;
  }
}
