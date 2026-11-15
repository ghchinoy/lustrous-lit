import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { renderIcon, type LustrousIconName } from "@ghchinoy/lustrous-lit/components/lustrous-icon";
import { LustrousElement, lustrousBase, lustrousType } from "@ghchinoy/lustrous-lit/theme";

export type AppKpiTrend = "up" | "down" | "flat";
export type AppKpiTone = "positive" | "warning" | "error" | "neutral";

const TREND_ICON: Readonly<Record<AppKpiTrend, LustrousIconName>> = {
  up: "trendingUp",
  down: "trendingDown",
  flat: "trendingFlat",
};

/**
 * `<app-kpi-card>` — Application metric summary card authored purely with
 * `--lustrous-*` tokens, `lustrousBase`, `lustrousType()`, and `renderIcon()`.
 */
@customElement("app-kpi-card")
export class AppKpiCard extends LustrousElement {
  static override styles = [
    lustrousBase,
    css`
      :host {
        display: block;
        min-width: 0;
      }
      .card {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: var(--lustrous-space-m);
        height: 100%;
        padding: var(--lustrous-space-xl);
        border: 1px solid var(--lustrous-color-outline-variant);
        border-radius: var(--lustrous-radius-xl);
        background-color: var(--lustrous-color-surface-bright);
        color: var(--lustrous-color-on-surface);
        box-shadow: var(--lustrous-elevation-level1);
      }
      .top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--lustrous-space-s);
      }
      .label {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--lustrous-color-on-surface-variant);
        ${lustrousType("body-small-emphasized")}
      }
      .glyph {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        border-radius: var(--lustrous-radius-m);
        background-color: var(--lustrous-color-surface-container);
        color: var(--lustrous-color-primary);
      }
      .metric-row {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: var(--lustrous-space-s);
      }
      .value {
        font-variant-numeric: tabular-nums;
        color: var(--lustrous-color-on-surface);
        ${lustrousType("display-small")}
      }
      .delta {
        display: inline-flex;
        align-items: center;
        gap: var(--lustrous-space-xs);
        padding-block: 2px;
        padding-inline: var(--lustrous-space-s);
        border-radius: var(--lustrous-radius-full);
        font-family: var(--lustrous-font-code);
        font-variant-numeric: tabular-nums;
        ${lustrousType("caption")}
      }
      .delta.tone-positive {
        background-color: var(--lustrous-color-positive-container);
        color: var(--lustrous-color-on-positive-container);
      }
      .delta.tone-warning {
        background-color: var(--lustrous-color-warning-container);
        color: var(--lustrous-color-on-warning-container);
      }
      .delta.tone-error {
        background-color: var(--lustrous-color-error-container);
        color: var(--lustrous-color-on-error-container);
      }
      .delta.tone-neutral {
        background-color: var(--lustrous-color-surface-container-high);
        color: var(--lustrous-color-on-surface);
      }
      .caption {
        margin: 0;
        color: var(--lustrous-color-on-surface-variant);
        ${lustrousType("caption")}
      }
      @media (forced-colors: active) {
        .card,
        .delta {
          border: 1px solid CanvasText;
        }
      }
    `,
  ];

  @property() label = "";
  @property() value = "";
  @property() delta = "";
  @property({ reflect: true }) trend: AppKpiTrend = "up";
  @property({ reflect: true }) tone: AppKpiTone = "positive";
  @property() caption = "";
  @property({ reflect: true }) icon: LustrousIconName = "activity";

  protected override render() {
    return html`
      <article class="card" aria-label=${this.label || nothing}>
        <div class="top">
          <span class="label">${this.label}</span>
          <span class="glyph" aria-hidden="true">${renderIcon(this.icon, "s")}</span>
        </div>
        <div class="metric-row">
          <span class="value">${this.value}</span>
          ${this.delta
            ? html`<span class="delta tone-${this.tone}">
                ${renderIcon(TREND_ICON[this.trend], "xs")}
                <span>${this.delta}</span>
              </span>`
            : nothing}
        </div>
        ${this.caption ? html`<p class="caption">${this.caption}</p>` : nothing}
      </article>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-kpi-card": AppKpiCard;
  }
}
