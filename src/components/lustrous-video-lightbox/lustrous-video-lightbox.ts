import { html, nothing, type PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { LustrousLightboxBase } from "../lustrous-lightbox/lightbox-base.js";

/**
 * `<lustrous-video-lightbox>` — Full-screen immersive video player lightbox built on `LustrousLightboxBase`.
 *
 * Renders a native `<video controls playsinline>` over a dark immersive backdrop with optional `poster`,
 * WebVTT `captions-src` track, `autoplay` when opened, and automatic `pause()` on close.
 *
 * @slot trigger - Optional trigger element that opens the lightbox on click.
 * @slot actions - Optional contextual controls below the stage (e.g. `<lustrous-action-bar>`).
 * @fires load - Fired once the first video frame is ready (`loadeddata`).
 * @fires error - Fired if video playback/loading fails.
 * @fires lustrous-close-request - `CustomEvent<{ reason: "escape" | "scrim" | "dismiss" }>` (cancelable).
 * @fires lustrous-toggle - `CustomEvent<{ open: boolean }>`.
 * @csspart stage - The media stage container.
 * @csspart actions - The actions slot wrapper.
 */
@customElement("lustrous-video-lightbox")
export class LustrousVideoLightbox extends LustrousLightboxBase {
  /** Video stream or file URL. */
  @property() src = "";
  /** Poster image displayed prior to playback and blurred as the ambient backdrop. */
  @property() poster?: string;
  /** Optional WebVTT captions URL (`<track kind="captions">`). */
  @property({ attribute: "captions-src" }) captionsSrc?: string;
  /** Accessible track label when `captions-src` is provided. @default "Captions" */
  @property({ attribute: "captions-label" }) captionsLabel = "Captions";
  /** BCP-47 language code for `captions-src`. @default "en" */
  @property({ attribute: "captions-srclang" }) captionsSrclang = "en";
  /** Starts playback automatically when opened (`autoplay="false"` disables). @default true */
  @property({
    converter: {
      fromAttribute: (v: string | null) => v !== "false",
      toAttribute: (v: boolean) => (v ? null : "false"),
    },
  })
  autoplay = true;

  @query("video") private video?: HTMLVideoElement;

  /** Reference to the inner `<video>` element when rendered. */
  get videoElement(): HTMLVideoElement | undefined {
    return this.video ?? undefined;
  }

  protected override defaultHeading(): string {
    return "Video preview";
  }

  override disconnectedCallback(): void {
    this.video?.pause();
    super.disconnectedCallback();
  }

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (changed.has("src")) {
      this.loaded = false;
      this.failed = false;
    }
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    if (changed.has("open")) {
      const v = this.video;
      if (!v) return;
      if (!this.open) v.pause();
      else if (this.autoplay) void v.play().catch(() => {});
    }
  }

  protected override get isLoading(): boolean {
    return !this.poster && !this.loaded && !this.failed && !!this.src;
  }

  protected override get ambientSrc(): string | undefined {
    return this.failed ? undefined : this.poster;
  }

  protected override renderMedia() {
    if (!this.src || this.failed) return nothing;
    return html`<video
      class=${this.loaded || this.poster ? "" : "hidden"}
      src=${this.src}
      poster=${ifDefined(this.poster)}
      aria-label=${this.label}
      controls
      playsinline
      preload="metadata"
      @loadeddata=${() => this.markLoaded()}
      @error=${() => {
        this.failed = true;
        this.dispatchEvent(new Event("error"));
      }}
    >
      ${this.captionsSrc
        ? html`<track
            kind="captions"
            src=${this.captionsSrc}
            srclang=${this.captionsSrclang}
            label=${this.captionsLabel}
            default
          />`
        : nothing}
    </video>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-video-lightbox": LustrousVideoLightbox;
  }
}
