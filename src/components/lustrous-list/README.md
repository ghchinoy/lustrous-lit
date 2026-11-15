# `<lustrous-list>` & `<lustrous-list-item>`

Semantic vertical list (`role="list"` / `role="listitem"` via `ElementInternals`). `<lustrous-list-item>` renders an interactive `<button>`, an `<a>` (`href`), or a non-interactive `<div>` (`static`), with `aria-current="true"` when `selected`.

```html
<lustrous-list label="Environments" gap="xs">
  <lustrous-list-item label="Production" description="us-east4 · 6 replicas" start-icon="cloudDone" selected></lustrous-list-item>
  <lustrous-list-item label="Staging" description="us-central1 · 2 replicas" start-icon="cloud"></lustrous-list-item>
</lustrous-list>
```
