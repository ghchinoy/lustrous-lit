# Theming, Tokens & Typography

Lustrous Design System (`@ghchinoy/lustrous-lit`) uses an architectural **Mineral Slate** neutral ramp paired with **Lustrous Sapphire** primary/accent tones and **Mineral Teal** tertiary accents. Every foreground/background token pair is calibrated to meet **WCAG 2.1 AA** (`≥ 4.5:1` for text, `≥ 3:1` for interactive boundaries) across both light and dark modes.

---

## Quick Start

For zero-FOUC rendering (including Declarative Shadow DOM before JavaScript loads), link the Lustrous theme and bundled font stylesheets in `<head>` and set `data-theme` plus `class="lustrous-root"` on `<html>`:

```html
<!doctype html>
<html lang="en" data-theme="system" class="lustrous-root">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="/node_modules/@ghchinoy/lustrous-lit/dist/lustrous-theme.css" />
    <link rel="stylesheet" href="/node_modules/@ghchinoy/lustrous-lit/fonts/lustrous-fonts.css" />
  </head>
  <body>
    <lustrous-button icon="bolt">Launch</lustrous-button>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

With a bundler (Vite, Rollup, Webpack, esbuild), import the package CSS entry points in your application entry module:

```ts
import "@ghchinoy/lustrous-lit/theme.css";
import "@ghchinoy/lustrous-lit/fonts.css";
import "@ghchinoy/lustrous-lit";
```

### Zero-Config Adoption

Every component extending `LustrousElement` calls `installLustrousTheme(this.ownerDocument)` idempotently in `connectedCallback()`. If you drop a `<lustrous-button>` onto a page without linking `theme.css`, Lustrous automatically adopts `lustrousTheme` via `document.adoptedStyleSheets` (falling back to a `<style data-lustrous-theme>` element in `<head>`). Linking `@ghchinoy/lustrous-lit/theme.css` up front is still recommended so page backgrounds and server-rendered Declarative Shadow DOM paint immediately before scripts execute.

---

## Cascade Layers (`@layer lustrous`)

`lustrous-theme.css` (and `lustrousThemeCssText`) wraps every rule inside `@layer lustrous`:

```css
@layer lustrous {
  :root { /* light tokens + static spacing, radius, z-index, font, and motion tokens */ }
  [data-theme="light"], [data-lustrous-theme="light"] { /* light tokens + color-scheme: light */ }
  [data-theme="dark"], [data-lustrous-theme="dark"] { /* dark tokens + color-scheme: dark */ }
  @media (prefers-color-scheme: dark) {
    [data-theme="system"], [data-lustrous-theme="system"] { /* dark tokens + color-scheme: dark */ }
  }
  .lustrous-root { /* document surface, text color, body font, smoothing */ }
  .lustrous-display-large { /* ... */ }
}
```

Because CSS Cascade Layers place **unlayered styles above all `@layer` blocks**, your application overrides win without `!important` or specificity workarounds:

```css
/* Application stylesheet (unlayered — wins over @layer lustrous automatically) */
:root {
  --lustrous-color-primary: #0369a1;
  --lustrous-color-accent: #0284c7;
  --lustrous-radius-m: 8px;
}

[data-theme="dark"] {
  --lustrous-color-primary: #7dd3fc;
  --lustrous-color-accent: #38bdf8;
}
```

> **Note on derived tokens:** CSS custom properties resolve `var()` references on the element where the property is declared. Whenever `[data-theme]` switches color scopes, Lustrous also re-declares `--lustrous-elevation-level1`, `--lustrous-elevation-level2`, and `--lustrous-text-muted` so shadows and secondary text always track the active surface palette.

---

## Theme Switching & Nested Theme Islands

Lustrous themes update via CSS custom properties and the standard `color-scheme` property, requiring no JavaScript re-render pass when switching modes. Both `data-theme` and `data-lustrous-theme` attributes are recognized:

- `data-theme="light"` — Forces Mineral Slate light tokens and `color-scheme: light`.
- `data-theme="dark"` — Forces Obsidian Slate dark tokens and `color-scheme: dark`.
- `data-theme="system"` — Follows `@media (prefers-color-scheme: dark)` automatically.

### Theme Helpers (`@ghchinoy/lustrous-lit/theme`)

```ts
import {
  readLustrousThemePreference,
  resolveLustrousTheme,
  setLustrousTheme,
  type LustrousThemePreference,
} from "@ghchinoy/lustrous-lit/theme";

