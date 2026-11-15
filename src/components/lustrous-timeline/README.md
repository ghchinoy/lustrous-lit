# `<lustrous-timeline>` & `<lustrous-timeline-item>`

Vertical sequence (`role="list"` / `role="listitem"`) for project roadmaps, CI/CD deployment pipelines, and audit logs. Supports status dots (`default`, `past`, `active`, `future`), accessible `marker-label` descriptions, icons, custom `slot="marker"` elements, and `forced-colors` dot/connector contrast.

```html
<lustrous-timeline label="Release pipeline">
  <lustrous-timeline-item status="past" marker-label="Completed" heading="Artifact signed" time-label="14:02 UTC">
    <lustrous-text muted>Container image verified and attested.</lustrous-text>
  </lustrous-timeline-item>
  <lustrous-timeline-item status="active" marker-label="In progress" heading="Canary rollout" time-label="14:08 UTC"></lustrous-timeline-item>
  <lustrous-timeline-item status="future" marker-label="Queued" heading="Global promotion" time-label="Pending"></lustrous-timeline-item>
</lustrous-timeline>
```
