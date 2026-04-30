/**
 * Difference helpers — date-fns-style. Each function returns a signed integer
 * representing `a − b` in the named unit. "Calendar" variants count boundary
 * crossings; non-calendar variants count whole units of duration.
 */

import { NepaliDate } from "./nepali-date.js";

/** Signed whole days, `a − b`, by elapsed time. */
export function differenceInDays(a: NepaliDate, b: NepaliDate): number {
  return a.diffDays(b);
}

/** Signed whole weeks, `a − b`, truncated towards zero. */
export function differenceInWeeks(a: NepaliDate, b: NepaliDate): number {
  return Math.trunc(differenceInDays(a, b) / 7);
}

/** Signed whole hours, truncated towards zero. */
export function differenceInHours(a: NepaliDate, b: NepaliDate): number {
  return Math.trunc(differenceInMilliseconds(a, b) / 3_600_000);
}

/** Signed whole minutes, truncated towards zero. */
export function differenceInMinutes(a: NepaliDate, b: NepaliDate): number {
  return Math.trunc(differenceInMilliseconds(a, b) / 60_000);
}

/** Signed whole seconds, truncated towards zero. */
export function differenceInSeconds(a: NepaliDate, b: NepaliDate): number {
  return Math.trunc(differenceInMilliseconds(a, b) / 1000);
}

/** Signed milliseconds, `a − b`. */
export function differenceInMilliseconds(
  a: NepaliDate,
  b: NepaliDate,
): number {
  return a.toJsDate().getTime() - b.toJsDate().getTime();
}

/**
 * Calendar-day difference, ignoring time-of-day. Equivalent to
 * `startOfDay(a).diffDays(startOfDay(b))`.
 */
export function differenceInCalendarDays(
  a: NepaliDate,
  b: NepaliDate,
): number {
  const aStart = NepaliDate.fromBs(a.getYear(), a.getMonth(), a.getDate());
  const bStart = NepaliDate.fromBs(b.getYear(), b.getMonth(), b.getDate());
  return aStart.diffDays(bStart);
}

/** Number of BS month-boundaries crossed (signed). */
export function differenceInCalendarMonths(
  a: NepaliDate,
  b: NepaliDate,
): number {
  return (a.getYear() - b.getYear()) * 12 + (a.getMonth() - b.getMonth());
}

/**
 * Whole BS months between, signed. If `a` is after `b` but the day-of-month is
 * earlier, the count is reduced by 1 (and vice versa) — matches date-fns.
 */
export function differenceInMonths(a: NepaliDate, b: NepaliDate): number {
  const sign = a.isBefore(b) ? -1 : 1;
  const [later, earlier] = sign === 1 ? [a, b] : [b, a];
  let months = differenceInCalendarMonths(later, earlier);
  if (later.getDate() < earlier.getDate()) months -= 1;
  return sign * Math.max(0, months);
}

/** Number of BS year-boundaries crossed (signed). */
export function differenceInCalendarYears(
  a: NepaliDate,
  b: NepaliDate,
): number {
  return a.getYear() - b.getYear();
}

/** Whole BS years between, signed. Mirrors {@link differenceInMonths}. */
export function differenceInYears(a: NepaliDate, b: NepaliDate): number {
  return Math.trunc(differenceInMonths(a, b) / 12);
}
