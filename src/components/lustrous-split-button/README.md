# `<lustrous-split-button>`

Primary action button joined to a caret `<lustrous-menu>` trigger. Clicking the face dispatches `lustrous-action` for `actions[0]` immediately; clicking the caret opens a menu anchored to the full split-button group listing every action.

```ts
html`
  <lustrous-split-button
    variant="accent"
    size="m"
    .actions=${[
      { id: "deploy", label: "Deploy now" },
      { id: "staging", label: "Deploy to staging" },
      { id: "schedule", label: "Schedule release" },
    ]}
  ></lustrous-split-button>
`;
```

## Attributes & Properties

| Name | Type | Default | Description |
| :-- | :-- | :-- | :-- |
| `actions` | `readonly LustrousSplitButtonAction[]` | `[]` | Ordered actions (`actions[0]` is the face action). |
| `variant` | `"tonal" \| "accent" \| "outline" \| "bright"` | `"tonal"` | Visual variant applied to both halves. |
| `size` | `"m" \| "s" \| "xs"` | `"m"` | Button height (`44px` / `36px` / `28px`). |
| `shape` | `"rounded" \| "pill"` | `"rounded"` | Outer corner geometry. |
| `caret-aria-label` | `string` | `"More options for {actions[0].label}"` | Accessible label of the caret trigger and menu. |
| `disabled` | `boolean` | `false` | Disables both halves. |

## Events

- `lustrous-action` — `CustomEvent<{ action: LustrousSplitButtonAction; index: number }>`.
