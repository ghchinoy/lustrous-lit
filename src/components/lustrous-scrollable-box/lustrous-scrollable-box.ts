import { css, html, nothing, type PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { keywordRules, spacingRules, toCss } from "../../internal/style-gen.js";
import { LustrousBox, lustrousBoxStyles } from "../lustrous-box/lustrous-box.js";

export type LustrousScrollableBoxScrim = "both" | "start" | "end" | "none";
export type LustrousScrollbarVisibility = "hover" | "always" | "hidden";

const SCRIM = "36px";
const fadeY = (start: boolean, end: boolean) =>
  `linear-gradient(to bottom, ${start ? `transparent 0, black min(${SCRIM}, var(--_ys, 0px))` : "black 0"}, ${
    end ? `black calc(100% - min(${SCRIM}, var(--_ye, 0px))), transparent 100%` : "black 100%"
  })`;
const fadeX = (start: boolean, end: boolean) =>
  `linear-gradient(to var(--_x-dir, right), ${start ? `transparent 0, black min(${SCRIM}, var(--_xs, 0px))` : "black 0"}, ${
    end ? `black calc(100% - min(${SCRIM}, var(--_xe, 0px))), transparent 100%` : "black 100%"
  })`;

const OVERFLOW = ["auto", "hidden", "scroll", "visible"] as const;

/**
 * `<lustrous-scrollable-box>` — Scroll container with thin scrollbars, edge scrim fades,
 * and automatic keyboard `tabindex="0"` when overflowing.
 *
 * @slot - Scrollable content.
 * @csspart viewport - The scrolling element.
 * @csspart content - The padded flex-column content wrapper.
 */
@customElement("lustrous-scrollable-box")
export class LustrousScrollableBox extends LustrousBox {
  static override styles = [
    ...lustrousBoxStyles,
    css`
      :host {
        display: flex !important;
        flex-direction: column;
        overflow: hidden !important;
        padding: 0 !important;
        min-height: 0;
      }
      .viewport {
        flex: 1 1 auto;
        min-height: 0;
        width: 100%;
        overflow-x: hidden;
        overflow-y: auto;
        overscroll-behavior: contain;
        outline: none;
        scrollbar-width: thin;
        scrollbar-color: transparent transparent;
        transition: scrollbar-color 150ms ease-in-out;
        border-radius: inherit;
      }
      .viewport:focus-visible {
        outline: 2.5px solid var(--lustrous-color-on-surface);
        outline-offset: -2.5px;
      }
      :host(:hover) .viewport,
      .viewport:focus-within,
      :host([scrollbar="always"]) .viewport {
        scrollbar-color: var(--lustrous-color-surface-container-highest) transparent;
      }
      .viewport:active {
        scrollbar-color: var(--lustrous-color-outline) transparent;
      }
      :host([scrollbar="hidden"]) .viewport {
        scrollbar-width: none;
      }
      :host([scrollbar="hidden"]) .viewport::-webkit-scrollbar {
        display: none;
      }
      .content {
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        min-height: 100%;
        width: 100%;
      }
      :host([overflow-x="auto"]) .content,
      :host([overflow-x="scroll"]) .content,
      :host([overflow="auto"]) .content,
      :host([overflow="scroll"]) .content,
      .scroll-x .content {
        min-width: fit-content;
      }
      :host(:dir(rtl)) .viewport {
        --_x-dir: left;
      }
      @media (forced-colors: active) {
        .viewport {
          scrollbar-color: auto;
        }
      }
    `,
    toCss(
      keywordRules("overflow", "overflow", OVERFLOW).replaceAll(") {", ") .viewport {"),
      keywordRules("overflow-x", "overflow-x", OVERFLOW).replaceAll(") {", ") .viewport {"),
      keywordRules("overflow-y", "overflow-y", OVERFLOW).replaceAll(") {", ") .viewport {"),
      spacingRules("padding", ".content"),
      `.viewport.scrim-y-both { mask-image: ${fadeY(true, true)}; }
       .viewport.scrim-y-start { mask-image: ${fadeY(true, false)}; }
       .viewport.scrim-y-end { mask-image: ${fadeY(false, true)}; }
       .viewport.scrim-x-both { mask-image: ${fadeX(true, true)}; }
       .viewport.scrim-x-start { mask-image: ${fadeX(true, false)}; }
       .viewport.scrim-x-end { mask-image: ${fadeX(false, true)}; }
       .viewport.scrim-xy-both { mask-image: ${fadeY(true, true)}, ${fadeX(true, true)}; mask-composite: intersect; }
       .viewport.scrim-xy-start { mask-image: ${fadeY(true, false)}, ${fadeX(true, false)}; mask-composite: intersect; }
       .viewport.scrim-xy-end { mask-image: ${fadeY(false, true)}, ${fadeX(false, true)}; mask-composite: intersect; }`,
    ),
  ];

  @property({ reflect: true }) scrim: LustrousScrollableBoxScrim | "true" | "false" = "both";
  @property({ reflect: true }) scrollbar: LustrousScrollbarVisibility = "hover";
  @property({ type: Boolean, reflect: true }) compact = false;
  @property() label = "";

  @query(".viewport") private viewport!: HTMLDivElement;
  @state() private canScrollX = false;
  @state() private canScrollY = false;
  private ro?: ResizeObserver;

  get scrollElement(): HTMLElement {
    return this.viewport;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.ro?.disconnect();
  }

  protected override firstUpdated(changed: PropertyValues): void {
    super.firstUpdated(changed);
    this.ro = new ResizeObserver(() => this.measure());
    this.ro.observe(this.viewport);
    this.ro.observe(this.renderRoot.querySelector(".content")!);
    this.measure();
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    if (changed.has("overflow") || changed.has("overflowX") || changed.has("overflowY")) this.measure();
  }

  private onScroll() {
    this.measure();
    this.dispatchEvent(new Event("scroll"));
  }

  private measure() {
    const v = this.viewport;
    if (!v) return;
    const style = getComputedStyle(v);
    const scrollsY = style.overflowY === "auto" || style.overflowY === "scroll";
    const scrollsX = style.overflowX === "auto" || style.overflowX === "scroll";
    const maxY = v.scrollHeight - v.clientHeight;
    const maxX = v.scrollWidth - v.clientWidth;
    this.canScrollY = scrollsY && maxY > 1;
    this.canScrollX = scrollsX && maxX > 1;
    const x = Math.abs(v.scrollLeft);
    v.style.setProperty("--_ys", `${Math.max(0, v.scrollTop)}px`);
    v.style.setProperty("--_ye", `${Math.max(0, maxY - v.scrollTop)}px`);
    v.style.setProperty("--_xs", `${x}px`);
    v.style.setProperty("--_xe", `${Math.max(0, maxX - x)}px`);
  }

  private get scrimMode(): LustrousScrollableBoxScrim {
    if (this.scrim === "true") return "both";
    if (this.scrim === "false") return "none";
    return this.scrim;
  }

  protected override render() {
    const mode = this.scrimMode;
    const axes = `${this.canScrollX ? "x" : ""}${this.canScrollY ? "y" : ""}`;
    const scrimClass = mode !== "none" && axes ? `scrim-${axes}-${mode}` : "";
    const named = !!this.label;
    return html`<div
      part="viewport"
      class="viewport ${scrimClass} ${this.canScrollX ? "scroll-x" : ""}"
      role=${named ? "region" : nothing}
      aria-label=${named ? this.label : nothing}
      tabindex=${this.canScrollX || this.canScrollY ? "0" : nothing}
      @scroll=${this.onScroll}
    >
      <div part="content" class="content"><slot></slot></div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-scrollable-box": LustrousScrollableBox;
  }
}
