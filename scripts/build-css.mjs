// Writes dist/lustrous-theme.css from the compiled theme module (single source of truth: src/theme/tokens.ts).
import { mkdir, writeFile } from "node:fs/promises";
import { lustrousThemeCssText } from "../dist/theme/index.js";

const header = `/* @ghchinoy/lustrous-lit — Lustrous Design System theme tokens.
 * Generated from src/theme/tokens.ts — do not edit. */\n`;
await mkdir(new URL("../dist/", import.meta.url), { recursive: true });
await writeFile(new URL("../dist/lustrous-theme.css", import.meta.url), header + lustrousThemeCssText);
console.log("wrote dist/lustrous-theme.css");
