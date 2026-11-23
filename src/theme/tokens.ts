/**
 * Lustrous Design System tokens as plain TypeScript data.
 *
 * Single source of truth for every `--lustrous-*` CSS custom property emitted by
 * `lustrousTheme` and `dist/lustrous-theme.css`.
 *
 * Naming conventions:
 * - `--lustrous-color-<kebab-name>`
 * - `--lustrous-space-<token>`
 * - `--lustrous-radius-<token>`
 * - `--lustrous-elevation-level<1|2>`
 * - `--lustrous-z-<token>`
 * - `--lustrous-font-<family>`
 * - `--lustrous-duration-<token>`, `--lustrous-easing-<token>`, `--lustrous-motion-<token>`
 */

export type ColorTokens = Record<string, string>;

/**
 * Light theme colors: Architectural Mineral Slate neutrals paired with Lustrous
 * Sapphire primary/accent and Mineral Teal tertiary. All foreground/background
 * pairs meet WCAG 2.1 AA (≥ 4.5:1 normal text, ≥ 3:1 UI boundaries).
 */
export const lightColors = {
  background: "#f8fafc",
  "on-background": "#0f172a",
  surface: "#ffffff",
  "surface-bright": "#ffffff",
  "surface-dim": "#f1f5f9",
  "surface-background": "#f8fafc",
  "surface-container-low": "#f4f7fb",
  "surface-container": "#f1f5f9",
  "surface-container-high": "#e2e8f0",
  "surface-container-highest": "#d5dee9",
  "surface-accent": "#dbeafe",
  "on-surface": "#0f172a",
  "on-surface-control": "#0f172a",
  "on-surface-variant": "#475569",
  "on-surface-low": "rgba(15, 23, 42, 0.08)",
  outline: "#64748b",
  "outline-variant": "#cbd5e1",

  primary: "#1d4ed8",
  "on-primary": "#ffffff",
  "primary-container": "#dbeafe",
  "on-primary-container": "#1e3a8a",

  accent: "#1d4ed8",
  "on-accent": "#ffffff",
  "accent-container": "#e0e7ff",
  "on-accent-container": "#1e1b4b",
  "accent-fixed": "#2563eb",

  tertiary: "#0f766e",
  "on-tertiary": "#ffffff",
  "tertiary-container": "#ccfbf1",
  "on-tertiary-container": "#134e4a",

  positive: "#047857",
  "on-positive": "#ffffff",
  "positive-container": "#d1fae5",
  "on-positive-container": "#065f46",

  warning: "#b45309",
  "on-warning": "#ffffff",
  "warning-container": "#fef3c7",
  "on-warning-container": "#92400e",

  error: "#b91c1c",
  "on-error": "#ffffff",
  "error-container": "#fee2e2",
  "on-error-container": "#991b1b",

  white: "#ffffff",
  black: "#000000",

  // State layers mix with currentColor so they adapt cleanly on any surface in both themes.
  "state-hover": "color-mix(in srgb, currentColor 8%, transparent)",
  "state-pressed": "color-mix(in srgb, currentColor 13%, transparent)",
  "state-focus": "color-mix(in srgb, currentColor 10%, transparent)",
  "state-disabled": "rgba(15, 23, 42, 0.10)",
  "state-disabled-label": "rgba(15, 23, 42, 0.38)",

  scrim: "rgba(15, 23, 42, 0.32)",
  "scrim-immersive": "rgba(10, 14, 23, 0.92)",
  elevation1: "rgba(15, 23, 42, 0.07)",
  elevation2: "rgba(15, 23, 42, 0.14)",

  // Dual-theme categorical palette (for badges, tags, and status chips)
  "category-cobalt": "#dbeafe",
  "on-category-cobalt": "#1e40af",
  "category-emerald": "#d1fae5",
  "on-category-emerald": "#065f46",
  "category-amber": "#fef3c7",
  "on-category-amber": "#92400e",
  "category-rose": "#ffe4e6",
  "on-category-rose": "#9f1239",
  "category-violet": "#ede9fe",
  "on-category-violet": "#5b21b6",
  "category-teal": "#ccfbf1",
  "on-category-teal": "#115e59",

  // Code surfaces & syntax tokens
  "code-background": "#0f172a",
  "code-primary-text": "#f8fafc",
  "code-comment": "rgba(248, 250, 252, 0.62)",
  "code-outline": "rgba(248, 250, 252, 0.14)",
  "code-grey-text": "#94a3b8",
  "code-blue-text": "#60a5fa",
  "code-pink-text": "#f472b6",
  "code-yellow-text": "#fbbf24",
  "code-green-text": "#34d399",
  "code-red-text": "#f87171",
  "code-purple-text": "#a78bfa",
  "code-teal-text": "#2dd4bf",

  // Data visualization series
  data1: "#1d4ed8",
  "data1-hover": "#3b82f6",
  "data1-focus": "#3b82f6",
  "data1-pressed": "#1e40af",
  data2: "#0f766e",
  "data2-hover": "#14b8a6",
  "data2-focus": "#14b8a6",
  "data2-pressed": "#115e59",
  data3: "#6d28d9",
  "data3-hover": "#8b5cf6",
  "data3-focus": "#8b5cf6",
  "data3-pressed": "#5b21b6",
  data4: "#b45309",
  "data4-hover": "#f59e0b",
  "data4-focus": "#f59e0b",
  "data4-pressed": "#92400e",
  data5: "#be123c",
  "data5-hover": "#f43f5e",
  "data5-focus": "#f43f5e",
  "data5-pressed": "#9f1239",
} as const satisfies ColorTokens;

