/**
 * Cross-calendar range conversion.
 *
 * Take a date range expressed in one calendar (AD or BS) and project it
 * into the other. Two granularities are supported:
 *
 *  - **Endpoint conversion** — convert just `start` and `end`. Cheap.
 *    `convertAdRangeToBs(adStart, adEnd)` → `{ start, end }` BS pair.
 *
 *  - **Full enumeration** — every day in the range, projected and optionally
 *    formatted. `eachBsDayInAdRange(adStart, adEnd, options)` →
 *    `string[]` (when `format` is provided) or `BsDate[]` (raw).
 *
 * @example
 * // Convert just the bounds:
 * convertAdRangeToBs({ year: 2024, month: 1, day: 1 }, { year: 2024, month: 12, day: 31 })
 * // → { start: { year: 2080, month: 9, day: 16 }, end: { year: 2081, month: 9, day: 16 } }
 *
 * @example
 * // Enumerate every day, formatted:
 * eachBsDayInAdRange(
 *   { year: 2024, month: 4, day: 13 },
 *   { year: 2024, month: 4, day: 17 },
 *   { format: "DD MMMM YYYY" },
 * )
 * // → ["13 Baishakh 2081", "14 Baishakh 2081", … "17 Baishakh 2081"]
 *
 * @example
 * // Devanagari output:
 * eachBsDayInAdRange(start, end, { format: "YYYY-MM-DD", locale: "ne" })
 * // → ["२०८१-०१-०१", …]
 */

import { adToBs, bsToAd } from "./convert.js";
import { type FormatOptions, formatBs } from "./format.js";
import { NepaliDate } from "./nepali-date.js";
import type { AdDate, BsDate } from "./types.js";

/** Either a plain `{year, month, day}` object or a JS `Date`. */
export type AdInput = AdDate | Date;

/**
 * Normalize an `AdInput` (plain object or `Date`) to a calendar-date triple.
 *
 * For `Date` inputs we read the **UTC** components, not local-timezone ones.
 * This matches how ISO date strings are parsed (`new Date("2024-04-13")` is
 * UTC midnight on April 13), and gives stable results across hosts. If you
 * need a host-local interpretation, pass a plain `{year, month, day}` object.
 */
function normalizeAd(input: AdInput): AdDate {
  if (input instanceof Date) {
    return {
      year: input.getUTCFullYear(),
      month: input.getUTCMonth() + 1,
      day: input.getUTCDate(),
    };
  }
  return input;
}

/** Options controlling range conversion output. */
export interface RangeConvertOptions extends FormatOptions {
  /**
   * If provided, each output element is a string formatted with this token
   * pattern (see {@link formatBs}). If omitted, raw `{year, month, day}`
   * objects are returned (or `AdDate[]` for `eachAd*` functions).
   */
  format?: string;
}

// =============================================================
// AD range → BS  (the headline use case)
// =============================================================

/**
 * Convert just the bounds of an AD range into BS.
 * @example
 * convertAdRangeToBs(
 *   { year: 2024, month: 1, day: 1 },
 *   { year: 2024, month: 12, day: 31 },
 * )
 */
export function convertAdRangeToBs(
  start: AdInput,
  end: AdInput,
): { start: BsDate; end: BsDate };
/**
 * Convert just the bounds of an AD range into BS, formatted as strings.
 * @example
 * convertAdRangeToBs(
 *   { year: 2024, month: 1, day: 1 },
 *   { year: 2024, month: 12, day: 31 },
 *   { format: "DD MMMM YYYY" },
 * )
 * // → { start: "16 Poush 2080", end: "16 Poush 2081" }
 */
export function convertAdRangeToBs(
  start: AdInput,
  end: AdInput,
  options: RangeConvertOptions & { format: string },
): { start: string; end: string };
export function convertAdRangeToBs(
  start: AdInput,
  end: AdInput,
  options: RangeConvertOptions = {},
): { start: BsDate | string; end: BsDate | string } {
  const a = normalizeAd(start);
  const b = normalizeAd(end);
  const bsA = adToBs(a.year, a.month, a.day);
  const bsB = adToBs(b.year, b.month, b.day);
  if (options.format) {
    return {
      start: formatBs(bsA, options.format, { locale: options.locale }),
      end: formatBs(bsB, options.format, { locale: options.locale }),
    };
  }
  return { start: bsA, end: bsB };
}

