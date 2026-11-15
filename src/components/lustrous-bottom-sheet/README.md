# `<lustrous-bottom-sheet>`

Mobile-first modal bottom sheet extending `<lustrous-modal>`. Supports `0.5` peek and `1` full-height snap points (`default-snap-point`), drag-handle expansion and swipe-to-close (`lustrous-close-request` with `reason: "swipe" | "escape" | "scrim"`), background scroll locking, and focus restoration.

```html
<lustrous-bottom-sheet label="Share options">
  <lustrous-button slot="trigger" variant="tonal" icon="share">Share</lustrous-button>
  <lustrous-text variant="headline-small" heading="2">Share document</lustrous-text>
  <lustrous-text muted block>Choose how collaborators can access this link.</lustrous-text>
</lustrous-bottom-sheet>
```

## Attributes & Properties

| Name | Type | Default | Description |
| :-- | :-- | :-- | :-- |
| `open` | `boolean` | `false` | Opens or closes the modal sheet. |
| `expanded` | `boolean` | `false` | Expands tall content beyond the 50% peek snap point. |
| `default-snap-point` | `0.5 \| 1` | `0.5` | Initial snap fraction when opened. |
| `label` | `string` | `"Bottom sheet"` | Accessible name applied to the modal `<dialog>`. |
| `returnFocus` | `HTMLElement \| null` | `undefined` | Element focused when the sheet closes (property only). |
| `initialFocus` | `HTMLElement \| null` | `undefined` | Element focused when the sheet opens (property only). |

## Events

- `lustrous-close-request` — Cancelable `CustomEvent<{ reason: "swipe" | "escape" | "scrim" }>`.
- `lustrous-toggle` — `CustomEvent<{ open: boolean }>` dispatched after opening or closing.
