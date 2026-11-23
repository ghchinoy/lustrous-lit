# `<lustrous-menu>`

Top-layer data-driven dropdown, context, and overflow menu with nested submenus, mobile (`<= 768px`) in-place submenu drill-down, WAI-ARIA keyboard navigation, RTL submenu mirroring, `max-height` (`number | "available"`), `width` (`number | "max-content"`), custom `.anchor`, `.returnFocus`, `open-on-hover`, and item/truncation tooltips via `<lustrous-tooltip>`.

```ts
html`
  <lustrous-menu
    label="Document actions"
    .items=${[
      { type: "header", label: "Edit" },
      { type: "action", label: "Duplicate", icon: "copy", shortcut: "⌘D" },
      { type: "divider" },
      { type: "action", label: "Delete", icon: "delete", destructive: true },
    ]}
  >
    <lustrous-button slot="trigger" variant="tonal" trailing-icon="chevronDown">Actions</lustrous-button>
  </lustrous-menu>
`;
```

## Attributes & Properties

| Name | Type | Default | Description |
| :-- | :-- | :-- | :-- |
| `items` | `LustrousMenuItem[]` | `[]` | Menu item definitions (`action` [with `closeOnClick`], `link`, `selection`, `toggle`, `submenu` [with `defaultOpen`], `header`, `section`, `divider`; items accept `background` and `trailingContent`). |
| `open` | `boolean` | `false` | Opens or closes the root menu. |
| `side` | `FloatingSide` | `"bottom"` | Placement edge relative to `.anchor` or the trigger. |
| `align` | `FloatingAlign` | `"start"` | Cross-axis alignment. |
| `max-height` | `number \| "available"` | `320` | Maximum height in pixels or `"available"` viewport height. |
| `width` | `number \| "max-content"` | `240` | Root menu width in pixels or `"max-content"`. |
| `anchor` | `Element \| null` | `undefined` | Custom positioning anchor element (property only). |
| `returnFocus` | `HTMLElement \| null` | `undefined` | Explicit element focused when closing via item selection (property only). |
| `open-on-hover` | `boolean` | `false` | Opens when the pointer rests on the trigger (first pointer click absorbed while preserving hover-leave dismiss; second click or keyboard closes). |

## Events

- `lustrous-select` — `CustomEvent<{ item: LustrousMenuItem; id?: string; value?: boolean }>`.
- `lustrous-toggle` — `CustomEvent<{ open: boolean }>`.
