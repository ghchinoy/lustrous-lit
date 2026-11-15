import { css, html, nothing, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../lustrous-badge-indicator/lustrous-badge-indicator.js";
import { LustrousButtonBase, lustrousButtonStyles, type LustrousButtonSize, type LustrousButtonVariant } from "../lustrous-button/button-base.js";
import { renderChevron, type LustrousChevronDirection } from "../lustrous-chevron-icon/lustrous-chevron-icon.js";
import { renderIcon, type LustrousIconName } from "../lustrous-icon/lustrous-icon.js";

export type LustrousIconButtonVariant = LustrousButtonVariant;
export type LustrousIconButtonSize = LustrousButtonSize;

const ICON_SIZE = { m: "m", s: "s", xs: "xs" } as const;

/**
 * `<lustrous-icon-button>` — Circular icon-only action button (`aria-label` required).
 *
 * @csspart button - The native `<button>` or `<a>`.
 * @csspart badge - Optional unread dot (`lustrous-badge-indicator`).
 */
@customElement("lustrous-icon-button")
export class LustrousIconButton extends LustrousButtonBase {
  static override styles = [
    ...lustrousButtonStyles,
    css`
      :host {
        flex-shrink: 0;
      }
      .btn {
        padding: 0;
        gap: 0;
        border-radius: var(--lustrous-radius-full);
      }
      .size-m {
        width: 44px;
        height: 44px;
      }
      .size-s {
        width: 36px;
        height: 36px;
      }
      .size-xs {
        width: 28px;
        height: 28px;
      }
      .badge {
        position: absolute;
        z-index: 1;
        top: var(--_badge-offset);
        inset-inline-end: var(--_badge-offset);
      }
      .size-m .badge {
        --_badge-offset: 0px;
      }
      .size-s .badge {
        --_badge-offset: -4px;
      }
      .size-xs .badge {
        --_badge-offset: -6px;
      }
    `,
  ];

  @property({ reflect: true }) icon: LustrousIconName = "bolt";
  @property({ reflect: true, attribute: "collapsed-direction" }) collapsedDirection: LustrousChevronDirection = "down";
  @property({ reflect: true }) variant: LustrousIconButtonVariant = "on-surface";
  @property({ reflect: true }) size: LustrousIconButtonSize = "m";
  @property({ type: Boolean, reflect: true }) muted = false;
  @property({ type: Boolean, reflect: true }) badge = false;

  protected stateClasses(): string {
    return "";
  }

  override firstUpdated(changed: PropertyValues): void {
    super.firstUpdated(changed);
    if (!this.label) {
      console.warn("<lustrous-icon-button> requires an aria-label attribute.", this);
    }
  }

  protected override render() {
    return this.renderControl(
      `variant-${this.variant} size-${this.size} ${this.muted ? "muted" : ""} ${this.stateClasses()}`,
      html`${this.expanded !== undefined
        ? renderChevron(this.expanded, ICON_SIZE[this.size], this.collapsedDirection)
        : renderIcon(this.icon, ICON_SIZE[this.size])}${this.badge
        ? html`<lustrous-badge-indicator class="badge" part="badge"></lustrous-badge-indicator>`
        : nothing}`,
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-icon-button": LustrousIconButton;
  }
}
