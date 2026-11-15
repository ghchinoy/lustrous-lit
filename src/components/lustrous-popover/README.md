# `<lustrous-popover>`

Unified top-layer anchored interactive popover and hover card. Combines directional SVG arrows (`arrow`, default `true`), flat-cornered anchored panels (`arrow="false"`), click or hover triggers (`open-on-hover`), modal focus-trapping with sibling `inert` locking (`close-label`), built-in `primary-action` / `secondary-action` buttons, and automatic `<lustrous-bottom-sheet>` fallback on mobile viewports (`mobile-drawer`).

```html
<!-- Interactive click-activated popover -->
<lustrous-popover heading="Filter results" size="m" primary-action="Apply" secondary-action="Reset">
  <lustrous-button variant="tonal" icon="sliders">Filters</lustrous-button>
  <div slot="content">…filter controls…</div>
</lustrous-popover>

<!-- Hover card -->
<lustrous-popover heading="Retention policy" content="Snapshots older than 90 days are archived automatically." open-on-hover>
  <lustrous-icon-button icon="info" size="s" aria-label="Retention policy"></lustrous-icon-button>
</lustrous-popover>
```

## Attributes & Properties

| Name | Type | Default | Description |
| :-- | :-- | :-- | :-- |
| `open` | `boolean` | `false` | Opens or closes the popover. |
| `arrow` | `boolean` | `true` | Renders the directional SVG arrow (`arrow="false"` for a flat-cornered panel). |
| `heading` | `string` | `""` | Bold heading (`body-large-emphasized`); also names the dialog when `label` is unset. |
| `content` | `string` | `""` | Supporting prose copy (`body-medium`). |
| `side` | `"top" \| "bottom" \| "left" \| "right" \| "inline-start" \| "inline-end"` | `"bottom"` | Preferred placement edge relative to the trigger. |
| `align` | `"start" \| "center" \| "end"` | `"center"` | Cross-axis alignment along the anchor. |
| `size` | `"s" \| "m" \| "l"` | `undefined` | Width preset (`256px` / `320px` / `400px`). |
| `padding` | `LustrousPaddingValue` | `"l"` | Inner padding token for the scroll container. |
| `max-height` | `string` | `calc(100vh - 32px)` | Maximum panel height. |
| `primary-action` | `string` | `""` | Accent action button label. |
| `secondary-action` | `string` | `""` | Secondary action button label. |
| `open-on-hover` | `boolean` | `false` | Also opens on pointer hover after `delay` ms without stealing focus. |
| `close-label` | `string` | `""` | Adds a close icon button and enables modal focus trapping + sibling `inert` lock on click-opened popovers. |
| `mobile-drawer` | `boolean` | `false` | Renders as `<lustrous-bottom-sheet>` at `<= 768px`. |

## Events

- `lustrous-toggle` — `CustomEvent<{ open: boolean }>`.
- `lustrous-action` — Cancelable `CustomEvent<{ action: "primary" | "secondary" }>`.
