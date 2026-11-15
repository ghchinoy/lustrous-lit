import { html, nothing, type TemplateResult } from "lit";

export type TextDirection = "ltr" | "rtl";
export type EstimatedDirection = TextDirection | "neutral";

export interface ProseWordCounts {
  readonly rtlWords: number;
  readonly ltrWords: number;
}

export interface TextRange {
  readonly start: number;
  readonly end: number;
}

/** Ratio of strong RTL prose words at or above which a mixed-script block resolves to `"rtl"`. */
const RTL_WORD_RATIO_THRESHOLD = 0.4;

const RTL_CHAR_CLASS =
  "\\p{Script=Hebrew}\\p{Script=Arabic}\\p{Script=Syriac}\\p{Script=Thaana}\\p{Script=Nko}\\p{Script=Adlam}\\p{Script=Mandaic}\\p{Script=Samaritan}\\uFB1D-\\uFDFF\\uFE70-\\uFEFC";

const STRONG_RTL_CHAR_RE = new RegExp(`(?!\\p{Nd})[${RTL_CHAR_CLASS}]`, "u");
const STRONG_LTR_CHAR_RE = new RegExp(`(?![${RTL_CHAR_CLASS}])\\p{L}`, "u");
const COMBINING_MARK_RE = /^\p{M}$/u;

