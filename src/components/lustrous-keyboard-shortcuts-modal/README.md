# `<lustrous-keyboard-shortcuts-modal>`

Modal keyboard shortcut reference dialog built on `<lustrous-dialog modal>` and `<lustrous-kbd size="m">`. Renders grouped `<section>`, `<dl>`, `<dt>`, and `<dd>` tables from `.sections`, automatically omitting empty sections.

```ts
html`
  <lustrous-keyboard-shortcuts-modal
    heading="Keyboard shortcuts"
    .open=${this.shortcutsOpen}
    .sections=${[
      {
        title: "Navigation",
        rows: [
          { description: "Command palette", keys: "Mod+K" },
          { description: "Toggle sidebar", keys: "Mod+B" },
        ],
      },
    ]}
    @lustrous-toggle=${(e) => (this.shortcutsOpen = e.detail.open)}
  ></lustrous-keyboard-shortcuts-modal>
`;
```

## Attributes & Properties

| Name | Type | Default | Description |
| :-- | :-- | :-- | :-- |
| `open` | `boolean` | `false` | Controls modal open state. |
| `heading` | `string` | `"Keyboard shortcuts"` | Modal title. |
| `size` | `"s" \| "m" \| "l"` | `"m"` | Dialog width preset. |
| `dismissible` | `boolean` | `false` | Adds a header close icon button in addition to the footer close action. |
| `close-label` | `string` | `getLustrousLabels().close` | Accessible label for the close controls. |
| `sections` | `readonly LustrousKeyboardShortcutSection[]` | `[]` | Grouped shortcut definitions (property only). |
