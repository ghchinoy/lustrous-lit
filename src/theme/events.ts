/**
 * Detail of the `lustrous-change` event. Controls that update a value or state
 * dispatch `lustrous-change` (`bubbles: true, composed: true`):
 *
 * | Element | Detail |
 * | :-- | :-- |
 * | `lustrous-segmented-control`, `lustrous-tabs`, `lustrous-select`, `lustrous-radio-group` | `{ value }` |
 * | `lustrous-togglable-button`, `lustrous-togglable-icon-button` | `{ selected }` (cancelable) |
 * | `lustrous-checkbox`, `lustrous-switch` | `{ checked }` |
 * | `lustrous-sidebar` | `{ collapsed }` (cancelable) |
 */
export interface LustrousChangeDetail {
  value?: string;
  selected?: boolean;
  checked?: boolean;
  collapsed?: boolean;
}

export type LustrousChangeEvent = CustomEvent<LustrousChangeDetail>;

/** Why a dismissible surface (`lustrous-modal`, `lustrous-dialog`, `lustrous-bottom-sheet`, `lustrous-side-panel`, `lustrous-banner`) asks to close. */
export type LustrousCloseReason = "escape" | "scrim" | "dismiss" | "swipe";

/** `lustrous-close-request`: cancelable; default action closes modal/banner surfaces (for `lustrous-side-panel`, the host app closes it). */
export type LustrousCloseRequestEvent = CustomEvent<{ reason: LustrousCloseReason }>;

/** `lustrous-toggle`: fired by disclosures and overlays when open state changes. */
export type LustrousToggleEvent = CustomEvent<{ open: boolean; expanded?: boolean }>;

declare global {
  interface HTMLElementEventMap {
    "lustrous-change": LustrousChangeEvent;
    "lustrous-close-request": LustrousCloseRequestEvent;
    "lustrous-toggle": LustrousToggleEvent;
  }
}
