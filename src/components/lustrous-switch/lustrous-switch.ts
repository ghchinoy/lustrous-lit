import { css, html, nothing, type PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { lustrousBase, lustrousType } from "../../theme/theme.js";
import { LustrousCheckBase } from "../lustrous-checkbox/check-base.js";
import { renderIcon, type LustrousIconName } from "../lustrous-icon/lustrous-icon.js";

export type LustrousSwitchSize = "m" | "s";

/**
 * `<lustrous-switch>` — Form-associated binary toggle control (`role="switch"`).
 *
 * - Sizes: `m` (52×32, default) and `s` (32×20), both maintaining a minimum 44×44px touch target.
 * - Optional `icon` and `off-icon` thumb glyphs (rendered at size `m`).
 * - Supports slotted label rows with `supporting-text`, standalone usage via `aria-label`,
 *   `<fieldset disabled>`, form reset, and `forced-colors: active`.
 *
 * @slot - Optional visible label text.
 * @fires lustrous-change - `CustomEvent<{ checked: boolean }>` after user interaction.
 * @fires change - Native-style `change` event (bubbles).
 * @csspart track - The switch `<button role="switch">` track.
 * @csspart thumb - The sliding thumb indicator.
 * @csspart label - The slotted label and supporting-text container.
 */
@customElement("lustrous-switch")
export class LustrousSwitch extends LustrousCheckBase {
  static override styles = [
    lustrousBase,
    css`
      :host {
        display: inline-flex;
        vertical-align: middle;
        -webkit-tap-highlight-color: transparent;
      }
      :host([data-has-label]) {
        display: flex;
      }
      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--lustrous-space-l);
        width: 100%;
        min-height: 44px;
      }
      .text {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-width: 0;
        cursor: pointer;
        color: var(--lustrous-color-on-surface);
        ${lustrousType("body-medium")}
      }
      .supporting {
        color: var(--lustrous-color-on-surface-variant);
        ${lustrousType("body-small")}
      }

      .track {
        all: unset;
        box-sizing: border-box;
        position: relative;
        display: inline-flex;
        flex-shrink: 0;
        width: var(--_w);
        height: var(--_h);
        border: 2px solid var(--lustrous-color-outline);
        border-radius: var(--lustrous-radius-full);
        background-color: var(--lustrous-color-surface-dim);
        color: var(--lustrous-color-on-surface);
        cursor: pointer;
        transition:
          background-color 180ms cubic-bezier(0.2, 0, 0, 1),
          border-color 180ms cubic-bezier(0.2, 0, 0, 1);
      }
      /* Enforce minimum 44×44px interactive touch target across all sizes. */
      .track::after {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100%;
        height: 100%;
        min-width: 44px;
        min-height: 44px;
        transform: translate(-50%, -50%);
      }
      .size-m {
        --_w: 52px;
        --_h: 32px;
        --_layer: 40px;
        --_shift: 20px;
        --_thumb: 16px;
        --_thumb-on: 24px;
      }
      .size-s {
        --_w: 32px;
        --_h: 20px;
        --_layer: 28px;
        --_shift: 12px;
        --_thumb: 12px;
        --_thumb-on: 16px;
      }
      .track[aria-checked="true"] {
        border-color: transparent;
        background-color: var(--lustrous-color-accent);
      }

      .layer {
        position: absolute;
        top: 50%;
        inset-inline-start: -6px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: var(--_layer);
        height: var(--_layer);
        border-radius: var(--lustrous-radius-full);
        transform: translateY(-50%) translateX(0);
        transition:
          transform 180ms cubic-bezier(0.2, 0, 0, 1),
          background-color 150ms ease;
        pointer-events: none;
      }
      .track[aria-checked="true"] .layer {
        transform: translateY(-50%) translateX(var(--_shift));
      }
      .track[aria-checked="true"]:dir(rtl) .layer {
        transform: translateY(-50%) translateX(calc(-1 * var(--_shift)));
      }
      .track:hover:not(:disabled) .layer {
        background-color: var(--lustrous-color-state-hover);
      }
      .track:focus-visible:not(:hover):not(:disabled) .layer {
        background-color: var(--lustrous-color-state-focus);
      }
      .track:active:not(:disabled) .layer {
        background-color: var(--lustrous-color-state-pressed);
      }

      .thumb {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        width: var(--_thumb);
        height: var(--_thumb);
        border-radius: var(--lustrous-radius-full);
        background-color: var(--lustrous-color-on-surface-variant);
        color: var(--lustrous-color-surface);
        transition:
          width 180ms cubic-bezier(0.2, 0, 0, 1),
          height 180ms cubic-bezier(0.2, 0, 0, 1),
          background-color 180ms cubic-bezier(0.2, 0, 0, 1),
          color 180ms cubic-bezier(0.2, 0, 0, 1);
      }
      .thumb.large {
        width: var(--_thumb-on);
        height: var(--_thumb-on);
      }
      .track[aria-checked="true"] .thumb {
        background-color: var(--lustrous-color-on-accent);
        color: var(--lustrous-color-accent);
      }

      .track:focus-visible {
        outline: 2.5px solid var(--lustrous-color-on-surface);
        outline-offset: 2px;
      }

      .track:disabled {
        cursor: default;
        border-color: var(--lustrous-color-state-disabled);
        background-color: transparent;
      }
      .track:disabled .thumb {
        background-color: var(--lustrous-color-state-disabled-label);
        color: var(--lustrous-color-surface);
      }
      .track:disabled[aria-checked="true"] {
        border-color: transparent;
        background-color: var(--lustrous-color-state-disabled);
      }
      .track:disabled[aria-checked="true"] .thumb {
        background-color: var(--lustrous-color-surface);
        color: var(--lustrous-color-state-disabled-label);
      }
      .is-disabled .text,
      .is-disabled .supporting {
        cursor: default;
        color: var(--lustrous-color-state-disabled-label);
      }

      @media (forced-colors: active) {
        .track {
          border-color: ButtonText;
          background-color: Canvas;
        }
        .track[aria-checked="true"] {
          border-color: Highlight;
          background-color: Canvas;
        }
        .thumb {
          border: 1px solid ButtonText;
          background-color: ButtonText;
          color: Canvas;
          forced-color-adjust: none;
        }
        .track[aria-checked="true"] .thumb {
          border-color: Highlight;
          background-color: Highlight;
          color: HighlightText;
        }
        .track:disabled {
          border-color: GrayText;
          background-color: Canvas;
        }
        .track:disabled .thumb,
        .track:disabled[aria-checked="true"] .thumb {
          border-color: GrayText;
          background-color: GrayText;
          color: Canvas;
        }
        .track:focus-visible {
          outline-color: Highlight;
        }
        .is-disabled .text,
        .is-disabled .supporting {
          color: GrayText;
        }
      }
    `,
  ];

  /** Track size (`m` 52×32 or `s` 32×20). @default "m" */
  @property({ reflect: true }) size: LustrousSwitchSize = "m";
  /** Thumb icon shown when checked (size `m` only). */
  @property({ reflect: true }) icon?: LustrousIconName;
  /** Thumb icon shown when unchecked (size `m` only; expands resting thumb to 24px). */
  @property({ reflect: true, attribute: "off-icon" }) offIcon?: LustrousIconName;

  @query("button") private track!: HTMLButtonElement;

  protected override get validationAnchor(): HTMLElement | undefined {
    return this.track ?? undefined;
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    this.toggleAttribute("data-has-label", this.hasLabel);
    this.toggleAttribute("data-disabled", this.isDisabled);
  }

  private onTrackClick() {
    if (!this.isDisabled) this.toggleFromUser();
  }

  private onLabelClick() {
    if (this.isDisabled) return;
    this.track.focus();
    this.toggleFromUser();
  }

  protected override render() {
    const canShowIcons = this.size === "m";
    const iconName = canShowIcons ? (this.checked ? this.icon : this.offIcon) : undefined;
    const large = this.checked || (canShowIcons && !!this.offIcon);
    const labelId = `${this.uid}-label`;
    const descId = `${this.uid}-desc`;

    return html`<div
      class="${this.hasLabel ? "row" : ""} ${this.isDisabled ? "is-disabled" : ""}"
      role=${this.hasLabel && this.isDisabled ? "group" : nothing}
      aria-disabled=${this.hasLabel && this.isDisabled ? "true" : nothing}
    >
      <span part="label" class="text" ?hidden=${!this.hasLabel} @click=${this.onLabelClick}>
        <span id=${labelId}><slot @slotchange=${this.onSlotChange}></slot></span>
        ${this.supportingText ? html`<span class="supporting" id=${descId}>${this.supportingText}</span>` : nothing}
      </span>
      <button
        part="track"
        class="track size-${this.size}"
        type="button"
        role="switch"
        aria-checked=${this.checked ? "true" : "false"}
        aria-label=${this.label || nothing}
        aria-labelledby=${!this.label && this.hasLabel ? labelId : nothing}
        aria-describedby=${this.supportingText ? descId : nothing}
        ?disabled=${this.isDisabled}
        @click=${this.onTrackClick}
      >
        <span class="layer">
          <span part="thumb" class="thumb ${large ? "large" : ""}">${iconName ? renderIcon(iconName, "xs") : nothing}</span>
        </span>
      </button>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-switch": LustrousSwitch;
  }
}
