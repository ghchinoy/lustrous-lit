/**
 * Brand theme presets and live unlayered CSS override generator for Meridian Studio.
 *
 * Demonstrates how any application customizes `@ghchinoy/lustrous-lit` by declaring
 * unlayered `--lustrous-*` custom properties that naturally outrank `@layer lustrous`
 * without `!important`.
 */

export type BrandPresetId = "default" | "emerald" | "copper" | "amethyst" | "oceanic";
export type RadiusProfileId = "preset" | "sharp" | "architectural" | "soft";

export interface BrandCustomizationState {
  readonly preset: BrandPresetId;
  readonly radius: RadiusProfileId;
  readonly monoDisplay: boolean;
}

export interface BrandPresetSpec {
  readonly id: BrandPresetId;
  readonly name: string;
  readonly tagline: string;
  readonly defaultRadius: Exclude<RadiusProfileId, "preset">;
  readonly swatchLight: string;
  readonly swatchDark: string;
  readonly swatchSurface: string;
  readonly light: Readonly<Record<string, string>>;
  readonly dark: Readonly<Record<string, string>>;
}

export const RADIUS_PROFILES: Readonly<Record<Exclude<RadiusProfileId, "preset">, Readonly<Record<string, string>>>> = {
  sharp: {
    "--lustrous-radius-xs": "2px",
    "--lustrous-radius-s": "3px",
    "--lustrous-radius-m": "4px",
    "--lustrous-radius-l": "6px",
    "--lustrous-radius-xl": "8px",
    "--lustrous-radius-2xl": "12px",
  },
  architectural: {
    "--lustrous-radius-xs": "4px",
    "--lustrous-radius-s": "6px",
    "--lustrous-radius-m": "10px",
    "--lustrous-radius-l": "14px",
    "--lustrous-radius-xl": "20px",
    "--lustrous-radius-2xl": "28px",
  },
  soft: {
    "--lustrous-radius-xs": "6px",
    "--lustrous-radius-s": "10px",
    "--lustrous-radius-m": "16px",
    "--lustrous-radius-l": "20px",
    "--lustrous-radius-xl": "26px",
    "--lustrous-radius-2xl": "34px",
  },
};

