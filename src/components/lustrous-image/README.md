# `<lustrous-image>`

Responsive image container extending `<lustrous-box>` with `aspect-ratio`, `object-fit`, `border-radius`, `loading`, and `decorative` support.

| Attribute | Values | Default |
| :-- | :-- | :-- |
| `src` | Image URL | `""` |
| `alt` | Accessible description (ignored when `decorative`) | `""` |
| `aspect-ratio` | `1/1` · `16/9` · `4/3` · `3/2` · `21/9` · `9/16` · `3/4` | |
| `object-fit` | `contain` · `cover` · `fill` · `none` · `scale-down` | |
| `border-radius` | `none` · `xs` · `s` · `m` · `l` · `xl` · `2xl` · `full` | |
| `loading` | `lazy` · `eager` | |
| `decorative` | Sets `alt=""` and `aria-hidden="true"` | `false` |
