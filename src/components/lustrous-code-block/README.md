# `<lustrous-code-block>`

Dark code surface (`--lustrous-color-code-background`, `--lustrous-color-code-primary-text`, `--lustrous-color-code-outline`) set in `--lustrous-font-code` with an optional `label` header, horizontal scroll or line wrapping (`wrap`), and a `<lustrous-icon-button>` copy action that transitions from `"copy"` to `"check"` with a polite live-region announcement.

```html
<lustrous-code-block
  label="Install"
  code="pnpm add @ghchinoy/lustrous-lit lit"
></lustrous-code-block>
```

## Attributes & Properties

| Name | Type | Default | Description |
| :-- | :-- | :-- | :-- |
| `label` | `string` | `""` | Optional filename, language, or caption in the header bar. |
| `code` | `string` | `""` | Code string to display and copy; falls back to slotted text when empty. |
| `wrap` | `boolean` | `false` | Wraps long lines (`white-space: pre-wrap`) instead of scrolling horizontally. |
| `no-copy` | `boolean` | `false` | Hides the copy button. |
| `copy-label` | `string` | `""` | Custom accessible label for the copy button (defaults to `"Copy <label>"` or `"Copy code"`). |

## Events

- `lustrous-copy` — `CustomEvent<{ code: string }>` dispatched after copying code to the clipboard.
