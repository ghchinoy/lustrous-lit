// Converts Playwright visual baseline screenshots between gitignored .png working files
// and committed lossless .webp baselines (`src/**/screenshots/*.webp`).
import { existsSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const BASES = ["src/components", "src/theme"];

function collectScreenshotDirs() {
  const dirs = [];
  for (const base of BASES) {
    if (!existsSync(base)) continue;
    const walk = (dir) => {
      for (const ent of readdirSync(dir, { withFileTypes: true })) {
        if (!ent.isDirectory()) continue;
        const p = join(dir, ent.name);
        if (ent.name === "screenshots") dirs.push(p);
        else walk(p);
      }
    };
    walk(base);
  }
  return dirs;
}

async function pixelsEqual(fileA, fileB) {
  const [a, b] = await Promise.all([
    sharp(fileA).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
    sharp(fileB).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
  ]);
  return a.info.width === b.info.width && a.info.height === b.info.height && a.data.equals(b.data);
}

/** Encodes `screenshots/*.png` into lossless `screenshots/*.webp` (skipping pixel-identical files) and prunes stale `.webp`s. */
export async function packSnapshots() {
  const dirs = collectScreenshotDirs();
  let written = 0;
  let unchanged = 0;
  let pruned = 0;

  for (const dir of dirs) {
    const entries = readdirSync(dir);
    const pngs = entries.filter((f) => f.endsWith(".png"));
    const pngStems = new Set(pngs.map((f) => f.slice(0, -4)));

    // Prune .webp files whose .png was removed
    for (const f of entries) {
      if (f.endsWith(".webp") && !pngStems.has(f.slice(0, -5))) {
        rmSync(join(dir, f));
        pruned++;
      }
    }

    await Promise.all(
      pngs.map(async (pngFile) => {
        const pngPath = join(dir, pngFile);
        const webpPath = join(dir, `${pngFile.slice(0, -4)}.webp`);
        if (existsSync(webpPath) && (await pixelsEqual(pngPath, webpPath))) {
          unchanged++;
          return;
        }
        await sharp(pngPath).webp({ lossless: true, effort: 6 }).toFile(webpPath);
        written++;
      }),
    );
  }

  console.log(`visual-webp pack: ${written} written, ${unchanged} unchanged, ${pruned} pruned`);
}

/** Decodes committed `screenshots/*.webp` baselines into gitignored `screenshots/*.png` for Playwright comparison. */
export async function unpackSnapshots() {
  const dirs = collectScreenshotDirs();
  let unpacked = 0;
  let prunedPng = 0;

  for (const dir of dirs) {
    const entries = readdirSync(dir);
    const webps = entries.filter((f) => f.endsWith(".webp"));
    const webpStems = new Set(webps.map((f) => f.slice(0, -5)));

    for (const f of entries) {
      if (f.endsWith(".png") && !webpStems.has(f.slice(0, -4))) {
        rmSync(join(dir, f));
        prunedPng++;
      }
    }

    await Promise.all(
      webps.map(async (webpFile) => {
        const webpPath = join(dir, webpFile);
        const pngPath = join(dir, `${webpFile.slice(0, -5)}.png`);
        await sharp(webpPath).png().toFile(pngPath);
        unpacked++;
      }),
    );
  }

  console.log(`visual-webp unpack: ${unpacked} baseline(s) ready${prunedPng ? ` (${prunedPng} stale .png removed)` : ""}`);
}

const mode = process.argv[2];
if (mode === "pack") {
  await packSnapshots();
} else if (mode === "unpack") {
  await unpackSnapshots();
}
