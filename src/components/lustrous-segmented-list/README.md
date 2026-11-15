# `<lustrous-segmented-list>`

Vertical grouped list (`role="list"`) that rounds the outer corners of its first and last items while using crisp `xs` (`4px`) inner seams—or a continuous card with `16px`-inset `1px` hairlines when `divider` is set.

## Elements

- `<lustrous-segmented-list>` — List container (`border-radius="s | m | l | xl | 2xl"`, `divider`, `gap`, `label`).
- `<lustrous-segmented-list-item>` — Static or composite `<lustrous-box>` row supporting `slot="action"` for trailing controls.
- `<lustrous-segmented-list-button>` — Interactive `<lustrous-pressable>` button row with an inset focus ring.
- `<lustrous-segmented-list-link>` — Interactive `<lustrous-pressable>` link row (`href`) with an inset focus ring.

## Usage

```html
<lustrous-segmented-list label="Notification preferences">
  <lustrous-segmented-list-item padding="l" background="surface-container">
    <div>Incident alerts</div>
    <lustrous-switch slot="action" checked aria-label="Incident alerts"></lustrous-switch>
  </lustrous-segmented-list-item>
  <lustrous-segmented-list-item padding="l" background="surface-container">
    <div>Weekly digest</div>
    <lustrous-switch slot="action" aria-label="Weekly digest"></lustrous-switch>
  </lustrous-segmented-list-item>
</lustrous-segmented-list>
```
