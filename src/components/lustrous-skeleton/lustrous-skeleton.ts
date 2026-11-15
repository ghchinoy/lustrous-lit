import { css, html, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { radiusRules, resolveDimension, setHostVar, toCss } from "../../internal/style-gen.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { lustrousBase } from "../../theme/theme.js";
import type { LustrousRadiusToken } from "../../theme/tokens.js";

export type LustrousSkeletonShape = "rect" | "circle" | "text";

/**
 * `<lustrous-skeleton>` — Decorative loading placeholder shimmer (`aria-hidden="true"`).
 *
 * Compose multiple skeletons inside an `aria-busy="true"` container to mirror content geometry
 * before data arrives. Automatically disables shimmer animation under `prefers-reduced-motion: reduce`.
 */
@customElement("lustrous-skeleton")
export class LustrousSkeleton extends LustrousElement {
  static override styles = [
    lustrousBase,
    css`
      :host {
        display: block;
        box-sizing: border-box;
        width: var(--_lustrous-width, 100%);
        height: var(--_lustrous-height, 16px);
        border-radius: var(--lustrous-radius-s);
        background-color: var(--lustrous-color-on-surface-low);
        background-image: linear-gradient(
          90deg,
          transparent 0%,
          color-mix(in srgb, currentColor 8%, transparent) 50%,
          transparent 100%
        );
        background-size: 200% 100%;
        animation: lustrous-skeleton-shimmer 1.5s ease-in-out infinite;
      }
      :host([shape="text"]) {
        border-radius: var(--lustrous-radius-full);
      }
      :host([shape="circle"]) {
        width: var(--_lustrous-width, var(--_lustrous-height, 40px));
        height: var(--_lustrous-height, var(--_lustrous-width, 40px));
        aspect-ratio: 1 / 1;
        border-radius: var(--lustrous-radius-full);
        flex-shrink: 0;
      }
      @keyframes lustrous-skeleton-shimmer {
        from {
          background-position: 200% 0;
        }
        to {
          background-position: -200% 0;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        :host {
          animation: none;
          background-image: none;
        }
      }
      @media (forced-colors: active) {
        :host {
          border: 1px solid ButtonText;
          background-image: none;
        }
      }
    `,
    toCss(radiusRules()),
  ];

  /** Width as a number (`px`), `"full"`, or CSS length. @default "100%" */
  @property({ reflect: true }) width?: string | number;
  /** Height as a number (`px`), `"full"`, or CSS length. @default "16px" */
  @property({ reflect: true }) height?: string | number;
  /** Preset geometry: `rect` (default), `circle`, or `text` (pill line). @default "rect" */
  @property({ reflect: true }) shape: LustrousSkeletonShape = "rect";
  /** Explicit radius token override (`none`, `xs`, `s`, `m`, `l`, `xl`, `2xl`, `full`). */
  @property({ reflect: true, attribute: "border-radius" }) borderRadius?: LustrousRadiusToken;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("aria-hidden", "true");
  }

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (changed.has("width")) setHostVar(this, "--_lustrous-width", resolveDimension(this.width, "x"));
    if (changed.has("height")) setHostVar(this, "--_lustrous-height", resolveDimension(this.height, "y"));
  }

  protected override render() {
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-skeleton": LustrousSkeleton;
  }
}
