import { css, html, nothing, unsafeCSS, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { autoPosition, floatingResetCss } from "../../internal/floating.js";
import { expandInCss } from "../../internal/motion.js";
import { attrRules, setHostVar, toCss } from "../../internal/style-gen.js";
import "../../theme/events.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { LustrousShortcutScopeController } from "../../theme/shortcuts.js";
import { lustrousBase, lustrousType } from "../../theme/theme.js";
import { radius, type LustrousRadiusToken } from "../../theme/tokens.js";
import { lustrousChevronStyles, renderChevron } from "../lustrous-chevron-icon/lustrous-chevron-icon.js";
import { renderIcon, type LustrousIconName } from "../lustrous-icon/lustrous-icon.js";
import "../lustrous-spinner/lustrous-spinner.js";

export type LustrousSelectSize = "m" | "s";
export type LustrousSelectValidationState = "default" | "validating" | "success" | "error";

export interface LustrousSelectOption {
  readonly value: string;
  readonly label: string;
  readonly description?: string;
  readonly icon?: LustrousIconName;
  readonly disabled?: boolean;
  readonly group?: string;
}

let uid = 0;

/**
 * `<lustrous-select>` — Form-associated custom single-select dropdown matching
 * `<lustrous-text-input>`'s field geometry (`44px` at `m`, `36px` at `s`, `10px` radius).
 *
 * - Accepts structured `.options` (`readonly LustrousSelectOption[]`) or light-DOM
 *   `<option>` / `<optgroup>` children when `.options` is empty.
 * - Renders an accessible `<button role="combobox">` trigger paired with a top-layer
 *   `<div popover="auto" role="listbox">` positioned via `autoPosition()`.
 * - Supports full keyboard navigation (`ArrowDown`, `ArrowUp`, `Home`, `End`,
 *   `Enter` / `Space`, `Escape` via `LustrousShortcutScopeController`, and character typeahead).
 * - Participates in `FormData`, `required` constraint validation, `formResetCallback`,
 *   and `<fieldset disabled>`.
 *
 * @slot - Optional `<option>` / `<optgroup>` elements parsed when `.options` is empty.
 * @slot caption - Optional rich caption content at the end of the header row.
 * @fires input - Native `input` event on user selection (composed).
 * @fires change - Native-style `change` event on user selection (bubbles).
 * @fires lustrous-change - `CustomEvent<{ value: string }>` on user selection (`bubbles: true, composed: true`).
 * @csspart header - The label and caption row.
 * @csspart label - The `<label>` element.
 * @csspart caption - The caption container.
 * @csspart field - The combobox `<button>` field frame.
 * @csspart value - The selected option text or placeholder span.
 * @csspart listbox - The top-layer `[popover]` listbox surface.
 * @csspart option - Each `[role="option"]` row.
 * @csspart supporting - The supporting or error message row.
 */
@customElement("lustrous-select")
export class LustrousSelect extends LustrousElement {
  static formAssociated = true;
  static override shadowRootOptions: ShadowRootInit = { ...LustrousElement.shadowRootOptions, delegatesFocus: true };

  static override styles = [
    lustrousBase,
    lustrousChevronStyles,
    toCss(floatingResetCss),
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
        cursor: pointer;
        color: var(--lustrous-color-on-surface);
        ${lustrousType("body-small-emphasized")}
      }
      .disabled label,
      .disabled .caption {
        cursor: default;
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
        all: unset;
        box-sizing: border-box;
        position: relative;
        display: flex;
        align-items: center;
        gap: var(--lustrous-space-s);
        width: 100%;
        min-height: 44px;
        padding: 0 var(--lustrous-space-m);
        border: 1px solid var(--lustrous-color-outline);
        border-radius: var(--lustrous-radius-m);
        background-color: var(--lustrous-color-surface);
        color: var(--lustrous-color-on-surface);
        cursor: pointer;
        user-select: none;
        text-align: start;
        transition:
          border-color 150ms cubic-bezier(0.2, 0, 0, 1),
          background-color 150ms cubic-bezier(0.2, 0, 0, 1);
        ${lustrousType("body-medium")}
      }
      .size-s .field {
        min-height: 36px;
        padding-inline: var(--lustrous-space-s);
        ${lustrousType("body-small")}
      }
      .root:not(.open):not(.error):not(.disabled) .field:hover {
        border-color: var(--lustrous-color-on-surface);
      }
      .root:not(.error):not(.disabled) .field:focus-visible,
      .open:not(.error):not(.disabled) .field {
        border-color: var(--lustrous-color-primary);
        outline: 2px solid var(--lustrous-color-primary);
        outline-offset: -2px;
      }
      .success:not(.error):not(.disabled) .field:focus-visible,
      .open.success:not(.error):not(.disabled) .field {
        border-color: var(--lustrous-color-positive);
        outline: 2px solid var(--lustrous-color-positive);
        outline-offset: -2px;
      }
      .error:not(.disabled) .field {
        border-color: var(--lustrous-color-error);
      }
      .error:not(.disabled) .field:focus-visible,
      .open.error:not(.disabled) .field {
        border-color: var(--lustrous-color-error);
        outline: 2px solid var(--lustrous-color-error);
        outline-offset: -2px;
      }
      .disabled .field {
        border-color: var(--lustrous-color-state-disabled);
        background-color: var(--lustrous-color-surface-dim);
        color: var(--lustrous-color-state-disabled-label);
        cursor: not-allowed;
      }

      .lead-icon {
        display: inline-flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        color: var(--lustrous-color-on-surface-variant);
      }
      .disabled .lead-icon {
        color: var(--lustrous-color-state-disabled-label);
      }
      .value {
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .value.placeholder {
        color: var(--lustrous-color-on-surface-variant);
      }
      .disabled .value.placeholder {
        color: var(--lustrous-color-state-disabled-label);
      }
      .trail {
        display: inline-flex;
        flex-shrink: 0;
        align-items: center;
        gap: var(--lustrous-space-xs);
        color: var(--lustrous-color-on-surface-variant);
      }
      .trail .success-icon {
        display: inline-flex;
        color: var(--lustrous-color-positive);
      }
      .disabled .trail,
      .disabled .trail .success-icon {
        color: var(--lustrous-color-state-disabled-label);
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
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .message.is-error {
        color: var(--lustrous-color-error);
      }

      /* Top-layer listbox popover */
      .listbox {
        box-sizing: border-box;
        min-width: var(--_lustrous-select-min-width, 180px);
        max-width: var(--_lustrous-available-width, calc(100vw - 16px));
        max-height: min(var(--_lustrous-available-height, 320px), 320px);
        overflow-y: auto;
        padding: var(--lustrous-space-xs);
        border: 1px solid var(--lustrous-color-outline-variant);
        border-radius: var(--lustrous-radius-l);
        background-color: var(--lustrous-color-surface-bright);
        color: var(--lustrous-color-on-surface);
        box-shadow: var(--lustrous-elevation-level2);
        z-index: var(--lustrous-z-dropdown);
        outline: none;
        scrollbar-width: thin;
        scrollbar-color: var(--lustrous-color-outline-variant) transparent;
      }
      .group {
        display: flex;
        flex-direction: column;
      }
      .group + .group {
        margin-top: var(--lustrous-space-xs);
        padding-top: var(--lustrous-space-xs);
        border-top: 1px solid var(--lustrous-color-outline-variant);
      }
      .group-header {
        padding: var(--lustrous-space-xs) var(--lustrous-space-s);
        color: var(--lustrous-color-on-surface-variant);
        ${lustrousType("body-small-emphasized")}
      }
      .option {
        position: relative;
        isolation: isolate;
        display: flex;
        align-items: center;
        gap: var(--lustrous-space-s);
        width: 100%;
        min-height: 36px;
        padding: var(--lustrous-space-s);
        border-radius: var(--lustrous-radius-s);
        color: var(--lustrous-color-on-surface);
        cursor: pointer;
        user-select: none;
        outline: none;
        ${lustrousType("body-medium")}
      }
      .size-s .option {
        min-height: 32px;
        ${lustrousType("body-small")}
      }
      .option::after {
        content: "";
        position: absolute;
        inset: 0;
        z-index: -1;
        border-radius: inherit;
        background-color: var(--lustrous-color-state-hover);
        opacity: 0;
        pointer-events: none;
        transition: opacity 120ms ease;
      }
      .option:hover:not([aria-disabled="true"])::after,
      .option.active:not([aria-disabled="true"])::after,
      .option:focus-visible:not([aria-disabled="true"])::after {
        opacity: 1;
      }
      .option:active:not([aria-disabled="true"])::after {
        background-color: var(--lustrous-color-state-pressed);
        opacity: 1;
      }
      .option:focus-visible {
        outline: 2px solid var(--lustrous-color-primary);
        outline-offset: -2px;
      }
      .option[aria-selected="true"] {
        background-color: var(--lustrous-color-accent-container);
        color: var(--lustrous-color-on-accent-container);
      }
      .option[aria-disabled="true"] {
        cursor: default;
        color: var(--lustrous-color-state-disabled-label);
      }
      .opt-icon {
        display: inline-flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
      }
      .opt-text {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-width: 0;
      }
      .opt-label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .opt-desc {
        color: var(--lustrous-color-on-surface-variant);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        ${lustrousType("body-small")}
      }
      .option[aria-disabled="true"] .opt-desc {
        color: var(--lustrous-color-state-disabled-label);
      }
      .opt-check {
        display: inline-flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        color: var(--lustrous-color-accent);
      }
      .option[aria-selected="true"] .opt-check {
        color: var(--lustrous-color-on-accent-container);
      }

      @media (forced-colors: active) {
        .field {
          border-color: ButtonBorder;
          background-color: Field;
          color: FieldText;
        }
        .root:not(.open):not(.error):not(.disabled) .field:hover,
        .field:focus-visible,
        .open:not(.disabled) .field,
        .error:not(.disabled) .field {
          border-color: Highlight;
        }
        .field:focus-visible,
        .open:not(.disabled) .field {
          outline-color: Highlight;
        }
        .disabled .field,
        .disabled label,
        .disabled .caption {
          border-color: GrayText;
          color: GrayText;
        }
        .listbox {
          border-color: CanvasText;
          background-color: Canvas;
          color: CanvasText;
        }
        .option:focus-visible,
        .option.active {
          outline: 2px solid Highlight;
          outline-offset: -2px;
        }
        .option[aria-selected="true"] {
          outline: 1px solid Highlight;
          outline-offset: -1px;
        }
        .option[aria-disabled="true"],
        .option[aria-disabled="true"] .opt-desc {
          color: GrayText;
        }
      }
    `,
    toCss(expandInCss(".listbox:popover-open")),
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
  @property() placeholder = "Select…";
  @property() value = "";
  @property({ reflect: true }) name?: string;
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property() error: string | null = null;
  @property({ attribute: "supporting-text" }) supportingText = "";
  @property({ reflect: true, attribute: "validation-state" }) validationState: LustrousSelectValidationState = "default";
  @property({ reflect: true }) size: LustrousSelectSize = "m";
  @property({ reflect: true, attribute: "border-radius" }) borderRadius?: LustrousRadiusToken;
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ attribute: false }) options: readonly LustrousSelectOption[] = [];

  @state() private slottedOptions: LustrousSelectOption[] = [];
  @state() private hasCaptionSlot = false;
  @state() private formDisabled = false;
  @state() private activeIndex = -1;

  @query("#combobox") private combobox!: HTMLButtonElement;
  @query(".listbox") private listbox!: HTMLDivElement;

  private readonly internals: ElementInternals | undefined =
    typeof this.attachInternals === "function" ? this.attachInternals() : undefined;
  private readonly shortcutScope = new LustrousShortcutScopeController(this, { active: false });
  protected readonly uid = `lustrous-sel-${++uid}`;
  private readonly listboxId = `${this.uid}-listbox`;

  private cleanupPosition?: () => void;
  private dismissedAt = Number.NEGATIVE_INFINITY;
  private focusWasInside = false;
  private shouldRestoreFocus = false;
  private initialOptionValue?: string;
  private typeaheadBuffer = "";
  private typeaheadTimer?: ReturnType<typeof setTimeout>;

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
    return (this.error !== null && this.error !== "false") || this.validationState === "error";
  }

  private get effectiveOptions(): readonly LustrousSelectOption[] {
    return this.options.length > 0 ? this.options : this.slottedOptions;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.hasCaptionSlot = !!this.querySelector(":scope > [slot=caption]");
    this.parseLightDomOptions();
    document.addEventListener("keydown", this.onDocumentKeydown);
    this.shortcutScope.setActive(this.open);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("keydown", this.onDocumentKeydown);
    this.cleanupPosition?.();
    this.cleanupPosition = undefined;
    clearTimeout(this.typeaheadTimer);
  }

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (changed.has("open")) {
      this.shortcutScope.setActive(this.open);
    }
  }

  /** Parses light-DOM `<option>` and `<optgroup>` children when `.options` is empty. */
  private parseLightDomOptions(): void {
    const parsed: LustrousSelectOption[] = [];
    let selectedVal: string | undefined;

    const readOption = (opt: Element, group?: string, groupDisabled = false) => {
      const val = opt.hasAttribute("value") ? opt.getAttribute("value")! : (opt.textContent?.trim() ?? "");
      const label = opt.getAttribute("label")?.trim() || opt.textContent?.trim() || val;
      const disabled = groupDisabled || opt.hasAttribute("disabled");
      parsed.push({ value: val, label, disabled, group });
      if (opt.hasAttribute("selected") && selectedVal === undefined) {
        selectedVal = val;
      }
    };

    for (const child of this.children) {
      if (child.hasAttribute("slot")) continue;
      const tag = child.localName;
      if (tag === "option") {
        readOption(child);
      } else if (tag === "optgroup") {
        const groupLabel = child.getAttribute("label") ?? undefined;
        const groupDisabled = child.hasAttribute("disabled");
        for (const sub of child.children) {
          if (sub.localName === "option") readOption(sub, groupLabel, groupDisabled);
        }
      }
    }

    this.slottedOptions = parsed;
    if (this.initialOptionValue === undefined) {
      this.initialOptionValue = selectedVal;
    }
    if (!this.hasAttribute("value") && !this.value && selectedVal !== undefined && this.options.length === 0) {
      this.value = selectedVal;
    }
  }

  show(): void {
    if (!this.isDisabled) this.open = true;
  }

  hide(): void {
    this.open = false;
  }

  toggle(): void {
    if (!this.isDisabled) this.open = !this.open;
  }

  private getEnabledIndices(): number[] {
    const out: number[] = [];
    const opts = this.effectiveOptions;
    for (let i = 0; i < opts.length; i += 1) {
      if (!opts[i]?.disabled) out.push(i);
    }
    return out;
  }

  private resolveInitialActiveIndex(prefer: "selected-or-first" | "selected-or-last" | "first" | "last"): number {
    const enabled = this.getEnabledIndices();
    if (enabled.length === 0) return -1;
    if (prefer === "first") return enabled[0]!;
    if (prefer === "last") return enabled[enabled.length - 1]!;
    const selectedIdx = this.effectiveOptions.findIndex((o) => o.value === this.value && !o.disabled);
    if (selectedIdx >= 0) return selectedIdx;
    return prefer === "selected-or-last" ? enabled[enabled.length - 1]! : enabled[0]!;
  }

  private focusOptionAtIndex(idx: number): void {
    if (idx < 0) return;
    this.activeIndex = idx;
    const optEl = this.renderRoot.querySelector<HTMLElement>(`#${this.uid}-opt-${idx}`);
    if (optEl) {
      optEl.focus({ preventScroll: true });
      optEl.scrollIntoView?.({ block: "nearest" });
    }
  }

  private openWithHighlight(prefer: "selected-or-first" | "selected-or-last" | "first" | "last"): void {
    if (this.isDisabled) return;
    const nextIdx = this.resolveInitialActiveIndex(prefer);
    this.activeIndex = nextIdx;
    if (!this.open) {
      this.open = true;
    } else {
      this.focusOptionAtIndex(nextIdx);
    }
  }

  private moveActive(delta: 1 | -1): void {
    const enabled = this.getEnabledIndices();
    if (enabled.length === 0) return;
    const pos = enabled.indexOf(this.activeIndex);
    let nextPos: number;
    if (pos < 0) {
      nextPos = delta > 0 ? 0 : enabled.length - 1;
    } else {
      nextPos = (pos + delta + enabled.length) % enabled.length;
    }
    this.focusOptionAtIndex(enabled[nextPos]!);
  }

  private handleTypeahead(char: string): void {
    const enabled = this.getEnabledIndices();
    if (enabled.length === 0) return;
    clearTimeout(this.typeaheadTimer);
    this.typeaheadBuffer += char.toLowerCase();
    this.typeaheadTimer = setTimeout(() => {
      this.typeaheadBuffer = "";
    }, 500);

    const opts = this.effectiveOptions;
    const repeatedSingleChar =
      this.typeaheadBuffer.length > 1 &&
      [...this.typeaheadBuffer].every((c) => c === this.typeaheadBuffer[0]);
    const needle = repeatedSingleChar ? this.typeaheadBuffer[0]! : this.typeaheadBuffer;
    const currentPos = enabled.indexOf(this.activeIndex);
    const startPos = repeatedSingleChar && currentPos >= 0 ? (currentPos + 1) % enabled.length : Math.max(0, currentPos);
    const ordered = [...enabled.slice(startPos), ...enabled.slice(0, startPos)];
    const match = ordered.find((idx) => opts[idx]?.label.toLowerCase().startsWith(needle));
    if (match !== undefined) {
      if (this.open) this.focusOptionAtIndex(match);
      else {
        this.activeIndex = match;
        this.open = true;
      }
    }
  }

  private commitSelection(idx: number): void {
    const opt = this.effectiveOptions[idx];
    if (!opt || opt.disabled) return;
    const changed = opt.value !== this.value;
    this.value = opt.value;
    this.closeDropdown(true);
    if (changed) {
      this.syncFormValueAndValidity();
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

  private closeDropdown(restoreFocus: boolean): void {
    this.shouldRestoreFocus = restoreFocus;
    this.open = false;
  }

  private isFocusInListbox(): boolean {
    const inner = this.shadowRoot?.activeElement;
    return !!inner && !!this.listbox && this.listbox.contains(inner);
  }

  private onComboboxClick = () => {
    if (this.isDisabled) return;
    if (!this.open && performance.now() - this.dismissedAt < 300) return;
    if (this.open) {
      this.closeDropdown(true);
    } else {
      this.openWithHighlight("selected-or-first");
    }
  };

  private onLabelClick = () => {
    if (!this.isDisabled) this.combobox?.focus();
  };

  private onComboboxKeydown = (e: KeyboardEvent) => {
    if (this.isDisabled) return;
    if (this.open) {
      this.onOpenKeydown(e);
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this.openWithHighlight("selected-or-first");
        return;
      case "ArrowUp":
        e.preventDefault();
        this.openWithHighlight("selected-or-last");
        return;
      case "Home":
        e.preventDefault();
        this.openWithHighlight("first");
        return;
      case "End":
        e.preventDefault();
        this.openWithHighlight("last");
        return;
      case "Enter":
      case " ":
        e.preventDefault();
        this.openWithHighlight("selected-or-first");
        return;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && /\S/.test(e.key)) {
          e.preventDefault();
          this.handleTypeahead(e.key);
        }
    }
  };

  private onOpenKeydown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        e.stopPropagation();
        this.moveActive(1);
        return;
      case "ArrowUp":
        e.preventDefault();
        e.stopPropagation();
        this.moveActive(-1);
        return;
      case "Home":
        e.preventDefault();
        e.stopPropagation();
        {
          const enabled = this.getEnabledIndices();
          if (enabled.length > 0) this.focusOptionAtIndex(enabled[0]!);
        }
        return;
      case "End":
        e.preventDefault();
        e.stopPropagation();
        {
          const enabled = this.getEnabledIndices();
          if (enabled.length > 0) this.focusOptionAtIndex(enabled[enabled.length - 1]!);
        }
        return;
      case "Enter":
        e.preventDefault();
        e.stopPropagation();
        if (this.activeIndex >= 0) this.commitSelection(this.activeIndex);
        return;
      case " ":
        if (this.typeaheadBuffer.length > 0) {
          e.preventDefault();
          e.stopPropagation();
          this.handleTypeahead(" ");
        } else {
          e.preventDefault();
          e.stopPropagation();
          if (this.activeIndex >= 0) this.commitSelection(this.activeIndex);
        }
        return;
      case "Escape":
        if (!this.shortcutScope.canHandleEscape(e)) return;
        e.preventDefault();
        e.stopPropagation();
        this.closeDropdown(true);
        return;
      case "Tab":
        this.closeDropdown(false);
        return;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          e.stopPropagation();
          this.handleTypeahead(e.key);
        }
    }
  };

  private onDocumentKeydown = (e: KeyboardEvent) => {
    if (!this.open || e.key !== "Escape" || e.defaultPrevented) return;
    if (this.shortcutScope.canHandleEscape(e)) {
      e.preventDefault();
      this.closeDropdown(true);
    }
  };

  private onBeforeToggle(e: ToggleEvent): void {
    if (e.newState === "closed" && this.open) {
      this.focusWasInside = this.isFocusInListbox();
      this.dismissedAt = performance.now();
      this.open = false;
    }
  }

  private onToggle(e: ToggleEvent): void {
    const nowOpen = e.newState === "open";
    if (nowOpen !== this.open) {
      if (!nowOpen) {
        this.dismissedAt = performance.now();
      }
      this.open = nowOpen;
    }
  }

  private syncFormValueAndValidity(): void {
    if (!this.internals) return;
    this.internals.setFormValue(this.value ? this.value : null);
    if (this.required && !this.value && !this.isDisabled) {
      this.internals.setValidity(
        { valueMissing: true },
        "Please select an item in the list.",
        this.combobox ?? undefined,
      );
    } else {
      this.internals.setValidity({});
    }
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    this.syncFormValueAndValidity();

    if (changed.has("open")) {
      if (this.open && this.isDisabled) {
        this.open = false;
        return;
      }
      if (this.open && this.listbox && this.combobox) {
        if (this.activeIndex < 0 || this.effectiveOptions[this.activeIndex]?.disabled) {
          this.activeIndex = this.resolveInitialActiveIndex("selected-or-first");
        }
        const triggerWidth = Math.round(this.combobox.getBoundingClientRect().width);
        setHostVar(this, "--_lustrous-select-min-width", `${triggerWidth}px`);
        if (!this.listbox.matches(":popover-open")) {
          this.listbox.showPopover?.();
        }
        this.cleanupPosition?.();
        this.cleanupPosition = autoPosition(
          this.combobox,
          this.listbox,
          () => ({ side: "bottom", align: "start", offset: 4 }),
          ({ anchor }) => {
            setHostVar(this, "--_lustrous-select-min-width", `${Math.round(anchor.width)}px`);
          },
        );
        this.updateComplete.then(() => {
          if (this.open) this.focusOptionAtIndex(this.activeIndex);
        });
      } else if (!this.open) {
        this.cleanupPosition?.();
        this.cleanupPosition = undefined;
        const restore = this.shouldRestoreFocus || this.focusWasInside || this.isFocusInListbox();
        this.shouldRestoreFocus = false;
        this.focusWasInside = false;
        if (this.listbox?.matches(":popover-open")) {
          this.listbox.hidePopover?.();
        }
        if (restore) {
          this.combobox?.focus({ preventScroll: true });
        }
      }
    }
  }

  formResetCallback(): void {
    this.value = this.getAttribute("value") ?? this.initialOptionValue ?? "";
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

  private renderOptionRow(opt: LustrousSelectOption, idx: number, iconSize: "xs" | "s"): TemplateResult {
    const isSelected = opt.value === this.value && this.value !== "";
    const isActive = idx === this.activeIndex;
    return html`<div
      part="option"
      id="${this.uid}-opt-${idx}"
      class="option ${isActive ? "active" : ""}"
      role="option"
      tabindex=${isActive && !opt.disabled ? "0" : "-1"}
      aria-selected=${isSelected ? "true" : "false"}
      aria-disabled=${opt.disabled ? "true" : nothing}
      @pointerenter=${() => {
        if (!opt.disabled) {
          this.activeIndex = idx;
        }
      }}
      @click=${(e: Event) => {
        e.stopPropagation();
        if (!opt.disabled) this.commitSelection(idx);
      }}
    >
      ${opt.icon ? html`<span class="opt-icon" aria-hidden="true">${renderIcon(opt.icon, iconSize)}</span>` : nothing}
      <span class="opt-text">
        <span class="opt-label">${opt.label}</span>
        ${opt.description ? html`<span class="opt-desc">${opt.description}</span>` : nothing}
      </span>
      <span class="opt-check" aria-hidden="true">${isSelected ? renderIcon("check", iconSize) : nothing}</span>
    </div>`;
  }

  private renderOptionsList(iconSize: "xs" | "s"): TemplateResult | TemplateResult[] {
    const opts = this.effectiveOptions;
    if (opts.length === 0) {
      return html`<div class="option" role="option" tabindex="-1" aria-selected="false" aria-disabled="true">
        <span class="opt-text"><span class="opt-label">No options</span></span>
      </div>`;
    }

    const chunks: TemplateResult[] = [];
    let currentGroup: { name: string; id: string; rows: TemplateResult[] } | undefined;
    let groupCounter = 0;

    const flushGroup = () => {
      if (!currentGroup) return;
      chunks.push(html`<div class="group" role="group" aria-labelledby=${currentGroup.id}>
        <div class="group-header" id=${currentGroup.id} role="presentation">${currentGroup.name}</div>
        ${currentGroup.rows}
      </div>`);
      currentGroup = undefined;
    };

    opts.forEach((opt, idx) => {
      const row = this.renderOptionRow(opt, idx, iconSize);
      if (opt.group) {
        if (!currentGroup || currentGroup.name !== opt.group) {
          flushGroup();
          groupCounter += 1;
          currentGroup = { name: opt.group, id: `${this.uid}-grp-${groupCounter}`, rows: [] };
        }
        currentGroup.rows.push(row);
      } else {
        flushGroup();
        chunks.push(row);
      }
    });
    flushGroup();
    return chunks;
  }

  protected override render() {
    const iconSize = this.size === "s" ? "xs" : "s";
    const opts = this.effectiveOptions;
    const selectedOption = this.value !== "" ? opts.find((o) => o.value === this.value) : undefined;
    const msg = this.errorMessage || this.supportingText;
    const hasCaption = !!this.caption || this.hasCaptionSlot;
    const labelId = `${this.uid}-label`;
    const fallbackAriaLabel = !this.label ? this.getAttribute("aria-label") || this.placeholder || "Select" : undefined;

    const rootClasses = [
      "root",
      `size-${this.size}`,
      this.open ? "open" : "",
      this.isError ? "error" : "",
      this.validationState === "success" ? "success" : "",
      this.isDisabled ? "disabled" : "",
    ].join(" ");

    return html`<div class=${rootClasses}>
      <span hidden><slot @slotchange=${() => this.parseLightDomOptions()}></slot></span>
      <div part="header" class="header" ?hidden=${!this.label && !hasCaption}>
        ${this.label
          ? html`<label part="label" id=${labelId} for="combobox" @click=${this.onLabelClick}
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
      <button
        part="field"
        id="combobox"
        class="field"
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded=${this.open ? "true" : "false"}
        aria-controls=${this.listboxId}
        aria-labelledby=${this.label ? labelId : nothing}
        aria-label=${fallbackAriaLabel ?? nothing}
        aria-required=${this.required ? "true" : nothing}
        aria-invalid=${this.isError ? "true" : nothing}
        aria-busy=${this.validationState === "validating" ? "true" : nothing}
        aria-describedby=${msg ? `${this.uid}-msg` : nothing}
        ?disabled=${this.isDisabled}
        @click=${this.onComboboxClick}
        @keydown=${this.onComboboxKeydown}
      >
        ${selectedOption?.icon
          ? html`<span class="lead-icon" aria-hidden="true">${renderIcon(selectedOption.icon, iconSize)}</span>`
          : nothing}
        <span part="value" class="value ${selectedOption ? "" : "placeholder"}">
          ${selectedOption ? selectedOption.label : this.placeholder}
        </span>
        <span class="trail" aria-hidden="true">
          ${this.validationState === "validating"
            ? html`<lustrous-spinner size="xs" ?muted=${this.isDisabled}></lustrous-spinner>`
            : this.validationState === "success" && !this.isError
              ? html`<span class="success-icon">${renderIcon("check", iconSize)}</span>`
              : nothing}
          ${renderChevron(this.open, iconSize, "down")}
        </span>
      </button>
      <div
        part="listbox"
        id=${this.listboxId}
        class="listbox"
        popover="auto"
        role="listbox"
        tabindex="-1"
        data-lustrous-shortcut-scope=""
        aria-labelledby=${this.label ? labelId : nothing}
        aria-label=${fallbackAriaLabel ?? nothing}
        @beforetoggle=${this.onBeforeToggle}
        @toggle=${this.onToggle}
        @keydown=${this.onOpenKeydown}
      >
        ${this.renderOptionsList(iconSize)}
      </div>
      ${msg
        ? html`<div part="supporting" class="supporting">
            <span
              id="${this.uid}-msg"
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
    "lustrous-select": LustrousSelect;
  }
}
