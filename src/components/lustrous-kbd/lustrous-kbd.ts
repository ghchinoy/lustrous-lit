import { css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { getShortcutKeyLabels, type LustrousShortcutKeyInput } from "../../theme/shortcuts.js";
import { lustrousBase, lustrousType } from "../../theme/theme.js";

export type LustrousKbdSize = "s" | "m";

/**
 * `<lustrous-kbd>` — Semantic `<kbd>` keycap chip or multi-key shortcut chord sequence.
 *
 * Accepts a declarative chord string (`keys="Mod+Shift+K"`), an ordered array of keycap
 * labels (`.keys=${["⇧", "⌘", "K"]}`), or single-key slotted text (`<lustrous-kbd>Esc</lustrous-kbd>`).
 * Multi-key chords render inside a `dir="ltr"` container so modifier order stays consistent
 * in both LTR and RTL documents.
 *
 * @slot - Single keycap label when `keys` is omitted.
 * @csspart group - The `dir="ltr"` flex container around multiple `<kbd>` chips.
 * @csspart key - Each `<kbd>` keycap element.
 */
@customElement("lustrous-kbd")
export class LustrousKbd extends LustrousElement {
  static override styles = [
    lustrousBase,
    css`
      :host {
        display: inline-flex;
        align-items: center;
        vertical-align: middle;
        flex-shrink: 0;
      }
      .group {
        display: inline-flex;
        align-items: center;
        gap: var(--lustrous-space-xs);
        flex-shrink: 0;
      }
      kbd {
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 22px;
        padding: 2px var(--lustrous-space-xs);
        border: 1px solid var(--lustrous-color-outline-variant);
        border-radius: var(--lustrous-radius-xs);
        background-color: var(--lustrous-color-surface-container);
        color: var(--lustrous-color-on-surface);
        box-shadow: 0 1px 0 0 var(--lustrous-color-outline-variant);
        font-family: var(--lustrous-font-code);
        font-size: 12px;
        line-height: 16px;
        font-weight: 500;
        text-align: center;
        white-space: nowrap;
      }
      :host([size="m"]) kbd {
        min-width: 28px;
        padding: var(--lustrous-space-xs) var(--lustrous-space-s);
        border-radius: var(--lustrous-radius-s);
        ${lustrousType("code")}
      }
      kbd[hidden] {
        display: none;
      }
      @media (forced-colors: active) {
        kbd {
          border: 1px solid CanvasText;
          box-shadow: none;
        }
      }
    `,
  ];

  /**
   * Shortcut chord string (e.g. `"Mod+K"`, formatted automatically per platform) or
   * pre-split keycap array (e.g. `["⇧", "⌘", "O"]`).
   */
  @property({
    converter: {
      fromAttribute: (v: string | null) => v ?? undefined,
      toAttribute: (v: LustrousShortcutKeyInput | undefined) => (typeof v === "string" ? v : null),
    },
  })
  keys?: LustrousShortcutKeyInput;

  /** Visual scale: `s` (inline / menu compact, default) or `m` (shortcut reference modal). */
  @property({ reflect: true }) size: LustrousKbdSize = "s";

  @state() private hasSlottedContent = true;

  override connectedCallback(): void {
    super.connectedCallback();
    this.syncSlottedContent();
  }

  private syncSlottedContent(): void {
    if (typeof this.querySelector !== "function") return;
    this.hasSlottedContent = (this.textContent ?? "").trim().length > 0 || this.children.length > 0;
  }

  private onSlotChange(): void {
    this.syncSlottedContent();
  }

  private resolvedKeycaps(): readonly string[] | undefined {
    if (this.keys === undefined) return undefined;
    if (typeof this.keys === "string") {
      return getShortcutKeyLabels(this.keys);
    }
    if (this.keys.length === 0) return [];
    if (this.keys.some((k) => k.length > 1 && k.includes("+"))) {
      return getShortcutKeyLabels(this.keys);
    }
    return this.keys;
  }

  protected override render() {
    const caps = this.resolvedKeycaps();
    if (caps !== undefined) {
      if (caps.length === 0) return nothing;
      return html`<span part="group" class="group" dir="ltr"
        >${caps.map((key) => html`<kbd part="key">${key}</kbd>`)}</span
      >`;
    }
    return html`<kbd part="key" ?hidden=${!this.hasSlottedContent}
      ><slot @slotchange=${this.onSlotChange}></slot
    ></kbd>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-kbd": LustrousKbd;
  }
}
