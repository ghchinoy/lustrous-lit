import type { CSSResult } from "lit";

const adopted = new WeakMap<Document | ShadowRoot, Set<CSSResult>>();

/**
 * Adopts `styles` into the root (document or shadow root) containing `el` once.
 * Used for styling light-DOM nodes created outside a component's own shadow root
 * (e.g. tooltip bubbles) without inline `<style>` elements, staying CSP-safe.
 */
export function adoptIntoRoot(el: Node, styles: CSSResult): void {
  const root = el.getRootNode() as Document | ShadowRoot;
  if (!("adoptedStyleSheets" in root) || !styles.styleSheet) return;
  let set = adopted.get(root);
  if (!set) adopted.set(root, (set = new Set()));
  if (set.has(styles)) return;
  set.add(styles);
  root.adoptedStyleSheets = [...root.adoptedStyleSheets, styles.styleSheet];
}
