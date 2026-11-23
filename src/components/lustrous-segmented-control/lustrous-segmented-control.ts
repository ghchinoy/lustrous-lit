import { css, html, nothing, type PropertyValues } from "lit";
import { customElement, property, queryAll } from "lit/decorators.js";
import { setHostVar } from "../../internal/style-gen.js";
import "../../theme/events.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { lustrousBase, lustrousFocusRing, lustrousType } from "../../theme/theme.js";
import { renderIcon, type LustrousIconName } from "../lustrous-icon/lustrous-icon.js";

export interface LustrousSegmentOption {
  value: string;
  label: string;
  disabled?: boolean;
  /** Optional leading icon. */
  icon?: LustrousIconName;
  /** Optional trailing count or badge label. */
  badge?: string | number;
}

export type { LustrousChangeEvent } from "../../theme/events.js";
export type LustrousSegmentedControlVariant = "default" | "transparent";
export type LustrousSegmentedControlSize = "s" | "m";

/**
 * `<lustrous-segmented-control>` — Compact 2–5 option view switcher with equal-width columns
 * and an animated sliding pill indicator.
 *
 * Implements WAI-ARIA `tablist` / `tab` keyboard navigation (`ArrowLeft`, `ArrowRight`, `Home`, `End`)
 * with RTL support, disabled segment skipping, and `forced-colors` `Highlight`/`Canvas` pill styling
 * so the selected label remains readable in high-contrast themes.
 *
 * @fires lustrous-change - `CustomEvent<{ value: string }>` when a segment is selected.
 * @csspart track - The pill track container.
 * @csspart indicator - The sliding active pill.
 * @csspart segment - Each segment button.
 * @csspart segment-selected - Applied in addition to `segment` on the active segment.
 */
@customElement("lustrous-segmented-control")
export class LustrousSegmentedControl extends LustrousElement {
  static override styles = [
    lustrousBase,
    lustrousFocusRing,
    css`
      :host {
        display: inline-flex;
        vertical-align: middle;
      }
      .track {
        position: relative;
        isolation: isolate;
        display: inline-grid;
        grid-auto-columns: minmax(0, 1fr);
        grid-auto-flow: column;
        align-items: center;
        width: 100%;
        padding: 2px;
        border-radius: var(--lustrous-radius-full);
        color: var(--lustrous-color-on-surface);
      }
      :host(:not([variant="transparent"])) .track {
        background-color: light-dark(var(--lustrous-color-surface-dim), var(--lustrous-color-surface-container));
      }
      .indicator {
        position: absolute;
        z-index: 0;
        top: 2px;
        bottom: 2px;
        left: calc(2px + var(--_lustrous-i, 0) * (100% - 4px) / var(--_lustrous-n, 1));
        width: calc((100% - 4px) / var(--_lustrous-n, 1));
        border-radius: var(--lustrous-radius-full);
        background-color: light-dark(
          var(--lustrous-color-surface-bright),
          var(--lustrous-color-surface-container-highest)
        );
        box-shadow: 0 1px 3px 0 light-dark(var(--lustrous-color-elevation1), transparent);
        outline: 1px solid light-dark(var(--lustrous-color-outline-variant), var(--lustrous-color-on-surface-low));
        outline-offset: -1px;
        pointer-events: none;
        transition:
          left 260ms cubic-bezier(0.2, 0, 0, 1),
          width 260ms cubic-bezier(0.2, 0, 0, 1);
      }
      .indicator:dir(rtl) {
        left: auto;
        right: calc(2px + var(--_lustrous-i, 0) * (100% - 4px) / var(--_lustrous-n, 1));
        transition:
          right 260ms cubic-bezier(0.2, 0, 0, 1),
          width 260ms cubic-bezier(0.2, 0, 0, 1);
      }
      .indicator[hidden] {
        display: none;
      }
      .seg {
        all: unset;
        box-sizing: border-box;
        position: relative;
        z-index: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--lustrous-space-xs);
        height: 28px;
        min-width: 0;
        padding-inline: var(--lustrous-space-m);
        border-radius: var(--lustrous-radius-full);
        cursor: pointer;
        white-space: nowrap;
        user-select: none;
        color: var(--lustrous-color-on-surface-variant);
        transition: color 180ms ease;
        ${lustrousType("body-small-emphasized")}
      }
      :host([size="m"]) .seg {
        height: 36px;
        ${lustrousType("body-medium-emphasized")}
      }
      .seg:hover:not([aria-selected="true"]):not(:disabled) {
        color: var(--lustrous-color-on-surface);
      }
      .seg[aria-selected="true"] {
        color: var(--lustrous-color-on-surface);
      }
      .seg:disabled {
        cursor: default;
        color: var(--lustrous-color-state-disabled-label);
      }
      @media (max-width: 768px) {
        .seg::before {
          content: "";
          position: absolute;
          inset-inline: 0;
          top: 50%;
          height: 44px;
          transform: translateY(-50%);
        }
      }
      .badge {
        font-family: var(--lustrous-font-code);
        font-size: 11px;
        line-height: 14px;
        padding: 0 5px;
        border-radius: var(--lustrous-radius-full);
        background-color: var(--lustrous-color-on-surface-low);
        font-variant-numeric: tabular-nums;
      }
      @media (prefers-reduced-motion: reduce) {
        .indicator,
        .indicator:dir(rtl) {
          transition: none;
        }
      }
      @media (forced-colors: active) {
        .track {
          border: 1px solid CanvasText;
        }
        .indicator {
          forced-color-adjust: none;
          border: 2px solid Highlight;
          background-color: Canvas;
          box-shadow: none;
          outline: none;
        }
        .seg[aria-selected="true"] {
          color: CanvasText;
        }
        .seg:disabled {
          color: GrayText;
        }
      }
    `,
  ];

