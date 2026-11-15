import type { ReactiveController, ReactiveControllerHost } from "lit";

/**
 * Declarative shortcut binding string (e.g. `"Mod+Shift+O"`, `"Shift+Escape"`, `"Mod+/"`)
 * or ordered list of binding strings where the first entry is the primary display chord
 * (e.g. `["Mod+Shift+K", "Mod+K", "Meta+K"]`).
 */
export type LustrousShortcutKeyInput = string | readonly string[];
export type ShortcutKeyInput = LustrousShortcutKeyInput;

/** Parsed representation of a single shortcut chord string. */
export interface LustrousParsedShortcutChord {
  readonly key: string;
  readonly displayKey: string;
  readonly ariaKey: string;
  readonly mod: boolean;
  readonly meta: boolean;
  readonly ctrl: boolean;
  readonly shift: boolean;
  readonly alt: boolean;
  readonly ignoreShift: boolean;
}
export type ParsedShortcutChord = LustrousParsedShortcutChord;

interface NormalizedKeyEntry {
  readonly key: string;
  readonly displayKey: string;
  readonly ariaKey: string;
}

const KEY_ALIASES: Readonly<Record<string, NormalizedKeyEntry>> = {
  esc: { key: "escape", displayKey: "Esc", ariaKey: "Escape" },
  escape: { key: "escape", displayKey: "Esc", ariaKey: "Escape" },
  enter: { key: "enter", displayKey: "Enter", ariaKey: "Enter" },
  return: { key: "enter", displayKey: "Enter", ariaKey: "Enter" },
  space: { key: " ", displayKey: "Space", ariaKey: "Space" },
  tab: { key: "tab", displayKey: "Tab", ariaKey: "Tab" },
  backspace: { key: "backspace", displayKey: "Backspace", ariaKey: "Backspace" },
  delete: { key: "delete", displayKey: "Delete", ariaKey: "Delete" },
  left: { key: "arrowleft", displayKey: "←", ariaKey: "ArrowLeft" },
  arrowleft: { key: "arrowleft", displayKey: "←", ariaKey: "ArrowLeft" },
  right: { key: "arrowright", displayKey: "→", ariaKey: "ArrowRight" },
  arrowright: { key: "arrowright", displayKey: "→", ariaKey: "ArrowRight" },
  up: { key: "arrowup", displayKey: "↑", ariaKey: "ArrowUp" },
  arrowup: { key: "arrowup", displayKey: "↑", ariaKey: "ArrowUp" },
  down: { key: "arrowdown", displayKey: "↓", ariaKey: "ArrowDown" },
  arrowdown: { key: "arrowdown", displayKey: "↓", ariaKey: "ArrowDown" },
};

/** Whether the current browser runs on macOS, where `Mod` maps to Cmd (`metaKey`). */
export function isMacPlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  return /mac/iu.test(navigator.userAgent);
}

/**
 * Wraps `text` in Unicode first-strong isolate marks (FSI … PDI) so shortcut strings
 * keep their own direction inside right-to-left labels.
 */
export function isolateBidi(text: string): string {
  return `\u2068${text}\u2069`;
}

/** Formats a control label with its shortcut hint, such as `Search (⇧⌘K)`. */
export function formatShortcutHint(label: string, shortcut: string): string {
  return `${label} (${isolateBidi(shortcut)})`;
}

