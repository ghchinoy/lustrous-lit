# `<lustrous-dialog>`

Inline or `modal` dialog card built on `<lustrous-modal>`. Supports `s` (`320px`), `m` (`420px`), and `l` (`560px`) sizes, optional `dismissible` header close button (`close-label` defaulting to `getLustrousLabels().close`), scrolling body, and built-in or slotted actions.

```html
<lustrous-dialog
  modal
  dismissible
  heading="Delete project?"
  primary-action="Delete"
  secondary-action="Cancel"
>
  <lustrous-button slot="trigger" variant="tonal" icon="delete">Delete project</lustrous-button>
  Deleting this project permanently removes all associated snapshots and deployment keys.
</lustrous-dialog>
```

## Attributes & Properties

| Name | Type | Default | Description |
| :-- | :-- | :-- | :-- |
| `heading` | `string` | `""` | Dialog title; also names the dialog. |
| `size` | `"s" \| "m" \| "l"` | `"m"` | Card width preset (`320px` / `420px` / `560px`). |
| `modal` | `boolean` | `false` | Renders inside `<lustrous-modal>` instead of inline. |
| `open` | `boolean` | `false` | Controls modal open state. |
| `dismissible` | `boolean` | `false` | Shows a header close icon button. |
| `close-label` | `string` | `getLustrousLabels().close` | Accessible name of the header close button. |
| `close-disabled` | `boolean` | `false` | Disables the header close button. |
| `primary-action` | `string` | `""` | Primary action button label. |
| `secondary-action` | `string` | `""` | Secondary action button label. |

## Events

- `lustrous-action` — Cancelable `CustomEvent<{ action: "primary" | "secondary" }>`.
- `lustrous-close-request` — Cancelable `CustomEvent<{ reason: "escape" | "scrim" | "dismiss" }>`.
- `lustrous-toggle` — `CustomEvent<{ open: boolean }>` (when `modal` is enabled).
