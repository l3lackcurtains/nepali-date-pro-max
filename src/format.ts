/**
 * Token-based formatting for BS dates and times.
 *
 * Supported tokens (case-sensitive):
 *
 *   YYYY   — 4-digit BS year                  e.g. 2081
 *   YY     — 2-digit BS year                  e.g. 81
 *   MMMM   — Full Roman month name            e.g. Baishakh
 *   MMM    — Short Roman month name           e.g. Bai
 *   MM     — 2-digit month                    e.g. 01
 *   M      — Month, no padding                e.g. 1
 *   DD     — 2-digit day of month             e.g. 05
 *   D      — Day of month, no padding         e.g. 5
 *   dddd   — Full Roman weekday               e.g. Saturday
 *   ddd    — Short Roman weekday              e.g. Sat
 *   dd     — Min Roman weekday                e.g. Sa
 *   HH     — 2-digit 24h hour                 e.g. 09
 *   H      — 24h hour, no padding             e.g. 9
 *   hh     — 2-digit 12h hour                 e.g. 09
 *   h      — 12h hour, no padding             e.g. 9
 *   mm     — 2-digit minutes                  e.g. 03
 *   m      — Minutes, no padding              e.g. 3
 *   ss     — 2-digit seconds                  e.g. 07
 *   s      — Seconds, no padding              e.g. 7
 *   A      — AM/PM
 *   a      — am/pm
 *
 * For Nepali (Devanagari) output, append `{ nepali: true }` to use Devanagari
 * digits and Devanagari month/weekday names.
 *
 * Use square brackets to escape literal text: `"[year] YYYY"` → `"year 2081"`.
 */

import {
  BS_MONTH_NAMES,
  BS_MONTH_NAMES_NP,
  BS_MONTH_NAMES_SHORT,
  WEEKDAY_NAMES,
  WEEKDAY_NAMES_MIN,
  WEEKDAY_NAMES_NP,
  WEEKDAY_NAMES_NP_SHORT,
  WEEKDAY_NAMES_SHORT,
  toDevanagariDigits,
} from "./constants.js";
import { bsWeekday } from "./convert.js";
import type { BsDateTime } from "./types.js";

/** Options for {@link formatBs}. */
export interface FormatOptions {
  /**
   * When true, render digits in Devanagari and use Nepali month/weekday names.
   * Default: false.
   */
  nepali?: boolean;
}

const TOKEN_RE =
  /\[([^\]]+)\]|YYYY|YY|MMMM|MMM|MM|M|DD|D|dddd|ddd|dd|HH|H|hh|h|mm|m|ss|s|A|a/g;

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/**
 * Format a BS date (with optional time) as a string.
 *
 * @example
 * formatBs({ year: 2081, month: 1, day: 1 }, "YYYY-MM-DD")
 * // → "2081-01-01"
 *
 * formatBs({ year: 2081, month: 1, day: 1 }, "DD MMMM, YYYY (dddd)")
 * // → "01 Baishakh, 2081 (Saturday)"
 *
 * formatBs({ year: 2081, month: 1, day: 1 }, "DD MMMM YYYY", { nepali: true })
 * // → "०१ बैशाख २०८१"
 */
export function formatBs(
  date: BsDateTime,
  pattern: string,
  options: FormatOptions = {},
): string {
  const { year, month, day } = date;
  const hour = date.hour ?? 0;
  const minute = date.minute ?? 0;
  const second = date.second ?? 0;
  const np = options.nepali === true;
  const wd = bsWeekday(year, month, day);
  const monthIdx = month - 1;

  const out = pattern.replace(TOKEN_RE, (match, escaped: string | undefined) => {
    if (escaped !== undefined) return escaped;
    switch (match) {
      case "YYYY":
        return np ? toDevanagariDigits(year) : String(year);
      case "YY": {
        const yy = year % 100;
        return np ? toDevanagariDigits(pad2(yy)) : pad2(yy);
      }
      case "MMMM":
        return np ? BS_MONTH_NAMES_NP[monthIdx]! : BS_MONTH_NAMES[monthIdx]!;
      case "MMM":
        return np
          ? BS_MONTH_NAMES_NP[monthIdx]!
          : BS_MONTH_NAMES_SHORT[monthIdx]!;
      case "MM":
        return np ? toDevanagariDigits(pad2(month)) : pad2(month);
      case "M":
        return np ? toDevanagariDigits(month) : String(month);
      case "DD":
        return np ? toDevanagariDigits(pad2(day)) : pad2(day);
      case "D":
        return np ? toDevanagariDigits(day) : String(day);
      case "dddd":
        return np ? WEEKDAY_NAMES_NP[wd]! : WEEKDAY_NAMES[wd]!;
      case "ddd":
        return np ? WEEKDAY_NAMES_NP_SHORT[wd]! : WEEKDAY_NAMES_SHORT[wd]!;
      case "dd":
        return np ? WEEKDAY_NAMES_NP_SHORT[wd]! : WEEKDAY_NAMES_MIN[wd]!;
      case "HH":
        return np ? toDevanagariDigits(pad2(hour)) : pad2(hour);
      case "H":
        return np ? toDevanagariDigits(hour) : String(hour);
      case "hh": {
        const h12 = hour % 12 === 0 ? 12 : hour % 12;
        return np ? toDevanagariDigits(pad2(h12)) : pad2(h12);
      }
      case "h": {
        const h12 = hour % 12 === 0 ? 12 : hour % 12;
        return np ? toDevanagariDigits(h12) : String(h12);
      }
      case "mm":
        return np ? toDevanagariDigits(pad2(minute)) : pad2(minute);
      case "m":
        return np ? toDevanagariDigits(minute) : String(minute);
      case "ss":
        return np ? toDevanagariDigits(pad2(second)) : pad2(second);
      case "s":
        return np ? toDevanagariDigits(second) : String(second);
      case "A":
        return hour < 12 ? "AM" : "PM";
      case "a":
        return hour < 12 ? "am" : "pm";
      default:
        return match;
    }
  });

  return out;
}
