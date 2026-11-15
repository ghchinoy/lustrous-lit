import { css, html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { lustrousBase } from "../../theme/theme.js";
import type { LustrousIconSize } from "../../theme/tokens.js";
import { lustrousIconToneStyles, renderIcon, type LustrousIconTone } from "../lustrous-icon/lustrous-icon.js";

export type LustrousChevronDirection = "down" | "end";

export const lustrousChevronStyles = css`
  .lustrous-chevron {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    line-height: 0;
    pointer-events: none;
    transition: transform 200ms cubic-bezier(0.2, 0, 0, 1);
  }
  .lustrous-chevron.down:not(.expanded) {
    transform: scaleY(1);
  }
  .lustrous-chevron.down.expanded {
    transform: scaleY(-1);
  }
  .lustrous-chevron.end:not(.expanded) {
    transform: rotate(-90deg);
  }
  .lustrous-chevron.end:not(.expanded):dir(rtl) {
    transform: rotate(90deg);
  }
  @media (prefers-reduced-motion: reduce) {
    .lustrous-chevron {
      transition: none;
    }
  }
`;

export function renderChevron(
  expanded: boolean,
  size: LustrousIconSize = "s",
  direction: LustrousChevronDirection = "down",
  label?: string,
): TemplateResult {
  return html`<span class="lustrous-chevron ${direction} ${expanded ? "expanded" : ""}">${renderIcon("chevronDown", size, label)}</span>`;
}

/**
 * `<lustrous-chevron-icon>` — Animated disclosure chevron (`direction="down"` or `"end"`),
 * RTL-aware and reduced-motion safe.
 */
@customElement("lustrous-chevron-icon")
export class LustrousChevronIcon extends LustrousElement {
  static override styles = [
    lustrousBase,
    lustrousChevronStyles,
    lustrousIconToneStyles,
    css`
      :host {
        display: inline-flex;
        flex-shrink: 0;
        line-height: 0;
        pointer-events: none;
      }
    `,
  ];

  @property({ type: Boolean, reflect: true }) expanded = false;
  @property({ reflect: true }) direction: LustrousChevronDirection = "down";
  @property({ reflect: true }) size: LustrousIconSize = "s";
  @property({ reflect: true }) tone?: LustrousIconTone;
  @property({ type: Boolean, reflect: true }) muted = false;
  @property() label = "";

  protected override render() {
    return renderChevron(this.expanded, this.size, this.direction, this.label || undefined);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-chevron-icon": LustrousChevronIcon;
  }
}
