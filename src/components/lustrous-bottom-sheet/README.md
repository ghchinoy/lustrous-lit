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
| `scrollable` | `boolean` | `true` | Wraps default body slot inside `<lustrous-scrollable-box>` (set `scrollable="false"` to opt out). |
| `body-scrim` | `"both" \| "start" \| "end" \| "none"` | `"both"` | Edge scrim fade applied to the scrollable body container. |
| `label` | `string` | `"Bottom sheet"` | Accessible name applied to the modal `<dialog>`. |
| `returnFocus` | `HTMLElement \| null` | `undefined` | Element focused when the sheet closes (property only). |
| `initialFocus` | `HTMLElement \| (() => HTMLElement \| null \| undefined) \| null` | `undefined` | Element (or resolver) focused when the sheet opens (property only). |

## Slots

- Default slot — Sheet body content.
- `header` — Fixed header rendered above the scrollable body.
- `footer` — Fixed footer rendered below the scrollable body.
- `trigger` — Optional trigger element that opens the sheet on click.

## Events

- `lustrous-close-request` — Cancelable `CustomEvent<{ reason: "swipe" | "escape" | "scrim" }>`.
- `lustrous-toggle` — `CustomEvent<{ open: boolean }>` dispatched after opening or closing.
