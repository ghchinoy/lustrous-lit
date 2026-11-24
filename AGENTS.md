<!-- headroom:rtk-instructions -->
# RTK (Rust Token Killer) - Token-Optimized Commands

When running shell commands, **always prefix with `rtk`**. This reduces context
usage by 60-90% with zero behavior change. If rtk has no filter for a command,
it passes through unchanged — so it is always safe to use.

## Key Commands
```bash
# Git (59-80% savings)
rtk git status          rtk git diff            rtk git log

# Files & Search (60-75% savings)
rtk ls <path>           rtk read <file>         rtk grep <pattern>
rtk find <pattern>      rtk diff <file>

# Test (90-99% savings) — shows failures only
rtk pytest tests/       rtk cargo test          rtk test <cmd>

# Build & Lint (80-90% savings) — shows errors only
rtk tsc                 rtk lint                rtk cargo build
rtk prettier --check    rtk mypy                rtk ruff check

# Analysis (70-90% savings)
rtk err <cmd>           rtk log <file>          rtk json <file>
rtk summary <cmd>       rtk deps                rtk env

# GitHub (26-87% savings)
rtk gh pr view <n>      rtk gh run list         rtk gh issue list

# Infrastructure (85% savings)
rtk docker ps           rtk kubectl get         rtk docker logs <c>

# Package managers (70-90% savings)
rtk pip list            rtk pnpm install        rtk npm run <script>
```

## Rules
- In command chains, prefix each segment: `rtk git add . && rtk git commit -m "msg"`
- For debugging, use raw command without rtk prefix
- `rtk proxy <cmd>` runs command without filtering but tracks usage
<!-- /headroom:rtk-instructions -->

# AGENTS.md — `@ghchinoy/lustrous-lit`

Repository developer and coding-agent guide for the **Lustrous Design System** (`@ghchinoy/lustrous-lit`), an Apache-2.0 Lit 3 Web Components library with WCAG 2.1 AA Mineral Slate & Sapphire tokens, bundled OFL-1.1 fonts, `ElementInternals` form controls, and native top-layer overlays.

Requires **Node.js `>= 22.23.4`** and **`pnpm@10.34.6`**.

This project's Baseline target is Baseline 2024.

