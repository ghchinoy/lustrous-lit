import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../../theme/events.js";
import "../lustrous-badge-indicator/lustrous-badge-indicator.js";
import { renderChevron } from "../lustrous-chevron-icon/lustrous-chevron-icon.js";
import { renderIcon, type LustrousIconName } from "../lustrous-icon/lustrous-icon.js";
import { LustrousIconButton, type LustrousIconButtonVariant } from "../lustrous-icon-button/lustrous-icon-button.js";
import { requestToggle } from "../lustrous-togglable-button/toggle.js";

export type LustrousTogglableIconButtonVariant = LustrousIconButtonVariant;
export type { LustrousToggleChangeEvent } from "../lustrous-togglable-button/toggle.js";

/**
 * `<lustrous-togglable-icon-button>` — Circular icon-only toggle button (`aria-pressed`, `aria-label` required).
 *
 * Optionally swaps its glyph when pressed via `selected-icon`, and dispatches a cancelable
 * `lustrous-change` (`{ selected }`) event on activation.
 *
 * @fires lustrous-change - `CustomEvent<{ selected: boolean }>` (cancelable).
 * @csspart button - The native `<button>` element.
 * @csspart badge - Optional unread dot (`lustrous-badge-indicator`).
 */
@customElement("lustrous-togglable-icon-button")
export class LustrousTogglableIconButton extends LustrousIconButton {
  /** Whether the button is currently toggled on (`aria-pressed="true"`). @default false */
  @property({ type: Boolean, reflect: true }) selected = false;
  /** Optional alternate icon rendered while `selected` is true. */
  @property({ reflect: true, attribute: "selected-icon" }) selectedIcon?: LustrousIconName;

  protected override stateClasses(): string {
    return this.selected ? "selected" : "";
  }

  protected override buttonAriaPressed(): string | undefined {
    return this.selected ? "true" : "false";
  }

  protected override activate(e: MouseEvent): void {
    super.activate(e);
    requestToggle(this);
  }

  protected override render() {
    const activeIcon = this.selected && this.selectedIcon ? this.selectedIcon : this.icon;
    return this.renderControl(
      `variant-${this.variant} size-${this.size} ${this.muted ? "muted" : ""} ${this.stateClasses()}`,
      html`${this.expanded !== undefined
        ? renderChevron(this.expanded, this.size, this.collapsedDirection)
        : renderIcon(activeIcon, this.size)}${this.badge
        ? html`<lustrous-badge-indicator class="badge" part="badge"></lustrous-badge-indicator>`
        : nothing}`,
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-togglable-icon-button": LustrousTogglableIconButton;
  }
}
