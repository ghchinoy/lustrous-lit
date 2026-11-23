# `<lustrous-banner>`

Informational, promotional, or semantic status banner rendered as a named `<section>` region (`heading` or `getLustrousLabels().notificationBanner`).

- **Variants:** `overlay` (default, elevated `surface-bright`) · `inline` (`surface-dim`) · `info` · `positive` · `warning` · `error`
- **Media:** `icon` or `image-url` (`image-size`, `image-alt`, `image-border-radius`) placed `separate` or `inline-title`
- **Actions & Dismissal:** `primary-action` / `secondary-action` (`lustrous-action`), `clickable` (`<button part="surface">` firing `lustrous-click`), and `dismissible` (`lustrous-close-request` with `{ reason: "dismiss" }`)
