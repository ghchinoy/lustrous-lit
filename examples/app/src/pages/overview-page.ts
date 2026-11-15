import { css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import "@ghchinoy/lustrous-lit/components/lustrous-badge";
import "@ghchinoy/lustrous-lit/components/lustrous-banner";
import type { LustrousBannerActionEvent } from "@ghchinoy/lustrous-lit/components/lustrous-banner";
import "@ghchinoy/lustrous-lit/components/lustrous-box";
import "@ghchinoy/lustrous-lit/components/lustrous-button";
import "@ghchinoy/lustrous-lit/components/lustrous-code-block";
import "@ghchinoy/lustrous-lit/components/lustrous-collapsible-card";
import "@ghchinoy/lustrous-lit/components/lustrous-flex";
import "@ghchinoy/lustrous-lit/components/lustrous-grid";
import "@ghchinoy/lustrous-lit/components/lustrous-progress-bar";
import "@ghchinoy/lustrous-lit/components/lustrous-skeleton";
import { showSnack } from "@ghchinoy/lustrous-lit/components/lustrous-snackbar";
import "@ghchinoy/lustrous-lit/components/lustrous-split-button";
import type {
  LustrousSplitButtonAction,
  LustrousSplitButtonActionEvent,
} from "@ghchinoy/lustrous-lit/components/lustrous-split-button";
import "@ghchinoy/lustrous-lit/components/lustrous-text";
import "@ghchinoy/lustrous-lit/components/lustrous-timeline";
import "@ghchinoy/lustrous-lit/components/lustrous-togglable-button";
import { LustrousElement, lustrousBase, type LustrousChangeEvent } from "@ghchinoy/lustrous-lit/theme";
import "../components/app-kpi-card.js";

const ROLLOUT_ACTIONS: readonly LustrousSplitButtonAction[] = [
  { id: "promote", label: "Promote Release" },
  { id: "canary", label: "Shift 25% Canary Traffic" },
  { id: "verify", label: "Run Synthetic Verification" },
];

const MANIFEST_YAML = `apiVersion: meridian.studio/v1alpha2
kind: ProgressiveRollout
metadata:
  name: edge-gateway-2026-11
  namespace: production
spec:
  strategy:
    canary:
      steps:
        - setWeight: 25
        - pause: { duration: 10m }
        - setWeight: 65
        - verifySLO:
            availabilityMin: 99.95
            latencyP95MaxMs: 25`;

/**
 * `<meridian-overview-page>` — Control plane overview demonstrating `<lustrous-banner>`,
 * `<lustrous-split-button>`, responsive `<lustrous-grid mobile-columns="1">` KPI cards,
 * toggleable `aria-busy` `<lustrous-skeleton>` loading state, `<lustrous-progress-bar>`,
 * `<lustrous-timeline>`, `<lustrous-collapsible-card>` with `slot="actions"`, and `<lustrous-code-block>`.
 */
@customElement("meridian-overview-page")
export class MeridianOverviewPage extends LustrousElement {
  static override styles = [
    lustrousBase,
    css`
      :host {
        display: block;
        min-width: 0;
      }
      .kpi-region {
        display: block;
      }
      .tabular {
        font-family: var(--lustrous-font-code);
        font-variant-numeric: tabular-nums;
      }
    `,
  ];

  @state() private loadingPreview = false;
  @state() private canaryProgress = 65;

  private handleBannerAction(e: LustrousBannerActionEvent): void {
    if (e.detail.action === "primary") {
      this.dispatchEvent(
        new CustomEvent("meridian-navigate", {
          detail: { route: "services" },
          bubbles: true,
          composed: true,
        }),
      );
    } else {
      showSnack("Release train 2026.11 passed all 14 regional preflight checks.", {
        variant: "default",
      });
    }
  }

  private handleRolloutAction(e: LustrousSplitButtonActionEvent): void {
    const { action } = e.detail;
    if (action.id === "promote") {
      this.canaryProgress = 100;
      showSnack("Release 2026.11 promoted to 100% of production traffic.", {
        variant: "positive",
      });
    } else if (action.id === "canary") {
      this.canaryProgress = Math.min(100, this.canaryProgress + 15);
      showSnack(`Canary traffic shifted to ${this.canaryProgress}% across active regions.`, {
        variant: "default",
      });
    } else {
      showSnack("Synthetic SLO probes queued across 14 edge regions.", {
        variant: "positive",
      });
    }
  }

  private handleToggleLoading(e: LustrousChangeEvent): void {
    this.loadingPreview = Boolean(e.detail.selected);
  }

  private renderKpiSkeletons() {
    return html`
      <lustrous-grid columns="4" mobile-columns="1" gap="l">
        ${[0, 1, 2, 3].map(
          () => html`
            <lustrous-box background="surface-bright" border border-radius="xl" padding="xl" shadow="1">
              <lustrous-flex direction="column" gap="m">
                <lustrous-flex align="center" justify="space-between" gap="s">
                  <lustrous-skeleton shape="text" width="56%" height="14"></lustrous-skeleton>
                  <lustrous-skeleton shape="rect" width="32" height="32" border-radius="m"></lustrous-skeleton>
                </lustrous-flex>
                <lustrous-skeleton shape="rect" width="48%" height="36" border-radius="s"></lustrous-skeleton>
                <lustrous-skeleton shape="text" width="82%" height="12"></lustrous-skeleton>
              </lustrous-flex>
            </lustrous-box>
          `,
        )}
      </lustrous-grid>
    `;
  }

  private renderKpiCards() {
    return html`
      <lustrous-grid columns="4" mobile-columns="1" gap="l">
        <app-kpi-card
          label="Global Availability"
          value="99.98%"
          delta="+0.03%"
          trend="up"
          tone="positive"
          icon="verifiedUser"
          caption="30-day rolling SLO across 14 edge regions"
        ></app-kpi-card>
        <app-kpi-card
          label="P95 Edge Latency"
          value="18.4 ms"
          delta="-2.1 ms"
          trend="down"
          tone="positive"
          icon="bolt"
          caption="TLS 1.3 termination & mesh routing"
        ></app-kpi-card>
        <app-kpi-card
          label="Request Throughput"
          value="42.8k/s"
          delta="+6.4%"
          trend="up"
          tone="neutral"
          icon="activity"
          caption="Peak sustained ingress across clusters"
        ></app-kpi-card>
        <app-kpi-card
          label="Error Budget Remaining"
          value="94.2%"
          delta="1 warning"
          trend="flat"
          tone="warning"
          icon="shield"
          caption="eu-west1 telemetry ingest elevated latency"
        ></app-kpi-card>
      </lustrous-grid>
    `;
  }

  protected override render() {
    return html`
      <lustrous-box padding="2xl" mobile-padding="l" max-width="1280" margin-inline="auto">
        <lustrous-flex direction="column" gap="2xl">
          <lustrous-banner
            variant="info"
            icon="rocketLaunch"
            heading="Release train 2026.11 is ready for progressive promotion"
            badge="Canary Active"
            description="Artifact signatures verified and staging accessibility audits completed with zero violations. Inspect regional service health before promoting."
            primary-action="Inspect Services"
            secondary-action="Preflight Summary"
            dismissible
            @lustrous-action=${this.handleBannerAction}
          ></lustrous-banner>

          <lustrous-flex
            align="center"
            mobile-align="stretch"
            justify="space-between"
            mobile-direction="column"
            gap="l"
          >
            <lustrous-flex direction="column" gap="xs">
              <lustrous-text heading="1" variant="headline-large">Control Plane Overview</lustrous-text>
              <lustrous-text variant="body-medium" muted>
                Real-time progressive delivery telemetry, regional quotas, and rollout history.
              </lustrous-text>
            </lustrous-flex>

            <lustrous-flex align="center" wrap="wrap" gap="s">
              <lustrous-togglable-button
                variant="outline"
                size="m"
                icon="hourglassEmpty"
                .selected=${this.loadingPreview}
                @lustrous-change=${this.handleToggleLoading}
              >
                Skeleton Preview
              </lustrous-togglable-button>

              <lustrous-split-button
                variant="accent"
                size="m"
                .actions=${ROLLOUT_ACTIONS}
                @lustrous-action=${this.handleRolloutAction}
              ></lustrous-split-button>
            </lustrous-flex>
          </lustrous-flex>

          <div class="kpi-region" aria-busy=${this.loadingPreview ? "true" : "false"}>
            ${this.loadingPreview ? this.renderKpiSkeletons() : this.renderKpiCards()}
          </div>

          <lustrous-grid columns="2" mobile-columns="1" gap="l" align="start">
            <lustrous-box background="surface-bright" border border-radius="xl" padding="xl" shadow="1">
              <lustrous-flex direction="column" gap="l">
                <lustrous-flex align="center" justify="space-between" gap="s">
                  <lustrous-text heading="2" variant="headline-small">Rollout & Quota Posture</lustrous-text>
                  <lustrous-badge tone="cobalt" icon="sync">Train 2026.11</lustrous-badge>
                </lustrous-flex>

                <lustrous-flex direction="column" gap="s">
                  <lustrous-flex align="center" justify="space-between">
                    <lustrous-text variant="body-small-emphasized">Progressive Canary Weight</lustrous-text>
                    <lustrous-text variant="caption" muted class="tabular">${this.canaryProgress}%</lustrous-text>
                  </lustrous-flex>
                  <lustrous-progress-bar
                    .value=${this.canaryProgress}
                    tone="positive"
                    label="Progressive canary traffic weight"
                  ></lustrous-progress-bar>
                </lustrous-flex>

                <lustrous-flex direction="column" gap="s">
                  <lustrous-flex align="center" justify="space-between">
                    <lustrous-text variant="body-small-emphasized">US-East Compute Allocation</lustrous-text>
                    <lustrous-text variant="caption" muted class="tabular">74%</lustrous-text>
                  </lustrous-flex>
                  <lustrous-progress-bar
                    .value=${74}
                    tone="accent"
                    label="US-East compute allocation"
                  ></lustrous-progress-bar>
                </lustrous-flex>

                <lustrous-flex direction="column" gap="s">
                  <lustrous-flex align="center" justify="space-between">
                    <lustrous-text variant="body-small-emphasized">EU-West Telemetry Ingest Buffer</lustrous-text>
                    <lustrous-text variant="caption" muted class="tabular">86%</lustrous-text>
                  </lustrous-flex>
                  <lustrous-progress-bar
                    .value=${86}
                    tone="warning"
                    label="EU-West telemetry ingest buffer"
                  ></lustrous-progress-bar>
                </lustrous-flex>
              </lustrous-flex>
            </lustrous-box>

            <lustrous-box background="surface-bright" border border-radius="xl" padding="xl" shadow="1">
              <lustrous-flex direction="column" gap="l">
                <lustrous-text heading="2" variant="headline-small">Deployment Milestones</lustrous-text>
                <lustrous-timeline label="Deployment milestones">
                  <lustrous-timeline-item
                    status="past"
                    marker-label="Completed"
                    heading="Artifact attestation & provenance check"
                    heading-variant="body-medium-emphasized"
                    time-label="09:12 UTC · build-9410"
                  >
                    <lustrous-text variant="body-small" muted>
                      SLSA Level 3 provenance signature verified for 6 container images.
                    </lustrous-text>
                  </lustrous-timeline-item>
                  <lustrous-timeline-item
                    status="past"
                    marker-label="Completed"
                    heading="Synthetic staging & WCAG 2.1 AA gate"
                    heading-variant="body-medium-emphasized"
                    time-label="09:26 UTC · staging-global"
                  >
                    <lustrous-text variant="body-small" muted>
                      Zero regressions across light, dark, and high-contrast browser suites.
                    </lustrous-text>
                  </lustrous-timeline-item>
                  <lustrous-timeline-item
                    status="active"
                    marker-label="In progress"
                    heading="Canary observation window (${this.canaryProgress}% weight)"
                    heading-variant="body-medium-emphasized"
                    time-label="09:40 UTC · us-east1 & ap-northeast1"
                  >
                    <lustrous-text variant="body-small" muted>
                      Monitoring tail latency and error-budget burn rate before full cutover.
                    </lustrous-text>
                  </lustrous-timeline-item>
                  <lustrous-timeline-item
                    status="future"
                    marker-label="Scheduled"
                    heading="Global traffic promotion"
                    heading-variant="body-medium-emphasized"
                    time-label="10:15 UTC · 14 edge POPs"
                  ></lustrous-timeline-item>
                </lustrous-timeline>
              </lustrous-flex>
            </lustrous-box>
          </lustrous-grid>

          <lustrous-collapsible-card
            heading="Declarative Rollout Manifest"
            heading-level="2"
            subtitle="edge-gateway-2026-11.yaml"
            icon="terminal"
            badge="v1alpha2"
            badge-tone="teal"
            storage-key="meridian.rollout.manifest"
          >
            <lustrous-button
              slot="actions"
              size="xs"
              variant="tonal"
              icon="check"
              @click=${() =>
                showSnack("Manifest schema validated against v1alpha2 CRD.", { variant: "positive" })}
            >
              Validate Schema
            </lustrous-button>
            <lustrous-code-block
              label="edge-gateway-2026-11.yaml"
              .code=${MANIFEST_YAML}
              @lustrous-copy=${() => showSnack("Manifest YAML copied to clipboard.", { variant: "default" })}
            ></lustrous-code-block>
          </lustrous-collapsible-card>
        </lustrous-flex>
      </lustrous-box>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "meridian-overview-page": MeridianOverviewPage;
  }
}
