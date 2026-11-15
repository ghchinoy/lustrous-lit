import { css, html, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { gapRules, toCss } from "../../internal/style-gen.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { lustrousBase } from "../../theme/theme.js";
import type { LustrousSpacingToken } from "../../theme/tokens.js";
import { LustrousBox, lustrousBoxStyles } from "../lustrous-box/lustrous-box.js";
import { LustrousPressable } from "../lustrous-pressable/lustrous-pressable.js";

export type LustrousSegmentedRadius = "s" | "m" | "l" | "xl" | "2xl";
export type LustrousSegmentedListTag = "ul" | "ol";

/**
 * Shared segmented corner rounding and inset divider hairlines for items inside `<lustrous-segmented-list>`.
 * Outer corners use `--_segmented-radius` (`l` by default); inner seams use `--lustrous-radius-xs` (`4px`),
 * or `0px` when `divider` is set on the enclosing `<lustrous-segmented-list>`.
 */
const segmentedItemCornerStyles = css`
  :host {
    --_item-radius: var(--_segmented-radius, var(--lustrous-radius-l));
    border-radius: var(--_segmented-seam-radius, var(--lustrous-radius-xs));
  }
  :host([border-radius="s"]) {
    --_item-radius: var(--lustrous-radius-s);
  }
  :host([border-radius="m"]) {
    --_item-radius: var(--lustrous-radius-m);
  }
  :host([border-radius="l"]) {
    --_item-radius: var(--lustrous-radius-l);
  }
  :host([border-radius="xl"]) {
    --_item-radius: var(--lustrous-radius-xl);
  }
  :host([border-radius="2xl"]) {
    --_item-radius: var(--lustrous-radius-2xl);
  }

  :host(:first-child) {
    border-top-left-radius: var(--_item-radius);
    border-top-right-radius: var(--_item-radius);
  }
  :host(:last-child) {
    border-bottom-left-radius: var(--_item-radius);
    border-bottom-right-radius: var(--_item-radius);
  }
  :host(:first-child:last-child) {
    border-radius: var(--_item-radius);
  }

  :host([data-segmented-divider]:not([position])) {
    position: relative;
  }
  :host([data-segmented-divider]:not(:last-child))::after {
    content: "";
    position: absolute;
    bottom: 0;
    inset-inline: var(--lustrous-space-l);
    height: 1px;
    background-color: var(--lustrous-color-on-surface-low);
    pointer-events: none;
  }

  @media (forced-colors: active) {
    :host(
      :not([position]):not([border]):not([border-block]):not([border-inline]):not([border-top]):not([border-bottom]):not(
          [border-start]
        ):not([border-end])
    ) {
      position: relative;
    }
    :host(
      :not([border]):not([border-block]):not([border-inline]):not([border-top]):not([border-bottom]):not([border-start]):not(
          [border-end]
        )
    )::before {
      content: "";
      position: absolute;
      inset: 0;
      border: 1px solid CanvasText;
      border-radius: inherit;
      pointer-events: none;
    }
    :host([data-segmented-divider]:not(:last-child))::after {
      background-color: CanvasText;
    }
  }
`;

function syncItemDividerFromAncestor(el: HTMLElement): void {
  if (typeof el.closest !== "function") return;
  const list = el.closest("lustrous-segmented-list") as LustrousSegmentedList | null;
  if (!list) return;
  const divided = list.divider ?? (list.hasAttribute("divider") && list.getAttribute("divider") !== "false");
  el.toggleAttribute("data-segmented-divider", Boolean(divided));
}

/**
 * `<lustrous-segmented-list>` — Vertical list of segmented cards or surface rows (`role="list"`).
 *
 * Stacks items with `--lustrous-space-xs` (`4px`) gap, applying `--_segmented-radius` (`l` by default)
 * to the top of the first item and bottom of the last item, and `--lustrous-radius-xs` (`4px`) on inner seams.
 * Setting `divider` collapses gaps and inner seam radii to `0px` and draws `16px`-inset `1px` hairlines between items.
 *
 * @slot - `<lustrous-segmented-list-item>`, `<lustrous-segmented-list-button>`, or `<lustrous-segmented-list-link>` elements.
 */
@customElement("lustrous-segmented-list")
export class LustrousSegmentedList extends LustrousElement {
  private readonly internals: ElementInternals | undefined =
    typeof this.attachInternals === "function" ? this.attachInternals() : undefined;

  static override styles = [
    lustrousBase,
    css`
      :host {
        display: flex;
        flex-direction: column;
        min-width: 0;
        gap: var(--lustrous-space-xs);
        --_segmented-radius: var(--lustrous-radius-l);
        --_segmented-seam-radius: var(--lustrous-radius-xs);
      }
      :host([divider]:not([divider="false"])) {
        gap: 0px;
        --_segmented-seam-radius: 0px;
      }
      :host([border-radius="s"]) {
        --_segmented-radius: var(--lustrous-radius-s);
      }
      :host([border-radius="m"]) {
        --_segmented-radius: var(--lustrous-radius-m);
      }
      :host([border-radius="l"]),
      :host(:not([border-radius])) {
        --_segmented-radius: var(--lustrous-radius-l);
      }
      :host([border-radius="xl"]) {
        --_segmented-radius: var(--lustrous-radius-xl);
      }
      :host([border-radius="2xl"]) {
        --_segmented-radius: var(--lustrous-radius-2xl);
      }
    `,
    toCss(gapRules()),
  ];

  /** Outer corner radius token applied to the first and last items. @default "l" */
  @property({ reflect: true, attribute: "border-radius" }) borderRadius: LustrousSegmentedRadius = "l";
  /** Renders items as a continuous card (`0px` gap and inner seams) with `16px`-inset `1px` hairlines. @default false */
  @property({ type: Boolean, reflect: true }) divider = false;
  /** Semantic list variant (`ul` or `ol`). @default "ul" */
  @property({ reflect: true }) as: LustrousSegmentedListTag = "ul";
  /** Vertical spacing override between segmented items. */
  @property({ reflect: true }) gap?: LustrousSpacingToken;
  /** Accessible name for the list. */
  @property() label = "";

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.internals) {
      this.internals.role = "list";
    }
  }

  private readonly syncChildren = () => {
    const slot = this.renderRoot.querySelector<HTMLSlotElement>("slot");
    for (const child of slot?.assignedElements() ?? []) {
      child.toggleAttribute("data-segmented-divider", this.divider);
    }
  };

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (changed.has("label") && this.internals) {
      this.internals.ariaLabel = this.label || null;
    }
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    if (changed.has("divider")) this.syncChildren();
  }

  protected override render() {
    return html`<slot @slotchange=${this.syncChildren}></slot>`;
  }
}