export type LustrousColorToken = keyof typeof lightColors;

/** Dark theme overrides: Obsidian Mineral Slate + Lustrous Sapphire. */
export const darkColors: Partial<Record<LustrousColorToken, string>> = {
  background: "#0b0f17",
  "on-background": "#e2e8f0",
  surface: "#111827",
  "surface-bright": "#1f2937",
  "surface-dim": "#0d131f",
  "surface-background": "#0b0f17",
  "surface-container-low": "#151d2e",
  "surface-container": "#1a2336",
  "surface-container-high": "#232f46",
  "surface-container-highest": "#2e3c56",
  "surface-accent": "#172554",
  "on-surface": "#f1f5f9",
  "on-surface-control": "#f1f5f9",
  "on-surface-variant": "#9aa9be",
  "on-surface-low": "rgba(241, 245, 249, 0.10)",
  outline: "#8496ae",
  "outline-variant": "#334155",

  primary: "#93c5fd",
  "on-primary": "#0c2461",
  "primary-container": "#1e3a8a",
  "on-primary-container": "#dbeafe",

  accent: "#60a5fa",
  "on-accent": "#081226",
  "accent-container": "#1e2b58",
  "on-accent-container": "#e0e7ff",
  "accent-fixed": "#3b82f6",

  tertiary: "#5eead4",
  "on-tertiary": "#042f2e",
  "tertiary-container": "#115e59",
  "on-tertiary-container": "#ccfbf1",

  positive: "#34d399",
  "on-positive": "#022c22",
  "positive-container": "#064e3b",
  "on-positive-container": "#d1fae5",

  warning: "#fbbf24",
  "on-warning": "#451a03",
  "warning-container": "#78350f",
  "on-warning-container": "#fef3c7",

  error: "#f87171",
  "on-error": "#450a0a",
  "error-container": "#7f1d1d",
  "on-error-container": "#fee2e2",

  "state-disabled": "rgba(241, 245, 249, 0.12)",
  "state-disabled-label": "rgba(241, 245, 249, 0.38)",

  scrim: "rgba(0, 0, 0, 0.56)",
  "scrim-immersive": "rgba(8, 12, 20, 0.92)",
  elevation1: "rgba(0, 0, 0, 0.36)",
  elevation2: "rgba(0, 0, 0, 0.52)",

  "category-cobalt": "#172554",
  "on-category-cobalt": "#bfdbfe",
  "category-emerald": "#064e3b",
  "on-category-emerald": "#a7f3d0",
  "category-amber": "#451a03",
  "on-category-amber": "#fde68a",
  "category-rose": "#4c0519",
  "on-category-rose": "#fecdd3",
  "category-violet": "#2e1065",
  "on-category-violet": "#ddd6fe",
  "category-teal": "#134e4a",
  "on-category-teal": "#99f6e4",

  "code-background": "#0d131f",
  "code-primary-text": "#f1f5f9",
  "code-comment": "rgba(241, 245, 249, 0.62)",
  "code-outline": "rgba(241, 245, 249, 0.14)",
  "code-grey-text": "#94a3b8",
  "code-blue-text": "#93c5fd",
  "code-pink-text": "#f9a8d4",
  "code-yellow-text": "#fde047",
  "code-green-text": "#6ee7b7",
  "code-red-text": "#fca5a5",
  "code-purple-text": "#c4b5fd",
  "code-teal-text": "#5eead4",

  data1: "#60a5fa",
  "data1-hover": "#93c5fd",
  "data1-focus": "#93c5fd",
  "data1-pressed": "#3b82f6",
  data2: "#2dd4bf",
  "data2-hover": "#5eead4",
  "data2-focus": "#5eead4",
  "data2-pressed": "#14b8a6",
  data3: "#a78bfa",
  "data3-hover": "#c4b5fd",
  "data3-focus": "#c4b5fd",
  "data3-pressed": "#8b5cf6",
  data4: "#fbbf24",
  "data4-hover": "#fde68a",
  "data4-focus": "#fde68a",
  "data4-pressed": "#f59e0b",
  data5: "#fb7185",
  "data5-hover": "#fda4af",
  "data5-focus": "#fda4af",
  "data5-pressed": "#f43f5e",
};

