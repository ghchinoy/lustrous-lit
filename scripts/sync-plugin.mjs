// Synchronizes generated Agent Plugin metadata & catalogs under plugins/lustrous-lit/
// from custom-elements.json, src/theme/tokens.ts (via dist/theme), and lustrous-icon.ts.
//
// Modes:
//   node scripts/sync-plugin.mjs                         Write/update generated plugin files
//   node scripts/sync-plugin.mjs --check                 Exit 1 if any generated plugin file is out of date
//   node scripts/sync-plugin.mjs --sync-to <plugin-dir>  Mirror plugins/lustrous-lit/ to an external catalog repo
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  breakpoints,
  darkColors,
  durations,
  easings,
  fonts,
  lightColors,
  motion,
  radius,
  spacing,
  typography,
  zIndex,
} from "../dist/theme/index.js";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const syncToIdx = args.indexOf("--sync-to");
const syncToTarget = syncToIdx >= 0 ? args[syncToIdx + 1] : null;

const pkg = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8"));
const cem = JSON.parse(readFileSync(resolve(ROOT, "custom-elements.json"), "utf8"));
const iconSrc = readFileSync(resolve(ROOT, "src/components/lustrous-icon/lustrous-icon.ts"), "utf8");

// 1. Extract core icons + directional set from lustrous-icon.ts
const coreBlockMatch = iconSrc.match(/export type LustrousCoreIconName\s*=([\s\S]*?);/);
if (!coreBlockMatch) throw new Error("Could not parse LustrousCoreIconName from lustrous-icon.ts");
const coreIconNames = [...coreBlockMatch[1].matchAll(/"([A-Za-z0-9_-]+)"/g)].map((m) => m[1]).sort();

const dirBlockMatch = iconSrc.match(/LUSTROUS_DIRECTIONAL_ICONS[^=]*=\s*new Set<string>\(\[([\s\S]*?)\]\)/);
const directionalSet = new Set(
  dirBlockMatch ? [...dirBlockMatch[1].matchAll(/"([A-Za-z0-9_-]+)"/g)].map((m) => m[1]) : [],
);

const icons = coreIconNames.map((name) => ({
  name,
  ...(directionalSet.has(name) ? { directional: true } : {}),
}));

// 2. Build canonical --lustrous-* token list
const tokens = [
  ...Object.entries(lightColors).map(([k, v]) => ({
    name: `--lustrous-color-${k}`,
    category: "color",
    value: v,
    ...(darkColors[k] ? { dark: darkColors[k] } : {}),
  })),
  {
    name: "--lustrous-elevation-level1",
    category: "elevation",
    value: "0 1px 2px 0 var(--lustrous-color-elevation1), 0 4px 12px -2px var(--lustrous-color-elevation1)",
  },
  {
    name: "--lustrous-elevation-level2",
    category: "elevation",
    value: "0 4px 8px -2px var(--lustrous-color-elevation1), 0 16px 32px -4px var(--lustrous-color-elevation2)",
  },
  {
    name: "--lustrous-text-muted",
    category: "derived",
    value: "var(--lustrous-color-on-surface-variant)",
  },
  ...Object.entries(spacing).map(([k, v]) => ({ name: `--lustrous-space-${k}`, category: "spacing", value: v })),
  ...Object.entries(radius).map(([k, v]) => ({ name: `--lustrous-radius-${k}`, category: "radius", value: v })),
  ...Object.entries(zIndex).map(([k, v]) => ({ name: `--lustrous-z-${k}`, category: "z-index", value: v })),
  ...Object.entries(fonts).map(([k, v]) => ({ name: `--lustrous-font-${k}`, category: "font", value: v })),
  ...Object.entries(durations).map(([k, v]) => ({ name: `--lustrous-duration-${k}`, category: "duration", value: v })),
  ...Object.entries(easings).map(([k, v]) => ({ name: `--lustrous-easing-${k}`, category: "easing", value: v })),
  ...Object.entries(motion).map(([k, v]) => ({ name: `--lustrous-motion-${k}`, category: "motion", value: v })),
];

