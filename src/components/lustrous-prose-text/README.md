# `<lustrous-prose-text>` & `<lustrous-prose-direction-scope>`

Multilingual bidirectional prose typography built on `<lustrous-text>`. Estimates base direction from strong RTL vs. LTR prose word ratios (ignoring URLs, email addresses, file paths, and BiDi control characters), isolates embedded technical LTR tokens (`C++`, `foo()`, `<Outlet />`, `/usr/local/bin`, `$HOME`, `64-bit`) inside `<bdi dir="ltr">` when rendering RTL prose, and aggregates word counts bottom-up across `<lustrous-prose-direction-scope>` containers.

```html
<lustrous-prose-direction-scope align-start>
  <ul>
    <li>
      <lustrous-prose-text block>
        מדריך תצורה עבור PostgreSQL עם C++ וקריאה לפונקציה connect(host, port) בנתיב /etc/postgresql.
      </lustrous-prose-text>
    </li>
    <li>
      <lustrous-prose-text block>PostgreSQL 17.2 Release Notes</lustrous-prose-text>
    </li>
  </ul>
</lustrous-prose-direction-scope>
```

## `<lustrous-prose-text>` Attributes & Properties

Inherits all `<lustrous-text>` attributes (`variant`, `tone`, `muted`, `wrap`, `max-lines`, `heading`, `block`, `padding`, `margin`, …) plus:

| Name | Type | Default | Description |
| :-- | :-- | :-- | :-- |
| `language` | `string` | `undefined` | Optional BCP-47 language tag (e.g. `"he"`, `"ar-EG"`, `"ja"`) used to disambiguate neutral or matching-script text. |
| `fallback-dir` | `"ltr" \| "rtl"` | `undefined` | Fallback direction when prose contains zero strong words; defaults to enclosing `<lustrous-prose-direction-scope>` and then `<html dir>`. |
| `inline-isolate` | `boolean` | `wrap === "truncate" \|\| wrap === "nowrap"` | Wraps content in `<bdi part="bdi">` instead of stamping `dir` on the host so surrounding UI layout and truncation ellipses stay anchored. |

## `<lustrous-prose-direction-scope>` Attributes & Properties

| Name | Type | Default | Description |
| :-- | :-- | :-- | :-- |
| `align-start` | `boolean` | `false` | Keeps opposite-direction items aligned to the container's reading-start edge in lists, tables, and timelines. |
| `align-with-parent` | `boolean` | `false` | Aligns a nested composite paragraph scope with an enclosing `align-start` container when their resolved directions differ. |
| `fallback-dir` | `"ltr" \| "rtl"` | `undefined` | Fallback direction before strong descendant prose words are reported. |
