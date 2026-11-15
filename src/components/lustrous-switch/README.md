# `<lustrous-switch>`

Form-associated toggle switch (`role="switch"`) with `size="m | s"`, a 44×44px minimum touch target, optional `icon` and `off-icon` thumb glyphs, slotted row labels with `supporting-text`, `<fieldset disabled>`, and `forced-colors` support.

## Usage

```html
<lustrous-switch checked supporting-text="Send deployment alerts to Slack">
  Deployment notifications
</lustrous-switch>

<lustrous-switch size="s" aria-label="Compact mode"></lustrous-switch>
<lustrous-switch icon="check" off-icon="close" aria-label="Enable TLS"></lustrous-switch>
```

## Properties & Attributes

| Property | Attribute | Type | Default | Description |
| :-- | :-- | :-- | :-- | :-- |
| `checked` | `checked` | `boolean` | `false` | Whether the switch is toggled on. |
| `size` | `size` | `"m" \| "s"` | `"m"` | Visual track size (`52×32` or `32×20`). |
| `icon` | `icon` | `LustrousIconName` | `undefined` | Thumb glyph when checked (size `m`). |
| `offIcon` | `off-icon` | `LustrousIconName` | `undefined` | Thumb glyph when unchecked (size `m`). |
| `supportingText` | `supporting-text` | `string` | `""` | Secondary description under the slotted label. |
| `name` | `name` | `string` | `undefined` | Form submission key. |
| `value` | `value` | `string` | `"on"` | Form value submitted when checked. |
| `required` | `required` | `boolean` | `false` | Marks the switch required for form submission. |
| `disabled` | `disabled` | `boolean` | `false` | Disables interaction. |

## Events

- `lustrous-change` (`CustomEvent<{ checked: boolean }>`) — Dispatched on user toggle (`bubbles: true, composed: true`).
- `change` / `input` — Native form control events.
