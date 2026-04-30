/**
 * Human-readable distance formatters.
 *
 * - {@link formatDistance} — the gap between two dates in plain words
 *   (`"about 3 hours"`, `"5 days"`, `"almost 2 years"`).
 * - {@link formatDistanceToNow} — same, vs. the current Nepal moment.
 * - {@link formatRelative} — relative phrasing (`"yesterday"`, `"in 3 days"`).
 *
 * Output is English by default; pass `{ locale: "ne" }` for Devanagari Nepali.
 */

import { NepaliDate } from "./nepali-date.js";
import { isSameDay, isYesterday, isTomorrow } from "./comparisons.js";
import {
  differenceInCalendarDays,
  differenceInMilliseconds,
} from "./diff.js";
import { toDevanagariDigits } from "./constants.js";

export interface DistanceOptions {
  /** `"en"` (default) or `"ne"` for Devanagari Nepali phrasing. */
  locale?: "en" | "ne";
  /** Include "ago" / "in …" suffix/prefix. Default: `false`. */
  addSuffix?: boolean;
}

const EN = {
  lessThanMinute: "less than a minute",
  minute: (n: number) => `${n} minute${n === 1 ? "" : "s"}`,
  aboutMinute: (n: number) => `about ${n} minute${n === 1 ? "" : "s"}`,
  hour: (n: number) => `${n} hour${n === 1 ? "" : "s"}`,
  aboutHour: (n: number) => `about ${n} hour${n === 1 ? "" : "s"}`,
  day: (n: number) => `${n} day${n === 1 ? "" : "s"}`,
  aboutDay: (n: number) => `about ${n} day${n === 1 ? "" : "s"}`,
  month: (n: number) => `${n} month${n === 1 ? "" : "s"}`,
  aboutMonth: (n: number) => `about ${n} month${n === 1 ? "" : "s"}`,
  year: (n: number) => `${n} year${n === 1 ? "" : "s"}`,
  aboutYear: (n: number) => `about ${n} year${n === 1 ? "" : "s"}`,
  almostYear: (n: number) => `almost ${n} year${n === 1 ? "" : "s"}`,
  overYear: (n: number) => `over ${n} year${n === 1 ? "" : "s"}`,
  ago: (s: string) => `${s} ago`,
  in: (s: string) => `in ${s}`,
};

const NE = {
  lessThanMinute: "एक मिनेटभन्दा कम",
  minute: (n: number) => `${toDevanagariDigits(n)} मिनेट`,
  aboutMinute: (n: number) => `लगभग ${toDevanagariDigits(n)} मिनेट`,
  hour: (n: number) => `${toDevanagariDigits(n)} घण्टा`,
  aboutHour: (n: number) => `लगभग ${toDevanagariDigits(n)} घण्टा`,
  day: (n: number) => `${toDevanagariDigits(n)} दिन`,
  aboutDay: (n: number) => `लगभग ${toDevanagariDigits(n)} दिन`,
  month: (n: number) => `${toDevanagariDigits(n)} महिना`,
  aboutMonth: (n: number) => `लगभग ${toDevanagariDigits(n)} महिना`,
  year: (n: number) => `${toDevanagariDigits(n)} वर्ष`,
  aboutYear: (n: number) => `लगभग ${toDevanagariDigits(n)} वर्ष`,
  almostYear: (n: number) => `झण्डै ${toDevanagariDigits(n)} वर्ष`,
  overYear: (n: number) => `${toDevanagariDigits(n)} वर्षभन्दा बढी`,
  ago: (s: string) => `${s} अघि`,
  in: (s: string) => `${s} पछि`,
};

function pickStrings(locale: DistanceOptions["locale"]) {
  return locale === "ne" ? NE : EN;
}

/**
 * Words for the distance between `a` and `b`. By default, no `ago`/`in` suffix.
 *
 * @example
 * formatDistance(a, b)                                  // "5 days"
 * formatDistance(a, b, { addSuffix: true })             // "5 days ago" or "in 5 days"
 * formatDistance(a, b, { locale: "ne", addSuffix: true })  // "५ दिन अघि"
 */
export function formatDistance(
  a: NepaliDate,
  b: NepaliDate,
  options: DistanceOptions = {},
): string {
  const ms = differenceInMilliseconds(a, b);
  const future = ms > 0;
  const abs = Math.abs(ms);
  const S = pickStrings(options.locale);

  let core: string;
  const minutes = Math.round(abs / 60_000);
  const hours = Math.round(abs / 3_600_000);
  const days = Math.round(abs / 86_400_000);

  if (abs < 60_000) core = S.lessThanMinute;
  else if (minutes < 45) core = S.minute(minutes);
  else if (minutes < 90) core = S.aboutHour(1);
  else if (hours < 24) core = S.aboutHour(hours);
  else if (hours < 42) core = S.aboutDay(1);
  else if (days < 30) core = S.day(days);
  else if (days < 60) core = S.aboutMonth(1);
  else if (days < 365) core = S.month(Math.round(days / 30));
  else if (days < 365 * 2) {
    const y = days / 365;
    if (y < 1.25) core = S.aboutYear(1);
    else if (y < 1.75) core = S.almostYear(2);
    else core = S.overYear(1);
  } else {
    const years = Math.floor(days / 365);
    core = S.year(years);
  }

  if (!options.addSuffix) return core;
  return future ? S.in(core) : S.ago(core);
}

/** Distance between `date` and now (current Nepal moment). */
export function formatDistanceToNow(
  date: NepaliDate,
  options: DistanceOptions = {},
): string {
  return formatDistance(date, NepaliDate.now(), options);
}

/**
 * Relative phrasing: `"yesterday"`, `"today"`, `"tomorrow"`,
 * `"in N days"`, `"N days ago"`, falling back to a date string.
 *
 * @example
 * formatRelative(yesterday)                  // "yesterday"
 * formatRelative(in3, { locale: "ne" })      // "३ दिनमा"
 */
export function formatRelative(
  date: NepaliDate,
  base: NepaliDate = NepaliDate.now(),
  options: DistanceOptions = {},
): string {
  const ne = options.locale === "ne";
  if (isSameDay(date, base)) return ne ? "आज" : "today";
  if (isYesterday(date) && base.isSameDay(NepaliDate.now()))
    return ne ? "हिजो" : "yesterday";
  if (isTomorrow(date) && base.isSameDay(NepaliDate.now()))
    return ne ? "भोलि" : "tomorrow";

  const days = differenceInCalendarDays(date, base);
  if (days > 0 && days <= 7)
    return ne ? `${toDevanagariDigits(days)} दिनमा` : `in ${days} days`;
  if (days < 0 && days >= -7)
    return ne ? `${toDevanagariDigits(-days)} दिन अघि` : `${-days} days ago`;
  return date.format("YYYY-MM-DD", { nepali: ne });
}
