import { css, html, nothing, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { live } from "lit/directives/live.js";
import { lustrousType } from "../../theme/theme.js";
import { LustrousTextInput } from "../lustrous-text-input/lustrous-text-input.js";

/**
 * `<lustrous-text-area>` — Form-associated multi-line outlined textarea extending `LustrousTextInput`.
 *
 * Inherits `label`, `caption`, `value`, `size`, `border-radius`, `placeholder`, `supporting-text`,
 * `error`, `validation-state`, `leading-icon` / `slot="leading"`, `trailing-icon` / `slot="trailing"`,
 * `leading-text` / `trailing-text`, `character-count`, `maxlength` / `minlength`, `required`,
 * `disabled`, `readonly`, `name`, `autocomplete`, vertical overflow edge fades, and form reset, plus:
 * - `rows` (default `4`), `min-rows`, `max-rows`
 * - `auto-grow` (default `true`): expands between `min-rows` and `max-rows` as the user types
 * - `resize` (`"none" | "vertical" | "horizontal" | "both"`): resize handle when `auto-grow="false"`
 *
 * @slot leading - Custom leading content replacing `leading-icon`.
 * @slot trailing - Trailing action replacing `trailing-icon` and status indicators.
 * @slot caption - Rich caption content at the end of the header row.
 * @fires input - Native `input` event on each edit (composed).
 * @fires change - Native-style `change` event on commit (bubbles).
 */
@customElement("lustrous-text-area")
export class LustrousTextArea extends LustrousTextInput {
  static override styles = [
    ...LustrousTextInput.styles,
    css`
      .multiline .field {
        align-items: stretch;
        min-height: 0;
        padding: 0;
        overflow: hidden;
      }
      .multiline .slot.leading {
        margin-block: var(--lustrous-space-xs);
        margin-inline: var(--lustrous-space-xs) 0;
      }
      .multiline .slot.trailing {
        margin-block: var(--lustrous-space-xs);
        margin-inline: 0 var(--lustrous-space-xs);
      }
      .multiline .affix {
        margin-block: var(--lustrous-space-xs);
      }
      .multiline .affix.leading-text {
        padding-inline-start: var(--lustrous-space-m);
      }
      .multiline .affix.trailing-text {
        padding-inline-end: var(--lustrous-space-m);
      }
      .multiline.has-leading-icon .affix.leading-text,
      .multiline.has-trailing-slot .affix.trailing-text {
        padding-inline: 0;
      }
      textarea.control {
        display: block;
        flex-grow: 1;
        width: 100%;
        height: auto;
        min-height: 42px;
        padding: var(--lustrous-space-m);
        resize: none;
        overflow-y: auto;
        white-space: pre-wrap;
        scrollbar-width: thin;
        scrollbar-color: var(--lustrous-color-outline-variant) transparent;
        ${lustrousType("body-medium")}
      }
      .size-s textarea.control {
        min-height: 34px;
        ${lustrousType("body-small")}
      }
      .has-leading textarea.control {
        padding-inline-start: var(--lustrous-space-s);
      }
      .has-trailing textarea.control {
        padding-inline-end: var(--lustrous-space-s);
      }
      textarea.control::-webkit-scrollbar {
        width: 12px;
      }
      textarea.control::-webkit-scrollbar-button {
        display: none;
        width: 0;
        height: 0;
      }
      textarea.control::-webkit-scrollbar-thumb {
        border: 4px solid transparent;
        border-radius: var(--lustrous-radius-full);
        background-clip: padding-box;
        background-color: var(--lustrous-color-outline-variant);
      }
      textarea.control::-webkit-scrollbar-track {
        margin-block: var(--lustrous-space-s);
        background-color: transparent;
      }
      .resize-vertical textarea.control {
        resize: vertical;
      }
      .resize-horizontal textarea.control {
        resize: horizontal;
      }
      .resize-both textarea.control {
        resize: both;
      }
    `,
  ];

  /** Visible line count when resting. @default 4 */
  @property({ type: Number }) rows = 4;
  /** Minimum line count when `auto-grow` is enabled. @default rows */
  @property({ type: Number, attribute: "min-rows" }) minRows?: number;
  /** Maximum line count when `auto-grow` is enabled; scrolls beyond this height. */
  @property({ type: Number, attribute: "max-rows" }) maxRows?: number;
  /** Automatically grow and shrink with content (`auto-grow="false"` to disable). @default true */
  @property({
    attribute: "auto-grow",
    converter: {
      fromAttribute: (v: string | null) => v !== "false",
      toAttribute: (v: boolean) => (v ? null : "false"),
    },
  })
  autoGrow = true;
  /** CSS resize handle when `auto-grow` is disabled. @default "none" */
  @property() resize: "none" | "vertical" | "horizontal" | "both" = "none";

  private resizeObserver?: ResizeObserver;
  private lastWidth = 0;

  protected override rootClasses(): string {
    return `multiline ${!this.autoGrow && this.resize !== "none" ? `resize-${this.resize}` : ""}`;
  }

  protected override get scrimAxis(): "x" | "y" {
    return "y";
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (typeof ResizeObserver !== "undefined" && !this.resizeObserver) {
      this.resizeObserver = new ResizeObserver((entries) => {
        const width = entries[entries.length - 1]?.contentRect.width ?? 0;
        if (width === this.lastWidth) return;
        this.lastWidth = width;
        if (this.autoGrow) requestAnimationFrame(() => this.adjustHeight());
      });
    }
    this.resizeObserver?.observe(this);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
  }

  protected override onInput(): void {
    super.onInput();
    if (this.autoGrow) this.adjustHeight();
    this.updateOverflow();
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    const layoutChanged =
      changed.has("rows") ||
      changed.has("minRows") ||
      changed.has("maxRows") ||
      changed.has("autoGrow") ||
      changed.has("size");
    if (layoutChanged || (this.autoGrow && changed.has("value"))) {
      this.adjustHeight();
      this.updateOverflow();
    }
  }

  private adjustHeight(): void {
    const ta = this.input as HTMLTextAreaElement | undefined;
    if (!ta?.style) return;
    if (!this.autoGrow) {
      ta.style.removeProperty("height");
      ta.style.removeProperty("overflow-y");
      return;
    }
    const lineHeight = this.size === "s" ? 18 : 22;
    const padding = 24;
    const min = (this.minRows ?? this.rows) * lineHeight + padding;
    const max = this.maxRows !== undefined ? this.maxRows * lineHeight + padding : Infinity;
    const prevScroll = ta.scrollTop;
    ta.style.setProperty("height", "0px");
    const scrollHeight = ta.scrollHeight;
    const target = Math.min(Math.max(scrollHeight, min), max);
    ta.style.setProperty("height", `${target}px`);
    ta.style.setProperty("overflow-y", scrollHeight > max ? "auto" : "hidden");
    ta.scrollTop = prevScroll;
  }

  protected override renderControl(msg: string) {
    return html`<textarea
      part="input"
      class="control ${this.scrimClass}"
      id="input"
      .value=${live(this.value)}
      rows=${this.rows}
      dir="auto"
      placeholder=${this.placeholder || nothing}
      ?disabled=${this.isDisabled}
      ?required=${this.required}
      ?readonly=${this.readonly}
      maxlength=${ifDefined(this.maxlength)}
      minlength=${ifDefined(this.minlength)}
      autocomplete=${ifDefined(this.autocomplete as AutoFill | undefined)}
      aria-label=${this.controlAriaLabel ?? nothing}
      aria-invalid=${this.isError ? "true" : nothing}
      aria-busy=${this.validationState === "validating" ? "true" : nothing}
      aria-describedby=${msg ? `${this.uid}-msg` : nothing}
      @input=${this.onInput}
      @change=${this.onChange}
      @scroll=${this.updateOverflow}
      @focus=${this.onFocus}
      @blur=${this.onBlur}
    ></textarea>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-text-area": LustrousTextArea;
  }
}
