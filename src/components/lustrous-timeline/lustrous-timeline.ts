import { css, html, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { lustrousBase } from "../../theme/theme.js";
import type { LustrousTextVariant } from "../../theme/tokens.js";
import { LustrousFlex } from "../lustrous-flex/lustrous-flex.js";
import { renderIcon, type LustrousIconName } from "../lustrous-icon/lustrous-icon.js";
import "../lustrous-text/lustrous-text.js";

/** Milestone status of a timeline item; `default` renders a hollow decorative ring. */
export type LustrousTimelineStatus = "default" | "past" | "active" | "future";

/**
 * `<lustrous-timeline>` — Vertical milestone, deployment pipeline, and audit-log container (`role="list"`).
 *
 * Extends `<lustrous-flex>` with `direction="column"`; individual `<lustrous-timeline-item>` children
 * draw their own connectors and vertical spacing.
 *
 * @slot - `<lustrous-timeline-item>` elements.
 */
@customElement("lustrous-timeline")
export class LustrousTimeline extends LustrousFlex {
  static override styles = [
    ...[LustrousFlex.styles].flat(),
    css`
      :host {
        flex-direction: column;
      }
    `,
  ];

  /** Accessible name of the timeline list. */
  @property() label = "";

  readonly internals: ElementInternals | undefined =
    typeof this.attachInternals === "function" ? this.attachInternals() : undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    this.direction = "column";
    if (this.internals) this.internals.role = "list";
  }

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (changed.has("label") && this.internals) {
      this.internals.ariaLabel = this.label || null;
    }
  }
}

/**
 * `<lustrous-timeline-item>` — Single milestone, pipeline stage, or audit event inside `<lustrous-timeline>` (`role="listitem"`).
 *
 * Renders a marker column (16px status dot, 20px icon, or custom `slot="marker"`) with a dotted
 * vertical connector to the next item, paired with a content column (`heading`, `time-label`, and body slot).
 *
 * @slot - Body content below the heading and timestamp.
 * @slot heading - Rich heading content (overrides `heading`).
 * @slot time-label - Rich timestamp or metadata label (overrides `time-label`).
 * @slot marker - Custom marker element (replaces `icon` and the status dot).
 * @csspart row - Outer flex row.
 * @csspart marker - Status dot, icon box, or custom marker container.
 * @csspart connector - Dotted vertical connector below the marker.
 * @csspart content - Heading, timestamp, and body column.
 */
@customElement("lustrous-timeline-item")
export class LustrousTimelineItem extends LustrousElement {
  static override styles = [
    lustrousBase,
    css`
      :host {
        display: block;
      }
      [hidden] {
        display: none !important;
      }
      .row {
        display: flex;
        gap: var(--lustrous-space-l);
      }
      :host(:not(:last-child):is([status="past"], [status="active"], [status="future"])) .row {
        min-height: 80px;
      }
      .markers {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 24px;
      }
      .dot {
        flex-shrink: 0;
        width: 16px;
        height: 16px;
        margin-top: 4px;
        border: 1.5px solid var(--lustrous-color-on-surface);
        border-radius: 50%;
      }
      :host([status="past"]) .dot {
        border-color: transparent;
        background-color: var(--lustrous-color-tertiary);
      }
      :host([status="active"]) .dot {
        border-color: transparent;
        background-color: var(--lustrous-color-primary);
      }
      :host([status="future"]) .dot {
        border-color: transparent;
        background-color: var(--lustrous-color-outline);
      }
      .icon {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        color: var(--lustrous-color-on-surface);
      }
      .connector {
        flex-grow: 1;
        width: 1.5px;
        margin-block: 4px;
        color: var(--lustrous-color-outline);
        background-image: radial-gradient(circle, currentColor 1px, transparent 1px);
        background-position: top center;
        background-repeat: repeat-y;
        background-size: 100% 4px;
      }
      :host(:last-child) .connector,
      :host([hide-connector]) .connector {
        display: none;
      }
      .content {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        min-width: 0;
        padding-bottom: var(--lustrous-space-l);
      }
      :host(:last-child) .content {
        padding-bottom: 0;
      }
      .spaced {
        margin-bottom: var(--lustrous-space-xs);
      }
      @media (forced-colors: active) {
        .dot {
          border-color: CanvasText;
        }
        :host(:is([status="past"], [status="future"])) .dot {
          forced-color-adjust: none;
          border-color: CanvasText;
          background-color: CanvasText;
        }
        :host([status="active"]) .dot {
          forced-color-adjust: none;
          border-color: Highlight;
          background-color: Highlight;
        }
        .connector {
          forced-color-adjust: none;
          color: CanvasText;
        }
      }
    `,
  ];