function splitChordTokens(chordStr: string): readonly string[] {
  const trimmed = chordStr.trim();
  if (!trimmed) return [];
  const tokens: string[] = [];
  let current = "";
  for (let i = 0; i < trimmed.length; i += 1) {
    const ch = trimmed[i] ?? "";
    if (ch === "+" && current.length > 0 && i < trimmed.length - 1) {
      tokens.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.length > 0) tokens.push(current.trim());
  return tokens;
}

/** Parses a single shortcut chord string (such as `"Mod+Shift+O"` or `"Mod+/"`) into a normalized descriptor. */
export function parseShortcutChord(chordStr: string): LustrousParsedShortcutChord {
  const tokens = splitChordTokens(chordStr);
  let mod = false;
  let meta = false;
  let ctrl = false;
  let shift = false;
  let alt = false;
  let key = "";
  let displayKey = "";
  let ariaKey = "";

  for (const rawToken of tokens) {
    const lower = rawToken.toLowerCase();
    if (lower === "mod") {
      mod = true;
    } else if (lower === "meta" || lower === "cmd" || lower === "command") {
      meta = true;
    } else if (lower === "ctrl" || lower === "control") {
      ctrl = true;
    } else if (lower === "shift") {
      shift = true;
    } else if (lower === "alt" || lower === "option" || lower === "opt") {
      alt = true;
    } else {
      const alias = KEY_ALIASES[lower];
      if (alias) {
        key = alias.key;
        displayKey = alias.displayKey;
        ariaKey = alias.ariaKey;
      } else if (rawToken.length === 1) {
        key = rawToken.toLowerCase();
        displayKey = rawToken.toUpperCase();
        ariaKey = rawToken.toUpperCase();
      } else {
        key = lower;
        displayKey = rawToken;
        ariaKey = rawToken;
      }
    }
  }

  const isPunctuationSingleChar = key.length === 1 && !/^[a-z0-9]$/i.test(key);
  const ignoreShift = !shift && isPunctuationSingleChar;

  return { key, displayKey, ariaKey, mod, meta, ctrl, shift, alt, ignoreShift };
}

export function normalizeShortcutChords(keys: LustrousShortcutKeyInput): readonly LustrousParsedShortcutChord[] {
  const list = typeof keys === "string" ? [keys] : keys;
  const parsed: LustrousParsedShortcutChord[] = [];
  for (const item of list) {
    const chord = parseShortcutChord(item);
    if (chord.key) parsed.push(chord);
  }
  return parsed;
}

function matchesKeyByCode(code: string | undefined, targetKey: string): boolean {
  if (!code || targetKey.length !== 1) return false;
  if (code.length === 4 && code.startsWith("Key")) {
    return code.slice(3).toLowerCase() === targetKey;
  }
  if (code.length === 6 && code.startsWith("Digit")) {
    return code.slice(5) === targetKey;
  }
  return false;
}

export function matchesParsedChord(
  event: KeyboardEvent,
  chord: LustrousParsedShortcutChord,
  isMac: boolean,
): boolean {
  if (!chord.key || typeof event.key !== "string") return false;
  const keyMatches = chord.ignoreShift
    ? event.key === chord.key
    : event.key.toLowerCase() === chord.key || matchesKeyByCode(event.code, chord.key);
  if (!keyMatches) return false;
  const expectedMeta = chord.meta || (isMac && chord.mod);
  const expectedCtrl = chord.ctrl || (!isMac && chord.mod);
  return (
    event.metaKey === expectedMeta &&
    event.ctrlKey === expectedCtrl &&
    (chord.ignoreShift || event.shiftKey === chord.shift) &&
    event.altKey === chord.alt
  );
}

/** Returns whether `event` matches any of the shortcut chords in `keys` on the current platform. */
export function matchesShortcut(
  event: KeyboardEvent,
  keys: LustrousShortcutKeyInput,
  isMac: boolean = isMacPlatform(),
): boolean {
  if (typeof event.key !== "string") return false;
  const chords = normalizeShortcutChords(keys);
  for (const chord of chords) {
    if (matchesParsedChord(event, chord, isMac)) return true;
  }
  return false;
}

/**
 * Returns individual key labels for the primary shortcut chord in platform display order
 * (`⌃ ⌥ ⇧ ⌘` on macOS, `Ctrl Alt Shift Meta` elsewhere), suitable for `<lustrous-kbd .keys=${...}>`.
 */
export function getShortcutKeyLabels(
  keys: LustrousShortcutKeyInput,
  isMac: boolean = isMacPlatform(),
): readonly string[] {
  const primaryStr = typeof keys === "string" ? keys : (keys[0] ?? "");
  const chord = parseShortcutChord(primaryStr);
  if (!chord.key) return [];
  const hasCtrl = chord.ctrl || (!isMac && chord.mod);
  const hasAlt = chord.alt;
  const hasShift = chord.shift;
  const hasMeta = chord.meta || (isMac && chord.mod);

  const labels: string[] = [];
  if (hasCtrl) labels.push(isMac ? "⌃" : "Ctrl");
  if (hasAlt) labels.push(isMac ? "⌥" : "Alt");
  if (hasShift) labels.push(isMac ? "⇧" : "Shift");
  if (hasMeta) labels.push(isMac ? "⌘" : "Meta");
  labels.push(chord.displayKey);
  return labels;
}

/** Formats the primary shortcut chord into a compact human-readable string (`"⇧⌘O"` or `"Ctrl+Shift+O"`). */
export function formatShortcut(
  keys: LustrousShortcutKeyInput,
  isMac: boolean = isMacPlatform(),
): string {
  const labels = getShortcutKeyLabels(keys, isMac);
  if (labels.length === 0) return "";
  return isMac ? labels.join("") : labels.join("+");
}

/** Formats `keys` into a space-separated W3C `aria-keyshortcuts` attribute string. */
export function getAriaKeyShortcuts(
  keys: LustrousShortcutKeyInput,
  isMac: boolean = isMacPlatform(),
): string {
  const chords = normalizeShortcutChords(keys);
  const hasModChord = chords.some((chord) => chord.mod);
  const tokens: string[] = [];

  for (const chord of chords) {
    if (!isMac && hasModChord && chord.meta && !chord.mod && !chord.ctrl) continue;
    const parts: string[] = [];
    const hasCtrl = chord.ctrl || (!isMac && chord.mod);
    const hasMeta = chord.meta || (isMac && chord.mod);
    if (hasCtrl) parts.push("Control");
    if (hasMeta) parts.push("Meta");
    if (chord.alt) parts.push("Alt");
    if (chord.shift) parts.push("Shift");
    parts.push(chord.ariaKey);
    const token = parts.join("+");
    if (!tokens.includes(token)) tokens.push(token);
  }

  return tokens.join(" ");
}

export const ROOT_SCOPE_ID = "root";
export const LUSTROUS_SHORTCUT_SCOPE_ATTR = "data-lustrous-shortcut-scope";

type ScopeIdSource = string | (() => string);

interface ActiveScopeEntry {
  readonly id: string;
  readonly parentId: ScopeIdSource;
  readonly order: number;
}

export interface ShortcutRegistrationInput {
  readonly id?: string;
  readonly scopeId: ScopeIdSource;
  readonly keys: LustrousShortcutKeyInput;
  readonly enabled: boolean;
  readonly phase: "capture" | "bubble";
  readonly priority?: number;
  readonly allowInInput?: boolean;
  readonly allowRepeat?: boolean;
  readonly suppressWhenBlocked?: boolean;
  readonly onTrigger: (event: KeyboardEvent) => boolean | void;
  readonly onTriggered?: () => void;
}

interface InternalShortcutRegistration {
  readonly token: symbol;
  readonly id?: string;
  readonly scopeId: ScopeIdSource;
  readonly chords: readonly LustrousParsedShortcutChord[];
  readonly enabled: boolean;
  readonly phase: "capture" | "bubble";
  readonly priority: number;
  readonly allowInInput: boolean;
  readonly allowRepeat: boolean;
  readonly suppressWhenBlocked: boolean;
  readonly onTrigger: (event: KeyboardEvent) => boolean | void;
  readonly onTriggered?: () => void;
}

interface EventDispatchState {
  readonly topScopeId: string;
  readonly hasExternalModal: boolean;
  claimed: boolean;
  claimedBy?: symbol;
}

function resolveScopeSource(source: ScopeIdSource): string {
  return typeof source === "function" ? source() : source;
}

function deepestEventTarget(event: Event): EventTarget | null {
  if (typeof event.composedPath === "function") {
    const path = event.composedPath();
    if (path.length > 0) return path[0] ?? null;
  }
  return event.target;
}

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  if (target instanceof HTMLElement) {
    if (target.isContentEditable) return true;
    const { tagName } = target;
    if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") return true;
  }
  return target.closest('[contenteditable="true"]') !== null;
}

