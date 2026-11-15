import { css, html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { lustrousSrOnly } from "../../internal/a11y.js";
import { getLustrousLabels } from "../../theme/labels.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { lustrousBase, lustrousType } from "../../theme/theme.js";
import "../lustrous-button/lustrous-button.js";
import { renderIcon, type LustrousIconName } from "../lustrous-icon/lustrous-icon.js";
import "../lustrous-icon-button/lustrous-icon-button.js";

export type LustrousSnackbarPosition = "bottom-start" | "bottom-end" | "top-start" | "top-end";
export type LustrousSnackVariant = "default" | "positive" | "warning" | "error";

export interface LustrousSnackOptions {
  /** Semantic tone: `default`, `positive`, `warning` (polite), or `error` (assertive). @default "default" */
  variant?: LustrousSnackVariant;
  /** Optional action button; clicking it runs `onClick` and dismisses the notification. */
  action?: { label: string; onClick?: () => void; disabled?: boolean };
  /** Auto-dismiss delay in ms; `0` keeps it open until dismissed. Default: 4000 (6000 for `warning` / `error`). */
  duration?: number;
  /** Custom id used to update or dismiss a specific notification. */
  id?: string;
  /** Show a close button. Defaults to `true` for persistent notifications (`duration: 0`). */
  dismissible?: boolean;
}

export type LustrousSnackDismissReason = "timeout" | "action" | "close" | "api";
export type LustrousSnackDismissEvent = CustomEvent<{ id: string; reason: LustrousSnackDismissReason }>;

interface SnackItem {
  id: string;
  message: string;
  variant: LustrousSnackVariant;
  action?: LustrousSnackOptions["action"];
  dismissible: boolean;
  duration: number;
  remaining: number;
  startedAt: number;
  timer?: ReturnType<typeof setTimeout>;
}

const VARIANT_ICON: Partial<Record<LustrousSnackVariant, LustrousIconName>> = {
  positive: "checkCircle",
  warning: "warning",
  error: "error",
};

let uid = 0;

/**
 * `<lustrous-snackbar>` — Top-layer toast notification viewport rendered with `popover="manual"`.
 *
 * Place one instance per application (or call `showSnack()` to create one automatically on `document.body`).
 * Messages are announced via persistent live regions (`polite` for `default`, `positive`, and `warning`;
 * `assertive` for `error`). Auto-dismiss timers pause while hovered or focused (WCAG 2.2.1).
 *
 * @fires lustrous-snack-dismiss - `CustomEvent<{ id: string; reason: "timeout" | "action" | "close" | "api" }>` when a notification is removed.
 * @csspart viewport - The fixed top-layer container.
 * @csspart snack - Individual toast surface.
 */
@customElement("lustrous-snackbar")
export class LustrousSnackbar extends LustrousElement {
  static override styles = [
    lustrousBase,
    lustrousSrOnly,
    css`
      :host {
        display: contents;
      }
      .viewport {
        position: fixed;
        inset: auto;
        margin: 0;
        border: 0;
        background: none;
        overflow: visible;
        display: flex;
        flex-direction: column-reverse;
        gap: var(--lustrous-space-s);
        max-width: 100%;
        padding: var(--lustrous-space-l);
        bottom: 0;
        inset-inline-start: 0;
        pointer-events: none;
        z-index: var(--lustrous-z-snackbar);
      }
      .viewport:not(:popover-open) {
        display: none;
      }
      :host([position^="top"]) .viewport {
        top: 0;
        bottom: auto;
        flex-direction: column;
      }
      :host([position$="end"]) .viewport {
        inset-inline-start: auto;
        inset-inline-end: 0;
        align-items: flex-end;
      }
      .snack {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--lustrous-space-m);
        min-width: min(344px, calc(100vw - 32px));
        max-width: min(520px, calc(100vw - 32px));
        min-height: 56px;
        padding-block: var(--lustrous-space-m);
        padding-inline: var(--lustrous-space-2xl) var(--lustrous-space-l);
        border-radius: var(--lustrous-radius-l);
        background-color: var(--lustrous-color-surface-bright);
        color: var(--lustrous-color-on-surface);
        box-shadow: var(--lustrous-elevation-level1);
        pointer-events: auto;
        animation: lustrous-snack-in 200ms cubic-bezier(0, 0, 0.2, 1) both;
      }
      .snack.has-icon {
        padding-inline-start: var(--lustrous-space-l);
      }
      .snack[data-variant="positive"] {
        background-color: var(--lustrous-color-positive-container);
        color: var(--lustrous-color-on-positive-container);
      }
      .snack[data-variant="warning"] {
        background-color: var(--lustrous-color-warning-container);
        color: var(--lustrous-color-on-warning-container);
      }
      .snack[data-variant="error"] {
        background-color: var(--lustrous-color-error-container);
        color: var(--lustrous-color-on-error-container);
      }
      .lead {
        display: flex;
        align-items: center;
        gap: var(--lustrous-space-m);
        flex: 1 1 auto;
        min-width: 0;
      }
      .icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .message {
        flex: 1 1 auto;
        min-width: 0;
        ${lustrousType("body-medium")}
      }
      .actions {
        display: flex;
        align-items: center;
        gap: var(--lustrous-space-s);
        flex-shrink: 0;
      }
      .sr-only.sr-only {
        position: fixed;
      }
      @keyframes lustrous-snack-in {
        from {
          opacity: 0;
          transform: translateY(8px) scale(0.98);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .snack {
          animation: none;
        }
      }
      @media (forced-colors: active) {
        .snack {
          border: 1px solid CanvasText;
        }
      }
    `,
  ];

  /** Corner placement of the notification stack. @default "bottom-start" */
  @property({ reflect: true }) position: LustrousSnackbarPosition = "bottom-start";
  /** Maximum visible notifications at once; older entries are dropped. @default 3 */
  @property({ type: Number }) max = 3;
  /** Accessible name of the notifications region (defaults to `getLustrousLabels().notifications`). */
  @property() label = "";
  /** Accessible label for each close button (defaults to `getLustrousLabels().close`). */
  @property({ attribute: "close-label" }) closeLabel = "";

  @state() private snacks: SnackItem[] = [];
  @state() private politeText = "";
  @state() private assertiveText = "";
  @query(".viewport") private viewport!: HTMLElement;

  /** Shows a toast notification and returns its id. */
  show(message: string, options: LustrousSnackOptions = {}): string {
    const variant = options.variant ?? "default";
    const duration = options.duration ?? (variant === "error" || variant === "warning" ? 6000 : 4000);
    const id = options.id ?? `lustrous-snack-${++uid}`;
    const dismissible = options.dismissible ?? duration === 0;
    const snack: SnackItem = {
      id,
      message,
      variant,
      action: options.action,
      dismissible,
      duration,
      remaining: duration,
      startedAt: 0,
    };
    const rest = this.snacks.filter((s) => s.id !== id);
    while (rest.length >= Math.max(1, this.max)) {
      const dropped = rest.shift()!;
      clearTimeout(dropped.timer);
    }
    this.snacks = [...rest, snack];
    this.startTimer(snack);
    this.announce(message, variant);
    void this.updateComplete.then(() => this.raise());
    return id;
  }

  private announce(message: string, variant: LustrousSnackVariant) {
    const key = variant === "error" ? "assertiveText" : "politeText";
    this[key] = "";
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => {
        this[key] = message;
      });
    } else {
      this[key] = message;
    }
  }

  /** Dismisses a notification by id, or all notifications when `id` is omitted. */
  dismiss(id?: string): void {
    for (const s of [...this.snacks]) {
      if (id === undefined || s.id === id) this.removeSnack(s.id, "api");
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    for (const s of this.snacks) clearTimeout(s.timer);
  }

  private raise() {
    const v = this.viewport;
    if (!v?.showPopover) return;
    if (!this.snacks.length) {
      if (v.matches(":popover-open")) v.hidePopover();
      return;
    }
    if (v.matches(":popover-open")) v.hidePopover();
    v.showPopover();
  }

  private startTimer(s: SnackItem) {
    clearTimeout(s.timer);
    if (!s.duration) return;
    s.startedAt = performance.now();
    s.timer = setTimeout(() => this.removeSnack(s.id, "timeout"), s.remaining);
  }

  private pause(s: SnackItem) {
    if (!s.duration || s.timer === undefined) return;
    clearTimeout(s.timer);
    s.timer = undefined;
    s.remaining = Math.max(0, s.remaining - (performance.now() - s.startedAt));
  }

  private resume(s: SnackItem, el: HTMLElement) {
    if (!s.duration || s.timer !== undefined) return;
    if (el.matches(":hover") || el.matches(":focus-within")) return;
    this.startTimer(s);
  }

  private removeSnack(id: string, reason: LustrousSnackDismissReason) {
    const s = this.snacks.find((x) => x.id === id);
    if (!s) return;
    clearTimeout(s.timer);
    this.snacks = this.snacks.filter((x) => x.id !== id);
    this.dispatchEvent(
      new CustomEvent("lustrous-snack-dismiss", {
        detail: { id, reason },
        bubbles: true,
        composed: true,
      }),
    );
    void this.updateComplete.then(() => this.raise());
  }

  protected override render() {
    const labels = getLustrousLabels();
    return html`<div class="sr-only" role="status" aria-live="polite" aria-atomic="true">${this.politeText}</div>
      <div class="sr-only" role="alert" aria-live="assertive" aria-atomic="true">${this.assertiveText}</div>
      <div
        part="viewport"
        class="viewport"
        popover="manual"
        role="region"
        aria-label=${this.label || labels.notifications}
      >
        ${repeat(
          this.snacks,
          (s) => s.id,
          (s) => {
            const icon = VARIANT_ICON[s.variant];
            const buttonVariant = s.variant === "default" ? "tonal" : "bright";
            return html`<div
              part="snack"
              class="snack ${icon ? "has-icon" : ""}"
              data-id=${s.id}
              data-variant=${s.variant}
              @pointerenter=${() => this.pause(s)}
              @pointerleave=${(e: PointerEvent) => this.resume(s, e.currentTarget as HTMLElement)}
              @focusin=${() => this.pause(s)}
              @focusout=${(e: FocusEvent) => {
                const el = e.currentTarget as HTMLElement;
                requestAnimationFrame(() => this.resume(s, el));
              }}
            >
              <div class="lead">
                ${icon ? html`<span class="icon">${renderIcon(icon, "s")}</span>` : nothing}
                <div class="message">${s.message}</div>
              </div>
              ${s.action || s.dismissible
                ? html`<div class="actions">
                    ${s.action
                      ? html`<lustrous-button
                          size="s"
                          variant=${buttonVariant}
                          ?disabled=${s.action.disabled}
                          @click=${() => {
                            s.action?.onClick?.();
                            this.removeSnack(s.id, "action");
                          }}
                          >${s.action.label}</lustrous-button
                        >`
                      : nothing}
                    ${s.dismissible
                      ? html`<lustrous-icon-button
                          size="s"
                          variant=${buttonVariant}
                          icon="close"
                          aria-label=${this.closeLabel || labels.close}
                          @click=${() => this.removeSnack(s.id, "close")}
                        ></lustrous-icon-button>`
                      : nothing}
                  </div>`
                : nothing}
            </div>`;
          },
        )}
      </div>`;
  }
}

/** Returns the first `<lustrous-snackbar>` in the document, appending one to `<body>` if needed. */
export function getSnackbar(): LustrousSnackbar {
  let el = document.querySelector("lustrous-snackbar");
  if (!el) {
    el = document.createElement("lustrous-snackbar");
    document.body.append(el);
  }
  return el;
}

/** Displays a toast notification in the document's `<lustrous-snackbar>`. Returns the notification id. */
export function showSnack(message: string, options?: LustrousSnackOptions): string {
  return getSnackbar().show(message, options);
}

/** Dismisses a notification by id, or clears all notifications when `id` is omitted. */
export function dismissSnack(id?: string): void {
  document.querySelector("lustrous-snackbar")?.dismiss(id);
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-snackbar": LustrousSnackbar;
  }
  interface HTMLElementEventMap {
    "lustrous-snack-dismiss": LustrousSnackDismissEvent;
  }
}
