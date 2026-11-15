import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { spacingRules, toCss } from "../../internal/style-gen.js";
import { lustrousFocusRing, lustrousStateLayer } from "../../theme/theme.js";
import { LustrousBox, lustrousBoxStyles } from "../lustrous-box/lustrous-box.js";

const defaultTrue = {
  fromAttribute: (v: string | null) => v !== "false",
  toAttribute: (v: boolean) => (v ? null : "false"),
};

/**
 * `<lustrous-pressable>` — Interactive surface primitive for clickable cards, option tiles,
 * and custom rows with the Lustrous state layer and focus ring.
 *
 * Accepts all `<lustrous-box>` surface attributes (`background`, `border`, `border-radius`,
 * `width`, `shadow`, …) on the outer host while applying `padding*` inside `.inner` so the
 * entire surface area is interactive.
 *
 * Renders an inner `<button type="button">`, or an `<a>` when `href` is set.
 *
 * @slot - Content of the interactive surface.
 * @csspart inner - The native `<button>` or `<a>` control.
 */
@customElement("lustrous-pressable")
export class LustrousPressable extends LustrousBox {
  static override shadowRootOptions: ShadowRootInit = { ...LustrousBox.shadowRootOptions, delegatesFocus: true };

  static override styles = [
    ...lustrousBoxStyles,
    lustrousFocusRing,
    lustrousStateLayer,
    css`
      :host {
        position: relative;
        padding: 0 !important;
      }
      .inner {
        all: unset;
        box-sizing: border-box;
        position: relative;
        isolation: isolate;
        display: block;
        width: 100%;
        height: 100%;
        border-radius: inherit;
        color: inherit;
        text-align: inherit;
        text-decoration: none;
        cursor: pointer;
      }
      :host([selected]) {
        background-color: light-dark(var(--lustrous-color-surface-dim), var(--lustrous-color-surface-container-high));
      }
      :host([disabled]) {
        opacity: 0.38;
      }
      :host([disabled]) .inner {
        cursor: default;
        pointer-events: none;
      }
      @media (forced-colors: active) {
        :host([selected]) {
          border: 1px solid Highlight;
        }
        :host([disabled]) {
          opacity: 1;
          color: GrayText;
        }
      }
    `,
    toCss(spacingRules("padding", ".inner")),
  ];

  /** Disables pointer and keyboard interaction. */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** Visual selected highlight (`surface-dim` / `surface-container-high` background). */
  @property({ type: Boolean, reflect: true }) selected = false;
  /** Keeps the inner control in the tab order with a focus ring (`focusable="false"` removes both). @default true */
  @property({ reflect: true, converter: defaultTrue }) focusable = true;
  /** Renders the inner control as an `<a>` link when set. */
  @property({ reflect: true }) href?: string;
  @property({ reflect: true }) target?: string;
  @property({ reflect: true }) rel?: string;
  @property({ reflect: true }) download?: string;

  static override get observedAttributes(): string[] {
    return [...super.observedAttributes, "aria-label", "aria-current"];
  }

  override attributeChangedCallback(name: string, old: string | null, value: string | null): void {
    super.attributeChangedCallback(name, old, value);
    if (name === "aria-label" || name === "aria-current") this.requestUpdate();
  }

  private handleClick(e: MouseEvent) {
    if (this.disabled) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }

  protected override render() {
    const cls = ["inner", "state-layer", this.focusable ? "focus-ring" : ""].filter(Boolean).join(" ");
    const label = this.getAttribute("aria-label") || nothing;
    const current = this.getAttribute("aria-current") || nothing;
    const tabindex = this.focusable ? nothing : "-1";

    if (this.href) {
      return html`<a
        part="inner"
        class=${cls}
        href=${ifDefined(this.disabled ? undefined : this.href)}
        target=${ifDefined(this.target)}
        rel=${ifDefined(this.rel ?? (this.target === "_blank" ? "noopener noreferrer" : undefined))}
        download=${ifDefined(this.download)}
        role=${this.disabled ? "link" : nothing}
        aria-disabled=${this.disabled ? "true" : nothing}
        aria-label=${label}
        aria-current=${current}
        tabindex=${this.disabled ? "-1" : tabindex}
        @click=${this.handleClick}
        ><slot></slot
      ></a>`;
    }

    return html`<button
      part="inner"
      class=${cls}
      type="button"
      ?disabled=${this.disabled}
      aria-label=${label}
      aria-current=${current}
      tabindex=${tabindex}
      @click=${this.handleClick}
    >
      <slot></slot>
    </button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-pressable": LustrousPressable;
  }
}
