/**
 * Core BS ↔ AD conversion logic.
 *
 * Strategy: count days. We anchor BS 1975-01-01 to AD 1918-04-13 (verified
 * Saturday). To convert, we count whole days between the input and the anchor,
 * then walk through the BS calendar table to find the BS year/month/day, or
 * walk through the AD calendar to find the Gregorian date.
 */

import {
  ANCHOR_AD_DAY,
  ANCHOR_AD_MONTH,
  ANCHOR_AD_YEAR,
  ANCHOR_WEEKDAY,
  BS_YEAR_DATA,
  FIRST_BS_YEAR,
  LAST_BS_YEAR,
  daysInBsMonth,
  daysInBsYear,
} from "./data.js";
import type { AdDate, BsDate } from "./types.js";

const MS_PER_DAY = 86_400_000;

/**
 * Days from the BS anchor (1975-01-01 BS) to the given BS date.
 * Returns 0 for the anchor date itself; positive for later dates.
 * @internal
 */
function bsToDayIndex(year: number, month: number, day: number): number {
  if (year < FIRST_BS_YEAR || year > LAST_BS_YEAR) {
    throw new RangeError(
      `BS year ${year} is outside supported range [${FIRST_BS_YEAR}, ${LAST_BS_YEAR}]`,
    );
  }
  if (month < 1 || month > 12 || !Number.isInteger(month)) {
    throw new RangeError(`BS month ${month} is invalid (must be 1..12)`);
  }
  const dim = daysInBsMonth(year, month);
  if (day < 1 || day > dim || !Number.isInteger(day)) {
    throw new RangeError(
      `BS day ${day} is invalid for ${year}-${month} (1..${dim})`,
    );
  }

  let total = 0;
  for (let y = FIRST_BS_YEAR; y < year; y++) {
    total += BS_YEAR_DATA[y]![12]!;
  }
  for (let m = 1; m < month; m++) {
    total += BS_YEAR_DATA[year]![m - 1]!;
  }
  total += day - 1;
  return total;
}

/**
 * Inverse of {@link bsToDayIndex}: from a non-negative day count, find the BS date.
 * @internal
 */
function dayIndexToBs(days: number): BsDate {
  if (days < 0) {
    throw new RangeError(
      "Date is before the supported range (BS 1975-01-01 / AD 1918-04-13)",
    );
  }
  let remaining = days;
  let year = FIRST_BS_YEAR;
  while (year <= LAST_BS_YEAR) {
    const total = BS_YEAR_DATA[year]![12]!;
    if (remaining < total) break;
    remaining -= total;
    year++;
  }
  if (year > LAST_BS_YEAR) {
    throw new RangeError(
      `Date is after the supported range (BS ${LAST_BS_YEAR} end)`,
    );
  }
  let month = 1;
  while (month <= 12) {
    const dim = BS_YEAR_DATA[year]![month - 1]!;
    if (remaining < dim) break;
    remaining -= dim;
    month++;
  }
  return { year, month, day: remaining + 1 };
}

/** AD anchor as a UTC midnight timestamp. */
const ANCHOR_UTC_MS = Date.UTC(
  ANCHOR_AD_YEAR,
  ANCHOR_AD_MONTH - 1,
  ANCHOR_AD_DAY,
);

/**
 * Validate an AD date triplet (calendar plausibility, not range).
 * @internal
 */
function validateAd(year: number, month: number, day: number): void {
  if (!Number.isInteger(year)) {
    throw new RangeError(`AD year ${year} must be an integer`);
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError(`AD month ${month} must be integer 1..12`);
  }
  if (!Number.isInteger(day) || day < 1 || day > 31) {
    throw new RangeError(`AD day ${day} must be integer 1..31`);
  }
  // Use Date constructor to verify the day exists for the month/year.
  const d = new Date(Date.UTC(year, month - 1, day));
  if (
    d.getUTCFullYear() !== year ||
    d.getUTCMonth() !== month - 1 ||
    d.getUTCDate() !== day
  ) {
    throw new RangeError(`AD date ${year}-${month}-${day} is not valid`);
  }
}

