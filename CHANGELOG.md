# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and [Common Changelog](https://common-changelog.org/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-11-23

### Added

- **`<lustrous-sidebar>` `compact-panel` / `mobile` densities, `surface-tone`, `leading-back` header, inline rename & badges:**
  - `density="compact-panel" | "mobile"` and `surface-tone="surface" | "surface-bright"` on `<lustrous-sidebar>` (`compact-panel` renders a `52px` header, `40px` `6px`-radius `body-large` rows, fills container width by default, and lifts the mobile `44px` floor on `size="s"` buttons).
  - `dismiss-variant="trailing-close" | "leading-back"` on `<lustrous-sidebar-header>` with leading `arrowBack` button, omitted empty logo slot when `[slot=logo]` is absent, and keyboard focus handoff on collapse/expand.
  - Inline item renaming on `<lustrous-sidebar-item>` (`editing`, `default-edit-value`, `max-edit-length="128"`, `edit-input-label`) with auto-focused pill `<input part="edit-input">`, cancelable `lustrous-edit-commit` / `lustrous-edit-cancel`, IME & `document.hasFocus()` blur guards, and keyboard focus restoration to the row.
  - `pill-badge` / `slot="badge"` on expanded `<lustrous-sidebar-item>` rows and corner unread indicator dot on collapsed rail icons.
- **`<lustrous-menu>` mobile in-place submenu drill-down & item extensions:**
  - Mobile (`<= 768px`) in-place submenu drill-down with `back-button` header labelled by `getLustrousLabels().backToMainMenu` (`setLustrousLabels({ backToMainMenu })`), `defaultOpen` submenu entry, and RTL-aware `ArrowRight` / `ArrowLeft` navigation.
  - `closeOnClick?: boolean` on `type: "action"` items (`@default true`), `.returnFocus` (`HTMLElement | null`), and item `background?: LustrousBackground` & `trailingContent?: unknown`.
- **`<lustrous-button>` `variant="primary"`:** Explicit `--lustrous-color-primary` / `--lustrous-color-on-primary` variant (excluded from `<lustrous-icon-button>`).
- **`<lustrous-dialog>` `mobile-drawer`, `scrim-blur`, and `focus-heading`:** Modal dialogs adapt to `<lustrous-bottom-sheet default-snap-point="1">` at `<= 768px`, forward `scrim-blur`, and expose `.headingElement` / focusable `<h2>` (`tabindex="-1"`).
- **`<lustrous-bottom-sheet>` `header` / `footer` slots & `<lustrous-scrollable-box>` wrapper:** Fixed `slot="header"` and `slot="footer"`, `scrollable` (`@default true`), and `body-scrim` (`@default "both"`).
- **`<lustrous-scrollable-box>` `scrim-size`:** Per-viewport edge scrim length in pixels (default `36`, scoped so nested boxes do not inherit).
- **`<lustrous-banner>` `clickable`:** Keyboard-operable `<button part="surface">` surface firing `lustrous-click`, with unnested sibling `dismissible` close button.
- **`<lustrous-photo-lightbox>` & `<lustrous-video-lightbox>` `rounded` & `.navigation`:** Larger `l` (`14px`) rounded stage option and `LustrousLightboxNavigation` previous/next tonal buttons + RTL-aware `ArrowLeft` / `ArrowRight` shortcuts.
- **44px mobile touch targets (`<= 768px`):** `size="s"` `<lustrous-button>` and `<lustrous-icon-button>`, `<lustrous-search-bar>`, and `<lustrous-segmented-control>` (via invisible `::before` hit area) enforce `>= 44px` touch targets on mobile viewports.
- **25 new core icons in `<lustrous-icon>`:** `arrowSplit`, `assignment`, `autorenew`, `backspace` (added to `LUSTROUS_DIRECTIONAL_ICONS`), `bookmarkSpark`, `chatPasteGo`, `chatSpark2`, `codeBlocks`, `compareArrows`, `contacts`, `forward10`, `health`, `lassoSelect`, `markChatRead`, `markChatUnread`, `public`, `recordVoiceOver`, `replay10`, `searchActivity`, `smartphone`, `sms`, `stopCircle`, `tts`, `voiceOverOff`, and `wallet`.
- **Interactive Theme & Brand Studio route (`examples/app` `#theming`)** and live Storybook/demo links in `README.md`.

### Changed

- **WCAG 2.1 AA dark contrast & light surface ladder (`src/theme/tokens.ts`):**
  - Lightened dark `on-surface-variant` from `#94a3b8` → `#9aa9be` so muted text on `surface-container-highest` (`#2e3c56`) passes WCAG 2.1 AA (**4.64:1**, previously 4.32:1).
  - Separated light `surface-container-low` (`#f4f7fb`) from `background` (`#f8fafc`) and light `surface-container-highest` (`#d5dee9`) from `outline-variant` (`#cbd5e1`) so adjacent surface tiers and hairline borders remain distinct without breaking light canvas tone.
- **`<lustrous-sidebar>` motion & scroll scrim:** Collapse/expand transition uses `300ms` (`--lustrous-duration-medium300`), collapsing `inert` sections/messages/actions delay `visibility: hidden` by `150ms` for smooth fade-out, and `<lustrous-sidebar-scroll-area>` sets `scrim-size="16"`.
- **`<lustrous-snackbar>` operational note:** Default `max` remains `3` for stacked notifications; set `max="1"` for single-toast replacement mode.

### Fixed

