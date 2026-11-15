import { expect, test } from "@playwright/test";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { loadStories, MODES, snapshotPath } from "./stories";

const stories = loadStories();

for (const story of stories) {
  test.describe(`${story.title} / ${story.name}`, () => {
    for (const mode of MODES) {
      test(mode, async ({ page }) => {
        await page.emulateMedia({
          reducedMotion: "reduce",
          forcedColors: mode === "forced-colors" ? "active" : "none",
        });
        const theme = mode === "dark" ? "dark" : "light";
        await page.goto(`/iframe.html?id=${story.id}&viewMode=story&globals=theme:${theme}`);
        await page.waitForSelector("#storybook-root > *", { state: "attached" });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForFunction(() => {
          const videos: HTMLVideoElement[] = [];
          const walk = (root: Document | ShadowRoot) => {
            root.querySelectorAll("video").forEach((v) => videos.push(v));
            root.querySelectorAll("*").forEach((el) => el.shadowRoot && walk(el.shadowRoot));
          };
          walk(document);
          return videos.every((v) => !v.src || v.error || v.readyState >= 2);
        });
        const videos = page.locator("video");
        for (let i = 0; i < (await videos.count()); i++) {
          const video = videos.nth(i);
          let last = await video.screenshot();
          for (const end = Date.now() + 5000; Date.now() < end; ) {
            await page.waitForTimeout(300);
            const next = await video.screenshot();
            if (next.equals(last)) break;
            last = next;
          }
        }
        await page.waitForTimeout(100);
        if (story.hover) {
          await page.locator(story.hover).first().hover();
          await page.waitForTimeout(250);
        }
        await expect(page.locator("#storybook-root")).toHaveScreenshot(snapshotPath(story, mode).split("/"), {
          animations: "disabled",
          caret: "hide",
        });
      });
    }
  });
}

test("no orphaned baselines", () => {
  const expected = new Set(stories.flatMap((s) => MODES.map((m) => snapshotPath(s, m))));
  const dirs = new Set(stories.map((s) => join(s.dir, "screenshots")));
  const orphans: string[] = [];
  for (const dir of dirs) {
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      const p = join(dir, f).split("\\").join("/");
      if (!expected.has(p)) orphans.push(p);
    }
  }
  expect(orphans, "run `pnpm test:visual:update` to prune").toEqual([]);
});
