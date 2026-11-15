# `<lustrous-togglable-icon-button>`

Circular icon-only toggle button extending `<lustrous-icon-button>` with `selected` (`aria-pressed`), optional `selected-icon`, and cancelable `lustrous-change` events.

Keep `aria-label` stable across states (for example `"Pin panel"` rather than `"Unpin panel"`) because assistive technologies announce `aria-pressed` alongside the label.

## Usage

```html
<lustrous-togglable-icon-button icon="star" aria-label="Star item"></lustrous-togglable-icon-button>
<lustrous-togglable-icon-button
  icon="pin"
  selected-icon="unpin"
  variant="tonal"
  selected
  aria-label="Pin sidebar"
></lustrous-togglable-icon-button>
```

## Properties & Attributes

| Property | Attribute | Type | Default | Description |
| :-- | :-- | :-- | :-- | :-- |
| `selected` | `selected` | `boolean` | `false` | Pressed toggle state (`aria-pressed`). |
| `icon` | `icon` | `LustrousIconName` | `"bolt"` | Icon glyph when unselected (and when `selected-icon` is unset). |
| `selectedIcon` | `selected-icon` | `LustrousIconName` | `undefined` | Optional icon glyph rendered while `selected`. |
| `variant` | `variant` | `LustrousIconButtonVariant` | `"on-surface"` | Unselected surface style. |
| `size` | `size` | `"m" \| "s" \| "xs"` | `"m"` | Button diameter (`44px`, `36px`, `28px`). |
| `badge` | `badge` | `boolean` | `false` | Displays an unread indicator dot. |
| `disabled` | `disabled` | `boolean` | `false` | Disables interaction. |

## Events

- `lustrous-change` (`CustomEvent<{ selected: boolean }>`) — Cancelable; call `preventDefault()` to control `selected` externally.