function isComposingKeyboardEvent(event?: Event): boolean {
  return event instanceof KeyboardEvent && (event.isComposing || event.keyCode === 229);
}

function isModifiedOrEscapeChord(chord: LustrousParsedShortcutChord): boolean {
  return chord.mod || chord.meta || chord.ctrl || chord.alt || chord.key === "escape";
}

function isModifiedChord(chord: LustrousParsedShortcutChord): boolean {
  return chord.mod || chord.meta || chord.ctrl || chord.alt;
}

function isOpenModalCandidate(modal: Element, excludeManaged: boolean): boolean {
  if (modal.hasAttribute("data-closed")) return false;
  if (modal instanceof HTMLDialogElement && !modal.open) return false;
  if (modal.hasAttribute("popover") && !modal.matches(":popover-open")) return false;
  if (excludeManaged && modal.hasAttribute(LUSTROUS_SHORTCUT_SCOPE_ATTR)) return false;
  if (modal.querySelector("nav") || modal.closest("nav")) return false;
  const root = modal.getRootNode();
  if (root instanceof ShadowRoot && root.host.localName === "lustrous-sidebar-drawer") return false;
  return true;
}

function queryHasOpenModalDialog(excludeManaged: boolean): boolean {
  if (typeof document === "undefined") return false;
  const visit = (root: Document | ShadowRoot): boolean => {
    for (const modal of root.querySelectorAll('[aria-modal="true"], dialog[open]')) {
      if (isOpenModalCandidate(modal, excludeManaged)) return true;
    }
    for (const el of root.querySelectorAll("*")) {
      if (el.shadowRoot && visit(el.shadowRoot)) return true;
    }
    return false;
  };
  return visit(document);
}

/** Checks whether a blocking modal or `<dialog open>` is present outside Lustrous's shortcut scope stack. */
export function hasExternalOpenModalDialog(): boolean {
  return queryHasOpenModalDialog(true);
}

/** Checks whether any blocking modal or `<dialog open>` is open in the document (excluding navigation drawers). */
export function hasOpenModalDialog(): boolean {
  return queryHasOpenModalDialog(false);
}

