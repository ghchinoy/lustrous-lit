import { css, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { attrRules, gapRules, keywordRules, setHostVar, toCss } from "../../internal/style-gen.js";
import { breakpoints } from "../../theme/tokens.js";
import { LustrousBox, lustrousBoxStyles, type LustrousPaddingValue } from "../lustrous-box/lustrous-box.js";

const GRID_ALIGN = ["stretch", "start", "end", "center", "baseline", "flex-start", "flex-end"] as const;
export type LustrousGridAlign = (typeof GRID_ALIGN)[number];
export type LustrousGridJustify =
  | "stretch" | "start" | "end" | "center" | "space-between"
  | "space-around" | "space-evenly" | "flex-start" | "flex-end";
export type LustrousGridAutoFlow = "row" | "column" | "row dense" | "column dense" | "dense";

export function resolveTracks(v: number | string | undefined): string | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  if (typeof v === "number" || /^\d+$/.test(v)) return `repeat(${v}, minmax(0, 1fr))`;
  return v;
}

const gridRules = [
  css`
    :host {
      display: grid;
    }
    :host([inline]) {
      display: inline-grid;
    }
    :host([columns]) {
      grid-template-columns: var(--_lustrous-columns);
    }
    :host([rows]) {
      grid-template-rows: var(--_lustrous-rows);
    }
  `,
  toCss(
    keywordRules("align", "align-items", GRID_ALIGN),
    keywordRules("justify", "justify-content", [
      "stretch", "start", "end", "center", "space-between", "space-around", "space-evenly", "flex-start", "flex-end",
    ]),
    keywordRules("auto-flow", "grid-auto-flow", ["row", "column", "row dense", "column dense", "dense"]),
    gapRules(),
    `@media ${breakpoints.mobile} { :host([mobile-columns]) { grid-template-columns: var(--_lustrous-mobile-columns); } ${attrRules(
      "mobile-align",
      Object.fromEntries(GRID_ALIGN.map((a) => [a, `align-items: ${a};`])),
    )} }`,
  ),
];

/**
 * `<lustrous-grid>` — 2-D CSS Grid container built on `<lustrous-box>`.
 *
 * @slot - Grid children (`<lustrous-grid-item>` for spans).
 */
@customElement("lustrous-grid")
export class LustrousGrid extends LustrousBox {
  static override styles = [...lustrousBoxStyles, ...gridRules];

  @property({ reflect: true }) columns?: number | string;
  @property({ reflect: true, attribute: "mobile-columns" }) mobileColumns?: number | string;
  @property({ reflect: true }) rows?: number | string;
  @property({ reflect: true }) gap?: LustrousPaddingValue;
  @property({ reflect: true, attribute: "mobile-gap" }) mobileGap?: LustrousPaddingValue;
  @property({ reflect: true, attribute: "row-gap" }) rowGap?: LustrousPaddingValue;
  @property({ reflect: true, attribute: "column-gap" }) columnGap?: LustrousPaddingValue;
  @property({ reflect: true }) align?: LustrousGridAlign;
  @property({ reflect: true, attribute: "mobile-align" }) mobileAlign?: LustrousGridAlign;
  @property({ reflect: true }) justify?: LustrousGridJustify;
  @property({ reflect: true, attribute: "auto-flow" }) autoFlow?: LustrousGridAutoFlow;
  @property({ type: Boolean, reflect: true }) inline = false;

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (changed.has("columns")) setHostVar(this, "--_lustrous-columns", resolveTracks(this.columns));
    if (changed.has("mobileColumns")) setHostVar(this, "--_lustrous-mobile-columns", resolveTracks(this.mobileColumns));
    if (changed.has("rows")) setHostVar(this, "--_lustrous-rows", resolveTracks(this.rows));
  }
}

const span = (v: number | string | undefined): string | undefined => {
  if (v === undefined || v === null || v === "") return undefined;
  return v === "full" ? "1 / -1" : `span ${v}`;
};

const gridItemRules = css`
  :host([col-span]),
  :host([col]) {
    grid-column: var(--_lustrous-col);
  }
  :host([row-span]),
  :host([row]) {
    grid-row: var(--_lustrous-row);
  }
`;

/**
 * `<lustrous-grid-item>` — Grid child with `col-span`, `row-span`, `col`, and `row` placement controls.
 *
 * @slot - Item content.
 */
@customElement("lustrous-grid-item")
export class LustrousGridItem extends LustrousBox {
  static override styles = [...lustrousBoxStyles, gridItemRules];

  @property({ reflect: true, attribute: "col-span" }) colSpan?: number | "full";
  @property({ reflect: true, attribute: "row-span" }) rowSpan?: number | "full";
  @property({ reflect: true }) col?: string;
  @property({ reflect: true }) row?: string;

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (changed.has("colSpan") || changed.has("col")) setHostVar(this, "--_lustrous-col", this.col || span(this.colSpan));
    if (changed.has("rowSpan") || changed.has("row")) setHostVar(this, "--_lustrous-row", this.row || span(this.rowSpan));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-grid": LustrousGrid;
    "lustrous-grid-item": LustrousGridItem;
  }
}
