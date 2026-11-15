# `<lustrous-radio-group>` & `<lustrous-radio>`

Form-associated `role="radiogroup"` container and `role="radio"` options with roving `tabindex`, directional arrow / `Home` / `End` keyboard selection, `supporting-text`, `error`, `orientation="vertical | horizontal"`, `FormData`, `required` constraint validation, `formResetCallback`, `<fieldset disabled>`, and `forced-colors` support.

## Usage

```html
<lustrous-radio-group label="Billing cadence" name="cadence" value="annual" required>
  <lustrous-radio value="monthly" supporting-text="Billed at the start of every month.">
    Monthly
  </lustrous-radio>
  <lustrous-radio value="annual" supporting-text="Save 20% with annual commitment.">
    Annual
  </lustrous-radio>
</lustrous-radio-group>
```

## `<lustrous-radio-group>` Properties & Attributes

| Property | Attribute | Type | Default | Description |
| :-- | :-- | :-- | :-- | :-- |
| `label` | `label` | `string` | `""` | Visible group heading and accessible name. |
| `name` | `name` | `string` | `undefined` | Form submission key. |
| `value` | `value` | `string` | `""` | Currently selected radio value (reflected). |
| `orientation` | `orientation` | `"vertical" \| "horizontal"` | `"vertical"` | Layout axis for child radios. |
| `supportingText` | `supporting-text` | `string` | `""` | Helper text below the group. |
| `error` | `error` | `string \| null` | `null` | Error flag or alert message below the group. |
| `required` | `required` | `boolean` | `false` | Requires a selection for form validity. |
| `disabled` | `disabled` | `boolean` | `false` | Disables all radios in the group. |

## `<lustrous-radio>` Properties & Attributes

| Property | Attribute | Type | Default | Description |
| :-- | :-- | :-- | :-- | :-- |
| `value` | `value` | `string` | `""` | Option value submitted by the group. |
| `checked` | `checked` | `boolean` | `false` | Reflected checked state. |
| `disabled` | `disabled` | `boolean` | `false` | Disables this individual option. |
| `supportingText` | `supporting-text` | `string` | `""` | Secondary description linked via `aria-describedby`. |

## Events

- `lustrous-change` (`CustomEvent<{ value: string }>`) — Dispatched on user selection (`bubbles: true, composed: true`).
- `change` / `input` — Native-style form events on user selection.
