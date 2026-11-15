import { css, html, nothing, render, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { estimateProseDirection, renderIsolatedTechnicalTokens, resolveDirection } from "../../internal/bidi.js";
import { autoPosition, type FloatingAlign, type FloatingSide } from "../../internal/floating.js";
import { playExpandIn } from "../../internal/motion.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { lustrousBase, lustrousType } from "../../theme/theme.js";

export type LustrousTooltipSide = FloatingSide;

let uid = 0;

/**
 * `<lustrous-tooltip>` — Brief non-interactive hover/focus tooltip rendered in the
 * browser's top layer (`popover="manual"`). Supports `only-when-truncated` and BiDi text.
 *
 * @slot - Trigger element.
 * @fires lustrous-toggle - `CustomEvent<{ open: boolean }>` when opened or closed.
 * @cssprop --lustrous-tooltip-max-width - Maximum bubble width (default 220px).
 */
@customElement("lustrous-tooltip")
export class LustrousTooltip extends LustrousElement {
  static override styles = [
    lustrousBase,
    css`
      :host {
        display: inline-block;
        text-align: inherit;
      }
      ::slotted([slot="bubble"]) {
        position: fixed;
        inset: auto;
        margin: 0;
        border: 0;
        box-sizing: border-box;
        min-width: 40px;
        min-height: 26px;
        max-width: var(--lustrous-tooltip-max-width, 220px);
        max-height: 40vh;
        overflow: hidden;
        padding: var(--lustrous-space-xs) var(--lustrous-space-m);
        border-radius: var(--lustrous-radius-s);
        background-color: var(--lustrous-color-on-surface);
        color: var(--lustrous-color-surface);
        text-align: center;
        overflow-wrap: anywhere;
        pointer-events: none;
        user-select: none;
        z-index: var(--lustrous-z-tooltip);
        transform-origin: var(--_lustrous-transform-origin, center);
        box-shadow: var(--lustrous-elevation-level1);
        ${lustrousType("body-small")}
      }
      ::slotted([slot="bubble"]:not(:popover-open)) {
        display: none;
      }
      @media (forced-colors: active) {
        ::slotted([slot="bubble"]) {
          border: 1px solid CanvasText;
        }
      }
    `,
  ];

  @property() content = "";
  @property({ reflect: true }) side: LustrousTooltipSide = "top";
  @property({ reflect: true }) align: FloatingAlign = "center";
  @property({ type: Number }) offset = 6;
  @property({ type: Number }) delay = 0;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({
    reflect: true,
    attribute: "only-when-truncated",
    converter: {
      fromAttribute: (v: string | null) => v !== null && v !== "false",
      toAttribute: (v: boolean | Element | null) => (v ? "" : null),
    },
  })
  onlyWhenTruncated: boolean | Element | null = false;
  @property({ attribute: false }) truncationTarget?: Element | null;
  @property({ attribute: false }) anchor?: Element | null;
  @property({ type: Boolean, reflect: true }) open = false;

  @state() protected trigger?: HTMLElement;
  protected bubble?: HTMLDivElement;
  protected readonly bubbleId = `lustrous-tooltip-${++uid}`;
  private timer?: ReturnType<typeof setTimeout>;
  private cleanupPosition?: () => void;

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.bubble) {
      this.bubble = document.createElement("div");
      this.bubble.slot = "bubble";
      this.bubble.id = this.bubbleId;
      this.bubble.setAttribute("role", "tooltip");
      this.bubble.setAttribute("popover", "manual");
    }
    if (!this.bubble.isConnected) this.append(this.bubble);
    this.addEventListener("pointerenter", this.onEnter);
    this.addEventListener("pointerleave", this.onLeave);
    this.addEventListener("focusin", this.onFocusIn);
    this.addEventListener("focusout", this.onLeave);
    document.addEventListener("keydown", this.onKeydown);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("pointerenter", this.onEnter);
    this.removeEventListener("pointerleave", this.onLeave);
    this.removeEventListener("focusin", this.onFocusIn);
    this.removeEventListener("focusout", this.onLeave);
    document.removeEventListener("keydown", this.onKeydown);
    clearTimeout(this.timer);
    this.cleanupPosition?.();
  }

  protected get enabled() {
    return !this.disabled && this.descriptionText.trim() !== "";
  }

  protected get descriptionText(): string {
    return this.content;
  }

  protected fillBubble(bubble: HTMLElement): void {
    if (!this.content) {
      render(nothing, bubble);
      return;
    }
    const dir = resolveDirection(estimateProseDirection(this.content));
    render(html`<bdi dir=${dir}>${renderIsolatedTechnicalTokens(this.content, dir)}</bdi>`, bubble);
  }

  protected onPlaced(_bubble: HTMLElement, _placement: Parameters<NonNullable<Parameters<typeof autoPosition>[3]>>[0]): void {}

  private isTruncated(): boolean {
    if (!this.onlyWhenTruncated && !this.truncationTarget) return true;
    const target =
      this.truncationTarget ?? (this.onlyWhenTruncated instanceof Element ? this.onlyWhenTruncated : this.trigger);
    if (!target) return false;
    return target.scrollWidth > target.clientWidth || target.scrollHeight > target.clientHeight;
  }

  private onEnter = () => {
    if (!this.enabled || !this.isTruncated()) return;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (this.enabled && this.isTruncated()) this.open = true;
    }, this.delay);
  };

  private onFocusIn = (e: FocusEvent) => {
    const target = e.composedPath()[0] as Element;
    if (this.enabled && target?.matches?.(":focus-visible") && this.isTruncated()) this.open = true;
  };

  private onLeave = () => {
    clearTimeout(this.timer);
    this.open = false;
  };

  private onKeydown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && this.open) this.open = false;
  };

  private onSlotChange(e: Event) {
    const el = (e.target as HTMLSlotElement).assignedElements()[0] as HTMLElement | undefined;
    this.trigger = el;
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    const bubble = this.bubble!;
    this.fillBubble(bubble);
    const t = this.trigger;
    if (t) {
      const redundant =
        Boolean(this.onlyWhenTruncated || this.truncationTarget) ||
        t.getAttribute("aria-label")?.trim() === this.descriptionText.trim() ||
        t.textContent?.trim() === this.descriptionText.trim();
      if (this.enabled && !redundant && !t.localName.includes("-")) t.setAttribute("aria-describedby", this.bubbleId);
      else if (t.getAttribute("aria-describedby") === this.bubbleId) t.removeAttribute("aria-describedby");
    }
    if (
      changed.has("open") ||
      changed.has("content") ||
      changed.has("disabled") ||
      changed.has("anchor") ||
      changed.has("side")
    ) {
      const show = this.open && this.enabled;
      const anchorEl = this.anchor ?? t ?? this;
      if (show && !bubble.matches(":popover-open")) {
        bubble.showPopover?.();
        this.cleanupPosition?.();
        this.cleanupPosition = autoPosition(
          anchorEl,
          bubble,
          () => ({ side: this.side, align: this.align, offset: this.offset }),
          (placement) => this.onPlaced(bubble, placement),
        );
        playExpandIn(bubble);
      } else if (show && (changed.has("anchor") || changed.has("side"))) {
        this.cleanupPosition?.();
        this.cleanupPosition = autoPosition(
          anchorEl,
          bubble,
          () => ({ side: this.side, align: this.align, offset: this.offset }),
          (placement) => this.onPlaced(bubble, placement),
        );
      } else if (!show && bubble.matches(":popover-open")) {
        this.cleanupPosition?.();
        bubble.hidePopover?.();
      }
      if (changed.has("open") && changed.get("open") !== undefined) {
        this.dispatchEvent(new CustomEvent("lustrous-toggle", { detail: { open: this.open }, bubbles: true, composed: true }));
      }
    }
  }

  protected override render() {
    return html`<slot @slotchange=${this.onSlotChange}></slot><slot name="bubble"></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-tooltip": LustrousTooltip;
  }
}
