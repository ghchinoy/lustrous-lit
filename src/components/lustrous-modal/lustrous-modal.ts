import { css, html, nothing, type PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { composedContains, firstFocusable } from "../../internal/floating.js";
import { spacingRules, toCss } from "../../internal/style-gen.js";
import type { LustrousCloseReason } from "../../theme/events.js";
import "../../theme/events.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { LustrousShortcutScopeController } from "../../theme/shortcuts.js";
import { lustrousBase } from "../../theme/theme.js";
import type { LustrousPaddingValue } from "../lustrous-box/lustrous-box.js";

let scrollLocks = 0;

function findFlat(nodes: Iterable<Element>, match: (el: Element) => boolean): HTMLElement | undefined {
  for (const n of nodes) {
    if (n instanceof HTMLSlotElement) {
      const r = findFlat(n.assignedElements({ flatten: true }), match);
      if (r) return r;
      continue;
    }
    if (match(n)) return n as HTMLElement;
    const r = findFlat(n.children, match);
    if (r) return r;
  }
  return undefined;
}

/**
 * `<lustrous-modal>` — Accessible modal primitive built on native `<dialog>.showModal()`.
 * Locks background scroll, renders in the top layer with a themed scrim, coordinates
 * layered Escape dismissal via `ShortcutManager`, and restores focus on close.
 *
 * @slot - Modal surface content.
 * @slot trigger - Optional trigger element that opens the modal on click.
 * @fires lustrous-close-request - `CustomEvent<{ reason: "escape" | "scrim" }>` (cancelable).
 * @fires lustrous-toggle - `CustomEvent<{ open: boolean }>` after opening or closing.
 * @csspart dialog - The native `<dialog>`.
 * @csspart viewport - The centering viewport container.
 */
@customElement("lustrous-modal")
export class LustrousModal extends LustrousElement {
  static override styles = [
    lustrousBase,
    css`
      :host {
        display: contents;
      }
      dialog {
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        max-width: none;
        max-height: none;
        margin: 0;
        padding: 0;
        border: 0;
        background: transparent;
        color: var(--lustrous-color-on-surface);
        overflow: hidden;
        outline: none;
      }
      dialog::backdrop {
        background-color: var(--lustrous-color-scrim);
      }
      :host([scrim="immersive"]) dialog::backdrop {
        background-color: var(--lustrous-color-scrim-immersive);
      }
      :host([scrim-blur]) dialog::backdrop {
        backdrop-filter: blur(4px);
      }
      dialog[open] {
        display: block;
      }
      dialog[open]::backdrop {
        animation: lustrous-modal-fade 180ms ease;
      }
      .viewport {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        padding: var(--lustrous-space-m);
        pointer-events: none;
      }
      dialog[open] .viewport {
        animation: lustrous-modal-in 180ms cubic-bezier(0.2, 0, 0, 1);
      }
      ::slotted(:not([slot])) {
        pointer-events: auto;
      }
      @keyframes lustrous-modal-fade {
        from {
          opacity: 0;
        }
      }
      @keyframes lustrous-modal-in {
        from {
          opacity: 0;
          transform: scale(0.96);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        dialog[open]::backdrop,
        dialog[open] .viewport {
          animation: none;
        }
      }
    `,
    toCss(spacingRules("padding", ".viewport")),
  ];

  @property({ type: Boolean, reflect: true }) open = false;
  @property() label = "";
  @property({ reflect: true }) padding?: LustrousPaddingValue;
  @property({ reflect: true }) scrim: "default" | "immersive" = "default";
  @property({ type: Boolean, reflect: true, attribute: "scrim-blur" }) scrimBlur = false;
  @property({ attribute: false }) returnFocus?: HTMLElement | null;
  @property({ attribute: false }) initialFocus?: HTMLElement | null;

  @query("dialog") protected dialog!: HTMLDialogElement;
  protected static managesShortcutScope = true;
  protected readonly shortcutScope = new LustrousShortcutScopeController(this, {
    active: false,
    ignoreScopeRegistrations: !(this.constructor as typeof LustrousModal).managesShortcutScope,
  });
  private returnTo: HTMLElement | null = null;
  private pointerDownOnScrim = false;
  private trigger?: HTMLElement;
  private locked = false;

  show(): void {
    this.open = true;
  }
  hide(): void {
    this.open = false;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("keydown", this.onDocumentEscapeKeydown);
    this.shortcutScope.setActive((this.constructor as typeof LustrousModal).managesShortcutScope && this.open);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("keydown", this.onDocumentEscapeKeydown);
    this.unlockScroll();
  }

  private static deepActive(): HTMLElement | null {
    let a: Element | null = document.activeElement;
    while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
    return a instanceof HTMLElement ? a : null;
  }

  private lockScroll() {
    if (this.locked) return;
    this.locked = true;
    if (scrollLocks++ === 0) document.documentElement.style.setProperty("overflow", "hidden");
  }

  private unlockScroll() {
    if (!this.locked) return;
    this.locked = false;
    if (--scrollLocks === 0) document.documentElement.style.removeProperty("overflow");
  }

  protected requestClose(reason: LustrousCloseReason): void {
    const ev = new CustomEvent("lustrous-close-request", {
      detail: { reason },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    if (this.dispatchEvent(ev)) this.open = false;
  }

  private onDocumentEscapeKeydown = (e: KeyboardEvent) => {
    if (!this.open || e.key !== "Escape" || e.defaultPrevented) return;
    if (!this.shortcutScope.canHandleEscape(e)) return;
    if (!e.isTrusted) {
      e.preventDefault();
      this.requestClose("escape");
    }
  };

  protected onCancel(e: Event) {
    e.preventDefault();
    if (!this.open || !this.shortcutScope.canHandleEscape(e)) return;
    this.requestClose("escape");
  }

  protected onNativeClose() {
    if (!this.open || !this.isConnected) return;
    if (!this.shortcutScope.canHandleEscape()) {
      this.dialog.showModal();
      return;
    }
    const ev = new CustomEvent("lustrous-close-request", {
      detail: { reason: "escape" },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    if (this.dispatchEvent(ev)) this.open = false;
    else this.dialog.showModal();
  }

  protected onPointerDown(e: PointerEvent) {
    this.pointerDownOnScrim = e.target === this.dialog || (e.target as Element).classList?.contains("viewport");
  }

  protected onClick(e: MouseEvent) {
    const onScrim = e.target === this.dialog || (e.target as Element).classList?.contains("viewport");
    if (onScrim && this.pointerDownOnScrim) this.requestClose("scrim");
    this.pointerDownOnScrim = false;
  }

  protected onTriggerSlotChange(e: Event) {
    const el = (e.target as HTMLSlotElement).assignedElements({ flatten: true })[0] as HTMLElement | undefined;
    if (el === this.trigger) return;
    this.trigger?.removeEventListener("click", this.onTriggerClick);
    this.trigger = el;
    el?.addEventListener("click", this.onTriggerClick);
    el?.setAttribute("aria-haspopup", "dialog");
  }

  private onTriggerClick = () => {
    if (!(this.trigger as HTMLElement & { disabled?: boolean })?.disabled) this.open = true;
  };

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (changed.has("open")) {
      this.shortcutScope.setActive((this.constructor as typeof LustrousModal).managesShortcutScope && this.open);
    }
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    if (!changed.has("open")) return;
    const d = this.dialog;
    if (this.open && !d.open) {
      this.returnTo = LustrousModal.deepActive();
      d.showModal();
      this.lockScroll();
      const slot = this.renderRoot.querySelector<HTMLSlotElement>("slot:not([name])");
      const nodes = slot?.assignedElements({ flatten: true }) ?? [];
      const auto = findFlat(nodes, (n) => n.hasAttribute("autofocus"));
      const explicit = this.initialFocus?.isConnected ? this.initialFocus : undefined;
      const target = explicit ?? auto ?? findFlat(nodes, (n) => !n.hasAttribute("disabled") && firstFocusable([n]) === n);
      if (target) target.focus({ preventScroll: true });
      else d.focus({ preventScroll: true });
    } else if (!this.open) {
      if (d.open) d.close();
      this.unlockScroll();
      const active = LustrousModal.deepActive();
      const lost = !active || active === document.body || composedContains(this, active);
      const usable = (el: HTMLElement | null | undefined): el is HTMLElement => !!el && el.isConnected && el !== document.body;
      const target = [this.returnFocus, this.returnTo, this.trigger].find(usable);
      if (lost && target) target.focus({ preventScroll: true });
      this.returnTo = null;
    }
    if (changed.get("open") !== undefined) {
      this.dispatchEvent(new CustomEvent("lustrous-toggle", { detail: { open: this.open }, bubbles: true, composed: true }));
    }
  }

  protected override render() {
    return html`<slot name="trigger" @slotchange=${this.onTriggerSlotChange}></slot>
      <dialog
        part="dialog"
        tabindex="-1"
        aria-modal="true"
        data-lustrous-shortcut-scope=""
        aria-label=${this.label || nothing}
        @cancel=${this.onCancel}
        @close=${this.onNativeClose}
        @pointerdown=${this.onPointerDown}
        @click=${this.onClick}
      >
        <div part="viewport" class="viewport"><slot></slot></div>
      </dialog>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-modal": LustrousModal;
  }
}
