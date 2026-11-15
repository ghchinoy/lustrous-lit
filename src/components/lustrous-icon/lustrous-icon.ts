import { css, html, nothing, svg, type SVGTemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LustrousElement } from "../../theme/lustrous-element.js";
import { lustrousIconStyles } from "../../theme/theme.js";
import { iconSizes, iconStrokes, type LustrousIconSize } from "../../theme/tokens.js";

export { lustrousIconStyles } from "../../theme/theme.js";
export type { LustrousIconSize } from "../../theme/tokens.js";

function nearestSize(px: number): LustrousIconSize {
  let best: LustrousIconSize = "s";
  for (const k of Object.keys(iconSizes) as LustrousIconSize[]) {
    if (Math.abs(iconSizes[k] - px) < Math.abs(iconSizes[best] - px)) best = k;
  }
  return best;
}

/** Core built-in Lustrous icon names (24×24 stroke grid, hermetic inline SVGs). */
export type LustrousCoreIconName =
  | "activity"
  | "add"
  | "addImage"
  | "archive"
  | "arrowBack"
  | "arrowCircleDown"
  | "arrowDownward"
  | "arrowDropDown"
  | "arrowForward"
  | "arrowForwardIos"
  | "arrowOutward"
  | "arrowUpward"
  | "aspectRatio"
  | "attachMoney"
  | "avatar"
  | "bell"
  | "bolt"
  | "book"
  | "bookmark"
  | "brush"
  | "building"
  | "calendar"
  | "cancel"
  | "check"
  | "checkBox"
  | "checkBoxOutlineBlank"
  | "checkCircle"
  | "checkSmall"
  | "chevronDown"
  | "chevronLeft"
  | "chevronRight"
  | "chevronRightAlt"
  | "chevronUp"
  | "clock"
  | "close"
  | "cloud"
  | "cloudDone"
  | "cloudOff"
  | "code"
  | "codeOff"
  | "compass"
  | "contrast"
  | "copy"
  | "cropLandscape"
  | "cropPortrait"
  | "cropSquare"
  | "darkMode"
  | "database"
  | "delete"
  | "devices"
  | "docs"
  | "domain"
  | "download"
  | "draw"
  | "edit"
  | "encrypted"
  | "error"
  | "event"
  | "explore"
  | "extension"
  | "ExternalLink"
  | "favorite"
  | "features"
  | "filter"
  | "filterAlt"
  | "filterList"
  | "finance"
  | "flag"
  | "folder"
  | "folderOpen"
  | "formatBold"
  | "formatItalic"
  | "formatListBulleted"
  | "formatListNumbered"
  | "formatUnderlined"
  | "globe"
  | "grid"
  | "group"
  | "groups"
  | "headset"
  | "helpOutline"
  | "hideImage"
  | "home"
  | "hourglassEmpty"
  | "info"
  | "keyboard"
  | "label"
  | "language"
  | "layers"
  | "lightbulb"
  | "lightMode"
  | "link"
  | "locationOn"
  | "lock"
  | "mail"
  | "megaphone"
  | "menu"
  | "menuBook"
  | "mic"
  | "micOff"
  | "modeAuto"
  | "moreHoriz"
  | "moreVert"
  | "networkNode"
  | "newReleases"
  | "note"
  | "notes"
  | "openInNew"
  | "package"
  | "palette"
  | "pause"
  | "pauseCircle"
  | "person"
  | "personAlert"
  | "phone"
  | "photo"
  | "photoCamera"
  | "photoLibrary"
  | "picture"
  | "pin"
  | "place"
  | "play"
  | "playArrow"
  | "playCircle"
  | "plug"
  | "progressActivity"
  | "provisional"
  | "redo"
  | "refresh"
  | "remove"
  | "replay"
  | "rocketLaunch"
  | "route"
  | "scale"
  | "science"
  | "search"
  | "sell"
  | "send"
  | "settings"
  | "settingsAlt"
  | "share"
  | "share2"
  | "shield"
  | "shuffle"
  | "sideNav"
  | "skipNext"
  | "skipPrevious"
  | "sliders"
  | "star"
  | "stop"
  | "subdirectoryArrowRight"
  | "subtitles"
  | "sync"
  | "target"
  | "terminal"
  | "timeline"
  | "trendingDown"
  | "trendingFlat"
  | "trendingUp"
  | "undo"
  | "unlock"
  | "unpin"
  | "upload"
  | "users"
  | "verifiedUser"
  | "visibility"
  | "visibilityOff"
  | "volumeOff"
  | "volumeUp"
  | "warning"
  | "wifiOff"
  | "work";

/**
 * Augmentable interface for application-registered custom icons:
 * ```ts
 * declare module "@ghchinoy/lustrous-lit/components/lustrous-icon" {
 *   interface LustrousCustomIconMap {
 *     webhook: true;
 *   }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LustrousCustomIconMap {}

export type LustrousIconName = LustrousCoreIconName | Extract<keyof LustrousCustomIconMap, string> | (string & {});

export interface LustrousCustomIconDefinition {
  /** Inner SVG shape primitives on a `0 0 24 24` viewBox (drawn with `currentColor` stroke unless overridden). */
  readonly paths: SVGTemplateResult;
  /** Whether the icon should mirror horizontally in `dir="rtl"`. @default false */
  readonly directional?: boolean;
}

const customIcons = new Map<string, LustrousCustomIconDefinition>();
const customDirectionalIcons = new Set<string>();

/**
 * Registers custom icons into the Lustrous runtime icon registry so they work
 * seamlessly in `<lustrous-icon>`, `renderIcon()`, `<lustrous-button icon="...">`,
 * `<lustrous-sidebar-item icon="...">`, and all other Lustrous components.
 */
