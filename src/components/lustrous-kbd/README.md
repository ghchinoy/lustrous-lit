# `<lustrous-kbd>`

Semantic `<kbd>` keycap chip or multi-key shortcut chord sequence. Supports declarative chord strings (`keys="Mod+K"`, automatically formatted for macOS vs. Windows/Linux), explicit keycap arrays (`.keys=${["⇧", "⌘", "P"]}`), or slotted single-key labels, in `s` (default) and `m` sizes.

```html
<lustrous-kbd keys="Mod+K"></lustrous-kbd>
<lustrous-kbd size="m">Esc</lustrous-kbd>
```

## Attributes & Properties

| Name | Type | Default | Description |
| :-- | :-- | :-- | :-- |
| `keys` | `string \| readonly string[]` | `undefined` | Declarative chord string or array of keycap labels. |
| `size` | `"s" \| "m"` | `"s"` | Keycap visual scale (`"s"` inline, `"m"` modal). |
