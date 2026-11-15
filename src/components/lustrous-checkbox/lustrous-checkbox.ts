import { css, html, nothing, svg, unsafeCSS, type PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { VISUALLY_HIDDEN } from "../../internal/a11y.js";
import { lustrousBase, lustrousType } from "../../theme/theme.js";
import { LustrousCheckBase } from "./check-base.js";

export { LustrousCheckBase } from "./check-base.js";

const CHECK = svg`<polyline points="5.5 12.5 10 17 18.5 7.5" />`;
const DASH = svg`<line x1="6.5" y1="12" x2="17.5" y2="12" />`;

/**
 * `<lustrous-checkbox>` — Form-associated checkbox supporting standalone (`aria-label`)
 * and labelled row layouts, `indeterminate`, `supporting-text`, `required`, and `<fieldset disabled>`.
 *
 * @slot - Checkbox label text.
 * @fires lustrous-change - `CustomEvent<{ checked: boolean }>` after user interaction.
 * @csspart box - The 20px checkbox indicator.
 * @csspart label - The label container.
 */
@customElement("lustrous-checkbox")
export class LustrousCheckbox extends LustrousCheckBase {
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
      input {
        ${unsafeCSS(VISUALLY_HIDDEN)}
        opacity: 0;
      }
      label {
        position: relative;
        isolation: isolate;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        user-select: none;
      }
      .standalone {
        width: 44px;
        height: 44px;
      }
      .standalone .target {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: var(--lustrous-radius-full);
        transition: background-color 150ms ease-in-out;
      }
      .standalone:hover .target {
        background-color: var(--lustrous-color-state-hover);
      }
      .standalone:has(input:focus-visible) .target {
        background-color: var(--lustrous-color-state-focus);
      }
      .standalone:active .target {
        background-color: var(--lustrous-color-state-pressed);
      }
      .standalone:has(input:focus-visible) .target::before {
        content: "";
        position: absolute;
        inset: -4px;
        border: 2.5px solid var(--lustrous-color-on-surface);
        border-radius: inherit;
        pointer-events: none;
      }

      .row {
        justify-content: flex-start;
        gap: var(--lustrous-space-s);
        width: 100%;
        min-height: 44px;
        padding: var(--lustrous-space-s);
        border-radius: var(--lustrous-radius-m);
      }
      .row::after {
        content: "";
        position: absolute;
        inset: 0;
        z-index: -1;
        border-radius: inherit;
        background-color: var(--lustrous-color-state-hover);
        opacity: 0;
        transition: opacity 150ms ease-in-out;
        pointer-events: none;
      }
      .row:hover::after {
        opacity: 1;
      }
      .row:has(input:focus-visible)::after {
        background-color: var(--lustrous-color-state-focus);
        opacity: 1;
      }
      .row:active::after {
        background-color: var(--lustrous-color-state-pressed);
        opacity: 1;
      }
      .row:has(input:focus-visible) {
        outline: 2.5px solid currentColor;
        outline-offset: 2px;
      }
      .row .target {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 22px;
        height: 22px;
      }
      .text {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-width: 0;
        ${lustrousType("body-medium")}
      }
      .supporting {
        color: var(--lustrous-color-on-surface-variant);
        ${lustrousType("body-small")}
      }

      .box {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        border: 1.5px solid var(--lustrous-color-outline);
        border-radius: var(--lustrous-radius-s);
        background-color: transparent;
        color: var(--lustrous-color-on-accent);
        transition:
          background-color 150ms ease,
          border-color 150ms ease;
      }
      label:hover .box,
      label:has(input:focus-visible) .box {
        border-color: var(--lustrous-color-on-surface);
      }
      .box.on {
        border-color: var(--lustrous-color-accent);
        background-color: var(--lustrous-color-accent);
      }
      .box svg {
        width: 16px;
        height: 16px;
        fill: none;
        stroke: currentColor;
        stroke-width: 2.5;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      :host([data-disabled]) label {
        cursor: default;
        pointer-events: none;
        opacity: 0.38;
      }

      @media (forced-colors: active) {
        .box {
          border-color: ButtonText;
        }
        label:hover .box,
        .box.on {
          border-color: Highlight;
        }
        .box.on {
          background-color: Highlight;
          color: HighlightText;
        }
        :host([data-disabled]) .box,
        :host([data-disabled]) .box.on {
          border-color: GrayText;
        }
        :host([data-disabled]) .box.on {
          background-color: GrayText;
        }
        .standalone:has(input:focus-visible) .target::before {
          border-color: Highlight;
        }
        .row:has(input:focus-visible) {
          outline-color: Highlight;
        }
      }
    `,
  ];

  @property({ type: Boolean, reflect: true }) indeterminate = false;

  @query("input") private input!: HTMLInputElement;

  protected override get validationAnchor() {
    return this.input ?? undefined;
  }

  protected override toggleFromUser(): void {
    this.indeterminate = false;
    super.toggleFromUser();
  }

  private onInputChange() {
    this.indeterminate = false;
    this.checked = this.input.checked;
    this.afterUserChange();
  }

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    this.toggleAttribute("data-has-label", this.hasLabel);
    this.toggleAttribute("data-disabled", this.isDisabled);
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    this.input.checked = this.checked;
    this.input.indeterminate = this.indeterminate;
  }

  protected override render() {
    const on = this.checked || this.indeterminate;
    const describedBy = this.supportingText ? `${this.uid}-desc` : nothing;
    return html`<label class=${this.hasLabel ? "row" : "standalone"}>
      <input
        type="checkbox"
        .checked=${this.checked}
        ?disabled=${this.isDisabled}
        ?required=${this.required}
        aria-label=${this.label || nothing}
        aria-describedby=${describedBy}
        @change=${this.onInputChange}
      />
      <span class="target">
        <span part="box" class="box ${on ? "on" : ""}" aria-hidden="true">
          ${on ? html`<svg viewBox="0 0 24 24">${this.indeterminate ? DASH : CHECK}</svg>` : nothing}
        </span>
      </span>
      <span part="label" class="text" ?hidden=${!this.hasLabel}>
        <slot @slotchange=${this.onSlotChange}></slot>
        ${this.supportingText ? html`<span class="supporting" id="${this.uid}-desc">${this.supportingText}</span>` : nothing}
      </span>
    </label>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-checkbox": LustrousCheckbox;
  }
}
