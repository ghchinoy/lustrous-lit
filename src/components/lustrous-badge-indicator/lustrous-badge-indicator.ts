import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { lustrousBase } from "../../theme/theme.js";

/**
 * `<lustrous-badge-indicator>` — Decorative 8px unread indicator dot inside a 20×20 box.
 * Hidden from assistive technology unless `aria-label` is set (`role="img"`).
 *
 * @csspart dot - The 8px indicator dot.
 */
@customElement("lustrous-badge-indicator")
export class LustrousBadgeIndicator extends LustrousElement {
  static override styles = [
    lustrousBase,
    css`
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        pointer-events: none;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: var(--lustrous-radius-full);
        background-color: var(--lustrous-color-accent-fixed);
      }
      @media (forced-colors: active) {
        .dot {
          background-color: Highlight;
          forced-color-adjust: none;
        }
      }
    `,
  ];

  @property({ attribute: "aria-label" }) label: string | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this.syncA11y();
  }

  protected override updated(): void {
    this.syncA11y();
  }

  private syncA11y() {
    const named = !!this.label || this.hasAttribute("aria-labelledby");
    if (named) {
      this.removeAttribute("aria-hidden");
      if (!this.hasAttribute("role")) this.setAttribute("role", "img");
    } else {
      if (this.getAttribute("role") === "img") this.removeAttribute("role");
      this.setAttribute("aria-hidden", "true");
    }
  }

  protected override render() {
    return html`<span part="dot" class="dot"></span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-badge-indicator": LustrousBadgeIndicator;
  }
}
