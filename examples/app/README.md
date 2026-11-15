# Meridian Studio (`examples/app`)

**Meridian Studio** is the reference Vite + Lit 3 multi-pane control-plane application built with `@ghchinoy/lustrous-lit`.

## Running Locally

From the repository root:

```bash
# Start Vite dev server
pnpm example

# Typecheck library + example app
pnpm typecheck:all

# Production bundle (outputs examples/app/dist)
pnpm build:example
```

## What This Reference App Demonstrates

- **Zero-FOUC Theme Initialization & Persistence (`index.html`, `src/main.ts`, `src/app-shell.ts`):**
  Inline `<head>` script restores `document.documentElement.dataset.theme` from `localStorage.getItem("meridian.theme") || "system"` before first paint, paired with `installLustrousTheme()`, `setLustrousTheme()`, bundled OFL-1.1 `@font-face` fonts (`@ghchinoy/lustrous-lit/fonts.css`), and a custom `"meridianLogo"` vector mark registered via `registerLustrousIcons()`.
- **Responsive Application Shell (`src/app-shell.ts`):**
  Collapsible `<lustrous-sidebar>` (`272px` ↔ `56px`, persisted in `localStorage`) with footer `<lustrous-menu>` theme switcher, `Mod+/` `<lustrous-keyboard-shortcuts-modal>` bound through `LustrousShortcutController`, skip-to-content link, route focus management, and automatic `<lustrous-sidebar-drawer>` switching below `960px` via CSS and `LustrousViewportController`.
- **Token-Driven Custom Application Components (`src/components/`):**
  - `<app-kpi-card>`: Built purely with `--lustrous-*` CSS tokens, `lustrousBase`, `lustrousType()`, and `renderIcon()`.
  - `<app-service-card>`: Combines `--lustrous-*` tokens with `<lustrous-badge>`, `<lustrous-tooltip>`, `<lustrous-menu>`, and a CSS `@container` query adapting between compact grid cards and wide list rows.
- **Control Plane Overview (`src/pages/overview-page.ts`):**
  Dismissible `<lustrous-banner>`, `<lustrous-split-button>` primary rollout CTA, responsive `<lustrous-grid mobile-columns="1">` KPI cards with toggleable `aria-busy` `<lustrous-skeleton>` loading preview, `<lustrous-progress-bar>` quota indicators, `<lustrous-timeline>` deployment milestones, and `<lustrous-collapsible-card>` with `slot="actions"` + `<lustrous-code-block>`.
- **Services Catalog & Layered Overlays (`src/pages/services-page.ts`):**
  `<lustrous-search-bar>`, `<lustrous-segmented-control>` health filter and layout switcher, `<lustrous-popover mobile-drawer>` quick SLO inspector, `<lustrous-side-panel>` (`split` on desktop, `takeover` on `isShellMobile`) containing `<lustrous-image>` inside `<lustrous-photo-lightbox>` with layered Escape coordination (`e.target === e.currentTarget`), `<lustrous-bottom-sheet>` endpoint sharing, and modal `<lustrous-dialog>` restart confirmation paired with `showSnack()` Undo.
- **Theme & Brand Studio (`src/pages/theming-page.ts`, `src/theme-presets.ts`):**
  Interactive workspace for re-skinning `@ghchinoy/lustrous-lit` live across the entire application via unlayered CSS custom properties (`adoptedStyleSheets` overriding `@layer lustrous` without `!important`). Includes 5 WCAG AA brand presets (*Lustrous Sapphire*, *Emerald Canopy*, *Copper Editorial*, *Amethyst Precision*, *Oceanic Soft*), independent corner-geometry overrides (`sharp`, `architectural`, `soft`), monospace display heading toggle, nested `[data-theme]` islands, subtree CSS scoping, and a live-generated copyable `brand-overrides.css` `<lustrous-code-block>`.
- **Native Form Association (`src/pages/settings-page.ts`):**
  Standard `<form>` reading `new FormData(form)` across `ElementInternals` controls (`<lustrous-text-input required type="email">`, `<lustrous-select>`, `<lustrous-radio-group>` + `<lustrous-radio>`, `<lustrous-text-area character-count>`, `<lustrous-checkbox>`, and `<lustrous-switch>` rows inside `<lustrous-segmented-list divider>`), `<lustrous-button type="submit">` / `<lustrous-button type="reset" variant="outline">`, and polite `role="status"` save announcements.
