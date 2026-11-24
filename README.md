# Lustrous Design System (`@ghchinoy/lustrous-lit`)

[![CI](https://github.com/ghchinoy/lustrous-lit/actions/workflows/ci.yml/badge.svg)](https://github.com/ghchinoy/lustrous-lit/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@ghchinoy/lustrous-lit?color=1d4ed8)](https://www.npmjs.com/package/@ghchinoy/lustrous-lit)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-1d4ed8.svg)](./LICENSE)
[![Lit 3](https://img.shields.io/badge/Lit-3.x-2563eb.svg)](https://lit.dev/)
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG%202.1-AA-047857.svg)](#accessibility)

**[Interactive Storybook](https://ghchinoy.github.io/lustrous-lit/)** · **[Meridian Studio Demo](https://ghchinoy.github.io/lustrous-lit/example/)** · **[Theme & Brand Studio](https://ghchinoy.github.io/lustrous-lit/example/#theming)** · **[npm Package](https://www.npmjs.com/package/@ghchinoy/lustrous-lit)**

`@ghchinoy/lustrous-lit` is a Lit 3 Web Components design system providing 51 accessible custom elements, `@layer lustrous` Mineral Slate and Sapphire tokens, bundled OFL-1.1 Google Sans Flex and Google Sans Code fonts, `ElementInternals` form controls, and native Popover/`<dialog>` overlays. It runs in plain HTML, modern frontend frameworks, embedded Go/Rust/Python binaries, strict `style-src 'self'` CSP environments, and `@lit-labs/ssr` pipelines with no runtime dependencies beyond `lit`.

## Contents

- [Installation](#installation)
- [Quickstart](#quickstart)
- [Local Development Setup](#local-development-setup)
- [Browser Support](#browser-support)
- [Core Primitives Quick Reference](#core-primitives-quick-reference)
- [Component Catalog (51 Components)](#component-catalog-51-components)
- [Styling & Customization](#styling--customization)
- [Architecture Guides](#architecture-guides)
- [Release & Deployment](#release--deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Installation

Install `@ghchinoy/lustrous-lit` from [npm](https://www.npmjs.com/package/@ghchinoy/lustrous-lit) along with its `lit` (`^3.0.0`) peer dependency:

```bash
pnpm add @ghchinoy/lustrous-lit lit
```

```bash
npm install @ghchinoy/lustrous-lit lit
```

### AI Coding Agent Plugin & Skills (Optional)

This repository ships an [Agent Plugins v1.0.0](https://agent-plugins.org) package at [`plugins/lustrous-lit/`](./plugins/lustrous-lit/) (indexed via [`.claude-plugin/marketplace.json`](./.claude-plugin/marketplace.json)) containing three specialized skills:
- **[`lustrous-lit`](./plugins/lustrous-lit/skills/lustrous-lit/SKILL.md)** — UI composition, `--lustrous-*` tokens, forms, overlays, shortcuts, icons, starter templates, and `lookup-lustrous.mjs`.
- **[`lustrous-component-author`](./plugins/lustrous-lit/skills/lustrous-component-author/SKILL.md)** — Extending `LustrousElement`, `ElementInternals` form controls, CSP-safe `--_lustrous-*` geometry, top-layer overlays, SSR, and `forced-colors`.
- **[`lustrous-reviewer`](./plugins/lustrous-lit/skills/lustrous-reviewer/SKILL.md)** — Automated CSP, token, icon, SSR, and WCAG 2.1 AA static auditor (`audit-lustrous.mjs`) and review rubric.

Install into OpenCode, Claude Code, Cursor, Gemini CLI, Codex, or Antigravity:

```bash
# Install all Lustrous skills (or pass --skill lustrous-lit)
npx skills add ghchinoy/lustrous-lit
```

### Zero-Build CDN Quick Try (Plain HTML)

For single-file HTML prototypes or sandboxes without a bundler, load the theme and fonts from jsDelivr and ESM modules from `esm.sh`:

```html
<!doctype html>
<html lang="en" data-theme="system" class="lustrous-root">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@ghchinoy/lustrous-lit@0.2.0/fonts/lustrous-fonts.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@ghchinoy/lustrous-lit@0.2.0/dist/lustrous-theme.css" />
    <script type="module">
      import "https://esm.sh/@ghchinoy/lustrous-lit@0.2.0/components/lustrous-flex";
      import "https://esm.sh/@ghchinoy/lustrous-lit@0.2.0/components/lustrous-text";
      import "https://esm.sh/@ghchinoy/lustrous-lit@0.2.0/components/lustrous-button";
    </script>
  </head>
  <body>
    <lustrous-flex direction="column" gap="m" padding="2xl" max-width="440">
      <lustrous-text variant="headline-small" heading="1">Hello Lustrous</lustrous-text>
      <lustrous-button icon="bolt">Get Started</lustrous-button>
    </lustrous-flex>
  </body>
</html>
```

---

## Quickstart

1. **Load fonts (`@ghchinoy/lustrous-lit/fonts.css`):** Declares document-level `@font-face` rules for bundled OFL-1.1 Google Sans Flex and Google Sans Code.
2. **Load theme tokens (`@ghchinoy/lustrous-lit/theme.css` or `installLustrousTheme()`):** Emits `--lustrous-*` custom properties and `.lustrous-*` typography classes inside `@layer lustrous`. Every `LustrousElement` also calls `installLustrousTheme()` idempotently on connect, while linking `theme.css` in `<head>` prevents FOUC before scripts run.
3. **Import components:** Import individual custom elements via `@ghchinoy/lustrous-lit/components/<tag>` for tree-shaking, or import `@ghchinoy/lustrous-lit` to register all 51 components.
4. **Set the document root:** Add `class="lustrous-root"` and `data-theme="system"` (`"light" | "dark" | "system"`) on `<html>`.

### Entry Module (`src/main.ts`)

```ts
import "@ghchinoy/lustrous-lit/fonts.css";
import "@ghchinoy/lustrous-lit/theme.css";

import "@ghchinoy/lustrous-lit/components/lustrous-badge";
import "@ghchinoy/lustrous-lit/components/lustrous-button";
import "@ghchinoy/lustrous-lit/components/lustrous-flex";
import "@ghchinoy/lustrous-lit/components/lustrous-text";
import "@ghchinoy/lustrous-lit/components/lustrous-text-input";
import { showSnack } from "@ghchinoy/lustrous-lit/components/lustrous-snackbar";

document.querySelector("#deploy-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget as HTMLFormElement);
  showSnack(`Deploying ${data.get("service")}`, { variant: "positive" });
});
```

### Markup (`index.html`)

```html
<!doctype html>
<html lang="en" data-theme="system" class="lustrous-root">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Hello Lustrous</title>
  </head>
  <body>
    <form id="deploy-form">
      <lustrous-flex
        direction="column"
        gap="l"
        padding="2xl"
        max-width="440"
        margin="2xl"
        background="surface-bright"
        border
        border-radius="xl"
        shadow="1"
      >
        <lustrous-flex align="center" justify="space-between" gap="s">
          <lustrous-text variant="headline-small" heading="1">Deploy Service</lustrous-text>
          <lustrous-badge tone="cobalt">us-east1</lustrous-badge>
        </lustrous-flex>

        <lustrous-text muted>
          Configure a production rollout with native form validation and top-layer notifications.
        </lustrous-text>

        <lustrous-text-input
          name="service"
          label="Service slug"
          value="edge-gateway"
          leading-icon="bolt"
          required
        ></lustrous-text-input>

        <lustrous-flex justify="flex-end" gap="s">
          <lustrous-button type="submit" icon="bolt">Roll Out</lustrous-button>
        </lustrous-flex>
      </lustrous-flex>
    </form>

    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

### Package Exports

| Export Path | Description |
| :-- | :-- |
| `@ghchinoy/lustrous-lit` | Registers all 51 component modules and re-exports `@ghchinoy/lustrous-lit/theme` |
| `@ghchinoy/lustrous-lit/theme` | Side-effect-free tokens, theme helpers, localization, media/shortcut controllers, and `LustrousElement` |
| `@ghchinoy/lustrous-lit/components/*` | Individual component entry points (for example `@ghchinoy/lustrous-lit/components/lustrous-button`) |
| `@ghchinoy/lustrous-lit/theme.css` | Prebuilt `@layer lustrous` token and typography stylesheet (`dist/lustrous-theme.css`) |
| `@ghchinoy/lustrous-lit/fonts.css` | Self-hosted `@font-face` rules for Google Sans Flex and Google Sans Code (`fonts/lustrous-fonts.css`) |
| `@ghchinoy/lustrous-lit/custom-elements.json` | Custom Elements Manifest for IDE completions, Storybook, and wrapper tooling |

---

## Local Development Setup

**Prerequisites:** Node.js `>= 22.23.4` and `pnpm@10.34.6` (via Corepack or standalone install).

```bash
git clone https://github.com/ghchinoy/lustrous-lit.git
cd lustrous-lit
pnpm install
pnpm exec playwright install chromium
```

Run the interactive workbenches and test suites from the repository root:

```bash
pnpm storybook          # Storybook 10 workbench at http://localhost:6006 (light / dark / system toolbar)
pnpm example            # Meridian Studio reference app at http://localhost:5173 (runs directly against src/)
pnpm build              # Compile dist/, dist/lustrous-theme.css, and custom-elements.json
pnpm typecheck:all      # Typecheck library, tests, stories, and examples/app
pnpm check:clean        # Verify identifier hygiene and zero inline style= attributes (CSP)
pnpm test               # Vitest Browser Mode unit & interaction tests in headless Chromium
pnpm test:browsers      # Run unit tests across Chromium, Firefox, and WebKit
pnpm test:ssr           # @lit-labs/ssr Declarative Shadow DOM render + Chromium hydration check
pnpm build-storybook    # Build static Storybook into storybook-static/ (input for visual & a11y suites)
pnpm test:a11y          # axe-core WCAG 2.1 A/AA audit across every story in light and dark modes
pnpm test:visual        # Playwright screenshot comparisons across light, dark, and forced-colors
```

Set `CHROMIUM_PATH=/path/to/chromium` to point Vitest and Playwright at a system Chromium binary instead of Playwright's managed browser cache.

---

## Browser Support

Lustrous targets evergreen browsers supporting the Popover API, `<dialog>.showModal()`, `ElementInternals`, CSS `@layer`, `color-mix()`, and Constructable Stylesheets:

| Browser | Minimum Version |
| :-- | :-- |
| **Chrome / Edge** | 114+ |
| **Safari / iOS Safari** | 17+ |
| **Firefox** | 125+ |

---

## Core Primitives Quick Reference

### `<lustrous-box>`

Zero-wrapper container styled on `:host`. Setting `background` pairs matching foreground text color and `--lustrous-text-muted`:

```html
<lustrous-box
  padding="xl"
  mobile-padding="m"
  background="surface-container"
  border
  border-radius="l"
  shadow="1"
>
  Content
</lustrous-box>
```

### `<lustrous-flex>` & `<lustrous-flex-item>`

Inherits `<lustrous-box>` attributes and adds responsive flexbox layout (`direction`, `mobile-direction`, `align`, `mobile-align`, `justify`, `mobile-justify`, `wrap`, `gap`, `mobile-gap`):

```html
<lustrous-flex align="center" justify="space-between" gap="m" mobile-direction="column">
  <lustrous-flex-item grow="1" min-width="0">Flexible primary column</lustrous-flex-item>
  <lustrous-button variant="tonal" size="s">Inspect</lustrous-button>
</lustrous-flex>
```

### `<lustrous-grid>` & `<lustrous-grid-item>`

Inherits `<lustrous-box>` attributes and adds responsive CSS Grid layout (`columns`, `mobile-columns`, `rows`, `gap`, `mobile-gap`, plus `<lustrous-grid-item col-span="2">`):

```html
<lustrous-grid columns="3" mobile-columns="1" gap="l" mobile-gap="m">
  <lustrous-grid-item col-span="2">Wide summary</lustrous-grid-item>
  <lustrous-box padding="l" background="surface" border border-radius="l">Side metric</lustrous-box>
</lustrous-grid>
```

### `<lustrous-text>`

Typography primitive supporting all 18 Lustrous type scale variants (`display-large` through `overline` and `code`), ARIA heading levels (`heading="1"…"6"` via `ElementInternals`), `tone`, `muted`, and line clamping (`max-lines="1 | 2 | 3"`):

```html
<lustrous-text variant="headline-medium" heading="2">Cluster Telemetry</lustrous-text>
<lustrous-text variant="body-small" muted max-lines="2">99.98% availability over 30 days</lustrous-text>
```

### `<lustrous-button>`

Action button and link control with 7 variants (`accent`, `tonal`, `outline`, `bright`, `on-surface`, `on-surface-variant`, `translucent`), 3 sizes (`m` `44px`, `s` `36px`, `xs` `28px`), `rounded` / `pill` shapes, icons, disclosure chevron (`expanded`), and native `<form>` `submit` / `reset` support:

```html
<lustrous-button variant="accent" icon="bolt">Deploy</lustrous-button>
<lustrous-button variant="outline" size="s" href="/logs">View Logs</lustrous-button>
```

### `<lustrous-icon>` & `registerLustrousIcons()`

Renders 24×24 stroke icons with optical stroke weight per size (`xs` `16px` through `xl` `40px`) and `:dir(rtl)` mirroring for directional glyphs. Use `<lustrous-icon>` in HTML, `renderIcon()` inside Lit templates, and `registerLustrousIcons()` to extend the icon set at runtime:

```ts
import { svg } from "lit";
import { registerLustrousIcons } from "@ghchinoy/lustrous-lit/components/lustrous-icon";

registerLustrousIcons({
  webhook: {
    directional: false,
    paths: svg`<circle cx="12" cy="6" r="3" /><circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="M10.5 8.5 7.5 14.5M13.5 8.5l3 6M9 17h6" />`,
  },
});
```

---

## Component Catalog (51 Components)

### Layout & Typography (6)

| Component | Sub-elements / Helpers | Summary | Docs |
| :-- | :-- | :-- | :-- |
| `<lustrous-box>` | `LustrousBox` | Zero-wrapper box primitive for spacing, surfaces, borders, elevation, sizing, and responsive visibility | [README](./src/components/lustrous-box/README.md) |
| `<lustrous-flex>` | `<lustrous-flex-item>` | Responsive flexbox container and item primitives extending `<lustrous-box>` | [README](./src/components/lustrous-flex/README.md) |
| `<lustrous-grid>` | `<lustrous-grid-item>` | Responsive CSS Grid container and spanning item primitives extending `<lustrous-box>` | [README](./src/components/lustrous-grid/README.md) |
| `<lustrous-scrollable-box>` | `LustrousScrollableBox` | Scroll container with overflow edge-fade scrims and keyboard focus management | [README](./src/components/lustrous-scrollable-box/README.md) |
| `<lustrous-text>` | `LustrousText` | 18-variant Google Sans Flex & Code typography primitive with `ElementInternals` headings and clamping | [README](./src/components/lustrous-text/README.md) |
| `<lustrous-prose-text>` | `<lustrous-prose-direction-scope>` | Bidirectional multilingual typography with `ltr`/`rtl` word-ratio detection and technical token isolation | [README](./src/components/lustrous-prose-text/README.md) |

### Icons, Buttons & Interactive Triggers (9)

| Component | Sub-elements / Helpers | Summary | Docs |
| :-- | :-- | :-- | :-- |
| `<lustrous-icon>` | `renderIcon`, `registerLustrousIcons` | 24×24 SVG icon element and extensible registry with optical stroke scaling and RTL mirroring | [README](./src/components/lustrous-icon/README.md) |
| `<lustrous-chevron-icon>` | `renderChevron` | Disclosure chevron rotating between collapsed and expanded states | [README](./src/components/lustrous-chevron-icon/README.md) |
| `<lustrous-button>` | `LustrousButtonBase` | Primary, tonal, outline, and surface button with form submission and anchor link support | [README](./src/components/lustrous-button/README.md) |
| `<lustrous-split-button>` | `LustrousSplitButton` | Dual-zone primary action button paired with an attached top-layer `<lustrous-menu>` | [README](./src/components/lustrous-split-button/README.md) |
| `<lustrous-icon-button>` | `LustrousIconButton` | Circular `44px` / `36px` / `28px` icon action control with optional unread badge dot | [README](./src/components/lustrous-icon-button/README.md) |
| `<lustrous-togglable-button>` | `LustrousTogglableButton` | Binary toggle button managing `aria-pressed` and cancelable `lustrous-change` events | [README](./src/components/lustrous-togglable-button/README.md) |
| `<lustrous-togglable-icon-button>` | `LustrousTogglableIconButton` | Circular binary toggle icon button with optional `selected-icon` swap | [README](./src/components/lustrous-togglable-icon-button/README.md) |
| `<lustrous-pressable>` | `LustrousPressable` | Interactive card/tile surface extending `<lustrous-box>` with state layer and focus ring | [README](./src/components/lustrous-pressable/README.md) |
| `<lustrous-link>` | `LustrousLink` | Inline anchor or button trigger with underline modes and external-link indicator | [README](./src/components/lustrous-link/README.md) |

### Form-Associated Controls (7)

| Component | Sub-elements / Helpers | Summary | Docs |
| :-- | :-- | :-- | :-- |
| `<lustrous-text-input>` | `LustrousTextInput` | Single-line input with labels, captions, icons/affixes, validation states, and character counter | [README](./src/components/lustrous-text-input/README.md) |
| `<lustrous-text-area>` | `LustrousTextArea` | Multi-line auto-growing textarea sharing `<lustrous-text-input>` chrome and validation | [README](./src/components/lustrous-text-area/README.md) |
| `<lustrous-search-bar>` | `LustrousSearchBar` | Pill search input (`floating`, `outlined`, `transparent`) with clear button and `lustrous-search` | [README](./src/components/lustrous-search-bar/README.md) |
| `<lustrous-select>` | `LustrousSelect` | Combobox and top-layer listbox supporting `.options` or light-DOM `<option>` / `<optgroup>` | [README](./src/components/lustrous-select/README.md) |
| `<lustrous-checkbox>` | `LustrousCheckbox` | Form-associated checkbox supporting `checked`, `indeterminate`, and `supporting-text` | [README](./src/components/lustrous-checkbox/README.md) |
| `<lustrous-radio-group>` | `<lustrous-radio>` | Roving-tabindex radio group with vertical/horizontal layouts, validation, and item descriptions | [README](./src/components/lustrous-radio-group/README.md) |
| `<lustrous-switch>` | `LustrousSwitch` | Form-associated `role="switch"` toggle (`m` / `s`) with thumb icons and `44×44px` touch target | [README](./src/components/lustrous-switch/README.md) |

### Top-Layer Overlays, Dialogs & Notifications (9)

| Component | Sub-elements / Helpers | Summary | Docs |
| :-- | :-- | :-- | :-- |
| `<lustrous-tooltip>` | `LustrousTooltip` | Non-interactive top-layer hover/focus label with collision flipping and `only-when-truncated` | [README](./src/components/lustrous-tooltip/README.md) |
| `<lustrous-popover>` | `LustrousPopover` | Anchored top-layer card with SVG arrow, hover mode, modal sibling `inert` lock, and `mobile-drawer` | [README](./src/components/lustrous-popover/README.md) |
| `<lustrous-menu>` | `LustrousMenu` | WAI-ARIA top-layer menu supporting actions, links, check/toggle items, sections, and nested submenus | [README](./src/components/lustrous-menu/README.md) |
| `<lustrous-modal>` | `LustrousModal` | Low-level `<dialog>.showModal()` container with scrim presets, scroll lock, and focus restoration | [README](./src/components/lustrous-modal/README.md) |
| `<lustrous-dialog>` | `LustrousDialog` | Structured dialog card (`s` / `m` / `l`) usable inline or as a top-layer `modal` confirmation | [README](./src/components/lustrous-dialog/README.md) |
| `<lustrous-bottom-sheet>` | `LustrousBottomSheet` | Mobile-first modal sheet with `0.5` peek / `1` full snap points and pointer swipe-to-dismiss | [README](./src/components/lustrous-bottom-sheet/README.md) |
| `<lustrous-snackbar>` | `showSnack`, `dismissSnack` | Top-layer toast notification stack with semantic variants, hover/focus timer pause, and action button | [README](./src/components/lustrous-snackbar/README.md) |
| `<lustrous-banner>` | `LustrousBanner` | Inline or floating status/announcement banner with semantic tones, badge, and actions | [README](./src/components/lustrous-banner/README.md) |
| `<lustrous-action-bar>` | `LustrousActionBar` | Pill `role="toolbar"` container (`flat` / `floating`) for grouped icon and text actions | [README](./src/components/lustrous-action-bar/README.md) |

### Navigation Shells, Lists & Disclosure (9)

| Component | Sub-elements / Helpers | Summary | Docs |
| :-- | :-- | :-- | :-- |
| `<lustrous-sidebar>` | `<lustrous-sidebar-header>`, `-nav`, `-scroll-area`, `-section`, `-item`, `-message`, `-footer`, `-drawer` | Collapsible `272px` ↔ `56px` navigation rail and mobile modal drawer shell | [README](./src/components/lustrous-sidebar/README.md) |
| `<lustrous-side-panel>` | `LustrousSidePanel` | Complementary `<aside>` inspector supporting desktop `split` and mobile `takeover` modes | [README](./src/components/lustrous-side-panel/README.md) |
| `<lustrous-tabs>` | `LustrousTabs` | `pill` and `underline` tablist with roving arrow navigation and optional slotted panels | [README](./src/components/lustrous-tabs/README.md) |
| `<lustrous-segmented-control>` | `LustrousSegmentedControl` | Equal-width 2–5 option view switcher with sliding pill indicator | [README](./src/components/lustrous-segmented-control/README.md) |
| `<lustrous-segmented-list>` | `<lustrous-segmented-list-item>`, `-button`, `-link` | Grouped surface rows with individual card gaps or continuous hairline `divider` styling | [README](./src/components/lustrous-segmented-list/README.md) |
| `<lustrous-list>` | `<lustrous-list-item>` | Semantic vertical list supporting button, anchor, and `static` rows with trailing slots | [README](./src/components/lustrous-list/README.md) |
| `<lustrous-timeline>` | `<lustrous-timeline-item>` | Milestone and deployment step feed (`past`, `active`, `future`) with connector rails | [README](./src/components/lustrous-timeline/README.md) |
| `<lustrous-collapsible-container>` | `LustrousCollapsibleContainer` | Headless `0fr` ↔ `1fr` height disclosure primitive with `inert` collapsed content | [README](./src/components/lustrous-collapsible-container/README.md) |
| `<lustrous-collapsible-card>` | `LustrousCollapsibleCard` | Bordered disclosure card with heading, subtitle, badge, header actions, and animated body | [README](./src/components/lustrous-collapsible-card/README.md) |

### Status, Code, Shortcuts & Media (11)

| Component | Sub-elements / Helpers | Summary | Docs |
| :-- | :-- | :-- | :-- |
| `<lustrous-badge>` | `LustrousBadge` | `24px` pill badge with semantic tones and 6 dual-theme categorical tones (`cobalt`…`teal`) | [README](./src/components/lustrous-badge/README.md) |
| `<lustrous-badge-indicator>` | `LustrousBadgeIndicator` | Compact status dot / unread indicator for overlaying icons and controls | [README](./src/components/lustrous-badge-indicator/README.md) |
| `<lustrous-progress-bar>` | `LustrousProgressBar` | Determinate `0–100` `role="progressbar"` indicator with semantic tones | [README](./src/components/lustrous-progress-bar/README.md) |
| `<lustrous-spinner>` | `LustrousSpinner` | Indeterminate loading indicator (`icon` glyph or circular `ring`) | [README](./src/components/lustrous-spinner/README.md) |
| `<lustrous-skeleton>` | `LustrousSkeleton` | Shimmer loading placeholder (`rect`, `circle`, `text`) respecting `prefers-reduced-motion` | [README](./src/components/lustrous-skeleton/README.md) |
| `<lustrous-code-block>` | `LustrousCodeBlock` | Monospace snippet viewer using `--lustrous-font-code` with header label and copy button | [README](./src/components/lustrous-code-block/README.md) |
| `<lustrous-kbd>` | `LustrousKbd` | Platform-aware keyboard shortcut keycap chip (`keys="Mod+Shift+K"`) | [README](./src/components/lustrous-kbd/README.md) |
| `<lustrous-keyboard-shortcuts-modal>` | `LustrousKeyboardShortcutsModal` | Grouped keyboard shortcut reference dialog integrated with `LustrousShortcutController` | [README](./src/components/lustrous-keyboard-shortcuts-modal/README.md) |
| `<lustrous-image>` | `LustrousImage` | Responsive `<img>` container with `aspect-ratio`, `object-fit`, radius, and `decorative` mode | [README](./src/components/lustrous-image/README.md) |
| `<lustrous-photo-lightbox>` | `LustrousLightboxBase` | Immersive full-screen photo viewer over `--lustrous-color-scrim-immersive` | [README](./src/components/lustrous-photo-lightbox/README.md) |
| `<lustrous-video-lightbox>` | `LustrousLightboxBase` | Immersive full-screen HTML5 video viewer with captions track and auto-pause on close | [README](./src/components/lustrous-video-lightbox/README.md) |

---

## Styling & Customization

- **Zero-specificity overrides via `@layer lustrous`:** Every rule in `lustrous-theme.css` sits inside `@layer lustrous`. Unlayered `:root` or `[data-theme="dark"]` rules in your application stylesheet override `--lustrous-*` tokens without `!important`:
  ```css
  :root {
    --lustrous-color-primary: #0369a1;
    --lustrous-color-accent: #0284c7;
    --lustrous-radius-m: 8px;
  }
  ```
- **Shared Shadow DOM mixins (`@ghchinoy/lustrous-lit/theme`):** Build custom interactive elements with `lustrousBase`, `lustrousStateLayer` (`.state-layer`), `lustrousFocusRing` (`.focus-ring`), and `lustrousType(variant)`.
- **Targeted `::part(...)` hooks:** Components expose documented CSS shadow parts (such as `lustrous-button::part(button)`, `lustrous-text-input::part(field)`, `lustrous-dialog::part(card)`, `lustrous-tabs::part(tab-selected)`, and `lustrous-switch::part(track)`) for structural customization.

---

## Architecture Guides

### Composition
Combine `<lustrous-box>`, `<lustrous-flex>`, `<lustrous-grid>`, and `<lustrous-text>` instead of wrapper `<div>`s and custom margin rules. Slotted triggers (`slot="trigger"` on `<lustrous-menu>`, `<lustrous-dialog modal>`, `<lustrous-collapsible-container>`, `<lustrous-photo-lightbox>`) wire ARIA attributes and event handlers automatically. See **[Authoring Components](./docs/authoring-components.md)**.

### Theming & Dark Mode
Switch themes globally with `setLustrousTheme("light" | "dark" | "system", { storageKey })`, inspect active themes with `resolveLustrousTheme(el)`, localize shared ARIA labels via `setLustrousLabels()`, or add `data-theme="dark"` onto any container to create a nested theme island. See **[Theming, Tokens & Typography](./docs/theming.md)**.

### Responsive Layout
Lustrous uses a two-layer responsive model. CSS attributes (`mobile-direction`, `mobile-columns`, `mobile-padding`, `hidden-on`, `shown-on`) adjust geometry at `768px` (content) and `959.98px` (app shell), while `LustrousViewportController` and `<lustrous-popover mobile-drawer>` swap DOM trees only when the interaction pattern changes. See **[Responsive Design](./docs/responsive.md)**.

### Accessibility
All token pairs meet **WCAG 2.1 AA** (`≥ 4.5:1` text, `≥ 3:1` UI boundaries), interactive touch targets measure at least `44×44px`, composite widgets implement roving `tabindex` with RTL-aware arrow keys, animations respect `prefers-reduced-motion: reduce`, and all surfaces support Windows High Contrast (`forced-colors: active`).

### Frameworks, CSP & SSR
Components work in Plain HTML + Import Maps, Lit 3, React 19 / `@lit/react`, Vue 3, Angular, Svelte 5, embedded Go/Rust/Python servers, strict `style-src 'self'` CSP headers, and `@lit-labs/ssr` Declarative Shadow DOM hydration. See **[Frameworks, CSP & SSR](./docs/frameworks.md)** and the **[Agent Plugin (`plugins/lustrous-lit`)](./plugins/lustrous-lit/skills/lustrous-lit/SKILL.md)**.

---

## Release & Deployment

- **Documentation & Demo Site (GitHub Pages):** Every push to `main` triggers [`.github/workflows/pages.yml`](./.github/workflows/pages.yml), deploying static Storybook to `/` and **Meridian Studio** (`examples/app`) to `/example/`.
- **Publishing a New Release (npm + GitHub Releases):**
  1. Move `## [Unreleased]` notes in [`CHANGELOG.md`](./CHANGELOG.md) under `## [X.Y.Z] - YYYY-MM-DD` and update the comparison links at the bottom of the file.
  2. Bump `"version"` in [`package.json`](./package.json), run `pnpm build`, and merge to `main` once CI is green.
  3. Tag the merged commit on `main` and push the tag:
     ```bash
     git tag vX.Y.Z
     git push origin vX.Y.Z
     ```
  4. [`.github/workflows/release.yml`](./.github/workflows/release.yml) verifies tag parity, runs full checks, publishes `@ghchinoy/lustrous-lit` to npm with `--provenance --access public` via npm OIDC Trusted Publishing (`npm trust github @ghchinoy/lustrous-lit --file release.yml --repo ghchinoy/lustrous-lit --allow-publish`), and creates the GitHub Release from `CHANGELOG.md` with the `.tgz` tarball attached.

---

## Contributing

Pull requests, bug reports, and accessibility fixes are welcome. For new components or breaking token changes, please open an issue first to discuss the API design.

Before submitting a pull request:

1. Install dependencies with `pnpm install` (Node.js `>= 22.23.4`, `pnpm@10.34.6`).
2. Run `pnpm check:clean` and `pnpm typecheck:all`.
3. Run `pnpm build` (regenerating `custom-elements.json`), `pnpm test:ssr`, `pnpm test:browsers`, and `pnpm test:a11y`.
4. If component visuals changed intentionally, refresh Linux Playwright baselines via the **Update Visual Baselines** GitHub Actions workflow (or locally for preview with `pnpm test:visual:update`).

See **[AGENTS.md](./AGENTS.md)** and **[Authoring Components](./docs/authoring-components.md)** for engineering rules and Web Components conventions.

---

## License

- **Code & Documentation:** Licensed under the **[Apache License, Version 2.0](./LICENSE)** (`Apache-2.0`).
- **Bundled Fonts:** `fonts/GoogleSansFlex-latin.woff2`, `fonts/GoogleSansCode-latin.woff2`, and `fonts/GoogleSansCode-Italic-latin.woff2` are licensed under the **SIL Open Font License 1.1 (`OFL-1.1`)**; see [`fonts/OFL-GoogleSansFlex.txt`](./fonts/OFL-GoogleSansFlex.txt) and [`fonts/OFL-GoogleSansCode.txt`](./fonts/OFL-GoogleSansCode.txt).
