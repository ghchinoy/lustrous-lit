import { css, html, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  countProseWords,
  type EstimatedDirection,
  estimateDirectionFromWordCounts,
  estimateProseDirection,
  findTechnicalLtrRanges,
  getDocumentDirection,
  hasStrongLtrText,
  hasStrongRtlText,
  type ProseWordCounts,
  renderIsolatedTechnicalTokens,
  resolveDirection,
  resolveLanguageDirection,
  type TextDirection,
  type TextRange,
} from "../../internal/bidi.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { lustrousBase } from "../../theme/theme.js";
import { LustrousText } from "../lustrous-text/lustrous-text.js";

export {
  countProseWords,
  type EstimatedDirection,
  estimateDirectionFromWordCounts,
  estimateProseDirection,
  findTechnicalLtrRanges,
  getDocumentDirection,
  hasStrongLtrText,
  hasStrongRtlText,
  type ProseWordCounts,
  renderIsolatedTechnicalTokens,
  resolveDirection,
  resolveLanguageDirection,
  type TextDirection,
  type TextRange,
};

const stampedDirElements = new WeakSet<Element>();
const stampedAlignElements = new WeakSet<HTMLElement>();
let scopeStampingTarget: Element | null = null;

function findParentScope(node: Node): LustrousProseDirectionScope | null {
  let curr: Node | null = node.parentNode;
  while (curr) {
    if (curr instanceof HTMLElement && curr.tagName === "LUSTROUS-PROSE-DIRECTION-SCOPE") {
      return curr as LustrousProseDirectionScope;
    }
    if (curr instanceof ShadowRoot) {
      curr = curr.host;
    } else {
      curr = curr.parentNode;
    }
  }
  return null;
}

/**
 * `<lustrous-prose-direction-scope>` — Aggregates descendant `<lustrous-prose-text>` word counts
 * bottom-up and stamps the resolved `dir` (`"ltr"` or `"rtl"`) onto its container child for
 * multilingual lists, tables, and editorial layouts.
 *
 * ```html
 * <lustrous-prose-direction-scope align-start>
 *   <ul>
 *     <li><lustrous-prose-text block>פיתוח ב-C++ ושימוש ב-foo() במערכות הפצה.</lustrous-prose-text></li>
 *     <li><lustrous-prose-text block>PostgreSQL 17</lustrous-prose-text></li>
 *   </ul>
 * </lustrous-prose-direction-scope>
 * ```
 *
 * @slot - Single container element (e.g. `<ul>`, `<table>`, `<lustrous-box>`) receiving `dir`.
 */
@customElement("lustrous-prose-direction-scope")
export class LustrousProseDirectionScope extends LustrousElement {
  static override styles = [
    lustrousBase,
    css`
      :host {
        display: contents;
      }
    `,
  ];

  /**
   * Keeps descendant prose blocks aligned to the horizontal start edge of marker- or
   * column-aligned containers (lists, tables, timelines) even when an individual item
   * resolves the opposite `dir`.
   */
  @property({ type: Boolean, reflect: true, attribute: "align-start" }) alignStart = false;

  /**
   * Aligns composite inline-paragraph scopes inside an `align-start` container with
   * the enclosing list or table scope when their resolved directions differ.
   */
  @property({ type: Boolean, reflect: true, attribute: "align-with-parent" }) alignWithParent = false;

  /**
   * Fallback direction before any strong prose words are reported.
   * Defaults to the nearest ancestor `<lustrous-prose-direction-scope>` and then `<html dir>`.
   */
  @property({ reflect: true, attribute: "fallback-dir" }) fallbackDir?: TextDirection;

  private rtlTotal = 0;
  private ltrTotal = 0;
  private parentScope: LustrousProseDirectionScope | null = null;
  private parentUnregister?: () => void;
  private parentUnsubscribe?: () => void;
  private readonly subscribers = new Set<() => void>();
  private lastNotifiedEffectiveDir?: TextDirection;
  private lastNotifiedAlignedDir?: TextDirection | null;
  hasConnected = false;

