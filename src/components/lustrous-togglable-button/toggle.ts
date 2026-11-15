import "../../theme/events.js";

/** Detail of `lustrous-change` dispatched by togglable button elements. */
export type LustrousToggleChangeEvent = CustomEvent<{ selected: boolean }>;

/**
 * Dispatches a cancelable `lustrous-change` event with `{ selected: next }` and
 * updates `host.selected` unless a listener calls `preventDefault()`.
 */
export function requestToggle(host: HTMLElement & { selected: boolean }): void {
  const next = !host.selected;
  const ev = new CustomEvent("lustrous-change", {
    detail: { selected: next },
    bubbles: true,
    composed: true,
    cancelable: true,
  });
  if (host.dispatchEvent(ev)) {
    host.selected = next;
  }
}
