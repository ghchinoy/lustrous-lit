import type { ReactiveController, ReactiveControllerHost } from "lit";
import { breakpoints, type LustrousBreakpoint } from "./tokens.js";

/**
 * Tracks a media query and requests an update on the host when it changes.
 *
 * Use only for structural DOM changes (e.g. anchored popover vs. mobile bottom sheet).
 * For layout and styling, prefer CSS media or container queries.
 */
export class LustrousMediaController implements ReactiveController {
  matches = false;
  private mql?: MediaQueryList;
  private readonly query: string;

  constructor(
    private readonly host: ReactiveControllerHost,
    query: LustrousBreakpoint | (string & {}),
  ) {
    this.query = query in breakpoints ? breakpoints[query as LustrousBreakpoint] : query;
    this.mql = globalThis.matchMedia?.(this.query);
    this.matches = this.mql?.matches ?? false;
    host.addController(this);
  }

  private onChange = (e: MediaQueryListEvent) => {
    this.matches = e.matches;
    this.host.requestUpdate();
  };

  hostConnected() {
    this.mql = globalThis.matchMedia?.(this.query);
    this.matches = this.mql?.matches ?? false;
    this.mql?.addEventListener("change", this.onChange);
  }

  hostDisconnected() {
    this.mql?.removeEventListener("change", this.onChange);
  }
}

/** Exposes `isMobile` (≤768px) and `isShellMobile` (≤959.98px, for app-shell navigation). */
export class LustrousViewportController implements ReactiveController {
  private readonly mobile: LustrousMediaController;
  private readonly shellMobile: LustrousMediaController;

  constructor(host: ReactiveControllerHost) {
    this.mobile = new LustrousMediaController(host, "mobile");
    this.shellMobile = new LustrousMediaController(host, "shellMobile");
    host.addController(this);
  }

  get isMobile() {
    return this.mobile.matches;
  }
  get isDesktop() {
    return !this.mobile.matches;
  }
  get isShellMobile() {
    return this.shellMobile.matches;
  }
  get isShellDesktop() {
    return !this.shellMobile.matches;
  }

  hostConnected() {}
}
