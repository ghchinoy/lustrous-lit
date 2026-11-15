/**
 * Shared entrance animation: top-layer overlays fade in from 0 and scale from 0.85
 * over 150ms with a decelerate curve, growing out of `--_lustrous-transform-origin`.
 * Disabled automatically under `prefers-reduced-motion: reduce`.
 */
export const EXPAND_IN_DURATION = 150;
export const EXPAND_IN_EASING = "cubic-bezier(0, 0, 0.2, 1)";
export const EXPAND_IN_KEYFRAMES: Keyframe[] = [
  { opacity: 0, transform: "scale(0.85)" },
  { opacity: 1, transform: "scale(1)" },
];

export function expandInCss(
  selector: string,
  origin: string | null = "var(--_lustrous-transform-origin, center)",
): string {
  return `
@keyframes lustrous-expand-in {
  from { opacity: 0; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1); }
}
${selector} {${origin ? `\n  transform-origin: ${origin};` : ""}
  animation: lustrous-expand-in ${EXPAND_IN_DURATION}ms ${EXPAND_IN_EASING};
}
@media (prefers-reduced-motion: reduce) {
  ${selector} { animation: none; }
}`;
}

/**
 * Plays expand-in via the Web Animations API on elements outside a component's
 * shadow root (such as a light-DOM tooltip bubble). No-op under reduced motion.
 */
export function playExpandIn(el: HTMLElement): void {
  if (typeof el.animate !== "function") return;
  if (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  el.animate(EXPAND_IN_KEYFRAMES, { duration: EXPAND_IN_DURATION, easing: EXPAND_IN_EASING });
}
