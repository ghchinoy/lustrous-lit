// SSR check, part 2: server-render a page with @lit-labs/ssr, then load it in Chromium
// with Lit's hydrate support and verify components are styled before JS (via lustrous-theme.css),
// hydrate without console/page errors, and wire slotted triggers cleanly.
import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import { render } from "@lit-labs/ssr";
import { collectResultSync } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const COMPONENTS = [
  "lustrous-flex",
  "lustrous-button",
  "lustrous-text-input",
  "lustrous-checkbox",
  "lustrous-progress-bar",
  "lustrous-icon-button",
  "lustrous-badge",
  "lustrous-popover",
  "lustrous-menu",
];
for (const c of COMPONENTS) await import(join(ROOT, `dist/components/${c}/${c}.js`));

const body = collectResultSync(
  render(html`<lustrous-flex gap="m" direction="column" padding="l" width="400">
    <lustrous-button icon="bolt">Save</lustrous-button>
    <lustrous-text-input label="Name" value="Sam"></lustrous-text-input>
    <lustrous-checkbox>Weekly digest</lustrous-checkbox>
    <lustrous-progress-bar value="40" label="Upload"></lustrous-progress-bar>
    <lustrous-icon-button icon="info" badge aria-label="Info (unread)"></lustrous-icon-button>
    <lustrous-badge>Beta</lustrous-badge>
    <lustrous-popover heading="Tip" content="Body"><button id="pop-trigger">i</button></lustrous-popover>
  </lustrous-flex>`),
);

const req = createRequire(createRequire(join(ROOT, "package.json")).resolve("@lit-labs/ssr"));
const pkgRoot = (name) => {
  let d = dirname(req.resolve(name));
  while (!existsSync(join(d, "package.json")) || JSON.parse(readFileSync(join(d, "package.json"), "utf8")).name !== name) {
    d = dirname(d);
  }
  return d;
};
const PKGS = {
  lit: "index.js",
  "lit-html": "lit-html.js",
  "lit-element": "lit-element.js",
  "@lit/reactive-element": "reactive-element.js",
  "@lit-labs/ssr-client": "index.js",
};
const roots = Object.fromEntries(Object.keys(PKGS).map((p) => [p, pkgRoot(p)]));
const imports = Object.fromEntries(
  Object.entries(PKGS).flatMap(([p, main]) => [
    [p, `/nm/${p}/${main}`],
    [`${p}/`, `/nm/${p}/`],
  ]),
);

const page = `<!doctype html><html><head>
<link rel="stylesheet" href="/dist/lustrous-theme.css">
<script type="importmap">${JSON.stringify({ imports })}</script>
<script type="module">
  import "@lit-labs/ssr-client/lit-element-hydrate-support.js";
  window.__errors = [];
  addEventListener("error", (e) => __errors.push(e.message));
  for (const c of ${JSON.stringify(COMPONENTS)}) await import("/dist/components/" + c + "/" + c + ".js");
  window.__ready = true;
</script></head><body>${body}</body></html>`;

const types = { ".js": "text/javascript", ".css": "text/css", ".html": "text/html" };
const server = createServer((q, r) => {
  const url = decodeURIComponent(new URL(q.url, "http://x").pathname);
  let file;
  if (url === "/") return r.writeHead(200, { "content-type": "text/html" }).end(page);
  if (url.startsWith("/dist/")) file = join(ROOT, url);
  else if (url.startsWith("/nm/")) {
    const pkg = Object.keys(roots)
      .sort((a, b) => b.length - a.length)
      .find((p) => url.startsWith(`/nm/${p}/`));
    if (pkg) file = join(roots[pkg], url.slice(`/nm/${pkg}/`.length));
  }
  if (!file || !existsSync(file)) return r.writeHead(404).end();
  r.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" }).end(readFileSync(file));
}).listen(0);
const base = `http://localhost:${server.address().port}/`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const problems = [];
try {
  // 1. Before JS: declarative shadow DOM is styled by tokens from lustrous-theme.css.
  const preCtx = await browser.newContext();
  const pp = await preCtx.newPage();
  await pp.route("**/dist/components/**", (r) => r.abort());
  await pp.goto(base);
  const pre = await pp.evaluate(() => {
    const inner = document.querySelector("lustrous-button").shadowRoot?.querySelector("button");
    return inner ? { bg: getComputedStyle(inner).backgroundColor, h: inner.getBoundingClientRect().height } : null;
  });
  // lightColors.accent = #1d4ed8 -> rgb(29, 78, 216)
  if (!pre || pre.bg !== "rgb(29, 78, 216)" || pre.h !== 44) {
    problems.push(`not styled before JS: ${JSON.stringify(pre)}`);
  }
  await preCtx.close();
  const p = await (await browser.newContext()).newPage();

  // 2. Hydrate.
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => m.type() === "error" && !m.text().startsWith("Failed to load resource") && errors.push(m.text()));
  p.on("response", (r) => r.status() >= 400 && !r.url().endsWith("favicon.ico") && errors.push(`${r.status()} ${r.url()}`));
  await p.goto(base);
  await p.waitForFunction(() => window.__ready, null, { timeout: 15000 });
  await p.waitForTimeout(200);
  const state = await p.evaluate(() => ({
    errors: window.__errors,
    buttons: document.querySelector("lustrous-button").shadowRoot.querySelectorAll("button").length,
    value: document.querySelector("lustrous-text-input").shadowRoot.querySelector("input").value,
    progress: document.querySelector("lustrous-progress-bar").style.getPropertyValue("--_lustrous-progress"),
  }));
  if (state.buttons !== 1) problems.push(`lustrous-button rendered ${state.buttons} buttons (duplicated on hydration?)`);
  if (state.value !== "Sam") problems.push(`text input value ${state.value}`);
  if (state.progress !== "40%") problems.push(`progress var ${state.progress}`);
  await p.click("lustrous-checkbox");
  if (!(await p.evaluate(() => document.querySelector("lustrous-checkbox").checked))) problems.push("checkbox didn't toggle");
  await p.click("#pop-trigger");
  await p.waitForTimeout(100);
  if (!(await p.evaluate(() => document.querySelector("lustrous-popover").open))) {
    problems.push("popover trigger not wired after hydration");
  }
  problems.push(...state.errors, ...errors);
} finally {
  await browser.close();
  server.close();
}
if (problems.length) {
  console.error(`SSR hydration check failed:\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log("SSR hydration ok: styled before JS, hydrated without errors, slotted triggers wired.");
