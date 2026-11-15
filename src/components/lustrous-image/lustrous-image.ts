import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { attrRules, toCss } from "../../internal/style-gen.js";
import { LustrousBox, lustrousBoxStyles } from "../lustrous-box/lustrous-box.js";

export type LustrousImageObjectFit = "contain" | "cover" | "fill" | "none" | "scale-down";
export type LustrousImageAspectRatio = "1/1" | "16/9" | "4/3" | "3/2" | "21/9" | "9/16" | "3/4";

/**
 * `<lustrous-image>` — Responsive image container extending `<lustrous-box>`.
 *
 * Reserves layout dimensions with `aspect-ratio`, crops or letterboxes with `object-fit`,
 * and clips corners via `border-radius` inherited from `LustrousBox`.
 *
 * @fires load - Re-dispatched when the inner `<img>` finishes loading.
 * @fires error - Re-dispatched when the inner `<img>` fails to load.
 * @csspart img - The native `<img>` element.
 */
@customElement("lustrous-image")
export class LustrousImage extends LustrousBox {
  static override styles = [
    ...lustrousBoxStyles,
    css`
      :host {
        overflow: hidden;
      }
      img {
        display: block;
        width: 100%;
        height: 100%;
        border-radius: inherit;
      }
      :host([aspect-ratio]) img {
        height: auto;
        aspect-ratio: inherit;
      }
    `,
    toCss(
      attrRules("aspect-ratio", {
        "1/1": "aspect-ratio: 1 / 1;",
        "16/9": "aspect-ratio: 16 / 9;",
        "4/3": "aspect-ratio: 4 / 3;",
        "3/2": "aspect-ratio: 3 / 2;",
        "21/9": "aspect-ratio: 21 / 9;",
        "9/16": "aspect-ratio: 9 / 16;",
        "3/4": "aspect-ratio: 3 / 4;",
      }),
      attrRules(
        "object-fit",
        Object.fromEntries(["contain", "cover", "fill", "none", "scale-down"].map((v) => [v, `object-fit: ${v};`])),
        "img",
      ),
      `:host([object-fit]) img { height: 100%; }`,
    ),
  ];

  /** Image URL. */
  @property() src = "";
  /** Accessible description; required unless `decorative` is set. */
  @property() alt = "";
  /** Marks the image purely decorative (`alt=""` and `aria-hidden="true"`). */
  @property({ type: Boolean, reflect: true }) decorative = false;
  /** CSS `object-fit` mode. */
  @property({ reflect: true, attribute: "object-fit" }) objectFit?: LustrousImageObjectFit;
  /** Intrinsic aspect ratio preset to reserve layout space before load. */
  @property({ reflect: true, attribute: "aspect-ratio" }) aspectRatio?: LustrousImageAspectRatio;
  /** Native browser loading hint (`lazy` or `eager`). */
  @property({ reflect: true }) loading?: "lazy" | "eager";
  /** Image decoding hint. @default "async" */
  @property() decoding: "async" | "sync" | "auto" = "async";
  /** Referrer policy forwarded to `<img>`. @default "no-referrer" */
  @property({ attribute: "referrerpolicy" }) referrerPolicy: ReferrerPolicy = "no-referrer";
  @property({ type: Boolean, attribute: "draggable" }) imgDraggable?: boolean;
  @property() srcset?: string;
  @property() sizes?: string;

  private relay(e: Event) {
    this.dispatchEvent(new Event(e.type));
  }

  protected override render() {
    return html`<img
      part="img"
      src=${this.src}
      alt=${this.decorative ? "" : this.alt}
      aria-hidden=${this.decorative ? "true" : nothing}
      loading=${ifDefined(this.loading)}
      decoding=${this.decoding}
      referrerpolicy=${this.referrerPolicy}
      srcset=${ifDefined(this.srcset)}
      sizes=${ifDefined(this.sizes)}
      draggable=${ifDefined(this.imgDraggable === undefined ? undefined : String(this.imgDraggable))}
      @load=${this.relay}
      @error=${this.relay}
    />`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-image": LustrousImage;
  }
}
