import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { lustrousBase, lustrousFocusRing } from "../../theme/theme.js";
import { renderIcon } from "../lustrous-icon/lustrous-icon.js";

export type LustrousLinkVariant = "primary" | "default" | "muted";
export type LustrousLinkUnderline = "always" | "hover" | "none";

/**
 * `<lustrous-link>` — Inline text link or link-styled action button.
 *
 * Renders an inline `<a>` when `href` is set, or an inline `<button type="button">` when `href` is omitted.
 * Inherits surrounding typography while providing semantic color variants, underline modes, disabled states,
 * an optional trailing `external` glyph, and the Lustrous focus ring.
 *
 * @slot - Link label text.
 * @csspart link - The native `<a>` or `<button>` element.
 * @csspart external-icon - Optional trailing external indicator wrapper.
 */
@customElement("lustrous-link")
export class LustrousLink extends LustrousElement {
  static override shadowRootOptions: ShadowRootInit = { ...LustrousElement.shadowRootOptions, delegatesFocus: true };

  static override styles = [
    lustrousBase,
    css`
      :host {
        display: inline;
      }
      .link {
        all: unset;
        box-sizing: border-box;
        display: inline;
        font: inherit;
        font-variation-settings: inherit;
        color: var(--lustrous-color-primary);
        cursor: pointer;
        border-radius: var(--lustrous-radius-xs);
        text-underline-offset: 0.22em;
        text-decoration-thickness: 0.08em;
        transition: color var(--lustrous-duration-short150) var(--lustrous-easing-linear);
      }
      :host([variant="primary"]) .link {
        color: var(--lustrous-color-primary);
      }
      :host([variant="default"]) .link {
        color: var(--lustrous-color-on-surface);
      }
      :host([variant="muted"]) .link {
        color: var(--lustrous-color-on-surface-variant);
      }
      :host([variant="muted"]) .link:hover:not(.disabled) {
        color: var(--lustrous-color-on-surface);
      }

      :host([underline="always"]) .link,
      :host(:not([underline])) .link {
        text-decoration-line: underline;
      }
      :host([underline="hover"]) .link {
        text-decoration-line: none;
      }
      :host([underline="hover"]) .link:hover:not(.disabled),
      :host([underline="hover"]) .link:focus-visible {
        text-decoration-line: underline;
      }
      :host([underline="none"]) .link {
        text-decoration-line: none;
      }

      :host([disabled]) .link,
      .link.disabled {
        color: var(--lustrous-color-state-disabled-label);
        cursor: default;
        pointer-events: none;
        text-decoration-line: none;
      }

      .external-icon {
        display: inline-flex;
        margin-inline-start: 0.2em;
        vertical-align: -0.12em;
      }
      .external-icon svg.lustrous-icon {
        vertical-align: 0;
      }

      @media (forced-colors: active) {
        .link {
          color: LinkText;
        }
        :host([disabled]) .link,
        .link.disabled {
          color: GrayText;
        }
      }
    `,
    lustrousFocusRing,
  ];

  /** Destination URL. When omitted, renders a `<button type="button">`. */
  @property({ reflect: true }) href?: string;
  @property({ reflect: true }) target?: string;
  @property({ reflect: true }) rel?: string;
  @property({ reflect: true }) download?: string;
  /** Color treatment. @default "primary" */
  @property({ reflect: true }) variant: LustrousLinkVariant = "primary";
  /** Text underline behavior. @default "always" */
  @property({ reflect: true }) underline: LustrousLinkUnderline = "always";
  /** Disables navigation and click activation. @default false */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** Appends a trailing external-link indicator icon. @default false */
  @property({ type: Boolean, reflect: true }) external = false;

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
    const cls = ["link", "focus-ring", this.disabled ? "disabled" : ""].filter(Boolean).join(" ");
    const label = this.getAttribute("aria-label") || nothing;
    const content = html`<slot></slot>${this.external
      ? html`<span part="external-icon" class="external-icon">${renderIcon("arrowOutward", 14)}</span>`
      : nothing}`;

    if (this.href !== undefined) {
      return html`<a
        part="link"
        class=${cls}
        href=${ifDefined(this.disabled ? undefined : this.href)}
        target=${ifDefined(this.target)}
        rel=${ifDefined(this.rel ?? (this.target === "_blank" ? "noopener noreferrer" : undefined))}
        download=${ifDefined(this.download)}
        role=${this.disabled ? "link" : nothing}
        aria-disabled=${this.disabled ? "true" : nothing}
        aria-label=${label}
        aria-current=${this.getAttribute("aria-current") || nothing}
        tabindex=${this.disabled ? "-1" : nothing}
        @click=${this.handleClick}
        >${content}</a
      >`;
    }

    return html`<button
      part="link"
      class=${cls}
      type="button"
      ?disabled=${this.disabled}
      aria-label=${label}
      @click=${this.handleClick}
    >
      ${content}
    </button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-link": LustrousLink;
  }
}
