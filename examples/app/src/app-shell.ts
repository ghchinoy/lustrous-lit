import { css, html, unsafeCSS } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import "@ghchinoy/lustrous-lit/components/lustrous-button";
import "@ghchinoy/lustrous-lit/components/lustrous-icon";
import type { LustrousIconName } from "@ghchinoy/lustrous-lit/components/lustrous-icon";
import "@ghchinoy/lustrous-lit/components/lustrous-icon-button";
import "@ghchinoy/lustrous-lit/components/lustrous-keyboard-shortcuts-modal";
import type { LustrousKeyboardShortcutSection } from "@ghchinoy/lustrous-lit/components/lustrous-keyboard-shortcuts-modal";
import "@ghchinoy/lustrous-lit/components/lustrous-menu";
import type { LustrousMenuItem } from "@ghchinoy/lustrous-lit/components/lustrous-menu";
import "@ghchinoy/lustrous-lit/components/lustrous-scrollable-box";
import "@ghchinoy/lustrous-lit/components/lustrous-sidebar";
import "@ghchinoy/lustrous-lit/components/lustrous-snackbar";
import { showSnack } from "@ghchinoy/lustrous-lit/components/lustrous-snackbar";
import "@ghchinoy/lustrous-lit/components/lustrous-text";
import "@ghchinoy/lustrous-lit/components/lustrous-tooltip";
import {
  breakpoints,
  formatShortcut,
  LustrousElement,
  lustrousBase,
  lustrousFocusRing,
  LustrousShortcutController,
  lustrousType,
  LustrousViewportController,
  readLustrousThemePreference,
  setLustrousTheme,
  type LustrousThemePreference,
} from "@ghchinoy/lustrous-lit/theme";
import "./pages/overview-page.js";
import "./pages/services-page.js";
import "./pages/settings-page.js";
import "./pages/theming-page.js";
import {
  applyBrandCustomization,
  DEFAULT_BRAND_STATE,
  getBrandPreset,
  readStoredBrandCustomization,
  type BrandCustomizationState,
} from "./theme-presets.js";

export type MeridianRoute = "overview" | "services" | "theming" | "settings";

const THEME_STORAGE_KEY = "meridian.theme";
const SIDEBAR_STORAGE_KEY = "meridian.sidebar.collapsed";

const ROUTE_TITLES: Readonly<Record<MeridianRoute, string>> = {
  overview: "Overview",
  services: "Services",
  theming: "Theme Studio",
  settings: "Settings",
};

const THEME_META: Readonly<
  Record<LustrousThemePreference, { label: string; icon: LustrousIconName }>
> = {
  system: { label: "System", icon: "modeAuto" },
  light: { label: "Light", icon: "lightMode" },
  dark: { label: "Dark", icon: "darkMode" },
};

const SHORTCUT_SECTIONS: readonly LustrousKeyboardShortcutSection[] = [
  {
    id: "general",
    title: "Application",
    rows: [
      { id: "shortcuts", description: "Show keyboard shortcuts", keys: "Mod+/" },
      { id: "sidebar", description: "Toggle sidebar rail (desktop)", keys: "Mod+B" },
    ],
  },
  {
    id: "navigation",
    title: "Navigation",
    rows: [
      { id: "nav-overview", description: "Go to Overview", keys: "Alt+1" },
      { id: "nav-services", description: "Go to Services", keys: "Alt+2" },
      { id: "nav-theming", description: "Go to Theme Studio", keys: "Alt+3" },
      { id: "nav-settings", description: "Go to Settings", keys: "Alt+4" },
    ],
  },
];