/** Document-level (or isolated) keyboard shortcut dispatcher and overlay scope stack. */
export class ShortcutManager {
  private readonly activeScopes = new Map<string, ActiveScopeEntry>();
  private readonly registrations = new Map<symbol, InternalShortcutRegistration>();
  private readonly subscriberCounts = new Map<string, number>();
  private readonly activeShortcutListeners = new Set<() => void>();
  private readonly scopeListeners = new Set<() => void>();
  private readonly eventStates = new WeakMap<Event, EventDispatchState>();
  private activeShortcutsSnapshot: ReadonlySet<string> = new Set();
  private nextScopeOrder = 0;
  private isListeningOnWindow = false;
  private activeEscapeEvent?: KeyboardEvent;
  private clearEscapeTimer?: ReturnType<typeof setTimeout>;

  private readonly handleCaptureKeyDown = (event: KeyboardEvent): void => {
    this.dispatchKeyDown(event, "capture");
  };

  private readonly handleBubbleKeyDown = (event: KeyboardEvent): void => {
    this.dispatchKeyDown(event, "bubble");
  };

  activateScope(id: string, parentId: ScopeIdSource = ROOT_SCOPE_ID): () => void {
    this.nextScopeOrder += 1;
    this.activeScopes.set(id, { id, parentId, order: this.nextScopeOrder });
    this.syncWindowListeners();
    this.notifyScopeListeners();

    let deactivated = false;
    return () => {
      if (deactivated) return;
      deactivated = true;
      if (this.activeScopes.delete(id)) {
        this.syncWindowListeners();
        this.notifyScopeListeners();
      }
    };
  }

  hasActiveScope(id: string): boolean {
    return this.activeScopes.has(id);
  }

  getTopScopeId(): string {
    if (this.activeScopes.size === 0) return ROOT_SCOPE_ID;

    const resolvedParents = new Map<string, string>();
    for (const [id, entry] of this.activeScopes) {
      const p = resolveScopeSource(entry.parentId);
      resolvedParents.set(id, p === id ? ROOT_SCOPE_ID : p);
    }

    const validScopes = new Map<string, ActiveScopeEntry>();
    let added = true;
    while (added) {
      added = false;
      for (const [id, entry] of this.activeScopes) {
        if (validScopes.has(id)) continue;
        const parentId = resolvedParents.get(id) ?? ROOT_SCOPE_ID;
        if (parentId === ROOT_SCOPE_ID || validScopes.has(parentId)) {
          validScopes.set(id, entry);
          added = true;
        }
      }
    }

    if (validScopes.size === 0) return ROOT_SCOPE_ID;

    const parentIdsWithChildren = new Set<string>();
    for (const id of validScopes.keys()) {
      parentIdsWithChildren.add(resolvedParents.get(id) ?? ROOT_SCOPE_ID);
    }

    let bestScopeId = ROOT_SCOPE_ID;
    let bestOrder = -1;
    let bestEntryOrder = -1;

    for (const entry of validScopes.values()) {
      if (parentIdsWithChildren.has(entry.id)) continue;
      let chainMaxOrder = entry.order;
      let cursor: ActiveScopeEntry | undefined = entry;
      const visited = new Set<string>();
      while (cursor && !visited.has(cursor.id)) {
        visited.add(cursor.id);
        if (cursor.order > chainMaxOrder) chainMaxOrder = cursor.order;
        const parentId = resolvedParents.get(cursor.id) ?? ROOT_SCOPE_ID;
        cursor = validScopes.get(parentId);
      }
      if (
        chainMaxOrder > bestOrder ||
        (chainMaxOrder === bestOrder && entry.order > bestEntryOrder)
      ) {
        bestOrder = chainMaxOrder;
        bestEntryOrder = entry.order;
        bestScopeId = entry.id;
      }
    }

    return bestScopeId;
  }

  subscribeScopes(listener: () => void): () => void {
    this.scopeListeners.add(listener);
    return () => {
      this.scopeListeners.delete(listener);
    };
  }