> **Modern Web Guidance precedence:** When [Modern Web Guidance](https://developer.chrome.com/docs/modern-web-guidance) is installed alongside `plugins/lustrous-lit`, prioritize existing `<lustrous-*>` components, `--lustrous-*` tokens, and strict CSP/SSR rules first. Use Modern Web Guidance for platform capabilities beyond the component catalog (Core Web Vitals, CSS Scroll-Driven Animations, View Transitions, autofill patterns, Web Components platform fundamentals) and adapt any suggested patterns through Lustrous tokens and CSSOM `--_lustrous-*` custom properties. See `plugins/lustrous-lit/skills/lustrous-lit/references/companion-plugins.md`.

---

## Commands

| Command | Script | Purpose |
| :-- | :-- | :-- |
| `pnpm install` | — | Install workspace dependencies (`--frozen-lockfile` in CI) |
| `pnpm check:clean` | `node scripts/check-clean.mjs` | Verify clean-room identifier hygiene and enforce zero inline `style=` attributes in `src/components/**/*.ts` |
| `pnpm typecheck:all` | `tsc --noEmit && tsc --noEmit -p examples/app` | Typecheck the design-system library, tests, stories, and example app |
| `pnpm build` | `tsc -p tsconfig.build.json && node scripts/build-css.mjs && pnpm run analyze && node scripts/sync-plugin.mjs` | Compile `dist/`, emit `dist/lustrous-theme.css`, regenerate `custom-elements.json`, and sync `plugins/lustrous-lit/` |
| `pnpm check:plugin` | `bash scripts/validate-plugins.sh && node scripts/sync-plugin.mjs --check` | Validate Agent Plugins v1.0.0 manifests, skill frontmatter, executable scripts, and catalog sync |
| `pnpm test:ssr` | `node scripts/ssr-smoke.mjs && node scripts/ssr-hydrate.mjs` | Verify `@lit-labs/ssr` Declarative Shadow DOM rendering and Chromium client hydration |
| `pnpm test` | `vitest run` | Run Vitest Browser Mode unit & interaction tests in headless Chromium |
| `pnpm test:browsers` | `LUSTROUS_BROWSERS=chromium,firefox,webkit vitest run` | Run the full unit test suite across Chromium, Firefox, and WebKit |
| `pnpm storybook` | `storybook dev -p 6006` | Start interactive Storybook 10 workbench on port `6006` (`pnpm build-storybook` for static build) |
| `pnpm example` | `vite examples/app` | Start the **Meridian Studio** reference application (`pnpm build:example` for production build) |
| `pnpm test:visual` | `playwright test -c playwright.visual.config.ts` | Run Playwright screenshot regression checks across `light`, `dark`, and `forced-colors` (`test:visual:update` refreshes baselines; `test:visual:ci` disables updates) |
| `pnpm test:a11y` | `playwright test -c playwright.a11y.config.ts` | Run `@axe-core/playwright` WCAG 2.1 AA accessibility audits |

---

## Directory Layout

```text
lustrous-lit/
├── src/
│   ├── index.ts                        # Root barrel registering all 51 components + re-exporting ./theme
│   ├── theme/                          # Side-effect-free entry (@ghchinoy/lustrous-lit/theme)
│   │   ├── tokens.ts                   # Single source of truth for all colors, spacing, radius, fonts, breakpoints, typography, icons & motion
│   │   ├── theme.ts                    # @layer lustrous CSS generator, installLustrousTheme, setLustrousTheme, lustrousBase, lustrousStateLayer, lustrousFocusRing
│   │   ├── lustrous-element.ts         # Base class (theme auto-install, WebKit media-query sheet refresh, SSR slotchange replay)
│   │   ├── media.ts                    # LustrousMediaController & LustrousViewportController (768px content / 959.98px shell)
│   │   ├── shortcuts.ts                # LustrousShortcutController, LustrousShortcutScopeController & platform key formatters
│   │   ├── labels.ts                   # Global UI & ARIA string localization (setLustrousLabels / getLustrousLabels)
│   │   ├── fonts.ts                    # Programmatic @font-face helper (installLustrousFonts)
│   │   └── events.ts                   # Shared CustomEvent detail & event types
│   ├── internal/                       # Private library helpers (not part of public exports)
│   │   ├── floating.ts                 # Top-layer [popover] positioning, flip/clamp math, floatingResetCss, focusable traversal & composedContains
│   │   ├── a11y.ts                     # VISUALLY_HIDDEN / lustrousSrOnly screen-reader helpers
│   │   ├── adopt.ts                    # Constructable Stylesheet adoption helpers
│   │   ├── bidi.ts                     # Unicode BiDi direction estimation & technical token isolation
│   │   ├── motion.ts                   # Reduced-motion & animation helpers
│   │   └── style-gen.ts                # Static responsive attribute CSS rule generators for box/flex/grid
│   └── components/
│       ├── lustrous-<name>/            # 51 self-contained component folders:
│       │   ├── lustrous-<name>.ts      #   Custom element class + HTMLElementTagNameMap augmentation
│       │   ├── lustrous-<name>.test.ts #   Vitest Browser Mode unit/interaction tests
│       │   ├── lustrous-<name>.stories.ts # Storybook stories (used by docs, visual & a11y suites)
│       │   ├── screenshots/            #   Lossless WebP visual regression baselines (*.webp; *.png gitignored)
│       │   └── README.md               #   Per-component API, slots, events, parts & accessibility reference
│       └── lustrous-lightbox/          # Shared LustrousLightboxBase used by photo & video lightboxes
├── fonts/                              # Self-hosted OFL-1.1 Google Sans Flex + Google Sans Code WOFF2 & lustrous-fonts.css
├── docs/                               # Deep-dive guides: theming.md, responsive.md, authoring-components.md, frameworks.md
├── examples/app/                       # Meridian Studio multi-pane reference app
├── scripts/                            # build-css.mjs, sync-plugin.mjs, validate-plugins.sh, ssr-smoke.mjs, ssr-hydrate.mjs, check-clean.mjs
├── .claude-plugin/marketplace.json     # Deterministic skill/plugin discovery index for npx skills & Claude Code
├── plugins/lustrous-lit/               # Distributable Agent Plugins v1.0.0 package (lustrous-lit, lustrous-component-author, lustrous-reviewer)
└── .github/workflows/                  # ci.yml, pages.yml, release.yml, update-visual-baselines.yml
```

---

## Hard Engineering Rules & Web Components Lessons

### 1. Single Token Source of Truth & Zero `var()` Fallbacks for Design Tokens
- **Define tokens only in `src/theme/tokens.ts`.** `src/theme/theme.ts` and `scripts/build-css.mjs` derive `lustrousThemeCssText` and `dist/lustrous-theme.css` directly from `tokens.ts` inside `@layer lustrous`. Never invent ad-hoc hex colors, raw pixel spacing, or unregistered `--lustrous-*` names inside components.
- **No hardcoded `var(--lustrous-*, #fallback)` fallbacks in component CSS.** Every component extends `LustrousElement`, which calls `installLustrousTheme(this.ownerDocument)` on connect so `--lustrous-*` tokens are guaranteed to be defined. Hardcoded fallback hex values silently mask misspelled token names and drift out of sync in dark mode. *(Private runtime CSSOM variables like `var(--_lustrous-progress, 0%)` are the sole exception because they represent per-instance geometry prior to first update.)*
- **Re-declare derived tokens per theme scope:** CSS custom properties resolve `var()` on the declaring element. Whenever `[data-theme]` switches color palettes, `--lustrous-elevation-level1`, `--lustrous-elevation-level2`, and `--lustrous-text-muted` must be re-declared alongside color tokens (`derivedDecls` in `src/theme/theme.ts`).

### 2. Strict CSP Compliance: Never Emit Inline `style=` Attributes
- **Never write `style="..."` or `style=${...}` in `src/components/**/*.ts` templates.** `pnpm check:clean` scans every component source file and fails the build if `style=` appears, ensuring strict `Content-Security-Policy: style-src 'self'` compatibility without `'unsafe-inline'`.
- When a style depends on runtime measurement or numeric input (e.g., progress fill width, textarea auto-grow height, or floating popover coordinates), set a private `--_lustrous-*` property via CSSOM (`if (this.style) this.style.setProperty("--_lustrous-...", ...)`) in `willUpdate()` or `updated()` and consume it from static `css` rules.

### 3. Form Association via `ElementInternals`
- Value-bearing controls (`<lustrous-text-input>`, `<lustrous-text-area>`, `<lustrous-select>`, `<lustrous-checkbox>`, `<lustrous-radio-group>`, `<lustrous-switch>`) set `static formAssociated = true`, guard `typeof this.attachInternals === "function"` for SSR, and implement `formDisabledCallback`, `formResetCallback`, and `formStateRestoreCallback`.
- Capture `defaultValue` / `defaultChecked` on connect so `form.reset()` restores initial state accurately, call `this.internals?.setFormValue(...)` and `this.internals?.setValidity(...)` whenever value or `required` changes, and emit composed `input` / `lustrous-change` (`LustrousChangeDetail`) events.

### 4. Top-Layer Popover API & `<dialog>` Pitfalls
- **Explicit `[popover]:not(:popover-open) { display: none }`:** Author `display: flex` / `display: grid` rules on a `[popover]` element override the browser UA stylesheet's closed-popover `display: none` rule! Always include `floatingResetCss` (from `src/internal/floating.ts`) so closed popovers never paint or intercept hit-testing (`src/internal/overlays-closed.test.ts` guards every overlay component).
- **Initialize `dismissedAt = -Infinity` (never `0`):** Click-triggered popovers, menus, and selects ignore re-open clicks within `300ms` of light-dismiss (`performance.now() - this.dismissedAt < 300`) so clicking the trigger to close doesn't immediately re-open the surface. Initializing `dismissedAt = 0` drops clicks during the first `300ms` after page load in fast automated tests where `performance.now() < 300`; always initialize `private dismissedAt = -Infinity`.
- **Modal Popover sibling `inert` + `aria-hidden` lock:** Unlike `<dialog>.showModal()`, the Popover API does not make background content inert. When `<lustrous-popover close-label="...">` runs in modal mode, snapshot each outside document sibling's prior `inert` and `aria-hidden` attributes before setting `sibling.inert = true` and `aria-hidden="true"`, and restore the exact previous values in `releaseModalLock()` and `disconnectedCallback()`.

### 5. `.state-layer.state-layer` Specificity Survival
- Interactive controls frequently reset native `<button>` chrome with `.btn { all: unset; ... }`. Because `lustrousStateLayer` is placed earlier in `static styles` than component-local rules, a single-class `.state-layer` rule would have its `position: relative; isolation: isolate` wiped out by `all: unset`. `lustrousStateLayer` intentionally doubles the class selector (`.state-layer.state-layer`) to `(0, 2, 0)` specificity so hover/focus/pressed `::after` overlays always stay contained inside the control bounds.

### 6. Layered Close & Toggle Event Guards (`e.target === e.currentTarget`)
- Custom events like `lustrous-toggle` and `lustrous-close-request` bubble across Shadow DOM (`bubbles: true, composed: true`). Whenever a composite component (`<lustrous-dialog modal>`, `<lustrous-popover mobile-drawer>`, `<lustrous-keyboard-shortcuts-modal>`, `<lustrous-sidebar>`) wraps an inner `<lustrous-modal>`, `<lustrous-bottom-sheet>`, or nested `<lustrous-menu>`, **always guard listener handlers with `if (e.target !== e.currentTarget) return;`** and coordinate Escape via `LustrousShortcutScopeController.canHandleEscape(event)` so closing a child menu or tooltip never dismisses the parent dialog.

### 7. `@lit-labs/ssr` & Declarative Shadow DOM Hydration Safety
- Never touch `window`, `document`, `HTMLElement.prototype`, `ResizeObserver`, `IntersectionObserver`, `getComputedStyle()`, `showPopover()`, or `showModal()` inside module scope, field initializers, `constructor()`, `willUpdate()`, or `render()`.
- Guard `this.attachInternals?.()`, `globalThis.matchMedia?.(...)`, and `if (this.style)` so `pnpm test:ssr` renders every component cleanly in Node.js and hydrates in Chromium without console errors or duplicate shadow nodes.
- After modifying any public property, slot, event, or CSS part, run `pnpm build` so `custom-elements.json` stays synchronized (CI enforces `git diff --exit-code -- custom-elements.json`).

### 8. `forced-colors`, `prefers-reduced-motion` & RTL
- **`@media (forced-colors: active)`:** Box shadows and `drop-shadow` filters disappear in Windows High Contrast mode. Every elevated overlay/card must fall back to an explicit `1px solid CanvasText` or `ButtonBorder` outline, focus rings use `Highlight`, and custom-drawn state indicators (switch thumbs, radio dots, active pills, progress fills) must pair `Highlight` / `HighlightText` with `GrayText` when disabled.
- **`@media (prefers-reduced-motion: reduce)`:** Always include `lustrousBase` first in `static override styles` so transitions and animations collapse to `0.01ms`, and skip imperative smooth scrolling or spring timers when `reducedMotion` matches.
- **Logical CSS & BiDi:** Use logical properties (`padding-inline`, `margin-inline-start`, `inset-inline-end`, `text-align: start`), reverse horizontal arrow-key roving focus when `getComputedStyle(this).direction === "rtl"`, and mirror directional icons via `:dir(rtl)`.

### 9. Cross-Browser Testing Notes (Chromium, Firefox, WebKit)
- `vitest.config.ts` runs Playwright browser instances controlled by `LUSTROUS_BROWSERS` (defaults to `chromium`; set `CHROMIUM_PATH` to use a local binary, or run `pnpm test:browsers` for `chromium,firefox,webkit`).
- WebKit caches media-query evaluation on shared `adoptedStyleSheets` across viewport resizes; `LustrousElement` handles refreshing adopted sheets across `mobile` (`768px`) and `shellMobile` (`959.98px`) transitions—always subclass `LustrousElement` rather than `LitElement`.
- Visual regression PNG baselines (`src/components/*/screenshots/*.png`) are rendered against the Linux Playwright container (`mcr.microsoft.com/playwright:v1.65.1-noble`) so font rasterization is deterministic in CI.

### 10. GitHub Actions CI, GitHub Pages & npm Release Workflows
- **CI (`.github/workflows/ci.yml`):** Runs on pushes to `main` and all pull requests inside `mcr.microsoft.com/playwright:v1.65.1-noble`—executes `pnpm check:clean`, `pnpm typecheck:all`, `pnpm build` + `custom-elements.json` drift check, `pnpm test:ssr`, `pnpm test` (Chromium), `pnpm build:example`, `pnpm build-storybook`, `pnpm test:visual:ci`, and `pnpm test:a11y`, plus a parallel `firefox` + `webkit` unit test matrix.
- **Visual Baselines (`.github/workflows/update-visual-baselines.yml`):** Manual `workflow_dispatch` job that regenerates Linux Playwright snapshots inside the canonical container and commits updated `src/**/screenshots/*.png` files to the selected branch.
- **GitHub Pages (`.github/workflows/pages.yml`):** Deploys Storybook at `/` and the Meridian Studio example app at `/example/` on every push to `main`.
- **Release (`.github/workflows/release.yml`):** Triggered on `v*` tags; verifies `v${package.json.version}` tag alignment, clean-room/CSP hygiene, types, build, and tests, publishes `@ghchinoy/lustrous-lit` to public npm with `--provenance --access public` via OIDC Trusted Publishing (Node 24 / `npm 11+`, with optional `NPM_TOKEN` override), and creates a GitHub Release populated from the matching `CHANGELOG.md` section.
