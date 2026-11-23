# `<lustrous-video-lightbox>`

Full-screen immersive video player built on `<lustrous-modal scrim="immersive">` with dark chrome, ambient `poster` backdrop, WebVTT `captions-src` support, and automatic `pause()` when closed.

| Attribute | Values | Default |
| :-- | :-- | :-- |
| `src` | Video URL | `""` |
| `poster` | Poster frame & ambient backdrop URL | |
| `captions-src` | WebVTT captions track URL | |
| `heading` | Accessible dialog & video title | `"Video preview"` |
| `autoplay` | Boolean (`autoplay="false"` to disable) | `true` |
| `rounded` | Applies larger `l` (`14px`) corner radius to the stage | `false` |
| `navigation` | Gallery `{ previousLabel, nextLabel, onPrevious?, onNext? }` controls + arrow shortcuts (property) | `undefined` |
| `close-label` | Close button accessible name | `getLustrousLabels().close` |
| `open` | Opens the modal lightbox | `false` |
