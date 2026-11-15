# Responsive Design

Lustrous enforces a strict **two-layer responsive architecture** so interfaces stay fast, predictable under Server-Side Rendering (`@lit-labs/ssr`), and free of layout thrashing.

---

## The Two-Layer Responsive Rule

1. **Layer 1 — CSS for Layout, Spacing, Typography, and Visibility**
   Use Lustrous's reflected responsive attributes (`mobile-direction`, `mobile-columns`, `mobile-padding`, `mobile-gap`, `hidden-on`, `shown-on`), CSS media queries, or CSS `@container` queries whenever the DOM tree stays the same. Pure CSS rules apply immediately during first paint and SSR before JavaScript hydrates.
2. **Layer 2 — Reactive Controllers Strictly for DOM-Structure Changes**
   Reach for `LustrousViewportController`, `LustrousMediaController`, or `<lustrous-popover mobile-drawer>` **only** when the underlying element hierarchy, ARIA pattern, or top-layer modality must change across viewports (for example, swapping an anchored desktop `<lustrous-popover>` for a swipeable `<lustrous-bottom-sheet>`, or switching an app shell between a persistent `<lustrous-sidebar>` and a modal `<lustrous-sidebar-drawer>`).

---

## Breakpoints

All media query strings are exported from `@ghchinoy/lustrous-lit/theme` via `breakpoints`:

| Key | Media Query | Purpose |
| :-- | :-- | :-- |
| `mobile` | `(max-width: 768px)` | Content layout: grids collapse, flex toolbars stack, display/headline typography steps down |
| `desktop` | `(min-width: 769px)` | Multi-column content layouts and anchored popovers |
| `shellMobile` | `(max-width: 959.98px)` | Application shell: persistent sidebars collapse into `<lustrous-sidebar-drawer>` and side panels switch to `presentation="takeover"` |
| `shellDesktop` | `(min-width: 960px)` | Persistent `<lustrous-sidebar>` + main workspace + `presentation="split"` `<lustrous-side-panel>` |
| `reducedMotion` | `(prefers-reduced-motion: reduce)` | Motion suppression check |
| `forcedColors` | `(forced-colors: active)` | High-contrast system color check |
| `darkMode` | `(prefers-color-scheme: dark)` | OS dark color-scheme check |

Separating the **content breakpoint (`768px`)** from the **shell breakpoint (`959.98px`)** prevents cramped three-column tablet layouts: between `769px` and `959px`, shell navigation collapses into a drawer while main content retains multi-column space.

---

## Layer 1: CSS-Only Responsive Primitives

### Layout & Spacing (`<lustrous-box>`, `<lustrous-flex>`, `<lustrous-grid>`)

Every box-based primitive compiles responsive attributes into static `@media (max-width: 768px)` `:host([...])` rules with zero JavaScript overhead:

```html
<!-- Toolbar that stacks vertically and tightens padding on ≤ 768px -->
<lustrous-flex
  direction="row"
  mobile-direction="column"
  align="center"
  mobile-align="stretch"
  justify="space-between"
  gap="l"
  mobile-gap="s"
  padding="2xl"
  mobile-padding="l"
  background="surface-bright"
  border
  border-radius="xl"
>
  <lustrous-text variant="headline-medium" heading="2">Service Health</lustrous-text>
  <lustrous-button icon="bolt" mobile-width="full">Run Diagnostics</lustrous-button>
</lustrous-flex>

<!-- 3-column dashboard grid that collapses to 1 column on ≤ 768px -->
<lustrous-grid columns="3" mobile-columns="1" gap="l" mobile-gap="m">
  <lustrous-box padding="l" background="surface" border border-radius="l">Latency</lustrous-box>
  <lustrous-box padding="l" background="surface" border border-radius="l">Throughput</lustrous-box>
  <lustrous-box padding="l" background="surface" border border-radius="l">Error Budget</lustrous-box>
</lustrous-grid>
```

| Element | Responsive Attributes (`≤ 768px` unless noted) |
| :-- | :-- |
| `<lustrous-box>` (and subclasses) | `mobile-padding`, `mobile-padding-block`, `mobile-padding-inline`, `mobile-display`, `mobile-width` (`full`, `auto`, `fit-content`, `min-content`, `max-content`), `hidden-on`, `shown-on` |
| `<lustrous-flex>` | `mobile-direction`, `mobile-align`, `mobile-justify`, `mobile-gap` |
| `<lustrous-grid>` | `mobile-columns`, `mobile-align`, `mobile-gap` |
| `<lustrous-text>` | `mobile-variant`, `mobile-padding` (plus automatic `mobileTypographySteps` on `display-*` and `headline-large`/`headline-medium`) |

### Responsive Visibility (`hidden-on` / `shown-on`)

Both `hidden-on` and `shown-on` accept `"mobile" | "desktop" | "shell-mobile" | "shell-desktop"`:

```html
<!-- Hamburger menu button shown only when the shell is ≤ 959.98px -->
<lustrous-box shown-on="shell-mobile" display="inline-flex">
  <lustrous-icon-button icon="menu" aria-label="Open navigation"></lustrous-icon-button>
</lustrous-box>

<!-- Persistent sidebar rail hidden on ≤ 959.98px without layout shift -->
<lustrous-box hidden-on="shell-mobile" height="full">
  <lustrous-sidebar>...</lustrous-sidebar>
</lustrous-box>
```

> **Accessibility note:** `hidden-on` and `shown-on` apply `display: none !important`, removing inactive elements from both visual layout and the accessibility tree so keyboard focus and screen readers never land on hidden duplicates.

### Media & Container Queries in Custom Styles

