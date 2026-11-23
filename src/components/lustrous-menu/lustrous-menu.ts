import { css, html, nothing, unsafeCSS, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { autoPosition, floatingResetCss, type FloatingAlign, type FloatingSide } from "../../internal/floating.js";
import { expandInCss } from "../../internal/motion.js";
import { setHostVar, toCss } from "../../internal/style-gen.js";
import { getLustrousLabels } from "../../theme/labels.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { LustrousMediaController } from "../../theme/media.js";
import { LustrousShortcutScopeController } from "../../theme/shortcuts.js";
import { lustrousBase, lustrousType } from "../../theme/theme.js";
import { breakpoints } from "../../theme/tokens.js";
import "../lustrous-badge/lustrous-badge.js";
import type { LustrousBackground } from "../lustrous-box/lustrous-box.js";
import { renderIcon, type LustrousIconName } from "../lustrous-icon/lustrous-icon.js";
import "../lustrous-popover/lustrous-popover.js";
import "../lustrous-tooltip/lustrous-tooltip.js";
import type { LustrousTooltip, LustrousTooltipSide } from "../lustrous-tooltip/lustrous-tooltip.js";

export interface LustrousMenuItemBase {
  id?: string;
  label: string;
  ariaLabel?: string;
  description?: string;
  descriptionMaxLines?: 1 | 2 | 3 | "none";
  badge?: string;
  icon?: LustrousIconName;
  reserveLeadingSpace?: boolean;
  trailingIcon?: LustrousIconName;
  trailingIconVisibility?: "always" | "interaction";
  /** Custom trailing content rendered before toggle switches/checkboxes, shortcuts, or chevrons. */
  trailingContent?: unknown;
  /** Optional semantic background token for highlighting a menu item row. */
  background?: LustrousBackground;
  shortcut?: string;
  disabled?: boolean;
  tooltip?: string;
}

export interface LustrousMenuActionItem extends LustrousMenuItemBase {
  type: "action";
  destructive?: boolean;
  /** Whether activating this item closes the menu. @default true */
  closeOnClick?: boolean;
  onClick?: (event: Event) => void;
}

export interface LustrousMenuLinkItem extends LustrousMenuItemBase {
  type: "link";
  href: string;
  target?: string;
  rel?: string;
  closeOnClick?: boolean;
  active?: boolean;
  onClick?: (event: Event) => void;
}

export interface LustrousMenuSelectionItem extends LustrousMenuItemBase {
  type: "selection";
  selectionType: "single" | "multi";
  selected: boolean;
  onSelect?: (selected: boolean, id?: string) => void;
}

export interface LustrousMenuToggleItem extends LustrousMenuItemBase {
  type: "toggle";
  control?: "switch" | "checkbox";
  checked: boolean;
  partial?: boolean;
  onChange?: (checked: boolean, id?: string) => void;
}

export interface LustrousMenuSubmenuItem extends Omit<LustrousMenuItemBase, "shortcut"> {
  type: "submenu";
  /** When true, mobile in-place drill-down starts directly inside this submenu. */
  defaultOpen?: boolean;
  items: LustrousMenuItem[];
}

export interface LustrousMenuHeaderItem {
  type: "header";
  id?: string;
  label: string;
}

export interface LustrousMenuSectionItem {
  type: "section";
  id?: string;
  label?: string;
  items: LustrousMenuItem[];
}

export interface LustrousMenuDividerItem {
  type: "divider";
  id?: string;
}

export type LustrousMenuItem =
  | LustrousMenuActionItem
  | LustrousMenuLinkItem
  | LustrousMenuSelectionItem
  | LustrousMenuToggleItem
  | LustrousMenuSubmenuItem
  | LustrousMenuHeaderItem
  | LustrousMenuSectionItem
  | LustrousMenuDividerItem;

export type LustrousMenuSelectEvent = CustomEvent<{
  item: LustrousMenuItem;
  id?: string;
  value?: boolean;
}>;

type InteractiveItem = Exclude<
  LustrousMenuItem,
  LustrousMenuHeaderItem | LustrousMenuSectionItem | LustrousMenuDividerItem
>;

interface SubmenuDescriptor {
  readonly path: string;
  readonly label: string;
  readonly items: LustrousMenuItem[];
}

/**
 * `<lustrous-menu>` — Top-layer dropdown, context, and overflow menu with nested submenus.
 *
 * Supports `action`, `link`, `selection` (`single` | `multi`), `toggle` (`switch` | `checkbox`),
 * `submenu`, `header`, `section`, and `divider` items, full WAI-ARIA menu keyboard navigation
 * (arrows, Home/End, typeahead, RTL-aware submenu arrows, Escape), `item.tooltip` and automatic
 * label truncation tooltips via `<lustrous-tooltip>`, and keyboard-only focus restoration.
 *
 * @slot trigger - The menu trigger element (`aria-haspopup="menu"`, `aria-expanded`).
 * @fires lustrous-select - `CustomEvent<{ item, id?, value? }>` when an item is activated.
 * @fires lustrous-toggle - `CustomEvent<{ open: boolean }>` when the menu opens or closes.
 * @csspart menu - Each `role="menu"` popup panel.
 * @csspart item - Each interactive menu row.
 */
@customElement("lustrous-menu")
export class LustrousMenu extends LustrousElement {
  static override styles = [
    lustrousBase,
    toCss(floatingResetCss),
    css`
      :host {
        display: inline-block;
      }
      .menu {
        box-sizing: border-box;
        width: 240px;
        max-height: min(
          var(--_lustrous-available-height, var(--_lustrous-menu-max-height, 320px)),
          var(--_lustrous-menu-max-height, 320px)
        );
        overflow-y: auto;
        padding: var(--lustrous-space-s);
        border: 1px solid var(--lustrous-color-outline-variant);
        border-radius: var(--lustrous-radius-l);
        background-color: var(--lustrous-color-surface-bright);
        color: var(--lustrous-color-on-surface);
        box-shadow: var(--lustrous-elevation-level2);
        z-index: var(--lustrous-z-dropdown);
        scrollbar-width: thin;
        scrollbar-color: var(--lustrous-color-on-surface-low) transparent;
      }
      :host([max-height="available"]) .menu {
        max-height: var(--_lustrous-available-height, calc(100dvh - 32px));
      }
      :host([width]:not([width="max-content"])) .menu[data-path="root"] {
        width: var(--_lustrous-menu-width, 240px);
        max-width: var(--_lustrous-available-width, calc(100vw - 32px));
      }
      :host([width="max-content"]) .menu[data-path="root"] {
        width: max-content;
        min-width: min(240px, var(--_lustrous-available-width, calc(100vw - 32px)));
        max-width: var(--_lustrous-available-width, calc(100vw - 32px));
      }
      .menu::-webkit-scrollbar {
        width: 12px;
      }
      .menu::-webkit-scrollbar-button {
        display: none;
        width: 0;
        height: 0;
      }
      .menu::-webkit-scrollbar-thumb {
        border: 4px solid transparent;
        border-radius: var(--lustrous-radius-full);
        background-clip: padding-box;
        background-color: var(--lustrous-color-on-surface-low);
      }
      .menu::-webkit-scrollbar-track {
        margin-block: var(--lustrous-space-s);
        background-color: transparent;
      }
      .item {
        all: unset;
        box-sizing: border-box;
        position: relative;
        isolation: isolate;
        display: flex;
        align-items: center;
        gap: var(--lustrous-space-s);
        width: 100%;
        min-height: 36px;
        padding: var(--lustrous-space-s);
        border-radius: var(--lustrous-radius-m);
        color: inherit;
        text-decoration: none;
        cursor: pointer;
        user-select: none;
        ${lustrousType("body-small")}
      }
      .item::after {
        content: "";
        position: absolute;
        inset: 0;
        z-index: -1;
        border-radius: inherit;
        background-color: var(--lustrous-color-state-hover);
        opacity: 0;
        pointer-events: none;
        transition: opacity 150ms ease-in-out;
      }
      .item:hover::after,
      .item:focus-visible::after,
      .item.sub-open::after {
        opacity: 1;
      }
      .item:active::after {
        background-color: var(--lustrous-color-state-pressed);
      }
      .item:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: -2px;
      }
      .item.selected,
      .item.sub-open {
        background-color: var(--lustrous-color-surface-dim);
      }
      .item.destructive {
        color: var(--lustrous-color-error);
      }
      .item[aria-disabled="true"] {
        opacity: 0.38;
        cursor: default;
        pointer-events: auto;
      }
      .item[aria-disabled="true"]::after {
        opacity: 0;
      }
      .lead {
        display: inline-flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
      }
      .lead.nudge {
        width: 16px;
      }
      .trail {
        display: inline-flex;
        flex-shrink: 0;
        align-items: center;
        gap: var(--lustrous-space-xs);
      }
      .text {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        justify-content: center;
        min-width: 0;
        min-height: 20px;
      }
      .label-row {
        display: flex;
        align-items: center;
        gap: var(--lustrous-space-s);
        min-width: 0;
      }
      .label {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      lustrous-badge {
        flex-shrink: 0;
      }
      .hover-trail {
        display: none;
        color: var(--lustrous-color-on-surface-variant);
      }
      .item:hover .hover-trail,
      .item:focus-visible .hover-trail,
      .item:focus .hover-trail {
        display: inline-flex;
      }
      @media ${unsafeCSS(breakpoints.mobile)} {
        .lead:not(.nudge),
        .lead:not(.nudge) svg {
          width: 24px;
          height: 24px;
        }
        .text {
          min-height: 24px;
        }
        .label {
          ${lustrousType("body-large")}
        }
      }
      .desc {
        color: var(--lustrous-color-on-surface-variant);
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        overflow: hidden;
        ${lustrousType("body-small")}
      }
      .desc.lines-2 {
        -webkit-line-clamp: 2;
      }
      .desc.lines-3 {
        -webkit-line-clamp: 3;
      }
      .desc.lines-none {
        display: block;
      }
      .shortcut {
        color: var(--lustrous-color-on-surface-variant);
        white-space: nowrap;
        ${lustrousType("body-small")}
      }
      .header {
        margin-top: var(--lustrous-space-xs);
        padding: var(--lustrous-space-xs) var(--lustrous-space-s);
        color: var(--lustrous-color-on-surface-variant);
        ${lustrousType("body-small-emphasized")}
      }
      .group:first-child .header,
      .header:first-child {
        margin-top: 0;
      }
      .divider {
        height: 1px;
        margin: var(--lustrous-space-s);
        background-color: var(--lustrous-color-outline-variant);
      }
      .switch {
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        width: 32px;
        height: 18px;
        padding: 2px;
        border-radius: var(--lustrous-radius-full);
        border: 1.5px solid var(--lustrous-color-outline);
        background-color: var(--lustrous-color-surface-container-highest);
        pointer-events: none;
        transition:
          background-color 150ms ease,
          border-color 150ms ease;
      }
      .switch.on {
        border-color: var(--lustrous-color-accent);
        background-color: var(--lustrous-color-accent);
      }
      .switch-thumb {
        width: 11px;
        height: 11px;
        border-radius: var(--lustrous-radius-full);
        background-color: var(--lustrous-color-outline);
        transition:
          transform 150ms ease,
          background-color 150ms ease;
      }
      .switch.on .switch-thumb {
        transform: translateX(14px);
        background-color: var(--lustrous-color-on-accent);
      }
      :host(:dir(rtl)) .switch.on .switch-thumb {
        transform: translateX(-14px);
      }
      .item[data-bg="surface"] { background-color: var(--lustrous-color-surface); }
      .item[data-bg="surface-bright"] { background-color: var(--lustrous-color-surface-bright); }
      .item[data-bg="surface-dim"] { background-color: var(--lustrous-color-surface-dim); }
      .item[data-bg="surface-accent"] { background-color: var(--lustrous-color-surface-accent); }
      .item[data-bg="surface-container-low"] { background-color: var(--lustrous-color-surface-container-low); }
      .item[data-bg="surface-container"] { background-color: var(--lustrous-color-surface-container); }
      .item[data-bg="surface-container-high"] { background-color: var(--lustrous-color-surface-container-high); }
      .item[data-bg="surface-container-highest"] { background-color: var(--lustrous-color-surface-container-highest); }
      .item[data-bg="primary-container"] { background-color: var(--lustrous-color-primary-container); color: var(--lustrous-color-on-primary-container); }
      .item[data-bg="accent-container"] { background-color: var(--lustrous-color-accent-container); color: var(--lustrous-color-on-accent-container); }
      .item[data-bg="tertiary-container"] { background-color: var(--lustrous-color-tertiary-container); color: var(--lustrous-color-on-tertiary-container); }
      .item[data-bg="positive-container"] { background-color: var(--lustrous-color-positive-container); color: var(--lustrous-color-on-positive-container); }
      .item[data-bg="warning-container"] { background-color: var(--lustrous-color-warning-container); color: var(--lustrous-color-on-warning-container); }
      .item[data-bg="error-container"] { background-color: var(--lustrous-color-error-container); color: var(--lustrous-color-on-error-container); }
      .item.sub-back {
        font-weight: 560;
      }
      .trail-custom {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
      }
      @media (forced-colors: active) {
        .menu {
          border: 1px solid CanvasText;
        }
        .item:focus-visible {
          outline-color: Highlight;
        }
        .divider {
          background-color: CanvasText;
        }
        .item.selected {
          outline: 1px solid Highlight;
          outline-offset: -1px;
        }
        .switch.on {
          border-color: Highlight;
          background-color: Highlight;
        }
        .switch.on .switch-thumb {
          background-color: HighlightText;
        }
      }
    `,
    toCss(expandInCss(".menu:popover-open")),
  ];

  @property({ attribute: false }) items: LustrousMenuItem[] = [];
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ reflect: true }) side: FloatingSide = "bottom";
  @property({ reflect: true }) align: FloatingAlign = "start";
  @property({ type: Number }) offset = 4;

  @property({
    reflect: true,
    attribute: "max-height",
    converter: {
      fromAttribute: (v: string | null) =>
        v === null || v === "" ? undefined : v === "available" ? "available" : Number(v),
      toAttribute: (v: number | "available" | undefined) =>
        v === undefined || v === null ? null : String(v),
    },
  })
  maxHeight?: number | "available";

  @property({
    reflect: true,
    converter: {
      fromAttribute: (v: string | null) =>
        v === null || v === "" ? undefined : v === "max-content" ? "max-content" : Number(v),
      toAttribute: (v: number | "max-content" | undefined) =>
        v === undefined || v === null ? null : String(v),
    },
  })
  width?: number | "max-content";

  @property({ attribute: false }) anchor?: Element | null;
  /** Explicit element focused when the menu closes via item selection (overrides returning focus to the trigger). */
  @property({ attribute: false }) returnFocus?: HTMLElement | null;
  @property() label = "";
  @property({ type: Boolean, reflect: true, attribute: "open-on-hover" }) openOnHover = false;
  @property({ type: Number, attribute: "hover-open-delay" }) hoverOpenDelay = 100;
  @property({ type: Number, attribute: "hover-close-delay" }) hoverCloseDelay = 0;

  private static readonly HOVER_BRIDGE = 150;
  private openedByHover = false;
  private hoverFirstClickAbsorbed = false;
  private hoverTimer?: ReturnType<typeof setTimeout>;
  private hoverDismissedAt = Number.NEGATIVE_INFINITY;

  @query(".menu[data-path='root']") private root!: HTMLDivElement;
  @query("lustrous-tooltip.item-tip") private itemTip?: LustrousTooltip;
  @state() private openSubs = new Set<string>();
  @state() private mobileStack: Array<{ path: string; label: string; items: LustrousMenuItem[] }> = [];
  @state() private itemTipOpen = false;
  @state() private itemTipContent = "";
  @state() private itemTipSide: LustrousTooltipSide = "inline-end";
  @state() private itemTipAnchor: Element | null = null;
  private readonly mobileViewport = new LustrousMediaController(this, "mobile");
  private readonly shortcutScope = new LustrousShortcutScopeController(this, { active: false });
  private keyboardModality = false;
  private trigger?: HTMLElement;
  private cleanups = new Map<string, () => void>();
  private scopeObserver?: MutationObserver;
  private dismissedAt = Number.NEGATIVE_INFINITY;
  private focusLastOnOpen = false;

  show(): void {
    this.open = true;
  }

  hide(): void {
    this.open = false;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("keydown", this.onDocumentKeydown);
    this.shortcutScope.setActive(this.open);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("keydown", this.onDocumentKeydown);
    clearTimeout(this.hoverTimer);
    this.hideItemTooltip();
    this.stopScopeObserver();
    for (const c of this.cleanups.values()) c();
    this.cleanups.clear();
  }

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (changed.has("open")) {
      this.shortcutScope.setActive(this.open);
    }
    if (changed.has("maxHeight")) {
      setHostVar(
        this,
        "--_lustrous-menu-max-height",
        typeof this.maxHeight === "number" && Number.isFinite(this.maxHeight) ? `${this.maxHeight}px` : undefined,
      );
    }
    if (changed.has("width")) {
      setHostVar(
        this,
        "--_lustrous-menu-width",
        typeof this.width === "number" && Number.isFinite(this.width) ? `${this.width}px` : undefined,
      );
    }
  }

  private isScopeHidden(): boolean {
    const scope = this.anchor ?? this.trigger ?? this;
    if (!scope.isConnected) return true;
    for (let n: Node | null = scope; n && n !== document; n = n.parentNode ?? (n as ShadowRoot).host ?? null) {
      if (n instanceof HTMLElement && (n.hidden || getComputedStyle(n).display === "none")) return true;
    }
    return false;
  }

  private startScopeObserver(): void {
    this.stopScopeObserver();
    if (typeof MutationObserver === "undefined" || typeof document === "undefined") return;
    const check = () => {
      if (this.open && this.isScopeHidden()) this.open = false;
    };
    this.scopeObserver = new MutationObserver(check);
    const opts: MutationObserverInit = {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["hidden", "class", "style"],
    };
    if (document.body) this.scopeObserver.observe(document.body, opts);
    const scope = this.anchor ?? this.trigger ?? this;
    for (let root = scope.getRootNode(); root instanceof ShadowRoot; root = root.host.getRootNode()) {
      this.scopeObserver.observe(root, opts);
    }
  }

  private stopScopeObserver(): void {
    this.scopeObserver?.disconnect();
    this.scopeObserver = undefined;
  }

  private onTriggerSlotChange(e: Event): void {
    const el = (e.target as HTMLSlotElement).assignedElements()[0] as HTMLElement | undefined;
    if (el === this.trigger) return;
    this.trigger?.removeEventListener("click", this.onTriggerClick);
    this.trigger?.removeEventListener("keydown", this.onTriggerKeydown);
    this.trigger?.removeEventListener("pointerenter", this.onHoverEnter);
    this.trigger?.removeEventListener("pointerleave", this.onHoverLeave);
    this.trigger = el;
    el?.addEventListener("click", this.onTriggerClick);
    el?.addEventListener("keydown", this.onTriggerKeydown);
    el?.addEventListener("pointerenter", this.onHoverEnter);
    el?.addEventListener("pointerleave", this.onHoverLeave);
    this.syncTriggerAria();
    this.requestUpdate();
  }

  private syncTriggerAria(): void {
    if (!this.trigger) return;
    this.trigger.setAttribute("aria-haspopup", "menu");
    this.trigger.setAttribute("aria-expanded", this.open ? "true" : "false");
  }

  private onTriggerClick = (e: MouseEvent): void => {
    if ((this.trigger as HTMLElement & { disabled?: boolean })?.disabled) return;
    const keyboard = e.detail === 0;
    this.keyboardModality = keyboard;
    clearTimeout(this.hoverTimer);
    if (this.open && this.openedByHover) {
      if (keyboard) {
        this.open = false;
        return;
      }
      if (!this.hoverFirstClickAbsorbed) {
        this.hoverFirstClickAbsorbed = true;
        return;
      }
      this.open = false;
      return;
    }
    if (!this.open && performance.now() - this.hoverDismissedAt < 300) {
      this.hoverDismissedAt = Number.NEGATIVE_INFINITY;
      this.open = true;
      return;
    }
    if (!this.open && performance.now() - this.dismissedAt < 300) return;
    this.open = !this.open;
  };

  private onHoverEnter = (): void => {
    clearTimeout(this.hoverTimer);
    if (!this.openOnHover || this.open || (this.trigger as HTMLElement & { disabled?: boolean })?.disabled) return;
    this.hoverTimer = setTimeout(() => {
      this.openedByHover = true;
      this.hoverFirstClickAbsorbed = false;
      this.open = true;
    }, this.hoverOpenDelay);
  };

  private onHoverLeave = (): void => {
    clearTimeout(this.hoverTimer);
    if (!this.open || !this.openedByHover) return;
    this.hoverTimer = setTimeout(() => {
      this.open = false;
    }, this.hoverCloseDelay + LustrousMenu.HOVER_BRIDGE);
  };

  private onPanelEnter = (): void => {
    if (this.openedByHover) clearTimeout(this.hoverTimer);
  };

  private onTriggerKeydown = (e: KeyboardEvent): void => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      this.keyboardModality = true;
      this.focusLastOnOpen = e.key === "ArrowUp";
      if (this.open) this.focusItem(this.root, this.focusLastOnOpen ? "last" : "first");
      else this.open = true;
    }
  };

  private onDocumentKeydown = (e: KeyboardEvent): void => {
    if (!this.open || e.key !== "Escape" || e.defaultPrevented) return;
    if (this.openSubs.size > 0) {
      const deepest = [...this.openSubs].sort((a, b) => b.length - a.length)[0];
      if (deepest) {
        e.preventDefault();
        this.closeSub(deepest, false);
        return;
      }
    }
    if (this.shortcutScope.canHandleEscape(e)) {
      e.preventDefault();
      this.closeAll(false);
    }
  };

  private showItemTooltip(item: InteractiveItem, el: HTMLElement, fromFocus = false): void {
    if (item.tooltip) {
      if (fromFocus && !this.keyboardModality) return;
      this.itemTipAnchor = el;
      this.itemTipContent = item.tooltip;
      this.itemTipSide = "inline-end";
      this.itemTipOpen = true;
      return;
    }
    if (fromFocus || this.mobileViewport.matches) return;
    const labelEl = el.querySelector<HTMLElement>(".label");
    if (labelEl && (labelEl.scrollWidth > labelEl.clientWidth || labelEl.scrollHeight > labelEl.clientHeight)) {
      this.itemTipAnchor = el;
      this.itemTipContent = item.label;
      this.itemTipSide = "top";
      this.itemTipOpen = true;
    } else {
      this.hideItemTooltip();
    }
  }

  private hideItemTooltip(): void {
    this.itemTipOpen = false;
    this.itemTipAnchor = null;
    if (this.itemTip) {
      this.itemTip.open = false;
      this.itemTip.querySelector<HTMLElement>("[popover]")?.hidePopover?.();
    }
  }

  private enabledItems(menu: Element): HTMLElement[] {
    return [...menu.querySelectorAll<HTMLElement>(".item")].filter(
      (el) => el.closest(".menu") === menu && el.getAttribute("aria-disabled") !== "true",
    );
  }

  private setRovingTabindex(menu: Element, active: HTMLElement): void {
    for (const el of this.enabledItems(menu)) {
      el.tabIndex = el === active ? 0 : -1;
    }
  }

  private focusItem(menu: Element, which: "first" | "last" | "next" | "prev", from?: Element): void {
    const list = this.enabledItems(menu);
    if (!list.length) return;
    const i = from ? list.indexOf(from as HTMLElement) : -1;
    const idx =
      which === "first"
        ? 0
        : which === "last"
          ? list.length - 1
          : which === "next"
            ? (i + 1) % list.length
            : (i - 1 + list.length) % list.length;
    const target = list[idx]!;
    this.setRovingTabindex(menu, target);
    target.focus();
  }

  private menuOf(el: Element): HTMLElement {
    return el.closest<HTMLElement>(".menu")!;
  }

  private closeAll(focusTrigger: boolean, fromItemSelect = false): void {
    this.open = false;
    if (fromItemSelect && this.returnFocus?.isConnected) {
      this.returnFocus.focus();
      return;
    }
    if (focusTrigger) this.trigger?.focus();
  }

  private get isMobileDrilldown(): boolean {
    return this.mobileViewport.matches;
  }

  private findDefaultOpenSubmenu(
    items: LustrousMenuItem[],
    prefix = "",
  ): Array<{ path: string; label: string; items: LustrousMenuItem[] }> {
    for (let i = 0; i < items.length; i++) {
      const item = items[i]!;
      const p = prefix ? `${prefix}/${i}` : `${i}`;
      if (item.type === "section") {
        const nested = this.findDefaultOpenSubmenu(item.items, `${p}.`);
        if (nested.length) return nested;
      } else if (item.type === "submenu") {
        if (item.defaultOpen) return [{ path: p, label: item.label, items: item.items }];
        const nested = this.findDefaultOpenSubmenu(item.items, p);
        if (nested.length) return [{ path: p, label: item.label, items: item.items }, ...nested];
      }
    }
    return [];
  }

  private drillInto(path: string, label: string, items: LustrousMenuItem[], focusFirst: boolean): void {
    this.mobileStack = [...this.mobileStack, { path, label, items }];
    if (focusFirst) {
      void this.updateComplete.then(() => {
        if (this.root) this.focusItem(this.root, "first");
      });
    }
  }

  private drillBack(focusParent: boolean): void {
    const popped = this.mobileStack[this.mobileStack.length - 1];
    if (!popped) return;
    this.mobileStack = this.mobileStack.slice(0, -1);
    if (focusParent) {
      void this.updateComplete.then(() => {
        const target = this.renderRoot.querySelector<HTMLElement>(`.item[data-sub="${popped.path}"]`);
        if (target && this.root) {
          this.setRovingTabindex(this.root, target);
          target.focus();
        } else if (this.root) {
          this.focusItem(this.root, "first");
        }
      });
    }
  }

  private onMenuKeydown(e: KeyboardEvent): void {
    const item = (e.composedPath() as Element[]).find(
      (n) => n instanceof HTMLElement && n.classList?.contains("item"),
    ) as HTMLElement | undefined;
    const menu = e.currentTarget as HTMLElement;
    if (item && this.menuOf(item) !== menu) return;
    this.keyboardModality = true;
    e.stopPropagation();
    const rtl = getComputedStyle(this).direction === "rtl";
    const openKey = rtl ? "ArrowLeft" : "ArrowRight";
    const closeKey = rtl ? "ArrowRight" : "ArrowLeft";
    const isSub = menu.dataset.path !== "root";

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this.focusItem(menu, item ? "next" : "first", item);
        return;
      case "ArrowUp":
        e.preventDefault();
        this.focusItem(menu, item ? "prev" : "last", item);
        return;
      case "Home":
        e.preventDefault();
        this.focusItem(menu, "first");
        return;
      case "End":
        e.preventDefault();
        this.focusItem(menu, "last");
        return;
      case "Enter":
      case " ":
        if (item) {
          e.preventDefault();
          item.click();
        }
        return;
      case "Escape":
        if (!isSub && this.mobileStack.length > 0) {
          e.preventDefault();
          this.drillBack(true);
          return;
        }
        if (!isSub && !this.shortcutScope.canHandleEscape(e)) return;
        e.preventDefault();
        if (isSub) this.closeSub(menu.dataset.path!, true);
        else this.closeAll(true);
        return;
      case "Tab":
        this.closeAll(false);
        return;
      default:
        if (e.key === openKey && item?.dataset.sub) {
          e.preventDefault();
          if (this.isMobileDrilldown) {
            item.click();
          } else {
            this.openSub(item.dataset.sub, item, true);
          }
        } else if (e.key === closeKey && (isSub || this.mobileStack.length > 0)) {
          e.preventDefault();
          if (this.mobileStack.length > 0) this.drillBack(true);
          else this.closeSub(menu.dataset.path!, true);
        } else if (e.key.length === 1 && /\S/.test(e.key)) {
          const list = this.enabledItems(menu);
          const start = item ? list.indexOf(item) + 1 : 0;
          const k = e.key.toLowerCase();
          const match = [...list.slice(start), ...list.slice(0, start)].find((el) =>
            el.textContent!.trim().toLowerCase().startsWith(k),
          );
          if (match) {
            this.setRovingTabindex(menu, match);
            match.focus();
          }
        }
    }
  }

  private subPanel(path: string): HTMLElement | null {
    return this.renderRoot.querySelector<HTMLElement>(`.menu[data-path="${path}"]`);
  }

  private openSub(path: string, itemEl: HTMLElement, focusFirst: boolean): void {
    for (const p of [...this.openSubs]) {
      if (p !== path && !path.startsWith(`${p}/`)) this.closeSub(p, false);
    }
    const panel = this.subPanel(path);
    if (!panel) return;
    if (!panel.matches(":popover-open")) {
      panel.showPopover?.();
      this.cleanups.get(path)?.();
      this.cleanups.set(
        path,
        autoPosition(itemEl, panel, () => ({
          side: "inline-end",
          align: "start",
          offset: 0,
          alignOffset: -8,
        })),
      );
    }
    this.openSubs = new Set(this.openSubs).add(path);
    if (focusFirst) this.focusItem(panel, "first");
  }

  private closeSub(path: string, focusParent: boolean): void {
    const panel = this.subPanel(path);
    this.cleanups.get(path)?.();
    this.cleanups.delete(path);
    if (panel?.matches(":popover-open")) panel.hidePopover?.();
    const next = new Set([...this.openSubs].filter((p) => p !== path && !p.startsWith(`${path}/`)));
    this.openSubs = next;
    if (focusParent) this.renderRoot.querySelector<HTMLElement>(`.item[data-sub="${path}"]`)?.focus();
  }

  private onPanelBeforeToggle(e: ToggleEvent): void {
    const panel = e.target as HTMLElement;
    if (panel.dataset.path !== "root" || e.newState !== "closed" || !this.open) return;
    this.dismissedAt = performance.now();
    if (this.openedByHover) this.hoverDismissedAt = this.dismissedAt;
    this.open = false;
  }

  private onPanelToggle(e: ToggleEvent): void {
    const panel = e.target as HTMLElement;
    const path = panel.dataset.path!;
    if (path === "root") {
      const nowOpen = e.newState === "open";
      if (nowOpen !== this.open) {
        if (!nowOpen) {
          this.dismissedAt = performance.now();
          if (this.openedByHover) this.hoverDismissedAt = this.dismissedAt;
        }
        this.open = nowOpen;
      }
    } else if (e.newState === "closed" && this.openSubs.has(path)) {
      this.closeSub(path, false);
    }
  }

  private activate(item: InteractiveItem, path: string, e: Event, el: HTMLElement): void {
    if (item.disabled) {
      e.preventDefault();
      return;
    }
    let value: boolean | undefined;
    let close = true;
    switch (item.type) {
      case "submenu":
        if (this.isMobileDrilldown) {
          this.drillInto(path, item.label, item.items, true);
        } else if (this.openSubs.has(path)) {
          this.closeSub(path, false);
        } else {
          this.openSub(path, el, (e as MouseEvent).detail === 0);
        }
        return;
      case "action":
        item.onClick?.(e);
        close = item.closeOnClick ?? true;
        break;
      case "link":
        item.onClick?.(e);
        close = item.closeOnClick ?? true;
        break;
      case "selection":
        value = !item.selected;
        item.onSelect?.(value, item.id);
        close = item.selectionType === "single";
        break;
      case "toggle":
        value = !item.checked;
        item.onChange?.(value, item.id);
        close = false;
        break;
    }
    this.dispatchEvent(
      new CustomEvent("lustrous-select", {
        detail: { item, id: item.id, value },
        bubbles: true,
        composed: true,
      }),
    );
    if (close) {
      const keyboardActivated = (e as MouseEvent).detail === 0;
      this.closeAll(keyboardActivated, true);
    }
  }

  private onItemHover(item: InteractiveItem, path: string, el: HTMLElement): void {
    this.keyboardModality = false;
    this.showItemTooltip(item, el, false);
    if (item.disabled) return;
    this.setRovingTabindex(this.menuOf(el), el);
    el.focus({ preventScroll: true });
    if (this.isMobileDrilldown) return;
    const level = path.split("/").slice(0, -1).join("/");
    for (const p of [...this.openSubs]) {
      const parent = p.split("/").slice(0, -1).join("/");
      if (parent === level && p !== path) this.closeSub(p, false);
    }
    if (item.type === "submenu") this.openSub(path, el, false);
  }

  private onItemLeave(): void {
    this.hideItemTooltip();
  }

  private onItemFocus(item: InteractiveItem, el: HTMLElement): void {
    this.showItemTooltip(item, el, true);
  }

  private onItemBlur(el: HTMLElement): void {
    if (!el.matches(":hover")) this.hideItemTooltip();
  }

  private renderContent(item: InteractiveItem, lead: unknown, trail: unknown, nudge = false): TemplateResult {
    const lines = item.descriptionMaxLines ?? 1;
    const label = html`<span class="label">${item.label}</span>`;
    const isNudge = nudge || Boolean(item.reserveLeadingSpace);
    const leading =
      lead && lead !== nothing
        ? html`<span class="lead ${isNudge ? "nudge" : ""}">${lead}</span>`
        : isNudge
          ? html`<span class="lead nudge"></span>`
          : nothing;
    const customTrail =
      item.trailingContent !== undefined && item.trailingContent !== null && item.trailingContent !== nothing
        ? html`<span class="trail-custom">${item.trailingContent}</span>`
        : nothing;
    const hasTrail = (trail && trail !== nothing) || customTrail !== nothing;
    return html`${leading}
      <span class="text"
        >${item.badge
          ? html`<span class="label-row">${label}<lustrous-badge>${item.badge}</lustrous-badge></span>`
          : label}${item.description
          ? html`<span class="desc lines-${lines}">${item.description}</span>`
          : nothing}</span
      >
      ${hasTrail ? html`<span class="trail">${customTrail}${trail && trail !== nothing ? trail : nothing}</span>` : nothing}`;
  }

  private renderItem(
    item: LustrousMenuItem,
    path: string,
    roving: { assigned: boolean },
    submenus: SubmenuDescriptor[],
  ): TemplateResult | typeof nothing {
    if (item.type === "divider") return html`<div class="divider" role="separator"></div>`;
    if (item.type === "header") return nothing;
    if (item.type === "section") {
      const id = `s-${path.replaceAll("/", "-").replaceAll(".", "_")}`;
      return html`<div class="group" role="group" aria-labelledby=${item.label ? id : nothing}>
        ${item.label ? html`<div class="header" id=${id} role="presentation">${item.label}</div>` : nothing}
        ${this.renderItems(item.items, path, ".", roving, submenus)}
      </div>`;
    }

    const tabIdx = !item.disabled && !roving.assigned ? ((roving.assigned = true), "0") : "-1";
    const icon = item.icon ? renderIcon(item.icon, "s") : nothing;
    const trailIcon = !item.trailingIcon
      ? nothing
      : item.trailingIconVisibility === "interaction"
        ? html`<span class="hover-trail">${renderIcon(item.trailingIcon, "s")}</span>`
        : renderIcon(item.trailingIcon, "s");
    const shortcut = "shortcut" in item && item.shortcut ? html`<span class="shortcut">${item.shortcut}</span>` : nothing;

    const common = (
      role: string,
      cls: string,
      content: TemplateResult,
      extra: Record<string, string | undefined> = {},
    ) => html`<div
      part="item"
      class="item ${cls}"
      data-bg=${ifDefined(item.background)}
      role=${role}
      tabindex=${tabIdx}
      aria-label=${ifDefined(item.ariaLabel)}
      aria-disabled=${item.disabled ? "true" : nothing}
      aria-checked=${ifDefined(extra.checked)}
      @click=${(e: Event) => this.activate(item, path, e, e.currentTarget as HTMLElement)}
      @pointerenter=${(e: PointerEvent) => this.onItemHover(item, path, e.currentTarget as HTMLElement)}
      @pointerleave=${() => this.onItemLeave()}
      @focusin=${(e: FocusEvent) => this.onItemFocus(item, e.currentTarget as HTMLElement)}
      @focusout=${(e: FocusEvent) => this.onItemBlur(e.currentTarget as HTMLElement)}
    >
      ${content}
    </div>`;

    switch (item.type) {
      case "action":
        return common(
          "menuitem",
          item.destructive ? "destructive" : "",
          this.renderContent(item, icon, shortcut !== nothing ? shortcut : trailIcon),
        );
      case "link":
        return html`<a
          part="item"
          class="item ${item.active && !item.disabled ? "selected" : ""}"
          data-bg=${ifDefined(item.background)}
          role="menuitem"
          tabindex=${tabIdx}
          href=${ifDefined(item.disabled ? undefined : item.href)}
          target=${ifDefined(item.target)}
          rel=${ifDefined(item.rel ?? (item.target === "_blank" ? "noopener noreferrer" : undefined))}
          aria-label=${ifDefined(item.ariaLabel)}
          aria-disabled=${item.disabled ? "true" : nothing}
          aria-current=${item.active && !item.disabled ? "page" : nothing}
          @click=${(e: Event) => this.activate(item, path, e, e.currentTarget as HTMLElement)}
          @pointerenter=${(e: PointerEvent) => this.onItemHover(item, path, e.currentTarget as HTMLElement)}
          @pointerleave=${() => this.onItemLeave()}
          @focusin=${(e: FocusEvent) => this.onItemFocus(item, e.currentTarget as HTMLElement)}
          @focusout=${(e: FocusEvent) => this.onItemBlur(e.currentTarget as HTMLElement)}
          >${this.renderContent(item, icon, shortcut !== nothing ? shortcut : trailIcon)}</a
        >`;
      case "selection": {
        const check = renderIcon("checkSmall", "s");
        const multi = item.selectionType === "multi";
        const rest = shortcut !== nothing ? shortcut : trailIcon;
        const content = item.icon
          ? this.renderContent(item, icon, item.selected ? check : rest)
          : this.renderContent(item, item.selected ? check : nothing, rest, true);
        return common(multi ? "menuitemcheckbox" : "menuitemradio", "", content, {
          checked: item.selected ? "true" : "false",
        });
      }
      case "toggle": {
        const checked = item.partial ? "mixed" : item.checked ? "true" : "false";
        if (item.control === "checkbox") {
          const mark = item.partial
            ? renderIcon("remove", "s")
            : item.checked
              ? renderIcon("check", "s")
              : nothing;
          return common("menuitemcheckbox", "", this.renderContent(item, icon, mark), { checked });
        }
        const sw = html`<span class="switch ${item.checked ? "on" : ""}" aria-hidden="true"
          ><span class="switch-thumb"></span
        ></span>`;
        return common("menuitemcheckbox", "", this.renderContent(item, icon, sw), { checked });
      }
      case "submenu": {
        const isOpen = this.openSubs.has(path);
        submenus.push({ path, label: item.label, items: item.items });
        return html`<div
          part="item"
          class="item ${isOpen ? "sub-open" : ""}"
          data-bg=${ifDefined(item.background)}
          role="menuitem"
          tabindex=${tabIdx}
          data-sub=${path}
          aria-label=${ifDefined(item.ariaLabel)}
          aria-haspopup="menu"
          aria-expanded=${isOpen ? "true" : "false"}
          aria-disabled=${item.disabled ? "true" : nothing}
          @click=${(e: Event) => this.activate(item, path, e, e.currentTarget as HTMLElement)}
          @pointerenter=${(e: PointerEvent) => this.onItemHover(item, path, e.currentTarget as HTMLElement)}
          @pointerleave=${() => this.onItemLeave()}
          @focusin=${(e: FocusEvent) => this.onItemFocus(item, e.currentTarget as HTMLElement)}
          @focusout=${(e: FocusEvent) => this.onItemBlur(e.currentTarget as HTMLElement)}
        >
          ${this.renderContent(item, icon, html`${trailIcon}${renderIcon("chevronRight", "s")}`)}
        </div>`;
      }
    }
  }

  private renderItems(
    items: LustrousMenuItem[],
    path: string,
    sep: "/" | ".",
    roving: { assigned: boolean },
    submenus: SubmenuDescriptor[],
  ): TemplateResult[] {
    const chunks: TemplateResult[] = [];
    let group: { header: LustrousMenuHeaderItem; id: string; items: TemplateResult[] } | undefined;
    const flush = () => {
      if (!group) return;
      chunks.push(html`<div class="group" role="group" aria-labelledby=${group.id}>
        <div class="header" id=${group.id} role="presentation">${group.header.label}</div>
        ${group.items}
      </div>`);
      group = undefined;
    };

    items.forEach((item, i) => {
      const p = path === "root" ? `${i}` : `${path}${sep}${i}`;
      if (item.type === "header") {
        flush();
        group = { header: item, id: `h-${p.replaceAll("/", "-").replaceAll(".", "_")}`, items: [] };
        return;
      }
      if (item.type === "divider" || item.type === "section") flush();
      const r = this.renderItem(item, p, roving, submenus);
      if (r === nothing) return;
      if (group) group.items.push(r as TemplateResult);
      else chunks.push(r as TemplateResult);
    });
    flush();
    return chunks;
  }

  private renderPanels(items: LustrousMenuItem[], rootLabel: string): TemplateResult[] {
    if (this.isMobileDrilldown && this.mobileStack.length > 0) {
      const top = this.mobileStack[this.mobileStack.length - 1]!;
      const roving = { assigned: false };
      const ignoredSubs: SubmenuDescriptor[] = [];
      const backLabel = getLustrousLabels().backToMainMenu;
      const chunks = this.renderItems(top.items, top.path, "/", roving, ignoredSubs);
      return [
        html`<div
          part="menu"
          class="menu"
          role="menu"
          tabindex=${roving.assigned ? nothing : "0"}
          data-path="root"
          data-lustrous-shortcut-scope=""
          popover="auto"
          aria-label=${top.label || rootLabel || nothing}
          @keydown=${this.onMenuKeydown}
          @beforetoggle=${this.onPanelBeforeToggle}
          @toggle=${this.onPanelToggle}
          @pointerenter=${this.onPanelEnter}
          @pointerleave=${this.onHoverLeave}
        >
          <div
            part="back-button"
            class="item sub-back"
            role="menuitem"
            tabindex=${roving.assigned ? "-1" : "0"}
            aria-label=${backLabel}
            @click=${() => this.drillBack(true)}
          >
            <span class="lead">${renderIcon("arrowBack", "s")}</span>
            <span class="text"><span class="label">${top.label}</span></span>
          </div>
          <div class="divider" role="separator"></div>
          ${chunks}
        </div>`,
      ];
    }
    const panels: TemplateResult[] = [];
    const queue: SubmenuDescriptor[] = [{ path: "root", label: rootLabel, items }];
    while (queue.length > 0) {
      const current = queue.shift()!;
      const roving = { assigned: false };
      const childSubmenus: SubmenuDescriptor[] = [];
      const chunks = this.renderItems(current.items, current.path, "/", roving, childSubmenus);
      const isRoot = current.path === "root";
      panels.push(html`<div
        part="menu"
        class="menu"
        role="menu"
        tabindex=${roving.assigned ? nothing : "0"}
        data-path=${current.path}
        data-lustrous-shortcut-scope=""
        popover=${isRoot ? "auto" : "manual"}
        aria-label=${current.label || nothing}
        @keydown=${this.onMenuKeydown}
        @beforetoggle=${this.onPanelBeforeToggle}
        @toggle=${this.onPanelToggle}
        @pointerenter=${this.onPanelEnter}
        @pointerleave=${this.onHoverLeave}
      >
        ${chunks}
      </div>`);
      queue.push(...childSubmenus);
    }
    return panels;
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    if (!changed.has("open")) return;
    if (this.open && this.isScopeHidden()) {
      this.open = false;
      return;
    }
    this.syncTriggerAria();
    const root = this.root;
    if (this.open && !root.matches(":popover-open")) {
      root.showPopover?.();
      this.cleanups.get("root")?.();
      this.cleanups.set(
        "root",
        autoPosition(this.anchor ?? this.trigger ?? this, root, () => ({
          side: this.side,
          align: this.align,
          offset: this.offset,
        })),
      );
      this.startScopeObserver();
      if (this.isMobileDrilldown && this.mobileStack.length === 0) {
        const initialStack = this.findDefaultOpenSubmenu(this.items);
        if (initialStack.length > 0) this.mobileStack = initialStack;
      }
      if (!this.openedByHover) {
        this.focusItem(root, this.focusLastOnOpen ? "last" : "first");
      }
      this.focusLastOnOpen = false;
    } else if (!this.open) {
      this.openedByHover = false;
      this.hoverFirstClickAbsorbed = false;
      if (this.mobileStack.length > 0) this.mobileStack = [];
      clearTimeout(this.hoverTimer);
      this.hideItemTooltip();
      this.stopScopeObserver();
      for (const p of [...this.openSubs]) this.closeSub(p, false);
      this.cleanups.get("root")?.();
      this.cleanups.delete("root");
      const focusInside = this.renderRoot.querySelector(".menu:focus-within") !== null;
      if (root.matches(":popover-open")) root.hidePopover?.();
      if (focusInside) this.trigger?.focus();
    }
    if (changed.get("open") !== undefined) {
      this.dispatchEvent(
        new CustomEvent("lustrous-toggle", { detail: { open: this.open }, bubbles: true, composed: true }),
      );
    }
  }

  protected override render() {
    const label =
      this.label || this.trigger?.getAttribute("aria-label") || this.trigger?.textContent?.trim() || "Menu";
    return html`<slot name="trigger" @slotchange=${this.onTriggerSlotChange}></slot>
      ${this.renderPanels(this.items, label)}
      <lustrous-tooltip
        class="item-tip"
        content=${this.itemTipContent}
        side=${this.itemTipSide}
        .anchor=${this.itemTipAnchor}
        .open=${this.itemTipOpen}
        @lustrous-toggle=${(e: Event) => e.stopPropagation()}
      ></lustrous-tooltip>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-menu": LustrousMenu;
  }
  interface HTMLElementEventMap {
    "lustrous-select": LustrousMenuSelectEvent;
  }
}
