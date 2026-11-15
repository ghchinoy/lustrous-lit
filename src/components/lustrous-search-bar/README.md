# `<lustrous-search-bar>`

Form-associated toolbar and page search input with a decorative leading `search` icon, automatic clear button (`<lustrous-icon-button icon="close" size="s">`), `Enter` search submission (`lustrous-search` `{ value }`), and `Escape` clear-or-blur behavior.

## Usage

```html
<lustrous-search-bar
  name="q"
  placeholder="Search documentation…"
></lustrous-search-bar>

<lustrous-search-bar value="design tokens" aria-label="Search components">
  <lustrous-icon-button slot="trailing" icon="sliders" size="s" aria-label="Filters"></lustrous-icon-button>
</lustrous-search-bar>
```

## Properties & Attributes

| Property | Attribute | Type | Default | Description |
| :-- | :-- | :-- | :-- | :-- |
| `value` | `value` | `string` | `""` | Current search query. |
| `placeholder` | `placeholder` | `string` | `"Search"` | Placeholder text and fallback accessible name. |
| `icon` | `icon` | `LustrousIconName` | `"search"` | Leading decorative icon. |
| `variant` | `variant` | `"floating" \| "outlined" \| "transparent"` | `"floating"` | Surface style. |
| `size` | `size` | `"m" \| "s"` | `"m"` | Pill height (`44px` or `36px`). |
| `showClear` | `show-clear` | `"auto" \| "false"` | `"auto"` | Shows clear button when `value` is non-empty. |
| `clearLabel` | `clear-label` | `string` | `"Clear search"` | Accessible label for the clear button. |
| `name` | `name` | `string` | `undefined` | Form submission key. |
| `disabled` | `disabled` | `boolean` | `false` | Disables the search input. |

## Events

- `lustrous-search` (`CustomEvent<{ value: string }>`) — Fired on `Enter` (`bubbles: true, composed: true`).
- `lustrous-clear` (`CustomEvent<void>`) — Fired when cleared (`bubbles: true, composed: true`).
