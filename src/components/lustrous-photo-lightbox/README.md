# `<lustrous-photo-lightbox>`

Full-screen immersive photo preview built on `<lustrous-modal scrim="immersive">` with dark chrome, ambient blurred backdrop, `slot="trigger"`, `slot="actions"`, and localized `close-label` via `getLustrousLabels().close`.

| Attribute | Values | Default |
| :-- | :-- | :-- |
| `src` | Image URL | `""` |
| `ambient-src` | Custom ambient backdrop URL | `src` |
| `heading` | Accessible dialog & image title | `"Image preview"` |
| `rounded` | Applies larger `l` (`14px`) corner radius to the stage | `false` |
| `navigation` | Gallery `{ previousLabel, nextLabel, onPrevious?, onNext? }` controls + arrow shortcuts (property) | `undefined` |
| `close-label` | Close button accessible name | `getLustrousLabels().close` |
| `open` | Opens the modal lightbox | `false` |