const STORAGE_KEY = "app-theme";

// Restore persisted preference on startup ("light" | "dark" | "system")
const initial: LustrousThemePreference = readLustrousThemePreference(STORAGE_KEY, "system");
setLustrousTheme(initial, { storageKey: STORAGE_KEY });

// Switch to dark mode and persist to localStorage (safe in sandboxed/private contexts)
setLustrousTheme("dark", { storageKey: STORAGE_KEY });

// Inspect the effective concrete theme ("light" | "dark") for any element
const effective = resolveLustrousTheme(document.documentElement);
```

- `setLustrousTheme(preference, { root?, storageKey? })` sets `dataset.theme` on `root` (defaults to `document.documentElement`) and optionally persists the choice to `localStorage`.
- `readLustrousThemePreference(storageKey, fallback = "system")` safely reads a saved preference, returning `fallback` when unset or when storage access is blocked.
- `resolveLustrousTheme(el?)` walks up parent elements and enclosing `ShadowRoot.host` boundaries to the nearest `data-theme` / `data-lustrous-theme` attribute, resolving `"system"` (or no attribute) via `matchMedia("(prefers-color-scheme: dark)")`.

### Nested Theme Islands

Because `[data-theme="dark"]` and `[data-theme="light"]` apply to any element, you can create localized theme islands (such as a dark inspector sidebar or preview stage inside a light page) without affecting surrounding UI:

```html
<lustrous-flex direction="column" gap="l" padding="2xl" background="surface">
  <lustrous-text variant="headline-small">Light Workspace</lustrous-text>

  <!-- Nested dark island -->
  <div data-theme="dark">
    <lustrous-box padding="l" border-radius="l" background="surface-container" border>
      <lustrous-flex align="center" justify="space-between" gap="m">
        <lustrous-text>Rendered with dark tokens and dark color-scheme</lustrous-text>
        <lustrous-button variant="accent" size="s" icon="bolt">Run</lustrous-button>
      </lustrous-flex>
    </lustrous-box>
  </div>
</lustrous-flex>
```

---

## Shadow-Root Theme Scoping

When embedding a component inside a host page you do not control, or when building an always-dark chrome surface (such as media lightboxes), you have two options:

1. **Adopt the full theme sheet into an isolated `ShadowRoot`:**
   ```ts
   import { installLustrousTheme } from "@ghchinoy/lustrous-lit/theme";

   installLustrousTheme(myWidget.shadowRoot!);
   ```
2. **Apply selector-free theme declarations (`lustrousDarkDeclarations` / `lustrousLightDeclarations`):**
   ```ts
   import { css } from "lit";
   import {
     LustrousElement,
     lustrousBase,
     lustrousDarkDeclarations,
     lustrousLightDeclarations,
   } from "@ghchinoy/lustrous-lit/theme";

   export class MediaStage extends LustrousElement {
     static override styles = [
       lustrousBase,
       css`
         :host {
           display: block;
           ${lustrousDarkDeclarations}
         }
         :host([daylight]) {
           ${lustrousLightDeclarations}
         }
       `,
     ];
   }
   ```

---

## Global UI & Accessibility Localization (`setLustrousLabels`)

Built-in dismissible surfaces (`<lustrous-dialog>`, `<lustrous-banner>`, `<lustrous-photo-lightbox>`, `<lustrous-video-lightbox>`, and `<lustrous-snackbar>`) read shared fallback ARIA labels when per-instance attributes (`close-label`, `label`) are omitted. Call `setLustrousLabels()` at startup or when switching locales:

```ts
import { getLustrousLabels, setLustrousLabels } from "@ghchinoy/lustrous-lit/theme";

setLustrousLabels({
  close: "Fermer",
  dismiss: "Ignorer",
  notificationBanner: "Bannière d’information",
  notifications: "Notifications",
});

