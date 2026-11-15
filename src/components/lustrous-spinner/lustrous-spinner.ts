import { css, html, nothing, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { lustrousBase } from "../../theme/theme.js";
import type { LustrousIconSize } from "../../theme/tokens.js";
import { lustrousIconToneStyles, renderIcon, type LustrousIconName, type LustrousIconTone } from "../lustrous-icon/lustrous-icon.js";

export type LustrousSpinnerVariant = "icon" | "ring";
export type LustrousSpinnerSpeed = "default" | "slow";

/**
 * `<lustrous-spinner>` — Indeterminate loading indicator (`variant="icon"` or `"ring"`).
 * Stops cleanly (`animation: none`) under `prefers-reduced-motion: reduce`.
 *
 * @csspart spinner - The rotating glyph or ring.
 */
@customElement("lustrous-spinner")
export class LustrousSpinner extends LustrousElement {
  static override styles = [
    lustrousBase,
    lustrousIconToneStyles,
    css`
      :host {
        position: relative;
        display: inline-flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        line-height: 0;
        vertical-align: middle;
      }
      :host([muted][muted]) {
        color: var(--lustrous-text-muted);
      }
      :host([variant="ring"][variant="ring"]) {
        width: 32px;
        height: 32px;
        color: inherit;
      }
      .spin {
        display: inline-flex;
        animation: lustrous-spinner-turn 0.9s linear infinite;
      }
      :host([speed="slow"]) .spin {
        animation-duration: 1.8s;
      }
      .ring {
        position: absolute;
        inset: 0;
        border: 2px solid var(--lustrous-color-outline-variant);
        border-top-color: var(--lustrous-color-primary);
        border-radius: var(--lustrous-radius-full);
      }
      @keyframes lustrous-spinner-turn {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .spin,
        :host([speed="slow"]) .spin {
          animation: none;
        }
      }
      @media (forced-colors: active) {
        .ring {
          border-color: GrayText;
          border-top-color: Highlight;
        }
      }
    `,
  ];

  @property({ reflect: true }) variant: LustrousSpinnerVariant = "icon";
  @property({ reflect: true }) size: LustrousIconSize = "s";
  @property({ reflect: true }) tone: LustrousIconTone = "primary";
  @property({ type: Boolean, reflect: true }) muted = false;
  @property({ reflect: true }) icon?: LustrousIconName;
  @property({ reflect: true }) speed: LustrousSpinnerSpeed = "default";
  @property() label = "";

  readonly internals: ElementInternals | undefined =
    typeof this.attachInternals === "function" ? this.attachInternals() : undefined;

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (changed.has("label") && this.internals) {
      this.internals.role = this.label ? "status" : null;
      this.internals.ariaLabel = this.label || null;
      this.internals.ariaHidden = this.label ? null : "true";
    }
  }

  protected override render() {
    if (this.variant === "ring") {
      return html`<span part="spinner" class="ring spin"></span>${this.icon ? renderIcon(this.icon, this.size) : nothing}`;
    }
    return html`<span part="spinner" class="spin">${renderIcon("progressActivity", this.size)}</span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-spinner": LustrousSpinner;
  }
}
