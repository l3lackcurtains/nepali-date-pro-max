/**
 * Token-based formatting for BS dates and times.
 *
 * Supported tokens (case-sensitive):
 *
 *   YYYY   — 4-digit BS year                  e.g. 2081
 *   YY     — 2-digit BS year                  e.g. 81
 *   MMMM   — Full month name (locale)         e.g. Baishakh / बैशाख
 *   MMM    — Short month name (locale)        e.g. Bai / बैशाख
 *   MM     — 2-digit month                    e.g. 01
 *   M      — Month, no padding                e.g. 1
 *   DD     — 2-digit day of month             e.g. 05
 *   D      — Day of month, no padding         e.g. 5
 *   dddd   — Full weekday (locale)            e.g. Saturday / शनिबार
 *   ddd    — Short weekday (locale)           e.g. Sat / शनि
 *   dd     — Min weekday (locale)             e.g. Sa / शनि
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
 * Localisation is driven by the active {@link Locale}: pass `{ locale: "ne" }`
 * for Devanagari output (digits + month/weekday names), or set
 * `NepaliDate.locale("ne")` once at app boot to make it the default.
 *
 * Use square brackets to escape literal text: `"[year] YYYY"` → `"year 2081"`.
 */

import { bsWeekday } from "./convert.js";
import {
  getLocale,
  type Locale,
  resolveGlobalLocale,
} from "./locale.js";
import type { BsDateTime } from "./types.js";

/** Options for {@link formatBs}. */
export interface FormatOptions {
  /**
   * Locale name (e.g. `"en"`, `"ne"`) or a `Locale` object. Defaults to the
   * global locale set via `NepaliDate.locale(...)` (which itself defaults to
   * `"en"`).
   */
  locale?: string | Locale;
}

const TOKEN_RE =
  /\[([^\]]+)\]|YYYY|YY|MMMM|MMM|MM|M|DD|D|dddd|ddd|dd|HH|H|hh|h|mm|m|ss|s|A|a/g;

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function resolveLocale(options: FormatOptions): Locale {
  if (options.locale) {
    return typeof options.locale === "string"
      ? getLocale(options.locale)
      : options.locale;
  }
  return resolveGlobalLocale();
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
 * formatBs({ year: 2081, month: 1, day: 1 }, "DD MMMM YYYY", { locale: "ne" })
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
  const loc = resolveLocale(options);
  const d = loc.digits;
  const wd = bsWeekday(year, month, day);
  const monthIdx = month - 1;

  const out = pattern.replace(TOKEN_RE, (match, escaped: string | undefined) => {
    if (escaped !== undefined) return escaped;
    switch (match) {
      case "YYYY":
        return d(year);
      case "YY":
        return d(pad2(year % 100));
      case "MMMM":
        return loc.months[monthIdx]!;
      case "MMM":
        return loc.monthsShort[monthIdx]!;
      case "MM":
        return d(pad2(month));
      case "M":
        return d(month);
      case "DD":
        return d(pad2(day));
      case "D":
        return d(day);
      case "dddd":
        return loc.weekdays[wd]!;
      case "ddd":
        return loc.weekdaysShort[wd]!;
      case "dd":
        return loc.weekdaysMin[wd]!;
      case "HH":
        return d(pad2(hour));
      case "H":
        return d(hour);
      case "hh": {
        const h12 = hour % 12 === 0 ? 12 : hour % 12;
        return d(pad2(h12));
      }
      case "h": {
        const h12 = hour % 12 === 0 ? 12 : hour % 12;
        return d(h12);
      }
      case "mm":
        return d(pad2(minute));
      case "m":
        return d(minute);
      case "ss":
        return d(pad2(second));
      case "s":
        return d(second);
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
