import { afterEach } from "vitest";
import { page } from "vitest/browser";

const roots: HTMLElement[] = [];

/** Renders markup into a fresh container and waits for the first element to update. */
export async function fixture<T extends HTMLElement>(markup: string, container?: HTMLElement): Promise<T> {
  const wrap = container ?? document.createElement("div");
  wrap.innerHTML = markup;
  document.body.append(wrap);
  roots.push(wrap);
  const el = wrap.firstElementChild as T & { updateComplete?: Promise<unknown> };
  await el?.updateComplete;
  return el;
}

/**
 * Resizes the viewport and waits until layout and media queries reflect it.
 * WebKit applies a viewport change a frame or more after `page.viewport()` resolves.
 */
export async function setViewport(width: number, height: number): Promise<void> {
  await page.viewport(width, height);
  const frame = () => new Promise((r) => requestAnimationFrame(() => r(undefined)));
  for (let i = 0; i < 60 && (window.innerWidth !== width || window.innerHeight !== height); i++) await frame();
  await frame();
  await frame();
}

export const css = (el: Element, prop: string) => getComputedStyle(el).getPropertyValue(prop).trim();

afterEach(() => {
  for (const r of roots.splice(0)) r.remove();
});
