import { html, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { VISUALLY_HIDDEN } from "../../internal/a11y.js";
import { attrRules, keywordRules, spacingRules, toCss } from "../../internal/style-gen.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { lustrousBase, typographyDeclarations } from "../../theme/theme.js";
import { breakpoints, mobileTypographySteps, typography, type LustrousTextVariant } from "../../theme/tokens.js";
import type { LustrousMarginValue, LustrousPaddingValue } from "../lustrous-box/lustrous-box.js";

export type LustrousTextTone = "default" | "error" | "positive" | "warning" | "primary" | "tertiary";
export type LustrousTextWrap = "wrap" | "nowrap" | "pre-wrap" | "truncate";

const variantRules = attrRules(
  "variant",
  Object.fromEntries((Object.keys(typography) as LustrousTextVariant[]).map((v) => [v, typographyDeclarations(v)])),
);

const toneRules = attrRules("tone", {
  default: "color: inherit;",
  error: "color: var(--lustrous-color-error);",
  positive: "color: var(--lustrous-color-positive);",
  warning: "color: var(--lustrous-color-warning);",
  primary: "color: var(--lustrous-color-primary);",
  tertiary: "color: var(--lustrous-color-tertiary);",
});

/**
 * `<lustrous-text>` — Typography primitive. Inline by default; `block`, `heading="1"…"6"`,
 * `wrap="truncate"`, and `max-lines` render block-level.
 *
 * @slot - Text content.
 * @cssprop --lustrous-text-muted - Secondary text color (automatically adapted by `<lustrous-box background>`).
 */
@customElement("lustrous-text")
export class LustrousText extends LustrousElement {
  static override styles = [
    lustrousBase,
    toCss(
      `:host { display: inline; margin: 0; ${typographyDeclarations("body-medium")} }`,
      variantRules,
      toneRules,
      `:host([muted]) { color: var(--lustrous-text-muted); }`,
      `:host([block]), :host([heading]) { display: block; }`,
      attrRules("wrap", {
        wrap: "white-space: normal;",
        nowrap: "white-space: nowrap;",
        "pre-wrap": "white-space: pre-wrap;",
        truncate: "display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;",
      }),
      `:host([max-lines]) { display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; -webkit-line-clamp: var(--_lustrous-max-lines); line-clamp: var(--_lustrous-max-lines); }`,
      attrRules("max-lines", { "1": "--_lustrous-max-lines: 1;", "2": "--_lustrous-max-lines: 2;", "3": "--_lustrous-max-lines: 3;" }),
      keywordRules("text-align", "text-align", ["start", "end", "center", "justify"]),
      keywordRules("overflow-wrap", "overflow-wrap", ["normal", "break-word", "anywhere"]),
      spacingRules("padding"),
      spacingRules("margin"),
      `@media ${breakpoints.mobile} {\n${attrRules(
        "variant",
        Object.fromEntries(
          Object.entries(mobileTypographySteps).map(([v, to]) => [v, typographyDeclarations(to as LustrousTextVariant)]),
        ),
      )}\n${attrRules(
        "mobile-variant",
        Object.fromEntries((Object.keys(typography) as LustrousTextVariant[]).map((v) => [v, typographyDeclarations(v)])),
      )}\n}`,
      `:host([visually-hidden]) { ${VISUALLY_HIDDEN} }`,
    ),
  ];

  @property({ reflect: true }) variant: LustrousTextVariant = "body-medium";
  @property({ reflect: true, attribute: "mobile-variant" }) mobileVariant?: LustrousTextVariant;
  @property({ reflect: true }) tone?: LustrousTextTone;
  @property({ type: Boolean, reflect: true }) muted = false;
  @property({ reflect: true }) wrap?: LustrousTextWrap;
  @property({ type: Number, reflect: true, attribute: "max-lines" }) maxLines?: 1 | 2 | 3;
  @property({ reflect: true, attribute: "text-align" }) textAlign?: "start" | "end" | "center" | "justify";
  @property({ reflect: true, attribute: "overflow-wrap" }) overflowWrap?: "normal" | "break-word" | "anywhere";
  @property({ type: Boolean, reflect: true }) block = false;
  @property({ type: Boolean, reflect: true, attribute: "visually-hidden" }) visuallyHidden = false;
  @property({ type: Number, reflect: true }) heading?: 1 | 2 | 3 | 4 | 5 | 6;

  @property({ reflect: true }) padding?: LustrousPaddingValue;
  @property({ reflect: true, attribute: "mobile-padding" }) mobilePadding?: LustrousPaddingValue;
  @property({ reflect: true }) margin?: LustrousMarginValue;

  readonly internals: ElementInternals | undefined =
    typeof this.attachInternals === "function" ? this.attachInternals() : undefined;

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (changed.has("heading") && this.internals) {
      const level = this.heading;
      this.internals.role = level ? "heading" : null;
      this.internals.ariaLevel = level ? String(level) : null;
    }
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-text": LustrousText;
  }
}
