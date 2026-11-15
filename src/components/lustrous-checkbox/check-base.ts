import type { PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import "../../theme/events.js";
import { LustrousElement } from "../../theme/lustrous-element.js";

let uid = 0;

/**
 * Shared base for form-associated boolean controls (`lustrous-checkbox`, `lustrous-switch`).
 */
export class LustrousCheckBase extends LustrousElement {
  static formAssociated = true;
  static override shadowRootOptions: ShadowRootInit = { ...LustrousElement.shadowRootOptions, delegatesFocus: true };

  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ reflect: true }) name?: string;
  @property({ reflect: true }) value = "on";
  @property({ attribute: "supporting-text" }) supportingText = "";

  @state() protected formDisabled = false;
  @state() protected hasLabel = false;

  protected get isDisabled(): boolean {
    return this.disabled || this.formDisabled;
  }

  protected readonly internals: ElementInternals | undefined =
    typeof this.attachInternals === "function" ? this.attachInternals() : undefined;
  protected readonly uid = `lustrous-chk-${++uid}`;
  private defaultChecked: boolean | undefined;

  static override get observedAttributes(): string[] {
    return [...super.observedAttributes, "aria-label"];
  }

  override attributeChangedCallback(name: string, old: string | null, value: string | null): void {
    super.attributeChangedCallback(name, old, value);
    if (name === "aria-label") this.requestUpdate();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.defaultChecked ??= this.hasAttribute("checked");
    this.hasLabel = [...this.childNodes].some((n) => n.nodeType === 1 || (n.nodeType === 3 && n.textContent!.trim() !== ""));
    this.addEventListener("click", this.onHostClick);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("click", this.onHostClick);
  }

  private onHostClick = (e: MouseEvent) => {
    if (e.composedPath()[0] === this && !this.isDisabled) this.toggleFromUser();
  };

  protected get label(): string | null {
    return this.getAttribute("aria-label");
  }

  protected onSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    this.hasLabel = slot
      .assignedNodes({ flatten: true })
      .some((n) => n.nodeType === 1 || (n.nodeType === 3 && n.textContent!.trim() !== ""));
  }

  protected toggleFromUser(): void {
    this.checked = !this.checked;
    this.afterUserChange();
  }

  protected afterUserChange(): void {
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    this.dispatchEvent(new Event("change", { bubbles: true }));
    this.dispatchEvent(new CustomEvent("lustrous-change", { detail: { checked: this.checked }, bubbles: true, composed: true }));
  }

  protected get validationAnchor(): HTMLElement | undefined {
    return undefined;
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    if (changed.has("checked") || changed.has("value") || changed.has("required") || changed.has("disabled")) {
      this.internals?.setFormValue(this.checked ? this.value : null);
      if (this.required && !this.checked) {
        this.internals?.setValidity({ valueMissing: true }, "Please check this box if you want to proceed.", this.validationAnchor);
      } else {
        this.internals?.setValidity({});
      }
    }
  }

  formResetCallback(): void {
    this.checked = this.defaultChecked ?? false;
  }

  formStateRestoreCallback(state: string | File | FormData | null): void {
    this.checked = state === this.value;
  }

  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
  }

  get form(): HTMLFormElement | null {
    return this.internals?.form ?? null;
  }
  get validity(): ValidityState | undefined {
    return this.internals?.validity;
  }
  get validationMessage(): string {
    return this.internals?.validationMessage ?? "";
  }
  checkValidity(): boolean {
    return this.internals?.checkValidity() ?? true;
  }
  reportValidity(): boolean {
    return this.internals?.reportValidity() ?? true;
  }
}
