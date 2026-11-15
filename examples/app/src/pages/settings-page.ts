import { css, html, nothing } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import "@ghchinoy/lustrous-lit/components/lustrous-box";
import "@ghchinoy/lustrous-lit/components/lustrous-button";
import "@ghchinoy/lustrous-lit/components/lustrous-checkbox";
import "@ghchinoy/lustrous-lit/components/lustrous-flex";
import "@ghchinoy/lustrous-lit/components/lustrous-grid";
import "@ghchinoy/lustrous-lit/components/lustrous-radio-group";
import "@ghchinoy/lustrous-lit/components/lustrous-segmented-list";
import "@ghchinoy/lustrous-lit/components/lustrous-select";
import type { LustrousSelectOption } from "@ghchinoy/lustrous-lit/components/lustrous-select";
import { showSnack } from "@ghchinoy/lustrous-lit/components/lustrous-snackbar";
import "@ghchinoy/lustrous-lit/components/lustrous-switch";
import "@ghchinoy/lustrous-lit/components/lustrous-text";
import "@ghchinoy/lustrous-lit/components/lustrous-text-area";
import "@ghchinoy/lustrous-lit/components/lustrous-text-input";
import type { LustrousTextInput } from "@ghchinoy/lustrous-lit/components/lustrous-text-input";
import { LustrousElement, lustrousBase } from "@ghchinoy/lustrous-lit/theme";

