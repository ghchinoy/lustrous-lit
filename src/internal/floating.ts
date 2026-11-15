/**
 * Minimal anchored positioning for overlays rendered with the native Popover API
 * (top layer: immune to z-index or overflow clipping). Places `floating` next to
 * `anchor` on `side`, flips when space is insufficient, and clamps to the viewport.
 */
export type FloatingSide = "top" | "bottom" | "left" | "right" | "inline-start" | "inline-end";
export type FloatingAlign = "start" | "center" | "end";

export interface FloatingOptions {
  side?: FloatingSide;
  align?: FloatingAlign;
  /** Gap between anchor and floating element, px. */
  offset?: number;
  /** Shift along the alignment axis, px (or function receiving resolved side and anchor rect). */
  alignOffset?: number | ((p: { side: "top" | "bottom" | "left" | "right"; anchor: DOMRect }) => number);
  /** Minimum distance from viewport edge, px. */
  padding?: number;
  /** Minimum distance of transform-origin from floating edges, px. @default 5 */
  originPadding?: number;
}

export interface FloatingPosition {
  x: number;
  y: number;
  side: "top" | "bottom" | "left" | "right";
  origin: string;
}

const OPPOSITE = { top: "bottom", bottom: "top", left: "right", right: "left" } as const;

export function computePosition(
  anchor: DOMRect,
  floating: { width: number; height: number },
  viewport: { width: number; height: number },
  rtl: boolean,
  opts: FloatingOptions = {},
): FloatingPosition {
  const { offset = 6, padding = 8, originPadding = 5 } = opts;
  let side: "top" | "bottom" | "left" | "right";
  const raw = opts.side ?? "bottom";
  if (raw === "inline-start") side = rtl ? "right" : "left";
  else if (raw === "inline-end") side = rtl ? "left" : "right";
  else side = raw;

  const fits = (s: typeof side) => {
    if (s === "top") return anchor.top - offset - floating.height >= padding;
    if (s === "bottom") return anchor.bottom + offset + floating.height <= viewport.height - padding;
    if (s === "left") return anchor.left - offset - floating.width >= padding;
    return anchor.right + offset + floating.width <= viewport.width - padding;
  };
  if (!fits(side) && fits(OPPOSITE[side])) side = OPPOSITE[side];

  const align = opts.align ?? "center";
  const alignOffset = typeof opts.alignOffset === "function" ? opts.alignOffset({ side, anchor }) : (opts.alignOffset ?? 0);
  let x: number;
  let y: number;
  if (side === "top" || side === "bottom") {
    y = side === "top" ? anchor.top - offset - floating.height : anchor.bottom + offset;
    const start = rtl ? anchor.right - floating.width : anchor.left;
    const end = rtl ? anchor.left : anchor.right - floating.width;
    x = align === "center" ? anchor.left + (anchor.width - floating.width) / 2 : align === "start" ? start : end;
    x += rtl ? -alignOffset : alignOffset;
  } else {
    x = side === "left" ? anchor.left - offset - floating.width : anchor.right + offset;
    y = align === "center" ? anchor.top + (anchor.height - floating.height) / 2 : align === "start" ? anchor.top : anchor.bottom - floating.height;
    y += alignOffset;
  }
  const wantedY = y;
  x = Math.min(Math.max(x, padding), Math.max(padding, viewport.width - floating.width - padding));
  y = Math.min(Math.max(y, padding), Math.max(padding, viewport.height - floating.height - padding));
  x = Math.round(x);
  y = Math.round(y);
  return { x, y, side, origin: transformOrigin(anchor, floating, { x, y, side }, offset, originPadding, Math.abs(y - wantedY)) };
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max));