/**
 * Enumerate every BS day for an AD range, inclusive.
 * Returns `string[]` when `options.format` is provided, otherwise `BsDate[]`.
 * @example
 * eachBsDayInAdRange(
 *   new Date("2024-04-13"),
 *   new Date("2024-04-15"),
 *   { format: "DD MMMM YYYY" },
 * )
 * // → ["13 Baishakh 2081", "14 Baishakh 2081", "15 Baishakh 2081"]
 */
export function eachBsDayInAdRange(
  start: AdInput,
  end: AdInput,
): BsDate[];
export function eachBsDayInAdRange(
  start: AdInput,
  end: AdInput,
  options: RangeConvertOptions & { format: string },
): string[];
export function eachBsDayInAdRange(
  start: AdInput,
  end: AdInput,
  options?: RangeConvertOptions,
): BsDate[] | string[];
export function eachBsDayInAdRange(
  start: AdInput,
  end: AdInput,
  options: RangeConvertOptions = {},
): BsDate[] | string[] {
  const a = normalizeAd(start);
  const b = normalizeAd(end);
  const aTs = Date.UTC(a.year, a.month - 1, a.day);
  const bTs = Date.UTC(b.year, b.month - 1, b.day);
  const sign = aTs <= bTs ? 1 : -1;
  const totalDays = Math.abs(Math.round((bTs - aTs) / 86_400_000));
  const out: (BsDate | string)[] = [];
  for (let i = 0; i <= totalDays; i++) {
    const ts = aTs + sign * i * 86_400_000;
    const d = new Date(ts);
    const bs = adToBs(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
    out.push(
      options.format
        ? formatBs(bs, options.format, { locale: options.locale })
        : bs,
    );
  }
  return out as BsDate[] | string[];
}

/**
 * Enumerate every BS month-start touched by an AD range, inclusive.
 * Returns `string[]` when `options.format` is provided, otherwise `BsDate[]`.
 */
export function eachBsMonthInAdRange(
  start: AdInput,
  end: AdInput,
): BsDate[];
export function eachBsMonthInAdRange(
  start: AdInput,
  end: AdInput,
  options: RangeConvertOptions & { format: string },
): string[];
export function eachBsMonthInAdRange(
  start: AdInput,
  end: AdInput,
  options: RangeConvertOptions = {},
): BsDate[] | string[] {
  const a = normalizeAd(start);
  const b = normalizeAd(end);
  const bsA = adToBs(a.year, a.month, a.day);
  const bsB = adToBs(b.year, b.month, b.day);
  const sign = bsA.year * 12 + bsA.month <= bsB.year * 12 + bsB.month ? 1 : -1;
  let cur = NepaliDate.fromBs(bsA.year, bsA.month, 1);
  const last = NepaliDate.fromBs(bsB.year, bsB.month, 1);
  const out: (BsDate | string)[] = [];
  while (sign === 1 ? !cur.isAfter(last) : !cur.isBefore(last)) {
    const bs = cur.toBs();
    out.push(
      options.format
        ? formatBs(bs, options.format, { locale: options.locale })
        : bs,
    );
    cur = cur.addMonths(sign);
  }
  return out as BsDate[] | string[];
}

// =============================================================
// BS range → AD  (the inverse)
// =============================================================

/** Format options for AD-side output (no Devanagari). */
export interface AdRangeFormatOptions {
  /**
   * Format pattern for AD output. Same tokens as {@link formatBs} but using
   * Gregorian month/weekday names. If omitted, raw `{year, month, day}` is returned.
   *
   * Tokens: `YYYY YY MMMM MMM MM M DD D dddd ddd dd HH H hh h mm m ss s A a`,
   * plus `[literal]` escapes.
   */
  format?: string;
}

import {
  AD_MONTH_NAMES,
  AD_MONTH_NAMES_SHORT,
  WEEKDAY_NAMES,
  WEEKDAY_NAMES_MIN,
  WEEKDAY_NAMES_SHORT,
} from "./constants.js";

const AD_TOKEN_RE =
  /\[([^\]]+)\]|YYYY|YY|MMMM|MMM|MM|M|DD|D|dddd|ddd|dd|HH|H|hh|h|mm|m|ss|s|A|a/g;