const REGION_OPTIONS: readonly LustrousSelectOption[] = [
  {
    value: "us-east1",
    label: "US East (Virginia)",
    description: "Primary control plane · 3 availability zones",
    icon: "globe",
    group: "Americas",
  },
  {
    value: "us-west2",
    label: "US West (Oregon)",
    description: "Low-carbon hydro cluster · 3 availability zones",
    icon: "globe",
    group: "Americas",
  },
  {
    value: "eu-west1",
    label: "EU West (Belgium)",
    description: "GDPR sovereign residency · 3 availability zones",
    icon: "shield",
    group: "Europe",
  },
  {
    value: "ap-northeast1",
    label: "Asia Pacific (Tokyo)",
    description: "Edge PoP hub · 3 availability zones",
    icon: "bolt",
    group: "Asia Pacific",
  },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * `<meridian-settings-page>` — Native `<form>` integration showcasing `ElementInternals`
 * form association (`new FormData(form)`, `required` + email validation, `form.reset()`,
 * and polite `role="status"` announcements).
 */
@customElement("meridian-settings-page")
export class MeridianSettingsPage extends LustrousElement {
  static override styles = [
    lustrousBase,
    css`
      :host {
        display: block;
        min-width: 0;
      }
      form {
        margin: 0;
      }
      .status-row {
        min-height: 24px;
      }
    `,
  ];

  @query("form") private formEl!: HTMLFormElement;
  @query("#alert-email") private emailInput!: LustrousTextInput;

  @state() private emailError: string | null = null;
  @state() private statusAnnouncement = "";

  private validateEmailField(): boolean {
    const raw = this.emailInput?.value.trim() ?? "";
    if (!raw) {
      this.emailError = "On-call alert email is required.";
      return false;
    }
    if (!EMAIL_PATTERN.test(raw)) {
      this.emailError = "Enter a valid email address (for example, oncall@meridian.example).";
      return false;
    }
    this.emailError = null;
    return true;
  }

  private handleEmailInput(): void {
    if (this.emailError !== null) {
      this.validateEmailField();
    }
  }

  private handleSubmit(e: SubmitEvent): void {
    e.preventDefault();
    const emailOk = this.validateEmailField();
    const formOk = this.formEl.reportValidity();
    if (!emailOk || !formOk) {
      if (!emailOk) this.emailInput?.focus();
      this.statusAnnouncement = "Please fix the highlighted validation errors before saving.";
      return;
    }

    const data = new FormData(this.formEl);
    const workspace = String(data.get("workspace") ?? "");
    const region = String(data.get("region") ?? "");
    const channel = String(data.get("channel") ?? "");
    const autoRollback = data.get("autoRollback") === "on" ? "enabled" : "disabled";

    const summary = `Saved settings for "${workspace}" (${region}, ${channel} channel, auto-rollback ${autoRollback}).`;
    this.statusAnnouncement = summary;
    showSnack(summary, { variant: "positive" });
  }

  private handleReset(): void {
    this.emailError = null;
    this.statusAnnouncement = "Workspace settings restored to their initial defaults.";
  }

  protected override render() {
    return html`
      <lustrous-box padding="2xl" mobile-padding="l" max-width="880" margin-inline="auto">
        <form novalidate @submit=${this.handleSubmit} @reset=${this.handleReset}>
          <lustrous-flex direction="column" gap="2xl">
            <lustrous-flex direction="column" gap="xs">
              <lustrous-text heading="1" variant="headline-large">Workspace & Rollout Settings</lustrous-text>
              <lustrous-text variant="body-medium" muted>
                Configure control-plane defaults using native HTML form submission and ElementInternals controls.
              </lustrous-text>
            </lustrous-flex>

            <lustrous-box background="surface-bright" border border-radius="xl" padding="xl" shadow="1">
              <lustrous-flex direction="column" gap="l">
                <lustrous-text heading="2" variant="headline-small">Identity & Primary Region</lustrous-text>

                <lustrous-grid columns="2" mobile-columns="1" gap="l">
                  <lustrous-text-input
                    name="workspace"
                    label="Workspace Name"
                    value="Meridian Production"
                    leading-icon="domain"
                    supporting-text="Displayed in audit logs and deployment notifications"
                    required
                  ></lustrous-text-input>

                  <lustrous-text-input
                    id="alert-email"
                    name="alertEmail"
                    type="email"
                    label="On-Call Alert Email"
                    value="sre-alerts@meridian.example"
                    leading-icon="mail"
                    supporting-text="Receives SLO burn-rate pages and rollout approvals"
                    .error=${this.emailError}
                    validation-state=${this.emailError ? "error" : "default"}
                    required
                    @input=${this.handleEmailInput}
                  ></lustrous-text-input>
                </lustrous-grid>

                <lustrous-select
                  name="region"
                  label="Primary Control-Plane Region"
                  value="us-east1"
                  supporting-text="State ledger snapshots replicate asynchronously to secondary regions"
                  .options=${REGION_OPTIONS}
                  required
                ></lustrous-select>
              </lustrous-flex>
            </lustrous-box>

            <lustrous-box background="surface-bright" border border-radius="xl" padding="xl" shadow="1">
              <lustrous-flex direction="column" gap="l">
                <lustrous-text heading="2" variant="headline-small">Release Governance</lustrous-text>

                <lustrous-radio-group
                  name="channel"
                  label="Release Channel"
                  value="progressive"
                  supporting-text="Determines canary bake duration and automated verification gates"
                  required
                >
                  <lustrous-radio
                    value="rapid"
                    supporting-text="5-minute canary bake; promotes automatically when synthetic probes pass"
                  >
                    Rapid Canary
                  </lustrous-radio>
                  <lustrous-radio
                    value="progressive"
                    supporting-text="30-minute multi-stage bake (10% → 25% → 65% → 100%) with SLO burn-rate guardrails"
                  >
                    Progressive Production
                  </lustrous-radio>
                  <lustrous-radio
                    value="pinned"
                    supporting-text="Manual promotion approval required for every regional cutover"
                  >
                    Pinned Enterprise
                  </lustrous-radio>
                </lustrous-radio-group>

                <lustrous-text-area
                  name="maintenanceNote"
                  label="Change Window Advisory"
                  rows="3"
                  min-rows="3"
                  max-rows="8"
                  maxlength="280"
                  character-count
                  value="Avoid schema migrations during peak European market close (15:30–17:00 UTC)."
                  supporting-text="Shown to engineers inside the deployment confirmation dialog"
                ></lustrous-text-area>
              </lustrous-flex>
            </lustrous-box>

            <lustrous-flex direction="column" gap="s">
              <lustrous-text heading="2" variant="headline-small">Automated Guardrails</lustrous-text>

              <lustrous-segmented-list divider border-radius="xl" label="Automated rollout guardrails">
                <lustrous-segmented-list-item background="surface-bright" padding="l">
                  <lustrous-text block variant="body-medium-emphasized">Automatic Canary Rollback</lustrous-text>
                  <lustrous-text block variant="body-small" muted>
                    Immediately drain canary pods when P95 latency or 5xx burn exceeds SLO thresholds.
                  </lustrous-text>
                  <lustrous-switch
                    slot="action"
                    name="autoRollback"
                    checked
                    aria-label="Automatic Canary Rollback"
                  ></lustrous-switch>
                </lustrous-segmented-list-item>

                <lustrous-segmented-list-item background="surface-bright" padding="l">
                  <lustrous-text block variant="body-medium-emphasized">Require Provenance Attestation</lustrous-text>
                  <lustrous-text block variant="body-small" muted>
                    Block admission of container digests lacking verified SLSA build signatures.
                  </lustrous-text>
                  <lustrous-switch
                    slot="action"
                    name="provenanceLock"
                    checked
                    aria-label="Require Provenance Attestation"
                  ></lustrous-switch>
                </lustrous-segmented-list-item>

                <lustrous-segmented-list-item background="surface-bright" padding="l">
                  <lustrous-text block variant="body-medium-emphasized">Stream Audit Events to SIEM</lustrous-text>
                  <lustrous-text block variant="body-small" muted>
                    Export structured JSON-Lines audit records for every secret and quota mutation.
                  </lustrous-text>
                  <lustrous-switch
                    slot="action"
                    name="siemAudit"
                    aria-label="Stream Audit Events to SIEM"
                  ></lustrous-switch>
                </lustrous-segmented-list-item>
              </lustrous-segmented-list>
            </lustrous-flex>

            <lustrous-box background="surface-bright" border border-radius="xl" padding="l">
              <lustrous-checkbox
                name="confirmPolicy"
                checked
                required
                supporting-text="Required to persist changes to production clusters"
              >
                I confirm these governance policies comply with regional data-residency requirements
              </lustrous-checkbox>
            </lustrous-box>

            <lustrous-flex align="center" justify="space-between" wrap="wrap" gap="m">
              <div class="status-row" role="status" aria-live="polite">
                ${this.statusAnnouncement
                  ? html`<lustrous-text variant="body-small" tone="primary">${this.statusAnnouncement}</lustrous-text>`
                  : nothing}
              </div>

              <lustrous-flex align="center" gap="s">
                <lustrous-button type="reset" variant="outline">Reset Defaults</lustrous-button>
                <lustrous-button type="submit" variant="accent" icon="check">Save Configuration</lustrous-button>
              </lustrous-flex>
            </lustrous-flex>
          </lustrous-flex>
        </form>
      </lustrous-box>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "meridian-settings-page": MeridianSettingsPage;
  }
}
