# `<lustrous-tabs>`

Accessible horizontal tab bar (`role="tablist"` / `role="tab"`) with optional slotted `role="tabpanel"` content and RTL-aware `ArrowLeft`, `ArrowRight`, `Home`, and `End` navigation.

```ts
html`<lustrous-tabs
  label="Project sections"
  value="overview"
  .tabs=${[
    { value: "overview", label: "Overview" },
    { value: "deployments", label: "Deployments" },
    { value: "audit", label: "Audit log", disabled: true },
  ]}
>
  <section slot="overview">Overview panel</section>
  <section slot="deployments">Deployments panel</section>
</lustrous-tabs>`;
```

| Property / Attribute | Values | Default |
| :-- | :-- | :-- |
| `.tabs` | `LustrousTabItem[]` (`{ label, value?, disabled?, icon? }`) | `[]` |
| `value` | Active tab value | First enabled tab |
| `label` | Accessible `tablist` name | `""` |
| `variant` | `pill` · `underline` | `"pill"` |
