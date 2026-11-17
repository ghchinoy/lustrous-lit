# Using Lustrous Across Frameworks & Runtimes

Because `@ghchinoy/lustrous-lit` compiles to standard Custom Elements v1, Shadow DOM, and `ElementInternals`, its components work in plain HTML, modern frontend frameworks, server-rendered Go/Rust/Python backends, and `@lit-labs/ssr` pipelines.

---

## Package Entry Points

| Import Specifier | Purpose |
| :-- | :-- |
| `@ghchinoy/lustrous-lit` | Registers all `<lustrous-*>` custom elements and re-exports `@ghchinoy/lustrous-lit/theme` |
| `@ghchinoy/lustrous-lit/theme` | Side-effect-free tokens, theme helpers, localization, media controllers, shortcut controllers, and `LustrousElement` |
| `@ghchinoy/lustrous-lit/components/<tag>` | Registers a single component (e.g. `@ghchinoy/lustrous-lit/components/lustrous-button`) and exports its class/types/helpers |
| `@ghchinoy/lustrous-lit/theme.css` | Prebuilt `@layer lustrous` CSS custom properties and `.lustrous-*` typography stylesheet |
| `@ghchinoy/lustrous-lit/fonts.css` | `@font-face` declarations for bundled OFL-1.1 Google Sans Flex and Google Sans Code |
| `@ghchinoy/lustrous-lit/custom-elements.json` | Custom Elements Manifest for IDE autocomplete, Storybook, and wrapper generators |

---

## Plain HTML + Import Maps (No Bundler)

Modern browsers load ES modules directly using `<script type="importmap">`:

```html
<!doctype html>
<html lang="en" data-theme="system" class="lustrous-root">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="/vendor/lustrous-lit/dist/lustrous-theme.css" />
    <link rel="stylesheet" href="/vendor/lustrous-lit/fonts/lustrous-fonts.css" />
    <script type="importmap">
      {
        "imports": {
          "lit": "/vendor/lit/index.js",
          "lit/": "/vendor/lit/",
          "lit-html": "/vendor/lit-html/lit-html.js",
          "lit-html/": "/vendor/lit-html/",
          "lit-element/": "/vendor/lit-element/",
          "@lit/reactive-element": "/vendor/reactive-element/reactive-element.js",
          "@lit/reactive-element/": "/vendor/reactive-element/",
          "@ghchinoy/lustrous-lit": "/vendor/lustrous-lit/dist/index.js",
          "@ghchinoy/lustrous-lit/": "/vendor/lustrous-lit/dist/"
        }
      }
    </script>
  </head>
  <body>
    <lustrous-flex direction="column" gap="m" padding="2xl" max-width="480">
      <lustrous-text variant="headline-medium" heading="1">Quick Deploy</lustrous-text>
      <lustrous-text-input id="service" label="Service name" value="edge-gateway"></lustrous-text-input>
      <lustrous-button id="deploy" icon="bolt">Deploy</lustrous-button>
    </lustrous-flex>

    <script type="module">
      import "@ghchinoy/lustrous-lit/components/lustrous-flex/lustrous-flex.js";
      import "@ghchinoy/lustrous-lit/components/lustrous-text/lustrous-text.js";
      import "@ghchinoy/lustrous-lit/components/lustrous-text-input/lustrous-text-input.js";
      import "@ghchinoy/lustrous-lit/components/lustrous-button/lustrous-button.js";
      import { showSnack } from "@ghchinoy/lustrous-lit/components/lustrous-snackbar/lustrous-snackbar.js";

      document.getElementById("deploy").addEventListener("click", () => {
        const name = document.getElementById("service").value;
        showSnack(`Deployed ${name}`, { variant: "positive" });
      });
    </script>
  </body>
</html>
```

For quick prototypes or sandboxes without vendoring `node_modules`, you can also import directly from public npm CDNs (`jsDelivr` + `esm.sh`):

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@ghchinoy/lustrous-lit@0.1.0/fonts/lustrous-fonts.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@ghchinoy/lustrous-lit@0.1.0/dist/lustrous-theme.css" />
<script type="module">
  import "https://esm.sh/@ghchinoy/lustrous-lit@0.1.0/components/lustrous-button";