function parseHashRoute(hash: string): MeridianRoute {
  const cleaned = hash.replace(/^#\/?/, "").toLowerCase();
  if (cleaned === "services" || cleaned === "theming" || cleaned === "settings") return cleaned;
  return "overview";
}

function readStoredSidebarCollapsed(): boolean {
  try {
    return globalThis.localStorage?.getItem(SIDEBAR_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * `<meridian-app-shell>` — Responsive application shell built on `<lustrous-sidebar>`
 * (desktop rail) and `<lustrous-sidebar-drawer>` (`<= 959.98px` via CSS + `LustrousViewportController`),
 * featuring persisted collapse state, footer theme `<lustrous-menu>`, `Mod+/` keyboard shortcuts,
 * skip link, and route focus management.
 */
@customElement("meridian-app-shell")
export class MeridianAppShell extends LustrousElement {
  static override styles = [
    lustrousBase,
    lustrousFocusRing,
    css`
      :host {
        display: flex;
        width: 100%;
        height: 100dvh;
        min-height: 0;
        overflow: hidden;
        background-color: var(--lustrous-color-background);
        color: var(--lustrous-color-on-background);
      }
      .skip-link {
        position: fixed;
        top: var(--lustrous-space-m);
        inset-inline-start: var(--lustrous-space-m);
        z-index: var(--lustrous-z-snackbar);
        padding-block: var(--lustrous-space-s);
        padding-inline: var(--lustrous-space-l);
        border-radius: var(--lustrous-radius-m);
        background-color: var(--lustrous-color-accent);
        color: var(--lustrous-color-on-accent);
        box-shadow: var(--lustrous-elevation-level2);
        text-decoration: none;
        transform: translateY(-200%);
        transition: transform var(--lustrous-duration-short150) var(--lustrous-easing-standard);
        ${lustrousType("body-small-emphasized")}
      }
      .skip-link:focus-visible {
        transform: translateY(0);
      }
      .shell {
        display: flex;
        flex-direction: row;
        flex: 1 1 auto;
        min-width: 0;
        min-height: 0;
        width: 100%;
        height: 100%;
      }
      .mobile-topbar {
        display: none;
        align-items: center;
        justify-content: space-between;
        gap: var(--lustrous-space-s);
        flex-shrink: 0;
        height: 56px;
        padding-inline: var(--lustrous-space-m);
        border-bottom: 1px solid var(--lustrous-color-outline-variant);
        background-color: var(--lustrous-color-surface-bright);
        color: var(--lustrous-color-on-surface);
      }
      .mobile-brand {
        display: flex;
        align-items: center;
        gap: var(--lustrous-space-s);
        min-width: 0;
      }
      .mobile-title {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        ${lustrousType("body-large-emphasized")}
      }
      main {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-width: 0;
        min-height: 0;
        outline: none;
      }
      main:focus-visible {
        outline: 2px solid var(--lustrous-color-primary);
        outline-offset: -2px;
      }
      .page-scroll {
        flex: 1 1 auto;
        min-height: 0;
        width: 100%;
      }
      .footer-theme-row {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-inline: 10px;
      }
      .footer-theme-menu {
        display: block;
        width: 100%;
      }
      .footer-theme-menu.collapsed {
        width: auto;
      }
      .footer-theme-btn {
        width: 100%;
      }
      @media ${unsafeCSS(breakpoints.shellMobile)} {
        .shell {
          flex-direction: column;
        }
        .mobile-topbar {
          display: flex;
        }
      }
      @media (forced-colors: active) {
        .mobile-topbar {
          border-bottom: 1px solid CanvasText;
        }
        .skip-link {
          border: 1px solid Highlight;
        }
      }
    `,
  ];

  private readonly viewport = new LustrousViewportController(this);

  @state() private route: MeridianRoute = "overview";
  @state() private sidebarCollapsed = false;
  @state() private drawerOpen = false;
  @state() private shortcutsOpen = false;
  @state() private themePreference: LustrousThemePreference = "system";
  @state() private brandState: BrandCustomizationState = DEFAULT_BRAND_STATE;

  @query("#main-content") private mainEl?: HTMLElement;

  protected readonly openShortcutsShortcut = new LustrousShortcutController(this, {
    id: "meridian.shortcuts",
    keys: "Mod+/",
    onTrigger: () => {
      this.shortcutsOpen = !this.shortcutsOpen;
    },
  });

  protected readonly toggleSidebarShortcut = new LustrousShortcutController(this, {
    id: "meridian.sidebar",
    keys: "Mod+B",
    onTrigger: () => {
      if (this.viewport.isShellMobile) {
        this.drawerOpen = !this.drawerOpen;
      } else {
        this.setSidebarCollapsed(!this.sidebarCollapsed);
      }
    },
  });

  protected readonly navOverviewShortcut = new LustrousShortcutController(this, {
    id: "meridian.nav.overview",
    keys: "Alt+1",
    onTrigger: () => this.navigate("overview", true),
  });

  protected readonly navServicesShortcut = new LustrousShortcutController(this, {
    id: "meridian.nav.services",
    keys: "Alt+2",
    onTrigger: () => this.navigate("services", true),
  });

  protected readonly navThemingShortcut = new LustrousShortcutController(this, {
    id: "meridian.nav.theming",
    keys: "Alt+3",
    onTrigger: () => this.navigate("theming", true),
  });

  protected readonly navSettingsShortcut = new LustrousShortcutController(this, {
    id: "meridian.nav.settings",
    keys: "Alt+4",
    onTrigger: () => this.navigate("settings", true),
  });

  override connectedCallback(): void {
    super.connectedCallback();
    this.themePreference = readLustrousThemePreference(THEME_STORAGE_KEY);
    this.brandState = readStoredBrandCustomization();
    applyBrandCustomization(this.brandState, false);
    this.sidebarCollapsed = readStoredSidebarCollapsed();
    if (typeof window !== "undefined") {
      this.route = parseHashRoute(window.location.hash);
      window.addEventListener("hashchange", this.handleHashChange);
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (typeof window !== "undefined") {
      window.removeEventListener("hashchange", this.handleHashChange);
    }
  }

  private handleHashChange = (): void => {
    const next = parseHashRoute(window.location.hash);
    if (next !== this.route) {
      this.route = next;
    }
  };

  private setSidebarCollapsed(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
    try {
      globalThis.localStorage?.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
    } catch {
      /* ignore storage errors in restricted contexts */
    }
  }

  private applyTheme(pref: LustrousThemePreference): void {
    this.themePreference = pref;
    setLustrousTheme(pref, { storageKey: THEME_STORAGE_KEY });
  }

  private get themeMenuItems(): LustrousMenuItem[] {
    return (["system", "light", "dark"] as const).map((mode) => ({
      type: "selection",
      selectionType: "single",
      id: mode,
      label: `${THEME_META[mode].label} theme`,
      icon: THEME_META[mode].icon,
      selected: this.themePreference === mode,
      onSelect: () => this.applyTheme(mode),
    }));
  }

  private navigate(next: MeridianRoute, focusMain = false): void {
    const changed = this.route !== next;
    this.route = next;
    this.drawerOpen = false;

    if (typeof window !== "undefined") {
      const targetHash = `#${next}`;
      if (window.location.hash !== targetHash) {
        window.history.pushState(null, "", targetHash);
      }
      document.title = `${ROUTE_TITLES[next]} — Meridian Studio`;
    }

    if (focusMain || changed) {
      void this.updateComplete.then(() => {
        this.mainEl?.focus({ preventScroll: true });
      });
    }
  }

  private handleSkipToMain(e: MouseEvent): void {
    e.preventDefault();
    this.mainEl?.focus();
  }

  private handleChildNavigate(e: CustomEvent<{ route: MeridianRoute }>): void {
    this.navigate(e.detail.route, true);
  }

  private handleBrandChange(e: CustomEvent<BrandCustomizationState>): void {
    this.brandState = e.detail;
    applyBrandCustomization(this.brandState, true);
  }

  private handleThemeModeChange(e: CustomEvent<{ preference: LustrousThemePreference }>): void {
    this.applyTheme(e.detail.preference);
  }

  private renderSidebar(inDrawer: boolean) {
    const collapsed = inDrawer ? false : this.sidebarCollapsed;
    const currentTheme = THEME_META[this.themePreference];

    return html`
      <lustrous-sidebar
        label="Meridian Studio navigation"
        .collapsed=${collapsed}
        @lustrous-change=${(e: CustomEvent<{ collapsed: boolean }>) => {
          if (!inDrawer && e.target === e.currentTarget) {
            this.setSidebarCollapsed(e.detail.collapsed);
          }
        }}
      >
        <lustrous-sidebar-header
          label="Meridian Studio"
          collapse-label="Collapse sidebar"
          expand-label="Expand sidebar"
        >
          <lustrous-icon slot="logo" name="meridianLogo" size="m" tone="primary"></lustrous-icon>
        </lustrous-sidebar-header>

        <lustrous-sidebar-nav label="Primary">
          <lustrous-sidebar-scroll-area>
            <lustrous-sidebar-item
              icon="activity"
              label="Overview"
              .active=${this.route === "overview"}
              @click=${() => this.navigate("overview", true)}
            ></lustrous-sidebar-item>
            <lustrous-sidebar-item
              icon="layers"
              label="Services"
              meta="6"
              badge="needs-input"
              badge-label="1 degraded service"
              .active=${this.route === "services"}
              @click=${() => this.navigate("services", true)}
            ></lustrous-sidebar-item>
            <lustrous-sidebar-item
              icon="palette"
              label="Theme Studio"
              meta=${this.brandState.preset === "default" ? "" : getBrandPreset(this.brandState.preset).name.split(" ")[0]!}
              .active=${this.route === "theming"}
              @click=${() => this.navigate("theming", true)}
            ></lustrous-sidebar-item>
            <lustrous-sidebar-item
              icon="settings"
              label="Settings"
              .active=${this.route === "settings"}
              @click=${() => this.navigate("settings", true)}
            ></lustrous-sidebar-item>

            <lustrous-sidebar-section heading="Pinned Clusters" collapsible>
              <lustrous-sidebar-item
                icon="globe"
                label="us-east1 · Virginia"
                meta="99.99%"
                pinned
                @click=${() => {
                  this.navigate("services", true);
                  showSnack("Viewing services active in us-east1.", { variant: "default" });
                }}
              ></lustrous-sidebar-item>
              <lustrous-sidebar-item
                icon="shield"
                label="eu-west1 · Belgium"
                badge="needs-input"
                badge-label="Elevated ingest latency"
                pinned
                @click=${() => {
                  this.navigate("services", true);
                  showSnack("Highlighted eu-west1 telemetry status.", { variant: "warning" });
                }}
              ></lustrous-sidebar-item>
              <lustrous-sidebar-item
                icon="bolt"
                label="ap-northeast1 · Tokyo"
                meta="99.98%"
                pinned
                @click=${() => {
                  this.navigate("services", true);
                  showSnack("Viewing services active in ap-northeast1.", { variant: "default" });
                }}
              ></lustrous-sidebar-item>
            </lustrous-sidebar-section>

            <lustrous-sidebar-message
              icon="verifiedUser"
              heading="Mesh Synced"
              description="14 edge POPs reconciled on release train 2026.11."
            ></lustrous-sidebar-message>
          </lustrous-sidebar-scroll-area>
        </lustrous-sidebar-nav>

        <lustrous-sidebar-footer>
          <lustrous-sidebar-item
            icon="keyboard"
            label="Keyboard shortcuts"
            meta=${formatShortcut("Mod+/")}
            @click=${() => {
              this.drawerOpen = false;
              this.shortcutsOpen = true;
            }}
          ></lustrous-sidebar-item>

          <div class="footer-theme-row">
            <lustrous-menu
              class="footer-theme-menu ${collapsed ? "collapsed" : ""}"
              side=${collapsed ? "inline-end" : "top"}
              align="start"
              label="Theme preference"
              .items=${this.themeMenuItems}
            >
              ${collapsed
                ? html`
                    <lustrous-icon-button
                      slot="trigger"
                      size="s"
                      variant="on-surface"
                      icon=${currentTheme.icon}
                      aria-label="Theme preference: ${currentTheme.label}"
                    ></lustrous-icon-button>
                  `
                : html`
                    <lustrous-button
                      slot="trigger"
                      class="footer-theme-btn"
                      size="s"
                      shape="pill"
                      variant="on-surface"
                      icon=${currentTheme.icon}
                      trailing-icon="chevronUp"
                    >
                      Theme · ${currentTheme.label}
                    </lustrous-button>
                  `}
            </lustrous-menu>
          </div>
        </lustrous-sidebar-footer>
      </lustrous-sidebar>
    `;
  }

  private renderActiveRoute() {
    if (this.route === "services") {
      return html`<meridian-services-page></meridian-services-page>`;
    }
    if (this.route === "theming") {
      return html`<meridian-theming-page
        .brandState=${this.brandState}
        .themePreference=${this.themePreference}
      ></meridian-theming-page>`;
    }
    if (this.route === "settings") {
      return html`<meridian-settings-page></meridian-settings-page>`;
    }
    return html`<lustrous-scrollable-box class="page-scroll" scrim="end">
      <meridian-overview-page></meridian-overview-page>
    </lustrous-scrollable-box>`;
  }

  protected override render() {
    const isShellMobile = this.viewport.isShellMobile;
    const currentTheme = THEME_META[this.themePreference];

    return html`
      <a class="skip-link focus-ring" href="#main-content" @click=${this.handleSkipToMain}>
        Skip to main content
      </a>

      <div
        class="shell"
        @meridian-navigate=${this.handleChildNavigate}
        @meridian-brand-change=${this.handleBrandChange}
        @meridian-theme-mode=${this.handleThemeModeChange}
      >
        ${isShellMobile
          ? html`
              <header class="mobile-topbar">
                <div class="mobile-brand">
                  <lustrous-icon-button
                    icon="menu"
                    size="m"
                    variant="on-surface"
                    aria-label="Open navigation drawer"
                    @click=${() => {
                      this.drawerOpen = true;
                    }}
                  ></lustrous-icon-button>
                  <lustrous-icon name="meridianLogo" size="m" tone="primary"></lustrous-icon>
                  <span class="mobile-title">Meridian · ${ROUTE_TITLES[this.route]}</span>
                </div>

                <lustrous-menu side="bottom" align="end" label="Theme preference" .items=${this.themeMenuItems}>
                  <lustrous-icon-button
                    slot="trigger"
                    icon=${currentTheme.icon}
                    size="m"
                    variant="on-surface"
                    aria-label="Theme preference: ${currentTheme.label}"
                  ></lustrous-icon-button>
                </lustrous-menu>
              </header>

              <lustrous-sidebar-drawer
                label="Meridian Studio navigation drawer"
                .open=${this.drawerOpen}
                @lustrous-toggle=${(e: CustomEvent<{ open: boolean }>) => {
                  if (e.target === e.currentTarget) {
                    this.drawerOpen = e.detail.open;
                  }
                }}
              >
                ${this.renderSidebar(true)}
              </lustrous-sidebar-drawer>
            `
          : this.renderSidebar(false)}

        <main id="main-content" tabindex="-1" aria-label="${ROUTE_TITLES[this.route]} workspace">
          ${this.route === "settings" || this.route === "theming"
            ? html`<lustrous-scrollable-box class="page-scroll" scrim="end">
                ${this.renderActiveRoute()}
              </lustrous-scrollable-box>`
            : this.renderActiveRoute()}
        </main>
      </div>

      <lustrous-keyboard-shortcuts-modal
        dismissible
        heading="Meridian Studio Shortcuts"
        .open=${this.shortcutsOpen}
        .sections=${SHORTCUT_SECTIONS}
        @lustrous-toggle=${(e: CustomEvent<{ open: boolean }>) => {
          if (e.target === e.currentTarget) {
            this.shortcutsOpen = e.detail.open;
          }
        }}
      ></lustrous-keyboard-shortcuts-modal>

      <lustrous-snackbar position="bottom-end"></lustrous-snackbar>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "meridian-app-shell": MeridianAppShell;
  }
}
