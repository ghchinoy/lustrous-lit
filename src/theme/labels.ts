/**
 * Global default UI and accessibility labels for built-in Lustrous controls.
 *
 * Components (`lustrous-dialog`, `lustrous-banner`, `lustrous-photo-lightbox`,
 * `lustrous-video-lightbox`, `lustrous-snackbar`) read these defaults when their
 * per-element label attributes are unset. Call `setLustrousLabels()` at startup
 * or on locale changes to localize default labels globally.
 */
export interface LustrousLabels {
  /** Default accessible label for close buttons (`lustrous-dialog`, lightboxes, `lustrous-snackbar`). @default "Close" */
  readonly close: string;
  /** Default accessible label for dismiss buttons (`lustrous-banner`). @default "Dismiss" */
  readonly dismiss: string;
  /** Default fallback accessible label for `lustrous-banner` when `heading` is unset. @default "Notification banner" */
  readonly notificationBanner: string;
  /** Default accessible label for the `lustrous-snackbar` toast viewport region. @default "Notifications" */
  readonly notifications: string;
  /** Default accessible label for the mobile submenu drill-down back button in `lustrous-menu`. @default "Back to main menu" */
  readonly backToMainMenu: string;
}

export const DEFAULT_LUSTROUS_LABELS: LustrousLabels = {
  close: "Close",
  dismiss: "Dismiss",
  notificationBanner: "Notification banner",
  notifications: "Notifications",
  backToMainMenu: "Back to main menu",
};

let currentLabels: LustrousLabels = DEFAULT_LUSTROUS_LABELS;

/** Sets localized default labels for built-in Lustrous controls. Omitted keys fall back to `DEFAULT_LUSTROUS_LABELS`. */
export function setLustrousLabels(labels?: Partial<LustrousLabels>): void {
  currentLabels = labels ? { ...DEFAULT_LUSTROUS_LABELS, ...labels } : DEFAULT_LUSTROUS_LABELS;
}

/** Returns the active default labels for built-in Lustrous controls. */
export function getLustrousLabels(): LustrousLabels {
  return currentLabels;
}
