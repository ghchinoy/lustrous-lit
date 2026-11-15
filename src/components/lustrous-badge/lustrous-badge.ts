import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { lustrousBase, lustrousType } from "../../theme/theme.js";
import { renderIcon, type LustrousIconName } from "../lustrous-icon/lustrous-icon.js";

export type LustrousBadgeTone =
  | "default"
  | "accent"
  | "positive"
  | "warning"
  | "error"
  | "cobalt"
  | "emerald"
  | "amber"
  | "rose"
  | "violet"
  | "teal";

/**
 * `<lustrous-badge>` — Compact 24px pill badge supporting semantic and dual-theme
 * categorical tones (`cobalt`, `emerald`, `amber`, `rose`, `violet`, `teal`) and an optional icon.
 *
 * @slot - Badge label text.
 * @csspart badge - The pill element.
 */
@customElement("lustrous-badge")
export class LustrousBadge extends LustrousElement {
  static override styles = [
    lustrousBase,
    css`
      :host {
        display: inline-flex;
      }
      .pill {
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--lustrous-space-xs);
        height: 24px;
        padding: 0 var(--lustrous-space-s);
        border-radius: var(--lustrous-radius-full);
        white-space: nowrap;
        ${lustrousType("body-small-emphasized")}
      }
      .tone-default {
        background: var(--lustrous-color-surface-container-high);
        color: var(--lustrous-color-on-surface);
      }
      .tone-accent {
        background: var(--lustrous-color-accent-container);
        color: var(--lustrous-color-on-accent-container);
      }
      .tone-positive {
        background: var(--lustrous-color-positive-container);
        color: var(--lustrous-color-on-positive-container);
      }
      .tone-warning {
        background: var(--lustrous-color-warning-container);
        color: var(--lustrous-color-on-warning-container);
      }
      .tone-error {
        background: var(--lustrous-color-error-container);
        color: var(--lustrous-color-on-error-container);
      }
      .tone-cobalt {
        background: var(--lustrous-color-category-cobalt);
        color: var(--lustrous-color-on-category-cobalt);
      }
      .tone-emerald {
        background: var(--lustrous-color-category-emerald);
        color: var(--lustrous-color-on-category-emerald);
      }
      .tone-amber {
        background: var(--lustrous-color-category-amber);
        color: var(--lustrous-color-on-category-amber);
      }
      .tone-rose {
        background: var(--lustrous-color-category-rose);
        color: var(--lustrous-color-on-category-rose);
      }
      .tone-violet {
        background: var(--lustrous-color-category-violet);
        color: var(--lustrous-color-on-category-violet);
      }
      .tone-teal {
        background: var(--lustrous-color-category-teal);
        color: var(--lustrous-color-on-category-teal);
      }
      @media (forced-colors: active) {
        .pill {
          outline: 1px solid currentColor;
          outline-offset: -1px;
        }
      }
    `,
  ];

  @property({ reflect: true }) tone: LustrousBadgeTone = "default";
  @property({ reflect: true }) icon?: LustrousIconName;

  protected override render() {
    return html`
      <span part="badge" class="pill tone-${this.tone}">
        ${this.icon ? renderIcon(this.icon, 13) : nothing}
        <slot></slot>
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-badge": LustrousBadge;
  }
}