export function registerLustrousIcons(icons: Readonly<Record<string, LustrousCustomIconDefinition>>): void {
  for (const [name, def] of Object.entries(icons)) {
    customIcons.set(name, def);
    if (def.directional) customDirectionalIcons.add(name);
    else customDirectionalIcons.delete(name);
  }
}

/** Clears custom registered icons (intended for unit tests). */
export function clearCustomLustrousIcons(): void {
  customIcons.clear();
  customDirectionalIcons.clear();
}

function renderCorePaths(name: string): SVGTemplateResult {
  switch (name) {
    case "activity":
      return svg`<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />`;
    case "add":
      return svg`<line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />`;
    case "addImage":
      return svg`<path d="M19 11V5.5A2 2 0 0 0 17 3.5H5.5a2 2 0 0 0-2 2V17a2 2 0 0 0 2 2H11" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m3.5 15.5 4.5-4.5 3.5 3.5" /><path d="M17.5 14v6M14.5 17h6" />`;
    case "archive":
      return svg`<rect x="3.5" y="4" width="17" height="4.5" rx="1" /><path d="M5 8.5v10A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-10" /><path d="M10 12.5h4" />`;
    case "arrowBack":
      return svg`<line x1="19.5" y1="12" x2="5" y2="12" /><polyline points="11 6 5 12 11 18" />`;
    case "arrowCircleDown":
      return svg`<circle cx="12" cy="12" r="9" /><line x1="12" y1="7.5" x2="12" y2="16" /><polyline points="8.5 12.5 12 16 15.5 12.5" />`;
    case "arrowDownward":
      return svg`<line x1="12" y1="4.5" x2="12" y2="19" /><polyline points="6 13 12 19 18 13" />`;
    case "arrowDropDown":
      return svg`<polygon points="7.5 10 12 14.5 16.5 10" />`;
    case "arrowForward":
      return svg`<line x1="4.5" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" />`;
    case "arrowForwardIos":
      return svg`<polyline points="8 3.5 16.5 12 8 20.5" />`;
    case "arrowOutward":
    case "ExternalLink":
      return svg`<line x1="6.5" y1="17.5" x2="17.5" y2="6.5" /><polyline points="8 6.5 17.5 6.5 17.5 16" />`;
    case "arrowUpward":
      return svg`<line x1="12" y1="19.5" x2="12" y2="5" /><polyline points="6 11 12 5 18 11" />`;
    case "aspectRatio":
      return svg`<rect x="3" y="5" width="18" height="14" rx="2" /><polyline points="6.5 11.5 6.5 8.5 9.5 8.5" /><polyline points="17.5 12.5 17.5 15.5 14.5 15.5" />`;
    case "attachMoney":
      return svg`<path d="M12 3.5v17" /><path d="M16 7.5c-.6-1.4-2.1-2.3-4-2.3-2.4 0-4 1.3-4 3.1 0 4.2 8 2.3 8 6.6 0 1.8-1.7 3.1-4 3.1-2 0-3.6-1-4.2-2.6" />`;
    case "avatar":
    case "person":
      return svg`<circle cx="12" cy="8" r="4" /><path d="M4.5 20.5v-1a5 5 0 0 1 5-5h5a5 5 0 0 1 5 5v1" />`;
    case "bell":
      return svg`<path d="M18 8.5a6 6 0 0 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 14.5 18 8.5z" /><path d="M10 19a2 2 0 0 0 4 0" />`;
    case "bolt":
      return svg`<polygon points="13 3 5.5 13.5 11.5 13.5 10.5 21 18.5 10.5 12.5 10.5" />`;
    case "book":
      return svg`<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />`;
    case "bookmark":
      return svg`<path d="M6 4h12a1 1 0 0 1 1 1v15.5l-7-4-7 4V5a1 1 0 0 1 1-1z" />`;
    case "brush":
      return svg`<path d="M9.5 14.5 18.8 5.2a2.1 2.1 0 0 1 3 3L12.5 17.5" /><path d="M9.5 14.5a3.5 3.5 0 0 0-5 3.2c0 1.2-.8 2-1.5 2.3 1.4.5 3.2.5 4.5-.5a3.5 3.5 0 0 0 2-5z" />`;
    case "building":
      return svg`<rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3" />`;
    case "calendar":
    case "event":
      return svg`<rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 9.5h16M8.5 3v4M15.5 3v4" /><rect x="13" y="13" width="3.5" height="3.5" rx="0.5" />`;
    case "cancel":
      return svg`<circle cx="12" cy="12" r="9" /><line x1="9" y1="9" x2="15" y2="15" /><line x1="15" y1="9" x2="9" y2="15" />`;
    case "check":
      return svg`<polyline points="20 6 9 17 4 12" />`;
    case "checkBox":
      return svg`<rect x="4" y="4" width="16" height="16" rx="2.5" /><polyline points="8 12 11 15 16.5 9.5" />`;
    case "checkBoxOutlineBlank":
      return svg`<rect x="4" y="4" width="16" height="16" rx="2.5" />`;
    case "checkCircle":
      return svg`<circle cx="12" cy="12" r="9" /><polyline points="16 9.5 10.5 15 8 12.5" />`;
    case "checkSmall":
      return svg`<polyline points="17 8.5 10.5 15 7 11.5" />`;
    case "chevronDown":
      return svg`<polyline points="6 9 12 15 18 9" />`;
    case "chevronLeft":
      return svg`<polyline points="15 6 9 12 15 18" />`;
    case "chevronRight":
      return svg`<polyline points="9 6 15 12 9 18" />`;
    case "chevronRightAlt":
      return svg`<polyline points="10 7 15 12 10 17" />`;
    case "chevronUp":
      return svg`<polyline points="18 15 12 9 6 15" />`;
    case "clock":
      return svg`<circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 14" />`;
    case "close":
      return svg`<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />`;
    case "cloud":
      return svg`<path d="M7 18.5a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 9.5a4 4 0 0 1 0 9z" />`;
    case "cloudDone":
      return svg`<path d="M7 18.5a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 9.5a4 4 0 0 1 0 9z" /><polyline points="9.5 13.5 11.5 15.5 15 12" />`;
    case "cloudOff":
      return svg`<path d="M7 18.5a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 9.5a4 4 0 0 1 0 9z" /><line x1="4" y1="4" x2="20" y2="20" />`;
    case "code":
      return svg`<polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />`;
    case "codeOff":
      return svg`<polyline points="8 7 3 12 8 17" /><polyline points="16 7 21 12 16 17" /><line x1="4" y1="3" x2="20" y2="21" />`;
    case "compass":
    case "explore":
      return svg`<circle cx="12" cy="12" r="9" /><polygon points="16.2 7.8 14 14 7.8 16.2 10 10" />`;
    case "contrast":
      return svg`<circle cx="12" cy="12" r="8.5" /><path d="M12 3.5a8.5 8.5 0 0 0 0 17z" fill="currentColor" stroke="none" />`;
    case "copy":
      return svg`<rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />`;
    case "cropLandscape":
      return svg`<rect x="3.5" y="6" width="17" height="12" rx="2" />`;
    case "cropPortrait":
      return svg`<rect x="6" y="3.5" width="12" height="17" rx="2" />`;
    case "cropSquare":
      return svg`<rect x="4.5" y="4.5" width="15" height="15" rx="2" />`;
    case "darkMode":
      return svg`<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />`;
    case "database":
      return svg`<ellipse cx="12" cy="6" rx="7.5" ry="2.5" /><path d="M4.5 6v12c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5V6" /><path d="M4.5 12c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5" />`;
    case "delete":
      return svg`<polyline points="4.5 6.5 19.5 6.5" /><path d="M8.5 6.5V4.5a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v2" /><path d="M6.5 6.5l1 13a1.5 1.5 0 0 0 1.5 1.4h6a1.5 1.5 0 0 0 1.5-1.4l1-13" /><line x1="10" y1="11" x2="10" y2="16.5" /><line x1="14" y1="11" x2="14" y2="16.5" />`;
    case "devices":
      return svg`<path d="M4 16V6.5A1.5 1.5 0 0 1 5.5 5h12A1.5 1.5 0 0 1 19 6.5V8" /><path d="M2.5 19h11" /><rect x="16" y="10" width="5.5" height="9" rx="1.25" />`;
    case "docs":
      return svg`<rect x="4.5" y="3" width="15" height="18" rx="2" /><line x1="8" y1="8" x2="16" y2="8" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="8" y1="16" x2="13" y2="16" />`;
    case "domain":
      return svg`<path d="M3.5 20.5V4.5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v16" /><path d="M12.5 8.5h7a1 1 0 0 1 1 1v11" /><line x1="2.5" y1="20.5" x2="21.5" y2="20.5" /><path d="M7 7.5h2M7 11.5h2M7 15.5h2M15.5 12.5h2M15.5 16.5h2" />`;
    case "download":
      return svg`<line x1="12" y1="4" x2="12" y2="15.5" /><polyline points="7.5 11 12 15.5 16.5 11" /><path d="M5 15v3.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V15" />`;
    case "draw":
    case "edit":
      return svg`<path d="M4 20h4L18.5 9.5a2.12 2.12 0 0 0-3-3L5 17z" /><line x1="14" y1="8" x2="17" y2="11" />`;
    case "encrypted":
      return svg`<path d="M12 3 4.5 6v5.5c0 4.7 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.8 7.5-9.5V6z" /><rect x="9" y="11" width="6" height="5" rx="1" /><path d="M10 11V9.5a2 2 0 0 1 4 0V11" />`;
    case "error":
      return svg`<circle cx="12" cy="12" r="9" /><line x1="12" y1="7.5" x2="12" y2="12.75" /><circle cx="12" cy="16.25" r="0.85" fill="currentColor" stroke="none" />`;
    case "extension":
      return svg`<path d="M5 8.5a1.5 1.5 0 0 1 1.5-1.5H10V6a2 2 0 1 1 4 0v1h3.5A1.5 1.5 0 0 1 19 8.5V12h-1a2 2 0 1 0 0 4h1v3.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.5v-3.5h1a2 2 0 1 0 0-4H5z" />`;
    case "favorite":
      return svg`<path d="M12 20.2 4.9 13.4a4.8 4.8 0 0 1 6.8-6.8L12 6.9l.3-.3a4.8 4.8 0 0 1 6.8 6.8z" />`;
    case "features":
      return svg`<rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><circle cx="17" cy="7" r="3.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><path d="M17 13.5v7M13.5 17h7" />`;
    case "filter":
    case "filterAlt":
      return svg`<path d="M4 5h16l-6 7.5V19l-4-2v-4.5z" />`;
    case "filterList":
      return svg`<line x1="4" y1="7" x2="20" y2="7" /><line x1="7" y1="12" x2="17" y2="12" /><line x1="10" y1="17" x2="14" y2="17" />`;
    case "finance":
      return svg`<line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />`;
    case "flag":
      return svg`<path d="M5.5 21V4" /><path d="M5.5 4.5h11l-2 4 2 4h-11" />`;
    case "folder":
      return svg`<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />`;
    case "folderOpen":
      return svg`<path d="M3.5 18.5V6A1.5 1.5 0 0 1 5 4.5h4.5l2 2.5H19A1.5 1.5 0 0 1 20.5 8.5V10" /><path d="M3.5 18.5L6 11h16l-2.5 7.5z" />`;
    case "formatBold":
      return svg`<path d="M7.5 4.5h6a3.75 3.75 0 0 1 0 7.5h-6V4.5z" /><path d="M7.5 12h7a4 4 0 0 1 0 8h-7v-8z" />`;
    case "formatItalic":
      return svg`<line x1="10" y1="4.5" x2="18" y2="4.5" /><line x1="6" y1="19.5" x2="14" y2="19.5" /><line x1="14.5" y1="4.5" x2="9.5" y2="19.5" />`;
    case "formatListBulleted":
      return svg`<circle cx="5" cy="6.5" r="1.2" fill="currentColor" stroke="none" /><circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none" /><circle cx="5" cy="17.5" r="1.2" fill="currentColor" stroke="none" /><line x1="9.5" y1="6.5" x2="20" y2="6.5" /><line x1="9.5" y1="12" x2="20" y2="12" /><line x1="9.5" y1="17.5" x2="20" y2="17.5" />`;
    case "formatListNumbered":
      return svg`<line x1="10" y1="6.5" x2="20" y2="6.5" /><line x1="10" y1="12" x2="20" y2="12" /><line x1="10" y1="17.5" x2="20" y2="17.5" /><path d="M4.5 5.2h1.3v3.6M4.3 8.8h2" /><path d="M4.2 10.8h2a1 1 0 0 1 0 1.6l-2 1.6h2.3" /><path d="M4.2 16h2a.9.9 0 0 1 0 1.5.9.9 0 0 1 0 1.5h-2" />`;
    case "formatUnderlined":
      return svg`<path d="M7 4.5v6.5a5 5 0 0 0 10 0V4.5" /><line x1="5" y1="19.5" x2="19" y2="19.5" />`;
    case "globe":
    case "language":
      return svg`<circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17" /><path d="M12 3.5c2.3 2.4 3.5 5.2 3.5 8.5s-1.2 6.1-3.5 8.5c-2.3-2.4-3.5-5.2-3.5-8.5s1.2-6.1 3.5-8.5z" />`;
    case "grid":
      return svg`<rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" />`;
    case "group":
    case "users":
      return svg`<circle cx="9" cy="8.5" r="3.5" /><path d="M2.5 20v-1a5 5 0 0 1 5-5h3a5 5 0 0 1 5 5v1" /><path d="M15.5 5.2a3.5 3.5 0 0 1 0 6.6" /><path d="M18.5 14.3a5 5 0 0 1 3 4.7v1" />`;
    case "groups":
      return svg`<circle cx="12" cy="7.5" r="2.75" /><path d="M7.5 19v-1.5a4.5 4.5 0 0 1 9 0V19" /><circle cx="5.5" cy="9.5" r="2" /><path d="M2.5 19v-1a3 3 0 0 1 3-3" /><circle cx="18.5" cy="9.5" r="2" /><path d="M21.5 19v-1a3 3 0 0 0-3-3" />`;
    case "headset":
      return svg`<path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />`;
    case "helpOutline":
      return svg`<circle cx="12" cy="12" r="9" /><path d="M9.6 9.6a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .9-1 1.6v.4" /><circle cx="12" cy="16.75" r="0.85" fill="currentColor" stroke="none" />`;
    case "hideImage":
      return svg`<path d="M20.5 16.5V6a2 2 0 0 0-2-2H8" /><path d="M4.5 4.9A2 2 0 0 0 3.5 6.7V18a2 2 0 0 0 2 2h11.3a2 2 0 0 0 1.8-1" /><path d="M3.5 16l4.5-4.5 3 3" /><line x1="3" y1="3" x2="21" y2="21" />`;
    case "home":
      return svg`<path d="M4 10.5 12 3.5l8 7V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" />`;
    case "hourglassEmpty":
      return svg`<path d="M7 3.5h10M7 20.5h10" /><path d="M8 3.5v3a4 4 0 0 0 1.6 3.2L12 12l2.4-2.3A4 4 0 0 0 16 6.5v-3" /><path d="M8 20.5v-3a4 4 0 0 1 1.6-3.2L12 12l2.4 2.3a4 4 0 0 1 1.6 3.2v3" />`;
    case "info":
      return svg`<circle cx="12" cy="12" r="9" /><line x1="12" y1="16" x2="12" y2="11.5" /><circle cx="12" cy="8.25" r="0.85" fill="currentColor" stroke="none" />`;
    case "keyboard":
      return svg`<rect x="2.5" y="5.5" width="19" height="13" rx="2" /><path d="M6.5 9.5h1M10 9.5h1M13.5 9.5h1M17 9.5h.5M6.5 12.5h1M10 12.5h1M13.5 12.5h1M17 12.5h.5M8 15.5h8" />`;
    case "label":
      return svg`<path d="M3.5 7A1.5 1.5 0 0 1 5 5.5h10a1.5 1.5 0 0 1 1.2.6l4.3 5.9-4.3 5.9a1.5 1.5 0 0 1-1.2.6H5A1.5 1.5 0 0 1 3.5 17z" />`;
    case "layers":
      return svg`<polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 12 12 17 22 12" /><polyline points="2 17 12 22 22 17" />`;
    case "lightbulb":
      return svg`<path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.2v.5h5V16c0-.8.4-1.6 1.1-2.2A6 6 0 0 0 12 3z" />`;
    case "lightMode":
      return svg`<circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />`;
    case "link":
      return svg`<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />`;
    case "locationOn":
    case "place":
      return svg`<path d="M12 21.5s-6.5-6.2-6.5-11.5a6.5 6.5 0 0 1 13 0c0 5.3-6.5 11.5-6.5 11.5z" /><circle cx="12" cy="10" r="2.5" />`;
    case "lock":
      return svg`<rect x="5" y="10.5" width="14" height="10" rx="2" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /><circle cx="12" cy="15.5" r="1" fill="currentColor" stroke="none" />`;
    case "mail":
      return svg`<rect x="3" y="5" width="18" height="14" rx="2" /><polyline points="3.5 6 12 12.5 20.5 6" />`;
    case "megaphone":
      return svg`<path d="m3 11 18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />`;
    case "menu":
      return svg`<line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" />`;
    case "menuBook":
      return svg`<path d="M12 6.5C10.5 5.3 8.3 4.5 6 4.5c-1.1 0-2.1.2-3 .5v13c.9-.3 1.9-.5 3-.5 2.3 0 4.5.8 6 2" /><path d="M12 6.5c1.5-1.2 3.7-2 6-2 1.1 0 2.1.2 3 .5v13c-.9-.3-1.9-.5-3-.5-2.3 0-4.5.8-6 2V6.5z" />`;
    case "mic":
      return svg`<rect x="9" y="3" width="6" height="11.5" rx="3" /><path d="M6 11.5a6 6 0 0 0 12 0" /><path d="M12 17.5V21" />`;
    case "micOff":
      return svg`<path d="M15 10.5V6a3 3 0 0 0-5.6-1.5" /><path d="M9 9v2.5a3 3 0 0 0 4.6 2.5" /><path d="M18 11.5a6 6 0 0 1-.7 2.8M6 11.5a6 6 0 0 0 9.4 4.9" /><path d="M12 17.5V21" /><line x1="4" y1="4" x2="20" y2="20" />`;
    case "modeAuto":
      return svg`<circle cx="12" cy="12" r="8.5" /><path d="M9 16l3-8 3 8" /><line x1="10" y1="13.5" x2="14" y2="13.5" />`;
    case "moreHoriz":
      return svg`<circle cx="5.5" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="18.5" cy="12" r="1.4" fill="currentColor" stroke="none" />`;
    case "moreVert":
      return svg`<circle cx="12" cy="5.5" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="18.5" r="1.4" fill="currentColor" stroke="none" />`;
    case "networkNode":
      return svg`<circle cx="18" cy="5" r="2.75" /><circle cx="6" cy="12" r="2.75" /><circle cx="18" cy="19" r="2.75" /><line x1="8.5" y1="13.4" x2="15.5" y2="17.6" /><line x1="15.5" y1="6.4" x2="8.5" y2="10.6" />`;
    case "newReleases":
      return svg`<polygon points="12 2.5 14.7 4.7 18.2 4.3 19.3 7.7 21.5 10.3 20.1 13.5 21.1 16.9 17.8 18.3 16.4 21.5 12.9 20.5 9.7 21.5 7.1 19.3 3.7 18.2 4.3 14.7 2.5 12 4.7 9.3 4.3 5.8 7.7 4.7 9.7 2.5 12 4.2" /><line x1="12" y1="8" x2="12" y2="13" /><circle cx="12" cy="16" r="0.95" fill="currentColor" stroke="none" />`;
    case "note":
      return svg`<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="13" y2="17" />`;
    case "notes":
      return svg`<line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="14" y2="17" />`;
    case "openInNew":
      return svg`<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />`;
    case "package":
      return svg`<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.3 7 12 12 20.7 7" /><line x1="12" y1="22" x2="12" y2="12" />`;
    case "palette":
      return svg`<path d="M12 3a9 9 0 0 0 0 18 1.8 1.8 0 0 0 1.8-1.8c0-.5-.2-.9-.5-1.2-.3-.3-.4-.7-.4-1.1a1.8 1.8 0 0 1 1.8-1.8H16a5 5 0 0 0 5-5c0-4-4-7.1-9-7.1z" /><circle cx="7.5" cy="11.5" r="1.1" fill="currentColor" stroke="none" /><circle cx="10" cy="7.5" r="1.1" fill="currentColor" stroke="none" /><circle cx="14.5" cy="7.5" r="1.1" fill="currentColor" stroke="none" /><circle cx="16.8" cy="11" r="1.1" fill="currentColor" stroke="none" />`;
    case "pause":
      return svg`<line x1="9" y1="6" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="18" />`;
    case "pauseCircle":
      return svg`<circle cx="12" cy="12" r="9" /><line x1="10" y1="9" x2="10" y2="15" /><line x1="14" y1="9" x2="14" y2="15" />`;
    case "personAlert":
      return svg`<circle cx="9.5" cy="8" r="3.75" /><path d="M3 20v-1a4.75 4.75 0 0 1 4.75-4.75h3.5A4.75 4.75 0 0 1 16 19v1" /><line x1="19.5" y1="7.5" x2="19.5" y2="12.5" /><circle cx="19.5" cy="15.75" r="0.95" fill="currentColor" stroke="none" />`;
    case "phone":
      return svg`<path d="M5 4h3.5l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5l1.5-2 4 1.5V19a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4z" />`;
    case "photo":
    case "picture":
      return svg`<rect x="3.5" y="3.5" width="17" height="17" rx="2.5" /><circle cx="9" cy="9" r="1.75" /><path d="m3.5 17 5-5 4 4 2.5-2.5 5.5 5.5" />`;
    case "photoCamera":
      return svg`<path d="M20.5 19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V8.5A1.5 1.5 0 0 1 5 7h2.5L9 4.5h6L16.5 7H19a1.5 1.5 0 0 1 1.5 1.5z" /><circle cx="12" cy="13.5" r="3.5" />`;
    case "photoLibrary":
      return svg`<rect x="7" y="3.5" width="13.5" height="13.5" rx="2" /><path d="M3.5 7.5V19A1.5 1.5 0 0 0 5 20.5h11.5" /><path d="m9.5 14 3-3.5 2.5 2.8 2-2.3 2 3" />`;
    case "pin":
      return svg`<path d="M9 3.5h6l-1 5.5 3.5 3.5v1.5h-11V12.5L10 9z" /><line x1="12" y1="14" x2="12" y2="20.5" />`;
    case "play":
    case "playArrow":
      return svg`<path d="M8 5.5v13a1 1 0 0 0 1.5.86l10-6.5a1 1 0 0 0 0-1.72l-10-6.5A1 1 0 0 0 8 5.5z" />`;
    case "playCircle":
      return svg`<circle cx="12" cy="12" r="9" /><path d="M10 8.5v7l5.5-3.5z" />`;
    case "plug":
      return svg`<path d="M12 22v-5M9 8V2M15 8V2" /><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" />`;
    case "progressActivity":
      return svg`<path d="M21 12a9 9 0 1 1-9-9" />`;
    case "provisional":
      return svg`<circle cx="12" cy="12" r="8.5" /><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" stroke="none" />`;
    case "redo":
      return svg`<polyline points="16 5 20 9 16 13" /><path d="M20 9H10a5.5 5.5 0 0 0 0 11h5" />`;
    case "refresh":
      return svg`<polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />`;
    case "remove":
      return svg`<line x1="5" y1="12" x2="19" y2="12" />`;
    case "replay":
      return svg`<polyline points="12.5 2.5 9 5.5 12.5 8.5" /><path d="M9 5.5h3a7 7 0 1 1-6.5 4.4" />`;
    case "rocketLaunch":
      return svg`<path d="M14.5 9.5c3-3 5.5-5.5 5.5-5.5s-2.5 2.5-5.5 5.5" /><path d="M12 15 9 12c2.2-4.5 6-7.5 11-8-.5 5-3.5 8.8-8 11z" /><path d="M9 12 5.5 13 4 15.5l3.5.5M12 15l-1 3.5-2.5 1.5-.5-3.5" /><path d="M5.5 18.5c-1 1-1.5 2-1.5 2s1-.5 2-1.5" />`;
    case "route":
      return svg`<circle cx="6" cy="18.5" r="2.5" /><circle cx="18" cy="5.5" r="2.5" /><path d="M8.5 18.5H16a3 3 0 0 0 0-6.5H8a3 3 0 0 1 0-6.5h7.5" />`;
    case "scale":
      return svg`<line x1="12" y1="3" x2="12" y2="21" /><path d="M5 7h14" /><path d="M5 7 2.5 13h5L5 7Z" /><path d="M19 7l-2.5 6h5L19 7Z" /><line x1="8" y1="21" x2="16" y2="21" />`;
    case "science":
      return svg`<path d="M9.5 3.5h5M10.5 3.5v6L5.2 18.2A1.5 1.5 0 0 0 6.5 20.5h11a1.5 1.5 0 0 0 1.3-2.3L13.5 9.5v-6" /><path d="M7.5 15h9" />`;
    case "search":
      return svg`<circle cx="11" cy="11" r="7" /><line x1="20" y1="20" x2="16" y2="16" />`;
    case "sell":
      return svg`<path d="M3.5 12.6V4.5a1 1 0 0 1 1-1h8.1a1 1 0 0 1 .7.3l7.4 7.4a1 1 0 0 1 0 1.4l-8.1 8.1a1 1 0 0 1-1.4 0l-7.4-7.4a1 1 0 0 1-.3-.7z" /><circle cx="8" cy="8" r="1.5" />`;
    case "send":
      return svg`<path d="M3.5 19.5 20.5 12 3.5 4.5 6.5 12z" /><line x1="6.5" y1="12" x2="13.5" y2="12" />`;
    case "settings":
    case "settingsAlt":
      return svg`<circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.77 1.02 1.51 1H21a2 2 0 1 1 0 4h-.09c-.74.02-1.25.44-1.51 1z" />`;
    case "share":
      return svg`<circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="12" cy="18" r="2.5" /><path d="M8.5 6h7M7.3 8.2l3.4 7.6M16.7 8.2l-3.4 7.6" />`;
    case "share2":
      return svg`<path d="M12 15V3.5" /><polyline points="7.5 8 12 3.5 16.5 8" /><path d="M7 11H6a1.5 1.5 0 0 0-1.5 1.5v6A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5v-6A1.5 1.5 0 0 0 18 11h-1" />`;
    case "shield":
      return svg`<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />`;
    case "shuffle":
      return svg`<polyline points="16 4 20 4 20 8" /><line x1="4" y1="20" x2="20" y2="4" /><polyline points="20 16 20 20 16 20" /><line x1="14.5" y1="14.5" x2="20" y2="20" /><line x1="4" y1="4" x2="9.5" y2="9.5" />`;
    case "sideNav":
      return svg`<rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><line x1="9.5" y1="4.5" x2="9.5" y2="19.5" />`;
    case "skipNext":
      return svg`<polygon points="5.5 6 14.5 12 5.5 18" /><line x1="18" y1="6" x2="18" y2="18" />`;
    case "skipPrevious":
      return svg`<line x1="6" y1="6" x2="6" y2="18" /><polygon points="18.5 6 9.5 12 18.5 18" />`;
    case "sliders":
      return svg`<line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /><circle cx="9" cy="6" r="2" fill="var(--lustrous-color-surface-bright)" /><circle cx="15" cy="12" r="2" fill="var(--lustrous-color-surface-bright)" /><circle cx="10" cy="18" r="2" fill="var(--lustrous-color-surface-bright)" />`;
    case "star":
      return svg`<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />`;
    case "stop":
      return svg`<rect x="6" y="6" width="12" height="12" rx="2" />`;
    case "subdirectoryArrowRight":
      return svg`<path d="M6 4v8.5a2.5 2.5 0 0 0 2.5 2.5H19" /><polyline points="15 11 19 15 15 19" />`;
    case "subtitles":
      return svg`<rect x="3.5" y="5" width="17" height="14" rx="2.5" /><path d="M7 12.5h3M12.5 12.5H17M7 16h7M16.5 16h.5" />`;
    case "sync":
      return svg`<path d="M19.5 12a7.5 7.5 0 0 1-12.9 5.2" /><path d="M4.5 12a7.5 7.5 0 0 1 12.9-5.2" /><polyline points="17.5 3 17.5 7 13.5 7" /><polyline points="6.5 21 6.5 17 10.5 17" />`;
    case "target":
      return svg`<circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.25" fill="currentColor" />`;
    case "terminal":
      return svg`<rect x="3" y="4" width="18" height="16" rx="2.5" /><path d="m7.5 9.5 3 2.5-3 2.5" /><path d="M12.5 14.5h4" />`;
    case "timeline":
      return svg`<circle cx="4.5" cy="16.5" r="1.75" /><circle cx="9.5" cy="11" r="1.75" /><circle cx="14.5" cy="15" r="1.75" /><circle cx="19.5" cy="8" r="1.75" /><line x1="5.7" y1="15.2" x2="8.3" y2="12.3" /><line x1="10.9" y1="12.1" x2="13.1" y2="13.9" /><line x1="15.5" y1="13.6" x2="18.5" y2="9.4" />`;
    case "trendingDown":
      return svg`<polyline points="3 7 9.5 13.5 13.5 9.5 21 17" /><polyline points="15 17 21 17 21 11" />`;
    case "trendingFlat":
      return svg`<line x1="3" y1="12" x2="20" y2="12" /><polyline points="16 8 20 12 16 16" />`;
    case "trendingUp":
      return svg`<polyline points="3 17 9.5 10.5 13.5 14.5 21 7" /><polyline points="15 7 21 7 21 13" />`;
    case "undo":
      return svg`<polyline points="8 5 4 9 8 13" /><path d="M4 9h10a5.5 5.5 0 0 1 0 11H9" />`;
    case "unlock":
      return svg`<rect x="5" y="10.5" width="14" height="10" rx="2" /><path d="M8 10.5V7.5a4 4 0 0 1 7.6-1.8" /><circle cx="12" cy="15.5" r="1" fill="currentColor" stroke="none" />`;
    case "unpin":
      return svg`<path d="M9 3.5h6l-1 5.5 3.5 3.5v1.5h-11V12.5L10 9z" /><line x1="12" y1="14" x2="12" y2="20.5" /><line x1="4" y1="4" x2="20" y2="20" />`;
    case "upload":
      return svg`<line x1="12" y1="15.5" x2="12" y2="4" /><polyline points="7.5 8.5 12 4 16.5 8.5" /><path d="M5 15v3.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V15" />`;
    case "verifiedUser":
      return svg`<path d="M12 3 4.5 6v5.5c0 4.7 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.8 7.5-9.5V6z" /><polyline points="8.5 12 11 14.5 15.5 10" />`;
    case "visibility":
      return svg`<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />`;
    case "visibilityOff":
      return svg`<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /><line x1="4" y1="4" x2="20" y2="20" />`;
    case "volumeOff":
      return svg`<path d="M4 9.5v5h3.5L12 19V5L7.5 9.5z" /><path d="m16 9.5 5 5M21 9.5l-5 5" />`;
    case "volumeUp":
      return svg`<path d="M4 9.5v5h3.5L12 19V5L7.5 9.5z" /><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />`;
    case "warning":
      return svg`<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><circle cx="12" cy="17" r="0.85" fill="currentColor" stroke="none" />`;
    case "wifiOff":
      return svg`<path d="M2.5 9a15 15 0 0 1 19 0M6 12.5a10 10 0 0 1 12 0M9.5 16a5 5 0 0 1 5 0" /><circle cx="12" cy="19.25" r="1" fill="currentColor" stroke="none" /><line x1="4" y1="4" x2="20" y2="20" />`;
    case "work":
      return svg`<rect x="3.5" y="7.5" width="17" height="12" rx="2" /><path d="M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5M3.5 12.5h17" />`;
    default:
      return svg`<circle cx="12" cy="12" r="8" />`;
  }
}

