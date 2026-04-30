/**
 * A plain Bikram Sambat date (no time component).
 * - `year`: BS year, e.g. 2081
 * - `month`: 1-indexed (1=Baishakh, 12=Chaitra)
 * - `day`: 1-indexed day of month
 */
export interface BsDate {
  year: number;
  month: number;
  day: number;
}

/**
 * A plain Gregorian (AD) date (no time component).
 * - `year`: AD year, e.g. 2024
 * - `month`: 1-indexed (1=January, 12=December)
 * - `day`: 1-indexed day of month
 */
export interface AdDate {
  year: number;
  month: number;
  day: number;
}

/** A BS date with optional time-of-day fields (Asia/Kathmandu wall clock). */
export interface BsDateTime extends BsDate {
  hour?: number;
  minute?: number;
  second?: number;
  millisecond?: number;
}

/** Output of `getDetails()` — everything you might want to know about a Nepali date. */
export interface NepaliDateDetails {
  bs: BsDate;
  ad: AdDate;
  /** 0=Sunday, 1=Monday, …, 6=Saturday */
  weekday: number;
  /** English weekday name (e.g. "Sunday"). */
  weekdayName: string;
  /** Nepali weekday name in Devanagari (e.g. "आइतबार"). */
  weekdayNameNepali: string;
  /** English month name in Roman (e.g. "Baishakh"). */
  monthName: string;
  /** Nepali month name in Devanagari (e.g. "बैशाख"). */
  monthNameNepali: string;
  /** Day-of-year in BS (1-indexed). */
  dayOfYear: number;
  /** Total days in this BS year. */
  daysInYear: number;
  /** Total days in this BS month. */
  daysInMonth: number;
}