export const BRAND_PRESETS: readonly BrandPresetSpec[] = [
  {
    id: "default",
    name: "Lustrous Sapphire",
    tagline: "Default Mineral Slate & Sapphire",
    defaultRadius: "architectural",
    swatchLight: "#1d4ed8",
    swatchDark: "#60a5fa",
    swatchSurface: "#f1f5f9",
    light: {},
    dark: {},
  },
  {
    id: "emerald",
    name: "Emerald Canopy",
    tagline: "Botanical emerald on warm sage stone",
    defaultRadius: "architectural",
    swatchLight: "#047857",
    swatchDark: "#34d399",
    swatchSurface: "#eef3ef",
    light: {
      "--lustrous-color-background": "#f6f9f7",
      "--lustrous-color-on-background": "#0f1f18",
      "--lustrous-color-surface": "#ffffff",
      "--lustrous-color-surface-bright": "#ffffff",
      "--lustrous-color-surface-dim": "#eef3ef",
      "--lustrous-color-surface-container-low": "#f4f8f5",
      "--lustrous-color-surface-container": "#ebf1ed",
      "--lustrous-color-surface-container-high": "#dce6df",
      "--lustrous-color-surface-container-highest": "#c7d6cc",
      "--lustrous-color-on-surface": "#0f1f18",
      "--lustrous-color-on-surface-variant": "#3f554b",
      "--lustrous-color-outline": "#5c7469",
      "--lustrous-color-outline-variant": "#c4d3c9",
      "--lustrous-color-primary": "#047857",
      "--lustrous-color-on-primary": "#ffffff",
      "--lustrous-color-primary-container": "#d1fae5",
      "--lustrous-color-on-primary-container": "#064e3b",
      "--lustrous-color-accent": "#047857",
      "--lustrous-color-on-accent": "#ffffff",
      "--lustrous-color-accent-container": "#d1fae5",
      "--lustrous-color-on-accent-container": "#064e3b",
      "--lustrous-color-accent-fixed": "#059669",
    },
    dark: {
      "--lustrous-color-background": "#0a110e",
      "--lustrous-color-on-background": "#e2ece6",
      "--lustrous-color-surface": "#101a15",
      "--lustrous-color-surface-bright": "#192820",
      "--lustrous-color-surface-dim": "#0c1410",
      "--lustrous-color-surface-container-low": "#14201a",
      "--lustrous-color-surface-container": "#192820",
      "--lustrous-color-surface-container-high": "#22352b",
      "--lustrous-color-surface-container-highest": "#2d4438",
      "--lustrous-color-on-surface": "#ecf4ef",
      "--lustrous-color-on-surface-variant": "#9cb3a7",
      "--lustrous-color-outline": "#7d9689",
      "--lustrous-color-outline-variant": "#2f453a",
      "--lustrous-color-primary": "#6ee7b7",
      "--lustrous-color-on-primary": "#022c22",
      "--lustrous-color-primary-container": "#065f46",
      "--lustrous-color-on-primary-container": "#d1fae5",
      "--lustrous-color-accent": "#34d399",
      "--lustrous-color-on-accent": "#022c22",
      "--lustrous-color-accent-container": "#064e3b",
      "--lustrous-color-on-accent-container": "#d1fae5",
      "--lustrous-color-accent-fixed": "#10b981",
    },
  },
  {
    id: "copper",
    name: "Copper Editorial",
    tagline: "Warm alabaster paper & burnt terracotta",
    defaultRadius: "architectural",
    swatchLight: "#9a3412",
    swatchDark: "#fdba74",
    swatchSurface: "#f5efe6",
    light: {
      "--lustrous-color-background": "#fbf8f3",
      "--lustrous-color-on-background": "#1c1917",
      "--lustrous-color-surface": "#fffdf9",
      "--lustrous-color-surface-bright": "#ffffff",
      "--lustrous-color-surface-dim": "#f3ede2",
      "--lustrous-color-surface-container-low": "#f8f4ec",
      "--lustrous-color-surface-container": "#f2ece1",
      "--lustrous-color-surface-container-high": "#e7dfd1",
      "--lustrous-color-surface-container-highest": "#d8cebd",
      "--lustrous-color-on-surface": "#1c1917",
      "--lustrous-color-on-surface-variant": "#57534e",
      "--lustrous-color-outline": "#78716c",
      "--lustrous-color-outline-variant": "#d6d3d1",
      "--lustrous-color-primary": "#9a3412",
      "--lustrous-color-on-primary": "#ffffff",
      "--lustrous-color-primary-container": "#ffedd5",
      "--lustrous-color-on-primary-container": "#431407",
      "--lustrous-color-accent": "#9a3412",
      "--lustrous-color-on-accent": "#ffffff",
      "--lustrous-color-accent-container": "#ffedd5",
      "--lustrous-color-on-accent-container": "#431407",
      "--lustrous-color-accent-fixed": "#c2410c",
    },
    dark: {
      "--lustrous-color-background": "#12100e",
      "--lustrous-color-on-background": "#e7e5e4",
      "--lustrous-color-surface": "#191614",
      "--lustrous-color-surface-bright": "#26221f",
      "--lustrous-color-surface-dim": "#141210",
      "--lustrous-color-surface-container-low": "#1f1b18",
      "--lustrous-color-surface-container": "#26211e",
      "--lustrous-color-surface-container-high": "#322c28",
      "--lustrous-color-surface-container-highest": "#403833",
      "--lustrous-color-on-surface": "#f5f5f4",
      "--lustrous-color-on-surface-variant": "#a8a29e",
      "--lustrous-color-outline": "#8c8580",
      "--lustrous-color-outline-variant": "#3f3a36",
      "--lustrous-color-primary": "#fdba74",
      "--lustrous-color-on-primary": "#431407",
      "--lustrous-color-primary-container": "#7c2d12",
      "--lustrous-color-on-primary-container": "#ffedd5",
      "--lustrous-color-accent": "#fb923c",
      "--lustrous-color-on-accent": "#2b0e02",
      "--lustrous-color-accent-container": "#6c2710",
      "--lustrous-color-on-accent-container": "#ffedd5",
      "--lustrous-color-accent-fixed": "#f97316",
    },
  },
  {
    id: "amethyst",
    name: "Amethyst Precision",
    tagline: "Crisp 4px DevTools geometry & deep violet",
    defaultRadius: "sharp",
    swatchLight: "#6d28d9",
    swatchDark: "#c4b5fd",
    swatchSurface: "#f4f3f8",
    light: {
      "--lustrous-color-background": "#f9f9fb",
      "--lustrous-color-on-background": "#18181b",
      "--lustrous-color-surface": "#ffffff",
      "--lustrous-color-surface-bright": "#ffffff",
      "--lustrous-color-surface-dim": "#f1f0f5",
      "--lustrous-color-surface-container-low": "#f6f5fa",
      "--lustrous-color-surface-container": "#efedf6",
      "--lustrous-color-surface-container-high": "#e4e1ef",
      "--lustrous-color-surface-container-highest": "#d4d0e5",
      "--lustrous-color-on-surface": "#18181b",
      "--lustrous-color-on-surface-variant": "#52525b",
      "--lustrous-color-outline": "#71717a",
      "--lustrous-color-outline-variant": "#d4d4d8",
      "--lustrous-color-primary": "#6d28d9",
      "--lustrous-color-on-primary": "#ffffff",
      "--lustrous-color-primary-container": "#ede9fe",
      "--lustrous-color-on-primary-container": "#2e1065",
      "--lustrous-color-accent": "#6d28d9",
      "--lustrous-color-on-accent": "#ffffff",
      "--lustrous-color-accent-container": "#ede9fe",
      "--lustrous-color-on-accent-container": "#2e1065",
      "--lustrous-color-accent-fixed": "#7c3aed",
    },
    dark: {
      "--lustrous-color-background": "#09090b",
      "--lustrous-color-on-background": "#e4e4e7",
      "--lustrous-color-surface": "#121217",
      "--lustrous-color-surface-bright": "#1e1e26",
      "--lustrous-color-surface-dim": "#0c0c10",
      "--lustrous-color-surface-container-low": "#17171e",
      "--lustrous-color-surface-container": "#1d1d26",
      "--lustrous-color-surface-container-high": "#272733",
      "--lustrous-color-surface-container-highest": "#343444",
      "--lustrous-color-on-surface": "#f4f4f5",
      "--lustrous-color-on-surface-variant": "#a1a1aa",
      "--lustrous-color-outline": "#878792",
      "--lustrous-color-outline-variant": "#32323e",
      "--lustrous-color-primary": "#c4b5fd",
      "--lustrous-color-on-primary": "#2e1065",
      "--lustrous-color-primary-container": "#4c1d95",
      "--lustrous-color-on-primary-container": "#ede9fe",
      "--lustrous-color-accent": "#a78bfa",
      "--lustrous-color-on-accent": "#1e0b4b",
      "--lustrous-color-accent-container": "#3b1a78",
      "--lustrous-color-on-accent-container": "#ede9fe",
      "--lustrous-color-accent-fixed": "#8b5cf6",
    },
  },
  {
    id: "oceanic",
    name: "Oceanic Soft",
    tagline: "Generous 16px radii & coastal cyan-blue",
    defaultRadius: "soft",
    swatchLight: "#0369a1",
    swatchDark: "#38bdf8",
    swatchSurface: "#eef6fa",
    light: {
      "--lustrous-color-background": "#f5f9fc",
      "--lustrous-color-on-background": "#0c1e2b",
      "--lustrous-color-surface": "#ffffff",
      "--lustrous-color-surface-bright": "#ffffff",
      "--lustrous-color-surface-dim": "#eaf2f7",
      "--lustrous-color-surface-container-low": "#f2f7fa",
      "--lustrous-color-surface-container": "#e8f0f6",
      "--lustrous-color-surface-container-high": "#d9e6ef",
      "--lustrous-color-surface-container-highest": "#c5d8e6",
      "--lustrous-color-on-surface": "#0c1e2b",
      "--lustrous-color-on-surface-variant": "#3d5669",
      "--lustrous-color-outline": "#597487",
      "--lustrous-color-outline-variant": "#c4d6e3",
      "--lustrous-color-primary": "#0369a1",
      "--lustrous-color-on-primary": "#ffffff",
      "--lustrous-color-primary-container": "#e0f2fe",
      "--lustrous-color-on-primary-container": "#082f49",
      "--lustrous-color-accent": "#0369a1",
      "--lustrous-color-on-accent": "#ffffff",
      "--lustrous-color-accent-container": "#e0f2fe",
      "--lustrous-color-on-accent-container": "#082f49",
      "--lustrous-color-accent-fixed": "#0284c7",
    },
    dark: {
      "--lustrous-color-background": "#071018",
      "--lustrous-color-on-background": "#e0eef7",
      "--lustrous-color-surface": "#0d1924",
      "--lustrous-color-surface-bright": "#162838",
      "--lustrous-color-surface-dim": "#09131c",
      "--lustrous-color-surface-container-low": "#11202e",
      "--lustrous-color-surface-container": "#162838",
      "--lustrous-color-surface-container-high": "#1f3548",
      "--lustrous-color-surface-container-highest": "#2a455c",
      "--lustrous-color-on-surface": "#edf6fc",
      "--lustrous-color-on-surface-variant": "#94b0c4",
      "--lustrous-color-outline": "#7694aa",
      "--lustrous-color-outline-variant": "#294154",
      "--lustrous-color-primary": "#7dd3fc",
      "--lustrous-color-on-primary": "#082f49",
      "--lustrous-color-primary-container": "#075985",
      "--lustrous-color-on-primary-container": "#e0f2fe",
      "--lustrous-color-accent": "#38bdf8",
      "--lustrous-color-on-accent": "#051926",
      "--lustrous-color-accent-container": "#0c4a6e",
      "--lustrous-color-on-accent-container": "#e0f2fe",
      "--lustrous-color-accent-fixed": "#0ea5e9",
    },
  },
];

