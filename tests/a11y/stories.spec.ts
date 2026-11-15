import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

/**
 * Accessibility checks: axe-core (WCAG 2.0/2.1 A + AA) over every Storybook story, in light and dark.
 * axe traverses open shadow roots, so component internals are checked too.
 * Fails on `serious` and `critical` violations; `moderate`/`minor` are reported in the log.
 */

interface Entry {
  id: string;
  type: string;
  title: string;
  name: string;
  tags?: string[];
}

const index = JSON.parse(readFileSync("storybook-static/index.json", "utf8")) as { entries: Record<string, Entry> };
const stories = Object.values(index.entries).filter((e) => e.type === "story" && !e.tags?.includes("skip-a11y"));

/** Rules disabled for every story because Storybook renders fragments rather than full pages. */
const GLOBAL_DISABLED: Record<string, string> = {
  region: "Story fragments aren't full pages, so content outside landmarks is expected.",
  "landmark-one-main": "Story fragments aren't full pages.",
  "page-has-heading-one": "Story fragments aren't full pages.",
};

interface Exception {
  story: string;
  theme?: "light" | "dark";
  rule: string;
  target: string;
  reason: string;
}
const EXCEPTIONS: Exception[] = [];

const FAIL_ON = new Set(["serious", "critical"]);

for (const story of stories) {
  for (const theme of ["light", "dark"] as const) {
    test(`${story.title} / ${story.name} · ${theme}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`/iframe.html?id=${story.id}&viewMode=story&globals=theme:${theme}`);
      await page.waitForSelector("#storybook-root > *", { state: "attached" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(150);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .disableRules(Object.keys(GLOBAL_DISABLED))
        .analyze();

      const excepted = (rule: string, target: string) =>
        EXCEPTIONS.some(
          (x) => x.story === story.id && (!x.theme || x.theme === theme) && x.rule === rule && target.includes(x.target),
        );
      results.violations = results.violations
        .map((v) => ({ ...v, nodes: v.nodes.filter((n) => !excepted(v.id, n.target.join(" >>> "))) }))
        .filter((v) => v.nodes.length > 0);

      const fmt = (v: (typeof results.violations)[number]) =>
        `[${v.impact}] ${v.id}: ${v.help}\n${v.nodes
          .slice(0, 5)
          .map((n) => `    ${n.target.join(" >>> ")}\n      ${n.failureSummary?.split("\n").slice(1).join(" ").trim()}`)
          .join("\n")}`;

      const minor = results.violations.filter((v) => !FAIL_ON.has(v.impact ?? ""));
      if (minor.length) console.log(`ℹ️  ${story.id} (${theme}): ${minor.map((v) => `${v.id} [${v.impact}]`).join(", ")}`);

      const blocking = results.violations.filter((v) => FAIL_ON.has(v.impact ?? ""));
      expect(blocking.map(fmt).join("\n\n"), `${blocking.length} serious/critical a11y violation(s)`).toBe("");
    });
  }
}