const ZERO_WIDTH_AND_BIDI_CONTROLS_RE = /[\u200B-\u200F\u202A-\u202E\u2060\u2066-\u2069\uFEFF]/gu;
const URL_RE = /\b(?:https?:\/\/|mailto:|www\.)\S+/giu;
const EMAIL_RE = /\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/gu;
const UNIX_LEADING_PATH_RE =
  /(?:^|(?<=[\s([{"'\u2010-\u2015\u05BE-]))(?:~|\.\.?)?\/[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)+/gu;
const MULTI_SEGMENT_PATH_RE = /\b[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+){2,}\b/gu;
const WINDOWS_PATH_RE = /\b[A-Za-z]:\\[A-Za-z0-9_.\\-]+/gu;

const MIXED_TOKEN_SEPARATOR_RE = /[-\u05BE\u2010-\u2015/]+/u;
const SLASH_SEPARATOR_RE = /\/+/u;

const RTL_PRIMARY_SUBTAGS = new Set([
  "adlm", "ae", "ar", "arc", "arz", "azb", "ckb", "dv", "fa", "glk",
  "he", "iw", "ji", "khw", "ks", "lrc", "mzn", "nqo", "pnb", "prs",
  "ps", "sd", "skr", "syr", "ug", "ur", "yi",
]);

const RTL_SCRIPT_SUBTAGS = new Set([
  "adlm", "arab", "aran", "hebr", "mand", "nkoo", "samr", "syrc", "thaa",
]);

export function getDocumentDirection(): TextDirection {
  if (typeof globalThis.document !== "undefined") {
    const htmlDir = globalThis.document.documentElement?.getAttribute("dir");
    if (htmlDir?.toLowerCase() === "rtl") return "rtl";
  }
  return "ltr";
}

export function hasStrongRtlText(text: string): boolean {
  return STRONG_RTL_CHAR_RE.test(text);
}

export function hasStrongLtrText(text: string): boolean {
  return STRONG_LTR_CHAR_RE.test(text);
}

function stripNonProseTokens(text: string): string {
  return text
    .replace(ZERO_WIDTH_AND_BIDI_CONTROLS_RE, "")
    .replace(URL_RE, " ")
    .replace(EMAIL_RE, " ")
    .replace(WINDOWS_PATH_RE, " ")
    .replace(UNIX_LEADING_PATH_RE, " ")
    .replace(MULTI_SEGMENT_PATH_RE, " ");
}

/** Counts strong RTL vs. strong LTR prose words after stripping URLs, emails, paths, and BiDi controls. */
export function countProseWords(text: string): ProseWordCounts {
  if (!text) return { rtlWords: 0, ltrWords: 0 };
  const cleaned = stripNonProseTokens(text).trim();
  if (!cleaned) return { rtlWords: 0, ltrWords: 0 };

  let rtlWords = 0;
  let ltrWords = 0;

  for (const rawToken of cleaned.split(/\s+/u)) {
    if (!rawToken) continue;
    const slashParts = rawToken.includes("/") ? rawToken.split(SLASH_SEPARATOR_RE) : [rawToken];
    for (const part of slashParts) {
      if (!part) continue;
      const hasRtl = STRONG_RTL_CHAR_RE.test(part);
      const hasLtr = STRONG_LTR_CHAR_RE.test(part);
      if (hasRtl && hasLtr) {
        for (const sub of part.split(MIXED_TOKEN_SEPARATOR_RE)) {
          if (!sub) continue;
          if (STRONG_RTL_CHAR_RE.test(sub)) rtlWords += 1;
          if (STRONG_LTR_CHAR_RE.test(sub)) ltrWords += 1;
        }
      } else if (hasRtl) {
        rtlWords += 1;
      } else if (hasLtr) {
        ltrWords += 1;
      }
    }
  }

  return { rtlWords, ltrWords };
}

export function estimateDirectionFromWordCounts(rtlWords: number, ltrWords: number): EstimatedDirection {
  const totalStrongWords = rtlWords + ltrWords;
  if (totalStrongWords <= 0) return "neutral";
  return rtlWords / totalStrongWords >= RTL_WORD_RATIO_THRESHOLD ? "rtl" : "ltr";
}

export function estimateProseDirection(text: string): EstimatedDirection {
  const { rtlWords, ltrWords } = countProseWords(text);
  return estimateDirectionFromWordCounts(rtlWords, ltrWords);
}

export function resolveDirection(estimated: EstimatedDirection, fallback?: TextDirection): TextDirection {
  if (estimated === "ltr" || estimated === "rtl") return estimated;
  return fallback ?? getDocumentDirection();
}

function parseLanguageTagDirection(languageTag: string | undefined): TextDirection | undefined {
  if (!languageTag) return undefined;
  const normalized = languageTag.trim().replaceAll("_", "-").toLowerCase();
  if (!normalized) return undefined;
  const subtags = normalized.split("-").filter(Boolean);
  const primary = subtags[0];
  if (!primary || !/^[a-z]{2,8}$/u.test(primary)) return undefined;

  for (let i = 1; i < subtags.length; i += 1) {
    const subtag = subtags[i];
    if (!subtag || subtag.length === 1) break;
    if (subtag.length === 4) {
      if (RTL_SCRIPT_SUBTAGS.has(subtag)) return "rtl";
      if (/^[a-z]{4}$/u.test(subtag)) return "ltr";
    }
  }
  return RTL_PRIMARY_SUBTAGS.has(primary) ? "rtl" : "ltr";
}

export function resolveLanguageDirection(
  languageTag: string | undefined,
  text: string,
  fallback?: TextDirection,
): TextDirection {
  const tagDir = parseLanguageTagDirection(languageTag);
  const estimated = estimateProseDirection(text);
  if (estimated === "neutral") return tagDir ?? fallback ?? getDocumentDirection();
  if (tagDir === "rtl" && hasStrongRtlText(text)) return "rtl";
  if (tagDir === "ltr" && !hasStrongRtlText(text)) return "ltr";
  return resolveDirection(estimated, tagDir ?? fallback);
}

function readCodePointAt(text: string, index: number): string {
  const cp = text.codePointAt(index);
  return cp === undefined ? "" : String.fromCodePoint(cp);
}

function isHorizontalSpace(ch: string): boolean {
  return ch === " " || ch === "\t";
}

function isAsciiDigit(ch: string): boolean {
  return ch >= "0" && ch <= "9";
}

function isBoundaryBeforePrefix(text: string, index: number): boolean {
  if (index === 0) return true;
  const prev = text[index - 1] ?? "";
  const current = text[index] ?? "";
  return (
    prev === " " || prev === "\t" || prev === "\n" || prev === "\r" ||
    prev === "(" || prev === "[" || prev === "{" || prev === '"' || prev === "'" ||
    (current !== "-" && (prev === "-" || prev === "\u05BE" || (prev >= "\u2010" && prev <= "\u2015")))
  );
}

function isLtrTechnicalPrefixChar(ch: string): boolean {
  return ch === "@" || ch === "#" || ch === "$" || ch === "/" || ch === "~" || ch === "." || ch === "-" || ch === "_" || ch === "*" || ch === "&";
}

function isTechnicalBodySymbol(ch: string): boolean {
  return ch === "+" || ch === "#" || ch === "$" || ch === "*" || ch === "&" || ch === "=" || ch === "~" || ch === "^" || ch === "\\";
}

function isInternalLtrConnector(ch: string): boolean {
  return ch === "." || ch === "-" || ch === ":" || ch === "@" || ch === "?" || ch === "'" || ch === "\u2019";
}

function isLtrContinuationTarget(ch: string): boolean {
  return Boolean(ch) && (STRONG_LTR_CHAR_RE.test(ch) || isAsciiDigit(ch) || ch === "/" || ch === ":" || ch === "_" || ch === "-");
}

function scanAngleBracketTag(text: string, start: number): number {
  if (text[start] !== "<") return start;
  const second = text[start + 1] ?? "";
  const tagNameStart = second === "/" ? start + 2 : start + 1;
  const firstTagChar = readCodePointAt(text, tagNameStart);
  if (!firstTagChar || !STRONG_LTR_CHAR_RE.test(firstTagChar)) return start;
  let cursor = tagNameStart + firstTagChar.length;
  while (cursor < text.length) {
    const ch = readCodePointAt(text, cursor);
    if (!ch || ch === "\n" || ch === "\r" || ch === "<" || STRONG_RTL_CHAR_RE.test(ch)) return start;
    if (ch === ">") return cursor + 1;
    cursor += ch.length;
  }
  return start;
}

function canStartTechnicalPrefix(text: string, index: number): boolean {
  const ch = readCodePointAt(text, index);
  if (!isLtrTechnicalPrefixChar(ch) || !isBoundaryBeforePrefix(text, index)) return false;
  let cursor = index;
  while (cursor < text.length) {
    const next = readCodePointAt(text, cursor);
    if (!isLtrTechnicalPrefixChar(next)) {
      if (next === "{" && text[index] === "$") {
        const afterBrace = readCodePointAt(text, cursor + 1);
        return Boolean(afterBrace) && STRONG_LTR_CHAR_RE.test(afterBrace);
      }
      return Boolean(next) && STRONG_LTR_CHAR_RE.test(next);
    }
    cursor += next.length;
  }
  return false;
}

function canStartDigitConnectorCompound(text: string, index: number): boolean {
  if (!isAsciiDigit(text[index] ?? "") || !isBoundaryBeforePrefix(text, index)) return false;
  let cursor = index;
  while (cursor < text.length && isAsciiDigit(text[cursor] ?? "")) cursor += 1;
  const connector = text[cursor] ?? "";
  if (connector !== "-" && connector !== "_") return false;
  const afterConnector = readCodePointAt(text, cursor + 1);
  return Boolean(afterConnector) && STRONG_LTR_CHAR_RE.test(afterConnector);
}

function canStartCandidateToken(text: string, index: number): boolean {
  const ch = readCodePointAt(text, index);
  if (!ch) return false;
  if (STRONG_LTR_CHAR_RE.test(ch)) return true;
  if (ch === "<" && scanAngleBracketTag(text, index) > index) return true;
  if (canStartTechnicalPrefix(text, index)) return true;
  return canStartDigitConnectorCompound(text, index);
}

interface ScannedCandidate {
  readonly end: number;
  readonly isTechnical: boolean;
}

function scanSingleCandidateToken(text: string, start: number): ScannedCandidate {
  const angleTagEnd = scanAngleBracketTag(text, start);
  if (angleTagEnd > start) return { end: angleTagEnd, isTechnical: true };

  let cursor = start;
  let hasLeadingTechnicalPrefix = false;
  let hasDigitConnectorLtr = false;
  let hasTechnicalSymbol = false;
  let sawStrongLtr = false;

  if (canStartTechnicalPrefix(text, start)) {
    hasLeadingTechnicalPrefix = true;
    while (cursor < text.length) {
      const ch = readCodePointAt(text, cursor);
      if (!isLtrTechnicalPrefixChar(ch)) break;
      cursor += ch.length;
    }
  } else if (canStartDigitConnectorCompound(text, start)) {
    hasDigitConnectorLtr = true;
  }

  let parenDepth = 0;
  let bracketDepth = 0;
  let braceDepth = 0;
  let angleDepth = 0;
  let firstUnclosedBracketOffset = -1;
  let lastClosedBracketEnd = -1;

  while (cursor < text.length) {
    const ch = readCodePointAt(text, cursor);
    if (!ch || ch === "\n" || ch === "\r" || STRONG_RTL_CHAR_RE.test(ch)) break;
    const totalDepth = parenDepth + bracketDepth + braceDepth + angleDepth;

    if (STRONG_LTR_CHAR_RE.test(ch)) {
      sawStrongLtr = true;
      cursor += ch.length;
      continue;
    }
    if (COMBINING_MARK_RE.test(ch) || isAsciiDigit(ch) || ch === "_") {
      cursor += ch.length;
      continue;
    }
    if (isTechnicalBodySymbol(ch)) {
      hasTechnicalSymbol = true;
      cursor += ch.length;
      continue;
    }
    if (ch === "(") {
      if (totalDepth === 0) firstUnclosedBracketOffset = cursor;
      parenDepth += 1;
      cursor += 1;
      continue;
    }
    if (ch === "[") {
      if (totalDepth === 0) firstUnclosedBracketOffset = cursor;
      bracketDepth += 1;
      cursor += 1;
      continue;
    }
    if (ch === "{") {
      if (totalDepth === 0) firstUnclosedBracketOffset = cursor;
      braceDepth += 1;
      cursor += 1;
      continue;
    }
    if (ch === "<" && (sawStrongLtr || totalDepth > 0)) {
      if (totalDepth === 0) firstUnclosedBracketOffset = cursor;
      angleDepth += 1;
      cursor += 1;
      continue;
    }
    if (ch === ")") {
      if (parenDepth === 0) break;
      parenDepth -= 1;
      cursor += 1;
      if (parenDepth + bracketDepth + braceDepth + angleDepth === 0) {
        firstUnclosedBracketOffset = -1;
        lastClosedBracketEnd = cursor;
      }
      continue;
    }
    if (ch === "]") {
      if (bracketDepth === 0) break;
      bracketDepth -= 1;
      cursor += 1;
      if (parenDepth + bracketDepth + braceDepth + angleDepth === 0) {
        firstUnclosedBracketOffset = -1;
        lastClosedBracketEnd = cursor;
      }
      continue;
    }
    if (ch === "}") {
      if (braceDepth === 0) break;
      braceDepth -= 1;
      cursor += 1;
      if (parenDepth + bracketDepth + braceDepth + angleDepth === 0) {
        firstUnclosedBracketOffset = -1;
        lastClosedBracketEnd = cursor;
      }
      continue;
    }
    if (ch === ">") {
      if (angleDepth === 0) break;
      angleDepth -= 1;
      cursor += 1;
      if (parenDepth + bracketDepth + braceDepth + angleDepth === 0) {
        firstUnclosedBracketOffset = -1;
        lastClosedBracketEnd = cursor;
      }
      continue;
    }
    if (totalDepth > 0) {
      cursor += ch.length;
      continue;
    }
    if (ch === "-" && text[cursor + 1] === "-") {
      hasTechnicalSymbol = true;
      while (text[cursor] === "-") cursor += 1;
      continue;
    }
    if (ch === "/") {
      const next = readCodePointAt(text, cursor + 1);
      if (isLtrContinuationTarget(next)) {
        cursor += 1;
        continue;
      }
      if (!next || (!STRONG_RTL_CHAR_RE.test(next) && next !== "\n" && next !== "\r")) {
        cursor += 1;
      }
      break;
    }
    if (isInternalLtrConnector(ch)) {
      const next = readCodePointAt(text, cursor + ch.length);
      if (isLtrContinuationTarget(next)) {
        cursor += ch.length;
        continue;
      }
    }
    break;
  }

  if (parenDepth + bracketDepth + braceDepth + angleDepth > 0 && firstUnclosedBracketOffset >= start) {
    cursor = firstUnclosedBracketOffset;
  }
  if (!sawStrongLtr || cursor <= start) return { end: start, isTechnical: false };

  const tokenText = text.slice(start, cursor);
  const hasBalancedAttachedBrackets = lastClosedBracketEnd > start && lastClosedBracketEnd <= cursor;
  const isTechnical =
    hasLeadingTechnicalPrefix ||
    hasDigitConnectorLtr ||
    hasBalancedAttachedBrackets ||
    hasTechnicalSymbol ||
    tokenText.endsWith("/") ||
    tokenText.endsWith("_");

  return { end: cursor, isTechnical };
}

function scanNonRtlParenthetical(text: string, start: number): ScannedCandidate {
  const open = text[start];
  const close = open === "(" ? ")" : open === "[" ? "]" : "";
  if (!close) return { end: start, isTechnical: false };

  let depth = 1;
  let cursor = start + 1;
  const innerStart = cursor;
  let sawStrongLtr = false;
  let innerTechnical = false;

  while (cursor < text.length && depth > 0) {
    const ch = readCodePointAt(text, cursor);
    if (!ch || ch === "\n" || ch === "\r" || STRONG_RTL_CHAR_RE.test(ch)) {
      return { end: start, isTechnical: false };
    }
    if (STRONG_LTR_CHAR_RE.test(ch)) sawStrongLtr = true;
    if (ch === open) {
      depth += 1;
    } else if (ch === close) {
      depth -= 1;
      if (depth === 0) {
        const innerText = text.slice(innerStart, cursor);
        if (sawStrongLtr && findTechnicalLtrRanges(innerText).length > 0) innerTechnical = true;
        const hasValidInner = sawStrongLtr || (cursor > innerStart && /^[0-9.\-_ ]+$/u.test(innerText));
        return hasValidInner
          ? { end: cursor + 1, isTechnical: sawStrongLtr ? innerTechnical : false }
          : { end: start, isTechnical: false };
      }
    }
    cursor += ch.length;
  }
  return { end: start, isTechnical: false };
}

function scanTrailingNumberToken(text: string, start: number): number {
  if (!isAsciiDigit(text[start] ?? "")) return start;
  let cursor = start;
  while (cursor < text.length) {
    const ch = text[cursor] ?? "";
    if (isAsciiDigit(ch)) {
      cursor += 1;
      continue;
    }
    if ((ch === "." || ch === "-") && isAsciiDigit(text[cursor + 1] ?? "")) {
      cursor += 1;
      continue;
    }
    break;
  }
  const after = readCodePointAt(text, cursor);
  if (after && (STRONG_RTL_CHAR_RE.test(after) || STRONG_LTR_CHAR_RE.test(after))) return start;
  return cursor;
}

function scanCandidatePhrase(text: string, start: number): ScannedCandidate {
  const first = scanSingleCandidateToken(text, start);
  if (first.end <= start) return { end: start, isTechnical: false };

  let end = first.end;
  let isTechnical = first.isTechnical;

  while (end < text.length) {
    let wsEnd = end;
    while (wsEnd < text.length && isHorizontalSpace(text[wsEnd] ?? "")) wsEnd += 1;
    if (wsEnd === end || wsEnd >= text.length) break;

    if (canStartCandidateToken(text, wsEnd)) {
      const next = scanSingleCandidateToken(text, wsEnd);
      if (next.end > wsEnd) {
        end = next.end;
        isTechnical = isTechnical || next.isTechnical;
        continue;
      }
    }

    const parenChar = text[wsEnd];
    if (parenChar === "(" || parenChar === "[") {
      const paren = scanNonRtlParenthetical(text, wsEnd);
      if (paren.end > wsEnd) {
        end = paren.end;
        isTechnical = isTechnical || paren.isTechnical;
        continue;
      }
    }

    const numEnd = scanTrailingNumberToken(text, wsEnd);
    if (numEnd > wsEnd) {
      end = numEnd;
      continue;
    }
    break;
  }

  return { end, isTechnical };
}

/**
 * Finds character ranges inside `text` representing technical LTR tokens (`C++`, `foo()`,
 * `<Outlet />`, `/usr/local`, `$HOME`, `--amend`, `64-bit`) that Unicode UAX #9 would
 * misorder inside RTL prose unless isolated in `<bdi dir="ltr">`.
 */
export function findTechnicalLtrRanges(text: string): readonly TextRange[] {
  if (!text || !STRONG_LTR_CHAR_RE.test(text)) return [];
  const ranges: TextRange[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    if (canStartCandidateToken(text, cursor)) {
      const phrase = scanCandidatePhrase(text, cursor);
      if (phrase.end > cursor) {
        if (phrase.isTechnical) ranges.push({ start: cursor, end: phrase.end });
        cursor = phrase.end;
        continue;
      }
    }
    const ch = readCodePointAt(text, cursor);
    cursor += ch.length || 1;
  }
  return ranges;
}

/** Wraps technical LTR tokens in `<bdi dir="ltr">` inside RTL prose, leaving plain words unwrapped. */
export function renderIsolatedTechnicalTokens(
  text: string,
  baseDir: TextDirection,
): string | typeof nothing | Array<string | TemplateResult> {
  if (!text) return nothing;
  if (baseDir !== "rtl") return text;
  const ranges = findTechnicalLtrRanges(text);
  if (ranges.length === 0) return text;

  const parts: Array<string | TemplateResult> = [];
  let hostStart = 0;
  for (const range of ranges) {
    if (range.start > hostStart) parts.push(text.slice(hostStart, range.start));
    parts.push(html`<bdi dir="ltr">${text.slice(range.start, range.end)}</bdi>`);
    hostStart = range.end;
  }
  if (hostStart < text.length) parts.push(text.slice(hostStart));
  return parts;
}
