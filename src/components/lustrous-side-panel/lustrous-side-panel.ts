import { css, html, nothing, type PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { lustrousSrOnly } from "../../internal/a11y.js";
import { composedContains } from "../../internal/floating.js";
import { attrRules, paddingValues, toCss } from "../../internal/style-gen.js";
import "../../theme/events.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { hasOpenModalDialog, LustrousShortcutScopeController } from "../../theme/shortcuts.js";
import { lustrousBase } from "../../theme/theme.js";
import type { LustrousPaddingValue } from "../lustrous-box/lustrous-box.js";
import "../lustrous-scrollable-box/lustrous-scrollable-box.js";
import type { LustrousScrollableBoxScrim } from "../lustrous-scrollable-box/lustrous-scrollable-box.js";

export type LustrousSidePanelPresentation = "split" | "takeover";
export type LustrousSidePanelSide = "inline-end" | "inline-start";

/**
 * `<lustrous-side-panel>` — Persistent complementary `<aside>` panel beside or over main content.
 *
 * - `presentation="split"` (desktop): framed `surface-bright` card with `border`, `margin`,
 *   optional `shadow`, and directional lateral entrance animation.
 * - `presentation="takeover"` (mobile): edge-to-edge surface activating a `LustrousShortcutScopeController`
 *   so Escape requests dismissal from anywhere in the document while yielding to open modal dialogs.
 *
 * @slot header - Fixed header above the scrolling body.
 * @slot - Panel body content.
 * @slot footer - Fixed footer below the scrolling body.
 * @fires lustrous-close-request - `CustomEvent<{ reason: "escape" }>` (cancelable). Host controls `open`.
 * @csspart aside - The `<aside>` landmark element.
 * @csspart card - The panel card surface.
 * @csspart body - The body container (`<lustrous-scrollable-box>` or unscrolled `<div>`).
 */
@customElement("lustrous-side-panel")
export class LustrousSidePanel extends LustrousElement {
  static override styles = [
    lustrousBase,
    lustrousSrOnly,
    css`
      :host {
        display: block;
        height: 100%;
        min-height: 0;
      }
      :host(:not([open])) {
        display: none;
      }
      aside {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        outline: none;
      }
      aside:focus-visible .card {
        outline: 2.5px solid var(--lustrous-color-on-surface);
        outline-offset: 2px;
      }
      .card {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
        overflow: hidden;
        background-color: var(--lustrous-color-surface-bright);
        color: var(--lustrous-color-on-surface);
        animation-duration: var(--lustrous-duration-medium300);
        animation-fill-mode: both;
        animation-timing-function: var(--lustrous-easing-standard);
        animation-name: lustrous-side-panel-in-takeover;
        transform-origin: 50% 50%;
      }
      .split .card {
        margin: var(--lustrous-space-m);
        border: 1px solid var(--lustrous-color-outline-variant);
        border-radius: var(--lustrous-radius-2xl);
        animation-duration: var(--lustrous-duration-medium400);
        animation-timing-function: var(--lustrous-easing-emphasized-decelerate);
        animation-name: lustrous-side-panel-in-split-end;
        transform-origin: 100% 50%;
      }
      :host([border="false"]) .split .card {
        border: 0;
      }
      :host([shadow]:not([shadow="false"]):not([shadow="2"])) .split .card {
        box-shadow: var(--lustrous-elevation-level1);
      }
      :host([shadow="2"]) .split .card {
        box-shadow: var(--lustrous-elevation-level2);
      }
      .split.start .card {
        animation-name: lustrous-side-panel-in-split-start;
        transform-origin: 0% 50%;
      }
      .split.end .card:dir(rtl) {
        animation-name: lustrous-side-panel-in-split-start;
        transform-origin: 0% 50%;
      }
      .split.start .card:dir(rtl) {
        animation-name: lustrous-side-panel-in-split-end;
        transform-origin: 100% 50%;
      }
      .header,
      .footer {
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
      }
      .header[hidden],
      .footer[hidden] {
        display: none;
      }
      lustrous-scrollable-box {
        flex: 1 1 0;
        min-height: 0;
      }
      .body-unscrolled {
        display: flex;
        flex-direction: column;
        flex: 1 1 0;
        min-height: 0;
        width: 100%;
        overflow: hidden;
        position: relative;
      }
      @keyframes lustrous-side-panel-in-split-end {
        from {
          opacity: 0;
          transform: translateX(24px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateX(0) scale(1);
        }
      }
      @keyframes lustrous-side-panel-in-split-start {
        from {
          opacity: 0;
          transform: translateX(-24px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateX(0) scale(1);
        }
      }
      @keyframes lustrous-side-panel-in-takeover {
        from {
          opacity: 0;
          transform: scale(0.96);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .card,
        .split .card,
        .split.start .card,
        .split.end .card:dir(rtl),
        .split.start .card:dir(rtl) {
          animation: none;
        }
      }
      @media (forced-colors: active) {
        .card {
          border: 1px solid CanvasText;
        }
      }
    `,
    toCss(
      attrRules(
        "margin",
        Object.fromEntries(Object.entries(paddingValues()).map(([k, v]) => [k, `margin: ${v};`])),
        ".split .card",
      ),
    ),
  ];

  @property({ type: Boolean, reflect: true }) open = false;
  @property({ reflect: true }) presentation: LustrousSidePanelPresentation = "split";
  @property({ type: Boolean, attribute: "focus-on-open" }) focusOnOpen = false;
  @property({ reflect: true }) side: LustrousSidePanelSide = "inline-end";
  @property() label = "";
  @property() announcement?: string;
  @property({ attribute: false }) returnFocus?: HTMLElement | null;

  @property({
    reflect: true,
    converter: {
      fromAttribute: (v: string | null) => v !== "false",
      toAttribute: (v: boolean) => (v ? null : "false"),
    },
  })
  border = true;

  @property({ reflect: true }) shadow?: "" | "1" | "2";
  @property({ reflect: true }) margin?: LustrousPaddingValue;

  @property({
    reflect: true,
    converter: {
      fromAttribute: (v: string | null) => v !== "false",
      toAttribute: (v: boolean) => (v ? null : "false"),
    },
  })
  scrollable = true;

  @property({ reflect: true }) scrim: LustrousScrollableBoxScrim | "true" | "false" = "both";

  @query("aside") private aside?: HTMLElement;
  @state() private liveMessage = "";
  @state() private hasHeader = false;
  @state() private hasFooter = false;
  private previousFocus: HTMLElement | null = null;
  private escapeOwnedByModal = false;
  private readonly shortcutScope = new LustrousShortcutScopeController(this, { active: false });

  override connectedCallback(): void {
    super.connectedCallback();
    this.hasHeader = !!this.querySelector(":scope > [slot=header]");
    this.hasFooter = !!this.querySelector(":scope > [slot=footer]");
    this.shortcutScope.setActive(this.open && this.presentation === "takeover");
    document.addEventListener("keydown", this.onEscapeCapture, true);
    document.addEventListener("keydown", this.onDocumentKeydown);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("keydown", this.onEscapeCapture, true);
    document.removeEventListener("keydown", this.onDocumentKeydown);
    if (this.open) this.restoreFocus(true);
  }

  private static activeElement(): Element | null {
    let a: Element | null = document.activeElement;
    while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
    return a;
  }

  private restoreFocus(removed = false): void {
    const active = LustrousSidePanel.activeElement();
    const lost =
      !active ||
      active === document.body ||
      active === document.documentElement ||
      composedContains(this, active) ||
      (removed && !active.isConnected);
    const target = this.returnFocus?.isConnected
      ? this.returnFocus
      : this.previousFocus?.isConnected
        ? this.previousFocus
        : null;
    this.previousFocus = null;
    if (lost && target) target.focus({ preventScroll: true });
  }

  private focusInside(): boolean {
    return this.matches(":focus-within");
  }

  private requestClose(e: KeyboardEvent): void {
    const ev = new CustomEvent("lustrous-close-request", {
      detail: { reason: "escape" },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    if (this.dispatchEvent(ev)) e.preventDefault();
  }

  private onEscapeCapture = (e: KeyboardEvent): void => {
    if (e.key === "Escape") {
      this.escapeOwnedByModal = this.open && hasOpenModalDialog();
    }
  };

  private onDocumentKeydown = (e: KeyboardEvent): void => {
    if (!this.open || e.key !== "Escape" || e.defaultPrevented || this.escapeOwnedByModal || hasOpenModalDialog()) {
      return;
    }
    if ((this.presentation === "takeover" || this.focusInside()) && this.shortcutScope.canHandleEscape(e)) {
      this.requestClose(e);
    }
  };

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (changed.has("open") || changed.has("presentation")) {
      this.shortcutScope.setActive(this.open && this.presentation === "takeover");
    }
    if (changed.has("open") && this.open && changed.get("open") === false && typeof document !== "undefined") {
      const a = LustrousSidePanel.activeElement();
      this.previousFocus = a instanceof HTMLElement ? a : null;
    }
    if (
      changed.has("open") ||
      changed.has("focusOnOpen") ||
      changed.has("announcement") ||
      changed.has("label")
    ) {
      this.liveMessage = this.open && !this.focusOnOpen ? (this.announcement ?? this.label) : "";
    }
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    if (!changed.has("open")) return;
    const was = changed.get("open") as boolean | undefined;
    if (this.open && !was) {
      if (was === undefined && !this.previousFocus) {
        const a = LustrousSidePanel.activeElement();
        this.previousFocus = a instanceof HTMLElement ? a : null;
      }
      if (this.focusOnOpen) this.aside?.focus({ preventScroll: true });
    } else if (!this.open && was) {
      this.restoreFocus();
    }
  }

  private onHeaderSlotChange(e: Event): void {
    this.hasHeader = (e.target as HTMLSlotElement).assignedElements().length > 0;
  }

  private onFooterSlotChange(e: Event): void {
    this.hasFooter = (e.target as HTMLSlotElement).assignedElements().length > 0;
  }

  protected override render() {
    const cls = `${this.presentation} ${this.side === "inline-start" ? "start" : "end"}`;
    return html`<div class="sr-only" role="status" aria-live="polite" aria-atomic="true">${this.liveMessage}</div>
      ${this.open
        ? html`<aside part="aside" class=${cls} aria-label=${this.label || nothing} tabindex="-1">
            <div part="card" class="card">
              <div class="header" ?hidden=${!this.hasHeader}>
                <slot name="header" @slotchange=${this.onHeaderSlotChange}></slot>
              </div>
              ${this.scrollable
                ? html`<lustrous-scrollable-box part="body" height="full" scrim=${this.scrim}
                    ><slot></slot
                  ></lustrous-scrollable-box>`
                : html`<div part="body" class="body-unscrolled"><slot></slot></div>`}
              <div class="footer" ?hidden=${!this.hasFooter}>
                <slot name="footer" @slotchange=${this.onFooterSlotChange}></slot>
              </div>
            </div>
          </aside>`
        : nothing}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-side-panel": LustrousSidePanel;
  }
}