// Read active labels
const labels = getLustrousLabels();
```

| Key | Default (`DEFAULT_LUSTROUS_LABELS`) | Used By |
| :-- | :-- | :-- |
| `close` | `"Close"` | `<lustrous-dialog>`, `<lustrous-photo-lightbox>`, `<lustrous-video-lightbox>`, `<lustrous-snackbar>` |
| `dismiss` | `"Dismiss"` | `<lustrous-banner>` |
| `notificationBanner` | `"Notification banner"` | `<lustrous-banner>` fallback region name when `heading` is unset |
| `notifications` | `"Notifications"` | `<lustrous-snackbar>` viewport landmark `aria-label` |

Calling `setLustrousLabels()` with no arguments resets all labels to `DEFAULT_LUSTROUS_LABELS`.

---

## Bundled OFL-1.1 Fonts

`@ghchinoy/lustrous-lit` ships self-hosted Latin + Latin-Extended variable WOFF2 subsets licensed under the **SIL Open Font License 1.1** (`fonts/OFL-GoogleSansFlex.txt` and `fonts/OFL-GoogleSansCode.txt`):

| Font Family | File | Variable Axes | Usage |
| :-- | :-- | :-- | :-- |
| **Google Sans Flex** | `GoogleSansFlex-latin.woff2` | `wght` 1–1000, `wdth` 75–100, `opsz` 6–72, `ROND` 0–100 | Display (`ROND` 20–25), Headlines (`ROND` 10), Body & UI (`ROND` 0) |
| **Google Sans Code** | `GoogleSansCode-latin.woff2` | `wght` 300–800 (normal) | `<lustrous-kbd>`, `<lustrous-code-block>`, `variant="code"` |
| **Google Sans Code** | `GoogleSansCode-Italic-latin.woff2` | `wght` 300–800 (italic) | Italic code annotations |

### Loading Fonts

Because browser `@font-face` declarations only take effect at document level (not inside shadow stylesheets), load them once per page via either CSS or JavaScript:

1. **Stylesheet (recommended):**
   ```ts
   import "@ghchinoy/lustrous-lit/fonts.css";
   ```
   Or in HTML:
   ```html
   <link rel="stylesheet" href="/node_modules/@ghchinoy/lustrous-lit/fonts/lustrous-fonts.css" />
   ```
2. **Programmatic helper (`installLustrousFonts`):**
   ```ts
   import { installLustrousFonts } from "@ghchinoy/lustrous-lit/theme";

   // Uses import.meta.url relative path by default, or accepts a custom CDN/static asset base URL:
   installLustrousFonts("/static/fonts/");
   ```

For non-Latin scripts (CJK, Arabic, Hebrew, Devanagari), load the full families from Google Fonts or configure system fallbacks via `--lustrous-font-display` and `--lustrous-font-body`.

---

## Token Reference

All TypeScript token maps (`lightColors`, `darkColors`, `spacing`, `radius`, `zIndex`, `fonts`, `breakpoints`, `typography`, `iconSizes`, `iconStrokes`, `durations`, `easings`, `motion`) are exported side-effect-free from `@ghchinoy/lustrous-lit/theme`.

### Surfaces, Text & Outlines

| CSS Custom Property | Light Value | Dark Value | Role |
| :-- | :-- | :-- | :-- |
| `--lustrous-color-background` | `#f8fafc` | `#0b0f17` | Document canvas background (`.lustrous-root`) |
| `--lustrous-color-on-background` | `#0f172a` | `#e2e8f0` | Primary text on document canvas |
| `--lustrous-color-surface` | `#ffffff` | `#111827` | Default component and card surface |
| `--lustrous-color-surface-bright` | `#ffffff` | `#1f2937` | Elevated cards, popovers, menus, dialogs |
| `--lustrous-color-surface-dim` | `#f1f5f9` | `#0d131f` | Recessed tracks, inline banners, active pills |
| `--lustrous-color-surface-background` | `#f8fafc` | `#0b0f17` | App-shell background |
| `--lustrous-color-surface-container-low` | `#f8fafc` | `#151d2e` | Subtle grouped surface |
| `--lustrous-color-surface-container` | `#f1f5f9` | `#1a2336` | Standard container fill (`<lustrous-kbd>`, cards) |
| `--lustrous-color-surface-container-high` | `#e2e8f0` | `#232f46` | Tonal buttons, progress tracks, default badges |
| `--lustrous-color-surface-container-highest` | `#cbd5e1` | `#2e3c56` | Scrollbar thumbs, active dark segmented pills |
| `--lustrous-color-surface-accent` | `#dbeafe` | `#172554` | Tinted accent surface |
| `--lustrous-color-on-surface` | `#0f172a` | `#f1f5f9` | Primary foreground text and icons |
| `--lustrous-color-on-surface-control` | `#0f172a` | `#f1f5f9` | Interactive control foreground |
| `--lustrous-color-on-surface-variant` | `#475569` | `#94a3b8` | Secondary copy, captions, supporting text |
| `--lustrous-color-on-surface-low` | `rgba(15, 23, 42, 0.08)` | `rgba(241, 245, 249, 0.10)` | Skeleton shimmer base, subtle fills |
| `--lustrous-color-outline` | `#64748b` | `#8496ae` | Accessible 3:1 control borders (inputs, switches) |
| `--lustrous-color-outline-variant` | `#cbd5e1` | `#334155` | Hairline dividers and card borders |
| `--lustrous-text-muted` | `var(--lustrous-color-on-surface-variant)` | `var(--lustrous-color-on-surface-variant)` | Context-adaptive secondary text (auto-adjusted by `<lustrous-box background="...">`) |

