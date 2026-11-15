# `<lustrous-togglable-button>`

Toggle action button extending `<lustrous-button>` with a binary `selected` state (`aria-pressed="true | false"`).

Defaults to `variant="tonal"` and highlights with `--lustrous-color-accent-container` when `selected`.

## Usage

```html
<lustrous-togglable-button icon="pin">Pin view</lustrous-togglable-button>
<lustrous-togglable-button icon="check" selected>Following</lustrous-togglable-button>
<lustrous-togglable-button variant="outline" shape="pill">Errors only</lustrous-togglable-button>
```

## Properties & Attributes

| Property | Attribute | Type | Default | Description |
| :-- | :-- | :-- | :-- | :-- |
| `selected` | `selected` | `boolean` | `false` | Pressed toggle state (`aria-pressed`). |
| `variant` | `variant` | `LustrousButtonVariant` | `"tonal"` | Unselected surface style. |
| `size` | `size` | `"m" \| "s" \| "xs"` | `"m"` | Control height (`44px`, `36px`, `28px`). |
| `shape` | `shape` | `"rounded" \| "pill"` | `"rounded"` | Corner shape. |
| `icon` | `icon` | `LustrousIconName` | `undefined` | Optional leading icon. |
| `trailingIcon` | `trailing-icon` | `LustrousIconName` | `undefined` | Optional trailing icon. |
| `disabled` | `disabled` | `boolean` | `false` | Disables interaction. |

## Events

- `lustrous-change` (`CustomEvent<{ selected: boolean }>`) — Cancelable; call `preventDefault()` to manage `selected` externally.
