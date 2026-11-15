import { css, html, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { attrRules, paddingValues, toCss } from "../../internal/style-gen.js";
import "../../theme/events.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { lustrousBase } from "../../theme/theme.js";
import type { LustrousPaddingValue } from "../lustrous-box/lustrous-box.js";

const CONTROL =
  "button, [role='button'], lustrous-button, lustrous-icon-button, lustrous-togglable-button, lustrous-togglable-icon-button, lustrous-pressable";

type ExpandableControl = HTMLElement & { expanded?: boolean; disabled?: boolean };

export interface LustrousCollapsibleToggleDetail {
  open: boolean;
  expanded: boolean;
}

export type LustrousCollapsibleToggleEvent = CustomEvent<LustrousCollapsibleToggleDetail>;

/**
 * `<lustrous-collapsible-container>` — Headless animated height disclosure region.
 *
 * Animates `grid-template-rows` between `0fr` and `1fr` over `--lustrous-duration-short200`
 * (`--lustrous-easing-standard`; disabled under `prefers-reduced-motion: reduce`) without
 * imposing a visual surface. Place inner spacing on the slotted content so collapsed height
 * folds cleanly to zero.
 *
 * Automatically binds the first button control inside `slot="trigger"`: native `<button>` and
 * `[role="button"]` elements receive `aria-expanded`, while `<lustrous-button>` and
 * `<lustrous-icon-button>` receive the `expanded` property (rendering their animated chevron
 * and forwarding `aria-expanded`). Collapsed content stays in the DOM as `inert` and
 * `aria-hidden="true"`.
 *
 * @slot trigger - Disclosure control (or a header containing the trigger and sibling actions).
 * @slot - Collapsible content body.
 * @fires lustrous-toggle - Cancelable `CustomEvent<{ open: boolean, expanded: boolean }>`.
 * @csspart content - Outer animated CSS grid region.
 */
@customElement("lustrous-collapsible-container")
export class LustrousCollapsibleContainer extends LustrousElement {
  static override styles = [
    lustrousBase,
    css`
      :host {
        display: block;
      }
      .content {
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows var(--lustrous-duration-short200) var(--lustrous-easing-standard);
      }
      :host([expanded]) .content {
        grid-template-rows: 1fr;
      }
      /* Clip only the block axis so inline-bleeding children keep their horizontal edges and corners. */
      .inner {
        min-width: 0;
        min-height: 0;
        overflow-x: visible;
        overflow-y: clip;
      }
      /* Softly masks the bottom edge while folding shut. */
      :host(:not([expanded])) .inner {
        mask-image: linear-gradient(to bottom, black 0, black calc(100% - 40px), transparent 100%);
      }
      @media (prefers-reduced-motion: reduce) {
        .content {
          transition: none;
        }
      }
    `,
    toCss(
      attrRules(
        "inline-bleed",
        Object.fromEntries(
          Object.entries(paddingValues()).map(([k, v]) => [k, `margin-inline: calc(-1 * ${v}); padding-inline: ${v};`]),
        ),
        ".inner",
      ),
    ),
  ];

  /** Whether the collapsible content region is expanded. @default false */
  @property({ type: Boolean, reflect: true }) expanded = false;

  /**
   * Spacing token matching children that bleed horizontally past the content box
   * (e.g. `inline-bleed="l"` for `margin-inline: calc(-1 * var(--lustrous-space-l))`),
   * widening the inner region with equal negative margin and padding so horizontal
   * edges are preserved during fold animations.
   */
  @property({ reflect: true, attribute: "inline-bleed" }) inlineBleed?: LustrousPaddingValue;

  /** Alias for `expanded`. */
  get open(): boolean {
    return this.expanded;
  }

  set open(value: boolean) {
    this.expanded = Boolean(value);
  }

  static override get observedAttributes(): string[] {
    return [...super.observedAttributes, "open"];
  }

  override attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null): void {
    super.attributeChangedCallback(name, oldVal, newVal);
    if (name === "open") {
      this.expanded = newVal !== null && newVal !== "false";
    }
  }

  private control?: ExpandableControl;

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.control?.removeEventListener("click", this.onControlClick);
  }

  /** Requests the target or opposite disclosure state; dispatches cancelable `lustrous-toggle` before applying. */
  toggle(force?: boolean): void {
    const next = force ?? !this.expanded;
    if (next === this.expanded) return;
    const ev = new CustomEvent<LustrousCollapsibleToggleDetail>("lustrous-toggle", {
      detail: { open: next, expanded: next },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    if (this.dispatchEvent(ev)) {
      this.expanded = next;
    }
  }

  private onControlClick = (e: Event) => {
    if (this.control?.disabled || this.control?.getAttribute("aria-disabled") === "true") return;
    e.preventDefault();
    this.toggle();
  };

  private onTriggerSlotChange(e: Event): void {
    const assigned = (e.target as HTMLSlotElement).assignedElements({ flatten: true });
    let control: ExpandableControl | undefined;
    for (const el of assigned) {
      control = (el.matches(CONTROL) ? el : el.querySelector(CONTROL)) as ExpandableControl | undefined;
      if (control) break;
    }
    if (control === this.control) return;
    this.control?.removeEventListener("click", this.onControlClick);
    this.control = control;
    control?.addEventListener("click", this.onControlClick);
    this.syncControl();
  }

  private syncControl(): void {
    const c = this.control;
    if (!c) return;
    if (c.localName === "lustrous-button" || c.localName === "lustrous-icon-button") {
      if ("expanded" in c) {
        c.expanded = this.expanded;
      } else {
        c.setAttribute("expanded", this.expanded ? "" : "false");
      }
    } else {
      c.setAttribute("aria-expanded", String(this.expanded));
    }
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    if (changed.has("expanded")) {
      this.syncControl();
    }
  }

  protected override render() {
    return html`<slot name="trigger" @slotchange=${this.onTriggerSlotChange}></slot>
      <div part="content" class="content" ?inert=${!this.expanded} aria-hidden=${this.expanded ? "false" : "true"}>
        <div class="inner"><slot></slot></div>
      </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-collapsible-container": LustrousCollapsibleContainer;
  }
}
