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
  /** Weekday name in the active locale (e.g. `"Saturday"` / `"शनिबार"`). */
  weekdayName: string;
  /** Month name in the active locale (e.g. `"Baishakh"` / `"बैशाख"`). */
  monthName: string;
  /** Day-of-year in BS (1-indexed). */
  dayOfYear: number;
  /** Total days in this BS year. */
  daysInYear: number;
  /** Total days in this BS month. */
  daysInMonth: number;
  /** Locale used to render `weekdayName` and `monthName`. */
  locale: string;
}
