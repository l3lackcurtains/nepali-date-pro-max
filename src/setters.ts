/**
 * Immutable field setters — date-fns-style. Each function returns a NEW
 * `NepaliDate`; the input is never modified.
 *
 * When the new field would make the date invalid (e.g. setting day to 31 in a
 * month that only has 30), the day-of-month is **clamped down** to the last
 * valid day of that month (matches date-fns behavior).
 */

import { NepaliDate } from "./nepali-date.js";
import { daysInBsMonth, FIRST_BS_YEAR, LAST_BS_YEAR } from "./data.js";

function rebuild(
  d: NepaliDate,
  year: number,
  month: number,
  day: number,
): NepaliDate {
  const dim = daysInBsMonth(year, month);
  const clampedDay = Math.min(Math.max(1, day), dim);
  return NepaliDate.fromBs(
    year,
    month,
    clampedDay,
    d.getHours(),
    d.getMinutes(),
    d.getSeconds(),
    d.getMilliseconds(),
  );
}

/** Returns a new instance with the BS year set to `year`. Clamps day-of-month. */
export function setYear(date: NepaliDate, year: number): NepaliDate {
  if (!Number.isInteger(year) || year < FIRST_BS_YEAR || year > LAST_BS_YEAR) {
    throw new RangeError(
      `setYear: ${year} is outside supported range [${FIRST_BS_YEAR}, ${LAST_BS_YEAR}]`,
    );
  }
  return rebuild(date, year, date.getMonth(), date.getDate());
}

/** Returns a new instance with the BS month set (1..12). Clamps day-of-month. */
export function setMonth(date: NepaliDate, month: number): NepaliDate {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError(`setMonth: ${month} must be integer 1..12`);
  }
  return rebuild(date, date.getYear(), month, date.getDate());
}

/** Returns a new instance with the day-of-month set. Throws if day is out of valid range. */
export function setDate(date: NepaliDate, day: number): NepaliDate {
  const dim = daysInBsMonth(date.getYear(), date.getMonth());
  if (!Number.isInteger(day) || day < 1 || day > dim) {
    throw new RangeError(
      `setDate: ${day} invalid for ${date.getYear()}-${date.getMonth()} (1..${dim})`,
    );
  }
  return rebuild(date, date.getYear(), date.getMonth(), day);
}

/**
 * Returns a new instance moved to a specific day of week within the same week.
 * `weekday`: 0=Sunday … 6=Saturday. Default week start is Sunday.
 */
export function setDay(
  date: NepaliDate,
  weekday: number,
  options: { weekStartsOn?: number } = {},
): NepaliDate {
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
    throw new RangeError("setDay: weekday must be integer 0..6");
  }
  const start = options.weekStartsOn ?? 0;
  const cur = date.getDay();
  const curIdx = (((cur - start) % 7) + 7) % 7;
  const targetIdx = (((weekday - start) % 7) + 7) % 7;
  return date.addDays(targetIdx - curIdx);
}

/** Returns a new instance with the day-of-year set (1..(365|366)). */
export function setDayOfYear(date: NepaliDate, dayOfYear: number): NepaliDate {
  return date.startOfYear().addDays(dayOfYear - 1);
}

/** Returns a new instance with the hour-of-day set (0..23). */
export function setHours(date: NepaliDate, hours: number): NepaliDate {
  if (!Number.isInteger(hours) || hours < 0 || hours > 23) {
    throw new RangeError(`setHours: ${hours} must be integer 0..23`);
  }
  return NepaliDate.fromBs(
    date.getYear(),
    date.getMonth(),
    date.getDate(),
    hours,
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  );
}

/** Returns a new instance with the minute-of-hour set (0..59). */
export function setMinutes(date: NepaliDate, minutes: number): NepaliDate {
  if (!Number.isInteger(minutes) || minutes < 0 || minutes > 59) {
    throw new RangeError(`setMinutes: ${minutes} must be integer 0..59`);
  }
  return NepaliDate.fromBs(
    date.getYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    minutes,
    date.getSeconds(),
    date.getMilliseconds(),
  );
}

/** Returns a new instance with the second-of-minute set (0..59). */
export function setSeconds(date: NepaliDate, seconds: number): NepaliDate {
  if (!Number.isInteger(seconds) || seconds < 0 || seconds > 59) {
    throw new RangeError(`setSeconds: ${seconds} must be integer 0..59`);
  }
  return NepaliDate.fromBs(
    date.getYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    seconds,
    date.getMilliseconds(),
  );
}

/** Returns a new instance with the millisecond-of-second set (0..999). */
export function setMilliseconds(date: NepaliDate, ms: number): NepaliDate {
  if (!Number.isInteger(ms) || ms < 0 || ms > 999) {
    throw new RangeError(`setMilliseconds: ${ms} must be integer 0..999`);
  }
  return NepaliDate.fromBs(
    date.getYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    ms,
  );
}