  canScopeHandleEscape(
    scopeId: string,
    event?: Event,
    options?: { readonly ignoreScopeRegistrations?: boolean; readonly claimToken?: symbol },
  ): boolean {
    const resolvedEvent =
      event instanceof KeyboardEvent ? event : (this.activeEscapeEvent ?? event);
    const state = resolvedEvent ? this.ensureEventState(resolvedEvent) : undefined;
    const topScopeId = state ? state.topScopeId : this.getTopScopeId();
    const hasExternalModal = state ? state.hasExternalModal : hasExternalOpenModalDialog();

    if (state?.claimed && options?.claimToken && state.claimedBy === options.claimToken) {
      return true;
    }

    if (
      hasExternalModal ||
      state?.claimed ||
      topScopeId !== scopeId ||
      isComposingKeyboardEvent(resolvedEvent)
    ) {
      return false;
    }

    if (!options?.ignoreScopeRegistrations) {
      const isMac = isMacPlatform();
      const isKeyboard = resolvedEvent instanceof KeyboardEvent;
      const editableTarget = isKeyboard && isEditableElement(deepestEventTarget(resolvedEvent));
      for (const reg of this.registrations.values()) {
        if (
          !reg.enabled ||
          resolveScopeSource(reg.scopeId) !== scopeId ||
          (isKeyboard && reg.phase === "capture") ||
          (editableTarget && !reg.allowInInput)
        ) {
          continue;
        }
        for (const chord of reg.chords) {
          if (
            chord.key === "escape" &&
            !chord.mod &&
            !chord.meta &&
            !chord.ctrl &&
            !chord.shift &&
            !chord.alt &&
            (!isKeyboard || matchesParsedChord(resolvedEvent, chord, isMac))
          ) {
            return false;
          }
        }
      }
    }

    if (state) {
      state.claimed = true;
      state.claimedBy = options?.claimToken;
    }
    return true;
  }

  registerShortcut(input: ShortcutRegistrationInput): () => void {
    const chords = normalizeShortcutChords(input.keys);
    const defaultAllowInInput =
      chords.length === 0 || chords.some((chord) => isModifiedOrEscapeChord(chord));
    const defaultSuppressWhenBlocked = chords.some((chord) => isModifiedChord(chord));

    const token = Symbol("shortcut");
    this.registrations.set(token, {
      token,
      id: input.id,
      scopeId: input.scopeId,
      chords,
      enabled: input.enabled,
      phase: input.phase,
      priority: input.priority ?? 0,
      allowInInput: input.allowInInput ?? defaultAllowInInput,
      allowRepeat: input.allowRepeat ?? false,
      suppressWhenBlocked: input.suppressWhenBlocked ?? defaultSuppressWhenBlocked,
      onTrigger: input.onTrigger,
      onTriggered: input.onTriggered,
    });

    const unregisterActiveId =
      input.id && input.enabled ? this.registerActiveShortcut(input.id) : undefined;
    this.syncWindowListeners();

    return () => {
      this.registrations.delete(token);
      unregisterActiveId?.();
      this.syncWindowListeners();
    };
  }

  registerActiveShortcut(id: string): () => void {
    const prevCount = this.subscriberCounts.get(id) ?? 0;
    this.subscriberCounts.set(id, prevCount + 1);
    if (prevCount === 0) this.rebuildActiveShortcutsSnapshot();
    let unregistered = false;
    return () => {
      if (unregistered) return;
      unregistered = true;
      const currentCount = (this.subscriberCounts.get(id) ?? 1) - 1;
      if (currentCount <= 0) {
        this.subscriberCounts.delete(id);
        this.rebuildActiveShortcutsSnapshot();
      } else {
        this.subscriberCounts.set(id, currentCount);
      }
    };
  }

  getActiveShortcutIds(): ReadonlySet<string> {
    return this.activeShortcutsSnapshot;
  }

  subscribeActiveShortcuts(listener: () => void): () => void {
    this.activeShortcutListeners.add(listener);
    return () => {
      this.activeShortcutListeners.delete(listener);
    };
  }

  resetForTesting(): void {
    const hadActiveShortcuts =
      this.subscriberCounts.size > 0 || this.activeShortcutsSnapshot.size > 0;
    const hadActiveScopes = this.activeScopes.size > 0;

    clearTimeout(this.clearEscapeTimer);
    this.activeEscapeEvent = undefined;
    this.subscriberCounts.clear();
    this.activeShortcutsSnapshot = new Set();
    this.activeScopes.clear();
    this.registrations.clear();
    this.syncWindowListeners();

    if (hadActiveShortcuts) {
      for (const listener of this.activeShortcutListeners) listener();
    }
    if (hadActiveScopes) this.notifyScopeListeners();
  }

  private ensureEventState(event: Event): EventDispatchState {
    const existing = this.eventStates.get(event);
    if (existing) return existing;
    const created: EventDispatchState = {
      topScopeId: this.getTopScopeId(),
      hasExternalModal: hasExternalOpenModalDialog(),
      claimed: false,
    };
    this.eventStates.set(event, created);
    if (event instanceof KeyboardEvent && event.key === "Escape") {
      this.activeEscapeEvent = event;
      clearTimeout(this.clearEscapeTimer);
      this.clearEscapeTimer = setTimeout(() => {
        if (this.activeEscapeEvent === event) this.activeEscapeEvent = undefined;
      }, 0);
    }
    return created;
  }

