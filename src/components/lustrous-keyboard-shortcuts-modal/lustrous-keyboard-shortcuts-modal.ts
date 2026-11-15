import { css, html, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { getLustrousLabels } from "../../theme/labels.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import type { LustrousShortcutKeyInput } from "../../theme/shortcuts.js";
import { lustrousBase, lustrousType } from "../../theme/theme.js";
import type { LustrousDialogSize } from "../lustrous-dialog/lustrous-dialog.js";
import "../lustrous-dialog/lustrous-dialog.js";
import "../lustrous-kbd/lustrous-kbd.js";

/** One shortcut entry rendered inside `<lustrous-keyboard-shortcuts-modal>`. */
export interface LustrousKeyboardShortcutRow {
  readonly id?: string;
  readonly description: string;
  readonly keys: LustrousShortcutKeyInput;
}
export type KeyboardShortcutRowItem = LustrousKeyboardShortcutRow;

/** A titled group of shortcut entries inside `<lustrous-keyboard-shortcuts-modal>`. */
export interface LustrousKeyboardShortcutSection {
  readonly id?: string;
  readonly title: string;
  readonly rows: readonly LustrousKeyboardShortcutRow[];
}
export type KeyboardShortcutSectionItem = LustrousKeyboardShortcutSection;

/**
 * `<lustrous-keyboard-shortcuts-modal>` — Modal shortcut reference dialog built on
 * `<lustrous-dialog modal>` and `<lustrous-kbd size="m">`.
 *
 * Renders grouped `<section>`, `<dl>`, `<dt>`, and `<dd>` tables from `.sections`
 * (automatically omitting empty sections) and pauses background shortcuts while open.
 *
 * @slot - Optional supplementary content below the shortcut sections.
 * @slot trigger - Optional trigger element that opens the modal on click.
 * @fires lustrous-toggle - `CustomEvent<{ open: boolean }>` when opened or closed.
 * @fires lustrous-close-request - `CustomEvent<{ reason: "escape" | "scrim" | "dismiss" }>` (cancelable).
 * @fires lustrous-action - `CustomEvent<{ action: "secondary" }>` (cancelable) when the close action is clicked.
 * @csspart dialog - The inner `<lustrous-dialog>`.
 * @csspart sections - The vertical stack of sections.
 * @csspart section - Each `<section>` group.
 * @csspart section-title - Each section's `<h3>` heading.
 * @csspart row - Each `<dt>` / `<dd>` flex row.
 */
@customElement("lustrous-keyboard-shortcuts-modal")
export class LustrousKeyboardShortcutsModal extends LustrousElement {
  static override styles = [
    lustrousBase,
    css`
      :host {
        display: contents;
      }
      .sections {
        display: flex;
        flex-direction: column;
        gap: var(--lustrous-space-l);
        width: 100%;
      }
      .section-title {
        margin: 0 0 var(--lustrous-space-s);
        color: var(--lustrous-color-on-surface-variant);
        ${lustrousType("body-small-emphasized")}
      }
      .list {
        margin: 0;
      }
      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--lustrous-space-m);
        padding-block: var(--lustrous-space-xs);
      }
      .term {
        min-width: 0;
        color: var(--lustrous-color-on-surface);
        ${lustrousType("body-medium")}
      }
      .keys {
        margin: 0;
        flex-shrink: 0;
      }
    `,
  ];

  @property({ type: Boolean, reflect: true }) open = false;
  @property() heading = "Keyboard shortcuts";
  @property({ reflect: true }) size: LustrousDialogSize = "m";
  @property({ type: Boolean, reflect: true }) dismissible = false;
  @property({ attribute: "close-label" }) closeLabel = "";
  @property({ attribute: false }) sections: readonly LustrousKeyboardShortcutSection[] = [];
  @property({ attribute: false }) returnFocus?: HTMLElement | null;
  @property({ attribute: false }) initialFocus?: HTMLElement | null;

  show(): void {
    this.open = true;
  }

  hide(): void {
    this.open = false;
  }

  private onDialogToggle(e: CustomEvent<{ open: boolean }>): void {
    if (e.target !== e.currentTarget) return;
    e.stopPropagation();
    if (this.open !== e.detail.open) this.open = e.detail.open;
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    if (changed.has("open") && changed.get("open") !== undefined) {
      this.dispatchEvent(
        new CustomEvent("lustrous-toggle", {
          detail: { open: this.open },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  protected override render() {
    const resolvedCloseLabel = this.closeLabel || getLustrousLabels().close;
    const visibleSections = this.sections.filter((section) => section.rows.length > 0);

    return html`<lustrous-dialog
      part="dialog"
      modal
      .open=${this.open}
      heading=${this.heading}
      size=${this.size}
      ?dismissible=${this.dismissible}
      close-label=${resolvedCloseLabel}
      secondary-action=${resolvedCloseLabel}
      .returnFocus=${this.returnFocus}
      .initialFocus=${this.initialFocus}
      @lustrous-toggle=${this.onDialogToggle}
    >
      <slot name="trigger" slot="trigger"></slot>
      <div part="sections" class="sections">
        ${visibleSections.map(
          (section) => html`<section part="section" class="section">
            <h3 part="section-title" class="section-title">${section.title}</h3>
            <dl class="list">
              ${section.rows.map(
                (row) => html`<div part="row" class="row">
                  <dt class="term">${row.description}</dt>
                  <dd class="keys" dir="ltr"><lustrous-kbd size="m" .keys=${row.keys}></lustrous-kbd></dd>
                </div>`,
              )}
            </dl>
          </section>`,
        )}
      </div>
      <slot></slot>
    </lustrous-dialog>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-keyboard-shortcuts-modal": LustrousKeyboardShortcutsModal;
  }
}
