import { css, html, nothing, unsafeCSS, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { lustrousSrOnly } from "../../internal/a11y.js";
import { estimateProseDirection, renderIsolatedTechnicalTokens, resolveDirection } from "../../internal/bidi.js";
import { resolveDimension, setHostVar } from "../../internal/style-gen.js";
import "../../theme/events.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { LustrousMediaController } from "../../theme/media.js";
import { lustrousBase, lustrousFocusRing, lustrousStateLayer, lustrousType } from "../../theme/theme.js";
import { breakpoints } from "../../theme/tokens.js";
import "../lustrous-badge/lustrous-badge.js";
import "../lustrous-badge-indicator/lustrous-badge-indicator.js";
import { lustrousChevronStyles, renderChevron } from "../lustrous-chevron-icon/lustrous-chevron-icon.js";
import "../lustrous-icon-button/lustrous-icon-button.js";
import { renderIcon, type LustrousIconName } from "../lustrous-icon/lustrous-icon.js";
import "../lustrous-menu/lustrous-menu.js";
import type { LustrousMenu, LustrousMenuItem } from "../lustrous-menu/lustrous-menu.js";
import { LustrousModal } from "../lustrous-modal/lustrous-modal.js";
import "../lustrous-scrollable-box/lustrous-scrollable-box.js";
import type { LustrousScrollableBox } from "../lustrous-scrollable-box/lustrous-scrollable-box.js";
import "../lustrous-spinner/lustrous-spinner.js";
import "../lustrous-tooltip/lustrous-tooltip.js";
import type { LustrousTooltip } from "../lustrous-tooltip/lustrous-tooltip.js";

const EASE = unsafeCSS("var(--lustrous-duration-medium300) var(--lustrous-easing-standard)");

export type LustrousSidebarDensity = "default" | "compact-panel" | "mobile";
export type LustrousSidebarSurfaceTone = "surface" | "surface-bright";
export type LustrousSidebarDismissVariant = "trailing-close" | "leading-back";

/**
 * Base class for sub-elements inside `<lustrous-sidebar>`. Registers with the nearest
 * `<lustrous-sidebar>` ancestor and reflects `data-sidebar-collapsed` and `data-sidebar-density`
 * so styles and ARIA states synchronize without requiring an external context provider.
 */
export class LustrousSidebarPart extends LustrousElement {
  @property({ type: Boolean, reflect: true, attribute: "data-sidebar-collapsed" }) sidebarCollapsed = false;
  @property({ reflect: true, attribute: "data-sidebar-density" }) sidebarDensity: LustrousSidebarDensity = "default";

  protected sidebar?: LustrousSidebar;

  override connectedCallback(): void {
    super.connectedCallback();
    let n: Node | null = this.parentNode;
    while (n) {
      if (n instanceof LustrousSidebar) break;
      n = n instanceof ShadowRoot ? n.host : n.parentNode;
    }
    this.sidebar = (n as LustrousSidebar | null) ?? undefined;
    this.sidebar?.registerPart(this);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.sidebar?.unregisterPart(this);
    this.sidebar = undefined;
  }
}

/**
 * `<lustrous-sidebar>` — Collapsible application navigation shell (`272px` ↔ `56px`).
 *
 * Exposes a `complementary` landmark and coordinates collapsed state across
 * `<lustrous-sidebar-header>`, `<lustrous-sidebar-nav>`, `<lustrous-sidebar-scroll-area>`,
 * `<lustrous-sidebar-section>`, `<lustrous-sidebar-item>`, `<lustrous-sidebar-message>`,
 * and `<lustrous-sidebar-footer>`.
 *
 * @slot - Sidebar composition parts (`header`, `nav`, `footer`).
 * @fires lustrous-change - `CustomEvent<{ collapsed: boolean }>` (cancelable) when collapse state is toggled.
 */
@customElement("lustrous-sidebar")
export class LustrousSidebar extends LustrousElement {
  static override styles = [
    lustrousBase,
    css`
      :host {
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        box-sizing: border-box;
        width: var(--_lustrous-sidebar-width, 272px);
        height: 100%;
        min-height: 0;
        overflow: hidden;
        background-color: var(--lustrous-color-surface-bright);
        color: var(--lustrous-color-on-surface);
        border-inline-end: 1px solid var(--lustrous-color-outline-variant);
        transition: width ${EASE};
      }
      :host([collapsed]) {
        width: var(--_lustrous-sidebar-collapsed-width, 56px);
        background-color: var(--lustrous-color-surface);
      }
      :host([surface-tone="surface"]) {
        background-color: var(--lustrous-color-surface);
      }
      :host([density="compact-panel"]) {
        width: var(--_lustrous-sidebar-width, 100%);
        --_lustrous-compact-s-min-target: 0px;
      }
      :host([density="compact-panel"][collapsed]) {
        width: var(--_lustrous-sidebar-collapsed-width, 56px);
      }
      @media (prefers-reduced-motion: reduce) {
        :host {
          transition: none;
        }
      }
      @media ${unsafeCSS(breakpoints.shellMobile)} {
        :host {
          min-width: 100%;
          max-width: 100%;
        }
      }
      @media (forced-colors: active) {
        :host {
          border-inline-end: 1px solid CanvasText;
        }
      }
    `,
  ];

  @property({ type: Boolean, reflect: true }) collapsed = false;
  /** Layout density preset: `default`, `compact-panel` (full-width dense panel), or `mobile` (pins mobile geometry at any viewport width). @default "default" */
  @property({ reflect: true }) density: LustrousSidebarDensity = "default";
  /** Background surface tone when expanded (`surface-bright` default or `surface`). @default "surface-bright" */
  @property({ reflect: true, attribute: "surface-tone" }) surfaceTone: LustrousSidebarSurfaceTone = "surface-bright";
  @property() width?: string | number;
  @property({ attribute: "collapsed-width" }) collapsedWidth?: string | number;
  @property() label = "Sidebar navigation";

  private readonly parts = new Set<LustrousSidebarPart>();
  private readonly internals: ElementInternals | undefined =
    typeof this.attachInternals === "function" ? this.attachInternals() : undefined;

  /** @internal */
  registerPart(part: LustrousSidebarPart): void {
    this.parts.add(part);
    part.sidebarCollapsed = this.collapsed;
    part.sidebarDensity = this.density;
  }

  /** @internal */
  unregisterPart(part: LustrousSidebarPart): void {
    this.parts.delete(part);
  }

  toggle(force?: boolean): void {
    const next = force ?? !this.collapsed;
    if (next === this.collapsed) return;
    const ev = new CustomEvent("lustrous-change", {
      detail: { collapsed: next },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    if (this.dispatchEvent(ev)) this.collapsed = next;
  }

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (changed.has("width")) {
      setHostVar(this, "--_lustrous-sidebar-width", resolveDimension(this.width, "x"));
    }
    if (changed.has("collapsedWidth")) {
      setHostVar(this, "--_lustrous-sidebar-collapsed-width", resolveDimension(this.collapsedWidth, "x"));
    }
    if (changed.has("collapsed")) {
      for (const p of this.parts) p.sidebarCollapsed = this.collapsed;
    }
    if (changed.has("density")) {
      for (const p of this.parts) p.sidebarDensity = this.density;
    }
    if (this.internals && (changed.has("label") || !this.internals.role)) {
      this.internals.role = "complementary";
      this.internals.ariaLabel = this.label || null;
    }
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

/**
 * `<lustrous-sidebar-header>` — 56px brand header with logo, product label, optional actions,
 * and collapse/expand toggle button.
 *
 * @slot logo - 24px logo mark (`<lustrous-icon size="m">` or `<img>`).
 * @slot actions - Optional header action controls shown while expanded.
 * @csspart brand - The logo and label wrapper (`<a>` when expanded with `logo-href`, `<span>` otherwise).
 * @csspart actions - The header actions container.
 */
@customElement("lustrous-sidebar-header")
export class LustrousSidebarHeader extends LustrousSidebarPart {
  static override styles = [
    lustrousBase,
    lustrousFocusRing,
    css`
      :host {
        position: relative;
        display: flex;
        align-items: center;
        flex-shrink: 0;
        width: 100%;
        height: 56px;
      }
      .brand {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        gap: var(--lustrous-space-s);
        height: 36px;
        min-width: 0;
        margin-inline: 10px;
        padding-inline: 6px;
        border-radius: var(--lustrous-radius-full);
        color: inherit;
        text-decoration: none;
        transition:
          margin-inline ${EASE},
          padding-inline ${EASE};
      }
      a.brand {
        cursor: pointer;
      }
      .brand.focus-ring:focus-visible {
        outline-offset: -3px;
      }
      .logo {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 24px;
        height: 24px;
      }
      .label {
        overflow: hidden;
        white-space: nowrap;
        transition: opacity 150ms ease;
        ${lustrousType("body-large-emphasized")}
      }
      :host([data-sidebar-collapsed]) .label {
        opacity: 0;
      }
      .toggle {
        position: absolute;
        z-index: 1;
        inset-inline-end: 10px;
        border-radius: var(--lustrous-radius-full);
        background-color: var(--lustrous-color-surface-bright);
        transition:
          inset-inline-end ${EASE},
          opacity 150ms ease;
      }
      :host([data-sidebar-collapsed]) .toggle {
        inset-inline-end: 10px;
        opacity: 0;
        pointer-events: none;
        background-color: var(--lustrous-color-surface-dim);
      }
      :host([data-sidebar-collapsed]:hover) .toggle,
      :host([data-sidebar-collapsed]:focus-within) .toggle {
        opacity: 1;
        pointer-events: auto;
      }
      :host([data-sidebar-density="compact-panel"]) {
        height: 52px;
      }
      .leading-back {
        margin-inline-start: 10px;
        flex-shrink: 0;
      }
      :host([dismiss-variant="leading-back"]:not([data-sidebar-collapsed])) .brand {
        margin-inline-start: 4px;
      }
      :host([dismiss-variant="leading-back"]:not([data-sidebar-collapsed])) .actions {
        inset-inline-end: 10px;
      }
      .logo[hidden] {
        display: none;
      }
      .actions {
        position: absolute;
        z-index: 1;
        inset-inline-end: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--lustrous-space-xs);
        height: 36px;
        min-width: 36px;
        transition:
          opacity 150ms ease,
          visibility 0s linear 0s;
      }
      :host([data-sidebar-collapsed]) .actions {
        opacity: 0;
        pointer-events: none;
        visibility: hidden;
        transition:
          opacity 150ms ease,
          visibility 0s linear 150ms;
      }
      .actions[hidden] {
        display: none;
      }
      :host([data-sidebar-density="mobile"]) {
        height: 48px;
        margin-top: var(--lustrous-space-s);
      }
      :host([data-sidebar-density="mobile"]:not([data-sidebar-collapsed])) .brand {
        gap: var(--lustrous-space-m);
        margin-inline-start: 16px;
        padding-inline-start: 6px;
      }
      :host([data-sidebar-density="mobile"]) .label {
        ${lustrousType("headline-small")}
      }
      :host([data-sidebar-density="mobile"]) .actions {
        inset-inline-end: 60px;
        height: 44px;
        min-width: 44px;
      }
      :host([data-sidebar-density="mobile"]:not([data-sidebar-collapsed])) .toggle {
        inset-inline-end: 8px;
      }
      @media ${unsafeCSS(breakpoints.shellMobile)} {
        :host {
          height: 48px;
          margin-top: var(--lustrous-space-s);
        }
        :host(:not([data-sidebar-collapsed])) .brand {
          gap: var(--lustrous-space-m);
          margin-inline-start: 16px;
          padding-inline-start: 6px;
        }
        .label {
          ${lustrousType("headline-small")}
        }
        .actions {
          inset-inline-end: 60px;
          height: 44px;
          min-width: 44px;
        }
        :host(:not([data-sidebar-collapsed])) .toggle {
          inset-inline-end: 8px;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .brand,
        .toggle {
          transition: none;
        }
      }
    `,
  ];

  private readonly shellMobile = new LustrousMediaController(this, "shellMobile");

  @property() label = "";
  @property({ reflect: true, attribute: "logo-href" }) logoHref?: string;
  /** Header toggle placement when expanded: `trailing-close` (default) or `leading-back` (renders leading `arrowBack` button). @default "trailing-close" */
  @property({ reflect: true, attribute: "dismiss-variant" }) dismissVariant: LustrousSidebarDismissVariant = "trailing-close";
  @property({ attribute: "collapse-label" }) collapseLabel = "Close sidebar";
  @property({ attribute: "expand-label" }) expandLabel = "Open sidebar";
  @state() private hasActions = false;
  @state() private hasLogo = false;
  private focusToggleAfterFlip = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this.hasActions = !!this.querySelector(":scope > [slot=actions]");
    this.hasLogo = !!this.querySelector(":scope > [slot=logo]");
  }

  private onToggleClick(): void {
    this.focusToggleAfterFlip = true;
    this.sidebar?.toggle();
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    if (changed.has("sidebarCollapsed") && this.focusToggleAfterFlip) {
      this.focusToggleAfterFlip = false;
      const btn =
        this.renderRoot.querySelector<HTMLElement>(".leading-back") ??
        this.renderRoot.querySelector<HTMLElement>(".toggle lustrous-icon-button");
      btn?.focus();
    }
  }

  protected override render() {
    const toggleText = this.sidebarCollapsed ? this.expandLabel : this.collapseLabel;
    const isMobile = this.shellMobile.matches || this.sidebarDensity === "mobile";
    const mobileClose = isMobile && !this.sidebarCollapsed;
    const leadingBack = this.dismissVariant === "leading-back" && !this.sidebarCollapsed;
    const isLogoLink = !this.sidebarCollapsed && Boolean(this.logoHref);
    const hideEmptyLogo = leadingBack && !this.hasLogo;
    const brandInner = html`<span class="logo" ?hidden=${hideEmptyLogo}
        ><slot
          name="logo"
          @slotchange=${(e: Event) => {
            this.hasLogo = (e.target as HTMLSlotElement).assignedElements().length > 0;
          }}
        ></slot
      ></span>
      <span class="label" aria-hidden=${this.sidebarCollapsed ? "true" : nothing}>${this.label}</span>`;

    return html`${leadingBack
        ? html`<lustrous-icon-button
            part="dismiss-button"
            class="leading-back"
            size="s"
            muted
            icon="arrowBack"
            aria-label=${this.collapseLabel}
            aria-expanded="true"
            @click=${() => this.onToggleClick()}
          ></lustrous-icon-button>`
        : nothing}${isLogoLink
        ? html`<a part="brand" class="brand focus-ring" href=${ifDefined(this.logoHref)}>${brandInner}</a>`
        : html`<span part="brand" class="brand">${brandInner}</span>`}
      <span part="actions" class="actions" ?hidden=${!this.hasActions} ?inert=${this.sidebarCollapsed}
        ><slot
          name="actions"
          @slotchange=${(e: Event) => {
            this.hasActions = (e.target as HTMLSlotElement).assignedElements().length > 0;
          }}
        ></slot
      ></span>
      ${!leadingBack
        ? html`<lustrous-tooltip class="toggle" content=${toggleText} side=${this.sidebarCollapsed ? "right" : "bottom"}>
            <lustrous-icon-button
              size=${mobileClose ? "m" : "s"}
              muted
              icon=${mobileClose ? "close" : "sideNav"}
              aria-label=${toggleText}
              aria-expanded=${this.sidebarCollapsed ? "false" : "true"}
              @click=${() => this.onToggleClick()}
            ></lustrous-icon-button>
          </lustrous-tooltip>`
        : nothing}`;
  }
}

/**
 * `<lustrous-sidebar-nav>` — Semantic `<nav>` landmark container for sidebar items and sections.
 *
 * @slot - Navigation items, sections, and scroll areas.
 */
@customElement("lustrous-sidebar-nav")
export class LustrousSidebarNav extends LustrousSidebarPart {
  static override styles = [
    lustrousBase,
    css`
      :host {
        display: flex;
        flex: 1 1 auto;
        min-height: 0;
      }
      nav {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-width: 0;
        min-height: 0;
        padding-top: var(--lustrous-space-xs);
        padding-bottom: var(--lustrous-space-s);
      }
    `,
  ];

  @property() label = "Navigation";

  protected override render() {
    return html`<nav aria-label=${this.label}><slot></slot></nav>`;
  }
}

/**
 * `<lustrous-sidebar-scroll-area>` — Scrollable region inside `<lustrous-sidebar-nav>`.
 * Disables scrolling while collapsed and smoothly resets scroll offset to the top on collapse.
 *
 * @slot - Scrollable navigation sections and items.
 */
@customElement("lustrous-sidebar-scroll-area")
export class LustrousSidebarScrollArea extends LustrousSidebarPart {
  static override styles = [
    lustrousBase,
    css`
      :host {
        display: flex;
        flex: 1 1 auto;
        min-height: 0;
      }
      lustrous-scrollable-box {
        flex: 1 1 auto;
        min-width: 0;
        min-height: 0;
        width: 100%;
      }
      .content {
        display: flex;
        flex-direction: column;
      }
    `,
  ];

  @query("lustrous-scrollable-box") private box?: LustrousScrollableBox;

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    if (changed.has("sidebarCollapsed") && this.sidebarCollapsed) {
      this.box?.scrollElement?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  protected override render() {
    return html`<lustrous-scrollable-box overflow-y=${this.sidebarCollapsed ? "hidden" : "auto"} scrim-size="16"
      ><div class="content"><slot></slot></div
    ></lustrous-scrollable-box>`;
  }
}

/**
 * `<lustrous-sidebar-section>` — Titled or collapsible group of secondary navigation items.
 * Fades out and becomes `inert` when `<lustrous-sidebar>` collapses.
 *
 * @slot - Section items.
 * @slot action - Optional trailing control in the section header.
 * @fires lustrous-toggle - `CustomEvent<{ open: boolean }>` (cancelable) when a `collapsible` heading is toggled.
 * @csspart toggle - The disclosure button when `collapsible` is set.
 * @csspart body - The section body container.
 */
@customElement("lustrous-sidebar-section")
export class LustrousSidebarSection extends LustrousSidebarPart {
  static override styles = [
    lustrousBase,
    lustrousFocusRing,
    lustrousChevronStyles,
    css`
      :host {
        display: block;
        flex-shrink: 0;
        margin-top: var(--lustrous-space-m);
        transition:
          opacity 150ms ease,
          visibility 0s linear 0s;
      }
      :host([data-sidebar-collapsed]) {
        opacity: 0;
        pointer-events: none;
        visibility: hidden;
        transition:
          opacity 150ms ease,
          visibility 0s linear 150ms;
      }
      section {
        display: flex;
        flex-direction: column;
      }
      header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 28px;
        padding-inline: var(--lustrous-space-l) var(--lustrous-space-m);
        color: var(--lustrous-color-on-surface-variant);
        white-space: nowrap;
        ${lustrousType("body-small-emphasized")}
      }
      header[hidden] {
        display: none;
      }
      header.collapsible {
        height: 32px;
        padding-inline: 0;
      }
      .toggle {
        all: unset;
        box-sizing: border-box;
        display: flex;
        flex: 1 1 auto;
        align-items: center;
        gap: var(--lustrous-space-xs);
        min-width: 0;
        height: 100%;
        padding-inline-start: var(--lustrous-space-l);
        color: var(--lustrous-color-on-surface-variant);
        cursor: pointer;
        user-select: none;
      }
      .toggle.focus-ring:focus-visible {
        outline-offset: -3px;
      }
      .title {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .chevron {
        display: inline-flex;
        flex-shrink: 0;
        transition: opacity 200ms ease;
      }
      @media ${unsafeCSS(breakpoints.shellDesktop)} {
        .chevron {
          opacity: 0;
        }
        header.collapsible:hover .chevron,
        .toggle:focus-visible .chevron {
          opacity: 1;
        }
      }
      :host([expanded="false"]) .chevron {
        opacity: 1;
      }
      .action {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        margin-inline-end: var(--lustrous-space-m);
      }
      .action[hidden] {
        display: none;
      }
      .body {
        display: flex;
        flex-direction: column;
      }
      :host([collapsible]) .body {
        display: grid;
        grid-template-rows: 1fr;
        transition: grid-template-rows 200ms cubic-bezier(0.2, 0, 0, 1);
      }
      :host([collapsible][expanded="false"]) .body {
        grid-template-rows: 0fr;
      }
      .inner {
        display: flex;
        flex-direction: column;
        min-height: 0;
      }
      .body.clip .inner {
        overflow: hidden;
      }
      @media ${unsafeCSS(breakpoints.shellMobile)} {
        :host {
          margin-top: var(--lustrous-space-l);
        }
        header {
          ${lustrousType("body-large")}
        }
        header.collapsible {
          height: 44px;
        }
        .toggle {
          padding-inline-start: var(--lustrous-space-2xl);
        }
        .chevron svg {
          width: 24px;
          height: 24px;
        }
        .action {
          margin-inline-end: var(--lustrous-space-s);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .chevron,
        :host([collapsible]) .body {
          transition: none;
        }
      }
    `,
  ];

  @property() heading = "";
  @property({ type: Boolean, reflect: true }) collapsible = false;

  @property({
    reflect: true,
    converter: {
      fromAttribute: (v: string | null) => v !== "false",
      toAttribute: (v: boolean) => (v ? null : "false"),
    },
  })
  expanded = true;

  @property({ attribute: "toggle-label" }) toggleLabel = "";
  @state() private hasAction = false;
  @state() private clip = false;
  private clipTimer?: ReturnType<typeof setTimeout>;

  override connectedCallback(): void {
    super.connectedCallback();
    this.hasAction = !!this.querySelector(":scope > [slot=action]");
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this.clipTimer);
  }

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (changed.has("expanded") || changed.has("collapsible")) {
      clearTimeout(this.clipTimer);
      if (!this.collapsible) this.clip = false;
      else if (!this.expanded) this.clip = true;
      else if (changed.get("expanded") === false && typeof window !== "undefined") {
        this.clip = true;
        this.clipTimer = setTimeout(() => {
          this.clip = false;
        }, 220);
      } else {
        this.clip = false;
      }
    }
  }

  toggle(): void {
    const next = !this.expanded;
    const ev = new CustomEvent("lustrous-toggle", {
      detail: { open: next },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    if (this.dispatchEvent(ev)) this.expanded = next;
  }

  private renderAction() {
    return html`<slot
      name="action"
      @slotchange=${(e: Event) => {
        this.hasAction = (e.target as HTMLSlotElement).assignedElements().length > 0;
      }}
    ></slot>`;
  }

  protected override render() {
    const folded = this.collapsible && !this.expanded;
    const header = this.collapsible
      ? html`<header class="collapsible">
          <button
            part="toggle"
            class="toggle focus-ring"
            type="button"
            aria-expanded=${this.expanded ? "true" : "false"}
            aria-controls="body"
            aria-label=${this.toggleLabel || (this.heading ? `Toggle ${this.heading}` : nothing)}
            @click=${() => this.toggle()}
          >
            <span id="h" class="title">${this.heading}</span>
            <span class="chevron" aria-hidden="true">${renderChevron(this.expanded, "s", "end")}</span>
          </button>
          <span class="action" ?hidden=${!this.hasAction}>${this.renderAction()}</span>
        </header>`
      : html`<header ?hidden=${!this.heading && !this.hasAction}>
          <span id="h">${this.heading}</span>
          ${this.renderAction()}
        </header>`;

    return html`<section aria-labelledby=${this.heading ? "h" : nothing} ?inert=${this.sidebarCollapsed}>
      ${header}
      <div part="body" id="body" class="body ${this.clip ? "clip" : ""}" ?inert=${folded}>
        <div class="inner"><slot></slot></div>
      </div>
    </section>`;
  }
}

/**
 * `<lustrous-sidebar-message>` — Inline empty/status message aligned with sidebar rows.
 * Preserves expanded width so copy does not reflow during collapse transitions, and
 * optionally announces `announcement` via a polite `role="status"` region.
 *
 * @slot - Supplementary action or link below `description`.
 * @slot heading - Custom rich heading content.
 * @csspart icon - The leading icon container.
 * @csspart text - The heading/description stack.
 */
@customElement("lustrous-sidebar-message")
export class LustrousSidebarMessage extends LustrousSidebarPart {
  static override styles = [
    lustrousBase,
    lustrousSrOnly,
    css`
      :host {
        display: flex;
        flex-shrink: 0;
        align-items: flex-start;
        gap: var(--lustrous-space-m);
        box-sizing: border-box;
        width: calc(var(--_lustrous-sidebar-width, 272px) - 20px);
        margin-inline: 10px;
        padding: var(--lustrous-space-s);
        white-space: normal;
        transition:
          opacity 150ms ease,
          visibility 0s linear 0s;
        ${lustrousType("body-small")}
      }
      :host([data-sidebar-collapsed]) {
        opacity: 0;
        pointer-events: none;
        visibility: hidden;
        transition:
          opacity 150ms ease,
          visibility 0s linear 150ms;
      }
      .icon {
        display: inline-flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 18px;
      }
      .icon[hidden],
      .heading[hidden],
      .description[hidden] {
        display: none;
      }
      .text {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        min-width: 0;
      }
      .description {
        color: var(--lustrous-text-muted);
      }
      @media (prefers-reduced-motion: reduce) {
        :host {
          transition: none;
        }
      }
    `,
  ];

  @property({ reflect: true }) icon?: LustrousIconName;
  @property() heading = "";
  @property() description = "";
  @property() announcement?: string;

  @state() private liveText = "";
  @state() private hasHeadingSlot = false;
  private liveTimer?: ReturnType<typeof setTimeout>;

  override connectedCallback(): void {
    super.connectedCallback();
    this.hasHeadingSlot = !!this.querySelector(":scope > [slot=heading]");
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this.liveTimer);
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    if (changed.has("announcement")) {
      clearTimeout(this.liveTimer);
      if (this.announcement === undefined) {
        this.liveText = "";
      } else {
        this.liveTimer = setTimeout(() => {
          this.liveText = this.announcement ?? "";
        }, 100);
      }
    }
  }

  protected override render() {
    return html`${this.announcement !== undefined
        ? html`<span class="sr-only" role="status">${this.liveText}</span>`
        : nothing}
      <span part="icon" class="icon" ?hidden=${!this.icon} aria-hidden="true"
        >${this.icon ? renderIcon(this.icon, "s") : nothing}</span
      >
      <div part="text" class="text" ?inert=${this.sidebarCollapsed}>
        <div class="heading" ?hidden=${!this.heading && !this.hasHeadingSlot}>
          <slot
            name="heading"
            @slotchange=${(e: Event) => {
              this.hasHeadingSlot = (e.target as HTMLSlotElement).assignedNodes().length > 0;
            }}
            >${this.heading}</slot
          >
        </div>
        <div class="description" ?hidden=${!this.description}>${this.description}</div>
        <slot></slot>
      </div>`;
  }
}

/**
 * `<lustrous-sidebar-footer>` — Bottom-docked stack for settings, help, and account items.
 *
 * @slot - Footer items.
 */
@customElement("lustrous-sidebar-footer")
export class LustrousSidebarFooter extends LustrousSidebarPart {
  static override styles = [
    lustrousBase,
    css`
      :host {
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        gap: var(--lustrous-space-xs);
        width: 100%;
        padding-block: var(--lustrous-space-s);
      }
      @media ${unsafeCSS(breakpoints.shellMobile)} {
        :host {
          padding-inline: 12px 10px;
          padding-bottom: 14px;
        }
      }
    `,
  ];

  protected override render() {
    return html`<slot></slot>`;
  }
}

const TRAILING_SLOT = 28;
const TRAILING_SLOT_MOBILE = 36;
const BADGE_DOT = 20;
const BADGE_ICON = 16;
const GAP = 4;
const NESTED_HOVER_CLOSE_DELAY = 150;

export type LustrousSidebarBadge = "unread" | "needs-input" | "in-progress";

/**
 * `<lustrous-sidebar-item>` — Navigation row inside `<lustrous-sidebar>`.
 *
 * - Collapses smoothly into a `36×36` icon pill centered in the `56px` rail with a right-aligned
 *   `<lustrous-tooltip>` label; when expanded, shows a tooltip only when `.label` is truncated
 *   (syncing `.truncationTarget` in `updated()`).
 * - Supports status `badge` (`"unread" | "needs-input" | "in-progress"`), `pinned`, `meta`,
 *   `pending` shimmer state, sibling overflow `.actions` (`<lustrous-menu>`), and nested flyout
 *   `.items` (`<lustrous-menu>`), plus automatic mobile touch sizing below `960px`.
 *
 * @csspart row - The interactive `<button>` or `<a>` element.
 * @csspart glimmer - The loading shimmer bar rendered when `pending` is true.
 */
@customElement("lustrous-sidebar-item")
export class LustrousSidebarItem extends LustrousSidebarPart {
  static override shadowRootOptions: ShadowRootInit = {
    ...LustrousElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = [
    lustrousBase,
    lustrousFocusRing,
    lustrousStateLayer,
    css`
      :host {
        display: block;
        flex-shrink: 0;
      }
      lustrous-tooltip {
        display: block;
        width: 100%;
        min-width: 0;
      }
      .shell {
        position: relative;
        min-width: 0;
        display: flex;
        align-items: center;
        margin-inline: 10px;
      }
      .shell:hover .row:not(:disabled):not([aria-disabled="true"])::after {
        opacity: 1;
      }
      lustrous-menu.nest {
        display: block;
        width: 100%;
      }
      .row {
        all: unset;
        box-sizing: border-box;
        position: relative;
        isolation: isolate;
        display: flex;
        align-items: center;
        gap: var(--lustrous-space-m);
        width: 100%;
        height: 36px;
        padding-inline: 8px;
        border-radius: var(--lustrous-radius-full);
        color: var(--lustrous-color-on-surface);
        text-decoration: none;
        cursor: pointer;
        transition:
          padding-inline ${EASE},
          background-color 150ms ease;
      }
      :host([data-sidebar-density="compact-panel"]) .row {
        height: 40px;
        padding-inline: 12px;
        border-radius: var(--lustrous-radius-s);
      }
      :host([data-sidebar-density="compact-panel"]) .label {
        ${lustrousType("body-large")}
      }
      :host([data-sidebar-density="compact-panel"]) .row.active .label {
        ${lustrousType("body-large-emphasized")}
      }
      :host([data-sidebar-density="mobile"]) .row {
        height: 44px;
        gap: var(--lustrous-space-m);
      }
      :host([data-sidebar-density="mobile"]:not([data-sidebar-collapsed])) .row {
        padding-inline-start: 16px;
      }
      :host([data-sidebar-density="mobile"]) .label {
        ${lustrousType("body-large")}
      }
      :host([data-sidebar-density="mobile"]) .row.active .label {
        ${lustrousType("body-large-emphasized")}
      }
      .row.focus-ring:focus-visible {
        outline-offset: -3px;
      }
      .row.reserve {
        padding-inline-end: var(--_lustrous-reserve);
      }
      :host([data-sidebar-collapsed]) .row {
        padding-inline: 8px;
      }
      .row.active,
      .row.nest-open {
        background-color: var(--lustrous-color-surface-dim);
      }
      :host([disabled]) .row {
        opacity: 0.5;
        cursor: not-allowed;
      }
      :host([disabled]) .row::after {
        opacity: 0;
      }
      .icon {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 20px;
        height: 20px;
      }
      .collapsed-unread {
        position: absolute;
        top: -4px;
        inset-inline-end: -4px;
      }
      .pill-badge {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
        transition: opacity 150ms ease;
      }
      .pill-badge[hidden] {
        display: none;
      }
      .edit-input {
        box-sizing: border-box;
        width: 100%;
        height: 36px;
        padding-inline: 12px;
        border: 1.5px solid var(--lustrous-color-primary);
        border-radius: var(--lustrous-radius-full);
        background-color: var(--lustrous-color-surface);
        color: var(--lustrous-color-on-surface);
        font: inherit;
        outline: none;
        ${lustrousType("body-small")}
      }
      :host([data-sidebar-density="compact-panel"]) .edit-input {
        height: 40px;
        border-radius: var(--lustrous-radius-s);
        ${lustrousType("body-large")}
      }
      .label,
      .meta {
        overflow: hidden;
        white-space: nowrap;
        transition: opacity 150ms ease;
      }
      .label {
        flex: 1 1 auto;
        min-width: 0;
        text-overflow: ellipsis;
        ${lustrousType("body-small")}
      }
      .row.active .label {
        ${lustrousType("body-small-emphasized")}
      }
      .meta {
        flex-shrink: 0;
        color: var(--lustrous-color-on-surface-variant);
        ${lustrousType("body-small")}
      }
      .glimmer {
        display: block;
        width: 72%;
        height: 12px;
        border-radius: var(--lustrous-radius-xs);
        background: linear-gradient(
          90deg,
          var(--lustrous-color-surface-container) 0%,
          var(--lustrous-color-surface-container-high) 50%,
          var(--lustrous-color-surface-container) 100%
        );
        background-size: 200% 100%;
        animation: lustrous-sidebar-shimmer 1.4s ease-in-out infinite;
      }
      @keyframes lustrous-sidebar-shimmer {
        from {
          background-position: 200% 0;
        }
        to {
          background-position: -200% 0;
        }
      }
      :host([data-sidebar-collapsed]) .label,
      :host([data-sidebar-collapsed]) .pill-badge,
      :host([data-sidebar-collapsed]) .meta,
      :host([data-sidebar-collapsed]) .trailing {
        opacity: 0;
        pointer-events: none;
      }
      :host([data-sidebar-collapsed]) .trailing {
        visibility: hidden;
        transition:
          opacity 150ms ease,
          visibility 0s linear 150ms;
      }
      .trailing {
        position: absolute;
        top: 0;
        bottom: 0;
        inset-inline-end: ${GAP}px;
        display: flex;
        align-items: center;
        gap: var(--lustrous-space-xs);
        transition:
          opacity 150ms ease,
          visibility 0s linear 0s;
      }
      .slot {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: ${TRAILING_SLOT}px;
        height: 100%;
      }
      .badge {
        transition: opacity 150ms ease;
      }
      lustrous-badge-indicator.labelled {
        pointer-events: auto;
      }
      .status {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .status.needs-input {
        color: var(--lustrous-color-error);
      }
      .status.in-progress {
        color: var(--lustrous-color-on-surface);
      }
      .slot .badge,
      .slot .pin {
        position: absolute;
      }
      .pin {
        display: inline-flex;
        transition: opacity 150ms ease;
      }
      .overflow {
        opacity: 0;
        transition: opacity 150ms ease;
      }
      .shell.has-actions:hover .overflow,
      .shell.has-actions:focus-within .overflow,
      .shell.actions-open .overflow {
        opacity: 1;
      }
      .shell.has-actions:hover .swap,
      .shell.has-actions:focus-within .swap,
      .shell.actions-open .swap {
        opacity: 0;
      }
      @media ${unsafeCSS(breakpoints.shellMobile)} {
        .row {
          height: 44px;
          gap: var(--lustrous-space-m);
        }
        :host(:not([data-sidebar-collapsed])) .row {
          padding-inline-start: 16px;
        }
        :host(:not([data-sidebar-collapsed])) .row:not(.reserve) {
          padding-inline-end: 16px;
        }
        .icon,
        .icon svg {
          width: 24px;
          height: 24px;
        }
        .label {
          ${lustrousType("body-large")}
        }
        .row.active .label {
          ${lustrousType("body-large-emphasized")}
        }
        .trailing {
          inset-inline-end: 0;
        }
        .slot {
          width: ${TRAILING_SLOT_MOBILE}px;
        }
        .overflow,
        .overflow::part(button) {
          width: ${TRAILING_SLOT_MOBILE}px;
          height: ${TRAILING_SLOT_MOBILE}px;
        }
        .shell.has-actions .overflow {
          opacity: 1;
        }
        .shell.has-actions .swap {
          opacity: 0;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .row,
        .glimmer {
          transition: none;
          animation: none;
        }
      }
      @media (forced-colors: active) {
        .row.active {
          border: 1px solid Highlight;
        }
        .status.needs-input {
          color: Highlight;
        }
        .status.in-progress {
          color: CanvasText;
        }
      }
    `,
  ];

  @property() label = "";
  @property({ reflect: true }) icon?: LustrousIconName;
  @property({ type: Boolean, reflect: true }) active = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) pending = false;
  @property({ type: Boolean, reflect: true }) pinned = false;
  @property({ attribute: "pinned-label" }) pinnedLabel = "Pinned";

  @property({
    reflect: true,
    converter: {
      fromAttribute: (v: string | null) =>
        v === null || v === "false" ? false : v === "" || v === "true" ? "unread" : (v as LustrousSidebarBadge),
      toAttribute: (v: unknown) => (!v ? null : v === true || v === "unread" ? "" : String(v)),
    },
  })
  badge: boolean | LustrousSidebarBadge = false;

  @property({ attribute: "badge-label" }) badgeLabel = "";
  /** Inline pill badge label rendered after the truncated label while expanded and not `pending`. */
  @property({ attribute: "pill-badge" }) pillBadge = "";
  /** Enables inline row renaming (`<input part="edit-input">`), firing cancelable `lustrous-edit-commit` / `lustrous-edit-cancel`. */
  @property({ type: Boolean, reflect: true }) editing = false;
  /** Initial draft text when entering `editing` mode (defaults to `label`). */
  @property({ attribute: "default-edit-value" }) defaultEditValue?: string;
  /** Maximum character length for inline rename input. @default 128 */
  @property({ type: Number, attribute: "max-edit-length" }) maxEditLength = 128;
  /** Accessible label for the inline rename `<input>`. @default "Rename item" */
  @property({ attribute: "edit-input-label" }) editInputLabel = "Rename item";
  @property({ type: Boolean, attribute: "items-open-on-hover" }) itemsOpenOnHover = false;
  @property() meta = "";
  @property({ reflect: true }) href?: string;
  @property({ reflect: true }) target?: string;
  @property({ attribute: false }) items?: LustrousMenuItem[];
  @property({ attribute: false }) actions?: LustrousMenuItem[];
  @property({ attribute: "actions-label" }) actionsLabel = "More options for {label}";

  @state() private nestOpen = false;
  @state() private actionsOpen = false;
  @state() private hasBadgeSlot = false;
  @state() private editDraft = "";
  private editInitial = "";
  private editComposing = false;
  private editCommittedOrCanceled = false;
  private restoreFocusToRow = false;
  private readonly shellMobile = new LustrousMediaController(this, "shellMobile");
  @query("lustrous-tooltip.row-tip") private rowTip?: LustrousTooltip;
  @query(".label") private labelEl?: HTMLElement;
  @query("[part=row]") private rowEl?: HTMLElement;
  @query("[part=edit-input]") private editInputEl?: HTMLInputElement;
  @query("lustrous-menu.nest") private nestMenu?: LustrousMenu;
  @query("lustrous-menu.actions") private actionsMenu?: LustrousMenu;

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.children) {
      this.hasBadgeSlot = [...this.children].some((c) => c.getAttribute("slot") === "badge");
    }
  }

  private onEditKeydown(e: KeyboardEvent): void {
    if (this.editComposing || e.isComposing) return;
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      this.finishEdit(true, true);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      this.finishEdit(false, true);
    }
  }

  private onEditBlur(): void {
    if (this.editCommittedOrCanceled || !this.editing) return;
    if (typeof document !== "undefined" && !document.hasFocus()) return;
    this.finishEdit(true, false);
  }

  private finishEdit(commit: boolean, keyboardExit: boolean): void {
    if (this.editCommittedOrCanceled || !this.editing) return;
    const trimmed = this.editDraft.trim();
    const shouldCommit = commit && trimmed.length > 0 && trimmed !== this.editInitial.trim();
    this.editCommittedOrCanceled = true;
    if (shouldCommit) {
      const ev = new CustomEvent("lustrous-edit-commit", {
        detail: { value: trimmed },
        bubbles: true,
        composed: true,
        cancelable: true,
      });
      if (this.dispatchEvent(ev)) {
        this.restoreFocusToRow = keyboardExit;
        this.editing = false;
      } else {
        this.editCommittedOrCanceled = false;
      }
    } else {
      const ev = new CustomEvent("lustrous-edit-cancel", {
        bubbles: true,
        composed: true,
        cancelable: true,
      });
      if (this.dispatchEvent(ev)) {
        this.restoreFocusToRow = keyboardExit;
        this.editing = false;
      } else {
        this.editCommittedOrCanceled = false;
      }
    }
  }

  private onNestToggle(e: CustomEvent<{ open: boolean }>): void {
    if (e.target !== e.currentTarget) return;
    e.stopPropagation();
    this.nestOpen = e.detail.open;
    if (e.detail.open && this.actionsMenu?.open) this.actionsMenu.open = false;
  }

  private onActionsToggle(e: CustomEvent<{ open: boolean }>): void {
    if (e.target !== e.currentTarget) return;
    e.stopPropagation();
    this.actionsOpen = e.detail.open;
    if (e.detail.open && this.nestMenu?.open) this.nestMenu.open = false;
  }

  private onRowClick(e: MouseEvent): void {
    if (this.disabled) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }

  private get badgeKind(): LustrousSidebarBadge | undefined {
    return this.badge === true ? "unread" : this.badge || undefined;
  }

  private get leftBadge(): boolean {
    const hasActions = !!this.actions?.length && !this.pending;
    return !!this.badgeKind && (this.pinned || (this.shellMobile.matches && hasActions));
  }

  private trailingReserve(): number {
    const hasActions = !!this.actions?.length && !this.pending;
    const badge = this.badgeKind;
    if (!(badge || this.pinned || hasActions)) return 0;
    const mobile = this.shellMobile.matches;
    const leftBadge = this.leftBadge ? (badge === "unread" ? BADGE_DOT : BADGE_ICON) + GAP : 0;
    return (mobile ? 0 : GAP) + leftBadge + (mobile ? TRAILING_SLOT_MOBILE : TRAILING_SLOT) + GAP;
  }

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (changed.has("editing") && this.editing) {
      this.editInitial = this.defaultEditValue ?? this.label;
      this.editDraft = this.editInitial;
      this.editComposing = false;
      this.editCommittedOrCanceled = false;
    }
    const r = this.trailingReserve();
    setHostVar(this, "--_lustrous-reserve", r ? `${r}px` : undefined);
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    if (this.rowTip) {
      this.rowTip.truncationTarget = this.sidebarCollapsed ? null : (this.labelEl ?? null);
    }
    if (changed.has("editing") && this.editing && this.editInputEl) {
      this.editInputEl.focus();
      this.editInputEl.select();
    } else if (changed.has("editing") && !this.editing && this.restoreFocusToRow) {
      this.restoreFocusToRow = false;
      const tip = this.rowTip;
      if (tip) {
        void tip.updateComplete.then(() => this.rowEl?.focus());
      } else {
        this.rowEl?.focus();
      }
    }
  }

  private renderBadge(badge: LustrousSidebarBadge, cls: string): TemplateResult {
    const label = this.badgeLabel;
    const outer = label ? "" : `badge ${cls}`;
    const indicator =
      badge === "unread"
        ? html`<lustrous-badge-indicator class="${outer} ${label ? "labelled" : ""}"></lustrous-badge-indicator>`
        : html`<span class="status ${badge} ${outer}" aria-hidden="true"
            >${badge === "needs-input"
              ? renderIcon("flag", "xs")
              : html`<lustrous-spinner size="xs" speed="slow" tone="default"></lustrous-spinner>`}</span
          >`;
    return label
      ? html`<lustrous-tooltip class="badge ${cls}" content=${label}>${indicator}</lustrous-tooltip>`
      : indicator;
  }

  protected override render() {
    const hasActions = !!this.actions?.length && !this.pending;
    const hasNest = !!this.items?.length;
    const badge = this.badgeKind;
    const leftBadge = badge && this.leftBadge;
    const rightBadge = badge && !this.leftBadge;
    const mobile = this.shellMobile.matches;
    const hasTrailing = !!badge || this.pinned || hasActions;
    const reserve = this.trailingReserve();

    const descriptionParts = [
      this.pinned ? this.pinnedLabel : undefined,
      badge && this.badgeLabel ? this.badgeLabel : undefined,
    ].filter((p): p is string => Boolean(p));
    const descriptionText = descriptionParts.join(", ");
    const describedBy = descriptionText ? "badge-desc" : nothing;

    const tipDisabled =
      !this.sidebarCollapsed &&
      (mobile || this.pending || this.nestOpen || this.actionsOpen || (this.itemsOpenOnHover && hasNest));

    const labelDir = resolveDirection(estimateProseDirection(this.label));
    const renderedLabel = this.label
      ? html`<bdi dir=${labelDir}>${renderIsolatedTechnicalTokens(this.label, labelDir)}</bdi>`
      : this.label;

    const showPillBadge = !this.sidebarCollapsed && !this.pending && (Boolean(this.pillBadge) || this.hasBadgeSlot);
    const collapsedUnread = this.sidebarCollapsed && badge === "unread";

    const content = html`
      ${this.icon
        ? html`<span class="icon"
            >${renderIcon(this.icon, "s")}${collapsedUnread
              ? html`<lustrous-badge-indicator class="collapsed-unread"></lustrous-badge-indicator>`
              : nothing}</span
          >`
        : nothing}
      <span class="label"
        >${this.pending ? html`<span part="glimmer" class="glimmer" aria-hidden="true"></span>` : renderedLabel}</span
      >
      <span class="pill-badge" ?hidden=${!showPillBadge}
        ><slot
          name="badge"
          @slotchange=${(e: Event) => {
            this.hasBadgeSlot = (e.target as HTMLSlotElement).assignedNodes().length > 0;
          }}
          >${this.pillBadge ? html`<lustrous-badge>${this.pillBadge}</lustrous-badge>` : nothing}</slot
        ></span
      >
      ${this.meta ? html`<span class="meta" aria-hidden="true">${this.meta}</span>` : nothing}
    `;

    const cls = `row state-layer focus-ring ${this.active ? "active" : ""} ${this.nestOpen ? "nest-open" : ""} ${reserve ? "reserve" : ""}`;
    const current = this.active ? "page" : nothing;
    const slot = hasNest ? "trigger" : nothing;

    if (this.editing && !this.sidebarCollapsed) {
      return html`<div class="shell">
        <input
          part="edit-input"
          class="edit-input focus-ring"
          type="text"
          maxlength=${this.maxEditLength}
          aria-label=${this.editInputLabel}
          .value=${this.editDraft}
          @input=${(e: Event) => {
            this.editDraft = (e.target as HTMLInputElement).value;
          }}
          @compositionstart=${() => {
            this.editComposing = true;
          }}
          @compositionend=${() => {
            this.editComposing = false;
          }}
          @keydown=${this.onEditKeydown}
          @blur=${this.onEditBlur}
        />
      </div>`;
    }

    const primary =
      this.href !== undefined && !hasNest
        ? html`<a
            part="row"
            class=${cls}
            href=${ifDefined(this.disabled ? undefined : this.href)}
            target=${ifDefined(this.target)}
            aria-current=${current}
            aria-describedby=${describedBy}
            aria-disabled=${this.disabled ? "true" : nothing}
            aria-label=${this.pending ? this.label : nothing}
            role=${this.disabled ? "link" : nothing}
            @click=${this.onRowClick}
            >${content}</a
          >`
        : html`<button
            part="row"
            slot=${slot}
            class=${cls}
            type="button"
            aria-current=${current}
            aria-describedby=${describedBy}
            ?disabled=${this.disabled}
            aria-label=${this.pending ? this.label : nothing}
            @click=${this.onRowClick}
          >
            ${content}
          </button>`;

    const wrappedPrimary = html`<lustrous-tooltip
      class="row-tip"
      content=${this.label}
      side="right"
      delay="0"
      ?disabled=${tipDisabled}
      ?only-when-truncated=${!this.sidebarCollapsed}
      .truncationTarget=${this.sidebarCollapsed ? null : (this.labelEl ?? null)}
      >${primary}</lustrous-tooltip
    >`;

    return html`<div class="shell ${hasActions ? "has-actions" : ""} ${this.actionsOpen ? "actions-open" : ""}">
      ${hasNest
        ? html`<lustrous-tooltip
            class="row-tip"
            content=${this.label}
            side="right"
            delay="0"
            ?disabled=${tipDisabled}
            ?only-when-truncated=${!this.sidebarCollapsed}
            .truncationTarget=${this.sidebarCollapsed ? null : (this.labelEl ?? null)}
            ><lustrous-menu
              class="nest"
              side="inline-end"
              align="start"
              label=${this.label}
              .items=${this.items ?? []}
              ?open-on-hover=${this.itemsOpenOnHover && !this.sidebarCollapsed}
              hover-open-delay="0"
              hover-close-delay=${NESTED_HOVER_CLOSE_DELAY}
              @lustrous-toggle=${this.onNestToggle}
              >${primary}</lustrous-menu
            ></lustrous-tooltip
          >`
        : wrappedPrimary}
      ${hasTrailing
        ? html`<span class="trailing" ?inert=${this.sidebarCollapsed}>
            ${leftBadge ? this.renderBadge(badge, "") : nothing}
            <span class="slot">
              ${rightBadge ? this.renderBadge(badge, "swap") : nothing}
              ${this.pinned ? html`<span class="pin swap" aria-hidden="true">${renderIcon("pin", "xs")}</span>` : nothing}
              ${hasActions
                ? html`<lustrous-menu
                    class="actions"
                    side="bottom"
                    align="start"
                    .items=${this.actions ?? []}
                    @lustrous-toggle=${this.onActionsToggle}
                  >
                    <lustrous-icon-button
                      slot="trigger"
                      class="overflow"
                      size=${mobile ? "s" : "xs"}
                      icon=${mobile && this.pinned && !this.actionsOpen ? "pin" : "moreVert"}
                      aria-label=${this.actionsLabel.replace("{label}", this.label)}
                    ></lustrous-icon-button>
                  </lustrous-menu>`
                : nothing}
            </span>
          </span>`
        : nothing}
      ${describedBy !== nothing ? html`<span id="badge-desc" hidden>${descriptionText}</span>` : nothing}
    </div>`;
  }
}

