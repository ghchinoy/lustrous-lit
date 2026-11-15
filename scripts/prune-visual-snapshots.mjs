// Deletes screenshot baselines that no longer correspond to a story × mode.
import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, posix } from "node:path";

const MODES = ["light", "dark", "forced-colors"];
const index = JSON.parse(readFileSync("storybook-static/index.json", "utf8"));
const stories = Object.values(index.entries).filter((e) => e.type === "story" && !e.tags?.includes("skip-visual"));
const expected = new Set(
  stories.flatMap((e) =>
    MODES.map((m) => posix.join(posix.normalize(dirname(e.importPath)), "screenshots", `${e.id}--${m}.png`)),
  ),
);

let removed = 0;
for (const base of ["src/components", "src/theme"]) {
  if (!existsSync(base)) continue;
  const walk = (dir) => {
    for (const ent of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, ent.name);
      if (ent.isDirectory()) walk(p);
      else if (dir.endsWith("screenshots") && ent.name.endsWith(".png") && !expected.has(p.split("\\").join("/"))) {
        rmSync(p);
        removed++;
        console.log("pruned", p);
      }
    }
  };
  walk(base);
}
console.log(`pruned ${removed} orphaned snapshot(s)`);
