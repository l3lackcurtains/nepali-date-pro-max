/**
 * Interval enumerators — date-fns-style. Each function yields every BS unit
 * (day, week, month, year) within `[start, end]` inclusive. Order follows the
 * sign of `end − start` (forward by default; reversed if `end < start`).
 */

import { startOfWeek, type NepaliInterval } from "./comparisons.js";
import { NepaliDate } from "./nepali-date.js";

/**
 * Every BS calendar day in `interval`, inclusive of both endpoints.
 *
 * @example
 * eachDayOfInterval({
 *   start: NepaliDate.fromBs(2081, 1, 1),
 *   end:   NepaliDate.fromBs(2081, 1, 7),
 * }).map(d => d.toString())
 * // → ["2081-01-01","2081-01-02",…,"2081-01-07"]
 */
export function eachDayOfInterval(interval: NepaliInterval): NepaliDate[] {
  const { start, end } = interval;
  const sign = start.isAfter(end) ? -1 : 1;
  const total = Math.abs(start.diffDays(end));
  const out: NepaliDate[] = [];
  for (let i = 0; i <= total; i++) out.push(start.addDays(i * sign));
  return out;
}

/**
 * Every BS month within `interval`, returning the **first day** of each month.
 */
export function eachMonthOfInterval(interval: NepaliInterval): NepaliDate[] {
  const { start, end } = interval;
  const sign = start.isAfter(end) ? -1 : 1;
  const out: NepaliDate[] = [];
  let cur = NepaliDate.fromBs(start.getYear(), start.getMonth(), 1);
  const last = NepaliDate.fromBs(end.getYear(), end.getMonth(), 1);
  while (
    sign === 1 ? !cur.isAfter(last) : !cur.isBefore(last)
  ) {
    out.push(cur);
    cur = cur.addMonths(sign);
  }
  return out;
}

/** Every BS year within `interval`, returning Baishakh 1 of each. */
export function eachYearOfInterval(interval: NepaliInterval): NepaliDate[] {
  const { start, end } = interval;
  const sign = start.isAfter(end) ? -1 : 1;
  const out: NepaliDate[] = [];
  for (
    let y = start.getYear();
    sign === 1 ? y <= end.getYear() : y >= end.getYear();
    y += sign
  ) {
    out.push(NepaliDate.fromBs(y, 1, 1));
  }
  return out;
}

/**
 * Every week-start within `interval`. Default `weekStartsOn = 0` (Sunday).
 */
export function eachWeekOfInterval(
  interval: NepaliInterval,
  options: { weekStartsOn?: number } = {},
): NepaliDate[] {
  const { start, end } = interval;
  const sign = start.isAfter(end) ? -1 : 1;
  const out: NepaliDate[] = [];
  let cur = startOfWeek(start, options);
  const last = startOfWeek(end, options);
  while (sign === 1 ? !cur.isAfter(last) : !cur.isBefore(last)) {
    out.push(cur);
    cur = cur.addDays(7 * sign);
  }
  return out;
}

/** Every Nth weekday within `interval` (e.g. all Saturdays). `weekday` 0=Sun..6=Sat. */
export function eachWeekendOfInterval(
  interval: NepaliInterval,
  weekday = 6,
): NepaliDate[] {
  return eachDayOfInterval(interval).filter((d) => d.getDay() === weekday);
}