export const DEFAULT_BRAND_STATE: BrandCustomizationState = {
  preset: "default",
  radius: "preset",
  monoDisplay: false,
};

const BRAND_STORAGE_KEY = "meridian.brand";

export function getBrandPreset(id: BrandPresetId): BrandPresetSpec {
  return BRAND_PRESETS.find((p) => p.id === id) ?? BRAND_PRESETS[0]!;
}

function formatDecls(entries: Readonly<Record<string, string>>, indent = "  "): string {
  return Object.entries(entries)
    .map(([k, v]) => `${indent}${k}: ${v};`)
    .join("\n");
}

/**
 * Generates the exact unlayered CSS override stylesheet for a brand customization state.
 * Because Lustrous wraps its defaults inside `@layer lustrous`, these unlayered rules
 * win with zero `!important` flags.
 */
export function buildBrandOverrideCss(state: BrandCustomizationState): string {
  const spec = getBrandPreset(state.preset);
  const resolvedRadiusKey = state.radius === "preset" ? spec.defaultRadius : state.radius;
  const includeRadius = state.preset !== "default" || state.radius !== "preset";

  const staticTokens: Record<string, string> = {};
  if (includeRadius && resolvedRadiusKey !== "architectural") {
    Object.assign(staticTokens, RADIUS_PROFILES[resolvedRadiusKey]);
  } else if (state.radius !== "preset") {
    Object.assign(staticTokens, RADIUS_PROFILES[resolvedRadiusKey]);
  }
  if (state.monoDisplay) {
    staticTokens["--lustrous-font-display"] = "var(--lustrous-font-code)";
  }

  const hasColors = Object.keys(spec.light).length > 0;
  const hasStatic = Object.keys(staticTokens).length > 0;

  if (!hasColors && !hasStatic) {
    return "";
  }

  const blocks: string[] = [];
  const rootEntries = { ...staticTokens, ...spec.light };
  if (Object.keys(rootEntries).length > 0) {
    blocks.push(`:root,\n[data-theme="light"] {\n${formatDecls(rootEntries)}\n  --lustrous-text-muted: var(--lustrous-color-on-surface-variant);\n}`);
  }

  if (hasColors) {
    const darkBody = `${formatDecls(spec.dark)}\n  --lustrous-text-muted: var(--lustrous-color-on-surface-variant);`;
    blocks.push(`[data-theme="dark"] {\n${darkBody}\n}`);
    blocks.push(`@media (prefers-color-scheme: dark) {\n  [data-theme="system"] {\n${formatDecls(spec.dark, "    ")}\n    --lustrous-text-muted: var(--lustrous-color-on-surface-variant);\n  }\n}`);
  }

  return blocks.join("\n\n");
}