  private dispatchKeyDown(event: KeyboardEvent, phase: "capture" | "bubble"): void {
    const state = this.ensureEventState(event);
    if (
      isComposingKeyboardEvent(event) ||
      event.defaultPrevented ||
      state.claimed ||
      state.hasExternalModal
    ) {
      return;
    }

    const isMac = isMacPlatform();
    const editableTarget = isEditableElement(deepestEventTarget(event));

    const matchingRegistrations: InternalShortcutRegistration[] = [];
    for (const reg of this.registrations.values()) {
      if (
        resolveScopeSource(reg.scopeId) === state.topScopeId &&
        reg.phase === phase &&
        this.canRegistrationMatchEvent(event, reg, isMac, editableTarget)
      ) {
        matchingRegistrations.push(reg);
      }
    }
    if (matchingRegistrations.length > 1) {
      matchingRegistrations.sort((a, b) => b.priority - a.priority);
    }

    for (const reg of matchingRegistrations) {
      if (event.repeat && !reg.allowRepeat) {
        event.preventDefault();
        if (phase === "capture") event.stopPropagation();
        state.claimed = true;
        state.claimedBy = reg.token;
        return;
      }

      const result = reg.onTrigger(event);
      if (result === false) continue;

      event.preventDefault();
      if (phase === "capture") event.stopPropagation();
      state.claimed = true;
      state.claimedBy = reg.token;
      reg.onTriggered?.();
      return;
    }

    if (phase === "capture" && !state.claimed && state.topScopeId !== ROOT_SCOPE_ID) {
      for (const reg of this.registrations.values()) {
        if (
          resolveScopeSource(reg.scopeId) === state.topScopeId &&
          reg.phase === "bubble" &&
          this.canRegistrationMatchEvent(event, reg, isMac, editableTarget)
        ) {
          return;
        }
      }

      for (const reg of this.registrations.values()) {
        const regScopeId = resolveScopeSource(reg.scopeId);
        if (
          !reg.suppressWhenBlocked ||
          regScopeId === state.topScopeId ||
          (regScopeId !== ROOT_SCOPE_ID && !this.activeScopes.has(regScopeId)) ||
          !this.canRegistrationMatchEvent(event, reg, isMac, editableTarget)
        ) {
          continue;
        }
        event.preventDefault();
        event.stopPropagation();
        state.claimed = true;
        state.claimedBy = reg.token;
        return;
      }
    }
  }

  private canRegistrationMatchEvent(
    event: KeyboardEvent,
    reg: InternalShortcutRegistration,
    isMac: boolean,
    editableTarget: boolean,
  ): boolean {
    if (!reg.enabled || (!reg.allowInInput && editableTarget)) return false;
    for (const chord of reg.chords) {
      if (matchesParsedChord(event, chord, isMac)) return true;
    }
    return false;
  }

  private rebuildActiveShortcutsSnapshot(): void {
    const next = new Set<string>();
    for (const [id, count] of this.subscriberCounts) {
      if (count > 0) next.add(id);
    }
    this.activeShortcutsSnapshot = next;
    for (const listener of this.activeShortcutListeners) listener();
  }

  private notifyScopeListeners(): void {
    for (const listener of this.scopeListeners) listener();
  }

  private syncWindowListeners(): void {
    if (typeof window === "undefined") return;
    const shouldListen = this.registrations.size > 0 || this.activeScopes.size > 0;
    if (shouldListen && !this.isListeningOnWindow) {
      window.addEventListener("keydown", this.handleCaptureKeyDown, true);
      window.addEventListener("keydown", this.handleBubbleKeyDown, false);
      this.isListeningOnWindow = true;
    } else if (!shouldListen && this.isListeningOnWindow) {
      window.removeEventListener("keydown", this.handleCaptureKeyDown, true);
      window.removeEventListener("keydown", this.handleBubbleKeyDown, false);
      this.isListeningOnWindow = false;
    }
  }
}

let sharedShortcutManager: ShortcutManager | undefined;

export function getSharedShortcutManager(): ShortcutManager {
  if (!sharedShortcutManager) sharedShortcutManager = new ShortcutManager();
  return sharedShortcutManager;
}

/** Marks `id` as having an active subscriber in the shared shortcut manager. */
export function registerActiveShortcut(id: string): () => void {
  return getSharedShortcutManager().registerActiveShortcut(id);
}

/** Returns the set of currently active shortcut IDs in the shared shortcut manager. */
export function getActiveShortcutIds(): ReadonlySet<string> {
  return getSharedShortcutManager().getActiveShortcutIds();
}

/** Resets active shortcut registrations and scopes in the shared shortcut manager between unit tests. */
export function resetKeyboardShortcutsForTesting(): void {
  getSharedShortcutManager().resetForTesting();
}

let nextManagedScopeId = 0;
function createManagedScopeId(): string {
  nextManagedScopeId += 1;
  return `lustrous-scope-${nextManagedScopeId}`;
}

const hostScopes = new WeakMap<Node, Set<LustrousShortcutScopeController>>();

