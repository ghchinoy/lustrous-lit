import { css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { getLustrousLabels } from "../../theme/labels.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { lustrousBase, lustrousType } from "../../theme/theme.js";
import "../lustrous-button/lustrous-button.js";
import "../lustrous-icon-button/lustrous-icon-button.js";
import "../lustrous-modal/lustrous-modal.js";
import "../lustrous-popover/lustrous-popover.js";

export type LustrousDialogSize = "s" | "m" | "l";

/**
 * `<lustrous-dialog>` — Structured inline or `modal` dialog card built on `<lustrous-modal>`.
 *
 * - Sizes: `s` (320px), `m` (420px, default), `l` (560px).
 * - Supports `heading`, optional header close button (`dismissible` / `close-label` / `close-disabled`),
 *   scrolling body (`<slot>`), built-in `primary-action` / `secondary-action` buttons, or custom `<slot name="actions">`.
 * - In `modal` mode, wraps the card in `<lustrous-modal>` (`slot="trigger"`, scrim, focus trap, Escape/scrim close).
 *
 * @slot - Dialog body content.
 * @slot actions - Custom action buttons replacing built-in action buttons.
 * @slot trigger - Trigger element that opens the dialog on click (when `modal` is set).
 * @fires lustrous-action - `CustomEvent<{ action: "primary" | "secondary" }>` (cancelable).
 * @fires lustrous-close-request - `CustomEvent<{ reason: "escape" | "scrim" | "dismiss" }>` (cancelable).
 * @fires lustrous-toggle - `CustomEvent<{ open: boolean }>` when `modal` opens or closes.
 * @csspart card - The dialog card surface.
 * @csspart scroller - The inner scroll wrapper around heading, body, and actions.
 * @csspart heading - The `<h2>` heading element.
 * @csspart close-button - The optional header close button (`dismissible`).
 * @csspart body - The scrolling body container.
 * @csspart actions - The action row container.
 */
@customElement("lustrous-dialog")
export class LustrousDialog extends LustrousElement {
  static override styles = [
    lustrousBase,
    css`
      :host {
        display: block;
      }
      :host([modal]) {
        display: contents;
      }
      .card {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        width: 420px;
        max-width: calc(100vw - 32px);
        max-height: calc(100dvh - 64px);
        overflow: hidden;
        border: 1px solid var(--lustrous-color-outline-variant);
        border-radius: var(--lustrous-radius-2xl);
        background-color: var(--lustrous-color-surface-bright);
        color: var(--lustrous-color-on-surface);
        box-shadow: var(--lustrous-elevation-level2);
        outline: none;
      }
      :host([size="s"]) .card {
        width: 320px;
      }
      :host([size="l"]) .card {
        width: 560px;
      }
      .scroller {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
      }
      .scroller,
      .body {
        scrollbar-width: thin;
        scrollbar-color: var(--lustrous-color-surface-container-highest) transparent;
      }
      .heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--lustrous-space-m);
        flex-shrink: 0;
        padding: var(--lustrous-space-2xl) var(--lustrous-space-2xl) var(--lustrous-space-m);
      }
      h2 {
        margin: 0;
        min-width: 0;
        ${lustrousType("headline-small")}
      }
      .body {
        min-height: 0;
        overflow-y: auto;
        padding: 0 var(--lustrous-space-2xl);
        ${lustrousType("body-medium")}
      }
      .no-actions .body {
        padding-bottom: var(--lustrous-space-2xl);
      }
      @media (max-height: 400px) {
        .body {
          flex-shrink: 0;
        }
      }
      .actions {
        display: flex;
        flex-shrink: 0;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: var(--lustrous-space-s);
        padding: var(--lustrous-space-l) var(--lustrous-space-2xl) var(--lustrous-space-2xl);
      }
      .actions[hidden] {
        display: none;
      }
      @media (forced-colors: active) {
        .card {
          border: 1px solid CanvasText;
        }
        .scroller,
        .body {
          scrollbar-color: auto;
        }
      }
    `,
  ];

  @property() heading = "";
  @property() label = "";
  @property({ reflect: true }) size: LustrousDialogSize = "m";
  @property({ attribute: "primary-action" }) primaryAction = "";
  @property({ attribute: "secondary-action" }) secondaryAction = "";
  @property({ type: Boolean, attribute: "primary-disabled" }) primaryDisabled = false;
  @property({ type: Boolean, attribute: "secondary-disabled" }) secondaryDisabled = false;
  @property({ type: Boolean, reflect: true }) dismissible = false;
  @property({ attribute: "close-label" }) closeLabel = "";
  @property({ type: Boolean, attribute: "close-disabled" }) closeDisabled = false;
  @property({ attribute: false }) onClose?: (e: MouseEvent) => void;
  @property({ type: Boolean, reflect: true }) modal = false;
  @property({ attribute: false }) returnFocus?: HTMLElement | null;
  @property({ attribute: false }) initialFocus?: HTMLElement | null;
  @property({ type: Boolean, reflect: true }) open = false;

  @state() private hasCustomActions = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this.hasCustomActions = !!this.querySelector(":scope > [slot=actions]");
  }

  show(): void {
    this.open = true;
  }

  hide(): void {
    this.open = false;
  }

  private onAction(action: "primary" | "secondary"): void {
    const ev = new CustomEvent("lustrous-action", {
      detail: { action },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    if (this.dispatchEvent(ev) && this.modal) this.open = false;
  }

  private onCloseClick(e: MouseEvent): void {
    this.onClose?.(e);
    const ev = new CustomEvent("lustrous-close-request", {
      detail: { reason: "dismiss" },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    if (this.dispatchEvent(ev) && this.modal) this.open = false;
  }

  private onModalToggle(e: CustomEvent<{ open: boolean }>): void {
    if (e.target !== e.currentTarget) return;
    e.stopPropagation();
    if (this.open !== e.detail.open) this.open = e.detail.open;
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    if (this.modal && changed.has("open") && changed.get("open") !== undefined) {
      this.dispatchEvent(
        new CustomEvent("lustrous-toggle", { detail: { open: this.open }, bubbles: true, composed: true }),
      );
    }
  }

  private renderCard(): TemplateResult {
    const builtIn = this.primaryAction || this.secondaryAction;
    const hasActions = Boolean(builtIn) || this.hasCustomActions;
    const showClose = this.dismissible || Boolean(this.onClose);
    const nonModalLabelledBy = !this.modal && this.heading ? "heading" : nothing;
    const nonModalLabel = !this.modal && !this.heading ? this.label || "Dialog" : nothing;
    return html`<div
      part="card"
      class="card ${hasActions ? "" : "no-actions"}"
      role=${this.modal ? nothing : "dialog"}
      aria-labelledby=${nonModalLabelledBy}
      aria-label=${nonModalLabel}
    >
      <div part="scroller" class="scroller">
        <div class="heading">
          <h2 part="heading" id="heading">${this.heading}</h2>
          ${showClose
            ? html`<lustrous-icon-button
                part="close-button"
                icon="close"
                size="s"
                variant="on-surface"
                ?disabled=${this.closeDisabled}
                aria-label=${this.closeLabel || getLustrousLabels().close}
                @click=${this.onCloseClick}
              ></lustrous-icon-button>`
            : nothing}
        </div>
        <div part="body" class="body"><slot></slot></div>
        <div part="actions" class="actions" ?hidden=${!hasActions}>
          <slot
            name="actions"
            @slotchange=${(e: Event) => {
              this.hasCustomActions = (e.target as HTMLSlotElement).assignedElements().length > 0;
            }}
          >
            ${this.secondaryAction
              ? html`<lustrous-button
                  variant="on-surface"
                  ?disabled=${this.secondaryDisabled}
                  @click=${() => this.onAction("secondary")}
                  >${this.secondaryAction}</lustrous-button
                >`
              : nothing}
            ${this.primaryAction
              ? html`<lustrous-button
                  variant="accent"
                  ?disabled=${this.primaryDisabled}
                  @click=${() => this.onAction("primary")}
                  >${this.primaryAction}</lustrous-button
                >`
              : nothing}
          </slot>
        </div>
      </div>
    </div>`;
  }

  protected override render() {
    if (!this.modal) return this.renderCard();
    return html`<lustrous-modal
      .open=${this.open}
      .returnFocus=${this.returnFocus}
      .initialFocus=${this.initialFocus}
      label=${this.heading || this.label || "Dialog"}
      @lustrous-toggle=${this.onModalToggle}
    >
      <slot name="trigger" slot="trigger"></slot>
      ${this.renderCard()}
    </lustrous-modal>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-dialog": LustrousDialog;
  }
}
