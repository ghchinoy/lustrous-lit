import { css, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LustrousFlex } from "../lustrous-flex/lustrous-flex.js";

export type LustrousActionBarVariant = "flat" | "floating";

/**
 * `<lustrous-action-bar>` — Pill-shaped toolbar for contextual or multi-select actions.
 *
 * Extends `<lustrous-flex>` and exposes `role="toolbar"` via `ElementInternals`.
 * - `flat` (default): sits flush on `--lustrous-color-surface`
 * - `floating`: elevated `--lustrous-color-surface-bright` pill with `--lustrous-elevation-level1`
 *
 * @slot - Action buttons, icon buttons, and selection counters.
 */
@customElement("lustrous-action-bar")
export class LustrousActionBar extends LustrousFlex {
  static override styles = [
    ...[LustrousFlex.styles].flat(),
    css`
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--lustrous-space-s);
        padding: var(--lustrous-space-s) var(--lustrous-space-m);
        border-radius: var(--lustrous-radius-full);
        background-color: var(--lustrous-color-surface);
        color: var(--lustrous-color-on-surface);
      }
      :host([variant="floating"]) {
        background-color: var(--lustrous-color-surface-bright);
        box-shadow: var(--lustrous-elevation-level1);
      }
      @media (forced-colors: active) {
        :host {
          border: 1px solid CanvasText;
        }
      }
    `,
  ];

  /** Visual treatment: `flat` (default) or `floating` (elevated). */
  @property({ reflect: true }) variant: LustrousActionBarVariant = "flat";
  /** Accessible name for the `toolbar` landmark. */
  @property() label = "";

  readonly internals: ElementInternals | undefined =
    typeof this.attachInternals === "function" ? this.attachInternals() : undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.internals) this.internals.role = "toolbar";
  }

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (changed.has("label") && this.internals) {
      this.internals.ariaLabel = this.label || null;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-action-bar": LustrousActionBar;
  }
}
