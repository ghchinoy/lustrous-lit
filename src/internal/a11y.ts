import { unsafeCSS } from "lit";

/**
 * Hides content visually while keeping it in the accessibility tree for
 * live-region announcements and screen-reader labels. Not for focusable controls.
 */
export const VISUALLY_HIDDEN =
  "position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; border: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap;";

/** `.sr-only { … }` utility for component styles. */
export const lustrousSrOnly = unsafeCSS(`.sr-only { ${VISUALLY_HIDDEN} }`);
