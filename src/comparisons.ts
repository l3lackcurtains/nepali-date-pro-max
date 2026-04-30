/**
 * Comparison and "is*" helpers — date-fns-style.
 *
 * All functions accept `NepaliDate` instances and treat them as **calendar
 * values** (year/month/day) unless explicitly stated otherwise.
 *
 * Nepal-aware defaults:
 * - **Week starts on Sunday** (the standard in Nepal).
 * - **Weekend = Saturday only** by default. Pass `{ weekendDays: [0,6] }` to
 *   include Sunday as well.
 */

import { NepaliDate } from "./nepali-date.js";
import { daysInBsMonth } from "./data.js";

// ---------- equality / sameness ----------

/** True when both dates fall on the same calendar day (BS year+month+day). */
export function isSameDay(a: NepaliDate, b: NepaliDate): boolean {
  return a.isSameDay(b);
}

/** True when both dates fall in the same BS month (year+month match). */
export function isSameMonth(a: NepaliDate, b: NepaliDate): boolean {
  return a.getYear() === b.getYear() && a.getMonth() === b.getMonth();
}

/** True when both dates fall in the same BS year. */
export function isSameYear(a: NepaliDate, b: NepaliDate): boolean {
  return a.getYear() === b.getYear();
}

/** True when both dates fall in the same week (default week-start Sunday). */
export function isSameWeek(
  a: NepaliDate,
  b: NepaliDate,
  options: { weekStartsOn?: number } = {},
): boolean {
  const start = options.weekStartsOn ?? 0;
  return startOfWeek(a, { weekStartsOn: start }).isSameDay(
    startOfWeek(b, { weekStartsOn: start }),
  );
}

// ---------- "today / yesterday / this …" ----------

/** True if `date` is the current Nepal-time calendar day. */
export function isToday(date: NepaliDate): boolean {
  return isSameDay(date, NepaliDate.now());
}

/** True if `date` is the day before today (in Nepal time). */
export function isYesterday(date: NepaliDate): boolean {
  return isSameDay(date, NepaliDate.now().addDays(-1));
}

/** True if `date` is the day after today (in Nepal time). */
export function isTomorrow(date: NepaliDate): boolean {
  return isSameDay(date, NepaliDate.now().addDays(1));
}

/** True if `date` falls in the current BS month (in Nepal time). */
export function isThisMonth(date: NepaliDate): boolean {
  return isSameMonth(date, NepaliDate.now());
}

/** True if `date` falls in the current BS year (in Nepal time). */
export function isThisYear(date: NepaliDate): boolean {
  return isSameYear(date, NepaliDate.now());
}

/** True if `date` falls in the current BS week (Sun–Sat by default). */
export function isThisWeek(
  date: NepaliDate,
  options: { weekStartsOn?: number } = {},
): boolean {
  return isSameWeek(date, NepaliDate.now(), options);
}

// ---------- weekday / weekend / month-edge ----------

/**
 * True if the date falls on a weekend day. Default weekend is **[Saturday]**
 * (Nepal's standard one-day weekend). Pass `{ weekendDays: [0, 6] }` for Sun+Sat.
 */
export function isWeekend(
  date: NepaliDate,
  options: { weekendDays?: readonly number[] } = {},
): boolean {
  const wd = options.weekendDays ?? [6];
  return wd.includes(date.getDay());
}

/** True if Saturday (Nepal's weekly holiday). */
export function isSaturday(date: NepaliDate): boolean {
  return date.getDay() === 6;
}
/** True if Sunday. */
export function isSunday(date: NepaliDate): boolean {
  return date.getDay() === 0;
}
/** True if Monday. */
export function isMonday(date: NepaliDate): boolean {
  return date.getDay() === 1;
}
/** True if Tuesday. */
export function isTuesday(date: NepaliDate): boolean {
  return date.getDay() === 2;
}
/** True if Wednesday. */
export function isWednesday(date: NepaliDate): boolean {
  return date.getDay() === 3;
}
/** True if Thursday. */
export function isThursday(date: NepaliDate): boolean {
  return date.getDay() === 4;
}
/** True if Friday. */
export function isFriday(date: NepaliDate): boolean {
  return date.getDay() === 5;
}

/** True if `date.getDate() === 1` (BS day-of-month). */
export function isFirstDayOfMonth(date: NepaliDate): boolean {
  return date.getDate() === 1;
}

/** True if `date.getDate()` equals the last day of its BS month. */
export function isLastDayOfMonth(date: NepaliDate): boolean {
  return date.getDate() === daysInBsMonth(date.getYear(), date.getMonth());
}

/** True if the BS year is a 366-day year. */
export function isLeapYear(date: NepaliDate): boolean {
  return date.daysInYear() === 366;
}

// ---------- ordering ----------

/** True if `a` precedes `b` (date+time). */
export function isBefore(a: NepaliDate, b: NepaliDate): boolean {
  return a.isBefore(b);
}
/** True if `a` follows `b` (date+time). */
export function isAfter(a: NepaliDate, b: NepaliDate): boolean {
  return a.isAfter(b);
}
/** True if both refer to the same instant. */
export function isEqual(a: NepaliDate, b: NepaliDate): boolean {
  return a.toJsDateUTC().getTime() === b.toJsDateUTC().getTime();
}

// ---------- intervals ----------

export interface NepaliInterval {
  start: NepaliDate;
  end: NepaliDate;
}

/**
 * True if `date` is between `interval.start` and `interval.end` (inclusive).
 * Throws if the interval is reversed.
 */
export function isWithinInterval(
  date: NepaliDate,
  interval: NepaliInterval,
): boolean {
  if (interval.start.isAfter(interval.end)) {
    throw new RangeError("isWithinInterval: interval start is after end");
  }
  return !date.isBefore(interval.start) && !date.isAfter(interval.end);
}

/** True if two intervals share at least one day. */
export function areIntervalsOverlapping(
  a: NepaliInterval,
  b: NepaliInterval,
): boolean {
  if (a.start.isAfter(a.end) || b.start.isAfter(b.end)) {
    throw new RangeError("areIntervalsOverlapping: interval start after end");
  }
  return !a.end.isBefore(b.start) && !b.end.isBefore(a.start);
}

// ---------- start/end of week (defined here because comparisons depend on it) ----------

/**
 * Returns a new instance at the start of the week. Default `weekStartsOn = 0`
 * (Sunday — the standard in Nepal).
 */
export function startOfWeek(
  date: NepaliDate,
  options: { weekStartsOn?: number } = {},
): NepaliDate {
  const start = options.weekStartsOn ?? 0;
  const dow = date.getDay();
  const diff = (dow - start + 7) % 7;
  return date.addDays(-diff);
}

/** Returns a new instance at the end of the week (last day, 6 days after start). */
export function endOfWeek(
  date: NepaliDate,
  options: { weekStartsOn?: number } = {},
): NepaliDate {
  return startOfWeek(date, options).addDays(6);
}

// ---------- start/end of day ----------

/** Returns a new instance at 00:00:00.000 on the same calendar day. */
export function startOfDay(date: NepaliDate): NepaliDate {
  return NepaliDate.fromBs(date.getYear(), date.getMonth(), date.getDate());
}

/** Returns a new instance at 23:59:59.999 on the same calendar day. */
export function endOfDay(date: NepaliDate): NepaliDate {
  return NepaliDate.fromBs(
    date.getYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );
}