</script>
```

---

## Lit 3

Import individual components for optimal tree-shaking, bind non-primitive arrays/objects with `.prop=${...}`, boolean attributes with `?attr=${...}`, and events with `@lustrous-change=${...}`:

```ts
import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { LustrousElement, LustrousShortcutController, type LustrousChangeEvent } from "@ghchinoy/lustrous-lit/theme";
import "@ghchinoy/lustrous-lit/components/lustrous-flex";
import "@ghchinoy/lustrous-lit/components/lustrous-segmented-control";
import "@ghchinoy/lustrous-lit/components/lustrous-search-bar";

@customElement("trace-toolbar")
export class TraceToolbar extends LustrousElement {
  @state() private mode = "live";
  @state() private query = "";

  private readonly focusSearch = new LustrousShortcutController(this, {
    id: "trace.search",
    keys: "Mod+K",
    onTrigger: () => this.renderRoot.querySelector("lustrous-search-bar")?.focus(),
  });

  protected override render() {
    return html`
      <lustrous-flex align="center" gap="m" mobile-direction="column">
        <lustrous-segmented-control
          .value=${this.mode}
          .options=${[
            { value: "live", label: "Live", icon: "bolt" },
            { value: "archived", label: "Archived", icon: "archive" },
          ]}
          @lustrous-change=${(e: LustrousChangeEvent) => (this.mode = e.detail.value ?? "live")}
        ></lustrous-segmented-control>

        <lustrous-search-bar
          placeholder="Filter traces…"
          .value=${this.query}
          @input=${(e: Event) => (this.query = (e.currentTarget as HTMLInputElement).value)}
        ></lustrous-search-bar>
      </lustrous-flex>
    `;
  }
}
```

---

## React 19 & `@lit/react`

### React 19 (Native Custom Element Support)

React 19 natively assigns JavaScript properties (such as `options`, `tabs`, `items`, `sections`) onto custom element instances and binds `CustomEvent` listeners with `on<eventName>` (`onlustrous-change`, `onlustrous-action`, `onlustrous-toggle`):

```tsx
import { useState } from "react";
import "@ghchinoy/lustrous-lit/theme.css";
import "@ghchinoy/lustrous-lit/fonts.css";
import "@ghchinoy/lustrous-lit/components/lustrous-button";
import "@ghchinoy/lustrous-lit/components/lustrous-flex";
import "@ghchinoy/lustrous-lit/components/lustrous-select";
import type { LustrousChangeEvent } from "@ghchinoy/lustrous-lit/theme";

const ROLES = [
  { value: "viewer", label: "Viewer", description: "Read-only dashboard access" },
  { value: "editor", label: "Editor", description: "Deploy and manage services" },
];

export function RoleInviteForm() {
  const [role, setRole] = useState("viewer");

  return (
    <lustrous-flex direction="column" gap="m" padding="l">
      <lustrous-select
        label="Workspace role"
        value={role}
        options={ROLES}
        onlustrous-change={(e: LustrousChangeEvent) => setRole(e.detail.value ?? "viewer")}
      />
      <lustrous-button icon="bolt" onClick={() => console.log("Selected:", role)}>
        Send Invite
      </lustrous-button>
    </lustrous-flex>
  );
}
```

### React 18+ Wrapper Components (`@lit/react`)

If you use React 18 or want idiomatic PascalCase components with typed `onChange` / `onAction` props, wrap Lustrous classes with `@lit/react`:

```tsx
import React from "react";
import { createComponent, type EventName } from "@lit/react";
import { LustrousButton } from "@ghchinoy/lustrous-lit/components/lustrous-button";
import { LustrousSelect } from "@ghchinoy/lustrous-lit/components/lustrous-select";
import type { LustrousChangeEvent } from "@ghchinoy/lustrous-lit/theme";

export const Button = createComponent({
  tagName: "lustrous-button",
  elementClass: LustrousButton,
  react: React,
});

export const Select = createComponent({
  tagName: "lustrous-select",
  elementClass: LustrousSelect,
  react: React,
  events: {
    onLustrousChange: "lustrous-change" as EventName<LustrousChangeEvent>,
  },
});
```

---

## Vue 3

Tell Vue's template compiler to treat `lustrous-*` tags as native custom elements in `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith("lustrous-"),
        },
      },
    }),
  ],
});
```

Bind array/object properties with `.prop` (or Vue 3's automatic custom-element property heuristic) and listen to `lustrous-change`:

```vue
<script setup lang="ts">
import { ref } from "vue";
import "@ghchinoy/lustrous-lit/components/lustrous-tabs";
import "@ghchinoy/lustrous-lit/components/lustrous-box";
import type { LustrousChangeEvent } from "@ghchinoy/lustrous-lit/theme";

