# `<lustrous-snackbar>`

Top-layer toast notification stack built on `popover="manual"`. Supports `default`, `positive`, `warning`, and `error` variants, optional action buttons, dismiss buttons, timer pause on pointer hover or keyboard focus, and localized defaults via `getLustrousLabels()`.

```ts
import { showSnack, dismissSnack } from "@ghchinoy/lustrous-lit/components/lustrous-snackbar";

const id = showSnack("Deployment completed", {
  variant: "positive",
  action: { label: "View logs", onClick: () => openLogs() },
});

dismissSnack(id);
```

| Attribute | Values | Default |
| :-- | :-- | :-- |
| `position` | `bottom-start` · `bottom-end` · `top-start` · `top-end` | `"bottom-start"` |
| `max` | Maximum stacked notifications (set `max="1"` for single-toast replacement) | `3` |
| `label` | Accessible region label | `getLustrousLabels().notifications` |
| `close-label` | Accessible close button label | `getLustrousLabels().close` |

> **Operational note:** `<lustrous-snackbar>` defaults to `max="3"` so stacked toasts remain visible simultaneously. For single-notification replacement behavior (where each new toast immediately replaces the active one), set `max="1"` on `<lustrous-snackbar max="1">`.