Inside your own Lit components, combine `breakpoints` for viewport rules and CSS `@container` queries for widgets that appear in both wide pages and narrow side panels:

```ts
import { css, html, unsafeCSS } from "lit";
import { LustrousElement, breakpoints, lustrousBase } from "@ghchinoy/lustrous-lit/theme";

export class MetricCard extends LustrousElement {
  static override styles = [
    lustrousBase,
    css`
      :host {
        display: block;
        container-type: inline-size;
      }
      .layout {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: var(--lustrous-space-m);
      }
      /* Adapts when placed inside a narrow <lustrous-side-panel>, regardless of viewport width */
      @container (max-width: 340px) {
        .layout {
          grid-template-columns: 1fr;
        }
      }
      /* Viewport-level density adjustment */
      @media ${unsafeCSS(breakpoints.mobile)} {
        .layout {
          gap: var(--lustrous-space-s);
        }
      }
    `,
  ];

  protected override render() {
    return html`<div class="layout"><slot></slot></div>`;
  }
}
```

---

## Layer 2: Structural Adaptation in JavaScript

When the DOM structure or ARIA interaction model differs between mobile and desktop, use Lustrous's adaptive props or reactive controllers.

### Built-In Adaptive Popover (`<lustrous-popover mobile-drawer>`)

Adding `mobile-drawer` to `<lustrous-popover>` renders an anchored top-layer `[popover]` on desktop (`> 768px`) and automatically switches to `<lustrous-bottom-sheet>` (with drag handle, snap points, swipe-to-dismiss, and focus restoration) at `≤ 768px`:

```html
<lustrous-popover heading="Filter Traces" mobile-drawer close-label="Close filters">
  <lustrous-button variant="outline" icon="filterList">Filters</lustrous-button>
  <lustrous-flex slot="content" direction="column" gap="m">
    <lustrous-checkbox checked>Errors only</lustrous-checkbox>
    <lustrous-checkbox>Include background jobs</lustrous-checkbox>
  </lustrous-flex>
</lustrous-popover>
```

### `LustrousViewportController`

`LustrousViewportController` attaches two `matchMedia` listeners (`mobile` and `shellMobile`) to a Lit `ReactiveControllerHost` and calls `requestUpdate()` only when a threshold is crossed:

- `viewport.isMobile` / `viewport.isDesktop` (`≤ 768px` / `≥ 769px`)
- `viewport.isShellMobile` / `viewport.isShellDesktop` (`≤ 959.98px` / `≥ 960px`)

```ts
import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { LustrousElement, LustrousViewportController } from "@ghchinoy/lustrous-lit/theme";
import "@ghchinoy/lustrous-lit/components/lustrous-sidebar";
import "@ghchinoy/lustrous-lit/components/lustrous-side-panel";
import "@ghchinoy/lustrous-lit/components/lustrous-icon-button";

@customElement("app-workspace-shell")
export class AppWorkspaceShell extends LustrousElement {
  private readonly viewport = new LustrousViewportController(this);

  @state() private drawerOpen = false;
  @state() private inspectorOpen = true;

  protected override render() {
    return html`
      <lustrous-flex height="viewport" overflow="hidden">
        ${this.viewport.isShellMobile
          ? html`
              <lustrous-sidebar-drawer
                .open=${this.drawerOpen}
                @lustrous-toggle=${(e: CustomEvent<{ open: boolean }>) => (this.drawerOpen = e.detail.open)}
              >
                ${this.renderSidebar()}
              </lustrous-sidebar-drawer>
            `
          : this.renderSidebar()}

        <lustrous-flex-item grow="1" min-width="0">
          ${this.viewport.isShellMobile
            ? html`<lustrous-icon-button
                icon="menu"
                aria-label="Open navigation"
                @click=${() => (this.drawerOpen = true)}
              ></lustrous-icon-button>`
            : null}
          <slot></slot>
        </lustrous-flex-item>

        <lustrous-side-panel
          ?open=${this.inspectorOpen}
          label="Inspector"
          presentation=${this.viewport.isShellMobile ? "takeover" : "split"}
          @lustrous-close-request=${() => (this.inspectorOpen = false)}
        >
          <slot name="inspector"></slot>
        </lustrous-side-panel>
      </lustrous-flex>
    `;
  }

  private renderSidebar() {
    return html`<lustrous-sidebar><slot name="nav"></slot></lustrous-sidebar>`;
  }
}
```

### `LustrousMediaController`

For custom media queries or user-preference checks (`"reducedMotion"`, `"forcedColors"`, `"darkMode"`, or any raw query string), instantiate `LustrousMediaController`:

```ts
import { LustrousElement, LustrousMediaController } from "@ghchinoy/lustrous-lit/theme";

export class WideSplitView extends LustrousElement {
  // Accepts any key of `breakpoints` or an arbitrary media query string
  private readonly wide = new LustrousMediaController(this, "(min-width: 1280px)");
  private readonly reducedMotion = new LustrousMediaController(this, "reducedMotion");

  protected override render() {
    return this.wide.matches ? this.renderThreePane() : this.renderTwoPane();
  }
}
```

### SSR & Hydration Notes

During Server-Side Rendering (`@lit-labs/ssr`), `globalThis.matchMedia` is undefined, so `LustrousMediaController.matches` and `LustrousViewportController.isMobile` default to `false` (desktop structure) and synchronize in `hostConnected()` on the client. Prefer Layer 1 CSS attributes (`mobile-direction`, `mobile-columns`, `hidden-on`, `shown-on`) whenever possible so mobile viewports render their final geometry before JavaScript executes.
