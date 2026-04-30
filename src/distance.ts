/**
 * Human-readable distance formatters — date-fns style.
 *
 * Pick a function based on what you want; no options to configure.
 *
 * | Function                       | Suffix? | Output language |
 * |--------------------------------|---------|-----------------|
 * | `formatDistance(a, b)`         | no      | English         |
 * | `formatDistanceNepali(a, b)`   | no      | Nepali (नेपाली) |
 * | `formatDistanceToNow(x)`       | yes     | English         |
 * | `formatDistanceToNowNepali(x)` | yes     | Nepali          |
 * | `formatRelative(x, base?)`     | (smart) | English         |
 * | `formatRelativeNepali(x, b?)`  | (smart) | Nepali          |
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
import { toDevanagariDigits } from "./constants.js";
import {
  differenceInCalendarDays,
  differenceInMilliseconds,
} from "./diff.js";
import { NepaliDate } from "./nepali-date.js";

/** Anything the distance/relative functions can accept. */
export type DateInput = NepaliDate | Date | number | string;

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

// ---------- internal language strings ----------

interface Phrasebook {
  lessThanMinute: string;
  minute(n: number): string;
  aboutHour(n: number): string;
  aboutDay(n: number): string;
  day(n: number): string;
  aboutMonth(n: number): string;
  month(n: number): string;
  aboutYear(n: number): string;
  almostYear(n: number): string;
  overYear(n: number): string;
  year(n: number): string;
  ago(s: string): string;
  in(s: string): string;
  today: string;
  yesterday: string;
  tomorrow: string;
  inNDays(n: number): string;
  nDaysAgo(n: number): string;
}

const EN: Phrasebook = {
  lessThanMinute: "less than a minute",
  minute: (n) => `${n} minute${n === 1 ? "" : "s"}`,
  aboutHour: (n) => `about ${n} hour${n === 1 ? "" : "s"}`,
  aboutDay: (n) => `about ${n} day${n === 1 ? "" : "s"}`,
  day: (n) => `${n} day${n === 1 ? "" : "s"}`,
  aboutMonth: (n) => `about ${n} month${n === 1 ? "" : "s"}`,
  month: (n) => `${n} month${n === 1 ? "" : "s"}`,
  aboutYear: (n) => `about ${n} year${n === 1 ? "" : "s"}`,
  almostYear: (n) => `almost ${n} year${n === 1 ? "" : "s"}`,
  overYear: (n) => `over ${n} year${n === 1 ? "" : "s"}`,
  year: (n) => `${n} year${n === 1 ? "" : "s"}`,
  ago: (s) => `${s} ago`,
  in: (s) => `in ${s}`,
  today: "today",
  yesterday: "yesterday",
  tomorrow: "tomorrow",
  inNDays: (n) => `in ${n} days`,
  nDaysAgo: (n) => `${n} days ago`,
};

const NE: Phrasebook = {
  lessThanMinute: "एक मिनेटभन्दा कम",
  minute: (n) => `${toDevanagariDigits(n)} मिनेट`,
  aboutHour: (n) => `लगभग ${toDevanagariDigits(n)} घण्टा`,
  aboutDay: (n) => `लगभग ${toDevanagariDigits(n)} दिन`,
  day: (n) => `${toDevanagariDigits(n)} दिन`,
  aboutMonth: (n) => `लगभग ${toDevanagariDigits(n)} महिना`,
  month: (n) => `${toDevanagariDigits(n)} महिना`,
  aboutYear: (n) => `लगभग ${toDevanagariDigits(n)} वर्ष`,
  almostYear: (n) => `झण्डै ${toDevanagariDigits(n)} वर्ष`,
  overYear: (n) => `${toDevanagariDigits(n)} वर्षभन्दा बढी`,
  year: (n) => `${toDevanagariDigits(n)} वर्ष`,
  ago: (s) => `${s} अघि`,
  in: (s) => `${s} पछि`,
  today: "आज",
  yesterday: "हिजो",
  tomorrow: "भोलि",
  inNDays: (n) => `${toDevanagariDigits(n)} दिनमा`,
  nDaysAgo: (n) => `${toDevanagariDigits(n)} दिन अघि`,
};

