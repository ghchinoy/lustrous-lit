import { css, html, nothing, unsafeCSS, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { live } from "lit/directives/live.js";
import { attrRules } from "../../internal/style-gen.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { lustrousBase, lustrousType } from "../../theme/theme.js";
import { radius, type LustrousRadiusToken } from "../../theme/tokens.js";
import { renderIcon, type LustrousIconName } from "../lustrous-icon/lustrous-icon.js";
import "../lustrous-spinner/lustrous-spinner.js";

export type LustrousTextInputSize = "m" | "s";
export type LustrousValidationState = "default" | "validating" | "success" | "error";

let uid = 0;

/** Horizontal & vertical overflow edge-fade masks for scrollable text controls. */
const H_BOTH = "linear-gradient(to right, transparent 0, black 24px, black calc(100% - 24px), transparent 100%)";
const hMask = (dir: string, start: boolean) =>
  start
    ? `linear-gradient(to ${dir}, transparent 0, black 24px, black 100%)`
    : `linear-gradient(to ${dir}, black 0, black calc(100% - 24px), transparent 100%)`;
const vMask = (fade: string, side: string) =>
  `linear-gradient(to bottom, ${fade}), linear-gradient(to ${side}, black 12px, transparent 12px)`;
const V_BOTH = "transparent 0, black 18px, black calc(100% - 18px), transparent 100%";
const V_END = "black 0, black calc(100% - 18px), transparent 100%";
const V_START = "transparent 0, black 18px, black 100%";

const scrimCss = `
.control.scrim-x-both { mask-image: ${H_BOTH}; }
.control.scrim-x-end { mask-image: ${hMask("right", false)}; }
.control.scrim-x-end:dir(rtl) { mask-image: ${hMask("left", false)}; }
.control.scrim-x-start { mask-image: ${hMask("right", true)}; }
.control.scrim-x-start:dir(rtl) { mask-image: ${hMask("left", true)}; }
.control.scrim-y-both { mask-image: ${vMask(V_BOTH, "left")}; }
.control.scrim-y-both:dir(rtl) { mask-image: ${vMask(V_BOTH, "right")}; }
.control.scrim-y-end { mask-image: ${vMask(V_END, "left")}; }
.control.scrim-y-end:dir(rtl) { mask-image: ${vMask(V_END, "right")}; }
.control.scrim-y-start { mask-image: ${vMask(V_START, "left")}; }
.control.scrim-y-start:dir(rtl) { mask-image: ${vMask(V_START, "right")}; }
`;

/**
 * `<lustrous-text-input>` — Form-associated single-line outlined text field.
 *
 * - Static `label` and optional `caption` (`caption` attribute or `slot="caption"`) above the frame;
 *   unlabelled fields derive their accessible name from `aria-label`.
 * - Sizes: `m` (44px, default) and `s` (36px), default `border-radius="m"` (10px),
 *   resting `outline` border (≥ 3:1 WCAG 1.4.11 contrast) and 2px `primary` focus border.
 * - Supports `leading-icon` / `slot="leading"`, `trailing-icon` / `slot="trailing"`,
 *   `leading-text` / `trailing-text` affixes, `supporting-text`, `error`,
 *   `validation-state="validating | success | error"` (with `<lustrous-spinner size="xs">`),
 *   `character-count` + `maxlength`, overflow edge fades, native constraint validation, and form reset.
 *
 * @slot leading - Custom leading content replacing `leading-icon`.
 * @slot trailing - Trailing action (e.g. `<lustrous-icon-button size="s">`), replacing `trailing-icon` and status indicators.
 * @slot caption - Rich caption content at the end of the header row.
 * @fires input - Native `input` event on each edit (composed).
 * @fires change - Native-style `change` event on commit (bubbles).
 * @csspart header - The label and caption row.
 * @csspart label - The `<label>` element.
 * @csspart caption - The caption container.
 * @csspart field - The outlined field frame.
 * @csspart input - The native `<input>` element.
 * @csspart leading - The leading icon/slot container.
 * @csspart trailing - The trailing icon/status container.
 * @csspart supporting - The supporting text / error / character count row.
 * @csspart counter - The character counter.
 */
@customElement("lustrous-text-input")
export class LustrousTextInput extends LustrousElement {
  static formAssociated = true;
  static override shadowRootOptions: ShadowRootInit = { ...LustrousElement.shadowRootOptions, delegatesFocus: true };

  static override styles = [
    lustrousBase,
    css`
      :host {
        display: block;
        min-width: 0;
      }
      [hidden] {
        display: none !important;
      }
      .root {
        display: flex;
        flex-direction: column;
        gap: var(--lustrous-space-xs);
        width: 100%;
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--lustrous-space-s);
        color: var(--lustrous-color-on-surface-variant);
        ${lustrousType("body-small")}
      }
      label {
        flex-grow: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--lustrous-color-on-surface);
        ${lustrousType("body-small-emphasized")}
      }
      .disabled label,
      .disabled .caption {
        color: var(--lustrous-color-state-disabled-label);
      }
      .required {
        margin-inline-start: var(--lustrous-space-xs);
        color: var(--lustrous-color-error);
      }
      .caption {
        text-align: end;
        white-space: nowrap;
      }

      .field {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
        min-height: 44px;
        padding: 0 var(--lustrous-space-xs);
        border: 1px solid var(--lustrous-color-outline);
        border-radius: var(--lustrous-radius-m);
        background-color: var(--lustrous-color-surface);
        color: var(--lustrous-color-on-surface);
        cursor: text;
        transition:
          border-color 150ms cubic-bezier(0.2, 0, 0, 1),
          background-color 150ms cubic-bezier(0.2, 0, 0, 1);
      }
      .size-s .field {
        min-height: 36px;
      }
      .root:not(.focused):not(.error):not(.disabled):not(.readonly) .field:hover {
        border-color: var(--lustrous-color-on-surface);
      }
      .focused:not(.error):not(.disabled):not(.readonly) .field {
        border-color: var(--lustrous-color-primary);
        outline: 2px solid var(--lustrous-color-primary);
        outline-offset: -2px;
      }
      .focused.success:not(.error):not(.disabled):not(.readonly) .field {
        border-color: var(--lustrous-color-positive);
        outline: 2px solid var(--lustrous-color-positive);
        outline-offset: -2px;
      }
      .error:not(.disabled):not(.readonly) .field {
        border-color: var(--lustrous-color-error);
      }
      .focused.error:not(.disabled):not(.readonly) .field {
        border-color: var(--lustrous-color-error);
        outline: 2px solid var(--lustrous-color-error);
        outline-offset: -2px;
      }
      .readonly .field {
        border-color: var(--lustrous-color-outline-variant);
        background-color: var(--lustrous-color-surface-dim);
        cursor: default;
      }
      .disabled .field {
        border-color: var(--lustrous-color-state-disabled);
        background-color: var(--lustrous-color-surface-dim);
        color: var(--lustrous-color-state-disabled-label);
        cursor: not-allowed;
      }

      .slot {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
      }
      .size-s .slot {
        width: 28px;
        height: 28px;
      }
      .muted {
        color: var(--lustrous-color-on-surface-variant);
      }
      .disabled .slot {
        color: var(--lustrous-color-state-disabled-label);
      }
      .error:not(.disabled) .slot.trailing.muted {
        color: var(--lustrous-color-error);
      }
      .slot.success {
        color: var(--lustrous-color-positive);
      }
      .disabled .slot.success {
        color: var(--lustrous-color-state-disabled-label);
      }

      .affix {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        height: 36px;
        color: var(--lustrous-color-on-surface-variant);
        white-space: nowrap;
        ${lustrousType("body-medium")}
      }
      .size-s .affix {
        height: 28px;
        ${lustrousType("body-small")}
      }
      .disabled .affix {
        color: var(--lustrous-color-state-disabled-label);
      }
      .affix.leading-text {
        padding-inline-start: var(--lustrous-space-s);
      }
      .affix.trailing-text {
        padding-inline-end: var(--lustrous-space-s);
      }
      .has-leading-icon .affix.leading-text,
      .has-trailing-slot .affix.trailing-text {
        padding-inline: 0;
      }

      .control-wrap {
        display: flex;
        flex-grow: 1;
        align-items: center;
        min-width: 0;
        height: 32px;
        padding-inline: var(--lustrous-space-s);
        ${lustrousType("body-medium")}
      }
      .size-s .control-wrap {
        height: 26px;
        ${lustrousType("body-small")}
      }
      .control {
        all: unset;
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        min-width: 0;
        color: inherit;
        caret-color: var(--lustrous-color-on-surface);
      }
      .error .control {
        caret-color: var(--lustrous-color-error);
      }
      .control::placeholder {
        color: var(--lustrous-color-on-surface-variant);
        opacity: 1;
      }
      .control::-webkit-search-cancel-button {
        display: none;
      }
      .disabled .control,
      .disabled .control::placeholder {
        cursor: not-allowed;
        color: var(--lustrous-color-state-disabled-label);
      }

      .supporting {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--lustrous-space-s);
        color: var(--lustrous-color-on-surface-variant);
        ${lustrousType("body-small")}
      }
      .message {
        flex-grow: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .message.is-error {
        color: var(--lustrous-color-error);
      }
      .counter {
        flex-shrink: 0;
        margin-inline-start: auto;
        text-align: end;
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
      }
      .counter.over {
        color: var(--lustrous-color-error);
      }

      @media (forced-colors: active) {
        .field,
        .readonly .field {
          border-color: ButtonBorder;
          background-color: Field;
          color: FieldText;
        }
        .root:not(.focused):not(.error):not(.disabled):not(.readonly) .field:hover,
        .focused:not(.disabled):not(.readonly) .field,
        .error:not(.disabled):not(.readonly) .field {
          border-color: Highlight;
        }
        .focused:not(.disabled):not(.readonly) .field {
          outline-color: Highlight;
        }
        .disabled .field {
          border-color: GrayText;
          color: GrayText;
        }
        .control {
          caret-color: FieldText;
        }
        .disabled .control,
        .disabled label,
        .disabled .caption {
          color: GrayText;
        }
      }
    `,
    unsafeCSS(scrimCss),
    unsafeCSS(
      attrRules(
        "border-radius",
        Object.fromEntries(Object.keys(radius).map((k) => [k, `border-radius: var(--lustrous-radius-${k});`])),
        ".field",
      ),
    ),
  ];

  @property() label = "";
  @property() caption = "";
  @property() value = "";
  @property() type: "text" | "email" | "password" | "search" | "tel" | "url" | "number" = "text";
  @property({ reflect: true }) size: LustrousTextInputSize = "m";
  @property({ reflect: true, attribute: "border-radius" }) borderRadius?: LustrousRadiusToken;
  @property() placeholder = "";
  @property({ attribute: "supporting-text" }) supportingText = "";
  @property() error: string | null = null;
  @property({ reflect: true, attribute: "validation-state" }) validationState: LustrousValidationState = "default";
  @property({ reflect: true, attribute: "leading-icon" }) leadingIcon?: LustrousIconName;
  @property({ reflect: true, attribute: "trailing-icon" }) trailingIcon?: LustrousIconName;
  @property({ attribute: "leading-text" }) leadingText = "";
  @property({ attribute: "trailing-text" }) trailingText = "";
  @property({ type: Boolean, attribute: "character-count" }) characterCount = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: Boolean, reflect: true }) readonly = false;
  @property({ reflect: true }) name?: string;
  @property({ type: Number }) maxlength?: number;
  @property({ type: Number }) minlength?: number;
  @property() pattern?: string;
  @property() autocomplete?: string;
  @property() inputmode?: string;

  @state() protected focused = false;
  @state() private hasTrailingSlot = false;
  @state() private hasLeadingSlot = false;
  @state() private hasCaptionSlot = false;
  @state() private formDisabled = false;
  @state() private scrim: "" | "start" | "end" | "both" = "";

  @query(".control") protected input!: HTMLInputElement | HTMLTextAreaElement;

  private readonly internals: ElementInternals | undefined =
    typeof this.attachInternals === "function" ? this.attachInternals() : undefined;
  protected readonly uid = `lustrous-ti-${++uid}`;
  private scrimObserver?: ResizeObserver;

  static override get observedAttributes(): string[] {
    return [...super.observedAttributes, "aria-label"];
  }

  override attributeChangedCallback(name: string, old: string | null, value: string | null): void {
    super.attributeChangedCallback(name, old, value);
    if (name === "aria-label") this.requestUpdate();
  }

  protected get isDisabled(): boolean {
    return this.disabled || this.formDisabled;
  }

  protected get errorMessage(): string {
    return this.error && this.error !== "true" && this.error !== "false" ? this.error : "";
  }

  protected get isError(): boolean {
    return (this.error !== null && this.error !== "false") || this.validationState === "error";
  }

  protected get scrimAxis(): "x" | "y" {
    return "x";
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.hasTrailingSlot = !!this.querySelector(":scope > [slot=trailing]");
    this.hasLeadingSlot = !!this.querySelector(":scope > [slot=leading]");
    this.hasCaptionSlot = !!this.querySelector(":scope > [slot=caption]");
    if (this.scrimObserver && this.input) this.scrimObserver.observe(this.input);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.scrimObserver?.disconnect();
  }

  protected override firstUpdated(changed: PropertyValues): void {
    super.firstUpdated(changed);
    if (typeof ResizeObserver !== "undefined" && this.input) {
      this.scrimObserver = new ResizeObserver(() => this.updateOverflow());
      this.scrimObserver.observe(this.input);
    }
  }

  protected updateOverflow(): void {
    const el = this.input;
    if (!el) return;
    const y = this.scrimAxis === "y";
    const offset = y ? el.scrollTop : Math.abs(el.scrollLeft);
    const max = y ? el.scrollHeight - el.clientHeight : el.scrollWidth - el.clientWidth;
    const start = max > 1 && offset > 1;
    const end = max > 1 && max - offset > 1;
    const next = start && end ? "both" : start ? "start" : end ? "end" : "";
    if (next !== this.scrim) this.scrim = next;
  }

  protected get scrimClass(): string {
    return this.scrim ? `scrim-${this.scrimAxis}-${this.scrim}` : "";
  }

  protected onInput(): void {
    this.value = this.input.value;
    this.updateOverflow();
  }

  protected onChange(): void {
    this.dispatchEvent(new Event("change", { bubbles: true }));
  }

  protected onFocus(): void {
    this.focused = true;
  }

  protected onBlur(): void {
    this.focused = false;
    if (this.scrimAxis === "x" && this.input) this.input.scrollLeft = 0;
    this.updateOverflow();
  }

  private onFieldClick(e: MouseEvent): void {
    if (this.isDisabled || !this.input) return;
    for (const n of e.composedPath()) {
      if (n === this.input || n === e.currentTarget) break;
      if (
        n instanceof Element &&
        n.matches('button, a, [role="button"], input, textarea, lustrous-button, lustrous-icon-button')
      ) {
        return;
      }
    }
    this.input.focus();
  }

  private syncValidity(): void {
    if (!this.internals || !this.input) return;
    this.internals.setFormValue(this.isDisabled ? null : this.value);
    const v = this.input.validity;
    if (this.isDisabled || v.valid) this.internals.setValidity({});
    else this.internals.setValidity(v, this.input.validationMessage || "Invalid value.", this.input);
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    this.syncValidity();
    if (changed.has("value") || changed.has("placeholder") || changed.has("size")) this.updateOverflow();
  }

  formResetCallback(): void {
    this.value = this.getAttribute("value") ?? "";
  }

  formStateRestoreCallback(state: string | File | FormData | null): void {
    if (typeof state === "string") this.value = state;
  }

  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
  }

  get form(): HTMLFormElement | null {
    return this.internals?.form ?? null;
  }

  get validity(): ValidityState | undefined {
    return this.internals?.validity;
  }

  get validationMessage(): string {
    return this.internals?.validationMessage ?? "";
  }

  checkValidity(): boolean {
    return this.internals?.checkValidity() ?? true;
  }

  reportValidity(): boolean {
    return this.internals?.reportValidity() ?? true;
  }

  select(): void {
    this.input?.select();
  }

  protected get controlAriaLabel(): string | undefined {
    return !this.label && this.getAttribute("aria-label") ? this.getAttribute("aria-label")! : undefined;
  }

  protected renderControl(msg: string): TemplateResult {
    return html`<span class="control-wrap"
      ><input
        part="input"
        class="control ${this.scrimClass}"
        id="input"
        .value=${live(this.value)}
        type=${this.type}
        dir="auto"
        placeholder=${this.placeholder || nothing}
        ?disabled=${this.isDisabled}
        ?required=${this.required}
        ?readonly=${this.readonly}
        maxlength=${ifDefined(this.maxlength)}
        minlength=${ifDefined(this.minlength)}
        pattern=${ifDefined(this.pattern)}
        autocomplete=${ifDefined(this.autocomplete as AutoFill | undefined)}
        inputmode=${ifDefined(this.inputmode)}
        aria-label=${this.controlAriaLabel ?? nothing}
        aria-invalid=${this.isError ? "true" : nothing}
        aria-busy=${this.validationState === "validating" ? "true" : nothing}
        aria-describedby=${msg ? `${this.uid}-msg` : nothing}
        @input=${this.onInput}
        @change=${this.onChange}
        @scroll=${this.updateOverflow}
        @focus=${this.onFocus}
        @blur=${this.onBlur}
    /></span>`;
  }

  protected rootClasses(): string {
    return "";
  }

  private renderTrailing(iconSize: "xs" | "s"): TemplateResult | typeof nothing {
    if (this.trailingIcon) {
      return html`<span part="trailing" class="slot trailing muted" aria-hidden="true">${renderIcon(this.trailingIcon, iconSize)}</span>`;
    }
    if (this.validationState === "validating") {
      return html`<span part="trailing" class="slot trailing muted" aria-hidden="true"
        ><lustrous-spinner size="xs" ?muted=${this.isDisabled}></lustrous-spinner
      ></span>`;
    }
    if (this.validationState === "success" && !this.isError) {
      return html`<span part="trailing" class="slot trailing success" aria-hidden="true">${renderIcon("check", iconSize)}</span>`;
    }
    return nothing;
  }

  protected override render() {
    const iconSize = this.size === "s" ? "xs" : "s";
    const msg = this.errorMessage || this.supportingText;
    const count = this.characterCount ? this.value.length : undefined;
    const over = count !== undefined && this.maxlength !== undefined && count > this.maxlength;
    const hasCaption = !!this.caption || this.hasCaptionSlot;
    const trailingStatus = this.hasTrailingSlot ? nothing : this.renderTrailing(iconSize);
    const hasLeadingIcon = this.hasLeadingSlot || !!this.leadingIcon;
    const hasTrailing = this.hasTrailingSlot || trailingStatus !== nothing;
    const root = [
      "root",
      `size-${this.size}`,
      this.focused ? "focused" : "",
      this.isError ? "error" : "",
      this.validationState === "success" ? "success" : "",
      this.isDisabled ? "disabled" : "",
      this.readonly ? "readonly" : "",
      hasLeadingIcon ? "has-leading-icon" : "",
      hasLeadingIcon || this.leadingText ? "has-leading" : "",
      hasTrailing ? "has-trailing-slot" : "",
      hasTrailing || this.trailingText ? "has-trailing" : "",
      this.rootClasses(),
    ].join(" ");

    return html`<div class=${root}>
      <div part="header" class="header" ?hidden=${!this.label && !hasCaption}>
        ${this.label
          ? html`<label part="label" for="input"
              >${this.label}${this.required ? html`<span class="required" aria-hidden="true">*</span>` : nothing}</label
            >`
          : html`<span></span>`}
        <span part="caption" class="caption" ?hidden=${!hasCaption}
          ><slot
            name="caption"
            @slotchange=${(e: Event) => (this.hasCaptionSlot = (e.target as HTMLSlotElement).assignedElements().length > 0)}
            >${this.caption}</slot
          ></span
        >
      </div>
      <div part="field" class="field" @click=${this.onFieldClick}>
        <span
          part="leading"
          class="slot leading ${this.hasLeadingSlot ? "" : "muted"}"
          ?hidden=${!hasLeadingIcon}
          aria-hidden=${this.hasLeadingSlot ? nothing : "true"}
          ><slot
            name="leading"
            @slotchange=${(e: Event) => (this.hasLeadingSlot = (e.target as HTMLSlotElement).assignedElements().length > 0)}
            >${this.leadingIcon ? renderIcon(this.leadingIcon, iconSize) : nothing}</slot
          ></span
        >
        ${this.leadingText ? html`<span class="affix leading-text">${this.leadingText}</span>` : nothing}
        ${this.renderControl(msg)}
        ${this.trailingText ? html`<span class="affix trailing-text">${this.trailingText}</span>` : nothing}
        ${trailingStatus}
        <span class="slot trailing action" ?hidden=${!this.hasTrailingSlot}
          ><slot
            name="trailing"
            @slotchange=${(e: Event) => (this.hasTrailingSlot = (e.target as HTMLSlotElement).assignedElements().length > 0)}
          ></slot
        ></span>
      </div>
      ${msg || count !== undefined
        ? html`<div part="supporting" class="supporting">
            ${msg
              ? html`<span
                  id="${this.uid}-msg"
                  class="message ${this.errorMessage ? "is-error" : ""}"
                  role=${this.errorMessage ? "alert" : nothing}
                  >${msg}</span
                >`
              : html`<span></span>`}
            ${count !== undefined
              ? html`<span part="counter" class="counter ${over ? "over" : ""}"
                  >${this.maxlength !== undefined ? `${count}/${this.maxlength}` : count}</span
                >`
              : nothing}
          </div>`
        : nothing}
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-text-input": LustrousTextInput;
  }
}
