# `<lustrous-text-area>`

Form-associated multi-line outlined textarea extending `<lustrous-text-input>` with `rows`, `min-rows`, `max-rows`, `auto-grow` (default `true`), `resize`, `character-count`, vertical scroll fade masks, constraint validation, and form reset.

## Usage

```html
<lustrous-text-area
  label="Incident summary"
  name="summary"
  rows="3"
  max-rows="8"
  character-count
  maxlength="500"
  placeholder="Describe root cause and remediation steps…"
  required
></lustrous-text-area>

<lustrous-text-area
  label="Release notes"
  rows="4"
  auto-grow="false"
  resize="vertical"
></lustrous-text-area>
```

## Properties & Attributes

Inherits all properties and slots from `<lustrous-text-input>`, plus:

| Property | Attribute | Type | Default | Description |
| :-- | :-- | :-- | :-- | :-- |
| `rows` | `rows` | `number` | `4` | Resting visible line count. |
| `minRows` | `min-rows` | `number` | `rows` | Minimum line count while auto-growing. |
| `maxRows` | `max-rows` | `number` | `undefined` | Maximum line count before scrolling. |
| `autoGrow` | `auto-grow` | `boolean` | `true` | Automatically resizes height with content (`auto-grow="false"` to disable). |
| `resize` | `resize` | `"none" \| "vertical" \| "horizontal" \| "both"` | `"none"` | Native CSS resize handle when `auto-grow` is off. |
