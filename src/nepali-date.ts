/**
 * `NepaliDate` — an immutable Bikram Sambat date+time value.
 *
 * Internally stores BS calendar fields (year/month/day) plus optional
 * time-of-day (Asia/Kathmandu wall clock). All mutation-style methods
 * (`addDays`, `addMonths`, …) return a NEW instance, never modify the
 * original. This makes instances safe to share and matches modern JS
 * date-library conventions (Temporal, date-fns immutable APIs).
 *
 * @example Construction
 * ```ts
 * import { NepaliDate } from "nepali-date-pro-max";
 *
 * NepaliDate.now();                              // current Nepal date+time
 * NepaliDate.fromBs(2081, 1, 1);                 // Baishakh 1, 2081
 * NepaliDate.fromAd(2024, 4, 13);                // AD → BS
 * NepaliDate.parse("2081-01-15");                // string → BS
 * NepaliDate.fromJsDate(new Date());             // Date → BS
 * ```
 *
 * @example Reading
 * ```ts
 * const d = NepaliDate.fromBs(2081, 1, 15);
 * d.getYear();        // 2081
 * d.getMonth();       // 1   (1-indexed!)
 * d.getDate();        // 15
 * d.getDay();         // 6   (weekday: 0=Sun..6=Sat)
 * d.getMonthName();   // "Baishakh"
 * d.toAd();           // { year: 2024, month: 4, day: 27 }
 * d.toJsDate();       // native Date (Asia/Kathmandu midnight)
 * d.format("YYYY-MM-DD"); // "2081-01-15"
 * ```
 *
 * @example Arithmetic (returns NEW instances)
 * ```ts
 * d.addDays(7);          // a week later
 * d.addMonths(1);        // a month later (clamps day if needed)
 * d.addYears(1);
 * d.startOfMonth();      // first day of the BS month
 * d.endOfMonth();        // last day of the BS month
 * a.diffDays(b);         // signed integer days between two NepaliDates
 * a.isBefore(b);
 * ```
 */

import { BS_MONTH_NAMES, BS_MONTH_NAMES_NP, WEEKDAY_NAMES, WEEKDAY_NAMES_NP } from "./constants.js";
import {
  adToBs,
  bsDayOfYear,
  bsToAd,
  bsWeekday,
  fromJsDate,
} from "./convert.js";
import {
  BS_YEAR_DATA,
  FIRST_BS_YEAR,
  LAST_BS_YEAR,
  daysInBsMonth,
  daysInBsYear,
} from "./data.js";
import { type FormatOptions, formatBs } from "./format.js";
import { parseBs } from "./parse.js";
import type { AdDate, BsDate, NepaliDateDetails } from "./types.js";

const NPT_OFFSET_MS = (5 * 60 + 45) * 60 * 1000;
const MS_PER_DAY = 86_400_000;

export class NepaliDate {
  /** BS year (e.g. 2081). 1-indexed: 1=Baishakh, 12=Chaitra. */
  readonly #year: number;
  readonly #month: number;
  readonly #day: number;
  readonly #hour: number;
  readonly #minute: number;
  readonly #second: number;
  readonly #millisecond: number;

  /**
   * Construct from BS calendar fields. Prefer the static factories for clarity.
   * @internal
   */
  constructor(
    year: number,
    month: number,
    day: number,
    hour = 0,
    minute = 0,
    second = 0,
    millisecond = 0,
  ) {
    // Validation also guards against out-of-range BS years.
    const dim = daysInBsMonth(year, month);
    if (day < 1 || day > dim || !Number.isInteger(day)) {
      throw new RangeError(
        `NepaliDate: BS day ${day} is invalid for ${year}-${month} (1..${dim})`,
      );
    }
    if (
      !Number.isInteger(hour) ||
      hour < 0 ||
      hour > 23 ||
      !Number.isInteger(minute) ||
      minute < 0 ||
      minute > 59 ||
      !Number.isInteger(second) ||
      second < 0 ||
      second > 59 ||
      !Number.isInteger(millisecond) ||
      millisecond < 0 ||
      millisecond > 999
    ) {
      throw new RangeError("NepaliDate: invalid time component");
    }
    this.#year = year;
    this.#month = month;
    this.#day = day;
    this.#hour = hour;
    this.#minute = minute;
    this.#second = second;
    this.#millisecond = millisecond;
  }