/** Spacing scale (`--lustrous-space-*`). */
export const spacing = {
  xs: "4px",
  s: "8px",
  m: "12px",
  l: "16px",
  xl: "20px",
  "2xl": "24px",
  "3xl": "32px",
  "4xl": "48px",
} as const;
export type LustrousSpacingToken = keyof typeof spacing;

/** Border-radius scale (`--lustrous-radius-*`). */
export const radius = {
  none: "0px",
  xs: "4px",
  s: "6px",
  m: "10px",
  l: "14px",
  xl: "20px",
  "2xl": "28px",
  full: "9999px",
} as const;
export type LustrousRadiusToken = keyof typeof radius;

/** Z-index layers (`--lustrous-z-*`). */
export const zIndex = {
  base: "0",
  modal: "30000",
  dropdown: "40000",
  tooltip: "50000",
  snackbar: "60000",
} as const;
export type LustrousZIndexToken = keyof typeof zIndex;

/** Font stacks (`--lustrous-font-*`). Bundled OFL-1.1 Google Sans Flex + Google Sans Code. */
export const fonts = {
  display:
    '"Google Sans Flex", "Google Sans Display", "Google Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  body: '"Google Sans Flex", "Google Sans Text", "Google Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  sans: '"Google Sans Flex", "Google Sans Text", "Google Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  code: '"Google Sans Code", "Google Sans Mono", "Roboto Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
} as const;

/** Media queries for CSS generation, `matchMedia`, and responsive controllers. */
export const breakpoints = {
  mobile: "(max-width: 768px)",
  desktop: "(min-width: 769px)",
  shellMobile: "(max-width: 959.98px)",
  shellDesktop: "(min-width: 960px)",
  reducedMotion: "(prefers-reduced-motion: reduce)",
  forcedColors: "(forced-colors: active)",
  darkMode: "(prefers-color-scheme: dark)",
} as const;
export type LustrousBreakpoint = keyof typeof breakpoints;