### Brand & Semantic Status Colors

| CSS Custom Property | Light Value | Dark Value |
| :-- | :-- | :-- |
| `--lustrous-color-primary` | `#1d4ed8` | `#93c5fd` |
| `--lustrous-color-on-primary` | `#ffffff` | `#0c2461` |
| `--lustrous-color-primary-container` | `#dbeafe` | `#1e3a8a` |
| `--lustrous-color-on-primary-container` | `#1e3a8a` | `#dbeafe` |
| `--lustrous-color-accent` | `#1d4ed8` | `#60a5fa` |
| `--lustrous-color-on-accent` | `#ffffff` | `#081226` |
| `--lustrous-color-accent-container` | `#e0e7ff` | `#1e2b58` |
| `--lustrous-color-on-accent-container` | `#1e1b4b` | `#e0e7ff` |
| `--lustrous-color-accent-fixed` | `#2563eb` | `#3b82f6` |
| `--lustrous-color-tertiary` | `#0f766e` | `#5eead4` |
| `--lustrous-color-on-tertiary` | `#ffffff` | `#042f2e` |
| `--lustrous-color-tertiary-container` | `#ccfbf1` | `#115e59` |
| `--lustrous-color-on-tertiary-container` | `#134e4a` | `#ccfbf1` |
| `--lustrous-color-positive` | `#047857` | `#34d399` |
| `--lustrous-color-on-positive` | `#ffffff` | `#022c22` |
| `--lustrous-color-positive-container` | `#d1fae5` | `#064e3b` |
| `--lustrous-color-on-positive-container` | `#065f46` | `#d1fae5` |
| `--lustrous-color-warning` | `#b45309` | `#fbbf24` |
| `--lustrous-color-on-warning` | `#ffffff` | `#451a03` |
| `--lustrous-color-warning-container` | `#fef3c7` | `#78350f` |
| `--lustrous-color-on-warning-container` | `#92400e` | `#fef3c7` |
| `--lustrous-color-error` | `#b91c1c` | `#f87171` |
| `--lustrous-color-on-error` | `#ffffff` | `#450a0a` |
| `--lustrous-color-error-container` | `#fee2e2` | `#7f1d1d` |
| `--lustrous-color-on-error-container` | `#991b1b` | `#fee2e2` |

### Dual-Theme Categorical Palette

Designed for `<lustrous-badge tone="...">`, category chips, and multi-tenant labels with automatic light/dark contrast preservation:

