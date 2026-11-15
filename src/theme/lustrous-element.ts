import { LitElement, type CSSResultOrNative } from "lit";
import { installLustrousTheme } from "./theme.js";
import { breakpoints } from "./tokens.js";

/** Component classes seen so far whose shared stylesheets may hold media queries. */
const classes = new Set<typeof LitElement>();
let watching = false;

/**
 * WebKit caches media-query results per adopted stylesheet and only refreshes
 * sheets currently in use. Touching each registered component sheet when a
 * breakpoint flips ensures newly connected instances evaluate current rules.
 */
function watchBreakpoints(win: Window) {
  if (watching || typeof win.matchMedia !== "function") return;
  watching = true;
  const refresh = () => {
    for (const cls of classes) {
      for (const s of cls.elementStyles as CSSResultOrNative[]) {
        const sheet = s instanceof CSSStyleSheet ? s : (s as { styleSheet?: CSSStyleSheet }).styleSheet;
        if (!sheet) continue;
        try {
          const i = sheet.insertRule("@media all {}", sheet.cssRules.length);
          sheet.deleteRule(i);
        } catch {
          /* immutable sheets are left untouched */
        }
      }
    }
  };
  for (const q of [breakpoints.mobile, breakpoints.shellMobile]) {
    win.matchMedia(q).addEventListener("change", refresh);
  }
}

/**
 * Base class for Lustrous Lit components. Ensures the Lustrous theme stylesheet
 * is adopted on first connect so `--lustrous-*` tokens always resolve, and replays
 * `slotchange` once after hydrating declarative shadow DOM.
 */
export class LustrousElement extends LitElement {
  private readonly lustrousHydrated = !!this.shadowRoot;

  override connectedCallback(): void {
    installLustrousTheme(this.ownerDocument);
    classes.add(this.constructor as typeof LitElement);
    const win = this.ownerDocument.defaultView;
    if (win) watchBreakpoints(win);
    super.connectedCallback();
  }

  protected override firstUpdated(changed: Parameters<LitElement["firstUpdated"]>[0]): void {
    super.firstUpdated(changed);
    if (!this.lustrousHydrated) return;
    for (const slot of this.renderRoot.querySelectorAll("slot")) {
      slot.dispatchEvent(new Event("slotchange", { bubbles: true }));
    }
  }
}