  /** Estimated direction from aggregated descendant prose words (`"ltr" | "rtl" | "neutral"`). */
  get estimatedDir(): EstimatedDirection {
    return estimateDirectionFromWordCounts(this.rtlTotal, this.ltrTotal);
  }

  /** Effective fallback direction from `fallback-dir`, ancestor scope, or `<html dir>`. */
  get effectiveFallback(): TextDirection {
    if (this.fallbackDir === "ltr" || this.fallbackDir === "rtl") {
      return this.fallbackDir;
    }
    return this.parentScope?.effectiveDir ?? getDocumentDirection();
  }

  /** Concrete resolved direction (`"ltr" | "rtl"`). */
  get resolvedDir(): TextDirection {
    return resolveDirection(this.estimatedDir, this.effectiveFallback);
  }

  /** Effective direction taking into account an explicit `dir` on the container child. */
  get effectiveDir(): TextDirection {
    const explicit = this.getExplicitChildDir();
    return explicit ?? this.resolvedDir;
  }

  /**
   * Alignment direction exposed to descendants when `align-start` is enabled and
   * direction is non-neutral (or explicitly set on the container child).
   */
  get childAlignedDir(): TextDirection | null {
    const explicit = this.getExplicitChildDir();
    if (this.alignStart && (explicit !== undefined || this.estimatedDir !== "neutral")) {
      return this.effectiveDir;
    }
    return null;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.hasConnected = true;
    this.connectParentScope();
    // Reconnect any already-connected descendants that upgraded before this scope.
    for (const el of this.querySelectorAll("lustrous-prose-direction-scope, lustrous-prose-text")) {
      const candidate = el as unknown as { hasConnected?: boolean; reconnectScope?: () => void };
      if (el !== this && candidate.hasConnected && typeof candidate.reconnectScope === "function") {
        candidate.reconnectScope();
      }
    }
    this.syncDirection();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.hasConnected = false;
    this.parentUnregister?.();
    this.parentUnregister = undefined;
    this.parentUnsubscribe?.();
    this.parentUnsubscribe = undefined;
    this.parentScope = null;
  }

  /** Called by ancestor scopes when upgraded after descendants. */
  reconnectScope(): void {
    if (!this.isConnected) return;
    this.connectParentScope();
    this.syncDirection();
  }

  private connectParentScope(): void {
    const nextParent = findParentScope(this);
    if (nextParent === this.parentScope) {
      this.syncParentRegistration();
      return;
    }
    this.parentUnregister?.();
    this.parentUnregister = undefined;
    this.parentUnsubscribe?.();
    this.parentUnsubscribe = undefined;
    this.parentScope = nextParent;
    if (this.parentScope) {
      this.parentUnsubscribe = this.parentScope.subscribe(() => {
        this.syncDirection();
      });
    }
    this.syncParentRegistration();
  }

  private syncParentRegistration(): void {
    this.parentUnregister?.();
    this.parentUnregister = undefined;
    if (this.isConnected && this.parentScope && (this.rtlTotal > 0 || this.ltrTotal > 0)) {
      this.parentUnregister = this.parentScope.registerSample(this.rtlTotal, this.ltrTotal);
    }
  }

  subscribe(fn: () => void): () => void {
    this.subscribers.add(fn);
    return () => {
      this.subscribers.delete(fn);
    };
  }

  registerSample(rtlWords: number, ltrWords: number): () => void {
    if (rtlWords === 0 && ltrWords === 0) {
      return () => {};
    }
    this.rtlTotal += rtlWords;
    this.ltrTotal += ltrWords;
    this.syncParentRegistration();
    this.syncDirection();

    let active = true;
    return () => {
      if (!active) return;
      active = false;
      this.rtlTotal = Math.max(0, this.rtlTotal - rtlWords);
      this.ltrTotal = Math.max(0, this.ltrTotal - ltrWords);
      this.syncParentRegistration();
      this.syncDirection();
    };
  }

