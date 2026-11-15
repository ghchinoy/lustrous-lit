# `<lustrous-box>`

Foundational layout and surface primitive. Styles the host directly via static `:host([attr="value"])` rules with zero wrapper DOM.

- **Spacing:** `padding`, `margin` (+ `-block`, `-inline`, `-top`, `-bottom`, `-start`, `-end`): `xs` (4) · `s` (8) · `m` (12) · `l` (16) · `xl` (20) · `2xl` (24) · `3xl` (32) · `4xl` (48) · `none` · `0` (margins also `auto` and `-xs…-4xl`).
- **Surface:** `background` = `surface` · `surface-dim` · `surface-bright` · `surface-container[-low|-high|-highest]` · `surface-accent` · `surface-inverted` · `primary-container` · `tertiary-container` · `accent-container` · `positive-container` · `warning-container` · `error-container` · `code` · `none`.
- **Borders, Radius & Elevation:** `border` (+ per-side), `border-radius` (`none` · `xs` · `s` · `m` · `l` · `xl` · `2xl` · `full`), `shadow` (`""`/`"1"` or `"2"`).
- **Responsive (≤768px):** `mobile-padding`, `mobile-padding-block`, `mobile-padding-inline`, `mobile-display`, `mobile-width`, `hidden-on`, `shown-on`.
