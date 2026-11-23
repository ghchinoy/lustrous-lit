import { css, html, nothing, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { attrRules, toCss } from "../../internal/style-gen.js";
import "../../theme/events.js";
import { getLustrousLabels } from "../../theme/labels.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { lustrousBase, lustrousFocusRing, lustrousStateLayer, lustrousType } from "../../theme/theme.js";
import { radius, type LustrousRadiusToken } from "../../theme/tokens.js";
import "../lustrous-badge/lustrous-badge.js";
import "../lustrous-button/lustrous-button.js";
import { renderIcon, type LustrousIconName } from "../lustrous-icon/lustrous-icon.js";
import "../lustrous-icon-button/lustrous-icon-button.js";

export type LustrousBannerVariant = "overlay" | "inline" | "info" | "positive" | "warning" | "error";
export type LustrousBannerLayout = "auto" | "column" | "row";
export type LustrousBannerMediaPlacement = "separate" | "inline-title";
export type LustrousBannerAction = "primary" | "secondary";
export type LustrousBannerActionEvent = CustomEvent<{ action: LustrousBannerAction }>;

/**
 * `<lustrous-banner>` — Informational, promotional, or status banner rendered as a named `<section>` region.
 *
 * - Variants: `overlay` (default, elevated `surface-bright`), `inline` (`surface-dim`), `info`, `positive`, `warning`, `error`
 * - Layout: `auto` (single row when heading-only without actions, column otherwise), `row`, or `column`
 * - Optional leading `icon` or `image-url`, trailing `badge` in the title row, `primary-action` / `secondary-action`, and `dismissible` close button.
 *
 * @slot - Extra content rendered beneath the description.
 * @fires lustrous-action - `CustomEvent<{ action: "primary" | "secondary" }>`.
 * @fires lustrous-click - `CustomEvent<void>` when `clickable` is set and the banner surface is activated.
 * @fires lustrous-close-request - `CustomEvent<{ reason: "dismiss" }>` (cancelable; hides the banner unless canceled).
 * @csspart banner - The `<section>` banner container.
 * @csspart surface - The interactive `<button>` surface when `clickable` is set.
 */
@customElement("lustrous-banner")
export class LustrousBanner extends LustrousElement {
  static override styles = [
    lustrousBase,
    lustrousFocusRing,
    lustrousStateLayer,
    css`
      :host {
        display: block;
      }
      .banner {
        box-sizing: border-box;
        position: relative;
        display: flex;
        flex-direction: column;
        gap: var(--lustrous-space-l);
        width: 100%;
        padding: var(--lustrous-space-xl);
        border-radius: var(--lustrous-radius-xl);
        background-color: var(--lustrous-color-surface-bright);
        color: var(--lustrous-color-on-surface);
        box-shadow: var(--lustrous-elevation-level1);
        --lustrous-text-muted: var(--lustrous-color-on-surface-variant);
      }
      :host([variant="inline"]) .banner {
        background-color: var(--lustrous-color-surface-dim);
        box-shadow: none;
      }
      :host([variant="info"]) .banner {
        background-color: var(--lustrous-color-primary-container);
        color: var(--lustrous-color-on-primary-container);
        --lustrous-text-muted: var(--lustrous-color-on-primary-container);
        box-shadow: none;
      }
      :host([variant="positive"]) .banner {
        background-color: var(--lustrous-color-positive-container);
        color: var(--lustrous-color-on-positive-container);
        --lustrous-text-muted: var(--lustrous-color-on-positive-container);
        box-shadow: none;
      }
      :host([variant="warning"]) .banner {
        background-color: var(--lustrous-color-warning-container);
        color: var(--lustrous-color-on-warning-container);
        --lustrous-text-muted: var(--lustrous-color-on-warning-container);
        box-shadow: none;
      }
      :host([variant="error"]) .banner {
        background-color: var(--lustrous-color-error-container);
        color: var(--lustrous-color-on-error-container);
        --lustrous-text-muted: var(--lustrous-color-on-error-container);
        box-shadow: none;
      }
      .banner.row {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
      .top {
        display: flex;
        align-items: flex-start;
        gap: var(--lustrous-space-l);
      }
      .row .top {
        align-items: center;
        flex: 1 1 auto;
        min-width: 0;
      }
      .media {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .media img {
        display: block;
        border-radius: var(--lustrous-radius-m);
        object-fit: cover;
      }
      :host([image-border-radius="none"]) .media img {
        object-fit: contain;
      }
      .text {
        display: flex;
        flex-direction: column;
        gap: var(--lustrous-space-xs);
        flex: 1 1 auto;
        min-width: 0;
      }
      .column.dismissible .text {
        padding-inline-end: 40px;
      }
      .title-row {
        display: flex;
        align-items: center;
        gap: var(--lustrous-space-s);
      }
      .title-badge {
        margin-inline-start: auto;
        flex-shrink: 0;
      }
      .heading {
        margin: 0;
        ${lustrousType("body-medium-emphasized")}
      }
      .description {
        margin: 0;
        ${lustrousType("body-medium")}
      }
      .has-heading .description {
        color: var(--lustrous-text-muted);
      }
      .actions {
        display: flex;
        align-items: center;
        gap: var(--lustrous-space-s);
        flex-shrink: 0;
        align-self: flex-end;
      }
      .row .actions,
      .row .close {
        align-self: center;
      }
      .close {
        flex-shrink: 0;
      }
      .column .close {
        position: absolute;
        top: var(--lustrous-space-m);
        inset-inline-end: var(--lustrous-space-m);
      }
      .banner.clickable {
        padding: 0;
        gap: 0;
      }
      .surface-btn {
        all: unset;
        box-sizing: border-box;
        position: relative;
        isolation: isolate;
        display: flex;
        flex-direction: column;
        gap: var(--lustrous-space-l);
        width: 100%;
        padding: var(--lustrous-space-xl);
        border-radius: inherit;
        color: inherit;
        text-align: start;
        cursor: pointer;
      }
      .banner.clickable.row .surface-btn {
        flex-direction: row;
        align-items: center;
      }
      .banner.clickable.row.dismissible .surface-btn {
        padding-inline-end: 52px;
      }
      .banner.clickable.row .close {
        position: absolute;
        top: 50%;
        inset-inline-end: var(--lustrous-space-m);
        transform: translateY(-50%);
      }
      @media (forced-colors: active) {
        .banner {
          border: 1px solid CanvasText;
        }
        .surface-btn:focus-visible {
          outline-color: Highlight;
        }
      }
    `,
    toCss(
      attrRules(
        "image-border-radius",
        Object.fromEntries(Object.keys(radius).map((k) => [k, `border-radius: var(--lustrous-radius-${k});`])),
        ".media img",
      ),
    ),
  ];

  /** Banner heading; also provides the `<section>` region's accessible name. */
  @property() heading = "";
  /** ARIA heading level when `heading` is set. @default 3 */
  @property({ type: Number, attribute: "heading-level" }) headingLevel = 3;
  /** Supporting body copy. */
  @property() description = "";
  /** Optional leading icon. */
  @property({ reflect: true }) icon?: LustrousIconName;
  /** Optional leading image URL. */
  @property({ attribute: "image-url" }) imageUrl = "";
  /** Explicit image width/height in px (defaults to `72` for `separate`, `24` for `inline-title`). */
  @property({ type: Number, attribute: "image-size" }) imageSize?: number;
  /** Alternative text for `image-url`. */
  @property({ attribute: "image-alt" }) imageAlt = "";
  /** Border radius token for `image-url` (`none` also switches `object-fit` to `contain`). */
  @property({ reflect: true, attribute: "image-border-radius" }) imageBorderRadius?: LustrousRadiusToken;
  /** Optional pill badge displayed at the trailing edge of the heading row. */
  @property() badge = "";
  /** Placement of leading icon or image. @default "separate" */
  @property({ reflect: true, attribute: "media-placement" }) mediaPlacement: LustrousBannerMediaPlacement = "separate";
  /** Visual surface treatment. @default "overlay" */
  @property({ reflect: true }) variant: LustrousBannerVariant = "overlay";
  /** Flex layout mode. @default "auto" */
  @property({ reflect: true }) layout: LustrousBannerLayout = "auto";
  /** Primary action button label. */
  @property({ attribute: "primary-action" }) primaryAction = "";
  /** Secondary action button label. */
  @property({ attribute: "secondary-action" }) secondaryAction = "";
  /** Makes the entire banner surface a keyboard-operable `<button>` firing `lustrous-click`. */
  @property({ type: Boolean, reflect: true }) clickable = false;
  /** Shows a dismiss icon button. */
  @property({ type: Boolean, reflect: true }) dismissible = false;
  /** Accessible label for the dismiss button (defaults to `getLustrousLabels().dismiss`). */
  @property({ attribute: "close-label" }) closeLabel = "";

  @state() private hasSlotted = false;

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.childNodes) {
      this.hasSlotted = [...this.childNodes].some(
        (n) => n.nodeType === 1 || (n.nodeType === 3 && n.textContent!.trim() !== ""),
      );
    }
  }

  private onAction(action: LustrousBannerAction) {
    this.dispatchEvent(
      new CustomEvent("lustrous-action", {
        detail: { action },
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
  }

  private onSurfaceClick() {
    this.dispatchEvent(new CustomEvent("lustrous-click", { bubbles: true, composed: true }));
  }

  private onClose() {
    const ev = new CustomEvent("lustrous-close-request", {
      detail: { reason: "dismiss" },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    if (this.dispatchEvent(ev)) this.hidden = true;
  }

  private renderMedia(inline: boolean): TemplateResult | typeof nothing {
    if (this.imageUrl) {
      const size = this.imageSize ?? (inline ? 24 : 72);
      return html`<img src=${this.imageUrl} alt=${this.imageAlt} width=${size} height=${size} />`;
    }
    if (this.icon) return renderIcon(this.icon, inline ? "m" : "l");
    return nothing;
  }

  protected override render() {
    const labels = getLustrousLabels();
    const hasActions = !!(this.primaryAction || this.secondaryAction);
    const row = this.layout === "row" || (this.layout === "auto" && !this.description && !hasActions && !this.hasSlotted);
    const hasMedia = !!(this.icon || this.imageUrl);
    const separate = this.mediaPlacement === "separate" || row;
    const brightControls = this.variant !== "overlay";
    const cls = [
      "banner",
      row ? "row" : "column",
      this.dismissible ? "dismissible" : "",
      this.heading ? "has-heading" : "",
      this.clickable ? "clickable" : "",
    ]
      .filter(Boolean)
      .join(" ");

    const topContent = html`<div class="top">
      ${hasMedia && separate ? html`<span class="media">${this.renderMedia(false)}</span>` : nothing}
      <div class="text">
        ${this.heading || this.badge
          ? html`<div class="title-row">
              ${hasMedia && !separate ? html`<span class="media">${this.renderMedia(true)}</span>` : nothing}
              ${this.heading
                ? html`<div id="heading" class="heading" role="heading" aria-level=${this.headingLevel}>
                    ${this.heading}
                  </div>`
                : nothing}
              ${this.badge ? html`<lustrous-badge class="title-badge">${this.badge}</lustrous-badge>` : nothing}
            </div>`
          : nothing}
        ${this.description ? html`<p id="description" class="description">${this.description}</p>` : nothing}
        <slot
          @slotchange=${(e: Event) => {
            this.hasSlotted = (e.target as HTMLSlotElement).assignedNodes().length > 0;
          }}
        ></slot>
      </div>
    </div>`;

    const dismissButton = this.dismissible
      ? html`<lustrous-icon-button
          class="close"
          size="s"
          icon="close"
          variant=${brightControls ? "bright" : "tonal"}
          aria-label=${this.closeLabel || labels.dismiss}
          @click=${this.onClose}
        ></lustrous-icon-button>`
      : nothing;

    if (this.clickable) {
      const hasVisibleText = Boolean(this.heading || this.description || this.hasSlotted);
      return html`<section part="banner" class=${cls} aria-label=${this.heading || labels.notificationBanner}>
        <button
          type="button"
          part="surface"
          class="surface-btn state-layer focus-ring"
          aria-label=${hasVisibleText ? nothing : labels.notificationBanner}
          @click=${this.onSurfaceClick}
        >
          ${topContent}
        </button>
        ${dismissButton}
      </section>`;
    }

    return html`<section part="banner" class=${cls} aria-label=${this.heading || labels.notificationBanner}>
      ${topContent}
      ${hasActions
        ? html`<div class="actions">
            ${this.secondaryAction
              ? html`<lustrous-button variant="on-surface" @click=${() => this.onAction("secondary")}
                  >${this.secondaryAction}</lustrous-button
                >`
              : nothing}
            ${this.primaryAction
              ? html`<lustrous-button
                  variant=${brightControls ? "bright" : "tonal"}
                  @click=${() => this.onAction("primary")}
                  >${this.primaryAction}</lustrous-button
                >`
              : nothing}
          </div>`
        : nothing}
      ${dismissButton}
    </section>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-banner": LustrousBanner;
  }
}