/**
 * `<lustrous-sidebar-drawer>` — Modal slide-in navigation drawer for compact app shells (`< 960px`).
 *
 * Extends `<lustrous-modal>` with `static override managesShortcutScope = false` so application
 * navigation shortcuts remain available, and intercepts `<lustrous-sidebar>` collapse requests
 * inside the drawer to dismiss the drawer (`reason: "dismiss"`).
 *
 * @slot - Drawer content, typically a `<lustrous-sidebar>`.
 * @slot trigger - Optional trigger element that opens the drawer on click.
 * @fires lustrous-close-request - `CustomEvent<{ reason: "escape" | "scrim" | "dismiss" }>` (cancelable).
 * @fires lustrous-toggle - `CustomEvent<{ open: boolean }>` after opening or closing.
 * @csspart dialog - The native `<dialog>`.
 * @csspart viewport - The full-height drawer viewport.
 * @csspart panel - The sliding drawer surface.
 */
@customElement("lustrous-sidebar-drawer")
export class LustrousSidebarDrawer extends LustrousModal {
  protected static override managesShortcutScope = false;

  static override styles = [
    ...[LustrousModal.styles].flat(),
    css`
      .viewport {
        align-items: stretch;
        justify-content: flex-start;
        padding: 0;
      }
      dialog[open] .viewport {
        animation: none;
      }
      dialog[open]::backdrop {
        animation-duration: 400ms;
        animation-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1);
      }
      .panel {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        width: min(320px, 85vw);
        height: 100%;
        overflow: hidden;
        background-color: var(--lustrous-color-surface-bright);
        color: var(--lustrous-color-on-surface);
        pointer-events: auto;
      }
      dialog[open] .panel {
        animation: lustrous-drawer-in 400ms cubic-bezier(0.25, 0.8, 0.25, 1);
      }
      :host(:dir(rtl)) dialog[open] .panel {
        animation-name: lustrous-drawer-in-rtl;
      }
      @keyframes lustrous-drawer-in {
        from {
          transform: translateX(-100%);
        }
      }
      @keyframes lustrous-drawer-in-rtl {
        from {
          transform: translateX(100%);
        }
      }
      ::slotted(lustrous-sidebar) {
        --_lustrous-sidebar-width: 100%;
        --_lustrous-sidebar-collapsed-width: 100%;
        flex: 1 1 auto;
        min-height: 0;
      }
      @media (prefers-reduced-motion: reduce) {
        dialog[open] .panel {
          animation: none;
        }
      }
      @media (forced-colors: active) {
        .panel {
          border-inline-end: 1px solid CanvasText;
        }
      }
    `,
  ];

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener("lustrous-change", this.onSidebarChange);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("lustrous-change", this.onSidebarChange);
  }

  private onSidebarChange = (e: Event): void => {
    const detail = (e as CustomEvent<{ collapsed?: boolean }>).detail;
    if ((e.target as Element | null)?.localName !== "lustrous-sidebar" || !detail?.collapsed || !this.open) return;
    e.preventDefault();
    this.requestClose("dismiss");
  };

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
        <div part="viewport" class="viewport">
          <div part="panel" class="panel"><slot></slot></div>
        </div>
      </dialog>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-sidebar": LustrousSidebar;
    "lustrous-sidebar-header": LustrousSidebarHeader;
    "lustrous-sidebar-nav": LustrousSidebarNav;
    "lustrous-sidebar-scroll-area": LustrousSidebarScrollArea;
    "lustrous-sidebar-section": LustrousSidebarSection;
    "lustrous-sidebar-message": LustrousSidebarMessage;
    "lustrous-sidebar-footer": LustrousSidebarFooter;
    "lustrous-sidebar-item": LustrousSidebarItem;
    "lustrous-sidebar-drawer": LustrousSidebarDrawer;
  }
}