/** Formats a display snippet for `<lustrous-code-block>` even when the default preset is active. */
export function formatBrandCssSnippet(state: BrandCustomizationState): string {
  const cssText = buildBrandOverrideCss(state);
  if (cssText) {
    return `/* Unlayered overrides automatically outrank @layer lustrous */\n${cssText}`;
  }
  return `/* Active preset: Lustrous Sapphire (built-in @layer lustrous defaults).
 * Pick any preset or radius profile above to generate custom token overrides: */
:root {
  --lustrous-color-primary: #1d4ed8;
  --lustrous-color-accent: #1d4ed8;
  --lustrous-radius-m: 10px;
}`;
}

let adoptedBrandSheet: CSSStyleSheet | undefined;

/** Applies `state` live onto `document` via `adoptedStyleSheets` (and optionally persists to `localStorage`). */
export function applyBrandCustomization(state: BrandCustomizationState, persist = true): void {
  if (typeof document === "undefined") return;
  const cssText = buildBrandOverrideCss(state);

  if (!adoptedBrandSheet) {
    adoptedBrandSheet = new CSSStyleSheet();
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, adoptedBrandSheet];
  }
  adoptedBrandSheet.replaceSync(cssText);

  if (persist) {
    try {
      globalThis.localStorage?.setItem(BRAND_STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore storage errors in restricted contexts */
    }
  }
}

export function readStoredBrandCustomization(): BrandCustomizationState {
  try {
    const raw = globalThis.localStorage?.getItem(BRAND_STORAGE_KEY);
    if (!raw) return DEFAULT_BRAND_STATE;
    const parsed = JSON.parse(raw) as Partial<BrandCustomizationState>;
    const validPreset = BRAND_PRESETS.some((p) => p.id === parsed.preset) ? parsed.preset! : "default";
    const validRadius: RadiusProfileId =
      parsed.radius === "sharp" || parsed.radius === "architectural" || parsed.radius === "soft"
        ? parsed.radius
        : "preset";
    return {
      preset: validPreset,
      radius: validRadius,
      monoDisplay: Boolean(parsed.monoDisplay),
    };
  } catch {
    return DEFAULT_BRAND_STATE;
  }
}