function flatParent(node: Node): Node | null {
  if (node instanceof Element && node.assignedSlot) return node.assignedSlot;
  if (node.parentNode) return node.parentNode;
  if (typeof ShadowRoot !== "undefined" && node instanceof ShadowRoot) return node.host;
  return null;
}

function findEnclosingScope(
  startNode: Node | null,
  manager: ShortcutManager,
  exclude?: LustrousShortcutScopeController,
): LustrousShortcutScopeController | undefined {
  for (let n: Node | null = startNode; n; n = flatParent(n)) {
    const set = hostScopes.get(n);
    if (!set || set.size === 0) continue;
    let candidate: LustrousShortcutScopeController | undefined;
    for (const ctrl of set) {
      if (ctrl !== exclude && ctrl.manager === manager && ctrl.active) {
        candidate = ctrl;
      }
    }
    if (candidate) return candidate;
  }
  return undefined;
}

export interface LustrousShortcutScopeOptions {
  readonly active?: boolean;
  readonly parent?: LustrousShortcutScopeController | string;
  readonly manager?: ShortcutManager;
  readonly ignoreScopeRegistrations?: boolean;
  readonly reactive?: boolean;
}

/**
 * Lit reactive controller that pushes an overlay layer onto the Lustrous shortcut scope stack
 * while `active` is true. Automatically attached by Lustrous overlays (`lustrous-modal`,
 * `lustrous-dialog`, `lustrous-bottom-sheet`, lightboxes, `lustrous-menu`, `lustrous-popover`,
 * and takeover `lustrous-side-panel`).
 */
export class LustrousShortcutScopeController implements ReactiveController {
  readonly scopeId = createManagedScopeId();
  readonly manager: ShortcutManager;
  private readonly host: ReactiveControllerHost & Partial<Node>;
  private readonly parentOption?: LustrousShortcutScopeController | string;
  private readonly ignoreScopeRegistrations: boolean;
  private readonly reactive: boolean;
  private readonly claimToken = Symbol("scope-escape-claim");
  private _active: boolean;
  private connected = false;
  private deactivateFn?: () => void;
  private unsubScopes?: () => void;

  constructor(host: ReactiveControllerHost & Partial<Node>, options: LustrousShortcutScopeOptions = {}) {
    this.host = host;
    this._active = options.active ?? true;
    this.parentOption = options.parent;
    this.manager =
      options.manager ??
      (options.parent instanceof LustrousShortcutScopeController
        ? options.parent.manager
        : getSharedShortcutManager());
    this.ignoreScopeRegistrations = options.ignoreScopeRegistrations ?? false;
    this.reactive = options.reactive ?? false;
    host.addController(this);
  }

  get active(): boolean {
    return this._active;
  }

  setActive(active: boolean): void {
    if (this._active === active) return;
    this._active = active;
    this.syncActivation();
  }

  get providedScopeId(): string {
    return this._active ? this.scopeId : this.resolveParentScopeId();
  }

  get isTopScope(): boolean {
    return this.manager.getTopScopeId() === this.providedScopeId;
  }

  canHandleEscape(event?: Event): boolean {
    return this.manager.canScopeHandleEscape(this.providedScopeId, event, {
      ignoreScopeRegistrations: !this._active || this.ignoreScopeRegistrations,
      claimToken: this.claimToken,
    });
  }

  hostConnected(): void {
    this.connected = true;
    if (typeof Node !== "undefined" && this.host instanceof Node) {
      let set = hostScopes.get(this.host);
      if (!set) {
        set = new Set();
        hostScopes.set(this.host, set);
      }
      set.add(this);
    }
    if (this.reactive) {
      this.unsubScopes = this.manager.subscribeScopes(() => this.host.requestUpdate());
    }
    this.syncActivation();
  }

  hostDisconnected(): void {
    this.connected = false;
    this.unsubScopes?.();
    this.unsubScopes = undefined;
    this.deactivateFn?.();
    this.deactivateFn = undefined;
    if (typeof Node !== "undefined" && this.host instanceof Node) {
      const set = hostScopes.get(this.host);
      set?.delete(this);
      if (set?.size === 0) hostScopes.delete(this.host);
    }
  }

  private resolveParentScopeId(): string {
    if (typeof this.parentOption === "string") return this.parentOption;
    if (this.parentOption instanceof LustrousShortcutScopeController) {
      return this.parentOption.providedScopeId;
    }
    if (typeof Node !== "undefined" && this.host instanceof Node) {
      const ancestor = findEnclosingScope(this.host, this.manager, this);
      if (ancestor) return ancestor.providedScopeId;
    }
    return ROOT_SCOPE_ID;
  }