/** Built-in core icon names for docs, Storybook pickers, and tests. */
export const LUSTROUS_ICON_NAMES: readonly LustrousCoreIconName[] = [
  "activity", "add", "addImage", "archive", "arrowBack", "arrowCircleDown", "arrowDownward",
  "arrowDropDown", "arrowForward", "arrowForwardIos", "arrowOutward", "arrowUpward", "aspectRatio",
  "attachMoney", "avatar", "bell", "bolt", "book", "bookmark", "brush", "building", "calendar",
  "cancel", "check", "checkBox", "checkBoxOutlineBlank", "checkCircle", "checkSmall", "chevronDown",
  "chevronLeft", "chevronRight", "chevronRightAlt", "chevronUp", "clock", "close", "cloud",
  "cloudDone", "cloudOff", "code", "codeOff", "compass", "contrast", "copy", "cropLandscape",
  "cropPortrait", "cropSquare", "darkMode", "database", "delete", "devices", "docs", "domain",
  "download", "draw", "edit", "encrypted", "error", "event", "explore", "extension", "favorite",
  "features", "filter", "filterAlt", "filterList", "finance", "flag", "folder", "folderOpen",
  "formatBold", "formatItalic", "formatListBulleted", "formatListNumbered", "formatUnderlined",
  "globe", "grid", "group", "groups", "headset", "helpOutline", "hideImage", "home",
  "hourglassEmpty", "info", "keyboard", "label", "language", "layers", "lightbulb", "lightMode",
  "link", "locationOn", "lock", "mail", "megaphone", "menu", "menuBook", "mic", "micOff",
  "modeAuto", "moreHoriz", "moreVert", "networkNode", "newReleases", "note", "notes", "openInNew",
  "package", "palette", "pause", "pauseCircle", "person", "personAlert", "phone", "photo",
  "photoCamera", "photoLibrary", "picture", "pin", "place", "play", "playArrow", "playCircle",
  "plug", "progressActivity", "provisional", "redo", "refresh", "remove", "replay", "rocketLaunch",
  "route", "scale", "science", "search", "sell", "send", "settings", "settingsAlt", "share",
  "share2", "shield", "shuffle", "sideNav", "skipNext", "skipPrevious", "sliders", "star", "stop",
  "subdirectoryArrowRight", "subtitles", "sync", "target", "terminal", "timeline", "trendingDown",
  "trendingFlat", "trendingUp", "undo", "unlock", "unpin", "upload", "users", "verifiedUser",
  "visibility", "visibilityOff", "volumeOff", "volumeUp", "warning", "wifiOff", "work",
];

