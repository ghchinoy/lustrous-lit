import { css, html, nothing, unsafeCSS, type PropertyValues, type TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import { getLustrousLabels } from "../../theme/labels.js";
import { lustrousDarkDeclarations } from "../../theme/theme.js";
import { renderIcon } from "../lustrous-icon/lustrous-icon.js";
import "../lustrous-icon-button/lustrous-icon-button.js";
import { LustrousModal } from "../lustrous-modal/lustrous-modal.js";
import "../lustrous-skeleton/lustrous-skeleton.js";

const MAX_STAGE_HEIGHT = "calc(100vh - 180px)";
const PLACEHOLDER_SIZE = `min(${MAX_STAGE_HEIGHT}, calc(100vw - 128px))`;

/**
 * Shared full-screen media frame for `<lustrous-photo-lightbox>` and `<lustrous-video-lightbox>`.
 *
 * Extends `<lustrous-modal>` with `scrim="immersive"`, `scrim-blur`, forced dark chrome,
 * an ambient blurred backdrop image, a stage area with loading skeleton and missing-media
 * fallback, a `slot="actions"` bar below the stage, and a back/close icon button.
 */
export class LustrousLightboxBase extends LustrousModal {
  static override styles = [
    ...[LustrousModal.styles].flat(),
    css`
      dialog {
        ${lustrousDarkDeclarations}
        color: var(--lustrous-color-on-surface);
        --lustrous-text-muted: var(--lustrous-color-on-surface-variant);
        font-family: var(--lustrous-font-body);
      }
      .ambient {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        object-fit: cover;
        filter: blur(96px) saturate(2) brightness(0.45);
        transform: scale(1.4);
        opacity: 0.65;
        pointer-events: none;
      }
      .viewport {
        position: relative;
        flex-direction: column;
        gap: var(--lustrous-space-m);
        padding: var(--lustrous-space-3xl);
      }
      .stage {
        pointer-events: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        max-width: 100%;
        max-height: ${unsafeCSS(MAX_STAGE_HEIGHT)};
      }
      .stage > img,
      .stage > video {
        display: block;
        max-width: 100%;
        max-height: ${unsafeCSS(MAX_STAGE_HEIGHT)};
        border-radius: var(--lustrous-radius-m);
        object-fit: contain;
      }
      .stage > .hidden {
        display: none;
      }
      .loading {
        width: ${unsafeCSS(PLACEHOLDER_SIZE)};
        height: ${unsafeCSS(PLACEHOLDER_SIZE)};
        max-width: 100%;
        max-height: 100%;
        aspect-ratio: 1 / 1;
        overflow: hidden;
      }
      .loading lustrous-skeleton {
        width: 100%;
        height: 100%;
      }
      .missing {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 320px;
        height: 320px;
        max-width: 100%;
        border-radius: var(--lustrous-radius-m);
        background-color: var(--lustrous-color-surface-dim);
        color: var(--lustrous-color-on-surface-variant);
      }
      .actions {
        pointer-events: auto;
      }
      .back {
        position: absolute;
        top: var(--lustrous-space-m);
        inset-inline-start: var(--lustrous-space-3xl);
        pointer-events: auto;
      }
      @media (max-width: 768px) {
        .back {
          inset-inline-start: var(--lustrous-space-m);
        }
      }
      @media (forced-colors: active) {
        .missing {
          border: 1px solid CanvasText;
        }
      }
    `,
  ];

  /** Accessible title of the lightbox dialog and media element. */
  @property() heading = "";
  /** Accessible label for the close button (defaults to `getLustrousLabels().close`). */
  @property({ attribute: "close-label" }) closeLabel = "";

  @state() protected loaded = false;
  @state() protected failed = false;

  constructor() {
    super();
    this.scrim = "immersive";
    this.scrimBlur = true;
  }

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (changed.has("heading") || !this.label) {
      this.label = this.heading || this.defaultHeading();
    }
  }

  protected defaultHeading(): string {
    return "Media preview";
  }

  protected markLoaded(): void {
    if (this.loaded) return;
    this.loaded = true;
    this.dispatchEvent(new Event("load"));
  }

  protected renderMedia(): TemplateResult | typeof nothing {
    return nothing;
  }

  protected get isLoading(): boolean {
    return false;
  }

  protected get ambientSrc(): string | undefined {
    return undefined;
  }

  protected override render() {
    const media = this.renderMedia();
    const ambient = this.ambientSrc;
    return html`<slot name="trigger" @slotchange=${this.onTriggerSlotChange}></slot>
      <dialog
        aria-modal="true"
        data-lustrous-shortcut-scope=""
        part="dialog"
        tabindex="-1"
        aria-label=${this.label || nothing}
        @cancel=${this.onCancel}
        @close=${this.onNativeClose}
        @pointerdown=${this.onPointerDown}
        @click=${this.onClick}
      >
        ${ambient ? html`<img class="ambient" src=${ambient} alt="" aria-hidden="true" referrerpolicy="no-referrer" />` : nothing}
        <div part="viewport" class="viewport">
          <div part="stage" class="stage">
            ${this.isLoading
              ? html`<div class="loading"><lustrous-skeleton shape="rect" border-radius="m"></lustrous-skeleton></div>`
              : nothing}
            ${media === nothing
              ? html`<div class="missing" role="img" aria-label="Media unavailable">${renderIcon("hideImage", "xl")}</div>`
              : media}
          </div>
          <div part="actions" class="actions"><slot name="actions"></slot></div>
        </div>
        <lustrous-icon-button
          class="back"
          variant="tonal"
          icon="arrowBack"
          aria-label=${this.closeLabel || getLustrousLabels().close}
          @click=${() => this.requestClose("dismiss")}
        ></lustrous-icon-button>
      </dialog>`;
  }
}
