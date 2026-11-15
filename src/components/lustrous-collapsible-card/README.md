# `<lustrous-collapsible-card>`

Surface disclosure card with an accessible heading (`heading-level` `2`–`6`), optional leading `icon`, `badge` (`badge-tone`), `subtitle`, sibling `slot="actions"`, animated chevron, and optional `localStorage` persistence via `storage-key`.

```html
<lustrous-collapsible-card
  heading="Cluster networking"
  icon="networkNode"
  badge="Healthy"
  badge-tone="positive"
  storage-key="cluster-networking"
>
  <lustrous-button slot="actions" size="xs" variant="tonal" icon="sliders">Configure</lustrous-button>
  <lustrous-text block>Private VPC peering and ingress rules.</lustrous-text>
</lustrous-collapsible-card>
```

## Attributes & Properties

| Name | Type | Default | Description |
| :-- | :-- | :-- | :-- |
| `heading` | `string` | `""` | Header title text (or pass rich markup in `slot="heading"`). |
| `heading-level` | `2 \| 3 \| 4 \| 5 \| 6` | `3` | ARIA heading level on the header wrapper. |
| `icon` | `LustrousIconName` | `undefined` | Optional leading icon in the disclosure toggle. |
| `badge` | `string` | `""` | Optional pill badge text beside the heading. |
| `badge-tone` | `LustrousBadgeTone` | `"accent"` | Tone passed to `<lustrous-badge>`. |
| `subtitle` | `string` | `""` | Optional secondary caption in the header. |
| `open` | `boolean` | `true` | Reflected open/collapsed state. |
| `storage-key` | `string` | `""` | Persists `open` in `localStorage` under `lustrous.card.open.<storage-key>`. |

## Events

- `lustrous-toggle` — `CustomEvent<{ open: boolean }>` dispatched after toggling.
