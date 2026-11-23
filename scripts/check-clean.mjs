// Verifies clean-room hygiene (no private/upstream identifiers) and CSP compliance
// (no inline style="" attributes in component templates).
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const IGNORE_DIRS = new Set(["node_modules", ".git", "dist", "storybook-static", "playwright-report-visual", "playwright-report-a11y", "test-results"]);
const TEXT_EXTS = new Set([".ts", ".js", ".mjs", ".json", ".md", ".css", ".html", ".yml", ".yaml"]);

const BANNED_PATTERNS = [
  /@goog\.web/i,
  /gemini-app-web/i,
  /corp\.goog/i,
  /\bluminous\b/i,
  /\blumi-[a-z]/i,
  /--lumi-/i,
  /IxqDiTeGoTjO36ED43Rurb/,
  /VXt3Wp72nKEZh4QInuQcT9/,
  /\bgeminiChat\b/,
  /\bfitbitMove\b/,
  /\bagentMode\b/,
  /\bpromptSuggestion\b/,
];

const violations = [];

function walk(dir) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(ent.name)) continue;
    const full = join(dir, ent.name);
    const rel = relative(ROOT, full).split("\\").join("/");
    if (rel === "scripts/check-clean.mjs") continue;
    if (ent.isDirectory()) {
      walk(full);
      continue;
    }
    if (!TEXT_EXTS.has(extname(ent.name))) continue;
    const content = readFileSync(full, "utf8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const pat of BANNED_PATTERNS) {
        if (pat.test(line)) {
          violations.push(`${rel}:${i + 1}: banned identifier matching ${pat}: ${line.trim()}`);
        }
      }
      // CSP check: no inline style= attributes inside component source templates
      if (
        rel.startsWith("src/components/") &&
        rel.endsWith(".ts") &&
        !rel.endsWith(".stories.ts") &&
        !rel.endsWith(".test.ts") &&
        /\bstyle=/.test(line)
      ) {
        violations.push(`${rel}:${i + 1}: inline style= attribute breaks CSP: ${line.trim()}`);
      }
    }
  }
}

if (existsSync(ROOT)) walk(ROOT);

if (violations.length > 0) {
  console.error(`Clean-room / CSP check failed with ${violations.length} violation(s):\n  ${violations.join("\n  ")}`);
  process.exit(1);
}
console.log("Clean-room & CSP checks passed.");