/**
 * `<lustrous-segmented-list-item>` — Static or composite row inside `<lustrous-segmented-list>` (`role="listitem"`).
 *
 * Pass a trailing control into `slot="action"` to arrange primary content and trailing actions in a horizontal row.
 *
 * @slot - Primary row content.
 * @slot action - Optional trailing control (`<lustrous-switch>`, `<lustrous-button>`, etc.).
 * @csspart row - Horizontal flex wrapper rendered when `slot="action"` is populated.
 * @csspart body - Primary content column rendered when `slot="action"` is populated.
 * @csspart action - Non-shrinking trailing action wrapper rendered when `slot="action"` is populated.
 */
@customElement("lustrous-segmented-list-item")
export class LustrousSegmentedListItem extends LustrousBox {
  private readonly internals: ElementInternals | undefined =
    typeof this.attachInternals === "function" ? this.attachInternals() : undefined;

  @state() private hasAction = false;

  static override styles = [
    ...lustrousBoxStyles,
    segmentedItemCornerStyles,
    css`
      .action-row {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: var(--lustrous-space-m);
        width: 100%;
      }
      .action-body {
        display: flex;
        flex-direction: column;
        gap: var(--lustrous-space-xs);
        flex-grow: 1;
        min-width: 0;
      }
      .action-slot {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: var(--lustrous-space-s);
        flex-shrink: 0;
      }
    `,
  ];

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.internals) {
      this.internals.role = "listitem";
    }
    this.hasAction = typeof this.querySelector === "function" && this.querySelector('[slot="action"]') !== null;
    syncItemDividerFromAncestor(this);
  }

  override disconnectedCallback(): void {
    this.removeAttribute("data-segmented-divider");
    super.disconnectedCallback();
  }

  private onActionSlotChange(e: Event) {
    this.hasAction = (e.target as HTMLSlotElement).assignedNodes({ flatten: true }).length > 0;
  }

  protected override render() {
    if (this.hasAction) {
      return html`<div part="row" class="action-row">
        <div part="body" class="action-body"><slot></slot></div>
        <div part="action" class="action-slot"><slot name="action" @slotchange=${this.onActionSlotChange}></slot></div>
      </div>`;
    }
    return html`<slot></slot><slot name="action" @slotchange=${this.onActionSlotChange}></slot>`;
  }
}

/**
 * `<lustrous-segmented-list-button>` — Interactive button row inside `<lustrous-segmented-list>` (`role="listitem"`).
 *
 * Uses an inset focus ring (`outline-offset: -3px`) so adjacent segmented items never clip the focus outline.
 *
 * @slot - Button row content.
 */
@customElement("lustrous-segmented-list-button")
export class LustrousSegmentedListButton extends LustrousPressable {
  private readonly internals: ElementInternals | undefined =
    typeof this.attachInternals === "function" ? this.attachInternals() : undefined;

  static override styles = [
    ...LustrousPressable.styles,
    segmentedItemCornerStyles,
    css`
      :host {
        width: 100%;
        text-align: start;
        box-sizing: border-box;
      }
      .inner:focus-visible {
        outline-offset: -3px;
      }
    `,
  ];

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.internals && !this.getAttribute("role")) {
      this.internals.role = "listitem";
    }
    syncItemDividerFromAncestor(this);
  }

  override disconnectedCallback(): void {
    this.removeAttribute("data-segmented-divider");
    super.disconnectedCallback();
  }
}

/**
 * `<lustrous-segmented-list-link>` — Interactive link row inside `<lustrous-segmented-list>` (`role="listitem"`).
 *
 * Renders an anchor via `href` while inheriting segmented corner rounding and an inset focus ring.
 *
 * @slot - Link row content.
 */
@customElement("lustrous-segmented-list-link")
export class LustrousSegmentedListLink extends LustrousPressable {
  private readonly internals: ElementInternals | undefined =
    typeof this.attachInternals === "function" ? this.attachInternals() : undefined;

  static override styles = [
    ...LustrousPressable.styles,
    segmentedItemCornerStyles,
    css`
      :host {
        display: block;
        width: 100%;
        text-align: start;
        box-sizing: border-box;
      }
      .inner:focus-visible {
        outline-offset: -3px;
      }
    `,
  ];

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.internals && !this.getAttribute("role")) {
      this.internals.role = "listitem";
    }
    syncItemDividerFromAncestor(this);
  }

  override disconnectedCallback(): void {
    this.removeAttribute("data-segmented-divider");
    super.disconnectedCallback();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-segmented-list": LustrousSegmentedList;
    "lustrous-segmented-list-item": LustrousSegmentedListItem;
    "lustrous-segmented-list-button": LustrousSegmentedListButton;
    "lustrous-segmented-list-link": LustrousSegmentedListLink;
  }
}
