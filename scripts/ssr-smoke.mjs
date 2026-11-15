// Server-render every component with @lit-labs/ssr.
// Run after `pnpm build`: `pnpm test:ssr`. Fails if any component throws or
// doesn't emit declarative shadow DOM.
import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import { render } from "@lit-labs/ssr";
import { collectResultSync } from "@lit-labs/ssr/lib/render-result.js";
import { existsSync, readdirSync } from "node:fs";
import { html, unsafeStatic } from "lit/static-html.js";

// Attributes that exercise willUpdate paths (dimensions, values) during SSR.
const ATTRS = {
  "lustrous-box": 'padding="m" width="200" top="s" background="surface-container"',
  "lustrous-flex": 'gap="s" mobile-direction="column" width="full"',
  "lustrous-grid": 'columns="3" mobile-columns="1"',
  "lustrous-progress-bar": 'value="40" label="Upload"',
  "lustrous-popover": 'heading="H" content="C" max-height="200px" padding="m"',
  "lustrous-sidebar": 'width="280"',
  "lustrous-text-input": 'label="Name" value="Sam"',
  "lustrous-select": 'label="Role" value="admin"',
  "lustrous-radio-group": 'label="Plan" value="pro"',
  "lustrous-icon-button": 'icon="info" badge aria-label="Info"',
  "lustrous-kbd": 'keys="Mod+K"',
  "lustrous-keyboard-shortcuts-modal": "open",
  "lustrous-side-panel": 'open label="Panel" margin="l"',
};

const root = new URL("../dist/components/", import.meta.url);
const dirs = existsSync(root)
  ? readdirSync(root, { withFileTypes: true })
      .filter((d) => d.isDirectory() && existsSync(new URL(`${d.name}/${d.name}.js`, root)))
      .map((d) => d.name)
  : [];

if (dirs.length === 0) {
  console.error("SSR check: no built components found in dist/components/. Run `pnpm build` first.");
  process.exit(1);
}

const failures = [];
for (const dir of dirs) {
  await import(`../dist/components/${dir}/${dir}.js`);
  const tag = unsafeStatic(dir);
  const attrs = unsafeStatic(ATTRS[dir] ?? 'aria-label="x"');
  try {
    const out = collectResultSync(render(html`<${tag} ${attrs}>content</${tag}>`));
    if (!out.includes('shadowroot="open"') && !out.includes("shadowrootmode")) {
      failures.push(`${dir}: no declarative shadow root`);
    }
  } catch (e) {
    failures.push(`${dir}: ${String(e?.message ?? e).split("\n")[0]}`);
  }
}
if (failures.length) {
  console.error(`SSR failed for ${failures.length} component(s):\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
console.log(`SSR ok: ${dirs.length} components rendered to declarative shadow DOM.`);
