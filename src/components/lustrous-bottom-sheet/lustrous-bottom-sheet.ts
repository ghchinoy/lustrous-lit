import { css, html, nothing, type PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import "../../theme/events.js";
import { LustrousModal } from "../lustrous-modal/lustrous-modal.js";

/** Initial peek fraction of viewport height when content exceeds half the viewport. */
const PEEK_FRACTION = 0.5;
/** Drag distance in pixels past which a vertical drag snaps or dismisses the sheet. */
const SWIPE_THRESHOLD = 80;

/**
 * `<lustrous-bottom-sheet>` — Mobile-first modal sheet rising from the bottom edge.
 *
 * Extends `<lustrous-modal>` (native `<dialog>.showModal()`, top-layer scrim, focus
 * containment, background scroll lock, layered Escape coordination, and focus restoration)
 * and adds snap points (`0.5` peek and `1` full height) plus pointer drag-to-expand and
 * swipe-to-close on the grab handle.
 *
 * @slot - Sheet body content.
 * @slot trigger - Optional trigger element that opens the sheet on click.
 * @fires lustrous-close-request - `CustomEvent<{ reason: "swipe" | "escape" | "scrim" }>` (cancelable).
 * @fires lustrous-toggle - `CustomEvent<{ open: boolean }>` after opening or closing.
 * @csspart dialog - The native `<dialog>`.
 * @csspart viewport - The bottom-aligned viewport wrapper.
 * @csspart sheet - The sheet surface.
 * @csspart handle - The drag handle area.
 * @csspart body - The scrollable content container.
 */
@customElement("lustrous-bottom-sheet")
export class LustrousBottomSheet extends LustrousModal {
  static override styles = [
    ...[LustrousModal.styles].flat(),
    css`
      .viewport {
        align-items: flex-end;
        padding: 0;
      }
      dialog[open] .viewport {
        animation: none;
      }
      .sheet {
        pointer-events: auto;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 640px;
        max-height: calc(100dvh - 72px);
        padding-bottom: env(safe-area-inset-bottom, 16px);
        border-radius: var(--lustrous-radius-2xl) var(--lustrous-radius-2xl) 0 0;
        background-color: var(--lustrous-color-surface-bright);
        color: var(--lustrous-color-on-surface);
        box-shadow: var(--lustrous-elevation-level2);
        transform: translateY(var(--_lustrous-sheet-y, 0px));
        transition: transform var(--lustrous-duration-medium300) var(--lustrous-easing-standard);
        will-change: transform;
      }
      dialog[open] .sheet.entering {
        animation: lustrous-sheet-up var(--lustrous-duration-medium300) var(--lustrous-easing-standard);
      }
      .sheet.dragging {
        transition: none;
      }
      .handle {
        display: flex;
        justify-content: center;
        padding: var(--lustrous-space-m) 0 var(--lustrous-space-xs);
        touch-action: none;
        cursor: grab;
      }
      .handle span {
        width: 36px;
        height: 4px;
        border-radius: var(--lustrous-radius-full);
        background-color: var(--lustrous-color-on-surface-variant);
      }
      .body {
        display: flex;
        flex-direction: column;
        min-height: 0;
        padding: 0 var(--lustrous-space-l) var(--lustrous-space-l);
        overflow-y: hidden;
        overscroll-behavior-y: contain;
      }
      .sheet.expanded .body {
        overflow-y: auto;
      }
      @keyframes lustrous-sheet-up {
        from {
          transform: translateY(100%);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .sheet {
          transition: none;
        }
        dialog[open] .sheet.entering {
          animation: none;
        }
      }
      @media (forced-colors: active) {
        .sheet {
          border: 1px solid CanvasText;
          border-bottom: 0;
        }
        .handle span {
          background-color: ButtonText;
        }
      }
    `,
  ];

  /** Whether the sheet is expanded to its full content height instead of peeking at 50%. */
  @property({ type: Boolean, reflect: true }) expanded = false;

  /**
   * Snap point used when opening: `0.5` peeks at half the viewport height for tall content,
   * while `1` opens fully expanded.
   * @default 0.5
   */
  @property({ type: Number, reflect: true, attribute: "default-snap-point" }) defaultSnapPoint: 0.5 | 1 = 0.5;

  @query(".sheet") private sheet!: HTMLElement;
  @state() private entering = false;
  @state() private dragging = false;
  private dragStartY = 0;
  private dragBaseY = 0;
  private dragDy = 0;
  private ro?: ResizeObserver;
  private enterTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    super();
    if (!this.label) this.label = "Bottom sheet";
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this.enterTimer);
    this.ro?.disconnect();
  }

  private peekOffset(): number {
    const h = this.sheet?.offsetHeight ?? 0;
    return Math.max(0, h - window.innerHeight * PEEK_FRACTION);
  }

  private restingY(): number {
    return this.expanded ? 0 : this.peekOffset();
  }

  private applyY(y: number): void {
    this.sheet?.style.setProperty("--_lustrous-sheet-y", `${Math.max(0, y)}px`);
  }

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (changed.has("open") && this.open) {
      this.entering = true;
      if (this.defaultSnapPoint === 1) this.expanded = true;
    }
    if (changed.has("open") && !this.open && changed.get("open")) {
      this.expanded = this.defaultSnapPoint === 1;
    }
  }

  protected override updated(changed: PropertyValues): void {
    const opening = changed.has("open") && this.open;
    super.updated(changed);
    if (opening) {
      this.ro ??= new ResizeObserver(() => {
        if (!this.dragging) this.applyY(this.restingY());
      });
      this.ro.observe(this.sheet);
      this.applyY(this.restingY());
      clearTimeout(this.enterTimer);
      this.enterTimer = setTimeout(() => {
        this.entering = false;
      }, 320);
    }
    if (changed.has("expanded") && this.open && !opening) {
      this.applyY(this.restingY());
    }
    if (changed.has("open") && !this.open) {
      clearTimeout(this.enterTimer);
      this.ro?.disconnect();
    }
  }

  private onPointerDownHandle(e: PointerEvent): void {
    if (e.button !== 0) return;
    this.dragging = true;
    this.dragStartY = e.clientY;
    this.dragBaseY = this.restingY();
    this.dragDy = 0;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* synthetic pointer events may not have an active pointer */
    }
  }

  private onPointerMoveHandle(e: PointerEvent): void {
    if (!this.dragging) return;
    this.dragDy = e.clientY - this.dragStartY;
    this.applyY(this.dragBaseY + this.dragDy);
  }

  private onPointerUpHandle(): void {
    if (!this.dragging) return;
    this.dragging = false;
    const dy = this.dragDy;
    if (dy < -SWIPE_THRESHOLD / 2) {
      this.expanded = true;
    } else if (dy > SWIPE_THRESHOLD) {
      if (this.expanded && this.peekOffset() > 0) {
        this.expanded = false;
      } else {
        this.swipeClose();
        return;
      }
    }
    this.applyY(this.restingY());
  }

  private swipeClose(): void {
    const ev = new CustomEvent("lustrous-close-request", {
      detail: { reason: "swipe" },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    if (this.dispatchEvent(ev)) this.open = false;
    else this.applyY(this.restingY());
  }

  protected override render() {
    const cls = [
      "sheet",
      this.expanded ? "expanded" : "",
      this.entering ? "entering" : "",
      this.dragging ? "dragging" : "",
    ]
      .filter(Boolean)
      .join(" ");
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
        <div part="viewport" class="viewport">
          <div part="sheet" class=${cls}>
            <div
              part="handle"
              class="handle"
              aria-hidden="true"
              @pointerdown=${this.onPointerDownHandle}
              @pointermove=${this.onPointerMoveHandle}
              @pointerup=${this.onPointerUpHandle}
              @pointercancel=${this.onPointerUpHandle}
            >
              <span></span>
            </div>
            <div part="body" class="body"><slot></slot></div>
          </div>
        </div>
      </dialog>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-bottom-sheet": LustrousBottomSheet;
  }
}