  /** Primary milestone or event title. */
  @property() heading = "";
  /** Typography scale token for `heading`. @default "body-large-emphasized" */
  @property({ attribute: "heading-variant" }) headingVariant: LustrousTextVariant = "body-large-emphasized";
  /** Secondary timestamp or phase label rendered in `caption` style. */
  @property({ attribute: "time-label" }) timeLabel = "";
  /** Milestone state controlling dot color (`default`, `past`, `active`, `future`). @default "default" */
  @property({ reflect: true }) status: LustrousTimelineStatus = "default";
  /** Accessible name for the status dot (`role="img"`) when `status` is not `"default"`. */
  @property({ attribute: "marker-label" }) markerLabel = "";
  /** Optional icon rendered in place of the status dot. */
  @property({ reflect: true }) icon?: LustrousIconName;
  /** Hides the vertical connector below this item. */
  @property({ type: Boolean, reflect: true, attribute: "hide-connector" }) hideConnector = false;

  @state() private hasMarkerSlot = false;
  @state() private hasHeadingSlot = false;
  @state() private hasTimeSlot = false;
  @state() private hasBody = false;

  readonly internals: ElementInternals | undefined =
    typeof this.attachInternals === "function" ? this.attachInternals() : undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.internals) this.internals.role = "listitem";
    if (typeof this.querySelector === "function") {
      this.hasMarkerSlot = !!this.querySelector(":scope > [slot=marker]");
      this.hasHeadingSlot = !!this.querySelector(":scope > [slot=heading]");
      this.hasTimeSlot = !!this.querySelector(":scope > [slot=time-label]");
    }
    if (this.childNodes) {
      this.hasBody = [...this.childNodes].some(isBodyNode);
    }
  }

  private onSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    const has = slot.assignedNodes().some((n) => (slot.name ? n.nodeType === 1 : isBodyNode(n)));
    if (slot.name === "marker") this.hasMarkerSlot = has;
    else if (slot.name === "heading") this.hasHeadingSlot = has;
    else if (slot.name === "time-label") this.hasTimeSlot = has;
    else this.hasBody = has;
  }

  private renderMarker() {
    if (!this.hasMarkerSlot && this.icon) {
      return html`<span part="marker" class="icon">${renderIcon(this.icon, "s")}</span>`;
    }
    const named = this.status !== "default" && !!this.markerLabel;
    return html`<span part="marker" class="icon" ?hidden=${!this.hasMarkerSlot}
        ><slot name="marker" @slotchange=${this.onSlotChange}></slot></span
      >${this.hasMarkerSlot
        ? nothing
        : html`<span
            part="marker"
            class="dot"
            role=${named ? "img" : nothing}
            aria-label=${named ? this.markerLabel : nothing}
            aria-hidden=${named ? nothing : "true"}
          ></span>`}`;
  }

  protected override render() {
    const hasHeading = !!this.heading || this.hasHeadingSlot;
    const hasTime = !!this.timeLabel || this.hasTimeSlot;
    return html`<div part="row" class="row">
      <div class="markers">
        ${this.renderMarker()}
        <span part="connector" class="connector" aria-hidden="true"></span>
      </div>
      <div part="content" class="content">
        <lustrous-text
          block
          class=${hasTime || this.hasBody ? "spaced" : ""}
          variant=${this.headingVariant}
          ?hidden=${!hasHeading}
          ><slot name="heading" @slotchange=${this.onSlotChange}>${this.heading}</slot></lustrous-text
        >
        <lustrous-text
          block
          muted
          class=${this.hasBody ? "spaced" : ""}
          variant="caption"
          ?hidden=${!hasTime}
          ><slot name="time-label" @slotchange=${this.onSlotChange}>${this.timeLabel}</slot></lustrous-text
        >
        <slot @slotchange=${this.onSlotChange}></slot>
      </div>
    </div>`;
  }
}

function isBodyNode(n: Node): boolean {
  if (n.nodeType === 1) return !(n as Element).hasAttribute("slot");
  return n.nodeType === 3 && !!n.textContent?.trim();
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-timeline": LustrousTimeline;
    "lustrous-timeline-item": LustrousTimelineItem;
  }
}