// 3. Extract custom elements from custom-elements.json
function firstParagraph(text = "") {
  return text
    .split(/\n\s*\n/)[0]
    .replace(/^`<lustrous-[^`]+>`\s*[—–-]\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

const SKIP_MEMBER_NAMES = new Set(["internals", "styles", "shadowRootOptions", "formAssociated"]);
const components = [];
const componentCssPropSet = new Set();

for (const mod of cem.modules ?? []) {
  const folderMatch = /^src\/components\/([^/]+)\//.exec(mod.path ?? "");
  const importPath = folderMatch ? `@ghchinoy/lustrous-lit/components/${folderMatch[1]}` : "@ghchinoy/lustrous-lit";

  for (const decl of mod.declarations ?? []) {
    if (!decl.tagName || !decl.tagName.startsWith("lustrous-")) continue;
    const members = decl.members ?? [];
    const formAssociated = members.some((m) => m.static && m.name === "formAssociated");

    const properties = members
      .filter(
        (m) =>
          m.kind === "field" &&
          !m.static &&
          m.privacy !== "private" &&
          m.privacy !== "protected" &&
          !m.inheritedFrom &&
          !SKIP_MEMBER_NAMES.has(m.name),
      )
      .map((m) => ({
        name: m.name,
        ...(m.attribute ? { attribute: m.attribute } : {}),
        ...(m.type?.text ? { type: m.type.text } : {}),
        ...(m.default !== undefined ? { default: m.default } : {}),
        ...(m.reflects ? { reflects: true } : {}),
        ...(m.description ? { description: firstParagraph(m.description) } : {}),
      }));

    const events = (decl.events ?? [])
      .filter((e) => !e.inheritedFrom && e.name)
      .map((e) => ({
        name: e.name,
        ...(e.type?.text ? { type: e.type.text } : {}),
        ...(e.description ? { description: firstParagraph(e.description) } : {}),
      }));

    const slots = (decl.slots ?? [])
      .filter((s) => !s.inheritedFrom)
      .map((s) => ({
        name: s.name || "",
        ...(s.description ? { description: firstParagraph(s.description) } : {}),
      }));

    const cssParts = (decl.cssParts ?? [])
      .filter((p) => !p.inheritedFrom && p.name)
      .map((p) => ({
        name: p.name,
        ...(p.description ? { description: firstParagraph(p.description) } : {}),
      }));

    const cssProperties = (decl.cssProperties ?? [])
      .filter((cp) => cp.name)
      .map((cp) => {
        componentCssPropSet.add(cp.name);
        return {
          name: cp.name,
          ...(cp.description ? { description: firstParagraph(cp.description) } : {}),
        };
      });

    components.push({
      tag: decl.tagName,
      className: decl.name,
      importPath,
      ...(decl.superclass?.name ? { superclass: decl.superclass.name } : {}),
      formAssociated,
      summary: firstParagraph(decl.description ?? ""),
      properties,
      events,
      slots,
      cssParts,
      cssProperties,
    });
  }
}

components.sort((a, b) => a.tag.localeCompare(b.tag));

const catalogData = {
  package: pkg.name,
  version: pkg.version,
  breakpoints,
  typographyVariants: Object.keys(typography),
  components,
  tokens,
  icons,
};

const rulesData = {
  package: pkg.name,
  version: pkg.version,
  tokens: tokens.map((t) => t.name).sort(),
  componentCssProperties: [...componentCssPropSet].sort(),
  icons: coreIconNames,
};

// 4. Render deterministic Markdown component catalog
const mdLines = [
  "# Component API Catalog",
  "",
  `Generated from \`custom-elements.json\` for \`${pkg.name}@${pkg.version}\` (${components.length} custom elements).`,
  "",
  "| Tag | Module Import | Form | Own Attributes / Properties | Events | CSS Parts |",
  "| :-- | :-- | :-- | :-- | :-- | :-- |",
];

for (const c of components) {
  const shortImport = c.importPath.replace("@ghchinoy/lustrous-lit/", ".../");
  const props =
    c.properties.length > 0
      ? c.properties.map((p) => `\`${p.attribute ?? `.${p.name}`}\``).join(", ")
      : "*(inherited)*";
  const evs = c.events.length > 0 ? c.events.map((e) => `\`${e.name}\``).join(", ") : "—";
  const parts = c.cssParts.length > 0 ? c.cssParts.map((p) => `\`${p.name}\``).join(", ") : "—";
  mdLines.push(
    `| \`<${c.tag}>\` | \`${shortImport}\` | ${c.formAssociated ? "Yes" : "—"} | ${props} | ${evs} | ${parts} |`,
  );
}
mdLines.push("");

const outputs = new Map([
  [
    "plugins/lustrous-lit/skills/lustrous-lit/assets/catalog.json",
    `${JSON.stringify(catalogData, null, 2)}\n`,
  ],
  [
    "plugins/lustrous-lit/skills/lustrous-lit/references/component-catalog.md",
    mdLines.join("\n"),
  ],
  [
    "plugins/lustrous-lit/skills/lustrous-reviewer/assets/rules-data.json",
    `${JSON.stringify(rulesData, null, 2)}\n`,
  ],
]);

// Also keep plugin.json and SKILL.md metadata.version synced with package.json version
const pluginManifestRel = "plugins/lustrous-lit/plugin.json";
const pluginManifestAbs = resolve(ROOT, pluginManifestRel);
if (existsSync(pluginManifestAbs)) {
  const manifestObj = JSON.parse(readFileSync(pluginManifestAbs, "utf8"));
  manifestObj.version = pkg.version;
  outputs.set(pluginManifestRel, `${JSON.stringify(manifestObj, null, 2)}\n`);
}

for (const skillName of ["lustrous-lit", "lustrous-component-author", "lustrous-reviewer"]) {
  const skillRel = `plugins/lustrous-lit/skills/${skillName}/SKILL.md`;
  const skillAbs = resolve(ROOT, skillRel);
  if (existsSync(skillAbs)) {
    const raw = readFileSync(skillAbs, "utf8");
    const updated = raw.replace(/^(\s*version:\s*)"[^"]*"/m, `$1"${pkg.version}"`);
    outputs.set(skillRel, updated);
  }
}

let drifted = 0;
for (const [relPath, expected] of outputs) {
  const absPath = resolve(ROOT, relPath);
  const current = existsSync(absPath) ? readFileSync(absPath, "utf8") : null;
  if (current !== expected) {
    if (checkOnly) {
      console.error(`Out of date: ${relPath} (run 'pnpm build' or 'node scripts/sync-plugin.mjs')`);
      drifted++;
    } else {
      mkdirSync(dirname(absPath), { recursive: true });
      writeFileSync(absPath, expected, "utf8");
      console.log(`synced ${relPath}`);
    }
  }
}

if (checkOnly) {
  if (drifted > 0) process.exit(1);
  console.log("Agent plugin artifacts are up to date.");
}

if (syncToTarget) {
  const dest = resolve(process.cwd(), syncToTarget);
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(resolve(ROOT, "plugins/lustrous-lit"), dest, { recursive: true });
  console.log(`mirrored plugins/lustrous-lit -> ${dest}`);
}
