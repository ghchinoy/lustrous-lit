import { css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@ghchinoy/lustrous-lit/components/lustrous-badge";
import "@ghchinoy/lustrous-lit/components/lustrous-box";
import "@ghchinoy/lustrous-lit/components/lustrous-button";
import "@ghchinoy/lustrous-lit/components/lustrous-code-block";
import "@ghchinoy/lustrous-lit/components/lustrous-flex";
import "@ghchinoy/lustrous-lit/components/lustrous-grid";
import "@ghchinoy/lustrous-lit/components/lustrous-icon";
import "@ghchinoy/lustrous-lit/components/lustrous-popover";
import "@ghchinoy/lustrous-lit/components/lustrous-pressable";
import "@ghchinoy/lustrous-lit/components/lustrous-progress-bar";
import "@ghchinoy/lustrous-lit/components/lustrous-segmented-control";
import "@ghchinoy/lustrous-lit/components/lustrous-select";
import type { LustrousSelectOption } from "@ghchinoy/lustrous-lit/components/lustrous-select";
import { showSnack } from "@ghchinoy/lustrous-lit/components/lustrous-snackbar";
import "@ghchinoy/lustrous-lit/components/lustrous-switch";
import "@ghchinoy/lustrous-lit/components/lustrous-tabs";
import "@ghchinoy/lustrous-lit/components/lustrous-text";
import "@ghchinoy/lustrous-lit/components/lustrous-text-input";
import {
  LustrousElement,
  lustrousBase,
  lustrousType,
  resolveLustrousTheme,
  type LustrousChangeEvent,
  type LustrousThemePreference,
} from "@ghchinoy/lustrous-lit/theme";
import {
  BRAND_PRESETS,
  DEFAULT_BRAND_STATE,
  formatBrandCssSnippet,
  getBrandPreset,
  type BrandCustomizationState,
  type BrandPresetId,
  type RadiusProfileId,
} from "../theme-presets.js";

const SPECIMEN_ROLES: readonly LustrousSelectOption[] = [
  { value: "architect", label: "Design Systems Architect", icon: "palette" },
  { value: "platform", label: "Platform Engineer", icon: "terminal" },
  { value: "security", label: "Security Reviewer", icon: "shield" },
];

/**
 * `<meridian-theming-page>` — Interactive Theme & Brand Studio demonstrating how
 * consumers customize `@ghchinoy/lustrous-lit` via unlayered `--lustrous-*` tokens,
 * corner-radius scales, typography variables, and nested `[data-theme]` islands.
 */
@customElement("meridian-theming-page")
export class MeridianThemingPage extends LustrousElement {
  static override styles = [
    lustrousBase,
    css`
      :host {
        display: block;
        min-width: 0;
      }
      .preset-card {
        height: 100%;
      }
      .swatch-strip {
        display: flex;
        align-items: center;
        gap: var(--lustrous-space-xs);
      }
      .swatch-dot {
        width: 20px;
        height: 20px;
        border-radius: var(--lustrous-radius-full);
        border: 1px solid var(--lustrous-color-outline-variant);
        flex-shrink: 0;
      }
      /* Scoped subtree token override: affects only descendants of .subtree-promo */
      .subtree-promo {
        --lustrous-color-accent: #0f766e;
        --lustrous-color-on-accent: #ffffff;
        --lustrous-color-accent-container: #ccfbf1;
        --lustrous-color-on-accent-container: #134e4a;
      }
      :host-context([data-theme="dark"]) .subtree-promo,
      [data-theme="dark"] .subtree-promo {
        --lustrous-color-accent: #2dd4bf;
        --lustrous-color-on-accent: #042f2e;
        --lustrous-color-accent-container: #115e59;
        --lustrous-color-on-accent-container: #ccfbf1;
      }
      .token-pill {
        display: inline-flex;
        align-items: center;
        padding: 2px var(--lustrous-space-s);
        border-radius: var(--lustrous-radius-s);
        background-color: var(--lustrous-color-surface-container);
        color: var(--lustrous-color-on-surface);
        ${lustrousType("code")}
      }
      @media (forced-colors: active) {
        .swatch-dot {
          forced-color-adjust: none;
          border-color: CanvasText;
        }
      }
    `,
  ];

  @property({ attribute: false }) brandState: BrandCustomizationState = DEFAULT_BRAND_STATE;
  @property() themePreference: LustrousThemePreference = "system";

  @state() private specimenTab = "controls";
  @state() private specimenRole = "architect";
  @state() private islandMode: "dark" | "light" = "dark";

  override connectedCallback(): void {
    super.connectedCallback();
    const effective = resolveLustrousTheme(this);
    this.islandMode = effective === "dark" ? "light" : "dark";
  }

  private emitBrandChange(patch: Partial<BrandCustomizationState>, announce?: string): void {
    const next: BrandCustomizationState = { ...this.brandState, ...patch };
    this.dispatchEvent(
      new CustomEvent("meridian-brand-change", {
        detail: next,
        bubbles: true,
        composed: true,
      }),
    );
    if (announce) {
      showSnack(announce, { variant: "default" });
    }
  }

  private emitThemeMode(pref: LustrousThemePreference): void {
    const effectiveAfter =
      pref === "system" ? resolveLustrousTheme(document.documentElement) : pref;
    this.islandMode = effectiveAfter === "dark" ? "light" : "dark";
    this.dispatchEvent(
      new CustomEvent("meridian-theme-mode", {
        detail: { preference: pref },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleResetAll(): void {
    this.emitBrandChange(DEFAULT_BRAND_STATE, "Restored default Lustrous Sapphire tokens.");
  }

  protected override render() {
    const activePreset = getBrandPreset(this.brandState.preset);
    const isCustomized =
      this.brandState.preset !== "default" ||
      this.brandState.radius !== "preset" ||
      this.brandState.monoDisplay;

    return html`
      <lustrous-box padding="2xl" mobile-padding="l" max-width="1160" margin-inline="auto">
        <lustrous-flex direction="column" gap="2xl">
          <!-- Page Header -->
          <lustrous-flex align="flex-start" justify="space-between" wrap="wrap" gap="m">
            <lustrous-flex direction="column" gap="xs">
              <lustrous-flex align="center" gap="s" wrap="wrap">
                <lustrous-text heading="1" variant="headline-large">Theme & Brand Studio</lustrous-text>
                <lustrous-badge tone="accent" icon="palette">${activePreset.name}</lustrous-badge>
              </lustrous-flex>
              <lustrous-text variant="body-medium" muted>
                Customize Lustrous across the entire application using unlayered CSS custom properties that override
                <span class="token-pill">@layer lustrous</span> without <span class="token-pill">!important</span>.
              </lustrous-text>
            </lustrous-flex>

            <lustrous-button
              variant="outline"
              size="s"
              icon="refresh"
              ?disabled=${!isCustomized}
              @click=${this.handleResetAll}
            >
              Reset to Default
            </lustrous-button>
          </lustrous-flex>

          <!-- 1. Brand Preset Cards -->
          <lustrous-flex direction="column" gap="m">
            <lustrous-flex align="center" justify="space-between" wrap="wrap" gap="s">
              <lustrous-text heading="2" variant="headline-small">1. Choose a Brand Palette Preset</lustrous-text>
              <lustrous-text variant="body-small" muted>
                Applies live to the entire Meridian Studio workspace (try switching routes in the sidebar)
              </lustrous-text>
            </lustrous-flex>

            <lustrous-grid columns="repeat(auto-fit, minmax(180px, 1fr))" gap="m">
              ${BRAND_PRESETS.map((preset) => {
                const selected = this.brandState.preset === preset.id;
                return html`
                  <lustrous-pressable
                    class="preset-card"
                    padding="l"
                    border
                    border-radius="xl"
                    background=${selected ? "surface-bright" : "surface"}
                    shadow=${selected ? "1" : undefined}
                    ?selected=${selected}
                    @click=${() => this.emitBrandChange({ preset: preset.id as BrandPresetId })}
                  >
                    <lustrous-flex direction="column" gap="s">
                      <lustrous-flex align="center" justify="space-between" gap="xs">
                        <div class="swatch-strip" aria-hidden="true">
                          <span class="swatch-dot" style="background-color: ${preset.swatchLight}"></span>
                          <span class="swatch-dot" style="background-color: ${preset.swatchDark}"></span>
                          <span class="swatch-dot" style="background-color: ${preset.swatchSurface}"></span>
                        </div>
                        ${selected
                          ? html`<lustrous-badge tone="accent" icon="check">Active</lustrous-badge>`
                          : nothing_or_radius_badge(preset.defaultRadius)}
                      </lustrous-flex>

                      <lustrous-text variant="body-medium-emphasized" block>${preset.name}</lustrous-text>
                      <lustrous-text variant="body-small" muted block>${preset.tagline}</lustrous-text>
                    </lustrous-flex>
                  </lustrous-pressable>
                `;
              })}
            </lustrous-grid>
          </lustrous-flex>

          <!-- 2. Interactive Token Dials -->
          <lustrous-box background="surface-bright" border border-radius="xl" padding="xl" shadow="1">
            <lustrous-flex direction="column" gap="l">
              <lustrous-text heading="2" variant="headline-small">2. Tune Color Scheme, Shape & Typography</lustrous-text>

              <lustrous-grid columns="2" mobile-columns="1" gap="xl" align="center">
                <lustrous-flex direction="column" gap="xs">
                  <lustrous-text variant="body-small-emphasized">Color Mode (data-theme)</lustrous-text>
                  <lustrous-segmented-control
                    label="Color mode"
                    .value=${this.themePreference}
                    .options=${[
                      { value: "system", label: "System", icon: "modeAuto" },
                      { value: "light", label: "Light", icon: "lightMode" },
                      { value: "dark", label: "Dark", icon: "darkMode" },
                    ]}
                    @lustrous-change=${(e: LustrousChangeEvent) =>
                      this.emitThemeMode((e.detail.value as LustrousThemePreference) ?? "system")}
                  ></lustrous-segmented-control>
                </lustrous-flex>

                <lustrous-flex direction="column" gap="xs">
                  <lustrous-text variant="body-small-emphasized">Corner Geometry (--lustrous-radius-*)</lustrous-text>
                  <lustrous-segmented-control
                    label="Corner geometry"
                    .value=${this.brandState.radius}
                    .options=${[
                      { value: "preset", label: "Preset" },
                      { value: "sharp", label: "Sharp" },
                      { value: "architectural", label: "Default" },
                      { value: "soft", label: "Soft" },
                    ]}
                    @lustrous-change=${(e: LustrousChangeEvent) =>
                      this.emitBrandChange({ radius: (e.detail.value as RadiusProfileId) ?? "preset" })}
                  ></lustrous-segmented-control>
                </lustrous-flex>
              </lustrous-grid>

              <lustrous-switch
                ?checked=${this.brandState.monoDisplay}
                supporting-text="Overrides --lustrous-font-display with Google Sans Code across all display and headline variants"
                @lustrous-change=${(e: LustrousChangeEvent) =>
                  this.emitBrandChange({ monoDisplay: Boolean(e.detail.checked) })}
              >
                Monospace technical display headings
              </lustrous-switch>
            </lustrous-flex>
          </lustrous-box>

          <!-- 3. Live Component Specimen & Nested Theme Island -->
          <lustrous-grid columns="2" mobile-columns="1" gap="l" align="stretch">
            <!-- Left: Live Specimen -->
            <lustrous-box background="surface-bright" border border-radius="xl" padding="xl" shadow="1">
              <lustrous-flex direction="column" gap="l">
                <lustrous-flex align="center" justify="space-between" gap="s">
                  <lustrous-text heading="2" variant="headline-small">Live Component Specimen</lustrous-text>
                  <lustrous-badge tone="positive" icon="check">WCAG AA</lustrous-badge>
                </lustrous-flex>

                <lustrous-tabs
                  label="Specimen preview tabs"
                  .value=${this.specimenTab}
                  .tabs=${[
                    { value: "controls", label: "Controls", icon: "sliders" },
                    { value: "metrics", label: "Telemetry", icon: "activity", badge: "3" },
                  ]}
                  @lustrous-change=${(e: LustrousChangeEvent) => (this.specimenTab = e.detail.value ?? "controls")}
                >
                  <lustrous-flex slot="controls" direction="column" gap="m" padding-top="m">
                    <lustrous-text-input
                      label="Environment Endpoint"
                      value="https://api.meridian.internal/v2"
                      leading-icon="globe"
                      validation-state="success"
                    ></lustrous-text-input>

                    <lustrous-select
                      label="Reviewer Role"
                      .value=${this.specimenRole}
                      .options=${SPECIMEN_ROLES}
                      @lustrous-change=${(e: LustrousChangeEvent) =>
                        (this.specimenRole = e.detail.value ?? "architect")}
                    ></lustrous-select>

                    <lustrous-flex align="center" wrap="wrap" gap="s">
                      <lustrous-button variant="accent" icon="bolt">Primary Action</lustrous-button>
                      <lustrous-button variant="tonal">Tonal</lustrous-button>
                      <lustrous-button variant="outline">Outline</lustrous-button>

                      <lustrous-popover
                        heading="Top-Layer Token Inheritance"
                        content="Popovers render in the browser top layer while inheriting active --lustrous-* tokens from their DOM position."
                        primary-action="Got it"
                      >
                        <lustrous-button variant="on-surface" size="s" icon="info">Inspect Popover</lustrous-button>
                      </lustrous-popover>
                    </lustrous-flex>
                  </lustrous-flex>

                  <lustrous-flex slot="metrics" direction="column" gap="m" padding-top="m">
                    <lustrous-progress-bar label="Token contrast compliance" value="100" tone="positive"></lustrous-progress-bar>
                    <lustrous-progress-bar label="Canary rollout capacity" value="68" tone="accent"></lustrous-progress-bar>
                    <lustrous-flex wrap="wrap" gap="xs">
                      <lustrous-badge tone="cobalt">Cobalt</lustrous-badge>
                      <lustrous-badge tone="emerald">Emerald</lustrous-badge>
                      <lustrous-badge tone="amber">Amber</lustrous-badge>
                      <lustrous-badge tone="rose">Rose</lustrous-badge>
                      <lustrous-badge tone="violet">Violet</lustrous-badge>
                      <lustrous-badge tone="teal">Teal</lustrous-badge>
                    </lustrous-flex>
                  </lustrous-flex>
                </lustrous-tabs>
              </lustrous-flex>
            </lustrous-box>

            <!-- Right: Nested Theme Island & Subtree Token Scope -->
            <lustrous-box background="surface-bright" border border-radius="xl" padding="xl" shadow="1">
              <lustrous-flex direction="column" gap="l">
                <lustrous-flex align="center" justify="space-between" wrap="wrap" gap="s">
                  <lustrous-text heading="2" variant="headline-small">Nested Theme Islands</lustrous-text>
                  <lustrous-segmented-control
                    size="s"
                    label="Island theme polarity"
                    .value=${this.islandMode}
                    .options=${[
                      { value: "dark", label: "Dark Island" },
                      { value: "light", label: "Light Island" },
                    ]}
                    @lustrous-change=${(e: LustrousChangeEvent) =>
                      (this.islandMode = (e.detail.value as "dark" | "light") ?? "dark")}
                  ></lustrous-segmented-control>
                </lustrous-flex>

                <lustrous-text variant="body-small" muted>
                  Place <span class="token-pill">data-theme="${this.islandMode}"</span> on any container to create an
                  isolated theme island, or scope <span class="token-pill">--lustrous-color-*</span> on a CSS class for
                  local callouts:
                </lustrous-text>

                <!-- Opposite-polarity data-theme island -->
                <div data-theme=${this.islandMode}>
                  <lustrous-box background="surface-container" border border-radius="l" padding="l">
                    <lustrous-flex direction="column" gap="m">
                      <lustrous-flex align="center" justify="space-between" gap="s">
                        <lustrous-text variant="body-medium-emphasized">
                          Isolated ${this.islandMode === "dark" ? "Dark" : "Light"} Surface Island
                        </lustrous-text>
                        <lustrous-badge tone="accent">${this.islandMode}</lustrous-badge>
                      </lustrous-flex>
                      <lustrous-text variant="body-small" muted>
                        Every descendant reads the ${this.islandMode} palette for ${activePreset.name} without JavaScript re-renders.
                      </lustrous-text>
                      <lustrous-flex gap="s" wrap="wrap">
                        <lustrous-button size="s" variant="accent" icon="bolt">Island CTA</lustrous-button>
                        <lustrous-button size="s" variant="outline">Secondary</lustrous-button>
                      </lustrous-flex>
                    </lustrous-flex>
                  </lustrous-box>
                </div>

                <!-- Subtree CSS variable override -->
                <div class="subtree-promo">
                  <lustrous-box background="accent-container" border-radius="l" padding="l">
                    <lustrous-flex align="center" justify="space-between" wrap="wrap" gap="m">
                      <lustrous-flex direction="column" gap="xs">
                        <lustrous-text variant="body-medium-emphasized">Subtree CSS Scope (.subtree-promo)</lustrous-text>
                        <lustrous-text variant="body-small">
                          Overrides <span class="token-pill">--lustrous-color-accent</span> to Mineral Teal on this card only.
                        </lustrous-text>
                      </lustrous-flex>
                      <lustrous-button size="s" variant="accent" icon="check">Scoped Teal</lustrous-button>
                    </lustrous-flex>
                  </lustrous-box>
                </div>
              </lustrous-flex>
            </lustrous-box>
          </lustrous-grid>

          <!-- 4. Generated Copy-Paste CSS -->
          <lustrous-flex direction="column" gap="s">
            <lustrous-flex align="center" justify="space-between" wrap="wrap" gap="s">
              <lustrous-text heading="2" variant="headline-small">3. Generated CSS Override Stylesheet</lustrous-text>
              <lustrous-text variant="body-small" muted>
                Drop into your app stylesheet after importing <span class="token-pill">@ghchinoy/lustrous-lit/theme.css</span>
              </lustrous-text>
            </lustrous-flex>

            <lustrous-code-block
              label="brand-overrides.css"
              .code=${formatBrandCssSnippet(this.brandState)}
            ></lustrous-code-block>
          </lustrous-flex>
        </lustrous-flex>
      </lustrous-box>
    `;
  }
}

function nothing_or_radius_badge(radius: "sharp" | "architectural" | "soft") {
  const label = radius === "sharp" ? "4px" : radius === "soft" ? "16px" : "10px";
  return html`<lustrous-badge>${label}</lustrous-badge>`;
}

declare global {
  interface HTMLElementTagNameMap {
    "meridian-theming-page": MeridianThemingPage;
  }
}
