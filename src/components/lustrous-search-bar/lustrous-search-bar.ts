import { css, html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { live } from "lit/directives/live.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { lustrousBase, lustrousType } from "../../theme/theme.js";
import { renderIcon, type LustrousIconName } from "../lustrous-icon/lustrous-icon.js";
import "../lustrous-icon-button/lustrous-icon-button.js";

export type LustrousSearchBarVariant = "floating" | "outlined" | "transparent";
export type LustrousSearchBarSize = "m" | "s";

/** Detail of the `lustrous-search` event. */
export type LustrousSearchEvent = CustomEvent<{ value: string }>;

/**
 * `<lustrous-search-bar>` — Form-associated toolbar and page search input.
 *
 * - Leading `search` icon (decorative `aria-hidden="true"` so screen readers do not repeat "Search").
 * - Shows a clear `<lustrous-icon-button icon="close" size="s">` when `value` is non-empty.
 * - Pressing `Enter` dispatches `lustrous-search` (`{ value }`).
 * - Pressing `Escape` clears a non-empty query (keeping focus) or blurs an empty input.
 *
 * @slot trailing - Optional trailing actions rendered after the clear button.
 * @fires input - Native `input` event on each edit (composed).
 * @fires lustrous-search - `CustomEvent<{ value: string }>` when Enter is pressed (`bubbles: true, composed: true`).
 * @fires lustrous-clear - `CustomEvent<void>` when the built-in clear action runs (`bubbles: true, composed: true`).
 * @csspart surface - The outer pill container.
 * @csspart input - The native `<input type="search">`.
 * @csspart clear - The clear `<lustrous-icon-button>`.
 */
@customElement("lustrous-search-bar")
export class LustrousSearchBar extends LustrousElement {
  static formAssociated = true;
  static override shadowRootOptions: ShadowRootInit = { ...LustrousElement.shadowRootOptions, delegatesFocus: true };

  static override styles = [
    lustrousBase,
    css`
      :host {
        display: block;
        min-width: 0;
      }
      .surface {
        position: relative;
        display: flex;
        align-items: center;
        gap: var(--lustrous-space-xs);
        width: 100%;
        height: 44px;
        padding-inline: var(--lustrous-space-xs);
        border-radius: var(--lustrous-radius-full);
        color: var(--lustrous-color-on-surface);
        cursor: text;
        transition:
          border-color 150ms cubic-bezier(0.2, 0, 0, 1),
          box-shadow 150ms cubic-bezier(0.2, 0, 0, 1),
          background-color 150ms cubic-bezier(0.2, 0, 0, 1);
        ${lustrousType("body-medium")}
      }
      .size-s {
        height: 36px;
        padding-inline: 0;
        ${lustrousType("body-small")}
      }
      .floating {
        border: 1px solid var(--lustrous-color-outline);
        background-color: var(--lustrous-color-surface-bright);
        box-shadow: var(--lustrous-elevation-level1);
      }
      .outlined {
        border: 1px solid var(--lustrous-color-outline);
        background-color: var(--lustrous-color-surface);
      }
      .transparent {
        border: 1px solid transparent;
        background-color: transparent;
      }
      .surface:not(.disabled):not(.transparent):hover {
        border-color: var(--lustrous-color-on-surface);
      }
      .surface:not(.disabled):has(input:focus-visible),
      .surface.focused:not(.disabled) {
        border-color: var(--lustrous-color-primary);
        outline: 2px solid var(--lustrous-color-primary);
        outline-offset: -2px;
      }
      .lead {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 36px;
        height: 36px;
        color: var(--lustrous-color-on-surface-variant);
      }
      input {
        all: unset;
        box-sizing: border-box;
        flex: 1 1 auto;
        min-width: 0;
        width: 100%;
        height: 100%;
        color: inherit;
        caret-color: var(--lustrous-color-on-surface);
      }
      input::placeholder {
        color: var(--lustrous-color-on-surface-variant);
        opacity: 1;
      }
      input::-webkit-search-cancel-button {
        display: none;
      }
      .actions {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
      }
      .disabled {
        cursor: not-allowed;
        box-shadow: none;
      }
      .disabled.floating,
      .disabled.outlined {
        border-color: var(--lustrous-color-state-disabled);
        background-color: var(--lustrous-color-surface-dim);
      }
      .disabled input,
      .disabled input::placeholder,
      .disabled .lead {
        cursor: not-allowed;
        color: var(--lustrous-color-state-disabled-label);
      }
      @media (forced-colors: active) {
        .floating,
        .outlined {
          border-color: ButtonBorder;
          background-color: Field;
          color: FieldText;
        }
        .surface:not(.disabled):has(input:focus-visible),
        .surface.focused:not(.disabled) {
          border-color: Highlight;
          outline-color: Highlight;
        }
        .disabled.floating,
        .disabled.outlined,
        .disabled input,
        .disabled .lead {
          border-color: GrayText;
          color: GrayText;
        }
      }
    `,
  ];

  @property() value = "";
  @property() placeholder = "Search";
  @property({ reflect: true }) icon: LustrousIconName = "search";
  @property({ reflect: true }) variant: LustrousSearchBarVariant = "floating";
  @property({ reflect: true }) size: LustrousSearchBarSize = "m";
  @property({ attribute: "show-clear" }) showClear: "auto" | "false" = "auto";
  @property({ attribute: "clear-label" }) clearLabel = "Clear search";
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ reflect: true }) name?: string;

  @state() private focused = false;
  @state() private formDisabled = false;

  @query("input") private input!: HTMLInputElement;
  private readonly internals: ElementInternals | undefined =
    typeof this.attachInternals === "function" ? this.attachInternals() : undefined;

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

  protected override updated(): void {
    this.internals?.setFormValue(this.value);
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

  private onInput(): void {
    this.value = this.input.value;
  }

  private onKeydown(e: KeyboardEvent): void {
    if (e.key === "Enter") {
      this.dispatchEvent(
        new CustomEvent("lustrous-search", {
          detail: { value: this.value },
          bubbles: true,
          composed: true,
        }),
      );
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      if (this.value.length > 0 && !this.isDisabled) {
        e.stopPropagation();
        this.clear();
      } else {
        this.input.blur();
      }
    }
  }

  private onSurfaceClick(e: MouseEvent): void {
    if (this.isDisabled || !this.input) return;
    for (const n of e.composedPath()) {
      if (n === this.input || n === e.currentTarget) break;
      if (n instanceof Element && n.matches('button, a, [role="button"], lustrous-button, lustrous-icon-button')) {
        return;
      }
    }
    this.input.focus();
  }

  /** Clears the current query, dispatches `input` + `lustrous-clear`, and focuses the input. */
  clear(): void {
    if (this.isDisabled) return;
    this.value = "";
    if (this.input) this.input.value = "";
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    this.dispatchEvent(new CustomEvent("lustrous-clear", { bubbles: true, composed: true }));
    this.input?.focus();
  }

  protected override render() {
    const ariaLabel = this.getAttribute("aria-label") || this.placeholder || "Search";
    const showClear = this.showClear !== "false" && this.value.length > 0 && !this.isDisabled;
    const classes = [
      "surface",
      this.variant,
      `size-${this.size}`,
      this.focused ? "focused" : "",
      this.isDisabled ? "disabled" : "",
    ].join(" ");

    return html`<div part="surface" class=${classes} @click=${this.onSurfaceClick}>
      <span class="lead" aria-hidden="true">${renderIcon(this.icon, "s")}</span>
      <input
        part="input"
        type="search"
        enterkeyhint="search"
        autocomplete="off"
        dir="auto"
        .value=${live(this.value)}
        placeholder=${this.placeholder}
        aria-label=${ariaLabel}
        ?disabled=${this.isDisabled}
        @input=${this.onInput}
        @keydown=${this.onKeydown}
        @focus=${() => (this.focused = true)}
        @blur=${() => (this.focused = false)}
      />
      <span class="actions">
        ${showClear
          ? html`<lustrous-icon-button
              part="clear"
              icon="close"
              size="s"
              variant="on-surface-variant"
              aria-label=${this.clearLabel}
              @click=${(e: Event) => {
                e.stopPropagation();
                this.clear();
              }}
            ></lustrous-icon-button>`
          : nothing}
        <slot name="trailing"></slot>
      </span>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-search-bar": LustrousSearchBar;
  }
  interface HTMLElementEventMap {
    "lustrous-search": LustrousSearchEvent;
    "lustrous-clear": CustomEvent<void>;
  }
}
