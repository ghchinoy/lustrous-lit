import { css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import "@ghchinoy/lustrous-lit/components/lustrous-badge";
import "@ghchinoy/lustrous-lit/components/lustrous-bottom-sheet";
import "@ghchinoy/lustrous-lit/components/lustrous-box";
import "@ghchinoy/lustrous-lit/components/lustrous-button";
import "@ghchinoy/lustrous-lit/components/lustrous-code-block";
import "@ghchinoy/lustrous-lit/components/lustrous-dialog";
import "@ghchinoy/lustrous-lit/components/lustrous-flex";
import "@ghchinoy/lustrous-lit/components/lustrous-icon-button";
import "@ghchinoy/lustrous-lit/components/lustrous-image";
import "@ghchinoy/lustrous-lit/components/lustrous-photo-lightbox";
import "@ghchinoy/lustrous-lit/components/lustrous-popover";
import "@ghchinoy/lustrous-lit/components/lustrous-pressable";
import "@ghchinoy/lustrous-lit/components/lustrous-progress-bar";
import "@ghchinoy/lustrous-lit/components/lustrous-search-bar";
import "@ghchinoy/lustrous-lit/components/lustrous-segmented-control";
import type { LustrousSegmentOption } from "@ghchinoy/lustrous-lit/components/lustrous-segmented-control";
import "@ghchinoy/lustrous-lit/components/lustrous-side-panel";
import { showSnack } from "@ghchinoy/lustrous-lit/components/lustrous-snackbar";
import "@ghchinoy/lustrous-lit/components/lustrous-text";
import {
  darkColors,
  LustrousElement,
  lustrousBase,
  LustrousViewportController,
  type LustrousChangeEvent,
} from "@ghchinoy/lustrous-lit/theme";
import "../components/app-service-card.js";
import type { ServiceHealth, ServiceRecord } from "../components/app-service-card.js";

type StatusFilter = "all" | "healthy" | "degraded";
type LayoutMode = "grid" | "list";

const INITIAL_SERVICES: readonly ServiceRecord[] = [
  {
    id: "edge-gateway",
    name: "Edge Ingress Gateway",
    slug: "edge-gateway",
    summary: "Anycast TLS 1.3 termination, adaptive rate limiting, and zero-trust mTLS mesh routing.",
    owner: "Core Networking",
    region: "us-east1",
    version: "v2.14.2",
    status: "healthy",
    latencyP95: "11.2 ms",
    rps: "18.4k/s",
    uptimePercent: 99.99,
    endpoint: "https://edge-gateway.us-east1.meridian.internal/v2",
    icon: "globe",
  },
  {
    id: "telemetry-ingest",
    name: "Telemetry Ingest Pipeline",
    slug: "telemetry-ingest",
    summary: "High-cardinality OpenTelemetry span collector and columnar stream compactor.",
    owner: "Observability",
    region: "eu-west1",
    version: "v1.9.0-rc2",
    status: "degraded",
    latencyP95: "64.8 ms",
    rps: "9.1k/s",
    uptimePercent: 99.42,
    endpoint: "https://telemetry-ingest.eu-west1.meridian.internal/otlp",
    icon: "activity",
  },
  {
    id: "identity-broker",
    name: "Workload Identity Broker",
    slug: "identity-broker",
    summary: "Short-lived SPIFFE X.509 SVID issuance and hardware-backed OIDC token exchange.",
    owner: "Security Platform",
    region: "us-east1",
    version: "v3.4.1",
    status: "healthy",
    latencyP95: "8.6 ms",
    rps: "6.2k/s",
    uptimePercent: 100,
    endpoint: "https://identity-broker.us-east1.meridian.internal/v3",
    icon: "encrypted",
  },
  {
    id: "artifact-registry",
    name: "Artifact Attestation Store",
    slug: "artifact-registry",
    summary: "Content-addressable OCI layer mirror with transparent SBOM verification.",
    owner: "Release Engineering",
    region: "ap-northeast1",
    version: "v2.8.0",
    status: "deploying",
    latencyP95: "22.5 ms",
    rps: "3.7k/s",
    uptimePercent: 99.96,
    endpoint: "https://artifacts.ap-northeast1.meridian.internal/oci",
    icon: "package",
  },
  {
    id: "policy-engine",
    name: "Quota & Policy Evaluator",
    slug: "policy-engine",
    summary: "Distributed admission policy evaluation and regional token-bucket quota enforcement.",
    owner: "Governance",
    region: "eu-west1",
    version: "v1.18.4",
    status: "healthy",
    latencyP95: "4.9 ms",
    rps: "24.0k/s",
    uptimePercent: 99.98,
    endpoint: "https://policy-engine.eu-west1.meridian.internal/v1",
    icon: "scale",
  },
  {
    id: "state-coordinator",
    name: "Consensus State Ledger",
    slug: "state-coordinator",
    summary: "Multi-region Raft configuration store backing service discovery and rollout locks.",
    owner: "Storage Systems",
    region: "ap-northeast1",
    version: "v4.2.1",
    status: "healthy",
    latencyP95: "14.1 ms",
    rps: "5.4k/s",
    uptimePercent: 99.99,
    endpoint: "https://consensus.ap-northeast1.meridian.internal/raft",
    icon: "database",
  },
];

/** Builds a self-contained SVG topology diagram URL using Lustrous palette tokens. */
function createTopologyDiagramUrl(service: ServiceRecord): string {
  const bg = darkColors.background ?? "";
  const panel = darkColors["surface-container"] ?? "";
  const stroke = darkColors["outline-variant"] ?? "";
  const primary = darkColors.primary ?? "";
  const tertiary = darkColors.tertiary ?? "";
  const warning = darkColors.warning ?? "";
  const fg = darkColors["on-surface"] ?? "";
  const muted = darkColors["on-surface-variant"] ?? "";
  const statusColor = service.status === "degraded" ? warning : tertiary;

  const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">
    <rect width="960" height="540" fill="${bg}"/>
    <g stroke="${stroke}" stroke-width="2" stroke-dasharray="6 6" fill="none">
      <line x1="250" y1="270" x2="370" y2="180"/>
      <line x1="250" y1="270" x2="370" y2="360"/>
      <line x1="590" y1="180" x2="710" y2="270"/>
      <line x1="590" y1="360" x2="710" y2="270"/>
    </g>
    <rect x="60" y="215" width="190" height="110" rx="18" fill="${panel}" stroke="${primary}" stroke-width="2"/>
    <text x="84" y="258" fill="${fg}" font-family="system-ui, sans-serif" font-size="18" font-weight="600">Anycast Ingress</text>
    <text x="84" y="286" fill="${muted}" font-family="ui-monospace, monospace" font-size="14">${service.rps} TLS 1.3</text>

    <rect x="370" y="125" width="220" height="110" rx="18" fill="${panel}" stroke="${statusColor}" stroke-width="2"/>
    <text x="394" y="168" fill="${fg}" font-family="system-ui, sans-serif" font-size="17" font-weight="600">${service.slug}-az1</text>
    <text x="394" y="196" fill="${muted}" font-family="ui-monospace, monospace" font-size="14">${service.region} · ${service.version}</text>

    <rect x="370" y="305" width="220" height="110" rx="18" fill="${panel}" stroke="${statusColor}" stroke-width="2"/>
    <text x="394" y="348" fill="${fg}" font-family="system-ui, sans-serif" font-size="17" font-weight="600">${service.slug}-az2</text>
    <text x="394" y="376" fill="${muted}" font-family="ui-monospace, monospace" font-size="14">P95 ${service.latencyP95}</text>

    <rect x="710" y="215" width="190" height="110" rx="18" fill="${panel}" stroke="${stroke}" stroke-width="2"/>
    <text x="734" y="258" fill="${fg}" font-family="system-ui, sans-serif" font-size="18" font-weight="600">State &amp; OTLP</text>
    <text x="734" y="286" fill="${muted}" font-family="ui-monospace, monospace" font-size="14">${service.uptimePercent}% SLO</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
}

/**
 * `<meridian-services-page>` — Interactive service catalog showcasing `<lustrous-search-bar>`,
 * `<lustrous-segmented-control>`, `<lustrous-popover>`, `<lustrous-side-panel>` (`split` vs
 * `takeover` via `LustrousViewportController`), `<lustrous-image>` inside `<lustrous-photo-lightbox>`,
 * `<lustrous-bottom-sheet>`, and modal `<lustrous-dialog>` with `showSnack()` Undo.
 */
@customElement("meridian-services-page")
export class MeridianServicesPage extends LustrousElement {
  static override styles = [
    lustrousBase,
    css`
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
        min-width: 0;
      }
      .workspace {
        display: flex;
        flex: 1 1 auto;
        min-height: 0;
        min-width: 0;
        width: 100%;
      }
      .catalog-pane {
        flex: 1 1 auto;
        min-width: 0;
        min-height: 0;
        overflow-y: auto;
      }
      .catalog-pane[hidden] {
        display: none;
      }
      .inspector-pane {
        flex: 0 0 400px;
        width: 400px;
        max-width: 100%;
        min-height: 0;
      }
      .inspector-pane.takeover {
        flex: 1 1 auto;
        width: 100%;
      }
      .inspector-pane:not([open]) {
        display: none;
      }
      .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: var(--lustrous-space-l);
      }
      .cards-list {
        display: flex;
        flex-direction: column;
        gap: var(--lustrous-space-m);
      }
      .search-box {
        flex: 1 1 260px;
        min-width: 200px;
      }
      .mono {
        font-family: var(--lustrous-font-code);
        font-variant-numeric: tabular-nums;
      }
    `,
  ];

  private readonly viewport = new LustrousViewportController(this);

  @state() private services: readonly ServiceRecord[] = INITIAL_SERVICES;
  @state() private query = "";
  @state() private statusFilter: StatusFilter = "all";
  @state() private layoutMode: LayoutMode = "grid";
  @state() private selectedServiceId: string | null = "edge-gateway";
  @state() private shareServiceId: string | null = null;
  @state() private restartServiceId: string | null = null;

  private get statusOptions(): LustrousSegmentOption[] {
    const healthyCount = this.services.filter((s) => s.status === "healthy").length;
    const degradedCount = this.services.filter((s) => s.status === "degraded").length;
    return [
      { value: "all", label: "All", badge: this.services.length },
      { value: "healthy", label: "Healthy", badge: healthyCount },
      { value: "degraded", label: "Degraded", badge: degradedCount },
    ];
  }

  private readonly layoutOptions: LustrousSegmentOption[] = [
    { value: "grid", label: "Grid", icon: "grid" },
    { value: "list", label: "List", icon: "formatListBulleted" },
  ];

  private get filteredServices(): readonly ServiceRecord[] {
    const q = this.query.trim().toLowerCase();
    return this.services.filter((s) => {
      if (this.statusFilter !== "all" && s.status !== this.statusFilter) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        s.owner.toLowerCase().includes(q) ||
        s.region.toLowerCase().includes(q)
      );
    });
  }

  private get selectedService(): ServiceRecord | undefined {
    return this.services.find((s) => s.id === this.selectedServiceId);
  }

  private get shareService(): ServiceRecord | undefined {
    return this.services.find((s) => s.id === this.shareServiceId);
  }

  private get restartService(): ServiceRecord | undefined {
    return this.services.find((s) => s.id === this.restartServiceId);
  }

  private handleSelectService(e: CustomEvent<{ serviceId: string }>): void {
    this.selectedServiceId = e.detail.serviceId;
  }

  private handleShareService(e: CustomEvent<{ serviceId: string }>): void {
    this.shareServiceId = e.detail.serviceId;
  }

  private handleRequestRestart(e: CustomEvent<{ serviceId: string }>): void {
    this.restartServiceId = e.detail.serviceId;
  }

  private confirmRestart(): void {
    const target = this.restartService;
    if (!target) return;
    const previousSnapshot = this.services;
    const prevStatus: ServiceHealth = target.status;
    this.services = this.services.map((s) =>
      s.id === target.id
        ? {
            ...s,
            status: "deploying",
            latencyP95: prevStatus === "degraded" ? "19.4 ms" : s.latencyP95,
          }
        : s,
    );
    this.restartServiceId = null;

    showSnack(`Rolling restart started for ${target.name}.`, {
      variant: "positive",
      action: {
        label: "Undo",
        onClick: () => {
          this.services = previousSnapshot;
          showSnack(`Reverted rolling restart for ${target.name}.`, { variant: "default" });
        },
      },
    });
  }

  private renderSidePanel(selected: ServiceRecord | undefined, isTakeover: boolean) {
    const diagramUrl = selected ? createTopologyDiagramUrl(selected) : "";
    return html`
      <lustrous-side-panel
        class="inspector-pane ${isTakeover ? "takeover" : ""}"
        presentation=${isTakeover ? "takeover" : "split"}
        shadow="1"
        .open=${Boolean(selected)}
        label=${selected ? `${selected.name} inspector` : "Service inspector"}
        @lustrous-close-request=${(e: CustomEvent) => {
          if (e.target === e.currentTarget) {
            this.selectedServiceId = null;
          }
        }}
      >
        ${selected
          ? html`
              <lustrous-box slot="header" padding="l" border-bottom>
                <lustrous-flex align="center" justify="space-between" gap="s">
                  <lustrous-flex direction="column" gap="xs">
                    <lustrous-text heading="2" variant="headline-small">${selected.name}</lustrous-text>
                    <lustrous-text variant="caption" muted class="mono">
                      ${selected.owner} · ${selected.region}
                    </lustrous-text>
                  </lustrous-flex>
                  <lustrous-icon-button
                    icon="close"
                    size="s"
                    variant="on-surface"
                    aria-label="Close service details"
                    @click=${() => {
                      this.selectedServiceId = null;
                    }}
                  ></lustrous-icon-button>
                </lustrous-flex>
              </lustrous-box>

              <lustrous-box padding="l">
                <lustrous-flex direction="column" gap="l">
                  <lustrous-flex direction="column" gap="xs">
                    <lustrous-text variant="overline" muted>Live Mesh Topology (Click to Expand)</lustrous-text>
                    <lustrous-photo-lightbox
                      .src=${diagramUrl}
                      heading="${selected.name} mesh topology"
                    >
                      <lustrous-pressable
                        slot="trigger"
                        border
                        border-radius="l"
                        overflow="hidden"
                        width="full"
                      >
                        <lustrous-image
                          .src=${diagramUrl}
                          alt="${selected.name} live mesh topology — activate to inspect full screen"
                          aspect-ratio="16/9"
                          object-fit="cover"
                        ></lustrous-image>
                      </lustrous-pressable>
                    </lustrous-photo-lightbox>
                  </lustrous-flex>

                  <lustrous-text variant="body-small" muted>${selected.summary}</lustrous-text>

                  <lustrous-box background="surface-container-low" border border-radius="l" padding="m">
                    <lustrous-flex direction="column" gap="s">
                      <lustrous-flex align="center" justify="space-between">
                        <lustrous-text variant="body-small" muted>Release Revision</lustrous-text>
                        <lustrous-badge tone="cobalt">${selected.version}</lustrous-badge>
                      </lustrous-flex>
                      <lustrous-flex align="center" justify="space-between">
                        <lustrous-text variant="body-small" muted>P95 Tail Latency</lustrous-text>
                        <lustrous-text variant="body-small-emphasized" class="mono">
                          ${selected.latencyP95}
                        </lustrous-text>
                      </lustrous-flex>
                      <lustrous-flex align="center" justify="space-between">
                        <lustrous-text variant="body-small" muted>Sustained Throughput</lustrous-text>
                        <lustrous-text variant="body-small-emphasized" class="mono">
                          ${selected.rps}
                        </lustrous-text>
                      </lustrous-flex>
                      <lustrous-flex direction="column" gap="xs">
                        <lustrous-flex align="center" justify="space-between">
                          <lustrous-text variant="body-small" muted>30-Day Uptime SLO</lustrous-text>
                          <lustrous-text variant="caption" class="mono">${selected.uptimePercent}%</lustrous-text>
                        </lustrous-flex>
                        <lustrous-progress-bar
                          .value=${selected.uptimePercent}
                          tone=${selected.status === "degraded" ? "warning" : "positive"}
                          label="${selected.name} 30-day uptime"
                        ></lustrous-progress-bar>
                      </lustrous-flex>
                    </lustrous-flex>
                  </lustrous-box>
                </lustrous-flex>
              </lustrous-box>

              <lustrous-box slot="footer" padding="l" border-top>
                <lustrous-flex align="center" justify="end" wrap="wrap" gap="s">
                  <lustrous-button
                    variant="outline"
                    size="s"
                    icon="share2"
                    @click=${() => {
                      this.shareServiceId = selected.id;
                    }}
                  >
                    Share Endpoint
                  </lustrous-button>
                  <lustrous-button
                    variant="tonal"
                    size="s"
                    icon="replay"
                    @click=${() => {
                      this.restartServiceId = selected.id;
                    }}
                  >
                    Restart Pods
                  </lustrous-button>
                </lustrous-flex>
              </lustrous-box>
            `
          : nothing}
      </lustrous-side-panel>
    `;
  }

  protected override render() {
    const selected = this.selectedService;
    const isTakeover = this.viewport.isShellMobile;
    const hideCatalogForTakeover = isTakeover && Boolean(selected);
    const filtered = this.filteredServices;
    const shareTarget = this.shareService;
    const restartTarget = this.restartService;

    return html`
      <div
        class="workspace"
        @meridian-service-select=${this.handleSelectService}
        @meridian-service-share=${this.handleShareService}
        @meridian-service-restart=${this.handleRequestRestart}
      >
        <div class="catalog-pane" ?hidden=${hideCatalogForTakeover}>
          <lustrous-box padding="2xl" mobile-padding="l">
            <lustrous-flex direction="column" gap="xl">
              <lustrous-flex
                align="center"
                mobile-align="stretch"
                justify="space-between"
                mobile-direction="column"
                gap="m"
              >
                <lustrous-flex direction="column" gap="xs">
                  <lustrous-text heading="1" variant="headline-large">Service Mesh Catalog</lustrous-text>
                  <lustrous-text variant="body-medium" muted>
                    Select any service to inspect live topology, SLO posture, and rolling pod controls.
                  </lustrous-text>
                </lustrous-flex>

                <lustrous-popover
                  heading="SLO Burn-Rate Policy"
                  size="m"
                  side="bottom"
                  align="end"
                  mobile-drawer
                  close-label="Close SLO policy inspector"
                >
                  <lustrous-button slot="trigger" variant="tonal" size="s" icon="sliders">
                    SLO Policy
                  </lustrous-button>
                  <lustrous-flex slot="content" direction="column" gap="s">
                    <lustrous-text variant="body-small" muted>
                      Automated canary halts trigger whenever 5-minute error burn exceeds 14.4x budget.
                    </lustrous-text>
                    <lustrous-box background="surface-container" border-radius="m" padding="s">
                      <lustrous-flex direction="column" gap="xs">
                        <lustrous-flex justify="space-between">
                          <lustrous-text variant="caption" muted>Availability Target</lustrous-text>
                          <lustrous-text variant="caption" class="mono">99.95%</lustrous-text>
                        </lustrous-flex>
                        <lustrous-flex justify="space-between">
                          <lustrous-text variant="caption" muted>P95 Latency Ceiling</lustrous-text>
                          <lustrous-text variant="caption" class="mono">25.0 ms</lustrous-text>
                        </lustrous-flex>
                        <lustrous-flex justify="space-between">
                          <lustrous-text variant="caption" muted>Auto-Drain Window</lustrous-text>
                          <lustrous-text variant="caption" class="mono">45s</lustrous-text>
                        </lustrous-flex>
                      </lustrous-flex>
                    </lustrous-box>
                  </lustrous-flex>
                </lustrous-popover>
              </lustrous-flex>

              <lustrous-flex align="center" wrap="wrap" gap="m">
                <div class="search-box">
                  <lustrous-search-bar
                    variant="outlined"
                    size="m"
                    placeholder="Filter by service, owner, or region…"
                    aria-label="Filter services"
                    .value=${this.query}
                    @input=${(e: Event) => {
                      this.query = (e.currentTarget as HTMLElement & { value: string }).value;
                    }}
                    @lustrous-clear=${() => {
                      this.query = "";
                    }}
                  ></lustrous-search-bar>
                </div>

                <lustrous-segmented-control
                  label="Filter by health status"
                  size="m"
                  .options=${this.statusOptions}
                  .value=${this.statusFilter}
                  @lustrous-change=${(e: LustrousChangeEvent) => {
                    if (e.detail.value) this.statusFilter = e.detail.value as StatusFilter;
                  }}
                ></lustrous-segmented-control>

                <lustrous-segmented-control
                  label="Catalog layout"
                  size="m"
                  .options=${this.layoutOptions}
                  .value=${this.layoutMode}
                  @lustrous-change=${(e: LustrousChangeEvent) => {
                    if (e.detail.value) this.layoutMode = e.detail.value as LayoutMode;
                  }}
                ></lustrous-segmented-control>
              </lustrous-flex>

              ${filtered.length === 0
                ? html`
                    <lustrous-box background="surface-bright" border border-radius="xl" padding="2xl">
                      <lustrous-flex direction="column" align="center" gap="s">
                        <lustrous-text variant="body-large-emphasized">No matching services</lustrous-text>
                        <lustrous-text variant="body-small" muted>
                          Clear your search query or switch the status filter back to All.
                        </lustrous-text>
                        <lustrous-button
                          variant="outline"
                          size="s"
                          @click=${() => {
                            this.query = "";
                            this.statusFilter = "all";
                          }}
                        >
                          Reset Filters
                        </lustrous-button>
                      </lustrous-flex>
                    </lustrous-box>
                  `
                : html`
                    <div class=${this.layoutMode === "grid" ? "cards-grid" : "cards-list"}>
                      ${filtered.map(
                        (svc) => html`
                          <app-service-card
                            .service=${svc}
                            ?selected=${svc.id === this.selectedServiceId}
                          ></app-service-card>
                        `,
                      )}
                    </div>
                  `}
            </lustrous-flex>
          </lustrous-box>
        </div>

        ${this.renderSidePanel(selected, isTakeover)}
      </div>

      <lustrous-bottom-sheet
        .open=${Boolean(shareTarget)}
        default-snap-point="1"
        label=${shareTarget ? `Share ${shareTarget.name}` : "Share service endpoint"}
        @lustrous-toggle=${(e: CustomEvent<{ open: boolean }>) => {
          if (e.target === e.currentTarget && !e.detail.open) {
            this.shareServiceId = null;
          }
        }}
      >
        ${shareTarget
          ? html`
              <lustrous-flex direction="column" gap="l" padding-top="s">
                <lustrous-flex direction="column" gap="xs">
                  <lustrous-text heading="2" variant="headline-small">
                    Share ${shareTarget.name}
                  </lustrous-text>
                  <lustrous-text variant="body-small" muted>
                    Internal mesh endpoint and curl health check for on-call handoffs.
                  </lustrous-text>
                </lustrous-flex>

                <lustrous-code-block
                  label="Internal Mesh Endpoint"
                  .code=${`curl -H "Authorization: Bearer $SVID_TOKEN" ${shareTarget.endpoint}/healthz`}
                ></lustrous-code-block>

                <lustrous-flex justify="end" gap="s">
                  <lustrous-button
                    variant="on-surface"
                    @click=${() => {
                      this.shareServiceId = null;
                    }}
                  >
                    Done
                  </lustrous-button>
                  <lustrous-button
                    variant="accent"
                    icon="link"
                    @click=${() => {
                      const name = shareTarget.name;
                      this.shareServiceId = null;
                      showSnack(`Copied mesh endpoint for ${name}.`, { variant: "positive" });
                    }}
                  >
                    Copy Deep Link
                  </lustrous-button>
                </lustrous-flex>
              </lustrous-flex>
            `
          : nothing}
      </lustrous-bottom-sheet>

      <lustrous-dialog
        modal
        dismissible
        size="m"
        heading=${restartTarget ? `Restart ${restartTarget.name}?` : "Restart service?"}
        primary-action="Restart Rolling Pods"
        secondary-action="Cancel"
        .open=${Boolean(restartTarget)}
        @lustrous-toggle=${(e: CustomEvent<{ open: boolean }>) => {
          if (e.target === e.currentTarget && !e.detail.open) {
            this.restartServiceId = null;
          }
        }}
        @lustrous-action=${(e: CustomEvent<{ action: "primary" | "secondary" }>) => {
          if (e.detail.action === "primary") {
            this.confirmRestart();
          } else {
            this.restartServiceId = null;
          }
        }}
      >
        ${restartTarget
          ? html`
              <lustrous-flex direction="column" gap="m">
                <lustrous-text variant="body-medium">
                  This drains existing connections across <strong>${restartTarget.region}</strong> with a 45-second
                  grace period and cycles pods on revision <strong>${restartTarget.version}</strong>.
                </lustrous-text>
                <lustrous-box background="warning-container" border-radius="m" padding="m">
                  <lustrous-text variant="body-small">
                    Active canary observers will pause automatic promotion until all replacement pods pass readiness.
                  </lustrous-text>
                </lustrous-box>
              </lustrous-flex>
            `
          : nothing}
      </lustrous-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "meridian-services-page": MeridianServicesPage;
  }
}
