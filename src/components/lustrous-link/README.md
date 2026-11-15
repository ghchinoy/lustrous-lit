# `<lustrous-link>`

Inline hyperlink (`<a>` when `href` is provided) or link-styled action (`<button type="button">` when `href` is omitted), inheriting surrounding typography and using `lustrousFocusRing`.

## Usage

```html
<p>
  Review the <lustrous-link href="/docs/tokens">token reference</lustrous-link> or open the
  <lustrous-link href="https://example.com/status" target="_blank" external>status dashboard</lustrous-link>.
</p>

<lustrous-link variant="muted" underline="hover">Reset filters</lustrous-link>
```

## Properties & Attributes

| Property | Attribute | Type | Default | Description |
| :-- | :-- | :-- | :-- | :-- |
| `href` | `href` | `string` | `undefined` | Destination URL; renders `<button>` when omitted. |
| `target` | `target` | `string` | `undefined` | Browsing context target (`_blank` defaults `rel` to `"noopener noreferrer"`). |
| `rel` | `rel` | `string` | `undefined` | Link relationship token list. |
| `download` | `download` | `string` | `undefined` | Prompts downloading the linked resource. |
| `variant` | `variant` | `"primary" \| "default" \| "muted"` | `"primary"` | Foreground color treatment. |
| `underline` | `underline` | `"always" \| "hover" \| "none"` | `"always"` | Underline display mode. |
| `external` | `external` | `boolean` | `false` | Renders a trailing outward-arrow icon. |
| `disabled` | `disabled` | `boolean` | `false` | Disables navigation and interaction. |
