/**
 * Programmatic alternative to linking `fonts/lustrous-fonts.css`.
 *
 * `@font-face` must be declared at document level, so this injects a stylesheet
 * into `document.head`. `baseUrl` defaults to this package's `fonts/` directory
 * relative to the module URL; pass a custom URL when hosting fonts elsewhere.
 */
export function installLustrousFonts(baseUrl?: string | URL, doc: Document | undefined = globalThis.document): void {
  if (!doc || doc.querySelector("style[data-lustrous-fonts]")) return;
  const base = String(baseUrl ?? new URL(/* @vite-ignore */ "../../fonts/", import.meta.url)).replace(/\/?$/, "/");
  const face = (family: string, file: string, weight: string, style = "normal", extra = "") =>
    `@font-face { font-family: "${family}"; src: url("${base}${file}") format("woff2"); font-weight: ${weight}; font-style: ${style}; font-display: swap; ${extra} }`;
  const style = doc.createElement("style");
  style.dataset.lustrousFonts = "";
  style.textContent = [
    face("Google Sans Flex", "GoogleSansFlex-latin.woff2", "1 1000", "normal", "font-stretch: 75% 100%;"),
    face("Google Sans Code", "GoogleSansCode-latin.woff2", "300 800"),
    face("Google Sans Code", "GoogleSansCode-Italic-latin.woff2", "300 800", "italic"),
  ].join("\n");
  doc.head.append(style);
}