/** Icons that point in the reading direction and mirror automatically in RTL. */
export const LUSTROUS_DIRECTIONAL_ICONS: ReadonlySet<string> = new Set<string>([
  "arrowForward",
  "arrowBack",
  "chevronLeft",
  "chevronRight",
  "chevronRightAlt",
  "arrowForwardIos",
  "subdirectoryArrowRight",
  "sideNav",
  "send",
  "redo",
  "undo",
]);

function isDirectional(name: string): boolean {
  return customIcons.has(name) ? customDirectionalIcons.has(name) : LUSTROUS_DIRECTIONAL_ICONS.has(name);
}

/**
 * Renders an inline `<svg class="lustrous-icon">` with no wrapper element.
 * Decorative (`aria-hidden="true"`) unless `label` is provided (`role="img"`).
 */
export function renderIcon(name: LustrousIconName, size: LustrousIconSize | number = "s", label?: string): SVGTemplateResult {
  const px = typeof size === "number" ? size : iconSizes[size];
  const stroke = iconStrokes[typeof size === "number" ? nearestSize(size) : size];
  const custom = customIcons.get(name);
  return svg`
    <svg
      class=${isDirectional(name) ? "lustrous-icon lustrous-icon-directional" : "lustrous-icon"}
      width=${px}
      height=${px}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width=${stroke}
      stroke-linecap="round"
      stroke-linejoin="round"
      role=${label ? "img" : nothing}
      aria-label=${label || nothing}
      aria-hidden=${label ? nothing : "true"}
    >
      ${custom ? custom.paths : renderCorePaths(name)}
    </svg>
  `;
}