  /** Segment definitions (`2–5` options recommended). */
  @property({ type: Array, attribute: false }) options: LustrousSegmentOption[] = [];
  /** Selected option value. */
  @property({ reflect: true }) value = "";
  /** Accessible name forwarded to `role="tablist"`. */
  @property() label = "";
  /** Track treatment: `default` (filled pill track) or `transparent` (trackless). @default "default" */
  @property({ reflect: true }) variant: LustrousSegmentedControlVariant = "default";
  /** Control height: `s` (32px) or `m` (40px). @default "s" */
  @property({ reflect: true }) size: LustrousSegmentedControlSize = "s";

  @queryAll("button.seg") private buttons!: NodeListOf<HTMLButtonElement>;

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (changed.has("options") || changed.has("value")) {
      setHostVar(this, "--_lustrous-n", String(Math.max(1, this.options.length)));
      setHostVar(
        this,
        "--_lustrous-i",
        String(Math.max(0, this.options.findIndex((o) => o.value === this.value))),
      );
    }
  }

  private select(val: string) {
    if (val === this.value) return;
    this.value = val;
    this.dispatchEvent(new CustomEvent("lustrous-change", { detail: { value: val }, bubbles: true, composed: true }));
  }

  private onKeydown(e: KeyboardEvent) {
    const enabled = this.options.filter((o) => !o.disabled);
    if (!enabled.length) return;
    const rtl = getComputedStyle(this).direction === "rtl";
    const idx = Math.max(
      0,
      enabled.findIndex((o) => o.value === this.value),
    );
    let next: number | undefined;
    switch (e.key) {
      case "ArrowRight":
        next = idx + (rtl ? -1 : 1);
        break;
      case "ArrowLeft":
        next = idx + (rtl ? 1 : -1);
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = enabled.length - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    const target = enabled[(next + enabled.length) % enabled.length];
    this.select(target.value);
    void this.updateComplete.then(() => {
      [...this.buttons].find((b) => b.dataset.value === target.value)?.focus();
    });
  }

  protected override render() {
    const selectedExists = this.options.some((o) => o.value === this.value && !o.disabled);
    const firstEnabled = this.options.find((o) => !o.disabled)?.value;
    return html`
      <div part="track" class="track" role="tablist" aria-label=${this.label || nothing} @keydown=${this.onKeydown}>
        <span part="indicator" class="indicator" ?hidden=${!selectedExists} aria-hidden="true"></span>
        ${this.options.map((opt) => {
          const selected = opt.value === this.value;
          const tabStop = selected || (!selectedExists && opt.value === firstEnabled);
          return html`
            <button
              part=${selected ? "segment segment-selected" : "segment"}
              class="seg focus-ring"
              role="tab"
              type="button"
              data-value=${opt.value}
              aria-selected=${selected ? "true" : "false"}
              tabindex=${tabStop ? "0" : "-1"}
              ?disabled=${opt.disabled}
              @click=${() => this.select(opt.value)}
            >
              ${opt.icon ? renderIcon(opt.icon, "xs") : nothing}
              <span>${opt.label}</span>
              ${opt.badge !== undefined ? html`<span class="badge">${opt.badge}</span>` : nothing}
            </button>
          `;
        })}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-segmented-control": LustrousSegmentedControl;
  }
}
