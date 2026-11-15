import { css, html, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { lustrousBase, lustrousFocusRing, lustrousStateLayer, lustrousType } from "../../theme/theme.js";
import "../lustrous-badge/lustrous-badge.js";
import type { LustrousBadgeTone } from "../lustrous-badge/lustrous-badge.js";
import { lustrousChevronStyles, renderChevron } from "../lustrous-chevron-icon/lustrous-chevron-icon.js";
import { renderIcon, type LustrousIconName } from "../lustrous-icon/lustrous-icon.js";

const STORAGE_PREFIX = "lustrous.card.open.";

export type LustrousHeadingLevel = 2 | 3 | 4 | 5 | 6;
import "../../theme/events.js";

/**
 * `<lustrous-collapsible-card>` — Elevated surface card with an accessible disclosure header.
 *
 * Renders an ARIA heading (`heading-level`, `2`–`6`, default `3`) wrapping a native
 * `<button aria-expanded>` toggle with an optional leading `icon`, `badge` (`badge-tone`),
 * `subtitle`, and animated chevron. Interactive header controls belong in `slot="actions"`,
 * positioned as a sibling outside the disclosure button.
 *
 * @slot - Card body content (hidden when collapsed).
 * @slot heading - Rich heading content; overrides the `heading` attribute.
 * @slot actions - Header action controls rendered beside the disclosure button.
 * @fires lustrous-toggle - `CustomEvent<{ open: boolean }>` dispatched after toggling.
 * @csspart card - Outer surface container.
 * @csspart header - Header bar containing the heading toggle and actions slot.
 * @csspart toggle - Native disclosure `<button>`.
 * @csspart badge - Optional `<lustrous-badge>` in the header.
 * @csspart body - Collapsible card body container.
 */
@customElement("lustrous-collapsible-card")
export class LustrousCollapsibleCard extends LustrousElement {
  static override styles = [
    lustrousChevronStyles,
    lustrousBase,
    lustrousFocusRing,
    lustrousStateLayer,
    css`
      :host {
        display: block;
      }
      .card {
        background-color: var(--lustrous-color-surface-bright);
        color: var(--lustrous-color-on-surface);
        border: 1px solid var(--lustrous-color-on-surface-low);
        border-radius: var(--lustrous-radius-m);
        box-shadow: var(--lustrous-elevation-level1);
        --lustrous-text-muted: var(--lustrous-color-on-surface-variant);
      }
      .header {
        display: flex;
        align-items: center;
      }
      .header.has-actions {
        gap: var(--lustrous-space-s);
        padding-inline-end: var(--lustrous-space-m);
      }
      .heading {
        flex: 1 1 auto;
        min-width: 0;
        margin: 0;
      }
      .toggle {
        all: unset;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        gap: var(--lustrous-space-s);
        width: 100%;
        min-height: 48px;
        padding: var(--lustrous-space-m) var(--lustrous-space-l);
        border-radius: var(--lustrous-radius-m);
        cursor: pointer;
        user-select: none;
      }
      .title {
        display: inline-flex;
        align-items: center;
        gap: var(--lustrous-space-s);
        min-width: 0;
        ${lustrousType("body-medium-emphasized")}
      }
      .title-icon,
      .chevron {
        display: inline-flex;
        flex-shrink: 0;
        color: var(--lustrous-color-on-surface-variant);
      }
      .chevron {
        margin-inline-start: auto;
      }
      .badge {
        flex-shrink: 0;
      }
      .subtitle {
        color: var(--lustrous-color-on-surface-variant);
        ${lustrousType("body-small")}
      }
      .actions {
        display: flex;
        align-items: center;
        gap: var(--lustrous-space-s);
        flex-shrink: 0;
      }
      .body {
        padding: var(--lustrous-space-m) var(--lustrous-space-l) var(--lustrous-space-l);
        border-top: 1px solid var(--lustrous-color-on-surface-low);
      }
      .body[hidden] {
        display: none;
      }
      @media (forced-colors: active) {
        .card {
          border-color: CanvasText;
        }
      }
    `,
  ];

  /** Plain-text heading for the disclosure card. */
  @property() heading = "";

  /** ARIA heading level (`2`–`6`) applied to the disclosure header. @default 3 */
  @property({ type: Number, attribute: "heading-level" }) headingLevel: LustrousHeadingLevel = 3;

  /** Optional secondary metadata shown beside the heading. */
  @property() subtitle = "";

  /** Optional leading icon name in the disclosure header. */
  @property({ reflect: true }) icon?: LustrousIconName;

  /** Optional badge label rendered beside the heading. */
  @property() badge = "";

  /** Semantic or categorical tone for `badge`. @default "accent" */
  @property({ reflect: true, attribute: "badge-tone" }) badgeTone: LustrousBadgeTone = "accent";

  /** Persists open/closed state in `localStorage` under `lustrous.card.open.<storage-key>`. */
  @property({ attribute: "storage-key" }) storageKey = "";

  /** Whether the card body is expanded. @default true */
  @property({ type: Boolean, reflect: true }) open = true;

  @state() private hasActions = false;

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.children) {
      this.hasActions = [...this.children].some((el) => el.getAttribute("slot") === "actions");
    }
  }

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (changed.has("storageKey") && this.storageKey) {
      try {
        const raw = globalThis.localStorage?.getItem(STORAGE_PREFIX + this.storageKey);
        if (raw === "true" || raw === "false") {
          this.open = raw === "true";
        }
      } catch {
        /* storage unavailable in sandboxed or private contexts */
      }
    }
  }

  /** Toggles (or sets) `open`, persists `storage-key` when configured, and dispatches `lustrous-toggle`. */
  toggle(force?: boolean): void {
    this.open = force ?? !this.open;
    if (this.storageKey) {
      try {
        globalThis.localStorage?.setItem(STORAGE_PREFIX + this.storageKey, String(this.open));
      } catch {
        /* ignore storage quota or sandbox errors */
      }
    }
    this.dispatchEvent(
      new CustomEvent("lustrous-toggle", {
        detail: { open: this.open },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private onActionsSlotChange(e: Event): void {
    this.hasActions = (e.target as HTMLSlotElement).assignedElements({ flatten: true }).length > 0;
  }

  protected override render() {
    const level = Math.min(6, Math.max(2, Math.trunc(Number(this.headingLevel) || 3)));
    return html`
      <div part="card" class="card">
        <div part="header" class=${this.hasActions ? "header has-actions" : "header"}>
          <div class="heading" role="heading" aria-level=${level}>
            <button
              part="toggle"
              class="toggle focus-ring state-layer"
              type="button"
              aria-expanded=${this.open ? "true" : "false"}
              aria-controls="body"
              @click=${() => this.toggle()}
            >
              <span class="title">
                ${this.icon ? html`<span class="title-icon">${renderIcon(this.icon, "s")}</span>` : nothing}
                <slot name="heading">${this.heading}</slot>
              </span>
              ${this.badge
                ? html`<lustrous-badge part="badge" class="badge" tone=${this.badgeTone}>${this.badge}</lustrous-badge>`
                : nothing}
              ${this.subtitle ? html`<span class="subtitle">${this.subtitle}</span>` : nothing}
              <span class="chevron">${renderChevron(this.open, "s")}</span>
            </button>
          </div>
          <div class="actions"><slot name="actions" @slotchange=${this.onActionsSlotChange}></slot></div>
        </div>
        <div part="body" class="body" id="body" ?hidden=${!this.open}><slot></slot></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-collapsible-card": LustrousCollapsibleCard;
  }
}
