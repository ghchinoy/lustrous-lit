import { css, html, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { lustrousBase, lustrousFocusRing, lustrousStateLayer, lustrousType } from "../../theme/theme.js";
import { LustrousFlex } from "../lustrous-flex/lustrous-flex.js";
import { renderIcon, type LustrousIconName } from "../lustrous-icon/lustrous-icon.js";

/**
 * `<lustrous-list>` — Vertical list container (`role="list"` via `ElementInternals`) extending `<lustrous-flex>`.
 *
 * @slot - `<lustrous-list-item>` elements.
 */
@customElement("lustrous-list")
export class LustrousList extends LustrousFlex {
  static override styles = [
    ...[LustrousFlex.styles].flat(),
    css`
      :host {
        flex-direction: column;
      }
    `,
  ];

  /** Accessible name of the list (`aria-label` on the host is also respected). */
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
 * `<lustrous-list-item>` — Interactive or static row inside a `<lustrous-list>` (`role="listitem"` via `ElementInternals`).
 *
 * Renders a `<button>` by default, an `<a>` when `href` is set, or a non-interactive `<div>` when `static` is set.
 * Exposes `aria-current="true"` when `selected`.
 *
 * @slot end - Trailing content (e.g. `<lustrous-badge>` or `<lustrous-kbd>`). Use `static` rows when slotting interactive controls.
 * @slot - Supplemental content below the description.
 * @csspart row - The inner `<button>`, `<a>`, or `<div>` surface.
 */
@customElement("lustrous-list-item")
export class LustrousListItem extends LustrousElement {
  static override shadowRootOptions: ShadowRootInit = { ...LustrousElement.shadowRootOptions, delegatesFocus: true };

  static override styles = [
    lustrousBase,
    lustrousFocusRing,
    lustrousStateLayer,
    css`
      :host {
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
        gap: var(--lustrous-space-s);
        width: 100%;
        padding: var(--lustrous-space-m) var(--lustrous-space-l);
        border-radius: var(--lustrous-radius-l);
        color: var(--lustrous-color-on-surface);
        text-align: start;
        text-decoration: none;
        cursor: pointer;
      }
      .row.has-start {
        padding-inline-start: var(--lustrous-space-s);
      }
      .row.static {
        cursor: default;
      }
      .row.selected {
        background-color: light-dark(var(--lustrous-color-surface-dim), var(--lustrous-color-surface-container-high));
      }
      :host([disabled]) .row {
        opacity: 0.5;
        cursor: default;
        pointer-events: none;
      }
      .start,
      .end {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .end[hidden] {
        display: none;
      }
      .text {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-width: 0;
      }
      .label,
      .desc {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .label {
        ${lustrousType("body-medium")}
      }
      .desc {
        color: var(--lustrous-color-on-surface-variant);
        ${lustrousType("body-small")}
      }
      @media (forced-colors: active) {
        .row.selected {
          border: 1px solid Highlight;
        }
        :host([disabled]) .row {
          opacity: 1;
          color: GrayText;
        }
      }
    `,
  ];

  /** Primary row label. */
  @property() label = "";
  /** Secondary muted description text. */
  @property() description = "";
  /** Optional 24px leading icon. */
  @property({ reflect: true, attribute: "start-icon" }) startIcon?: LustrousIconName;
  /** Optional 20px trailing icon. */
  @property({ reflect: true, attribute: "end-icon" }) endIcon?: LustrousIconName;
  /** Marks the row as active (`aria-current="true"`). */
  @property({ type: Boolean, reflect: true }) selected = false;
  /** Disables interaction. */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** Renders a non-interactive `<div>` row instead of a button or link. */
  @property({ type: Boolean, reflect: true, attribute: "static" }) isStatic = false;
  /** Turns the row into an `<a>` link. */
  @property({ reflect: true }) href?: string;
  @property({ reflect: true }) target?: string;
  @property({ reflect: true }) rel?: string;

  @state() private hasEnd = false;

  readonly internals: ElementInternals | undefined =
    typeof this.attachInternals === "function" ? this.attachInternals() : undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.internals) this.internals.role = "listitem";
    if (typeof this.querySelector === "function") {
      this.hasEnd = !!this.querySelector(":scope > [slot=end]");
    }
  }

  protected override render() {
    const cls = [
      "row",
      this.startIcon ? "has-start" : "",
      this.selected ? "selected" : "",
      this.isStatic ? "static" : "state-layer focus-ring",
    ]
      .filter(Boolean)
      .join(" ");

    const content = html`
      ${this.startIcon ? html`<span class="start">${renderIcon(this.startIcon, "m")}</span>` : nothing}
      <span class="text">
        <span class="label">${this.label}</span>
        ${this.description ? html`<span class="desc">${this.description}</span>` : nothing}
        <slot></slot>
      </span>
      <span class="end" ?hidden=${!this.hasEnd && !this.endIcon}>
        <slot
          name="end"
          @slotchange=${(e: Event) => {
            this.hasEnd = (e.target as HTMLSlotElement).assignedElements().length > 0;
          }}
          >${this.endIcon ? renderIcon(this.endIcon, "s") : nothing}</slot
        >
      </span>
    `;

    const current = this.selected ? "true" : nothing;
    if (this.isStatic) {
      return html`<div part="row" class=${cls} aria-current=${current}>${content}</div>`;
    }
    if (this.href !== undefined) {
      return html`<a
        part="row"
        class=${cls}
        href=${ifDefined(this.disabled ? undefined : this.href)}
        target=${ifDefined(this.target)}
        rel=${ifDefined(this.rel ?? (this.target === "_blank" ? "noopener noreferrer" : undefined))}
        aria-current=${current}
        aria-disabled=${this.disabled ? "true" : nothing}
        role=${this.disabled ? "link" : nothing}
        tabindex=${this.disabled ? "-1" : nothing}
        >${content}</a
      >`;
    }
    return html`<button part="row" class=${cls} type="button" ?disabled=${this.disabled} aria-current=${current}>
      ${content}
    </button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-list": LustrousList;
    "lustrous-list-item": LustrousListItem;
  }
}
