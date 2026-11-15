# Authoring Components

This guide covers two workflows:

1. **Application components** — composing Lustrous primitives, shared CSS helpers, and icons in product UI.
2. **Design-system components** — building reusable custom elements that meet Lustrous's architecture, form-association, Content Security Policy (CSP), Server-Side Rendering (SSR), and WCAG 2.1 AA standards.

---

## Part 1: Authoring Application Components

### Compose Layout & Typography Primitives First

Before writing custom flexbox, grid, or typography CSS, compose `<lustrous-box>`, `<lustrous-flex>`, `<lustrous-grid>`, `<lustrous-scrollable-box>`, and `<lustrous-text>`. Setting `background` on `<lustrous-box>` (such as `surface-container`, `primary-container`, or `surface-inverted`) automatically sets matching foreground `color` and adapts `--lustrous-text-muted` for nested `<lustrous-text muted>` elements:

```ts
import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LustrousElement } from "@ghchinoy/lustrous-lit/theme";
import "@ghchinoy/lustrous-lit/components/lustrous-badge";
import "@ghchinoy/lustrous-lit/components/lustrous-button";
import "@ghchinoy/lustrous-lit/components/lustrous-flex";
import "@ghchinoy/lustrous-lit/components/lustrous-text";

@customElement("deploy-summary-card")
export class DeploySummaryCard extends LustrousElement {
  @property() environment = "production";
  @property() version = "v2.4.0";

  protected override render() {
    return html`
      <lustrous-flex
        direction="column"
        gap="m"
        padding="xl"
        background="surface-bright"
        border
        border-radius="xl"
        shadow="1"
      >
        <lustrous-flex align="center" justify="space-between" gap="s">
          <lustrous-text variant="headline-small" heading="3">${this.environment}</lustrous-text>
          <lustrous-badge tone="emerald" icon="check">${this.version}</lustrous-badge>
        </lustrous-flex>
        <lustrous-text muted>All health checks passing across 6 regions.</lustrous-text>
        <lustrous-flex justify="flex-end" gap="s">
          <lustrous-button variant="tonal" size="s" icon="bolt">Promote</lustrous-button>
        </lustrous-flex>
      </lustrous-flex>
    `;
  }
}
```

### Shared Style Mixins (`@ghchinoy/lustrous-lit/theme`)

When your shadow root renders custom interactive markup (such as a custom card button or tree node), import Lustrous's shared `CSSResult` helpers instead of duplicating resets, focus outlines, or hover overlays:

```ts
import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  LustrousElement,
  lustrousBase,
  lustrousFocusRing,
  lustrousStateLayer,
  lustrousType,
} from "@ghchinoy/lustrous-lit/theme";
import { renderIcon } from "@ghchinoy/lustrous-lit/components/lustrous-icon";

@customElement("quick-command-tile")
export class QuickCommandTile extends LustrousElement {
  static override styles = [
    lustrousBase,       // box-sizing: border-box, :host([hidden]), prefers-reduced-motion, icon alignment
    lustrousFocusRing,  // .focus-ring -> 2.5px currentColor :focus-visible outline (Highlight in forced-colors)
    lustrousStateLayer, // .state-layer -> ::after hover / focus-visible / active tint using --lustrous-color-state-*
    css`
      .tile {
        all: unset;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        gap: var(--lustrous-space-m);
        width: 100%;
        min-height: 44px;
        padding: var(--lustrous-space-m) var(--lustrous-space-l);
        border: 1px solid var(--lustrous-color-outline-variant);
        border-radius: var(--lustrous-radius-l);
        background-color: var(--lustrous-color-surface);
        color: var(--lustrous-color-on-surface);
        cursor: pointer;
        ${lustrousType("body-medium-emphasized")}
      }
    `,
  ];

  @property() label = "";

  protected override render() {
    return html`
      <button type="button" class="tile focus-ring state-layer">
        ${renderIcon("bolt", "s")}
        <span>${this.label}</span>
      </button>
    `;
  }
}
```

- **`lustrousBase`**: Always place first in `static override styles`. Sets `box-sizing: border-box`, `:host([hidden]) { display: none !important }`, short-circuits transitions/animations under `@media (prefers-reduced-motion: reduce)`, and includes `lustrousIconStyles`.
- **`lustrousFocusRing`**: Styles `.focus-ring:focus-visible` with a `2.5px solid currentColor` outline (`outline-offset: 2px`) and switches automatically to `Highlight` in `@media (forced-colors: active)`.
- **`lustrousStateLayer`**: Uses a doubled `.state-layer.state-layer` selector (so it survives `all: unset` on single-class `.tile` rules) to draw a `border-radius: inherit` `::after` overlay for `:hover`, `:focus-visible`, and `:active`, suppressing the overlay when `:disabled` or `[aria-disabled="true"]`.
- **`lustrousType(variant)`**: Emits font family, size, line height, weight, letter spacing, and `font-variation-settings` (`wdth`, `wght`, `ROND`) for any `LustrousTextVariant`.