export interface TypographyVariantSpec {
  family: keyof typeof fonts;
  size: string;
  lineHeight: string;
  weight?: number;
  /** `font-variation-settings` axes (Google Sans Flex: wdth, wght, opsz, ROND). */
  axes?: string;
  italic?: boolean;
  letterSpacing?: string;
  textTransform?: string;
}

/**
 * Lustrous typography scale: crisp editorial proportions using Google Sans Flex
 * (`ROND` 25 on display, `ROND` 10 on headlines, `ROND` 0 on body) and Google Sans Code.
 */
export const typography = {
  "display-large": {
    family: "display",
    size: "44px",
    lineHeight: "52px",
    weight: 500,
    axes: "'wdth' 100, 'wght' 500, 'ROND' 25",
    letterSpacing: "-0.02em",
  },
  "display-medium": {
    family: "display",
    size: "36px",
    lineHeight: "44px",
    weight: 500,
    axes: "'wdth' 100, 'wght' 500, 'ROND' 25",
    letterSpacing: "-0.015em",
  },
  "display-small": {
    family: "display",
    size: "30px",
    lineHeight: "38px",
    weight: 520,
    axes: "'wdth' 100, 'wght' 520, 'ROND' 20",
    letterSpacing: "-0.01em",
  },
  "headline-large": {
    family: "display",
    size: "26px",
    lineHeight: "34px",
    weight: 560,
    axes: "'wdth' 100, 'wght' 560, 'ROND' 10",
    letterSpacing: "-0.01em",
  },
  "headline-medium": {
    family: "display",
    size: "22px",
    lineHeight: "28px",
    weight: 560,
    axes: "'wdth' 100, 'wght' 560, 'ROND' 10",
    letterSpacing: "-0.005em",
  },
  "headline-small": {
    family: "display",
    size: "18px",
    lineHeight: "24px",
    weight: 600,
    axes: "'wdth' 98, 'wght' 600, 'ROND' 10",
  },
  "body-large": {
    family: "body",
    size: "17px",
    lineHeight: "26px",
    weight: 400,
    axes: "'wdth' 98, 'wght' 400, 'ROND' 0",
  },
  "body-large-emphasized": {
    family: "body",
    size: "17px",
    lineHeight: "26px",
    weight: 560,
    axes: "'wdth' 98, 'wght' 560, 'ROND' 0",
  },
  "body-medium": {
    family: "body",
    size: "15px",
    lineHeight: "22px",
    weight: 400,
    axes: "'wdth' 98, 'wght' 400, 'ROND' 0",
  },
  "body-medium-emphasized": {
    family: "body",
    size: "15px",
    lineHeight: "22px",
    weight: 560,
    axes: "'wdth' 98, 'wght' 560, 'ROND' 0",
  },
  "body-small": {
    family: "body",
    size: "13px",
    lineHeight: "18px",
    weight: 400,
    axes: "'wdth' 98, 'wght' 400, 'ROND' 0",
  },
  "body-small-emphasized": {
    family: "body",
    size: "13px",
    lineHeight: "18px",
    weight: 580,
    axes: "'wdth' 98, 'wght' 580, 'ROND' 0",
  },
  lead: {
    family: "display",
    size: "20px",
    lineHeight: "28px",
    weight: 430,
    axes: "'wdth' 99, 'wght' 430, 'ROND' 10",
  },
  blockquote: {
    family: "body",
    size: "20px",
    lineHeight: "30px",
    italic: true,
  },
  callout: {
    family: "body",
    size: "16px",
    lineHeight: "24px",
    weight: 500,
    axes: "'wdth' 98, 'wght' 500, 'ROND' 0",
  },
  caption: {
    family: "body",
    size: "12px",
    lineHeight: "16px",
    weight: 450,
    axes: "'wdth' 98, 'wght' 450, 'ROND' 0",
  },
  code: {
    family: "code",
    size: "14px",
    lineHeight: "20px",
    weight: 400,
  },
  overline: {
    family: "body",
    size: "11px",
    lineHeight: "16px",
    weight: 650,
    axes: "'wdth' 100, 'wght' 650, 'ROND' 0",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
} as const satisfies Record<string, TypographyVariantSpec>;

/** Display and headline variants step down one notch on mobile (≤768px). */
export const mobileTypographySteps = {
  "display-large": "display-medium",
  "display-medium": "display-small",
  "display-small": "headline-large",
  "headline-large": "headline-medium",
  "headline-medium": "headline-small",
} as const;

export type LustrousTextVariant = keyof typeof typography;

/** Icon size scale in px. */
export const iconSizes = { xs: 16, s: 20, m: 24, l: 32, xl: 40 } as const;
/** SVG stroke width (in the 24-unit icon grid) per size: larger icons render with optically lighter strokes. */
export const iconStrokes = { xs: 1.85, s: 1.75, m: 1.65, l: 1.35, xl: 1.3 } as const;
export type LustrousIconSize = keyof typeof iconSizes;

/** Reference motion duration tokens (`--lustrous-duration-*`). */
export const durations = {
  instant: "0ms",
  short50: "50ms",
  short100: "100ms",
  short150: "150ms",
  short200: "200ms",
  medium250: "250ms",
  medium300: "300ms",
  medium350: "350ms",
  medium400: "400ms",
  long450: "450ms",
  long500: "500ms",
  long600: "600ms",
  extralong750: "750ms",
  extralong1000: "1000ms",
} as const;
export type LustrousDuration = keyof typeof durations;

/** Reference motion easing tokens (`--lustrous-easing-*`). */
export const easings = {
  standard: "cubic-bezier(0.2, 0, 0, 1)",
  "standard-decelerate": "cubic-bezier(0, 0, 0, 1)",
  "standard-accelerate": "cubic-bezier(0.3, 0, 1, 1)",
  "standard-neutral": "cubic-bezier(0.62, 0, 0.33, 1)",
  linear: "cubic-bezier(0, 0, 1, 1)",
  emphasized: "cubic-bezier(0.35, 0, 0, 1)",
  "emphasized-decelerate": "cubic-bezier(0.05, 0.7, 0.1, 1)",
  "emphasized-accelerate": "cubic-bezier(0.3, 0, 0.8, 0.15)",
  "spring-standard": "cubic-bezier(0.27, 1.06, 0.18, 1)",
} as const;
export type LustrousEasing = keyof typeof easings;

/** Paired system motion tokens (`--lustrous-motion-*`). */
export const motion = {
  "fade-through": `${durations.short50} ${easings.linear}`,
  "fast-fade": `${durations.short100} ${easings.linear}`,
  fade: `${durations.short150} ${easings.linear}`,
  "scale-in": `${durations.short150} ${easings.standard}`,
  "scale-out": `${durations.short100} ${easings["standard-neutral"]}`,
  lateral: `${durations.medium350} ${easings.standard}`,
  "shared-axis-x": `${durations.medium350} ${easings.standard}`,
  "shared-axis-y": `${durations.medium350} ${easings.standard}`,
  "fast-shared-axis-y": `${durations.short200} ${easings.standard}`,
  "bottom-enter": `${durations.long450} ${easings.emphasized}`,
  "bottom-exit": `${durations.medium250} ${easings["standard-neutral"]}`,
  "container-transform-enter": `${durations.long450} ${easings.emphasized}`,
  "container-transform-exit": `${durations.long450} ${easings.emphasized}`,
  "fast-spatial": `${durations.medium350} ${easings["spring-standard"]}`,
  "default-spatial": `${durations.long500} ${easings["spring-standard"]}`,
  "slow-spatial": `${durations.extralong750} ${easings["spring-standard"]}`,
} as const;
export type LustrousMotion = keyof typeof motion;