  private getTargetChild(): HTMLElement | null {
    if (typeof this.firstElementChild === "undefined") return null;
    return this.firstElementChild as HTMLElement | null;
  }

  private getExplicitChildDir(): TextDirection | undefined {
    const child = this.getTargetChild();
    if (!child) return undefined;
    if (child.hasAttribute("dir") && !stampedDirElements.has(child)) {
      const d = child.getAttribute("dir");
      if (d === "ltr" || d === "rtl") return d;
    }
    return undefined;
  }

  private hasExplicitChildTextAlign(child: HTMLElement): boolean {
    if (child.hasAttribute("text-align")) return true;
    if (child.style.textAlign && !stampedAlignElements.has(child)) return true;
    return false;
  }

  private applyToTarget(): void {
    if (!this.isConnected) return;
    const resolved = this.resolvedDir;
    const effective = this.effectiveDir;

    if (this.getAttribute("dir") !== effective) {
      this.setAttribute("dir", effective);
    }

    const child = this.getTargetChild();
    if (!child) return;

    const explicitDir = this.getExplicitChildDir();
    if (explicitDir === undefined) {
      stampedDirElements.add(child);
      if (child.getAttribute("dir") !== resolved) {
        scopeStampingTarget = child;
        try {
          child.setAttribute("dir", resolved);
        } finally {
          scopeStampingTarget = null;
        }
      }
    }

    const parentAlignedDir = this.parentScope?.childAlignedDir ?? null;
    const shouldFlipTextAlign =
      this.alignWithParent &&
      !this.hasExplicitChildTextAlign(child) &&
      parentAlignedDir !== null &&
      parentAlignedDir !== effective;

    if (shouldFlipTextAlign) {
      stampedAlignElements.add(child);
      child.style.textAlign = "end";
    } else if (stampedAlignElements.has(child)) {
      child.style.removeProperty("text-align");
      stampedAlignElements.delete(child);
    }
  }

  private syncDirection(): void {
    this.applyToTarget();
    const nextEffective = this.effectiveDir;
    const nextAligned = this.childAlignedDir;
    if (nextEffective !== this.lastNotifiedEffectiveDir || nextAligned !== this.lastNotifiedAlignedDir) {
      this.lastNotifiedEffectiveDir = nextEffective;
      this.lastNotifiedAlignedDir = nextAligned;
      for (const sub of this.subscribers) {
        sub();
      }
    }
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    this.syncDirection();
  }

  private onSlotChange = () => {
    this.syncDirection();
  };

  protected override render() {
    return html`<slot @slotchange=${this.onSlotChange}></slot>`;
  }
}

/**
 * `<lustrous-prose-text>` — Bidirectional prose typography for multilingual content.
 *
 * Extends `<lustrous-text>` with word-ratio base direction estimation (`estimateProseDirection`),
 * technical LTR token isolation (`<bdi dir="ltr">` around tokens with boundary symbols such as
 * `C++`, `foo()`, `<Outlet />`, `/usr/local`, `$HOME`, `3-D`), and bottom-up word-count
 * reporting to enclosing `<lustrous-prose-direction-scope>` containers.
 *
 * @slot - Multilingual prose text content.
 * @csspart bdi - Inline `<bdi>` wrapper rendered when `inline-isolate`, `wrap="truncate"`, or `wrap="nowrap"` is active.
 */
@customElement("lustrous-prose-text")
export class LustrousProseText extends LustrousText {
  static override styles = [
    ...LustrousText.styles,
    css`
      :host([data-align-end]:not([text-align])) {
        text-align: end;
      }
      bdi {
        display: inline;
      }
      slot[hidden] {
        display: none !important;
      }
    `,
  ];

  /**
   * Optional BCP-47 language tag (e.g. `"he"`, `"ar-EG"`) used to disambiguate
   * neutral or matching-script strings.
   */
  @property({ reflect: true }) language?: string;