function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Format an AD date with the same token grammar (English month/weekday names). */
function formatAd(date: AdDate, pattern: string): string {
  const { year, month, day } = date;
  const idx = month - 1;
  const dow = new Date(Date.UTC(year, idx, day)).getUTCDay();
  return pattern.replace(AD_TOKEN_RE, (m, esc: string | undefined) => {
    if (esc !== undefined) return esc;
    switch (m) {
      case "YYYY":
        return String(year);
      case "YY":
        return pad2(year % 100);
      case "MMMM":
        return AD_MONTH_NAMES[idx]!;
      case "MMM":
        return AD_MONTH_NAMES_SHORT[idx]!;
      case "MM":
        return pad2(month);
      case "M":
        return String(month);
      case "DD":
        return pad2(day);
      case "D":
        return String(day);
      case "dddd":
        return WEEKDAY_NAMES[dow]!;
      case "ddd":
        return WEEKDAY_NAMES_SHORT[dow]!;
      case "dd":
        return WEEKDAY_NAMES_MIN[dow]!;
      // time tokens render as zero (no time on plain AdDate) — kept for parity
      case "HH":
      case "hh":
        return "00";
      case "H":
      case "h":
        return "0";
      case "mm":
      case "ss":
        return "00";
      case "m":
      case "s":
        return "0";
      case "A":
        return "AM";
      case "a":
        return "am";
      default:
        return m;
    }
  });
}

/**
 * Convert just the bounds of a BS range into AD.
 * @example
 * convertBsRangeToAd({ year: 2081, month: 1, day: 1 }, { year: 2081, month: 12, day: 30 })
 */
export function convertBsRangeToAd(
  start: BsDate,
  end: BsDate,
): { start: AdDate; end: AdDate };
/** Bounds-only conversion with format string. */
export function convertBsRangeToAd(
  start: BsDate,
  end: BsDate,
  options: AdRangeFormatOptions & { format: string },
): { start: string; end: string };
export function convertBsRangeToAd(
  start: BsDate,
  end: BsDate,
  options: AdRangeFormatOptions = {},
): { start: AdDate | string; end: AdDate | string } {
  const a = bsToAd(start.year, start.month, start.day);
  const b = bsToAd(end.year, end.month, end.day);
  if (options.format) {
    return { start: formatAd(a, options.format), end: formatAd(b, options.format) };
  }
  return { start: a, end: b };
}

/**
 * Enumerate every AD day for a BS range, inclusive.
 * Returns `string[]` when `options.format` is provided, otherwise `AdDate[]`.
 */
export function eachAdDayInBsRange(
  start: BsDate,
  end: BsDate,
): AdDate[];
export function eachAdDayInBsRange(
  start: BsDate,
  end: BsDate,
  options: AdRangeFormatOptions & { format: string },
): string[];
export function eachAdDayInBsRange(
  start: BsDate,
  end: BsDate,
  options: AdRangeFormatOptions = {},
): AdDate[] | string[] {
  const a = NepaliDate.fromBs(start.year, start.month, start.day);
  const b = NepaliDate.fromBs(end.year, end.month, end.day);
  const sign = a.isAfter(b) ? -1 : 1;
  const total = Math.abs(a.diffDays(b));
  const out: (AdDate | string)[] = [];
  for (let i = 0; i <= total; i++) {
    const ad = a.addDays(i * sign).toAd();
    out.push(options.format ? formatAd(ad, options.format) : ad);
  }
  return out as AdDate[] | string[];
}
