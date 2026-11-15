# `<lustrous-icon>`, `renderIcon()`, and `registerLustrousIcons()`

Monochrome vector icons rendered on a 24×24 stroke grid with optically scaled stroke weights (`xs` 16px → `xl` 40px) and automatic RTL mirroring for directional arrows/chevrons.

```ts
import "@ghchinoy/lustrous-lit/components/lustrous-icon";
import { renderIcon, registerLustrousIcons } from "@ghchinoy/lustrous-lit/components/lustrous-icon";
```

## Attributes

| Attribute | Values | Default |
| :-- | :-- | :-- |
| `name` | Core icon name or registered custom icon name | `"bolt"` |
| `size` | `xs` (16) · `s` (20) · `m` (24) · `l` (32) · `xl` (40) | `"s"` |
| `tone` | `default` · `primary` · `tertiary` · `positive` · `warning` · `error` | inherits |
| `muted` | boolean (`--lustrous-text-muted`) | `false` |
| `label` | Accessible name (`role="img"` when set; `aria-hidden="true"` when empty) | `""` |

## Registering Custom Icons

Applications can register domain-specific icons once at startup and reference them anywhere `<lustrous-icon>` or `icon="..."` is accepted:

```ts
import { svg } from "lit";
import { registerLustrousIcons } from "@ghchinoy/lustrous-lit/components/lustrous-icon";

registerLustrousIcons({
  webhook: {
    paths: svg`<circle cx="12" cy="6" r="3" /><circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" />`,
  },
});
```