export type LustrousIconTone = "default" | "error" | "positive" | "warning" | "primary" | "tertiary";

/** Shared `:host([tone])` / `:host([muted])` rules for `lustrous-icon` and `lustrous-chevron-icon`. */
export const lustrousIconToneStyles = css`
  :host([muted]) {
    color: var(--lustrous-text-muted);
  }
  :host([tone="error"]) {
    color: var(--lustrous-color-error);
  }
  :host([tone="positive"]) {
    color: var(--lustrous-color-positive);
  }
  :host([tone="warning"]) {
    color: var(--lustrous-color-warning);
  }
  :host([tone="primary"]) {
    color: var(--lustrous-color-primary);
  }
  :host([tone="tertiary"]) {
    color: var(--lustrous-color-tertiary);
  }
`;

/**
 * `<lustrous-icon>` — Monochrome vector icon element. Inherits `currentColor`,
 * scales stroke weight by size, mirrors directional icons in RTL, and supports
 * custom icons registered via `registerLustrousIcons()`.
 */
@customElement("lustrous-icon")
export class LustrousIcon extends LustrousElement {
  static override styles = [
    lustrousIconStyles,
    css`
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: inherit;
        line-height: 0;
        flex-shrink: 0;
        pointer-events: none;
      }
      svg.lustrous-icon {
        vertical-align: 0;
      }
    `,
    lustrousIconToneStyles,
  ];

  @property({ reflect: true }) name: LustrousIconName = "bolt";
  @property({ reflect: true }) tone?: LustrousIconTone;
  @property({ type: Boolean, reflect: true }) muted = false;
  @property({ reflect: true }) size: LustrousIconSize = "s";
  @property() label = "";

  protected override render() {
    return html`${renderIcon(this.name, this.size, this.label || undefined)}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lustrous-icon": LustrousIcon;
  }
}