  /**
   * Fallback direction when the text has zero strong RTL or LTR prose words.
   * Defaults to the nearest `<lustrous-prose-direction-scope>` and then `<html dir>`.
   */
  @property({ reflect: true, attribute: "fallback-dir" }) fallbackDir?: TextDirection;

  /**
   * Wraps content in `<bdi dir={resolvedDir}>` inside the element instead of setting
   * `dir` on the host so surrounding UI chrome alignment and CSS ellipsis stay anchored
   * to the host container.
   *
   * Defaults to `true` when `wrap="truncate"` or `wrap="nowrap"`, and `false` otherwise.
   */
  @property({ type: Boolean, reflect: true, attribute: "inline-isolate" }) inlineIsolate?: boolean;

  @state() private slottedText = "";
  @state() private hasElementChildren = false;
  @state() private scopeTick = 0;

  private explicitDir?: TextDirection;
  private selfStampedDir = false;
  hasConnected = false;
  private parentScope: LustrousProseDirectionScope | null = null;
  private unregisterSample?: () => void;
  private unsubscribeScope?: () => void;
  private lastRegisteredRtl = 0;
  private lastRegisteredLtr = 0;
  private observer?: MutationObserver;

  override attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null): void {
    super.attributeChangedCallback(name, oldVal, newVal);
    if (name === "dir" && !this.selfStampedDir && scopeStampingTarget !== this) {
      stampedDirElements.delete(this);
      this.explicitDir = newVal === "ltr" || newVal === "rtl" ? newVal : undefined;
      this.requestUpdate();
    }
  }

  override connectedCallback(): void {
    if (this.hasAttribute("dir") && !this.selfStampedDir && !stampedDirElements.has(this)) {
      const d = this.getAttribute("dir");
      if (d === "ltr" || d === "rtl") {
        this.explicitDir = d;
      }
    }
    super.connectedCallback();
    this.hasConnected = true;
    this.connectScope();
    this.readLightDom();
    if (typeof MutationObserver !== "undefined") {
      this.observer = new MutationObserver(() => {
        this.readLightDom();
      });
      this.observer.observe(this, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.hasConnected = false;
    this.observer?.disconnect();
    this.observer = undefined;
    this.unregisterSample?.();
    this.unregisterSample = undefined;
    this.lastRegisteredRtl = 0;
    this.lastRegisteredLtr = 0;
    this.unsubscribeScope?.();
    this.unsubscribeScope = undefined;
    this.parentScope = null;
  }

  /** Called by ancestor `<lustrous-prose-direction-scope>` when upgraded after this element. */
  reconnectScope(): void {
    if (!this.isConnected) return;
    this.connectScope();
    this.updateScopeRegistration(true);
    this.requestUpdate();
  }

  private connectScope(): void {
    const nextScope = findParentScope(this);
    if (nextScope === this.parentScope) return;
    this.unregisterSample?.();
    this.unregisterSample = undefined;
    this.lastRegisteredRtl = 0;
    this.lastRegisteredLtr = 0;
    this.unsubscribeScope?.();
    this.unsubscribeScope = undefined;
    this.parentScope = nextScope;
    if (this.parentScope) {
      this.unsubscribeScope = this.parentScope.subscribe(() => {
        this.scopeTick += 1;
        this.syncHostAttributes();
      });
    }
  }

  private readLightDom(): void {
    if (typeof this.childNodes === "undefined") return;
    const text = this.textContent ?? "";
    const hasElements = [...this.childNodes].some((n) => n.nodeType === 1);
    const textChanged = text !== this.slottedText;
    this.slottedText = text;
    this.hasElementChildren = hasElements;
    if (textChanged || !this.unregisterSample) {
      this.updateScopeRegistration(false);
    }
    this.syncHostAttributes();
  }

  private updateScopeRegistration(force: boolean): void {
    const { rtlWords, ltrWords } = countProseWords(this.slottedText);
    if (
      !force &&
      rtlWords === this.lastRegisteredRtl &&
      ltrWords === this.lastRegisteredLtr &&
      (this.unregisterSample !== undefined || (rtlWords === 0 && ltrWords === 0))
    ) {
      return;
    }
    this.unregisterSample?.();
    this.unregisterSample = undefined;
    this.lastRegisteredRtl = rtlWords;
    this.lastRegisteredLtr = ltrWords;
    if (this.parentScope && (rtlWords > 0 || ltrWords > 0)) {
      this.unregisterSample = this.parentScope.registerSample(rtlWords, ltrWords);
    }
  }

  /** Effective fallback direction from `fallback-dir`, enclosing scope, or `<html dir>`. */
  get effectiveFallback(): TextDirection {
    if (this.fallbackDir === "ltr" || this.fallbackDir === "rtl") {
      return this.fallbackDir;
    }
    return this.parentScope?.effectiveDir ?? getDocumentDirection();
  }

  /** Resolved direction (`"ltr" | "rtl"`) for this prose element. */
  get resolvedDir(): TextDirection {
    if (this.explicitDir) {
      return this.explicitDir;
    }
    const fallback = this.effectiveFallback;
    if (this.language) {
      return resolveLanguageDirection(this.language, this.slottedText, fallback);
    }
    const { rtlWords, ltrWords } = countProseWords(this.slottedText);
    return resolveDirection(estimateDirectionFromWordCounts(rtlWords, ltrWords), fallback);
  }

  /** Whether content is wrapped in an inline `<bdi>` instead of setting `dir` on the host. */
  get shouldInlineIsolate(): boolean {
    if (typeof this.inlineIsolate === "boolean") {
      return this.inlineIsolate;
    }
    return this.wrap === "truncate" || this.wrap === "nowrap";
  }

  private syncHostAttributes(): void {
    if (!this.isConnected) return;
    const inlineIsolate = this.shouldInlineIsolate;
    const resolved = this.resolvedDir;

    if (inlineIsolate) {
      if (this.hasAttribute("dir")) {
        this.selfStampedDir = true;
        this.removeAttribute("dir");
        stampedDirElements.delete(this);
        this.selfStampedDir = false;
      }
    } else if (this.getAttribute("dir") !== resolved) {
      this.selfStampedDir = true;
      stampedDirElements.add(this);
      this.setAttribute("dir", resolved);
      this.selfStampedDir = false;
    }

    const alignedDir = this.parentScope?.childAlignedDir ?? null;
    const shouldAlignEnd =
      !inlineIsolate &&
      this.textAlign === undefined &&
      alignedDir !== null &&
      alignedDir !== resolved;

    if (shouldAlignEnd) {
      if (!this.hasAttribute("data-align-end")) {
        this.setAttribute("data-align-end", "");
      }
    } else if (this.hasAttribute("data-align-end")) {
      this.removeAttribute("data-align-end");
    }
  }

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    void this.scopeTick;
    this.syncHostAttributes();
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    this.syncHostAttributes();
  }

  private onSlotChange = () => {
    this.readLightDom();
  };

  protected override render() {
    const resolved = this.resolvedDir;
    const inlineIsolate = this.shouldInlineIsolate;
    const canIsolateTokensInShadow =
      !this.hasElementChildren &&
      resolved === "rtl" &&
      this.slottedText.length > 0 &&
      findTechnicalLtrRanges(this.slottedText).length > 0;

    const innerContent = canIsolateTokensInShadow
      ? html`${renderIsolatedTechnicalTokens(this.slottedText, resolved)}<slot hidden @slotchange=${this.onSlotChange}></slot>`
      : html`<slot @slotchange=${this.onSlotChange}></slot>`;

    if (inlineIsolate) {
      return this.slottedText ? html`<bdi part="bdi" dir=${resolved}>${innerContent}</bdi>` : innerContent;
    }

    return innerContent;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-prose-text": LustrousProseText;
    "lustrous-prose-direction-scope": LustrousProseDirectionScope;
  }
}
