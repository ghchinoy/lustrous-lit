import { css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { lustrousSrOnly } from "../../internal/a11y.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { lustrousBase, lustrousFocusRing, lustrousType } from "../../theme/theme.js";
import "../lustrous-icon-button/lustrous-icon-button.js";

export type LustrousCopyEvent = CustomEvent<{ code: string }>;

/**
 * `<lustrous-code-block>` — Dark code surface (`--lustrous-color-code-background`,
 * `--lustrous-color-code-primary-text`, `--lustrous-color-code-outline`) rendered in
 * `--lustrous-font-code` with an optional `label` header, line-wrapping toggle (`wrap`),
 * and clipboard copy `<lustrous-icon-button>` switching from `"copy"` to `"check"` with a
 * polite screen-reader announcement.
 *
 * Reads code from the `code` property, falling back to slotted text content when `code` is empty.
 *
 * @slot - Fallback code text used when `code` is empty.
 * @fires lustrous-copy - `CustomEvent<{ code: string }>` dispatched after copying to the clipboard.
 * @csspart surface - Outer dark code container.
 * @csspart header - Header bar containing the label and copy button.
 * @csspart copy-button - The `<lustrous-icon-button>` clipboard trigger.
 * @csspart pre - Scrollable `<pre>` code region.
 */
@customElement("lustrous-code-block")
export class LustrousCodeBlock extends LustrousElement {
  static override styles = [
    lustrousBase,
    lustrousFocusRing,
    lustrousSrOnly,
    css`
      :host {
        display: block;
      }
      .surface {
        background-color: var(--lustrous-color-code-background);
        color: var(--lustrous-color-code-primary-text);
        border: 1px solid var(--lustrous-color-code-outline);
        border-radius: var(--lustrous-radius-m);
        overflow: hidden;
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--lustrous-space-s);
        min-height: 36px;
        padding: var(--lustrous-space-xs) var(--lustrous-space-s) var(--lustrous-space-xs) var(--lustrous-space-l);
        border-bottom: 1px solid var(--lustrous-color-code-outline);
        color: var(--lustrous-color-code-grey-text);
        ${lustrousType("body-small-emphasized")}
      }
      .label {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .copy-btn {
        margin-inline-start: auto;
        color: var(--lustrous-color-code-primary-text);
      }
      .copy-btn.copied {
        color: var(--lustrous-color-code-green-text);
      }
      pre {
        margin: 0;
        padding: var(--lustrous-space-m) var(--lustrous-space-l);
        background-color: var(--lustrous-color-code-background);
        color: var(--lustrous-color-code-primary-text);
        overflow-x: auto;
        white-space: pre;
        font-family: var(--lustrous-font-code);
        font-size: 13px;
        line-height: 20px;
        font-variant-numeric: tabular-nums;
        tab-size: 2;
      }
      :host([wrap]) pre {
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }
      @media (forced-colors: active) {
        .surface {
          border-color: CanvasText;
        }
        .header {
          border-bottom-color: CanvasText;
        }
      }
    `,
  ];

  /** Optional filename, language, or caption displayed in the header row. */
  @property() label = "";

  /** Code string to display and copy; falls back to slotted text content when empty. */
  @property() code = "";

  /** Wraps long code lines instead of scrolling horizontally. @default false */
  @property({ type: Boolean, reflect: true }) wrap = false;

  /** Hides the clipboard copy button. @default false */
  @property({ type: Boolean, reflect: true, attribute: "no-copy" }) noCopy = false;

  /** Custom accessible label for the copy button. */
  @property({ attribute: "copy-label" }) copyLabel = "";

  @state() private copied = false;
  private resetTimer?: ReturnType<typeof setTimeout>;

  /** Resolved code text from `code` or trimmed slotted text content. */
  get text(): string {
    return this.code || this.textContent?.trim() || "";
  }

  private handleCopy = async (): Promise<void> => {
    const code = this.text;
    try {
      if (!navigator.clipboard?.writeText) return;
      await navigator.clipboard.writeText(code);
    } catch {
      return;
    }
    this.copied = true;
    this.dispatchEvent(
      new CustomEvent<{ code: string }>("lustrous-copy", {
        detail: { code },
        bubbles: true,
        composed: true,
      }),
    );
    clearTimeout(this.resetTimer);
    this.resetTimer = setTimeout(() => {
      this.copied = false;
    }, 1500);
  };

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this.resetTimer);
  }

  protected override render() {
    const showHeader = Boolean(this.label) || !this.noCopy;
    const ariaLabel = this.copyLabel || (this.label ? `Copy ${this.label}` : "Copy code");

    return html`
      <div part="surface" class="surface">
        ${showHeader
          ? html`<div part="header" class="header">
              ${this.label ? html`<span class="label">${this.label}</span>` : nothing}
              ${this.noCopy
                ? nothing
                : html`<lustrous-icon-button
                    part="copy-button"
                    class=${this.copied ? "copy-btn copied" : "copy-btn"}
                    size="xs"
                    variant="on-surface"
                    icon=${this.copied ? "check" : "copy"}
                    aria-label=${ariaLabel}
                    @click=${this.handleCopy}
                  ></lustrous-icon-button>`}
              <span class="sr-only" role="status" aria-live="polite"
                >${this.copied ? "Copied to clipboard" : ""}</span
              >
            </div>`
          : nothing}
        <pre part="pre" class="focus-ring" tabindex="0">${this.code ? this.code : html`<slot></slot>`}</pre>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-code-block": LustrousCodeBlock;
  }
  interface HTMLElementEventMap {
    "lustrous-copy": LustrousCopyEvent;
  }
}
