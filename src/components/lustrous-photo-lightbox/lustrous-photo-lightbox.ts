import { html, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LustrousLightboxBase, type LustrousLightboxNavigation } from "../lustrous-lightbox/lightbox-base.js";
export type { LustrousLightboxNavigation };

/**
 * `<lustrous-photo-lightbox>` — Full-screen immersive image lightbox built on `LustrousLightboxBase`.
 *
 * Displays an image fitted to the viewport over a blurred ambient backdrop with dark chrome,
 * loading skeleton, missing-media fallback, optional `slot="trigger"` opener, and `slot="actions"` bar.
 *
 * @slot - Optional custom stage content when `src` is omitted.
 * @slot trigger - Optional trigger element that opens the lightbox on click.
 * @slot actions - Optional contextual controls below the stage (e.g. `<lustrous-action-bar>`).
 * @fires load - Fired once the image finishes loading.
 * @fires error - Fired if the image fails to load.
 * @fires lustrous-close-request - `CustomEvent<{ reason: "escape" | "scrim" | "dismiss" }>` (cancelable).
 * @fires lustrous-toggle - `CustomEvent<{ open: boolean }>`.
 * @csspart stage - The media stage container.
 * @csspart actions - The actions slot wrapper.
 */
@customElement("lustrous-photo-lightbox")
export class LustrousPhotoLightbox extends LustrousLightboxBase {
  /** Full-resolution image URL. */
  @property() src = "";
  /** Optional custom ambient backdrop URL (defaults to `src` once loaded). */
  @property({ attribute: "ambient-src" }) ambientSrcProp?: string;
  /** Forces the loading skeleton when rendering custom slotted stage media. */
  @property({ type: Boolean }) loading = false;

  @state() private hasCustomMedia = false;

  protected override defaultHeading(): string {
    return "Image preview";
  }

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (changed.has("src")) {
      this.loaded = false;
      this.failed = false;
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.children) {
      this.hasCustomMedia = [...this.children].some((el) => !el.hasAttribute("slot"));
    }
  }

  private onDefaultSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    this.hasCustomMedia = slot.assignedElements().length > 0;
  };

  protected override get isLoading(): boolean {
    return this.loading || (!!this.src && !this.loaded && !this.failed);
  }

  protected override get ambientSrc(): string | undefined {
    if (this.hasCustomMedia) {
      return !this.loading ? (this.ambientSrcProp ?? (this.src || undefined)) : undefined;
    }
    return this.ambientSrcProp ?? (this.loaded && !this.failed ? this.src : undefined);
  }

  protected override renderMedia() {
    if (!this.src) {
      if (this.hasCustomMedia) {
        return html`<slot @slotchange=${this.onDefaultSlotChange}></slot>`;
      }
      return nothing;
    }
    if (this.failed) return nothing;
    return html`<img
      class=${this.loaded ? "" : "hidden"}
      src=${this.src}
      alt=${this.label}
      decoding="async"
      referrerpolicy="no-referrer"
      @load=${() => this.markLoaded()}
      @error=${() => {
        this.failed = true;
        this.dispatchEvent(new Event("error"));
      }}
    />`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-photo-lightbox": LustrousPhotoLightbox;
  }
}