  private syncActivation(): void {
    const isHostConnected =
      this.connected || (typeof this.host.isConnected === "boolean" ? this.host.isConnected : false);
    if (this._active && isHostConnected) {
      if (!this.deactivateFn) {
        if (typeof Node !== "undefined" && this.host instanceof Node) {
          let set = hostScopes.get(this.host);
          if (!set) {
            set = new Set();
            hostScopes.set(this.host, set);
          }
          set.add(this);
        }
        this.deactivateFn = this.manager.activateScope(this.scopeId, () =>
          this.resolveParentScopeId(),
        );
      }
    } else if (this.deactivateFn) {
      this.deactivateFn();
      this.deactivateFn = undefined;
    }
  }
}

export interface LustrousShortcutOptions {
  readonly id?: string;
  readonly keys: LustrousShortcutKeyInput;
  readonly enabled?: boolean;
  readonly onTrigger: (event: KeyboardEvent) => boolean | void;
  readonly priority?: number;
  readonly phase?: "capture" | "bubble";
  readonly allowInInput?: boolean;
  readonly allowRepeat?: boolean;
  readonly suppressWhenBlocked?: boolean;
  readonly scope?: LustrousShortcutScopeController | string;
  readonly manager?: ShortcutManager;
}

/** Lit reactive controller that binds a declarative keyboard shortcut within its enclosing `ShortcutScope`. */
export class LustrousShortcutController implements ReactiveController {
  private readonly host: ReactiveControllerHost & Partial<Node>;
  private options: LustrousShortcutOptions;
  private connected = false;
  private unregisterFn?: () => void;

  constructor(host: ReactiveControllerHost & Partial<Node>, options: LustrousShortcutOptions) {
    this.host = host;
    this.options = options;
    host.addController(this);
  }

  get enabled(): boolean {
    return this.options.enabled ?? true;
  }

  setEnabled(enabled: boolean): void {
    if (this.enabled === enabled) return;
    this.options = { ...this.options, enabled };
    this.syncRegistration();
  }

  update(patch: Partial<LustrousShortcutOptions>): void {
    this.options = { ...this.options, ...patch };
    this.syncRegistration();
  }

  hostConnected(): void {
    this.connected = true;
    this.syncRegistration();
  }

  hostDisconnected(): void {
    this.connected = false;
    this.unregisterFn?.();
    this.unregisterFn = undefined;
  }

  private resolveManager(): ShortcutManager {
    if (this.options.manager) return this.options.manager;
    if (this.options.scope instanceof LustrousShortcutScopeController) return this.options.scope.manager;
    return getSharedShortcutManager();
  }

  private resolveScopeId(manager: ShortcutManager): string {
    if (typeof this.options.scope === "string") return this.options.scope;
    if (this.options.scope instanceof LustrousShortcutScopeController) {
      return this.options.scope.providedScopeId;
    }
    if (typeof Node !== "undefined" && this.host instanceof Node) {
      const ancestor = findEnclosingScope(this.host, manager);
      if (ancestor) return ancestor.providedScopeId;
    }
    return ROOT_SCOPE_ID;
  }

  private syncRegistration(): void {
    this.unregisterFn?.();
    this.unregisterFn = undefined;
    const isHostConnected =
      this.connected || (typeof this.host.isConnected === "boolean" ? this.host.isConnected : false);
    const hasKeys =
      typeof this.options.keys === "string"
        ? this.options.keys.trim().length > 0
        : this.options.keys.length > 0;
    if (!isHostConnected || !this.enabled || !hasKeys) return;

    const manager = this.resolveManager();
    this.unregisterFn = manager.registerShortcut({
      id: this.options.id,
      scopeId: () => this.resolveScopeId(manager),
      keys: this.options.keys,
      enabled: true,
      phase: this.options.phase ?? "bubble",
      priority: this.options.priority,
      allowInInput: this.options.allowInInput,
      allowRepeat: this.options.allowRepeat,
      suppressWhenBlocked: this.options.suppressWhenBlocked,
      onTrigger: (event) => this.options.onTrigger(event),
    });
  }
}

/** Lit reactive controller that subscribes to the set of currently active shortcut IDs in `ShortcutManager`. */
export class LustrousActiveShortcutsController<T extends string = string> implements ReactiveController {
  private readonly host: ReactiveControllerHost;
  private readonly manager: ShortcutManager;
  private unsub?: () => void;

  constructor(host: ReactiveControllerHost, manager: ShortcutManager = getSharedShortcutManager()) {
    this.host = host;
    this.manager = manager;
    host.addController(this);
  }

  get ids(): ReadonlySet<T> {
    return this.manager.getActiveShortcutIds() as ReadonlySet<T>;
  }

  hostConnected(): void {
    this.unsub = this.manager.subscribeActiveShortcuts(() => this.host.requestUpdate());
  }

  hostDisconnected(): void {
    this.unsub?.();
    this.unsub = undefined;
  }
}
