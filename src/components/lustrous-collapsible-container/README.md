# `<lustrous-collapsible-container>`

Headless animated disclosure primitive (`grid-template-rows: 0fr` ↔ `1fr`) that wires any trigger button in `slot="trigger"` (`<lustrous-button>`, `<lustrous-icon-button>`, `<button>`, `[role="button"]`) with `aria-expanded` / `expanded` chevron state and marks collapsed content `inert` and `aria-hidden="true"`.

```html
<lustrous-collapsible-container expanded>
  <lustrous-button slot="trigger" variant="on-surface">Network topology</lustrous-button>
  <lustrous-text block muted padding-top="s" padding-inline="m">
    Traffic routes through regional edge proxies with mutual TLS verification.
  </lustrous-text>
</lustrous-collapsible-container>
```

## Attributes & Properties

| Name | Type | Default | Description |
| :-- | :-- | :-- | :-- |
| `expanded` | `boolean` | `false` | Reflected boolean controlling whether the disclosure content is expanded. |
| `open` | `boolean` | `false` | Alias for `expanded`. |
| `inline-bleed` | `LustrousPaddingValue` | `undefined` | Widens `.inner` inline padding/negative-margin so negative-margin children preserve horizontal bleed while folding. |

## Events

- `lustrous-toggle` — Cancelable `CustomEvent<{ open: boolean, expanded: boolean }>` fired before toggling; call `preventDefault()` for controlled state management.