- **`<lustrous-search-bar>` RTL placeholder alignment:** Only applies `dir="auto"` to `<input>` when `value` is non-empty so empty RTL search bars align placeholders next to the leading search icon.
- **`<lustrous-menu>` `open-on-hover`:** Absorbs the first pointer click on a hover-opened trigger while preserving hover-dismiss on pointer leave, closes on the second pointer click, and closes immediately on keyboard activation.
- **`<lustrous-sidebar-item>` hover, active & tooltip behavior:** Keeps `surface-dim` while a nested `.items` menu is open, keeps the row hover pill active while pointing at trailing controls, and anchors the row `<lustrous-tooltip>` directly to the focusable row control.
- **Clean-room hygiene:** Fixed a stray comment in `src/theme/tokens.ts` and tightened `scripts/check-clean.mjs` identifier checks.

## [0.1.0] - 2026-11-16

_Initial release._

### Added

- **Theme, Tokens & Typography (`@ghchinoy/lustrous-lit/theme`, `/theme.css`, `/fonts.css`):** Mineral Slate neutral ramp with Lustrous Sapphire primary/accent, Mineral Teal tertiary, semantic status palettes (`positive`, `warning`, `error`), code syntax tokens, 5-series data visualization tokens, and dual-theme categorical palette (`category-cobalt`, `category-emerald`, `category-amber`, `category-rose`, `category-violet`, `category-teal`) calibrated to WCAG 2.1 AA across light and dark modes inside `@layer lustrous`.
- **Bundled OFL-1.1 Fonts:** Self-hosted Latin + Latin-Extended variable WOFF2 subsets of **Google Sans Flex** and **Google Sans Code** (normal + italic) with `lustrous-fonts.css`, `installLustrousFonts()`, 18-step `typography` scale, and `lustrousType()`.
- **Base Element & Controllers:** `LustrousElement` base class (automatic theme adoption, WebKit shared-stylesheet breakpoint refresh, Declarative Shadow DOM hydration `slotchange` replay), `setLustrousTheme()`, `readLustrousThemePreference()`, `resolveLustrousTheme()`, `setLustrousLabels()`, `LustrousViewportController`, and `LustrousMediaController`.
- **Layout, Surface & Typography Primitives:** `<lustrous-box>`, `<lustrous-flex>` / `<lustrous-flex-item>`, `<lustrous-grid>` / `<lustrous-grid-item>`, `<lustrous-scrollable-box>`, `<lustrous-pressable>`, `<lustrous-link>`, `<lustrous-text>`, and `<lustrous-prose-text>` / `<lustrous-prose-direction-scope>` (automatic BiDi estimation and `<bdi dir="ltr">` technical token isolation).
- **Buttons, Actions & Form-Associated Controls (`ElementInternals`):** `<lustrous-button>`, `<lustrous-icon-button>`, `<lustrous-togglable-button>`, `<lustrous-togglable-icon-button>`, `<lustrous-split-button>`, `<lustrous-action-bar>`, `<lustrous-text-input>`, `<lustrous-text-area>`, `<lustrous-search-bar>`, `<lustrous-select>`, `<lustrous-checkbox>`, `<lustrous-switch>`, and `<lustrous-radio-group>` / `<lustrous-radio>`.
- **Top-Layer Overlays & Notifications:** `<lustrous-tooltip>`, `<lustrous-popover>` (directional SVG arrows, modal `close-label` focus trap with sibling `inert` lock, and `mobile-drawer` bottom-sheet adaptation), `<lustrous-menu>`, `<lustrous-modal>`, `<lustrous-dialog>`, `<lustrous-bottom-sheet>`, `<lustrous-snackbar>` (`showSnack()` / `dismissSnack()`), and `<lustrous-banner>`.
- **Navigation, Disclosure, Display & Media:** `<lustrous-sidebar>` family (including `<lustrous-sidebar-drawer>`), `<lustrous-side-panel>`, `<lustrous-tabs>`, `<lustrous-segmented-control>`, `<lustrous-segmented-list>`, `<lustrous-collapsible-card>`, `<lustrous-collapsible-container>`, `<lustrous-list>`, `<lustrous-timeline>`, `<lustrous-badge>`, `<lustrous-badge-indicator>`, `<lustrous-progress-bar>`, `<lustrous-spinner>`, `<lustrous-skeleton>`, `<lustrous-code-block>`, `<lustrous-image>`, `<lustrous-photo-lightbox>`, and `<lustrous-video-lightbox>`.
- **Icons & Scoped Keyboard Shortcuts:** `<lustrous-icon>`, `<lustrous-chevron-icon>`, `renderIcon()`, `registerLustrousIcons()` with 137 core 24×24 stroke icons, plus `<lustrous-kbd>`, `<lustrous-keyboard-shortcuts-modal>`, `ShortcutManager`, and shortcut reactive controllers.
- **Reference App, Agent Skill & Verification Suite:** **Meridian Studio** (`examples/app`), `.agents/skills/lustrous-lit/SKILL.md`, `custom-elements.json`, Storybook 10 docs, `@lit-labs/ssr` render + hydration checks, Vitest cross-browser unit suites (`chromium`, `firefox`, `webkit`), Playwright visual baselines (`light`, `dark`, `forced-colors`), and `axe-core` WCAG 2.1 AA audits.

[Unreleased]: https://github.com/ghchinoy/lustrous-lit/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/ghchinoy/lustrous-lit/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/ghchinoy/lustrous-lit/releases/tag/v0.1.0