function transformOrigin(
  anchor: DOMRect,
  floating: { width: number; height: number },
  p: { x: number; y: number; side: "top" | "bottom" | "left" | "right" },
  offset: number,
  pad: number,
  shiftY: number,
): string {
  const r = (n: number) => `${Math.round(n * 100) / 100}px`;
  const crossX = clamp(anchor.left + anchor.width / 2 - p.x, pad, floating.width - pad);
  const crossY = clamp(anchor.top + anchor.height / 2 - p.y, pad, floating.height - pad);
  if (p.side === "top" || p.side === "bottom") {
    if (shiftY > offset) return `${r(crossX)} ${r(anchor.top + anchor.height / 2 - p.y)}`;
    return p.side === "bottom" ? `${r(crossX)} ${r(-offset)}` : `${r(crossX)} calc(100% + ${offset}px)`;
  }
  return p.side === "right" ? `${r(-offset)} ${r(crossY)}` : `calc(100% + ${offset}px) ${r(crossY)}`;
}

/** Positions `floating` (fixed, top layer) against `anchor` now and on scroll/resize. Returns cleanup function. */
export function autoPosition(
  anchor: Element,
  floating: HTMLElement,
  getOptions: () => FloatingOptions,
  onPlaced?: (placement: { x: number; y: number; side: "top" | "bottom" | "left" | "right"; anchor: DOMRect; rtl: boolean }) => void,
): () => void {
  const update = () => {
    const rtl = getComputedStyle(anchor).direction === "rtl";
    const anchorRect = anchor.getBoundingClientRect();
    const opts = getOptions();
    const { offset = 6, padding = 8 } = opts;
    const viewport = { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight };

    floating.style.removeProperty("--_lustrous-available-height");
    floating.style.removeProperty("--_lustrous-available-width");
    const rawW = floating.offsetWidth;
    const rawH = floating.offsetHeight;

    const raw = opts.side ?? "bottom";
    const resolvedSide: "top" | "bottom" | "left" | "right" =
      raw === "inline-start" ? (rtl ? "right" : "left") : raw === "inline-end" ? (rtl ? "left" : "right") : raw;
    const availFor = (s: "top" | "bottom" | "left" | "right") => {
      if (s === "bottom") return viewport.height - padding - (anchorRect.bottom + offset);
      if (s === "top") return anchorRect.top - offset - padding;
      return viewport.height - padding * 2;
    };
    const availWidthFor = (s: "top" | "bottom" | "left" | "right") => {
      if (s === "right") return viewport.width - padding - (anchorRect.right + offset);
      if (s === "left") return anchorRect.left - offset - padding;
      return viewport.width - padding * 2;
    };

    let sideHint = resolvedSide;
    if (resolvedSide === "top" || resolvedSide === "bottom") {
      const opp = OPPOSITE[resolvedSide];
      const availPrimary = availFor(resolvedSide);
      const availOpp = availFor(opp);
      if (rawH > availPrimary && (rawH <= availOpp || availOpp > availPrimary)) {
        sideHint = opp;
      }
    } else {
      const opp = OPPOSITE[resolvedSide];
      const availPrimary = availWidthFor(resolvedSide);
      const availOpp = availWidthFor(opp);
      if (rawW > availPrimary && (rawW <= availOpp || availOpp > availPrimary)) {
        sideHint = opp;
      }
    }
    floating.style.setProperty("--_lustrous-available-height", `${Math.max(0, Math.floor(availFor(sideHint)))}px`);
    floating.style.setProperty("--_lustrous-available-width", `${Math.max(0, Math.floor(availWidthFor(sideHint)))}px`);

    const measuredW = floating.offsetWidth || rawW;
    const measuredH = floating.offsetHeight || rawH;
    const { x, y, side, origin } = computePosition(
      anchorRect,
      { width: measuredW, height: measuredH },
      viewport,
      rtl,
      resolvedSide === "top" || resolvedSide === "bottom" ? { ...opts, side: sideHint } : opts,
    );
    floating.style.left = `${x}px`;
    floating.style.top = `${y}px`;
    floating.dataset.side = side;
    floating.dataset.align = opts.align ?? "center";
    floating.dataset.dir = rtl ? "rtl" : "ltr";
    floating.style.setProperty("--_lustrous-transform-origin", origin);
    onPlaced?.({ x, y, side, anchor: anchorRect, rtl });
  };
  let alive = true;
  update();
  for (let n: Node | null = anchor; n; n = n.parentNode ?? (n as ShadowRoot).host ?? null) {
    if (!(n instanceof Element)) continue;
    for (const a of n.getAnimations?.() ?? []) {
      a.finished.then(
        () => alive && update(),
        () => {},
      );
    }
  }
  const ro = new ResizeObserver(update);
  ro.observe(floating);
  ro.observe(anchor);
  window.addEventListener("scroll", update, { capture: true, passive: true });
  window.addEventListener("resize", update);
  return () => {
    alive = false;
    ro.disconnect();
    window.removeEventListener("scroll", update, { capture: true });
    window.removeEventListener("resize", update);
  };
}