| Tone | Background Token | Light | Dark | Foreground Token | Light | Dark |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| `cobalt` | `--lustrous-color-category-cobalt` | `#dbeafe` | `#172554` | `--lustrous-color-on-category-cobalt` | `#1e40af` | `#bfdbfe` |
| `emerald` | `--lustrous-color-category-emerald` | `#d1fae5` | `#064e3b` | `--lustrous-color-on-category-emerald` | `#065f46` | `#a7f3d0` |
| `amber` | `--lustrous-color-category-amber` | `#fef3c7` | `#451a03` | `--lustrous-color-on-category-amber` | `#92400e` | `#fde68a` |
| `rose` | `--lustrous-color-category-rose` | `#ffe4e6` | `#4c0519` | `--lustrous-color-on-category-rose` | `#9f1239` | `#fecdd3` |
| `violet` | `--lustrous-color-category-violet` | `#ede9fe` | `#2e1065` | `--lustrous-color-on-category-violet` | `#5b21b6` | `#ddd6fe` |
| `teal` | `--lustrous-color-category-teal` | `#ccfbf1` | `#134e4a` | `--lustrous-color-on-category-teal` | `#115e59` | `#99f6e4` |

### State Layers, Scrims & Elevation

| CSS Custom Property | Light Value | Dark Value |
| :-- | :-- | :-- |
| `--lustrous-color-state-hover` | `color-mix(in srgb, currentColor 8%, transparent)` | *(inherited)* |
| `--lustrous-color-state-focus` | `color-mix(in srgb, currentColor 10%, transparent)` | *(inherited)* |
| `--lustrous-color-state-pressed` | `color-mix(in srgb, currentColor 13%, transparent)` | *(inherited)* |
| `--lustrous-color-state-disabled` | `rgba(15, 23, 42, 0.10)` | `rgba(241, 245, 249, 0.12)` |
| `--lustrous-color-state-disabled-label` | `rgba(15, 23, 42, 0.38)` | `rgba(241, 245, 249, 0.38)` |
| `--lustrous-color-scrim` | `rgba(15, 23, 42, 0.32)` | `rgba(0, 0, 0, 0.56)` |
| `--lustrous-color-scrim-immersive` | `rgba(10, 14, 23, 0.92)` | `rgba(8, 12, 20, 0.92)` |
| `--lustrous-elevation-level1` | `0 1px 2px 0 var(--lustrous-color-elevation1), 0 4px 12px -2px var(--lustrous-color-elevation1)` | *(re-evaluated per theme)* |
| `--lustrous-elevation-level2` | `0 4px 8px -2px var(--lustrous-color-elevation1), 0 16px 32px -4px var(--lustrous-color-elevation2)` | *(re-evaluated per theme)* |

### Code Surfaces & Data Visualization Tokens

- **Code tokens:** `--lustrous-color-code-background`, `--lustrous-color-code-primary-text`, `--lustrous-color-code-comment`, `--lustrous-color-code-outline`, `--lustrous-color-code-{grey,blue,pink,yellow,green,red,purple,teal}-text`.
- **Chart series (`1`–`5`):** `--lustrous-color-data{1..5}` plus `-hover`, `-focus`, and `-pressed` state variants.

### Spacing, Radius & Z-Index Scales

| Spacing Token | Value | Radius Token | Value | Z-Index Token | Value |
| :-- | :-- | :-- | :-- | :-- | :-- |
| `--lustrous-space-xs` | `4px` | `--lustrous-radius-none` | `0px` | `--lustrous-z-base` | `0` |
| `--lustrous-space-s` | `8px` | `--lustrous-radius-xs` | `4px` | `--lustrous-z-modal` | `30000` |
| `--lustrous-space-m` | `12px` | `--lustrous-radius-s` | `6px` | `--lustrous-z-dropdown` | `40000` |
| `--lustrous-space-l` | `16px` | `--lustrous-radius-m` | `10px` | `--lustrous-z-tooltip` | `50000` |
| `--lustrous-space-xl` | `20px` | `--lustrous-radius-l` | `14px` | `--lustrous-z-snackbar` | `60000` |
| `--lustrous-space-2xl` | `24px` | `--lustrous-radius-xl` | `20px` | | |
| `--lustrous-space-3xl` | `32px` | `--lustrous-radius-2xl` | `28px` | | |
| `--lustrous-space-4xl` | `48px` | `--lustrous-radius-full` | `9999px` | | |