const activeTab = ref("overview");
const tabs = [
  { value: "overview", label: "Overview", icon: "activity" },
  { value: "logs", label: "Logs", icon: "terminal" },
];

function onTabChange(e: LustrousChangeEvent) {
  activeTab.value = e.detail.value ?? "overview";
}
</script>

<template>
  <lustrous-tabs :value="activeTab" :tabs.prop="tabs" @lustrous-change="onTabChange">
    <lustrous-box slot="overview" padding-top="m">Overview metrics</lustrous-box>
    <lustrous-box slot="logs" padding-top="m">Live log stream</lustrous-box>
  </lustrous-tabs>
</template>
```

---

## Angular

Add `CUSTOM_ELEMENTS_SCHEMA` to standalone components and bind properties `[...]` and events `(...)` directly:

```ts
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from "@angular/core";
import "@ghchinoy/lustrous-lit/components/lustrous-button";
import "@ghchinoy/lustrous-lit/components/lustrous-switch";
import type { LustrousChangeEvent } from "@ghchinoy/lustrous-lit/theme";

@Component({
  selector: "app-alerts-toggle",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <lustrous-switch
      [checked]="enabled()"
      supporting-text="Notify on deployment rollbacks"
      (lustrous-change)="onToggle($event)"
    >
      Pager alerts
    </lustrous-switch>
  `,
})
export class AlertsToggleComponent {
  readonly enabled = signal(true);

  onToggle(event: Event) {
    const detail = (event as LustrousChangeEvent).detail;
    this.enabled.set(Boolean(detail.checked));
  }
}
```

> **Angular Forms tip:** Because `<lustrous-text-input>`, `<lustrous-text-area>`, `<lustrous-select>`, `<lustrous-checkbox>`, `<lustrous-switch>`, and `<lustrous-radio-group>` are `ElementInternals` form-associated controls that emit standard `input` and `change` events, native `<form>` submission (`new FormData(form)`) works automatically, and `ngDefaultControl` can be used for simple `[(ngModel)]` bindings on text inputs.

---

## Svelte 5

Svelte 5 sets custom element properties directly when matching property descriptors exist on the element prototype and binds hyphenated custom events via `onlustrous-change`:

```svelte
<script lang="ts">
  import "@ghchinoy/lustrous-lit/components/lustrous-menu";
  import "@ghchinoy/lustrous-lit/components/lustrous-button";
  import type { LustrousMenuItem } from "@ghchinoy/lustrous-lit/components/lustrous-menu";

  const items: LustrousMenuItem[] = [
    { type: "action", id: "run", label: "Run Check", icon: "bolt", shortcut: "Mod+Enter" },
    { type: "divider" },
    { type: "action", id: "delete", label: "Delete", icon: "delete", destructive: true },
  ];
</script>

<lustrous-menu {items} onlustrous-select={(e) => console.log(e.detail.id)}>
  <lustrous-button slot="trigger" variant="tonal" expanded="false">Actions</lustrous-button>
</lustrous-menu>
```

---

## Embedded Go, Rust & Python Servers

`@ghchinoy/lustrous-lit` fits self-contained single-binary CLIs, admin consoles, observability dashboards, and HTMX/SSE server-rendered tools because it makes **no external CDN calls**: all icons are inline SVGs and both fonts are bundled WOFF2 files.

1. Build a small client entry bundle (e.g. with `esbuild` or `vite build`) that imports `@ghchinoy/lustrous-lit`, `@ghchinoy/lustrous-lit/theme.css`, and `@ghchinoy/lustrous-lit/fonts.css` into `web/static/`.
2. Embed `web/static/` directly into your server binary:

### Go (`embed.FS`)

```go
package ui

import (
	"embed"
	"io/fs"
	"net/http"
)

//go:embed static/*
var embeddedAssets embed.FS

func StaticHandler() http.Handler {
	sub, err := fs.Sub(embeddedAssets, "static")
	if err != nil {
		panic(err)
	}
	return http.StripPrefix("/static/", http.FileServer(http.FS(sub)))
}
```

### Rust (`include_dir` + Axum)

```rust
use axum::{http::{header, StatusCode, Uri}, response::IntoResponse};
use include_dir::{include_dir, Dir};

static ASSETS: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/web/static");

pub async fn static_asset(uri: Uri) -> impl IntoResponse {
    let path = uri.path().trim_start_matches('/');
    match ASSETS.get_file(path) {
        Some(file) => {
            let mime = mime_guess::from_path(path).first_or_octet_stream();
            ([(header::CONTENT_TYPE, mime.as_ref())], file.contents()).into_response()
        }
        None => StatusCode::NOT_FOUND.into_response(),
    }
}
```

### Python (`FastAPI` / `Starlette`)

```python
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI()
app.mount(
    "/static",
    StaticFiles(directory=Path(__file__).parent / "static"),
    name="static",
)
```

Server templates (Go `html/template`, Askama/Maud, Jinja2) can emit `<lustrous-box>`, `<lustrous-flex>`, `<lustrous-list>`, `<lustrous-badge>`, `<lustrous-dialog>`, and `<lustrous-text-input name="...">` as standard HTML, paired with native `<form method="post">` or HTMX attributes (`hx-post`, `hx-trigger="lustrous-change"`).

---

## Content Security Policy (CSP)

Lustrous is engineered for strict production CSP headers:

- **Zero inline `style=""` attributes in templates:** Component shadow templates never emit inline `style` attributes. Dynamic values (such as progress percentages or popover arrow offsets) are applied through the CSSOM (`element.style.setProperty`), which browsers permit under strict `style-src 'self'` without `'unsafe-inline'`.
- **Constructable Stylesheets (`adoptedStyleSheets`):** Both Lit's component styles and `installLustrousTheme()` adopt shared `CSSStyleSheet` instances via `adoptedStyleSheets` rather than injecting inline `<style>` tags in modern Chromium, Firefox, and Safari.
- **Recommended baseline CSP:**
  ```http
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data: https:;
  ```
  *(Prefer `<link rel="stylesheet" href=".../lustrous-fonts.css">` over `installLustrousFonts()` under `style-src 'self'` without nonces, because `installLustrousFonts()` appends a `<style>` tag to `<head>`.)*

---

## Server-Side Rendering (`@lit-labs/ssr`) & Hydration

Every Lustrous component supports Declarative Shadow DOM rendering with `@lit-labs/ssr` and client hydration via `@lit-labs/ssr-client`:

### 1. Server Render (`Node.js`)

```ts
import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import { render } from "@lit-labs/ssr";
import { collectResultSync } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import "@ghchinoy/lustrous-lit/components/lustrous-flex";
import "@ghchinoy/lustrous-lit/components/lustrous-button";
import "@ghchinoy/lustrous-lit/components/lustrous-text-input";

const fragment = collectResultSync(
  render(html`
    <lustrous-flex direction="column" gap="m" padding="l" max-width="400">
      <lustrous-text-input label="Project" value="lustrous"></lustrous-text-input>
      <lustrous-button icon="bolt">Create</lustrous-button>
    </lustrous-flex>
  `),
);
```

### 2. HTML Shell & Client Hydration Order

1. Link `@ghchinoy/lustrous-lit/theme.css` (and `fonts.css`) in `<head>` so Declarative Shadow DOM renders with full Lustrous colors, spacing, and typography **before** any JavaScript downloads.
2. On the client, import `@lit-labs/ssr-client/lit-element-hydrate-support.js` **before** importing `lit` or any `@ghchinoy/lustrous-lit` module:

```ts
// client-entry.ts — hydrate support MUST be the very first import!
import "@lit-labs/ssr-client/lit-element-hydrate-support.js";
import "@ghchinoy/lustrous-lit/components/lustrous-flex";
import "@ghchinoy/lustrous-lit/components/lustrous-button";
import "@ghchinoy/lustrous-lit/components/lustrous-text-input";
```

When `LustrousElement` hydrates an existing Declarative Shadow Root, it preserves the server-rendered shadow DOM without duplicating nodes and replays `slotchange` once in `firstUpdated()` so slotted triggers (`<lustrous-popover>`, `<lustrous-menu>`, `<lustrous-dialog modal>`) attach their interactive listeners.
