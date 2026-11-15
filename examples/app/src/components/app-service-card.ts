import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@ghchinoy/lustrous-lit/components/lustrous-badge";
import type { LustrousBadgeTone } from "@ghchinoy/lustrous-lit/components/lustrous-badge";
import { renderIcon, type LustrousIconName } from "@ghchinoy/lustrous-lit/components/lustrous-icon";
import "@ghchinoy/lustrous-lit/components/lustrous-icon-button";
import "@ghchinoy/lustrous-lit/components/lustrous-menu";
import type { LustrousMenuItem } from "@ghchinoy/lustrous-lit/components/lustrous-menu";
import "@ghchinoy/lustrous-lit/components/lustrous-tooltip";
import {
  LustrousElement,
  lustrousBase,
  lustrousFocusRing,
  lustrousStateLayer,
  lustrousType,
} from "@ghchinoy/lustrous-lit/theme";

export type ServiceHealth = "healthy" | "degraded" | "deploying";

export interface ServiceRecord {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly summary: string;
  readonly owner: string;
  readonly region: string;
  readonly version: string;
  readonly status: ServiceHealth;
  readonly latencyP95: string;
  readonly rps: string;
  readonly uptimePercent: number;
  readonly endpoint: string;
  readonly icon: LustrousIconName;
}

const STATUS_META: Readonly<
  Record<ServiceHealth, { label: string; tone: LustrousBadgeTone; icon: LustrousIconName }>
> = {
  healthy: { label: "Healthy", tone: "emerald", icon: "checkCircle" },
  degraded: { label: "Degraded", tone: "amber", icon: "warning" },
  deploying: { label: "Rolling out", tone: "cobalt", icon: "sync" },
};

/**
 * `<app-service-card>` — Composite service card combining `--lustrous-*` tokens with
 * `<lustrous-badge>`, `<lustrous-tooltip>`, `<lustrous-menu>`, and a `@container` query
 * that adapts automatically between grid tiles and horizontal list rows.
 */
@customElement("app-service-card")
export class AppServiceCard extends LustrousElement {
  static override styles = [
    lustrousBase,
    lustrousFocusRing,
    lustrousStateLayer,
    css`
      :host {
        display: block;
        min-width: 0;
        container-type: inline-size;
        container-name: service-card;
      }
      .card {
        display: flex;
        flex-direction: column;
        gap: var(--lustrous-space-m);
        height: 100%;
        padding: var(--lustrous-space-l);
        border: 1px solid var(--lustrous-color-outline-variant);
        border-radius: var(--lustrous-radius-xl);
        background-color: var(--lustrous-color-surface-bright);
        color: var(--lustrous-color-on-surface);
        box-shadow: var(--lustrous-elevation-level1);
        transition:
          border-color var(--lustrous-duration-short150) var(--lustrous-easing-standard),
          background-color var(--lustrous-duration-short150) var(--lustrous-easing-standard);
      }
      :host([selected]) .card {
        border-color: var(--lustrous-color-primary);
        background-color: color-mix(
          in srgb,
          var(--lustrous-color-primary-container) 28%,
          var(--lustrous-color-surface-bright)
        );
      }
      .primary {
        all: unset;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: var(--lustrous-space-s);
        flex: 1 1 auto;
        min-width: 0;
        padding: var(--lustrous-space-xs);
        margin: calc(-1 * var(--lustrous-space-xs));
        border-radius: var(--lustrous-radius-l);
        cursor: pointer;
        text-align: start;
      }
      .identity {
        display: flex;
        align-items: center;
        gap: var(--lustrous-space-m);
        min-width: 0;
      }
      .service-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 36px;
        height: 36px;
        border-radius: var(--lustrous-radius-m);
        background-color: var(--lustrous-color-surface-container);
        color: var(--lustrous-color-primary);
      }
      .titles {
        display: flex;
        flex-direction: column;
        min-width: 0;
        flex: 1 1 auto;
      }
      .name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--lustrous-color-on-surface);
        ${lustrousType("body-large-emphasized")}
      }
      .meta {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--lustrous-color-on-surface-variant);
        font-family: var(--lustrous-font-code);
        ${lustrousType("caption")}
      }
      .summary {
        margin: 0;
        color: var(--lustrous-color-on-surface-variant);
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        ${lustrousType("body-small")}
      }
      .footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: var(--lustrous-space-s);
        padding-top: var(--lustrous-space-s);
        border-top: 1px solid var(--lustrous-color-on-surface-low);
      }
      .stats {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--lustrous-space-m);
      }
      .stat {
        display: flex;
        flex-direction: column;
      }
      .stat-label {
        color: var(--lustrous-color-on-surface-variant);
        ${lustrousType("caption")}
      }
      .stat-val {
        font-family: var(--lustrous-font-code);
        font-variant-numeric: tabular-nums;
        color: var(--lustrous-color-on-surface);
        ${lustrousType("body-small-emphasized")}
      }
      .controls {
        display: flex;
        align-items: center;
        gap: var(--lustrous-space-xs);
        flex-shrink: 0;
      }

      /* Container query switches from stacked grid card to horizontal list row when >= 520px wide */
      @container service-card (min-width: 520px) {
        .card {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          gap: var(--lustrous-space-xl);
          padding-block: var(--lustrous-space-m);
          padding-inline: var(--lustrous-space-l);
        }
        .primary {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          gap: var(--lustrous-space-l);
        }
        .identity {
          flex: 0 0 230px;
        }
        .summary {
          flex: 1 1 auto;
          -webkit-line-clamp: 1;
        }
        .footer {
          flex-wrap: nowrap;
          padding-top: 0;
          border-top: 0;
          gap: var(--lustrous-space-l);
        }
      }

      @media (forced-colors: active) {
        .card {
          border: 1px solid CanvasText;
        }
        :host([selected]) .card {
          border: 2px solid Highlight;
        }
      }
    `,
  ];