### Typography Scale

Use `<lustrous-text variant="...">`, `.lustrous-<variant>` classes (in light DOM or shadow roots adopting `lustrousTypography`), or `lustrousType("<variant>")` inside Lit `css` blocks:

| Variant | Family | Size / Line | Weight | Axes (`font-variation-settings`) | Mobile (`≤ 768px`) |
| :-- | :-- | :-- | :-- | :-- | :-- |
| `display-large` | `display` | `44px / 52px` | `500` | `'wdth' 100, 'wght' 500, 'ROND' 25` | `display-medium` |
| `display-medium` | `display` | `36px / 44px` | `500` | `'wdth' 100, 'wght' 500, 'ROND' 25` | `display-small` |
| `display-small` | `display` | `30px / 38px` | `520` | `'wdth' 100, 'wght' 520, 'ROND' 20` | `headline-large` |
| `headline-large` | `display` | `26px / 34px` | `560` | `'wdth' 100, 'wght' 560, 'ROND' 10` | `headline-medium` |
| `headline-medium` | `display` | `22px / 28px` | `560` | `'wdth' 100, 'wght' 560, 'ROND' 10` | `headline-small` |
| `headline-small` | `display` | `18px / 24px` | `600` | `'wdth' 98, 'wght' 600, 'ROND' 10` | — |
| `lead` | `display` | `20px / 28px` | `430` | `'wdth' 99, 'wght' 430, 'ROND' 10` | — |
| `body-large` | `body` | `17px / 26px` | `400` | `'wdth' 98, 'wght' 400, 'ROND' 0` | — |
| `body-large-emphasized` | `body` | `17px / 26px` | `560` | `'wdth' 98, 'wght' 560, 'ROND' 0` | — |
| `body-medium` | `body` | `15px / 22px` | `400` | `'wdth' 98, 'wght' 400, 'ROND' 0` | — |
| `body-medium-emphasized` | `body` | `15px / 22px` | `560` | `'wdth' 98, 'wght' 560, 'ROND' 0` | — |
| `body-small` | `body` | `13px / 18px` | `400` | `'wdth' 98, 'wght' 400, 'ROND' 0` | — |
| `body-small-emphasized` | `body` | `13px / 18px` | `580` | `'wdth' 98, 'wght' 580, 'ROND' 0` | — |
| `callout` | `body` | `16px / 24px` | `500` | `'wdth' 98, 'wght' 500, 'ROND' 0` | — |
| `blockquote` | `body` | `20px / 30px` | `400` | *italic* | — |
| `caption` | `body` | `12px / 16px` | `450` | `'wdth' 98, 'wght' 450, 'ROND' 0` | — |
| `overline` | `body` | `11px / 16px` | `650` | `'wdth' 100, 'wght' 650, 'ROND' 0` (`uppercase`) | — |
| `code` | `code` | `14px / 20px` | `400` | — | — |

### Motion Tokens

- **Durations (`--lustrous-duration-*`):** `instant` (`0ms`), `short50` (`50ms`), `short100` (`100ms`), `short150` (`150ms`), `short200` (`200ms`), `medium250` (`250ms`), `medium300` (`300ms`), `medium350` (`350ms`), `medium400` (`400ms`), `long450` (`450ms`), `long500` (`500ms`), `long600` (`600ms`), `extralong750` (`750ms`), `extralong1000` (`1000ms`).
- **Easings (`--lustrous-easing-*`):** `standard`, `standard-decelerate`, `standard-accelerate`, `standard-neutral`, `linear`, `emphasized`, `emphasized-decelerate`, `emphasized-accelerate`, `spring-standard`.
- **Paired shorthands (`--lustrous-motion-*`):** `fade-through`, `fast-fade`, `fade`, `scale-in`, `scale-out`, `lateral`, `shared-axis-x`, `shared-axis-y`, `fast-shared-axis-y`, `bottom-enter`, `bottom-exit`, `container-transform-enter`, `container-transform-exit`, `fast-spatial`, `default-spatial`, `slow-spatial`.
