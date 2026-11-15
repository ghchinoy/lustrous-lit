import { css, html, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { setHostVar } from "../../internal/style-gen.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { lustrousBase } from "../../theme/theme.js";

export type LustrousProgressBarTone = "default" | "accent" | "positive" | "warning" | "error";

/**
 * `<lustrous-progress-bar>` — Determinate linear progress bar (`0–100`).
 *
 * Exposes `role="progressbar"` via `ElementInternals` (unless `decorative` is set) and drives
 * the indicator width via `--_lustrous-progress` on the host using `setHostVar()`.
 *
 * @csspart track - The pill track container.
 * @csspart fill - The determinate indicator bar.
 */
@customElement("lustrous-progress-bar")
export class LustrousProgressBar extends LustrousElement {
  static override styles = [
    lustrousBase,
    css`
      :host {
        display: block;
        width: 100%;
      }
      .track {
        height: 10px;
        width: 100%;
        overflow: hidden;
        border-radius: var(--lustrous-radius-full);
        background-color: var(--lustrous-color-surface-container-high);
      }
      .fill {
        display: block;
        height: 100%;
        width: var(--_lustrous-progress, 0%);
        border-radius: var(--lustrous-radius-full);
        background-color: var(--lustrous-color-primary);
        transition: width 250ms cubic-bezier(0.2, 0, 0, 1);
      }
      :host([tone="accent"]) .fill {
        background-color: var(--lustrous-color-accent);
      }
      :host([tone="positive"]) .fill {
        background-color: var(--lustrous-color-positive);
      }
      :host([tone="warning"]) .fill {
        background-color: var(--lustrous-color-warning);
      }
      :host([tone="error"]) .fill {
        background-color: var(--lustrous-color-error);
      }
      @media (forced-colors: active) {
        .track {
          border: 1px solid ButtonText;
        }
        .fill {
          forced-color-adjust: none;
          border: 1px solid Highlight;
          background-color: Highlight;
        }
      }
    `,
  ];

  /** Determinate completion percentage (`0–100`, clamped). @default 0 */
  @property({ type: Number }) value = 0;
  /** Accessible name (`aria-label` on the host is also respected). */
  @property() label = "";
  /** Semantic fill color tone. @default "default" */
  @property({ reflect: true }) tone: LustrousProgressBarTone = "default";
  /** Hides the bar from assistive technology when adjacent text already conveys progress. */
  @property({ type: Boolean, reflect: true }) decorative = false;

  readonly internals: ElementInternals | undefined =
    typeof this.attachInternals === "function" ? this.attachInternals() : undefined;

  /** Clamped `0–100` percentage displayed by the indicator. */
  get clampedValue(): number {
    const v = Number(this.value);
    return Number.isFinite(v) ? Math.min(100, Math.max(0, v)) : 0;
  }

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    const v = this.clampedValue;
    setHostVar(this, "--_lustrous-progress", `${v}%`);
    const i = this.internals;
    if (!i) return;
    if (this.decorative) {
      i.role = null;
      i.ariaHidden = "true";
      i.ariaValueNow = i.ariaValueMin = i.ariaValueMax = i.ariaLabel = null;
    } else {
      i.role = "progressbar";
      i.ariaHidden = null;
      i.ariaValueMin = "0";
      i.ariaValueMax = "100";
      i.ariaValueNow = String(v);
      i.ariaLabel = this.label || null;
    }
  }

  protected override render() {
    return html`<div part="track" class="track"><span part="fill" class="fill"></span></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-progress-bar": LustrousProgressBar;
  }
}
