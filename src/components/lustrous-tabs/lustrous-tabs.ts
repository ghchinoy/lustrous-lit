import { css, html, nothing } from "lit";
import { customElement, property, queryAll, state } from "lit/decorators.js";
import "../../theme/events.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { lustrousBase, lustrousFocusRing, lustrousStateLayer, lustrousType } from "../../theme/theme.js";
import { renderIcon, type LustrousIconName } from "../lustrous-icon/lustrous-icon.js";

export type LustrousTabsVariant = "pill" | "underline";

export interface LustrousTabItem {
  label: string;
  /** Stable identifier; defaults to the tab's index (`"0"`, `"1"`, …). */
  value?: string;
  /** Prevents selection while keeping the tab focusable during arrow-key navigation (`aria-disabled="true"`). */
  disabled?: boolean;
  /** Optional decorative leading icon. */
  icon?: LustrousIconName;
}

/**
 * `<lustrous-tabs>` — Accessible horizontal tab bar with optional slotted `tabpanel` content.
 *
 * Implements WAI-ARIA Tabs: single tab stop (`roving tabindex`), RTL-aware `ArrowLeft`/`ArrowRight`,
 * `Home`, and `End` keys, automatic activation for enabled tabs, and `role="tabpanel"` linked to
 * the active tab via `aria-controls` / `aria-labelledby`.
 *
 * @slot {value} - Panel content associated with the tab matching `{value}`.
 * @fires lustrous-change - `CustomEvent<{ value: string }>` when the selected tab changes.
 * @csspart list - The `role="tablist"` container.
 * @csspart tab - Each `role="tab"` button.
 * @csspart tab-selected - Applied in addition to `tab` on the active tab.
 * @csspart panel - The `role="tabpanel"` container when slotted panels are present.
 */
@customElement("lustrous-tabs")
export class LustrousTabs extends LustrousElement {
  static override styles = [
    lustrousBase,
    lustrousFocusRing,
    lustrousStateLayer,
    css`
      :host {
        display: block;
      }
      .list {
        display: flex;
        gap: var(--lustrous-space-s);
        overflow-x: auto;
        overflow-y: hidden;
        scrollbar-width: none;
        padding: 5px;
        margin: -5px;
      }
      .list::-webkit-scrollbar {
        display: none;
      }
      .tab {
        all: unset;
        box-sizing: border-box;
        position: relative;
        isolation: isolate;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--lustrous-space-xs);
        flex-shrink: 0;
        height: 36px;
        padding-inline: var(--lustrous-space-l);
        border-radius: var(--lustrous-radius-full);
        color: var(--lustrous-color-on-surface-variant);
        cursor: pointer;
        white-space: nowrap;
        ${lustrousType("body-large")}
      }
      .tab[aria-selected="true"] {
        background-color: light-dark(var(--lustrous-color-surface-dim), var(--lustrous-color-surface-container-high));
        color: var(--lustrous-color-on-surface);
      }
      :host([variant="underline"]) .list {
        gap: var(--lustrous-space-l);
        padding: 4px 4px 0;
        margin: -4px -4px 0;
        border-bottom: 1px solid var(--lustrous-color-outline-variant);
      }
      :host([variant="underline"]) .tab {
        height: 40px;
        padding-inline: var(--lustrous-space-s);
        border-radius: var(--lustrous-radius-s) var(--lustrous-radius-s) 0 0;
        ${lustrousType("body-medium-emphasized")}
      }
      :host([variant="underline"]) .tab[aria-selected="true"] {
        background-color: transparent;
        color: var(--lustrous-color-primary);
        box-shadow: inset 0 -2.5px 0 0 var(--lustrous-color-primary);
      }
      .tab[aria-disabled="true"] {
        cursor: default;
        color: var(--lustrous-color-state-disabled-label);
        background-image: linear-gradient(var(--lustrous-color-state-disabled), var(--lustrous-color-state-disabled));
      }
      :host([variant="underline"]) .tab[aria-disabled="true"] {
        background-image: none;
      }
      .tab[aria-disabled="true"]::after {
        opacity: 0;
      }
      .panel:focus-visible {
        outline: 2.5px solid var(--lustrous-color-on-surface);
        outline-offset: 2px;
      }
      @media (forced-colors: active) {
        .tab[aria-selected="true"] {
          border: 1px solid Highlight;
        }
        :host([variant="underline"]) .tab[aria-selected="true"] {
          border: 0;
          border-bottom: 3px solid Highlight;
          box-shadow: none;
        }
        .tab[aria-disabled="true"] {
          color: GrayText;
          background-image: none;
        }
        .panel:focus-visible {
          outline-color: Highlight;
        }
      }
    `,
  ];

