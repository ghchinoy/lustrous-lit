import { css, html, nothing, svg, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import {
  allFocusable,
  autoPosition,
  composedContains,
  firstFocusable,
  floatingResetCss,
  type FloatingAlign,
  type FloatingOptions,
  type FloatingSide,
} from "../../internal/floating.js";
import { expandInCss } from "../../internal/motion.js";
import { setHostVar, toCss } from "../../internal/style-gen.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { LustrousViewportController } from "../../theme/media.js";
import { LustrousShortcutScopeController } from "../../theme/shortcuts.js";
import { lustrousBase, lustrousType } from "../../theme/theme.js";
import "../lustrous-bottom-sheet/lustrous-bottom-sheet.js";
import type { LustrousPaddingValue } from "../lustrous-box/lustrous-box.js";
import "../lustrous-button/lustrous-button.js";
import "../lustrous-icon-button/lustrous-icon-button.js";

export type LustrousPopoverSide = FloatingSide;
export type LustrousPopoverSize = "s" | "m" | "l";
export type LustrousPopoverActionEvent = CustomEvent<{ action: "primary" | "secondary" }>;
export type { LustrousToggleEvent } from "../../theme/events.js";

const ARROW_CENTER = svg`<svg class="arrow center" aria-hidden="true" width="26" height="12" viewBox="0 0 26 12"><path d="M10.8293 1.28394L6.00979 9.43927C5.06779 11.0333 3.38046 12 1.56075 12L0 12L26 12L24.7838 12C23.0035 12 21.3469 11.0747 20.3931 9.53563L15.2492 1.23576C14.2151 -0.432753 11.8285 -0.406738 10.8293 1.28394Z"/></svg>`;
const ARROW_CORNER = svg`<svg class="arrow corner" aria-hidden="true" width="21" height="12" viewBox="0 0 21 12"><path d="M0 2.80146L0 11.9997L21 12L20.4391 11.9997C17.5718 11.9997 14.8137 10.3228 12.733 8.35286L4.72653 0.772565C2.94228 -0.91671 0 0.346291 0 2.80146Z"/></svg>`;
const ARROW_WALL = svg`<svg class="arrow wall" aria-hidden="true" width="12" height="21" viewBox="0 0 12 21"><path d="M0 0 H12 V21 C12 18 10 14 7 11 C4 8 2 5 0 0 Z"/></svg>`;

let uid = 0;

/**
 * `<lustrous-popover>` — Unified anchored interactive popover and rich hover card rendered
 * in the browser's top layer via the Popover API.
 *
 * - Supports directional SVG arrows (`arrow`, default `true`) with square-corner alignment
 *   for `align="start" | "end"`, or flat-cornered panels (`arrow="false"`).
 * - Click-activated by default (`open-on-hover` false) or hover-triggered (`open-on-hover`).
 * - Setting `close-label` on a click-activated popover adds a close icon button and applies
 *   a modal focus trap while marking outside siblings `inert` and `aria-hidden="true"`.
 * - Setting `mobile-drawer` switches automatically to `<lustrous-bottom-sheet>` at `<= 768px`.
 *
 * @slot - Trigger element (or pass `slot="trigger"`).
 * @slot content - Rich or interactive content rendered below `heading` / `content`.
 * @fires lustrous-toggle - `CustomEvent<{ open: boolean }>` when opened or closed.
 * @fires lustrous-action - `CustomEvent<{ action: "primary" | "secondary" }>` (cancelable).
 * @csspart panel - The floating `role="dialog"` panel.
 * @csspart close-button - The optional modal close icon button (`close-label`).
 * @csspart actions - The optional action button row.
 */
@customElement("lustrous-popover")
export class LustrousPopover extends LustrousElement {
  static override styles = [
    lustrousBase,
    toCss(floatingResetCss),
    css`
      :host {
        display: inline-block;
        text-align: inherit;
      }
      .trigger-wrap {
        display: contents;
      }
      .panel {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        max-width: min(320px, calc(100vw - 32px));
        max-height: var(--_lustrous-popover-max-height, calc(100vh - 32px));
        overflow: visible;
        padding: 0;
        border-radius: var(--lustrous-radius-xl);
        background-color: var(--lustrous-color-surface-bright);
        color: var(--lustrous-color-on-surface);
        filter: drop-shadow(0 4px 20px var(--lustrous-color-elevation2));
        text-align: start;
        overflow-wrap: break-word;
        outline: none;
        z-index: var(--lustrous-z-dropdown);
      }
      .panel:not(:popover-open) {
        display: none;
      }
      :host([arrow="false"]) .panel {
        border: 1px solid var(--lustrous-color-outline-variant);
        border-radius: var(--lustrous-radius-l);
        box-shadow: var(--lustrous-elevation-level2);
        filter: none;
      }
      :host([elevation="1"][arrow="false"]) .panel {
        box-shadow: var(--lustrous-elevation-level1);
      }
      :host([size]) .panel {
        max-width: calc(100vw - 32px);
      }
      :host([size="s"]) .panel {
        width: 256px;
      }
      :host([size="m"]) .panel {
        width: 320px;
      }
      :host([size="l"]) .panel {
        width: 400px;
      }
      .panel[data-corner="top-left"] {
        border-top-left-radius: 0;
      }
      .panel[data-corner="top-right"] {
        border-top-right-radius: 0;
      }
      .panel[data-corner="bottom-left"] {
        border-bottom-left-radius: 0;
      }
      .panel[data-corner="bottom-right"] {
        border-bottom-right-radius: 0;
      }
      .scroll {
        display: flex;
        flex-direction: column;
        gap: var(--lustrous-space-s);
        flex: 1 1 auto;
        min-height: 0;
        overflow: auto;
        padding: var(--lustrous-space-l);
        border-radius: inherit;
      }
      :host([padding]) .scroll {
        padding: var(--_lustrous-popover-padding);
      }
      .header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--lustrous-space-s);
      }
      .spacer {
        flex: 1 1 auto;
      }
      .close-btn {
        margin-top: -2px;
        margin-inline-end: -4px;
      }
      .heading {
        min-width: 0;
        ${lustrousType("body-large-emphasized")}
      }
      .body {
        color: var(--lustrous-color-on-surface-variant);
        ${lustrousType("body-medium")}
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        flex-wrap: wrap;
        gap: var(--lustrous-space-s);
        padding-top: var(--lustrous-space-xs);
      }
      .arrow {
        position: absolute;
        display: block;
        pointer-events: none;
      }
      .arrow path {
        fill: var(--lustrous-color-surface-bright);
      }
      .panel[data-side="bottom"] .arrow {
        top: -11px;
      }
      .panel[data-side="top"] .arrow {
        bottom: -11px;
      }
      .panel[data-side="right"] .arrow {
        left: -11px;
      }
      .panel[data-side="left"] .arrow {
        right: -11px;
      }
      .arrow.center {
        left: var(--_lustrous-arrow, 50%);
      }
      .panel[data-corner$="left"] .arrow.corner {
        left: 0;
      }
      .panel[data-corner$="right"] .arrow.corner {
        right: 0;
      }
      .arrow.wall {
        top: var(--_lustrous-arrow, 0);
      }
      .panel[data-corner^="bottom"] .arrow.wall {
        top: auto;
        bottom: 0;
      }
      .panel[data-side="top"] .arrow.center {
        transform: scaleY(-1);
      }
      .panel[data-side="top"][data-corner="bottom-left"] .arrow.corner {
        transform: scaleY(-1);
      }
      .panel[data-side="top"][data-corner="bottom-right"] .arrow.corner {
        transform: scale(-1, -1);
      }
      .panel[data-side="bottom"][data-corner="top-right"] .arrow.corner {
        transform: scaleX(-1);
      }
      .panel[data-side="left"] .arrow.wall {
        transform: scaleX(-1);
      }
      .panel[data-side="left"][data-corner^="bottom"] .arrow.wall {
        transform: scale(-1, -1);
      }
      .panel[data-side="right"][data-corner^="bottom"] .arrow.wall {
        transform: scaleY(-1);
      }
      @media (forced-colors: active) {
        .panel {
          border: 1px solid CanvasText;
          filter: none;
        }
        .arrow {
          display: none;
        }
      }
    `,
    toCss(expandInCss(".panel:popover-open")),
  ];

  @property({ type: Boolean, reflect: true }) open = false;

  /** Renders the directional SVG arrow and square-corner alignment rule (`arrow="false"` for a flat-cornered panel). */
  @property({
    reflect: true,
    converter: {
      fromAttribute: (v: string | null) => v !== "false",
      toAttribute: (v: boolean) => (v ? null : "false"),
    },
  })
  arrow = true;

  @property() heading = "";
  @property() content = "";
  @property() label = "";
  @property({ reflect: true }) side: LustrousPopoverSide = "bottom";
  @property({ reflect: true }) align: FloatingAlign = "center";
  @property({ type: Number }) offset?: number;
  @property({ type: Number, attribute: "align-offset" }) alignOffset = 0;
  @property({ reflect: true }) size?: LustrousPopoverSize;
  @property({ reflect: true }) padding?: LustrousPaddingValue;
  @property({ attribute: "max-height" }) maxHeight?: string;
  @property({ reflect: true }) elevation?: "1" | "2";
  @property({ attribute: "primary-action" }) primaryAction = "";
  @property({ attribute: "secondary-action" }) secondaryAction = "";

  @property({
    reflect: true,
    attribute: "open-on-hover",
    converter: {
      fromAttribute: (v: string | null) => v !== null && v !== "false",
      toAttribute: (v: boolean) => (v ? "" : null),
    },
  })
  openOnHover = false;

  @property({ type: Number }) delay = 300;
  @property({ type: Number, attribute: "close-delay" }) closeDelay = 0;
  @property({ attribute: "close-label" }) closeLabel = "";
  @property({ type: Boolean, reflect: true, attribute: "mobile-drawer" }) mobileDrawer = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ attribute: false }) anchor?: Element | null;

  @query(".panel") protected panel!: HTMLDivElement;
  @state() private hasContentSlot = false;
  protected trigger?: HTMLElement;
  private cleanupPosition?: () => void;
  private hoverTimer?: ReturnType<typeof setTimeout>;
  private modalLockedElements: Array<{ el: HTMLElement; prevInert: boolean; prevAriaHidden: string | null }> = [];
  protected readonly panelId = `lustrous-popover-${++uid}`;
  protected dismissedAt = Number.NEGATIVE_INFINITY;
  protected openedByHover = false;
  private focusWasInside = false;
  private wasMobileDrawer = false;
  private readonly viewport = new LustrousViewportController(this);
  private readonly shortcutScope = new LustrousShortcutScopeController(this, { active: false });

  private static readonly HOVER_BRIDGE = 150;

  show(): void {
    this.open = true;
  }

  hide(): void {
    this.open = false;
  }

  toggle(): void {
    this.open = !this.open;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.hasContentSlot = !!this.querySelector('[slot="content"]');
    this.shortcutScope.setActive(this.open);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.cleanupPosition?.();
    clearTimeout(this.hoverTimer);
    this.removeManualDismiss();
    this.releaseModalLock();
  }

  private get isMobileDrawer(): boolean {
    return this.mobileDrawer && this.viewport.isMobile;
  }

  private get usePopoverPanel(): boolean {
    return !this.isMobileDrawer;
  }

  private get isModal(): boolean {
    return !this.openOnHover && Boolean(this.closeLabel);
  }

  private get blocked(): boolean {
    const empty =
      !this.heading.trim() &&
      !this.content.trim() &&
      !this.hasContentSlot &&
      !this.primaryAction &&
      !this.secondaryAction;
    return this.disabled || empty;
  }

  private get moveFocusOnOpen(): boolean {
    return !this.openOnHover && !this.openedByHover;
  }

  private get resolvedOffset(): number {
    return this.offset ?? (this.arrow ? 15 : 6);
  }

  private get triggerName(): string {
    const t = this.trigger;
    return t?.getAttribute("aria-label")?.trim() || t?.textContent?.trim() || "";
  }

  private static deepActive(): Element | null {
    let a: Element | null = document.activeElement;
    while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
    return a;
  }

  private syncModalLock(): void {
    if (this.open && this.isModal && this.usePopoverPanel) {
      this.applyModalLock();
    } else {
      this.releaseModalLock();
    }
  }

  private applyModalLock(): void {
    if (this.modalLockedElements.length > 0 || !this.panel) return;
    let curr: Node | null = this.panel;
    while (curr && curr !== document.body && curr !== document.documentElement) {
      const parent: Node | null = curr.parentNode;
      if (parent) {
        for (const sibling of parent.childNodes) {
          if (
            sibling !== curr &&
            sibling instanceof HTMLElement &&
            sibling.localName !== "script" &&
            sibling.localName !== "style" &&
            sibling.localName !== "template"
          ) {
            this.modalLockedElements.push({
              el: sibling,
              prevInert: sibling.inert,
              prevAriaHidden: sibling.getAttribute("aria-hidden"),
            });
            sibling.inert = true;
            sibling.setAttribute("aria-hidden", "true");
          }
        }
        curr = parent;
      } else if (curr instanceof ShadowRoot) {
        curr = curr.host;
      } else {
        break;
      }
    }
  }

  private releaseModalLock(): void {
    for (const { el, prevInert, prevAriaHidden } of this.modalLockedElements) {
      el.inert = prevInert;
      if (prevAriaHidden === null) el.removeAttribute("aria-hidden");
      else el.setAttribute("aria-hidden", prevAriaHidden);
    }
    this.modalLockedElements = [];
  }

  private get contentSlot(): HTMLSlotElement | null {
    return this.renderRoot.querySelector<HTMLSlotElement>('slot[name="content"]');
  }

  private onPanelKeyDown(e: KeyboardEvent): void {
    if (!this.isModal || e.key !== "Tab") return;
    const assigned = this.contentSlot?.assignedElements({ flatten: true }) ?? [];
    const actions = this.panel.querySelectorAll<HTMLElement>("[part=actions]");
    const closeBtns = this.panel.querySelectorAll<HTMLElement>("[part=close-button]");
    const tabbables = [...allFocusable(closeBtns), ...allFocusable(assigned), ...allFocusable(actions)];
    if (tabbables.length === 0) {
      e.preventDefault();
      this.panel.focus({ preventScroll: true });
      return;
    }
    const first = tabbables[0]!;
    const last = tabbables[tabbables.length - 1]!;
    const active = LustrousPopover.deepActive();
    const insideTabbable = tabbables.some((t) => composedContains(t, active));
    if (!e.shiftKey) {
      if (!insideTabbable || composedContains(last, active)) {
        e.preventDefault();
        first.focus();
      }
    } else if (!insideTabbable || composedContains(first, active)) {
      e.preventDefault();
      last.focus();
    }
  }

  private focusInPanel(): boolean {
    const a = document.activeElement;
    if (a && this.contains(a) && !this.trigger?.contains(a)) return true;
    const inner = this.shadowRoot?.activeElement;
    return !!inner && !!this.panel?.contains(inner);
  }

  private onDocPointerDown = (e: PointerEvent): void => {
    const path = e.composedPath();
    if (path.includes(this.panel) || (this.trigger && path.includes(this.trigger))) return;
    this.dismissedAt = performance.now();
    this.open = false;
  };

  private onDocKeyDown = (e: KeyboardEvent): void => {
    if (e.key !== "Escape" || !this.open || e.defaultPrevented) return;
    if (!this.shortcutScope.canHandleEscape(e)) return;
    e.preventDefault();
    e.stopPropagation();
    this.dismissedAt = performance.now();
    const focusInside = this.focusInPanel() || this.isModal;
    this.open = false;
    if (focusInside) this.trigger?.focus();
  };

  private addManualDismiss(): void {
    document.addEventListener("pointerdown", this.onDocPointerDown, true);
    document.addEventListener("keydown", this.onDocKeyDown, true);
  }

  private removeManualDismiss(): void {
    document.removeEventListener("pointerdown", this.onDocPointerDown, true);
    document.removeEventListener("keydown", this.onDocKeyDown, true);
  }

  private resolveAssignedTrigger(): HTMLElement | undefined {
    const named = this.renderRoot
      .querySelector<HTMLSlotElement>('slot[name="trigger"]')
      ?.assignedElements({ flatten: true })[0] as HTMLElement | undefined;
    if (named) return named;
    return this.renderRoot
      .querySelector<HTMLSlotElement>("slot:not([name])")
      ?.assignedElements({ flatten: true })[0] as HTMLElement | undefined;
  }

  private onTriggerSlotChange(): void {
    const el = this.resolveAssignedTrigger();
    if (el === this.trigger) return;
    this.trigger?.removeEventListener("click", this.onTriggerClick);
    this.trigger = el;
    el?.addEventListener("click", this.onTriggerClick);
    this.syncTriggerAria();
    this.requestUpdate();
  }

  private onContentSlotChange(e: Event): void {
    const nodes = (e.target as HTMLSlotElement).assignedNodes({ flatten: true });
    this.hasContentSlot = nodes.some((n) => n.nodeType === 1 || Boolean(n.textContent?.trim()));
  }

  private onTriggerClick = (): void => {
    if ((this.trigger as HTMLElement & { disabled?: boolean })?.disabled || this.blocked) return;
    clearTimeout(this.hoverTimer);
    if (!this.open && performance.now() - this.dismissedAt < 300) return;
    if (this.open && this.openedByHover) {
      this.openedByHover = false;
      return;
    }
    this.toggle();
  };

  private syncTriggerAria(): void {
    if (!this.trigger) return;
    if (!this.openOnHover && !this.isMobileDrawer) {
      this.trigger.setAttribute("aria-haspopup", "dialog");
    } else {
      this.trigger.removeAttribute("aria-haspopup");
    }
    this.trigger.setAttribute("aria-expanded", this.open ? "true" : "false");
  }

  private onPanelBeforeToggle(e: ToggleEvent): void {
    if (e.newState === "closed") {
      this.focusWasInside = this.focusInPanel();
    }
  }

  private onPanelToggle(e: ToggleEvent): void {
    const nowOpen = e.newState === "open";
    if (nowOpen !== this.open) {
      if (!nowOpen) this.dismissedAt = performance.now();
      this.open = nowOpen;
    }
  }

  private onEnter = (): void => {
    if (!this.openOnHover || !this.usePopoverPanel || this.blocked) return;
    clearTimeout(this.hoverTimer);
    if (this.open) return;
    const show = () => {
      this.openedByHover = true;
      this.open = true;
    };
    if (this.delay > 0) this.hoverTimer = setTimeout(show, this.delay);
    else show();
  };

  private onLeave = (): void => {
    if (!this.openOnHover || !this.usePopoverPanel) return;
    clearTimeout(this.hoverTimer);
    if (!this.open || !this.openedByHover) return;
    this.hoverTimer = setTimeout(() => {
      this.open = false;
    }, this.closeDelay + LustrousPopover.HOVER_BRIDGE);
  };

  private onAction(action: "primary" | "secondary"): void {
    const ev = new CustomEvent("lustrous-action", {
      detail: { action },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    if (this.dispatchEvent(ev)) {
      this.open = false;
    }
  }

  private onDrawerToggle(e: CustomEvent<{ open: boolean }>): void {
    if (e.target !== e.currentTarget) return;
    e.stopPropagation();
    if (e.detail.open !== this.open) {
      if (!e.detail.open) this.dismissedAt = performance.now();
      this.open = e.detail.open;
    }
  }

  private resolvedAlignOffset(): FloatingOptions["alignOffset"] {
    const extra = this.alignOffset;
    if (!this.arrow || this.align === "center") return extra;
    return ({ side, anchor }) => {
      const half = (side === "top" || side === "bottom" ? anchor.width : anchor.height) / 2;
      return (this.align === "start" ? half : -half) + extra;
    };
  }

  private resolvedOriginPadding(): number | undefined {
    if (!this.arrow) return undefined;
    return this.align === "center" ? undefined : 0;
  }

  private onPlaced(p: {
    x: number;
    y: number;
    side: "top" | "bottom" | "left" | "right";
    anchor: DOMRect;
    rtl: boolean;
  }): void {
    const panel = this.panel;
    panel.dataset.side = p.side;
    if (!this.arrow) {
      delete panel.dataset.corner;
      panel.style.removeProperty("--_lustrous-arrow");
      return;
    }
    const w = panel.offsetWidth;
    const h = panel.offsetHeight;
    if (this.align === "center") {
      delete panel.dataset.corner;
      if (p.side === "top" || p.side === "bottom") {
        const x = p.anchor.left + p.anchor.width / 2 - p.x - 13;
        panel.style.setProperty("--_lustrous-arrow", `${Math.round(Math.min(Math.max(x, 20), w - 46))}px`);
      } else {
        const y = p.anchor.top + p.anchor.height / 2 - p.y - 10.5;
        panel.style.setProperty("--_lustrous-arrow", `${Math.round(Math.min(Math.max(y, 20), h - 41))}px`);
      }
      return;
    }
    panel.style.removeProperty("--_lustrous-arrow");
    const startIsLeft = !p.rtl;
    const atStart = this.align === "start";
    if (p.side === "top" || p.side === "bottom") {
      const left = atStart === startIsLeft;
      panel.dataset.corner = `${p.side === "bottom" ? "top" : "bottom"}-${left ? "left" : "right"}`;
    } else {
      panel.dataset.corner = `${atStart ? "top" : "bottom"}-${p.side === "right" ? "left" : "right"}`;
    }
  }

  private openPopoverPanel(): void {
    const panel = this.panel;
    if (!panel) return;
    if (!panel.matches(":popover-open")) {
      panel.showPopover?.();
      if (panel.popover === "manual") this.addManualDismiss();
    }
    this.syncModalLock();
    this.cleanupPosition?.();
    this.cleanupPosition = autoPosition(
      this.anchor ?? this.trigger ?? this,
      panel,
      () => ({
        side: this.side,
        align: this.align,
        offset: this.resolvedOffset,
        alignOffset: this.resolvedAlignOffset(),
        originPadding: this.resolvedOriginPadding(),
      }),
      (placement) => this.onPlaced(placement),
    );
    if (this.moveFocusOnOpen) {
      const assigned = this.contentSlot?.assignedElements({ flatten: true }) ?? [];
      const actions = panel.querySelectorAll<HTMLElement>("[part=actions]");
      const closeBtns = panel.querySelectorAll<HTMLElement>("[part=close-button]");
      const target = firstFocusable(assigned) ?? firstFocusable(actions) ?? firstFocusable(closeBtns);
      (target ?? panel).focus({ preventScroll: true });
    }
  }

  private closePopoverPanel(restoreFocus = false): void {
    this.openedByHover = false;
    this.removeManualDismiss();
    this.releaseModalLock();
    this.cleanupPosition?.();
    this.cleanupPosition = undefined;
    const focusInside = this.focusWasInside || this.focusInPanel();
    this.focusWasInside = false;
    if (this.panel?.matches(":popover-open")) this.panel.hidePopover?.();
    if (restoreFocus && focusInside) this.trigger?.focus();
  }

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (changed.has("open")) {
      this.shortcutScope.setActive(this.open);
    }
    if (changed.has("maxHeight")) {
      setHostVar(this, "--_lustrous-popover-max-height", this.maxHeight || undefined);
    }
    if (changed.has("padding")) {
      const pad = this.padding;
      setHostVar(
        this,
        "--_lustrous-popover-padding",
        pad ? (pad === "none" || pad === "0" ? "0px" : `var(--lustrous-space-${pad})`) : undefined,
      );
    }
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    const mobileDrawerActive = this.isMobileDrawer;
    if (mobileDrawerActive !== this.wasMobileDrawer) {
      this.wasMobileDrawer = mobileDrawerActive;
      this.syncTriggerAria();
      if (mobileDrawerActive) {
        this.closePopoverPanel(false);
      } else if (this.open && !this.blocked) {
        this.openPopoverPanel();
      }
    }

    if (changed.has("open")) {
      if (this.open && this.blocked) {
        this.open = false;
        return;
      }
      this.syncTriggerAria();
      if (this.open && this.usePopoverPanel) {
        this.openPopoverPanel();
      } else {
        this.closePopoverPanel(!this.open);
      }
      if (changed.get("open") !== undefined) {
        this.dispatchEvent(
          new CustomEvent("lustrous-toggle", { detail: { open: this.open }, bubbles: true, composed: true }),
        );
      }
      return;
    }

    if ((changed.has("closeLabel") || changed.has("openOnHover")) && this.usePopoverPanel) {
      this.syncTriggerAria();
      this.syncModalLock();
    }
    if (
      this.open &&
      this.usePopoverPanel &&
      (changed.has("arrow") || changed.has("side") || changed.has("align") || changed.has("offset") || changed.has("anchor"))
    ) {
      this.openPopoverPanel();
    }
  }

  private panelLabel(): { label?: string; labelledby?: string } {
    if (this.label) return { label: this.label };
    if (this.heading) return { labelledby: `${this.panelId}-heading` };
    return { label: this.triggerName || "Popover" };
  }

  private renderActions(): TemplateResult | typeof nothing {
    if (!this.primaryAction && !this.secondaryAction) return nothing;
    return html`<div part="actions" class="actions">
      ${this.secondaryAction
        ? html`<lustrous-button size="s" variant="on-surface" @click=${() => this.onAction("secondary")}
            >${this.secondaryAction}</lustrous-button
          >`
        : nothing}
      ${this.primaryAction
        ? html`<lustrous-button size="s" variant="accent" @click=${() => this.onAction("primary")}
            >${this.primaryAction}</lustrous-button
          >`
        : nothing}
    </div>`;
  }

  private renderBodyContent(includeCloseButton: boolean): TemplateResult {
    const showHeader = Boolean(this.heading) || includeCloseButton;
    return html`${showHeader
        ? html`<div class="header">
            ${this.heading
              ? html`<div class="heading" id="${this.panelId}-heading">${this.heading}</div>`
              : html`<span class="spacer"></span>`}
            ${includeCloseButton
              ? html`<lustrous-icon-button
                  part="close-button"
                  class="close-btn"
                  icon="close"
                  size="xs"
                  variant="on-surface"
                  aria-label=${this.closeLabel}
                  @click=${() => this.hide()}
                ></lustrous-icon-button>`
              : nothing}
          </div>`
        : nothing}
      ${this.content ? html`<div class="body">${this.content}</div>` : nothing}
      <slot name="content" @slotchange=${this.onContentSlotChange}></slot>
      ${this.renderActions()}`;
  }

  private renderArrow(): TemplateResult | typeof nothing {
    if (!this.arrow) return nothing;
    const vertical =
      this.side === "left" ||
      this.side === "right" ||
      this.side === "inline-start" ||
      this.side === "inline-end";
    if (vertical) return html`${ARROW_WALL}`;
    return html`${this.align === "center" ? ARROW_CENTER : ARROW_CORNER}`;
  }

  protected override render() {
    const { label, labelledby } = this.panelLabel();
    const manualPopover = this.openOnHover || this.isModal;
    const drawerLabel = this.label || this.heading || this.triggerName || "Options";
    return html`<span class="trigger-wrap" @pointerenter=${this.onEnter} @pointerleave=${this.onLeave}>
        <slot name="trigger" @slotchange=${this.onTriggerSlotChange}></slot>
        <slot @slotchange=${this.onTriggerSlotChange}></slot>
      </span>
      <div
        part="panel"
        class="panel"
        id=${this.panelId}
        popover=${manualPopover ? "manual" : "auto"}
        role="dialog"
        tabindex="-1"
        data-lustrous-shortcut-scope=""
        aria-modal=${this.isModal ? "true" : nothing}
        aria-label=${label ?? nothing}
        aria-labelledby=${labelledby ?? nothing}
        @beforetoggle=${this.onPanelBeforeToggle}
        @toggle=${this.onPanelToggle}
        @keydown=${this.onPanelKeyDown}
        @pointerenter=${this.onEnter}
        @pointerleave=${this.onLeave}
      >
        ${this.isMobileDrawer
          ? nothing
          : html`${this.renderArrow()}<div class="scroll">${this.renderBodyContent(this.isModal)}</div>`}
      </div>
      ${this.isMobileDrawer
        ? html`<lustrous-bottom-sheet
            .open=${this.open && !this.blocked}
            .returnFocus=${this.trigger}
            label=${drawerLabel}
            @lustrous-toggle=${this.onDrawerToggle}
          >
            ${this.renderBodyContent(false)}
          </lustrous-bottom-sheet>`
        : nothing}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-popover": LustrousPopover;
  }
  interface HTMLElementEventMap {
    "lustrous-action": LustrousPopoverActionEvent;
  }
}