// ---------- internal core ----------

/** Returns the bare duration phrase (no suffix) for `|a − b|`. */
function distanceCore(a: NepaliDate, b: NepaliDate, S: Phrasebook): string {
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
  S: Phrasebook,
): string {
  const core = distanceCore(a, b, S);
  return differenceInMilliseconds(a, b) > 0 ? S.in(core) : S.ago(core);
}

function relativeCore(d: NepaliDate, base: NepaliDate, S: Phrasebook): string {
  if (isSameDay(d, base)) return S.today;
  if (isYesterday(d) && base.isSameDay(NepaliDate.now())) return S.yesterday;
  if (isTomorrow(d) && base.isSameDay(NepaliDate.now())) return S.tomorrow;

  const days = differenceInCalendarDays(d, base);
  if (days > 0 && days <= 7) return S.inNDays(days);
  if (days < 0 && days >= -7) return S.nDaysAgo(-days);
  return d.format("YYYY-MM-DD", { nepali: S === NE });
}

// ============================================================
//                       PUBLIC API
// ============================================================

/**
 * Plain-duration English distance between two moments. **No suffix.**
 *
 * @example
 * formatDistance("2024-04-13", "2024-04-20")      // "7 days"
 * formatDistance(Date.now() - 5 * 60_000, Date.now()) // "5 minutes"
 */
export function formatDistance(a: DateInput, b: DateInput): string {
  return distanceCore(toNepaliDate(a), toNepaliDate(b), EN);
}

/**
 * Plain-duration Nepali (Devanagari) distance between two moments. **No suffix.**
 *
 * @example
 * formatDistanceNepali("2024-04-13", "2024-04-20") // "७ दिन"
 */
export function formatDistanceNepali(a: DateInput, b: DateInput): string {
  return distanceCore(toNepaliDate(a), toNepaliDate(b), NE);
}

/**
 * English time-ago / time-until vs. now. **Always includes "ago" or "in" suffix.**
 *
 * The dayjs equivalent of `dayjs(x).fromNow()` (and `.toNow()` for future dates).
 *
 * @example
 * formatDistanceToNow(post.createdAt)              // "5 minutes ago"
 * formatDistanceToNow(new Date("2024-04-13"))      // "2 years ago"
 * formatDistanceToNow(Date.now() + 86_400_000)     // "in 1 day"
 */
export function formatDistanceToNow(input: DateInput): string {
  return distanceWithSuffix(toNepaliDate(input), NepaliDate.now(), EN);
}

/**
 * Nepali (Devanagari) time-ago / time-until vs. now. **Always includes
 * "अघि" or "पछि" suffix.**
 *
 * @example
 * formatDistanceToNowNepali(Date.now() - 5 * 60_000) // "५ मिनेट अघि"
 * formatDistanceToNowNepali(Date.now() + 86_400_000) // "१ दिन पछि"
 */
export function formatDistanceToNowNepali(input: DateInput): string {
  return distanceWithSuffix(toNepaliDate(input), NepaliDate.now(), NE);
}

/**
 * Smart relative phrasing in English: `"yesterday"`, `"today"`, `"tomorrow"`,
 * `"in N days"`, `"N days ago"`, falling back to a date string for distant dates.
 *
 * @example
 * formatRelative(Date.now() - 86_400_000)   // "yesterday"
 * formatRelative(Date.now() + 3 * 86_400_000) // "in 3 days"
 */
export function formatRelative(
  date: DateInput,
  base: DateInput = NepaliDate.now(),
): string {
  return relativeCore(toNepaliDate(date), toNepaliDate(base), EN);
}

/**
 * Smart relative phrasing in Nepali (Devanagari).
 *
 * @example
 * formatRelativeNepali(Date.now() - 86_400_000)   // "हिजो"
 * formatRelativeNepali(Date.now() + 3 * 86_400_000) // "३ दिनमा"
 */
export function formatRelativeNepali(
  date: DateInput,
  base: DateInput = NepaliDate.now(),
): string {
  return relativeCore(toNepaliDate(date), toNepaliDate(base), NE);
}