### Rendering & Registering Icons

- **Inside Lit templates (`renderIcon`)**: Call `renderIcon(name, size = "s", label?)` from `@ghchinoy/lustrous-lit/components/lustrous-icon` to emit an inline `<svg class="lustrous-icon">` with no extra wrapper custom element. Icons render `aria-hidden="true"` unless `label` is passed (`role="img"`). Stroke width scales optically by size (`1.85` at `xs` down to `1.3` at `xl`), and directional icons (`arrowForward`, `chevronRight`, `send`, etc.) mirror automatically in `:dir(rtl)`.
- **In HTML or slots (`<lustrous-icon>`)**: Use `<lustrous-icon name="bolt" size="s" tone="primary"></lustrous-icon>`.
- **Registering custom application icons (`registerLustrousIcons`)**: Register 24×24 SVG primitives once at startup so they work everywhere (`<lustrous-button icon="...">`, `<lustrous-menu>`, `<lustrous-sidebar-item>`, `renderIcon()`), and optionally augment `LustrousCustomIconMap` for autocomplete:

```ts
import { svg } from "lit";
import { registerLustrousIcons } from "@ghchinoy/lustrous-lit/components/lustrous-icon";

declare module "@ghchinoy/lustrous-lit/components/lustrous-icon" {
  interface LustrousCustomIconMap {
    webhook: true;
    pipelineStep: true;
  }
}

registerLustrousIcons({
  webhook: {
    paths: svg`<circle cx="12" cy="6" r="3" /><circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="M10.5 8.5 7.5 14.5M13.5 8.5l3 6M9 17h6" />`,
  },
  pipelineStep: {
    directional: true, // Mirrors horizontally when dir="rtl"
    paths: svg`<rect x="3" y="7" width="11" height="10" rx="2" /><path d="M14 12h7m-3-3 3 3-3 3" />`,
  },
});
```

---

## Part 2: Authoring Design-System Components

### 1. Extend `LustrousElement`

All Lustrous custom elements extend `LustrousElement` (from `@ghchinoy/lustrous-lit/theme`) rather than raw `LitElement`. `LustrousElement` provides three guarantees:

1. Calls `installLustrousTheme(this.ownerDocument)` on connect so `--lustrous-*` tokens always resolve.
2. Refreshes shared `adoptedStyleSheets` across `mobile` and `shellMobile` breakpoint changes so WebKit re-evaluates media queries on newly connected elements.
3. Replays `slotchange` once in `firstUpdated()` when hydrating Declarative Shadow DOM so slotted triggers and label detectors attach their listeners.

### 2. Reflected Attributes & Pure CSS State

Reflect visual variants and boolean states (`@property({ reflect: true })`) and style them via static `:host([attr="value"])` selectors rather than computing class strings or inline styles in JavaScript.

### 3. Strict CSP Rule: Never Emit Inline `style=""` Attributes

Lustrous enforces a zero-inline-style policy across all component templates (`pnpm check:clean` fails on any `style=` inside `src/components/**/*.ts` templates) so applications can run under strict `style-src 'self'` Content Security Policies without `'unsafe-inline'`.

When a CSS value depends on runtime measurement or numeric input (such as a progress percentage, grid track count, or popover arrow offset), set a private `--_lustrous-*` custom property on the host element via `CSSOM` in `willUpdate()`, guarded for SSR:

```ts
// ✅ Good — CSP-safe CSSOM custom property + static stylesheet rule
static override styles = [
  lustrousBase,
  css`
    .fill {
      width: var(--_lustrous-progress, 0%);
    }
  `,
];

protected override willUpdate(changed: PropertyValues): void {
  super.willUpdate(changed);
  if (changed.has("value") && this.style) {
    this.style.setProperty("--_lustrous-progress", `${Math.min(100, Math.max(0, this.value))}%`);
  }
}
```

```ts
// ❌ Forbidden — breaks strict CSP style-src policies and fails `pnpm check:clean`
return html`<div class="fill" style="width: ${this.value}%"></div>`;
```

### 4. Form-Associated Controls (`ElementInternals`)

Interactive value controls (`<lustrous-text-input>`, `<lustrous-select>`, `<lustrous-checkbox>`, `<lustrous-switch>`, `<lustrous-radio-group>`) participate natively in `<form>` submission, validation, `<fieldset disabled>`, and `form.reset()`:

```ts
export class LustrousCustomField extends LustrousElement {
  static formAssociated = true;
  static override shadowRootOptions: ShadowRootInit = {
    ...LustrousElement.shadowRootOptions,
    delegatesFocus: true,
  };

  @property({ reflect: true }) name = "";
  @property() value = "";
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) required = false;

  private defaultValue = "";
  protected readonly internals: ElementInternals | undefined =
    typeof this.attachInternals === "function" ? this.attachInternals() : undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    this.defaultValue = this.getAttribute("value") ?? this.value;
    this.syncFormState();
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formResetCallback(): void {
    this.value = this.defaultValue;
    this.syncFormState();
  }

  formStateRestoreCallback(state: string | File | FormData | null): void {
    if (typeof state === "string") {
      this.value = state;
      this.syncFormState();
    }
  }

  private syncFormState(): void {
    this.internals?.setFormValue(this.value);
    if (this.required && !this.value) {
      this.internals?.setValidity({ valueMissing: true }, "Please fill out this field.");
    } else {
      this.internals?.setValidity({});
    }
  }
}
```

**Event conventions:**
- Dispatch standard `input` (`bubbles: true, composed: true`) on live edits and `change` (`bubbles: true`) on commit.
- Dispatch `lustrous-change` (`bubbles: true, composed: true`) with typed `LustrousChangeDetail` (`{ value }`, `{ checked }`, `{ selected }`, or `{ collapsed }`).

### 5. Top-Layer Overlays (`<dialog>` & Popover API)

- **Modal overlays** (`<lustrous-modal>`, `<lustrous-dialog modal>`, `<lustrous-bottom-sheet>`, lightboxes) use native `<dialog>.showModal()` for top-layer stacking (`--lustrous-z-modal`), `::backdrop` scrims, and browser-enforced background inertness.
- **Non-modal floating surfaces** (`<lustrous-popover>`, `<lustrous-menu>`, `<lustrous-select>`, `<lustrous-tooltip>`, `<lustrous-snackbar>`) use the Popover API (`popover="auto"` or `popover="manual"`) so they escape `overflow: hidden` ancestors without portal reparenting.
- **Layered Escape & shortcut isolation**: Attach `new LustrousShortcutScopeController(this, { active: false })` and mark the overlay element with `data-lustrous-shortcut-scope=""`. Call `this.shortcutScope.setActive(this.open)` in `willUpdate()`, and check `this.shortcutScope.canHandleEscape(event)` before closing on `Escape` so nested menus/popovers inside modals dismiss one layer at a time while pausing background shortcuts.
- **Dismissal events**: Emit cancelable `lustrous-close-request` (`{ reason: "escape" | "scrim" | "dismiss" | "swipe" }`) before closing, and `lustrous-toggle` (`{ open: boolean }`) when `open` changes.

### 6. Server-Side Rendering (`@lit-labs/ssr`) Safety

Every component in `src/components/` is tested by `pnpm test:ssr` (both server rendering and Chromium hydration):

- Guard browser-only APIs in class field initializers, `constructor()`, and `willUpdate()`: check `typeof this.attachInternals === "function"`, `typeof window !== "undefined"`, `globalThis.matchMedia?.(...)`, and `if (this.style)`.
- Never access `document`, `ResizeObserver`, `IntersectionObserver`, `getComputedStyle()`, `showPopover()`, or `showModal()` during `render()` or `willUpdate()`. Run DOM measurements and imperative top-layer calls inside `firstUpdated()` and `updated()`.

### 7. Accessibility, `forced-colors` & RTL Checklist

Before shipping a component, verify all four axes (validated in CI via `pnpm test:a11y` and `pnpm test:visual:ci` across `light`, `dark`, and `forced-colors`):

- **WCAG 2.1 AA semantics & contrast:**
  - Normal text contrast `≥ 4.5:1`; UI control boundaries (`--lustrous-color-outline`) and focus indicators `≥ 3:1`.
  - Interactive touch targets measure at least `44×44px` (use a centered `::after` hit area on compact visual tracks like `<lustrous-switch size="s">`).
  - Every control has a programmatic accessible name (`<label>`, `aria-label`, or `aria-labelledby`), and icon-only controls warn when unlabelled.
- **Keyboard & Focus:**
  - Composite widgets (`tablist`, `radiogroup`, `menu`, `listbox`) implement roving `tabindex` with `Arrow*`, `Home`, and `End` keys.
  - Overlays move focus inside on open (unless hover-triggered) and restore focus to the trigger on close.
- **Windows High Contrast (`@media (forced-colors: active)`):**
  - Shadow-only surfaces (`box-shadow`, `filter: drop-shadow`) add explicit `1px solid CanvasText` or `ButtonBorder` borders because shadows are stripped in forced-colors mode.
  - Custom drawn indicators (switch thumbs, radio dots, selected segments, progress fills) use `Highlight` / `HighlightText` and `GrayText` when disabled, setting `forced-color-adjust: none` only on the indicator fill itself.
- **Right-to-Left (`dir="rtl"`) & BiDi:**
  - Use CSS logical properties everywhere (`padding-inline`, `margin-inline-start`, `inset-inline-end`, `border-start-end-radius`, `text-align: start`).
  - Flip horizontal arrow-key navigation when `getComputedStyle(this).direction === "rtl"`, mirror directional icons via `:dir(rtl)`, and wrap shortcut hints in `isolateBidi()` from `@ghchinoy/lustrous-lit/theme`.