  // ---------- Factories ----------

  /**
   * Current moment in Nepal Time (Asia/Kathmandu, UTC+05:45) as a `NepaliDate`.
   *
   * @example
   * NepaliDate.now().format("YYYY-MM-DD HH:mm")
   */
  static now(): NepaliDate {
    return NepaliDate.fromJsDate(new Date());
  }

  /** Create a `NepaliDate` from BS year/month/day (and optional time). */
  static fromBs(
    year: number,
    month: number,
    day: number,
    hour = 0,
    minute = 0,
    second = 0,
    millisecond = 0,
  ): NepaliDate {
    return new NepaliDate(year, month, day, hour, minute, second, millisecond);
  }

  /** Create a `NepaliDate` from AD year/month/day (and optional time). */
  static fromAd(
    year: number,
    month: number,
    day: number,
    hour = 0,
    minute = 0,
    second = 0,
    millisecond = 0,
  ): NepaliDate {
    const bs = adToBs(year, month, day);
    return new NepaliDate(
      bs.year,
      bs.month,
      bs.day,
      hour,
      minute,
      second,
      millisecond,
    );
  }

  /**
   * Convert a JS `Date` (any instant) into a `NepaliDate`. The instant is
   * shifted into Asia/Kathmandu (UTC+05:45) before reading calendar fields.
   */
  static fromJsDate(date: Date): NepaliDate {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      throw new TypeError("NepaliDate.fromJsDate: invalid Date");
    }
    const shifted = new Date(date.getTime() + NPT_OFFSET_MS);
    const bs = adToBs(
      shifted.getUTCFullYear(),
      shifted.getUTCMonth() + 1,
      shifted.getUTCDate(),
    );
    return new NepaliDate(
      bs.year,
      bs.month,
      bs.day,
      shifted.getUTCHours(),
      shifted.getUTCMinutes(),
      shifted.getUTCSeconds(),
      shifted.getUTCMilliseconds(),
    );
  }

  /** Parse a BS date string (YYYY-MM-DD with `-`, `/`, or `.`; ASCII or Devanagari). */
  static parse(input: string): NepaliDate {
    const bs = parseBs(input);
    return new NepaliDate(bs.year, bs.month, bs.day);
  }

  // ---------- Accessors ----------

  /** BS year. */
  getYear(): number {
    return this.#year;
  }
  /** BS month, **1-indexed** (1=Baishakh, 12=Chaitra). */
  getMonth(): number {
    return this.#month;
  }
  /** BS day of month, 1-indexed. */
  getDate(): number {
    return this.#day;
  }
  /** Day of week, 0=Sunday … 6=Saturday. */
  getDay(): number {
    return bsWeekday(this.#year, this.#month, this.#day);
  }
  /** Day of year in BS, 1..(365|366). */
  getDayOfYear(): number {
    return bsDayOfYear(this.#year, this.#month, this.#day);
  }
  getHours(): number {
    return this.#hour;
  }
  getMinutes(): number {
    return this.#minute;
  }
  getSeconds(): number {
    return this.#second;
  }
  getMilliseconds(): number {
    return this.#millisecond;
  }

  /** English month name, e.g. "Baishakh". */
  getMonthName(): string {
    return BS_MONTH_NAMES[this.#month - 1]!;
  }
  /** Devanagari month name, e.g. "बैशाख". */
  getMonthNameNepali(): string {
    return BS_MONTH_NAMES_NP[this.#month - 1]!;
  }
  /** English weekday name, e.g. "Saturday". */
  getDayName(): string {
    return WEEKDAY_NAMES[this.getDay()]!;
  }
  /** Devanagari weekday name, e.g. "शनिबार". */
  getDayNameNepali(): string {
    return WEEKDAY_NAMES_NP[this.getDay()]!;
  }

  /** Total days in this BS month. */
  daysInMonth(): number {
    return daysInBsMonth(this.#year, this.#month);
  }
  /** Total days in this BS year (365 or 366). */
  daysInYear(): number {
    return daysInBsYear(this.#year);
  }

  // ---------- Conversions ----------

  /** As a plain `{year, month, day}` BS object. */
  toBs(): BsDate {
    return { year: this.#year, month: this.#month, day: this.#day };
  }

  /** As a plain `{year, month, day}` AD object (Gregorian). */
  toAd(): AdDate {
    return bsToAd(this.#year, this.#month, this.#day);
  }

  /**
   * As a native JavaScript `Date`. The instant is the start of the BS day
   * in Asia/Kathmandu wall-clock, plus any time-of-day components.
   */
  toJsDate(): Date {
    const ad = this.toAd();
    const utcMs = Date.UTC(
      ad.year,
      ad.month - 1,
      ad.day,
      this.#hour,
      this.#minute,
      this.#second,
      this.#millisecond,
    );
    // The above is "what the wall clock shows" interpreted as UTC.
    // Subtract Nepal's UTC offset to get the actual instant.
    return new Date(utcMs - NPT_OFFSET_MS);
  }

  /** Default ISO-style BS string, e.g. `"2081-01-15"`. */
  toString(): string {
    return formatBs(this.toBs(), "YYYY-MM-DD");
  }

  /**
   * Format using a token pattern. See {@link formatBs} for the token list.
   * @example
   * d.format("DD MMMM, YYYY (dddd)")
   * d.format("DD MMMM YYYY", { nepali: true })
   */
  format(pattern: string, options?: FormatOptions): string {
    return formatBs(
      {
        year: this.#year,
        month: this.#month,
        day: this.#day,
        hour: this.#hour,
        minute: this.#minute,
        second: this.#second,
      },
      pattern,
      options,
    );
  }

  /** Devanagari-formatted shorthand. Equivalent to `format(pattern, { nepali: true })`. */
  formatNepali(pattern = "YYYY-MM-DD"): string {
    return this.format(pattern, { nepali: true });
  }

  /** Comprehensive details object — handy for AI/UI consumers. */
  getDetails(): NepaliDateDetails {
    return {
      bs: this.toBs(),
      ad: this.toAd(),
      weekday: this.getDay(),
      weekdayName: this.getDayName(),
      weekdayNameNepali: this.getDayNameNepali(),
      monthName: this.getMonthName(),
      monthNameNepali: this.getMonthNameNepali(),
      dayOfYear: this.getDayOfYear(),
      daysInYear: this.daysInYear(),
      daysInMonth: this.daysInMonth(),
    };
  }

  // ---------- Arithmetic (immutable; returns NEW instance) ----------

  /** Returns a new instance with `n` days added (negative subtracts). */
  addDays(n: number): NepaliDate {
    if (!Number.isFinite(n)) throw new TypeError("addDays: n must be a number");
    const ad = this.toAd();
    const ts = Date.UTC(ad.year, ad.month - 1, ad.day) + Math.trunc(n) * MS_PER_DAY;
    const d = new Date(ts);
    const bs = adToBs(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
    return new NepaliDate(
      bs.year,
      bs.month,
      bs.day,
      this.#hour,
      this.#minute,
      this.#second,
      this.#millisecond,
    );
  }

  /**
   * Returns a new instance `n` BS-months later. Day-of-month is **clamped**
   * down if the target month is shorter (e.g. day 31 → day 30).
   */
  addMonths(n: number): NepaliDate {
    if (!Number.isInteger(n))
      throw new TypeError("addMonths: n must be an integer");
    let totalMonths = (this.#year - FIRST_BS_YEAR) * 12 + (this.#month - 1) + n;
    const newYear = FIRST_BS_YEAR + Math.floor(totalMonths / 12);
    const newMonth = (totalMonths % 12 + 12) % 12 + 1;
    if (newYear < FIRST_BS_YEAR || newYear > LAST_BS_YEAR) {
      throw new RangeError(
        `addMonths: result BS year ${newYear} is outside supported range`,
      );
    }
    const dim = daysInBsMonth(newYear, newMonth);
    const newDay = Math.min(this.#day, dim);
    return new NepaliDate(
      newYear,
      newMonth,
      newDay,
      this.#hour,
      this.#minute,
      this.#second,
      this.#millisecond,
    );
  }

  /** Returns a new instance `n` BS-years later. Clamps day if needed. */
  addYears(n: number): NepaliDate {
    return this.addMonths(n * 12);
  }

  /** Returns a new instance with `n` hours added. Crosses day boundaries. */
  addHours(n: number): NepaliDate {
    return this.addMilliseconds(n * 3_600_000);
  }
  /** Returns a new instance with `n` minutes added. */
  addMinutes(n: number): NepaliDate {
    return this.addMilliseconds(n * 60_000);
  }
  /** Returns a new instance with `n` seconds added. */
  addSeconds(n: number): NepaliDate {
    return this.addMilliseconds(n * 1000);
  }
  /** Returns a new instance with `n` milliseconds added. */
  addMilliseconds(n: number): NepaliDate {
    if (!Number.isFinite(n))
      throw new TypeError("addMilliseconds: n must be a number");
    const base = this.toJsDate();
    const next = new Date(base.getTime() + n);
    return NepaliDate.fromJsDate(next);
  }

  /** Returns a new instance at the first day of this BS month. */
  startOfMonth(): NepaliDate {
    return new NepaliDate(this.#year, this.#month, 1);
  }
  /** Returns a new instance at the last day of this BS month. */
  endOfMonth(): NepaliDate {
    return new NepaliDate(
      this.#year,
      this.#month,
      daysInBsMonth(this.#year, this.#month),
    );
  }
  /** Returns a new instance at the first day of this BS year (Baishakh 1). */
  startOfYear(): NepaliDate {
    return new NepaliDate(this.#year, 1, 1);
  }
  /** Returns a new instance at the last day of this BS year (Chaitra last). */
  endOfYear(): NepaliDate {
    const total = BS_YEAR_DATA[this.#year]!;
    return new NepaliDate(this.#year, 12, total[11]!);
  }

  // ---------- Comparison ----------

  /** Signed difference in whole days: `this - other`. */
  diffDays(other: NepaliDate): number {
    return Math.round(
      (this.toJsDate().getTime() - other.toJsDate().getTime()) / MS_PER_DAY,
    );
  }
  /** True if `this` precedes `other` (date+time). */
  isBefore(other: NepaliDate): boolean {
    return this.toJsDate().getTime() < other.toJsDate().getTime();
  }
  /** True if `this` follows `other` (date+time). */
  isAfter(other: NepaliDate): boolean {
    return this.toJsDate().getTime() > other.toJsDate().getTime();
  }
  /** True if both BS dates (ignoring time) are the same calendar day. */
  isSameDay(other: NepaliDate): boolean {
    return (
      this.#year === other.#year &&
      this.#month === other.#month &&
      this.#day === other.#day
    );
  }

  // ---------- Convenience predicates (no cross-module imports) ----------

  /** True when this is the first day of its BS month. */
  isFirstDayOfMonth(): boolean {
    return this.#day === 1;
  }
  /** True when this is the last day of its BS month. */
  isLastDayOfMonth(): boolean {
    return this.#day === daysInBsMonth(this.#year, this.#month);
  }
  /** True when this BS year has 366 days. */
  isLeapYear(): boolean {
    return daysInBsYear(this.#year) === 366;
  }
  /**
   * True when this calendar day falls on a weekend day. Default weekend is
   * `[6]` (Saturday — Nepal's standard one-day weekend). Pass `[0, 6]` for
   * Sun+Sat.
   */
  isWeekend(weekendDays: readonly number[] = [6]): boolean {
    return weekendDays.includes(this.getDay());
  }

  // ---------- Day boundaries ----------

  /** Returns a new instance at 00:00:00.000 on the same calendar day. */
  startOfDay(): NepaliDate {
    return new NepaliDate(this.#year, this.#month, this.#day);
  }
  /** Returns a new instance at 23:59:59.999 on the same calendar day. */
  endOfDay(): NepaliDate {
    return new NepaliDate(
      this.#year,
      this.#month,
      this.#day,
      23,
      59,
      59,
      999,
    );
  }

  // ---------- JSON / debug ----------

  /** JSON-friendly representation. */
  toJSON(): { bs: BsDate; ad: AdDate; iso: string } {
    return {
      bs: this.toBs(),
      ad: this.toAd(),
      iso: this.toJsDate().toISOString(),
    };
  }
}
