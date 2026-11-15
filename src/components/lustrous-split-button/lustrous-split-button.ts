import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { lustrousType } from "../../theme/theme.js";
import {
  lustrousButtonStyles,
  type LustrousButtonShape,
  type LustrousButtonSize,
} from "../lustrous-button/button-base.js";
import { renderIcon } from "../lustrous-icon/lustrous-icon.js";
import "../lustrous-menu/lustrous-menu.js";
import type { LustrousMenuItem } from "../lustrous-menu/lustrous-menu.js";
import "../lustrous-popover/lustrous-popover.js";

export type LustrousSplitButtonVariant = "tonal" | "accent" | "outline" | "bright";
export type LustrousSplitButtonSize = LustrousButtonSize;

export interface LustrousSplitButtonAction {
  readonly id?: string;
  readonly label: string;
  readonly disabled?: boolean;
}

export type LustrousSplitButtonActionEvent<
  A extends LustrousSplitButtonAction = LustrousSplitButtonAction,
> = CustomEvent<{
  action: A;
  index: number;
}>;

/**
 * `<lustrous-split-button>` — Primary action button joined to a trailing caret `<lustrous-menu>` trigger.
 *
 * - `actions[0]` renders as the primary face button; the caret menu lists all actions with the
 *   default face action marked by a leading check icon.
 * - Variants: `tonal` (default), `accent`, `outline`, `bright`.
 * - Sizes: `m` (44px, default), `s` (36px), `xs` (28px).
 *
 * @fires lustrous-action - `CustomEvent<{ action, index }>` when the face or a menu action is activated.
 * @csspart face - The primary action `<button>`.
 * @csspart caret - The trailing menu-trigger `<button>`.
 * @csspart menu - The dropdown `<lustrous-menu>` panel.
 * @csspart item - Each interactive menu item inside the dropdown.
 */
@customElement("lustrous-split-button")
export class LustrousSplitButton extends LustrousElement {
  static override styles = [
    ...lustrousButtonStyles,
    css`
      :host {
        display: inline-flex;
        align-items: center;
        border-radius: var(--lustrous-radius-m);
        flex-shrink: 0;
        vertical-align: middle;
      }
      :host([shape="pill"]) {
        border-radius: var(--lustrous-radius-full);
      }
      lustrous-menu {
        display: inline-flex;
      }
      .btn {
        width: auto;
      }
      .btn:focus-visible {
        z-index: 1;
      }
      .size-m {
        height: 44px;
      }
      .size-s {
        height: 36px;
      }
      .size-xs {
        height: 28px;
        gap: var(--lustrous-space-xs);
        ${lustrousType("body-small-emphasized")}
      }
      .face {
        border-start-start-radius: var(--lustrous-radius-m);
        border-end-start-radius: var(--lustrous-radius-m);
        border-start-end-radius: var(--lustrous-radius-none);
        border-end-end-radius: var(--lustrous-radius-none);
      }
      :host([shape="pill"]) .face {
        border-start-start-radius: var(--lustrous-radius-full);
        border-end-start-radius: var(--lustrous-radius-full);
      }
      .size-m.face {
        padding-inline: var(--lustrous-space-l) var(--lustrous-space-m);
      }
      .size-s.face {
        padding-inline: var(--lustrous-space-m) var(--lustrous-space-s);
      }
      .size-xs.face {
        padding-inline: var(--lustrous-space-s) var(--lustrous-space-xs);
      }
      .caret {
        border-start-start-radius: var(--lustrous-radius-none);
        border-end-start-radius: var(--lustrous-radius-none);
        border-start-end-radius: var(--lustrous-radius-m);
        border-end-end-radius: var(--lustrous-radius-m);
        padding-inline: var(--lustrous-space-s);
      }
      :host([shape="pill"]) .caret {
        border-start-end-radius: var(--lustrous-radius-full);
        border-end-end-radius: var(--lustrous-radius-full);
      }
      .caret:not(.variant-outline) {
        border-inline-start: 1px solid color-mix(in srgb, currentColor 20%, transparent);
      }
      .caret.variant-outline {
        margin-inline-start: -1px;
      }
      .size-xs.caret {
        padding-inline: var(--lustrous-space-xs);
      }
    `,
  ];

  @property({ attribute: false }) actions: readonly LustrousSplitButtonAction[] = [];
  @property({ attribute: false }) onAction?: (action: LustrousSplitButtonAction, index: number) => void;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ reflect: true }) size: LustrousSplitButtonSize = "m";
  @property({ reflect: true }) variant: LustrousSplitButtonVariant = "tonal";
  @property({ reflect: true }) shape: LustrousButtonShape = "rounded";
  @property({ attribute: "caret-aria-label" }) caretAriaLabel = "";

  override addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (
      this: HTMLElement,
      ev: K extends "lustrous-action" ? LustrousSplitButtonActionEvent : HTMLElementEventMap[K],
    ) => unknown,
    options?: boolean | AddEventListenerOptions,
  ): void;
  override addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ): void {
    if (listener) super.addEventListener(type, listener, options);
  }

  private emit(action: LustrousSplitButtonAction | undefined, index: number): void {
    if (!action || this.disabled || action.disabled) return;
    this.onAction?.(action, index);
    this.dispatchEvent(
      new CustomEvent("lustrous-action", {
        detail: { action, index },
        bubbles: true,
        composed: true,
      }),
    );
  }

  protected override render() {
    const faceAction = this.actions[0];
    const faceLabel = faceAction?.label ?? "";
    const faceDisabled = this.disabled || !faceAction || Boolean(faceAction.disabled);
    const caretLabel = this.caretAriaLabel || (faceLabel ? `More options for ${faceLabel}` : "More options");
    const iconSize = this.size === "xs" ? "xs" : "s";
    const baseCls = `btn focus-ring state-layer variant-${this.variant} size-${this.size}`;
    const faceCls = `${baseCls} face ${faceDisabled ? "disabled" : ""}`;
    const caretCls = `${baseCls} caret ${this.disabled ? "disabled" : ""}`;

    const items: LustrousMenuItem[] = this.actions.map((action, index) => ({
      type: "action",
      id: action.id ?? action.label,
      label: action.label,
      icon: index === 0 ? "checkSmall" : undefined,
      reserveLeadingSpace: true,
      disabled: this.disabled || Boolean(action.disabled),
      onClick: () => this.emit(action, index),
    }));

    return html`
      <button
        part="face"
        class=${faceCls}
        type="button"
        ?disabled=${faceDisabled}
        @click=${() => this.emit(faceAction, 0)}
      >
        ${faceLabel}
      </button>
      <lustrous-menu exportparts="menu, item" label=${caretLabel} .anchor=${this} .items=${items}>
        <button
          part="caret"
          slot="trigger"
          class=${caretCls}
          type="button"
          aria-label=${caretLabel}
          ?disabled=${this.disabled}
        >
          ${renderIcon("chevronDown", iconSize)}
        </button>
      </lustrous-menu>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-split-button": LustrousSplitButton;
  }
}
