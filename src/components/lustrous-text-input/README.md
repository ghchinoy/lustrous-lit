# `<lustrous-text-input>`

Form-associated single-line outlined text field with static `label`, `caption`, `supporting-text`, `error`, async `validation-state` (`validating | success | error`), leading/trailing icons and slots, text affixes, `character-count`, overflow edge fades, and native constraint validation.

## Usage

```html
<lustrous-text-input
  label="Work email"
  name="email"
  type="email"
  placeholder="ada@example.com"
  supporting-text="Used for organization notifications."
  required
></lustrous-text-input>

<lustrous-text-input
  label="Monthly budget"
  leading-text="$"
  trailing-text="USD"
  value="2,500"
></lustrous-text-input>
```

## Properties & Attributes

| Property | Attribute | Type | Default | Description |
| :-- | :-- | :-- | :-- | :-- |
| `label` | `label` | `string` | `""` | Static label above the field frame. |
| `caption` | `caption` | `string` | `""` | End-aligned caption in the header row. |
| `value` | `value` | `string` | `""` | Current text value (attribute sets reset default). |
| `size` | `size` | `"m" \| "s"` | `"m"` | Frame height (`44px` or `36px`). |
| `borderRadius` | `border-radius` | `LustrousRadiusToken` | `"m"` | Overrides the `10px` default frame radius. |
| `type` | `type` | `"text" \| "email" \| "password" \| "search" \| "tel" \| "url" \| "number"` | `"text"` | Native `<input>` type. |
| `placeholder` | `placeholder` | `string` | `""` | Placeholder hint text. |
| `supportingText` | `supporting-text` | `string` | `""` | Helper text below the field. |
| `error` | `error` | `string \| null` | `null` | Error flag or alert message below the field. |
| `validationState` | `validation-state` | `"default" \| "validating" \| "success" \| "error"` | `"default"` | Validation status indicator (`<lustrous-spinner size="xs">` when `validating`). |
| `leadingIcon` | `leading-icon` | `LustrousIconName` | `undefined` | Decorative leading icon. |
| `trailingIcon` | `trailing-icon` | `LustrousIconName` | `undefined` | Decorative trailing icon. |
| `leadingText` | `leading-text` | `string` | `""` | Leading text affix (e.g. `$`). |
| `trailingText` | `trailing-text` | `string` | `""` | Trailing text affix (e.g. `USD`). |
| `characterCount` | `character-count` | `boolean` | `false` | Shows a `count` or `count/maxlength` counter. |
| `maxlength` / `minlength` | `maxlength` / `minlength` | `number` | `undefined` | Character length constraints. |
| `pattern` | `pattern` | `string` | `undefined` | Regular expression constraint. |
| `autocomplete` | `autocomplete` | `string` | `undefined` | Native autofill hint. |
| `readonly` | `readonly` | `boolean` | `false` | Marks the value read-only. |
| `required` | `required` | `boolean` | `false` | Marks the field required. |
| `disabled` | `disabled` | `boolean` | `false` | Disables the field. |
