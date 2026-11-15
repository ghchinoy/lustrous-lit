# `<lustrous-pressable>`

Interactive surface primitive extending `<lustrous-box>` for clickable cards, option tiles, and custom rows with the Lustrous state layer, focus ring, and `forced-colors` support.

Surface properties (`background`, `border`, `border-radius`, `shadow`, `width`, …) apply to the outer host while `padding*` tokens apply to the inner `.inner` control so the full surface area is clickable.

## Usage

```html
<lustrous-pressable padding="l" border border-radius="l" background="surface-container">
  <strong>Standard cluster</strong>
  <div>3 replicas · Multi-zone failover</div>
</lustrous-pressable>

<lustrous-pressable href="/docs/architecture" padding="m" border-radius="m">
  Read architecture overview
</lustrous-pressable>
```

## Properties & Attributes

| Property | Attribute | Type | Default | Description |
| :-- | :-- | :-- | :-- | :-- |
| `selected` | `selected` | `boolean` | `false` | Applies a visual selected surface highlight. |
| `disabled` | `disabled` | `boolean` | `false` | Disables pointer and keyboard interaction. |
| `focusable` | `focusable` | `boolean` | `true` | Keeps the inner control in the tab order with a focus ring (`focusable="false"` sets `tabindex="-1"`). |
| `href` | `href` | `string` | `undefined` | Renders an inner `<a>` link instead of `<button>`. |
| `target` | `target` | `string` | `undefined` | Link browsing context target (`_blank` adds `rel="noopener noreferrer"` by default). |
| `rel` | `rel` | `string` | `undefined` | Link relationship token list. |
| `download` | `download` | `string` | `undefined` | Prompts downloading the linked resource. |