  @property({ attribute: false }) service!: ServiceRecord;
  @property({ type: Boolean, reflect: true }) selected = false;

  private emit(type: string): void {
    if (!this.service) return;
    this.dispatchEvent(
      new CustomEvent(type, {
        detail: { serviceId: this.service.id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private get menuItems(): LustrousMenuItem[] {
    return [
      {
        type: "action",
        id: "inspect",
        label: "Inspect topology & metrics",
        icon: "visibility",
        onClick: () => this.emit("meridian-service-select"),
      },
      {
        type: "action",
        id: "share",
        label: "Share endpoint",
        icon: "share2",
        onClick: () => this.emit("meridian-service-share"),
      },
      { type: "divider" },
      {
        type: "action",
        id: "restart",
        label: "Restart rolling pods…",
        icon: "replay",
        destructive: true,
        onClick: () => this.emit("meridian-service-restart"),
      },
    ];
  }

  protected override render() {
    const s = this.service;
    if (!s) return html``;
    const status = STATUS_META[s.status];

    return html`
      <article class="card" aria-label=${s.name}>
        <button
          type="button"
          class="primary focus-ring state-layer"
          aria-pressed=${this.selected ? "true" : "false"}
          @click=${() => this.emit("meridian-service-select")}
        >
          <div class="identity">
            <span class="service-icon" aria-hidden="true">${renderIcon(s.icon, "s")}</span>
            <span class="titles">
              <span class="name">${s.name}</span>
              <span class="meta">${s.region} · ${s.version}</span>
            </span>
          </div>
          <p class="summary">${s.summary}</p>
        </button>

        <div class="footer">
          <div class="stats">
            <lustrous-badge tone=${status.tone} icon=${status.icon}>${status.label}</lustrous-badge>
            <div class="stat">
              <span class="stat-label">P95</span>
              <span class="stat-val">${s.latencyP95}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Traffic</span>
              <span class="stat-val">${s.rps}</span>
            </div>
          </div>

          <div class="controls">
            <lustrous-tooltip content="Share service endpoint" side="top">
              <lustrous-icon-button
                icon="share2"
                size="s"
                variant="on-surface-variant"
                aria-label="Share ${s.name} endpoint"
                @click=${() => this.emit("meridian-service-share")}
              ></lustrous-icon-button>
            </lustrous-tooltip>

            <lustrous-menu side="bottom" align="end" label="Actions for ${s.name}" .items=${this.menuItems}>
              <lustrous-icon-button
                slot="trigger"
                icon="moreVert"
                size="s"
                variant="on-surface-variant"
                aria-label="More actions for ${s.name}"
              ></lustrous-icon-button>
            </lustrous-menu>
          </div>
        </div>
      </article>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-service-card": AppServiceCard;
  }
}