  /** Ordered tab definitions (property-only). */
  @property({ attribute: false }) tabs: LustrousTabItem[] = [];
  /** Active tab value; defaults to the first enabled tab when unset. */
  @property({ reflect: true }) value?: string;
  /** Accessible name of the `tablist`. */
  @property() label = "";
  /** Visual style: `pill` (default) or `underline`. @default "pill" */
  @property({ reflect: true }) variant: LustrousTabsVariant = "pill";

  @state() private hasPanels = false;
  @queryAll("button.tab") private buttons!: NodeListOf<HTMLButtonElement>;
  private observer?: MutationObserver;

  private tabValue(tab: LustrousTabItem, i: number): string {
    return tab.value ?? String(i);
  }

  private get selectedValue(): string | undefined {
    if (this.value !== undefined && this.tabs.some((t, i) => this.tabValue(t, i) === this.value)) {
      return this.value;
    }
    const i = this.tabs.findIndex((t) => !t.disabled);
    return i >= 0 ? this.tabValue(this.tabs[i], i) : undefined;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.updatePanels();
    if (typeof MutationObserver !== "undefined") {
      this.observer ??= new MutationObserver(() => this.updatePanels());
      this.observer.observe(this, { childList: true, attributes: true, attributeFilter: ["slot"] });
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.observer?.disconnect();
  }

  private updatePanels() {
    if (!this.children) return;
    this.hasPanels = [...this.children].some((c) => c.hasAttribute("slot"));
  }

  private select(v: string) {
    if (v === this.selectedValue) return;
    this.value = v;
    this.dispatchEvent(new CustomEvent("lustrous-change", { detail: { value: v }, bubbles: true, composed: true }));
  }

  private onKeydown(e: KeyboardEvent) {
    const list = [...this.buttons];
    if (!list.length) return;
    const rtl = getComputedStyle(this).direction === "rtl";
    const i = Math.max(0, list.indexOf((this.shadowRoot!.activeElement as HTMLButtonElement) ?? list[0]));
    let next: number;
    switch (e.key) {
      case "ArrowRight":
        next = i + (rtl ? -1 : 1);
        break;
      case "ArrowLeft":
        next = i + (rtl ? 1 : -1);
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = list.length - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    const idx = (next + list.length) % list.length;
    const btn = list[idx];
    btn.focus();
    btn.scrollIntoView({ block: "nearest", inline: "nearest" });
    if (!this.tabs[idx]?.disabled) this.select(this.tabValue(this.tabs[idx], idx));
  }

  protected override render() {
    const selected = this.selectedValue;
    return html`<div
        part="list"
        class="list"
        role="tablist"
        aria-label=${this.label || nothing}
        @keydown=${this.onKeydown}
      >
        ${this.tabs.map((tab, i) => {
          const v = this.tabValue(tab, i);
          const isSelected = v === selected;
          return html`<button
            part=${isSelected ? "tab tab-selected" : "tab"}
            class="tab state-layer focus-ring"
            role="tab"
            type="button"
            id="tab-${i}"
            aria-selected=${isSelected ? "true" : "false"}
            aria-controls=${this.hasPanels ? "panel" : nothing}
            aria-disabled=${tab.disabled ? "true" : nothing}
            tabindex=${isSelected ? "0" : "-1"}
            @click=${() => !tab.disabled && this.select(v)}
          >
            ${tab.icon ? renderIcon(tab.icon, "xs") : nothing}
            <span>${tab.label}</span>
          </button>`;
        })}
      </div>
      ${this.hasPanels && selected !== undefined
        ? html`<div
            part="panel"
            class="panel"
            id="panel"
            role="tabpanel"
            tabindex="0"
            aria-labelledby="tab-${this.tabs.findIndex((t, i) => this.tabValue(t, i) === selected)}"
          >
            <slot name=${selected}></slot>
          </div>`
        : nothing}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-tabs": LustrousTabs;
  }
}
