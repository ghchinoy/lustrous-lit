# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and [Common Changelog](https://common-changelog.org/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/ghchinoy/lustrous-lit/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/ghchinoy/lustrous-lit/releases/tag/v0.1.0
