# `<lustrous-select>`

Form-associated custom single-select dropdown matching `<lustrous-text-input>`'s field geometry (`44px` at `m`, `36px` at `s`, `10px` default corner radius), rendered in the browser top layer via `[popover="auto"]` and `autoPosition()`.

## Usage

```html
<!-- Declarative light-DOM options -->
<lustrous-select label="Deployment region" name="region" required>
  <option value="us-east1">US East (South Carolina)</option>
  <option value="europe-west1">Europe West (Belgium)</option>
  <option value="asia-northeast1">Asia Northeast (Tokyo)</option>
</lustrous-select>
```

```ts
// Rich structured options with icons, descriptions, and groups
html`
  <lustrous-select
    label="Environment"
    .options=${[
      { value: "prod", label: "Production", description: "High-availability multi-zone", icon: "shield", group: "Live" },
      { value: "staging", label: "Staging", description: "Pre-release validation", icon: "science", group: "Testing" },
    ]}
  ></lustrous-select>
`;
```

## Properties & Attributes

| Property | Attribute | Type | Default | Description |
| :-- | :-- | :-- | :-- | :-- |
| `label` | `label` | `string` | `""` | Static label above the combobox trigger. |
| `caption` | `caption` | `string` | `""` | End-aligned caption in the header row. |
| `placeholder` | `placeholder` | `string` | `"Select…"` | Text displayed when no option is selected. |
| `value` | `value` | `string` | `""` | Selected option value (attribute sets reset default). |
| `options` | — | `readonly LustrousSelectOption[]` | `[]` | Structured options array (overrides light-DOM `<option>` children). |
| `open` | `open` | `boolean` | `false` | Whether the top-layer listbox is open. |
| `size` | `size` | `"m" \| "s"` | `"m"` | Combobox height (`44px` or `36px`). |
| `supportingText` | `supporting-text` | `string` | `""` | Helper text below the field. |
| `error` | `error` | `string \| null` | `null` | Error flag or alert message below the field. |
| `validationState` | `validation-state` | `"default" \| "validating" \| "success" \| "error"` | `"default"` | Async validation state indicator. |
| `name` | `name` | `string` | `undefined` | Form submission key. |
| `required` | `required` | `boolean` | `false` | Marks selection required (`valueMissing`). |
| `disabled` | `disabled` | `boolean` | `false` | Disables the control. |

## Events

- `lustrous-change` (`CustomEvent<{ value: string }>`) — Dispatched on user selection (`bubbles: true, composed: true`).
- `input` / `change` — Native-style form events on user selection.
