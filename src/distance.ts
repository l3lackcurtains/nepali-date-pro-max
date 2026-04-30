/**
 * Human-readable distance formatters — locale-driven.
 *
 * Three functions, each accepts an optional `{ locale }` (defaults to the
 * global locale set via `NepaliDate.locale(...)`).
 *
 * | Function                          | Suffix? | Example (en)        | Example (ne)      |
 * |-----------------------------------|---------|---------------------|-------------------|
 * | `formatDistance(a, b)`            | no      | `"7 days"`          | `"७ दिन"`        |
 * | `formatDistanceToNow(x)`          | yes     | `"5 minutes ago"`   | `"५ मिनेट अघि"` |
 * | `formatRelative(x, base?)`        | (smart) | `"yesterday"`       | `"हिजो"`         |
 *
 * **Polymorphic inputs.** Every argument accepts:
 *  - `NepaliDate` instance
 *  - JS `Date`
 *  - millisecond timestamp (`number`, e.g. `Date.now()`)
 *  - ISO date string (Gregorian, parsed by `new Date(string)`)
 *
 * For BS-format strings (e.g. `"2081-01-15"`), parse them first with
 * `NepaliDate.parse(s)` and pass the instance.
 */

import { isSameDay, isTomorrow, isYesterday } from "./comparisons.js";
import {
  differenceInCalendarDays,
  differenceInMilliseconds,
} from "./diff.js";
import {
  getLocale,
  type Locale,
  type LocaleRelativeTime,
  resolveGlobalLocale,
  resolveRelativeTime,
} from "./locale.js";
import { NepaliDate } from "./nepali-date.js";

/** Anything the distance/relative functions can accept. */
export type DateInput = NepaliDate | Date | number | string;

/** Options for distance/relative formatters. */
export interface DistanceOptions {
  /**
   * Locale name (`"en"`, `"ne"`, …) or a `Locale` object. Defaults to the
   * global locale set via `NepaliDate.locale(...)`.
   */
  locale?: string | Locale;
}

/**
 * Coerce any supported input into a `NepaliDate`. Exported for power users
 * who want to do their own polymorphic handling.
 */
export function toNepaliDate(input: DateInput): NepaliDate {
  if (input instanceof NepaliDate) return input;
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) {
      throw new TypeError("toNepaliDate: invalid Date");
    }
    return NepaliDate.fromJsDate(input);
  }
  if (typeof input === "number") {
    if (!Number.isFinite(input)) {
      throw new TypeError(`toNepaliDate: invalid timestamp number "${input}"`);
    }
    return NepaliDate.fromJsDate(new Date(input));
  }
  if (typeof input === "string") {
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) {
      throw new TypeError(
        `toNepaliDate: cannot parse string "${input}" — strings are interpreted as Gregorian ISO. For BS strings, use NepaliDate.parse() first.`,
      );
    }
    return NepaliDate.fromJsDate(d);
  }
  throw new TypeError(
    "toNepaliDate: input must be NepaliDate, Date, number, or string",
  );
}

function resolveLocale(options: DistanceOptions | undefined): Locale {
  if (!options || options.locale === undefined) return resolveGlobalLocale();
  return typeof options.locale === "string"
    ? getLocale(options.locale)
    : options.locale;
}

// ---------- internal core ----------

/** Returns the bare duration phrase (no suffix) for `|a − b|`. */
function distanceCore(
  a: NepaliDate,
  b: NepaliDate,
  S: LocaleRelativeTime,
): string {
  const abs = Math.abs(differenceInMilliseconds(a, b));

  const minutes = Math.round(abs / 60_000);
  const hours = Math.round(abs / 3_600_000);
  const days = Math.round(abs / 86_400_000);

  if (abs < 60_000) return S.lessThanMinute;
  if (minutes < 45) return S.minute(minutes);
  if (minutes < 90) return S.aboutHour(1);
  if (hours < 24) return S.aboutHour(hours);
  if (hours < 42) return S.aboutDay(1);
  if (days < 30) return S.day(days);
  if (days < 60) return S.aboutMonth(1);
  if (days < 365) return S.month(Math.round(days / 30));
  if (days < 365 * 2) {
    const y = days / 365;
    if (y < 1.25) return S.aboutYear(1);
    if (y < 1.75) return S.almostYear(2);
    return S.overYear(1);
  }
  return S.year(Math.floor(days / 365));
}

function distanceWithSuffix(
  a: NepaliDate,
  b: NepaliDate,
  S: LocaleRelativeTime,
): string {
  const core = distanceCore(a, b, S);
  return differenceInMilliseconds(a, b) > 0 ? S.in(core) : S.ago(core);
}

function relativeCore(
  d: NepaliDate,
  base: NepaliDate,
  loc: Locale,
): string {
  const S = resolveRelativeTime(loc);
  if (isSameDay(d, base)) return S.today;
  if (isYesterday(d) && base.isSameDay(NepaliDate.now())) return S.yesterday;
  if (isTomorrow(d) && base.isSameDay(NepaliDate.now())) return S.tomorrow;

  const days = differenceInCalendarDays(d, base);
  if (days > 0 && days <= 7) return S.inNDays(days);
  if (days < 0 && days >= -7) return S.nDaysAgo(-days);
  return d.format("YYYY-MM-DD", { locale: loc });
}

// ============================================================
//                       PUBLIC API
// ============================================================

/**
 * Plain-duration distance between two moments in the active locale. **No suffix.**
 *
 * @example
 * formatDistance("2024-04-13", "2024-04-20")              // "7 days"
 * formatDistance("2024-04-13", "2024-04-20", { locale: "ne" }) // "७ दिन"
 */
export function formatDistance(
  a: DateInput,
  b: DateInput,
  options?: DistanceOptions,
): string {
  return distanceCore(
    toNepaliDate(a),
    toNepaliDate(b),
    resolveRelativeTime(resolveLocale(options)),
  );
}

/**
 * Time-ago / time-until vs. now in the active locale. **Always includes a
 * past/future suffix** (`"ago"` / `"in …"` for `"en"`, `"अघि"` / `"पछि"` for `"ne"`).
 *
 * Equivalent to dayjs's `dayjs(x).fromNow()` / `.toNow()`.
 *
 * @example
 * formatDistanceToNow(post.createdAt)                       // "5 minutes ago"
 * formatDistanceToNow(Date.now() + 86_400_000, { locale: "ne" }) // "१ दिन पछि"
 */
export function formatDistanceToNow(
  input: DateInput,
  options?: DistanceOptions,
): string {
  return distanceWithSuffix(
    toNepaliDate(input),
    NepaliDate.now(),
    resolveRelativeTime(resolveLocale(options)),
  );
}

/**
 * Smart relative phrasing in the active locale: `"yesterday"`, `"today"`,
 * `"tomorrow"`, `"in N days"`, `"N days ago"`, falling back to a date string
 * for distant dates.
 *
 * @example
 * formatRelative(Date.now() - 86_400_000)                       // "yesterday"
 * formatRelative(Date.now() + 3 * 86_400_000, undefined, { locale: "ne" }) // "३ दिनमा"
 */
export function formatRelative(
  date: DateInput,
  base: DateInput = NepaliDate.now(),
  options?: DistanceOptions,
): string {
  return relativeCore(
    toNepaliDate(date),
    toNepaliDate(base),
    resolveLocale(options),
  );
}
