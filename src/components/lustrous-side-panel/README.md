# `<lustrous-side-panel>`

Persistent complementary `<aside>` panel supporting desktop `split` card framing and mobile `takeover` full-area presentation. Coordinates Escape dismissal via `LustrousShortcutScopeController`, yields to active modal dialogs (`hasOpenModalDialog()`), announces non-focused opens politely, and restores focus when closed or unmounted.

```html
<lustrous-side-panel open label="Inspector" focus-on-open>
  <lustrous-flex slot="header" justify="between" align="center" padding="l">
    <lustrous-text variant="headline-small" heading="2">Inspector</lustrous-text>
    <lustrous-icon-button icon="close" size="s" aria-label="Close inspector"></lustrous-icon-button>
  </lustrous-flex>
  <lustrous-box padding="l">Panel details…</lustrous-box>
</lustrous-side-panel>
```

## Attributes & Properties

| Name | Type | Default | Description |
| :-- | :-- | :-- | :-- |
| `open` | `boolean` | `false` | Shows or hides the panel. |
| `presentation` | `"split" \| "takeover"` | `"split"` | Framed side card (`split`) or edge-to-edge surface (`takeover`). |
| `side` | `"inline-end" \| "inline-start"` | `"inline-end"` | Logical edge used for lateral entrance animation. |
| `label` | `string` | `""` | Accessible name of the `<aside>` landmark. |
| `announcement` | `string` | `undefined` | Polite live-region text announced when opened without `focus-on-open`. |
| `focus-on-open` | `boolean` | `false` | Moves focus to the panel landmark when opened. |
| `border` | `boolean` | `true` | Draws a `1px` card border in `split` mode (`border="false"` to disable). |
| `shadow` | `"" \| "1" \| "2"` | `undefined` | Optional card elevation in `split` mode. |
| `margin` | `LustrousPaddingValue` | `"m"` | Outer spacing around the card in `split` mode. |
| `scrollable` | `boolean` | `true` | Wraps body content in `<lustrous-scrollable-box>`. |
| `scrim` | `"both" \| "start" \| "end" \| "none"` | `"both"` | Scroll edge fades when `scrollable` is enabled. |
| `returnFocus` | `HTMLElement \| null` | `undefined` | Element focused when the panel closes (property only). |

## Events

- `lustrous-close-request` — Cancelable `CustomEvent<{ reason: "escape" }>`. Set `open = false` in your handler to close.
