import { css, html, nothing, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { lustrousBase, lustrousFocusRing, lustrousStateLayer, lustrousType } from "../../theme/theme.js";
import { lustrousChevronStyles } from "../lustrous-chevron-icon/lustrous-chevron-icon.js";

export type LustrousButtonVariant =
  | "primary"
  | "accent"
  | "tonal"
  | "bright"
  | "outline"
  | "on-surface"
  | "on-surface-variant"
  | "translucent";
export type LustrousButtonSize = "m" | "s" | "xs";
export type LustrousButtonShape = "rounded" | "pill";

/** Shared styles for button-like elements (`lustrous-button`, `lustrous-icon-button`, togglable buttons). */
export const lustrousButtonStyles = [
  lustrousBase,
  lustrousFocusRing,
  lustrousStateLayer,
  css`
    :host {
      display: inline-flex;
      vertical-align: middle;
    }
    .btn {
      all: unset;
      box-sizing: border-box;
      position: relative;
      isolation: isolate;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--lustrous-space-s);
      width: 100%;
      border-radius: var(--lustrous-radius-m);
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
      text-decoration: none;
      transition:
        border-radius 180ms ease,
        box-shadow 180ms ease,
        background-color 180ms ease,
        border-color 180ms ease,
        color 180ms ease;
      ${lustrousType("body-medium-emphasized")}
    }
    .shape-pill {
      border-radius: var(--lustrous-radius-full);
    }

    .variant-primary {
      --lustrous-text-muted: color-mix(in srgb, var(--lustrous-color-on-primary) 80%, transparent);
      background-color: var(--lustrous-color-primary);
      color: var(--lustrous-color-on-primary);
    }
    .variant-primary.focus-ring:focus-visible {
      outline-color: var(--lustrous-color-on-surface);
    }
    .variant-accent {
      --lustrous-text-muted: var(--lustrous-color-on-accent);
      background-color: var(--lustrous-color-accent);
      color: var(--lustrous-color-on-accent);
    }
    .variant-tonal {
      --lustrous-text-muted: var(--lustrous-color-on-surface-variant);
      background-color: var(--lustrous-color-surface-container-high);
      color: var(--lustrous-color-on-surface);
    }
    .variant-outline {
      --lustrous-text-muted: var(--lustrous-color-on-surface-variant);
      background-color: transparent;
      border: 1px solid var(--lustrous-color-outline);
      color: var(--lustrous-color-on-surface);
    }
    .variant-bright {
      --lustrous-text-muted: var(--lustrous-color-on-surface-variant);
      background-color: var(--lustrous-color-surface-bright);
      color: var(--lustrous-color-on-surface);
      box-shadow: var(--lustrous-elevation-level1);
    }
    .variant-on-surface {
      background-color: transparent;
      color: inherit;
    }
    .variant-on-surface-variant {
      background-color: transparent;
      color: var(--lustrous-color-on-surface-variant);
    }
    .variant-translucent {
      --lustrous-text-muted: var(--lustrous-color-on-surface-variant);
      background-color: color-mix(in srgb, var(--lustrous-color-surface) 65%, transparent);
      color: var(--lustrous-color-on-surface);
      backdrop-filter: blur(32px);
    }

    .btn.selected {
      background-color: var(--lustrous-color-accent-container);
      color: var(--lustrous-color-on-accent-container);
    }

    .btn.muted:not(.disabled) {
      color: var(--lustrous-text-muted);
    }

    .btn.disabled {
      --lustrous-text-muted: var(--lustrous-color-state-disabled-label);
      cursor: default;
      pointer-events: none;
      color: var(--lustrous-color-state-disabled-label);
      box-shadow: none;
    }
    .btn.disabled.variant-primary,
    .btn.disabled.variant-accent,
    .btn.disabled.variant-tonal,
    .btn.disabled.variant-bright,
    .btn.disabled.selected {
      background-color: var(--lustrous-color-state-disabled);
    }
    .btn.disabled.variant-outline {
      border-color: var(--lustrous-color-state-disabled);
    }

    @media (forced-colors: active) {
      .btn::before {
        content: "";
        position: absolute;
        inset: 0;
        border: 1px solid currentColor;
        border-radius: inherit;
        pointer-events: none;
      }
      .btn.selected {
        background-color: Highlight;
        color: HighlightText;
      }
      .btn.selected::before {
        border-color: Highlight;
      }
      .btn.disabled,
      .btn.disabled.selected {
        background-color: Canvas;
        color: GrayText;
      }
      .btn.disabled::before {
        border-color: GrayText;
      }
    }
  `,
  lustrousChevronStyles,
];

const FORWARDED_ARIA = ["aria-label", "aria-expanded", "aria-haspopup"] as const;

/**
 * Base class for `lustrous-button`, `lustrous-icon-button`, and togglable variants:
 * form association (`type="submit" | "reset"`), link mode (`href`), ARIA forwarding, and focus delegation.
 */
export class LustrousButtonBase extends LustrousElement {
  static formAssociated = true;
  static override shadowRootOptions: ShadowRootInit = { ...LustrousElement.shadowRootOptions, delegatesFocus: true };

  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ reflect: true }) type: "button" | "submit" | "reset" = "button";
  @property({ reflect: true }) name?: string;
  @property({ reflect: true }) value?: string;
  @property({ reflect: true }) href?: string;
  @property({ reflect: true }) target?: string;
  @property({ reflect: true }) rel?: string;
  @property({ reflect: true }) download?: string;
  @property({
    reflect: true,
    converter: {
      fromAttribute: (v: string | null) => (v === null ? undefined : v !== "false"),
      toAttribute: (v: boolean | undefined) => (v === undefined ? null : v ? "" : "false"),
    },
  })
  expanded?: boolean;

  protected readonly internals: ElementInternals | undefined =
    typeof this.attachInternals === "function" ? this.attachInternals() : undefined;

  static override get observedAttributes(): string[] {
    return [...super.observedAttributes, ...FORWARDED_ARIA];
  }

  override attributeChangedCallback(name: string, old: string | null, value: string | null): void {
    super.attributeChangedCallback(name, old, value);
    if ((FORWARDED_ARIA as readonly string[]).includes(name)) this.requestUpdate();
  }

  protected get label(): string | null {
    return this.getAttribute("aria-label");
  }

  get form(): HTMLFormElement | null {
    return this.internals?.form ?? null;
  }

  protected activate(_e: MouseEvent): void {
    const form = this.form;
    if (!form || this.href) return;
    if (this.type === "submit") {
      if (this.name) this.internals?.setFormValue(this.value ?? "");
      form.requestSubmit();
    } else if (this.type === "reset") {
      form.reset();
    }
  }

  private handleClick(e: MouseEvent) {
    if (this.disabled) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }
    this.activate(e);
  }

  protected buttonAriaPressed(): string | undefined {
    return undefined;
  }

  protected renderControl(classes: string, content: TemplateResult): TemplateResult {
    const cls = `btn focus-ring state-layer ${classes} ${this.disabled ? "disabled" : ""}`;
    if (this.href) {
      return html`<a
        part="button"
        class=${cls}
        href=${ifDefined(this.disabled ? undefined : this.href)}
        target=${ifDefined(this.target)}
        rel=${ifDefined(this.rel ?? (this.target === "_blank" ? "noopener noreferrer" : undefined))}
        download=${ifDefined(this.download)}
        role=${this.disabled ? "link" : nothing}
        aria-disabled=${this.disabled ? "true" : nothing}
        aria-label=${this.label || nothing}
        tabindex=${this.disabled ? "-1" : nothing}
        @click=${this.handleClick}
        >${content}</a
      >`;
    }
    return html`<button
      part="button"
      class=${cls}
      type="button"
      ?disabled=${this.disabled}
      aria-label=${this.label || nothing}
      aria-pressed=${ifDefined(this.buttonAriaPressed())}
      aria-expanded=${ifDefined(
        this.expanded !== undefined ? String(this.expanded) : (this.getAttribute("aria-expanded") ?? undefined),
      )}
      aria-haspopup=${ifDefined(this.getAttribute("aria-haspopup") ?? undefined)}
      @click=${this.handleClick}
    >
      ${content}
    </button>`;
  }
}
