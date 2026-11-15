import { customElement, property } from "lit/decorators.js";
import "../../theme/events.js";
import { LustrousButton, type LustrousButtonVariant } from "../lustrous-button/lustrous-button.js";
import { requestToggle } from "./toggle.js";

export type LustrousTogglableButtonVariant = LustrousButtonVariant;
export type { LustrousToggleChangeEvent } from "./toggle.js";

/**
 * `<lustrous-togglable-button>` — Action button with a binary pressed state (`aria-pressed`).
 *
 * Defaults to `variant="tonal"` and transitions to `accent-container` when `selected`.
 * Clicking dispatches a cancelable `lustrous-change` event (`{ selected }`); call `preventDefault()`
 * on the event for fully controlled state management.
 *
 * @slot - Button label.
 * @fires lustrous-change - `CustomEvent<{ selected: boolean }>` (cancelable).
 * @csspart button - The native `<button>` element.
 */
@customElement("lustrous-togglable-button")
export class LustrousTogglableButton extends LustrousButton {
  /** @default "tonal" */
  @property({ reflect: true }) override variant: LustrousTogglableButtonVariant = "tonal";
  /** Whether the button is currently toggled on (`aria-pressed="true"`). @default false */
  @property({ type: Boolean, reflect: true }) selected = false;

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
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-togglable-button": LustrousTogglableButton;
  }
}
