import { readFileSync } from "node:fs";
import { dirname, posix } from "node:path";

export const MODES = ["light", "dark", "forced-colors"] as const;
export type Mode = (typeof MODES)[number];

export interface VisualStory {
  id: string;
  title: string;
  name: string;
  /** Directory of the story file relative to repo root, e.g. `src/components/lustrous-button`. */
  dir: string;
  /** Selector to hover before capturing (story tag `hover:<css selector>`). */
  hover?: string;
}

/** Stories from the built Storybook index, minus anything tagged `skip-visual`. */
export function loadStories(indexPath = "storybook-static/index.json"): VisualStory[] {
  const index = JSON.parse(readFileSync(indexPath, "utf8")) as {
    entries: Record<string, { id: string; type: string; title: string; name: string; importPath: string; tags?: string[] }>;
  };
  return Object.values(index.entries)
    .filter((e) => e.type === "story" && !e.tags?.includes("skip-visual"))
    .map((e) => ({
      id: e.id,
      title: e.title,
      name: e.name,
      dir: posix.normalize(dirname(e.importPath)),
      hover: e.tags?.find((t) => t.startsWith("hover:"))?.slice("hover:".length),
    }));
}

/** Baseline path (relative to repo root) for a story in a mode. */
export function snapshotPath(story: VisualStory, mode: Mode): string {
  return posix.join(story.dir, "screenshots", `${story.id}--${mode}.png`);
}
