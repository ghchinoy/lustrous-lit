import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { lustrousType } from "../../theme/theme.js";
import { renderChevron, type LustrousChevronDirection } from "../lustrous-chevron-icon/lustrous-chevron-icon.js";
import { renderIcon, type LustrousIconName } from "../lustrous-icon/lustrous-icon.js";
import {
  LustrousButtonBase,
  lustrousButtonStyles,
  type LustrousButtonShape,
  type LustrousButtonSize,
  type LustrousButtonVariant,
} from "./button-base.js";

export type { LustrousButtonShape, LustrousButtonSize, LustrousButtonVariant } from "./button-base.js";
export { LustrousButtonBase, lustrousButtonStyles } from "./button-base.js";

/**
 * `<lustrous-button>` — Primary and secondary action button.
 *
 * - Variants: `primary`, `accent` (default), `tonal`, `outline`, `bright`, `on-surface`, `on-surface-variant`, `translucent`
 * - Sizes: `m` (44px, default), `s` (36px; 44px min touch target at `<= 768px`), `xs` (28px)
 * - Shapes: `rounded` (10px, default), `pill`
 * - Form-associated (`type="submit" | "reset"`) and link-capable (`href`).
 *
 * @slot - Button label.
 * @csspart button - The inner `<button>` or `<a>`.
 */
@customElement("lustrous-button")
export class LustrousButton extends LustrousButtonBase {
  static override styles = [
    ...lustrousButtonStyles,
    css`
      .size-m {
        height: 44px;
        padding-inline: var(--lustrous-space-l);
      }
      .size-s {
        height: 36px;
        padding-inline: var(--lustrous-space-m);
      }
      .size-xs {
        height: 28px;
        padding-inline: var(--lustrous-space-s);
        gap: var(--lustrous-space-xs);
        ${lustrousType("body-small-emphasized")}
      }
      .size-m.has-icon {
        padding-inline: var(--lustrous-space-m) var(--lustrous-space-l);
      }
      .size-s.has-icon {
        padding-inline: var(--lustrous-space-s) var(--lustrous-space-m);
      }
      .size-xs.has-icon {
        padding-inline: var(--lustrous-space-xs) var(--lustrous-space-s);
      }
      .size-m.has-trailing {
        padding-inline: var(--lustrous-space-l) var(--lustrous-space-m);
      }
      .size-s.has-trailing {
        padding-inline: var(--lustrous-space-m) var(--lustrous-space-s);
      }
      .size-xs.has-trailing {
        padding-inline: var(--lustrous-space-s) var(--lustrous-space-xs);
      }
      .size-m.has-icon.has-trailing {
        padding-inline: var(--lustrous-space-m);
      }
      .size-s.has-icon.has-trailing {
        padding-inline: var(--lustrous-space-s);
      }
      .size-xs.has-icon.has-trailing {
        padding-inline: var(--lustrous-space-xs);
      }
      @media (max-width: 768px) {
        .size-s {
          min-width: var(--_lustrous-compact-s-min-target, 44px);
          min-height: var(--_lustrous-compact-s-min-target, 44px);
        }
      }
    `,
  ];

  @property({ reflect: true }) variant: LustrousButtonVariant = "accent";
  @property({ reflect: true }) size: LustrousButtonSize = "m";
  @property({ reflect: true }) shape: LustrousButtonShape = "rounded";
  @property({ reflect: true }) icon?: LustrousIconName;
  @property({ reflect: true, attribute: "trailing-icon" }) trailingIcon?: LustrousIconName;
  @property({ reflect: true, attribute: "collapsed-direction" }) collapsedDirection: LustrousChevronDirection = "down";
  @property({ type: Boolean, reflect: true }) muted = false;

  protected stateClasses(): string {
    return "";
  }

  protected override render() {
    const iconSize = this.size === "xs" ? "xs" : "s";
    const classes = [
      `variant-${this.variant}`,
      `size-${this.size}`,
      `shape-${this.shape}`,
      this.icon ? "has-icon" : "",
      this.trailingIcon || this.expanded !== undefined ? "has-trailing" : "",
      this.muted ? "muted" : "",
      this.stateClasses(),
    ].join(" ");
    return this.renderControl(
      classes,
      html`
        ${this.icon ? renderIcon(this.icon, iconSize) : nothing}
        <slot></slot>
        ${this.expanded !== undefined
          ? renderChevron(this.expanded, iconSize, this.collapsedDirection)
          : this.trailingIcon
            ? renderIcon(this.trailingIcon, iconSize)
            : nothing}
      `,
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-button": LustrousButton;
  }
}
