# `<lustrous-sidebar>`

Collapsible application navigation shell (`272px` expanded ↔ `56px` collapsed) and mobile `<lustrous-sidebar-drawer>`.

```html
<lustrous-sidebar label="Workspace navigation">
  <lustrous-sidebar-header label="Studio">
    <lustrous-icon slot="logo" name="layers" size="m"></lustrous-icon>
  </lustrous-sidebar-header>
  <lustrous-sidebar-nav>
    <lustrous-sidebar-item icon="home" label="Overview" active></lustrous-sidebar-item>
    <lustrous-sidebar-scroll-area>
      <lustrous-sidebar-section heading="Recent projects" collapsible>
        <lustrous-sidebar-item icon="folder" label="Q4 Architecture" pinned badge></lustrous-sidebar-item>
      </lustrous-sidebar-section>
    </lustrous-sidebar-scroll-area>
  </lustrous-sidebar-nav>
  <lustrous-sidebar-footer>
    <lustrous-sidebar-item icon="settings" label="Settings"></lustrous-sidebar-item>
  </lustrous-sidebar-footer>
</lustrous-sidebar>
```

## Elements

- `<lustrous-sidebar>` — Root `complementary` shell (`collapsed`, `density="default | compact-panel | mobile"`, `surface-tone="surface | surface-bright"`, `width`, `collapsed-width`, `label`; fires cancelable `lustrous-change` `{ collapsed }`).
- `<lustrous-sidebar-header>` — 56px brand bar (`52px` in `compact-panel`; `label`, `logo-href`, `dismiss-variant="trailing-close | leading-back"`, `collapse-label`, `expand-label`, `slot="logo"`, `slot="actions"`).
- `<lustrous-sidebar-nav>` — Semantic `<nav>` container (`label`).
- `<lustrous-sidebar-scroll-area>` — Scrollable list wrapper (`scrim-size="16"`) that resets smoothly on collapse.
- `<lustrous-sidebar-section>` — Titled or `collapsible` disclosure group (`heading`, `expanded`, `slot="action"`).
- `<lustrous-sidebar-item>` — Navigation row with `badge` (`"unread" | "needs-input" | "in-progress"`, with collapsed corner unread dot), `pill-badge` / `slot="badge"`, inline rename (`editing`, `default-edit-value`, `max-edit-length`, `edit-input-label`, `lustrous-edit-commit`, `lustrous-edit-cancel`), `pinned`, `pending`, `.actions` overflow `<lustrous-menu>`, `.items` flyout `<lustrous-menu>`, and collapsed/truncation `<lustrous-tooltip>`.
- `<lustrous-sidebar-message>` — Empty/error status block with optional polite `announcement`.
- `<lustrous-sidebar-footer>` — Bottom-docked item stack.
- `<lustrous-sidebar-drawer>` — Slide-in modal drawer extending `<lustrous-modal>` for viewports below `960px`.