/**
 * Convert a Bikram Sambat date to a Gregorian (AD) date.
 *
 * @param year - BS year (1975–2099)
 * @param month - BS month, 1..12 (1=Baishakh)
 * @param day - BS day of month, 1..(month length)
 * @returns Plain `{year, month, day}` AD date.
 *
 * @example
 * bsToAd(2081, 1, 1)        // → { year: 2024, month: 4, day: 13 }
 * bsToAd(2080, 9, 15).year  // → 2023
 *
 * @throws RangeError if inputs are out of range or not integers.
 */
export function bsToAd(year: number, month: number, day: number): AdDate {
  const days = bsToDayIndex(year, month, day);
  const ts = ANCHOR_UTC_MS + days * MS_PER_DAY;
  const d = new Date(ts);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  };
}

/**
 * Convert a Gregorian (AD) date to a Bikram Sambat date.
 *
 * @param year - AD year
 * @param month - AD month, 1..12
 * @param day - AD day of month, 1..31
 * @returns Plain `{year, month, day}` BS date.
 *
 * @example
 * adToBs(2024, 4, 13) // → { year: 2081, month: 1, day: 1 }
 * adToBs(2008, 5, 28) // → { year: 2065, month: 2, day: 15 }  (Republic Day)
 *
 * @throws RangeError if the AD date falls outside the supported BS range
 * (≈ 1918-04-13 to ≈ 2043-04-13) or the date is invalid.
 */
export function adToBs(year: number, month: number, day: number): BsDate {
  validateAd(year, month, day);
  const ts = Date.UTC(year, month - 1, day);
  const days = Math.round((ts - ANCHOR_UTC_MS) / MS_PER_DAY);
  return dayIndexToBs(days);
}

/**
 * Convert a JavaScript `Date` (interpreted as Asia/Kathmandu wall-clock) to BS.
 * The time-of-day is stripped; only the calendar date is converted.
 *
 * Note: the input Date's underlying instant is shifted by Nepal Time (+05:45)
 * to determine which Nepali calendar day applies. If you have a date that
 * is already known in calendar form (year/month/day), use {@link adToBs}
 * directly to avoid timezone surprises.
 */
export function fromJsDate(date: Date): BsDate {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new TypeError("fromJsDate: argument must be a valid Date");
  }
  // Shift by NPT (+05:45) and read calendar fields in UTC to avoid
  // host-timezone variance.
  const NPT_OFFSET_MS = (5 * 60 + 45) * 60 * 1000;
  const shifted = new Date(date.getTime() + NPT_OFFSET_MS);
  return adToBs(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth() + 1,
    shifted.getUTCDate(),
  );
}

/**
 * Day-of-week (0=Sunday..6=Saturday) for a BS date.
 * Computed from the day-count anchor — independent of host timezone.
 */
export function bsWeekday(year: number, month: number, day: number): number {
  const days = bsToDayIndex(year, month, day);
  return (((ANCHOR_WEEKDAY + days) % 7) + 7) % 7;
}

/** Day-of-year for a BS date (1..365 or 1..366). */
export function bsDayOfYear(year: number, month: number, day: number): number {
  if (year < FIRST_BS_YEAR || year > LAST_BS_YEAR) {
    throw new RangeError(
      `BS year ${year} is outside supported range [${FIRST_BS_YEAR}, ${LAST_BS_YEAR}]`,
    );
  }
  let n = day;
  for (let m = 1; m < month; m++) n += BS_YEAR_DATA[year]![m - 1]!;
  return n;
}

/** Inverse of {@link bsDayOfYear}: get `{month, day}` from a BS year + dayOfYear. */
export function bsFromDayOfYear(
  year: number,
  dayOfYear: number,
): { month: number; day: number } {
  const total = daysInBsYear(year);
  if (!Number.isInteger(dayOfYear) || dayOfYear < 1 || dayOfYear > total) {
    throw new RangeError(
      `dayOfYear ${dayOfYear} is invalid for BS ${year} (1..${total})`,
    );
  }
  let remaining = dayOfYear;
  for (let m = 1; m <= 12; m++) {
    const dim = BS_YEAR_DATA[year]![m - 1]!;
    if (remaining <= dim) return { month: m, day: remaining };
    remaining -= dim;
  }
  // unreachable
  throw new Error("bsFromDayOfYear: internal error");
}
