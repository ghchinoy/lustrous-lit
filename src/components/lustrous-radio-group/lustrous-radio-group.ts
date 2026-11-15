import { css, html, nothing, type PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { composedContains } from "../../internal/floating.js";
import "../../theme/events.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { lustrousBase, lustrousFocusRing, lustrousStateLayer, lustrousType } from "../../theme/theme.js";

export type LustrousRadioGroupOrientation = "vertical" | "horizontal";

let radioUid = 0;
let groupUid = 0;

interface LustrousRadioSelectDetail {
  readonly radio: LustrousRadio;
  readonly value: string;
}

/**
 * `<lustrous-radio>` — Individual radio option (`role="radio"`) used inside `<lustrous-radio-group>`.
 *
 * - Renders a 44px minimum-height interactive row (or 44×44px standalone target) with state layer,
 *   focus ring, 20px circular ring, 10px inner dot when checked, and `forced-colors` `Highlight` styling.
 *
 * @slot - Radio label text.
 * @csspart button - The inner `<button role="radio">`.
 * @csspart ring - The 20px circular radio ring.
 * @csspart dot - The 10px inner selection dot.
 * @csspart label - The label and supporting-text container.
 */
@customElement("lustrous-radio")
export class LustrousRadio extends LustrousElement {
  static override shadowRootOptions: ShadowRootInit = { ...LustrousElement.shadowRootOptions, delegatesFocus: true };

  static override styles = [
    lustrousBase,
    lustrousFocusRing,
    lustrousStateLayer,
    css`
      :host {
        display: inline-flex;
        vertical-align: middle;
        -webkit-tap-highlight-color: transparent;
      }
      :host([data-has-label]) {
        display: flex;
      }
      .radio-btn {
        all: unset;
        box-sizing: border-box;
        position: relative;
        isolation: isolate;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        user-select: none;
        color: var(--lustrous-color-on-surface);
        text-align: start;
      }
      .standalone {
        width: 44px;
        height: 44px;
        border-radius: var(--lustrous-radius-full);
      }
      .row {
        justify-content: flex-start;
        gap: var(--lustrous-space-s);
        width: 100%;
        min-height: 44px;
        padding: var(--lustrous-space-s);
        border-radius: var(--lustrous-radius-m);
      }
      .target {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 22px;
        height: 22px;
      }
      .ring {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        border: 1.5px solid var(--lustrous-color-outline);
        border-radius: var(--lustrous-radius-full);
        background-color: transparent;
        transition: border-color 150ms cubic-bezier(0.2, 0, 0, 1);
      }
      .radio-btn:hover:not(.disabled) .ring,
      .radio-btn:focus-visible:not(.disabled) .ring {
        border-color: var(--lustrous-color-on-surface);
      }
      .ring.on,
      .radio-btn:hover:not(.disabled) .ring.on,
      .radio-btn:focus-visible:not(.disabled) .ring.on {
        border-width: 2px;
        border-color: var(--lustrous-color-accent);
      }
      .dot {
        width: 10px;
        height: 10px;
        border-radius: var(--lustrous-radius-full);
        background-color: var(--lustrous-color-accent);
        transform: scale(0);
        transition: transform 150ms cubic-bezier(0.2, 0, 0, 1);
      }
      .ring.on .dot {
        transform: scale(1);
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

      .radio-btn.disabled {
        cursor: default;
        pointer-events: none;
        color: var(--lustrous-color-state-disabled-label);
      }
      .radio-btn.disabled .ring {
        border-color: var(--lustrous-color-state-disabled);
      }
      .radio-btn.disabled .dot {
        background-color: var(--lustrous-color-state-disabled-label);
      }
      .radio-btn.disabled .supporting {
        color: var(--lustrous-color-state-disabled-label);
      }

      @media (forced-colors: active) {
        .ring {
          border-color: ButtonText;
        }
        .radio-btn:hover:not(.disabled) .ring,
        .ring.on,
        .radio-btn:hover:not(.disabled) .ring.on,
        .radio-btn:focus-visible:not(.disabled) .ring.on {
          border-color: Highlight;
        }
        .dot {
          background-color: Highlight;
          forced-color-adjust: none;
        }
        .radio-btn.disabled,
        .radio-btn.disabled .supporting {
          color: GrayText;
        }
        .radio-btn.disabled .ring {
          border-color: GrayText;
        }
        .radio-btn.disabled .dot {
          background-color: GrayText;
        }
      }
    `,
  ];

  @property({ reflect: true }) value = "";
  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ attribute: "supporting-text" }) supportingText = "";

  /** Managed by enclosing `<lustrous-radio-group>`. @internal */
  @state() groupDisabled = false;
  /** Managed by enclosing `<lustrous-radio-group>` for roving tabindex. @internal */
  @state() radioTabIndex = 0;
  @state() private hasLabel = false;

  @query("button") private button!: HTMLButtonElement;
  private readonly uid = `lustrous-rad-${++radioUid}`;

  static override get observedAttributes(): string[] {
    return [...super.observedAttributes, "aria-label"];
  }

  override attributeChangedCallback(name: string, old: string | null, value: string | null): void {
    super.attributeChangedCallback(name, old, value);
    if (name === "aria-label") this.requestUpdate();
  }

  get isDisabled(): boolean {
    return this.disabled || this.groupDisabled;
  }

  override focus(options?: FocusOptions): void {
    if (this.button) this.button.focus(options);
    else super.focus(options);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.hasLabel = [...this.childNodes].some(
      (n) => n.nodeType === 1 || (n.nodeType === 3 && n.textContent!.trim() !== ""),
    );
    this.addEventListener("click", this.onHostClick);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("click", this.onHostClick);
  }

  private onHostClick = (e: MouseEvent) => {
    if (e.composedPath()[0] === this && !this.isDisabled) {
      this.activateFromUser();
    }
  };

  private onSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    this.hasLabel = slot
      .assignedNodes({ flatten: true })
      .some((n) => n.nodeType === 1 || (n.nodeType === 3 && n.textContent!.trim() !== ""));
  }

  private activateFromUser(): void {
    if (this.isDisabled) return;
    const inGroup = !!this.closest("lustrous-radio-group");
    this.dispatchEvent(
      new CustomEvent<LustrousRadioSelectDetail>("lustrous-radio-select", {
        detail: { radio: this, value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
    if (!inGroup && !this.checked) {
      this.checked = true;
      this.dispatchEvent(new Event("change", { bubbles: true }));
      this.dispatchEvent(
        new CustomEvent("lustrous-change", {
          detail: { checked: true, value: this.value },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    this.toggleAttribute("data-has-label", this.hasLabel);
    if (changed.has("disabled") || changed.has("value")) {
      this.dispatchEvent(new CustomEvent("lustrous-radio-sync", { bubbles: true, composed: true }));
    }
  }

  protected override render() {
    const labelId = `${this.uid}-label`;
    const descId = `${this.uid}-desc`;
    const explicitAriaLabel = this.getAttribute("aria-label");
    const isDisabled = this.isDisabled;

    return html`<button
      part="button"
      class="radio-btn focus-ring state-layer ${this.hasLabel ? "row" : "standalone"} ${isDisabled ? "disabled" : ""}"
      type="button"
      role="radio"
      tabindex=${isDisabled ? -1 : this.radioTabIndex}
      aria-checked=${this.checked ? "true" : "false"}
      aria-disabled=${isDisabled ? "true" : "false"}
      aria-label=${explicitAriaLabel || nothing}
      aria-labelledby=${!explicitAriaLabel && this.hasLabel ? labelId : nothing}
      aria-describedby=${this.supportingText ? descId : nothing}
      ?disabled=${isDisabled}
      @click=${() => this.activateFromUser()}
    >
      <span class="target">
        <span part="ring" class="ring ${this.checked ? "on" : ""}" aria-hidden="true">
          <span part="dot" class="dot"></span>
        </span>
      </span>
      <span part="label" class="text" ?hidden=${!this.hasLabel}>
        <span id=${labelId}><slot @slotchange=${this.onSlotChange}></slot></span>
        ${this.supportingText ? html`<span class="supporting" id=${descId}>${this.supportingText}</span>` : nothing}
      </span>
    </button>`;
  }
}

/**
 * `<lustrous-radio-group>` — Form-associated `role="radiogroup"` container managing
 * `<lustrous-radio>` children, roving `tabindex`, arrow/Home/End keyboard selection,
 * `FormData`, `required` validity, `formResetCallback`, and `<fieldset disabled>`.
 *
 * @slot - Child `<lustrous-radio>` elements.
 * @fires change - Native-style `change` event on user selection (bubbles).
 * @fires lustrous-change - `CustomEvent<{ value: string }>` on user selection (`bubbles: true, composed: true`).
 * @csspart radiogroup - The `role="radiogroup"` container.
 * @csspart label - The group label heading.
 * @csspart items - The vertical or horizontal radio list container.
 * @csspart supporting - The supporting or error message row.
 */
@customElement("lustrous-radio-group")
export class LustrousRadioGroup extends LustrousElement {
  static formAssociated = true;

  static override styles = [
    lustrousBase,
    css`
      :host {
        display: block;
        min-width: 0;
      }
      .group {
        display: flex;
        flex-direction: column;
        gap: var(--lustrous-space-xs);
        width: 100%;
      }
      .group-label {
        color: var(--lustrous-color-on-surface);
        ${lustrousType("body-small-emphasized")}
      }
      .disabled .group-label {
        color: var(--lustrous-color-state-disabled-label);
      }
      .required {
        margin-inline-start: var(--lustrous-space-xs);
        color: var(--lustrous-color-error);
      }
      .items {
        display: flex;
        flex-direction: column;
        gap: var(--lustrous-space-xs);
      }
      .orientation-horizontal .items {
        flex-direction: row;
        flex-wrap: wrap;
        align-items: flex-start;
        gap: var(--lustrous-space-s);
      }
      .supporting {
        display: flex;
        align-items: center;
        color: var(--lustrous-color-on-surface-variant);
        ${lustrousType("body-small")}
      }
      .message {
        flex-grow: 1;
        min-width: 0;
      }
      .message.is-error {
        color: var(--lustrous-color-error);
      }
      @media (forced-colors: active) {
        .disabled .group-label {
          color: GrayText;
        }
      }
    `,
  ];

  @property() label = "";
  @property({ reflect: true }) name?: string;
  @property({ reflect: true }) value = "";
  @property({ reflect: true }) orientation: LustrousRadioGroupOrientation = "vertical";
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property() error: string | null = null;
  @property({ attribute: "supporting-text" }) supportingText = "";

  @state() private formDisabled = false;
  @query("[part=radiogroup]") private groupEl?: HTMLElement;

  private readonly internals: ElementInternals | undefined =
    typeof this.attachInternals === "function" ? this.attachInternals() : undefined;
  private readonly uid = `lustrous-rg-${++groupUid}`;
  private defaultValue?: string;

  static override get observedAttributes(): string[] {
    return [...super.observedAttributes, "aria-label"];
  }

  override attributeChangedCallback(name: string, old: string | null, value: string | null): void {
    super.attributeChangedCallback(name, old, value);
    if (name === "aria-label") this.requestUpdate();
  }

  private get isDisabled(): boolean {
    return this.disabled || this.formDisabled;
  }

  private get errorMessage(): string {
    return this.error && this.error !== "true" && this.error !== "false" ? this.error : "";
  }

  private get isError(): boolean {
    return this.error !== null && this.error !== "false";
  }

  private getRadios(): LustrousRadio[] {
    return [...this.querySelectorAll<LustrousRadio>("lustrous-radio")].filter(
      (r) => r.closest("lustrous-radio-group") === this,
    );
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.defaultValue === undefined) {
      const attrVal = this.getAttribute("value");
      if (attrVal !== null) {
        this.defaultValue = attrVal;
      } else {
        const preChecked = this.getRadios().find((r) => r.hasAttribute("checked") || r.checked);
        this.defaultValue = preChecked ? preChecked.value : "";
        if (!this.value && this.defaultValue) {
          this.value = this.defaultValue;
        }
      }
    }
    this.syncRadiosAndValidity();
  }

  private static deepActive(): Element | null {
    let a: Element | null = document.activeElement;
    while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
    return a;
  }

  private syncRadiosAndValidity(): void {
    const radios = this.getRadios();
    const disabled = this.isDisabled;
    for (const r of radios) {
      r.groupDisabled = disabled;
      r.checked = this.value !== "" && r.value === this.value;
    }

    const enabled = radios.filter((r) => !r.disabled && !disabled);
    const activeStop = enabled.find((r) => r.checked) ?? enabled[0];
    for (const r of radios) {
      r.radioTabIndex = r === activeStop ? 0 : -1;
    }

    if (this.internals) {
      this.internals.setFormValue(this.value ? this.value : null);
      if (this.required && !this.value && !disabled) {
        const anchor = enabled[0] ?? radios[0] ?? this.groupEl;
        this.internals.setValidity({ valueMissing: true }, "Please select one of these options.", anchor);
      } else {
        this.internals.setValidity({});
      }
    }
  }

  private selectFromUser(nextValue: string, targetRadio?: LustrousRadio): void {
    if (this.isDisabled) return;
    const changed = nextValue !== this.value;
    this.value = nextValue;
    this.syncRadiosAndValidity();
    targetRadio?.focus();
    if (changed) {
      this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
      this.dispatchEvent(new Event("change", { bubbles: true }));
      this.dispatchEvent(
        new CustomEvent("lustrous-change", {
          detail: { value: this.value },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  private onRadioSelect = (e: CustomEvent<LustrousRadioSelectDetail>) => {
    if (e.detail.radio.closest("lustrous-radio-group") !== this) return;
    e.stopPropagation();
    if (e.detail.radio.isDisabled || this.isDisabled) return;
    this.selectFromUser(e.detail.value, e.detail.radio);
  };

  private onRadioSync = (e: Event) => {
    if ((e.target as Element)?.closest("lustrous-radio-group") !== this) return;
    e.stopPropagation();
    this.syncRadiosAndValidity();
  };

  private onSlotChange(): void {
    if (this.defaultValue === "" && !this.hasAttribute("value") && !this.value) {
      const preChecked = this.getRadios().find((r) => r.hasAttribute("checked") || r.checked);
      if (preChecked) {
        this.defaultValue = preChecked.value;
        this.value = preChecked.value;
      }
    }
    this.syncRadiosAndValidity();
  }

  private onKeydown = (e: KeyboardEvent) => {
    if (this.isDisabled) return;
    const enabled = this.getRadios().filter((r) => !r.disabled);
    if (enabled.length === 0) return;

    const rtl = getComputedStyle(this).direction === "rtl";
    const nextHoriz = rtl ? "ArrowLeft" : "ArrowRight";
    const prevHoriz = rtl ? "ArrowRight" : "ArrowLeft";

    const active = LustrousRadioGroup.deepActive();
    let idx = enabled.findIndex((r) => composedContains(r, active));
    if (idx < 0) idx = enabled.findIndex((r) => r.checked);

    let nextIdx = -1;
    if (e.key === "ArrowDown" || e.key === nextHoriz) {
      nextIdx = idx < 0 ? 0 : (idx + 1) % enabled.length;
    } else if (e.key === "ArrowUp" || e.key === prevHoriz) {
      nextIdx = idx < 0 ? enabled.length - 1 : (idx - 1 + enabled.length) % enabled.length;
    } else if (e.key === "Home") {
      nextIdx = 0;
    } else if (e.key === "End") {
      nextIdx = enabled.length - 1;
    }

    if (nextIdx >= 0) {
      e.preventDefault();
      const target = enabled[nextIdx]!;
      this.selectFromUser(target.value, target);
    }
  };

  protected override updated(): void {
    this.syncRadiosAndValidity();
  }

  formResetCallback(): void {
    this.value = this.defaultValue ?? "";
    this.syncRadiosAndValidity();
  }

  formStateRestoreCallback(state: string | File | FormData | null): void {
    if (typeof state === "string") {
      this.value = state;
      this.syncRadiosAndValidity();
    }
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

  protected override render() {
    const labelId = `${this.uid}-label`;
    const msgId = `${this.uid}-msg`;
    const msg = this.errorMessage || this.supportingText;
    const fallbackAriaLabel = !this.label ? this.getAttribute("aria-label") || undefined : undefined;

    return html`<div
      part="radiogroup"
      class="group orientation-${this.orientation} ${this.isDisabled ? "disabled" : ""}"
      role="radiogroup"
      aria-disabled=${this.isDisabled ? "true" : nothing}
      aria-labelledby=${this.label ? labelId : nothing}
      aria-label=${fallbackAriaLabel ?? nothing}
      aria-required=${this.required ? "true" : nothing}
      aria-invalid=${this.isError ? "true" : nothing}
      aria-describedby=${msg ? msgId : nothing}
      @keydown=${this.onKeydown}
      @lustrous-radio-select=${this.onRadioSelect}
      @lustrous-radio-sync=${this.onRadioSync}
    >
      ${this.label
        ? html`<div part="label" class="group-label" id=${labelId}>
            ${this.label}${this.required ? html`<span class="required" aria-hidden="true">*</span>` : nothing}
          </div>`
        : nothing}
      <div part="items" class="items">
        <slot @slotchange=${this.onSlotChange}></slot>
      </div>
      ${msg
        ? html`<div part="supporting" class="supporting">
            <span
              id=${msgId}
              class="message ${this.errorMessage ? "is-error" : ""}"
              role=${this.errorMessage ? "alert" : nothing}
              >${msg}</span
            >
          </div>`
        : nothing}
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-radio": LustrousRadio;
    "lustrous-radio-group": LustrousRadioGroup;
  }
}