/** Shared base styles for top-layer `[popover]` surfaces, explicitly restating `:not(:popover-open) { display: none }`. */
export const floatingResetCss = `
  [popover] {
    position: fixed;
    inset: auto;
    margin: 0;
    padding: 0;
    border: 0;
    overflow: visible;
    color: inherit;
    background: none;
  }
  /* Author display rules (e.g. .panel { display: flex }) beat the UA closed-popover rule,
     so restate it explicitly so closed popovers are never painted. */
  [popover]:not(:popover-open) {
    display: none;
  }
`;

const FOCUSABLE_SELECTOR = [
  "button:not([disabled]):not([tabindex='-1'])",
  "[href]:not([tabindex='-1'])",
  "input:not([disabled]):not([tabindex='-1'])",
  "select:not([disabled]):not([tabindex='-1'])",
  "textarea:not([disabled]):not([tabindex='-1'])",
  "[tabindex]:not([tabindex='-1']):not([disabled])",
  "lustrous-button:not([disabled]):not([tabindex='-1'])",
  "lustrous-split-button:not([disabled]):not([tabindex='-1'])",
  "lustrous-icon-button:not([disabled]):not([tabindex='-1'])",
  "lustrous-text-input:not([disabled]):not([tabindex='-1'])",
  "lustrous-text-area:not([disabled]):not([tabindex='-1'])",
  "lustrous-search-bar:not([disabled]):not([tabindex='-1'])",
  "lustrous-select:not([disabled]):not([tabindex='-1'])",
  "lustrous-checkbox:not([disabled]):not([tabindex='-1'])",
  "lustrous-radio:not([disabled]):not([tabindex='-1'])",
  "lustrous-switch:not([disabled]):not([tabindex='-1'])",
  "lustrous-pressable:not([disabled]):not([tabindex='-1'])",
  "lustrous-togglable-button:not([disabled]):not([tabindex='-1'])",
  "lustrous-togglable-icon-button:not([disabled]):not([tabindex='-1'])",
  "lustrous-segmented-control:not([disabled]):not([tabindex='-1'])",
  "lustrous-link:not([disabled]):not([tabindex='-1'])",
].join(", ");

export function firstFocusable(nodes: Iterable<Element>): HTMLElement | undefined {
  for (const n of nodes) {
    if (n.matches(FOCUSABLE_SELECTOR)) return n as HTMLElement;
    const inner = n.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    if (inner) return inner;
  }
  return undefined;
}

export function allFocusable(nodes: Iterable<Element>): HTMLElement[] {
  const out: HTMLElement[] = [];
  for (const n of nodes) {
    if (n.matches(FOCUSABLE_SELECTOR)) {
      out.push(n as HTMLElement);
      continue;
    }
    out.push(...n.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  }
  return out;
}

/** Whether `node` is `root` or inside it across Shadow DOM boundaries. */
export function composedContains(root: Node, node: Node | null | undefined): boolean {
  for (let n: Node | null | undefined = node; n; n = n.parentNode ?? (n as ShadowRoot).host ?? null) {
    if (n === root) return true;
  }
  return false;
}
