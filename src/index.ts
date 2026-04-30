/**
 * `nepali-date-pro-max` — production-grade Nepali Bikram Sambat ↔ Gregorian
 * date converter, with a full date-fns-style utility layer.
 *
 * @packageDocumentation
 *
 * Three layers of API:
 *
 * 1. **Functional core** (lightweight, tree-shakeable):
 *    ```ts
 *    import { bsToAd, adToBs, formatBs, parseBs } from "nepali-date-pro-max";
 *    bsToAd(2081, 1, 1);          // → { year: 2024, month: 4, day: 13 }
 *    adToBs(2024, 4, 13);         // → { year: 2081, month: 1, day: 1 }
 *    ```
 *
 * 2. **Object-oriented** (rich, immutable, full date+time):
 *    ```ts
 *    import { NepaliDate } from "nepali-date-pro-max";
 *    NepaliDate.now().format("YYYY-MM-DD dddd");
 *    NepaliDate.fromAd(2024, 4, 13).addDays(7).toAd();
 *    ```
 *
 * 3. **date-fns-style utilities** (functions taking `NepaliDate`s):
 *    ```ts
 *    import {
 *      addDays, addMonths, addYears,
 *      setYear, setMonth, setDate,
 *      isToday, isTomorrow, isWeekend, isSameMonth, isWithinInterval,
 *      differenceInDays, differenceInMonths, differenceInYears,
 *      eachDayOfInterval, eachMonthOfInterval, eachWeekOfInterval,
 *      formatDistance, formatRelative,
 *      min, max, clamp, closestTo,
 *      getFiscalYear, startOfFiscalYear,
 *      convertAdRangeToBs, eachBsDayInAdRange,
 *    } from "nepali-date-pro-max";
 *    ```
 *
 * Supported BS year range: **1975 → 2099** (≈ AD 1918-04-13 → 2043-04-13).
 */

// ---------- Core conversion ----------
export {
  adToBs,
  bsDayOfYear,
  bsFromDayOfYear,
  bsToAd,
  bsWeekday,
  fromJsDate,
} from "./convert.js";

// ---------- Calendar metadata ----------
export {
  ANCHOR_AD_DAY,
  ANCHOR_AD_MONTH,
  ANCHOR_AD_YEAR,
  BS_YEAR_DATA,
  BS_YEAR_TOTALS,
  daysInBsMonth,
  daysInBsYear,
  FIRST_BS_YEAR,
  isBsLeapYear,
  LAST_BS_YEAR,
} from "./data.js";

// ---------- Names & digits ----------
export {
  AD_MONTH_NAMES,
  AD_MONTH_NAMES_SHORT,
  BS_MONTH_NAMES,
  BS_MONTH_NAMES_NP,
  BS_MONTH_NAMES_SHORT,
  DEVANAGARI_DIGITS,
  toAsciiDigits,
  toDevanagariDigits,
  WEEKDAY_NAMES,
  WEEKDAY_NAMES_MIN,
  WEEKDAY_NAMES_NP,
  WEEKDAY_NAMES_NP_SHORT,
  WEEKDAY_NAMES_SHORT,
} from "./constants.js";

// ---------- Formatting & parsing ----------
export { type FormatOptions, formatBs } from "./format.js";
export { parseBs } from "./parse.js";

// ---------- Locale ----------
export {
  getGlobalLocale,
  getLocale,
  hasLocale,
  type Locale,
  type LocaleRelativeTime,
  listLocales,
  registerLocale,
  setGlobalLocale,
} from "./locale.js";

// ---------- The class ----------
export { NepaliDate } from "./nepali-date.js";

// ---------- Standalone arithmetic helpers (date-fns style) ----------
export {
  addDays,
  addHours,
  addMilliseconds,
  addMinutes,
  addMonths,
  addSeconds,
  addYears,
  subDays,
  subHours,
  subMilliseconds,
  subMinutes,
  subMonths,
  subSeconds,
  subYears,
} from "./arithmetic.js";

// ---------- Field setters (date-fns style) ----------
export {
  setDate,
  setDay,
  setDayOfYear,
  setHours,
  setMilliseconds,
  setMinutes,
  setMonth,
  setSeconds,
  setYear,
} from "./setters.js";

// ---------- Comparisons / "is*" helpers ----------
export {
  areIntervalsOverlapping,
  endOfDay,
  endOfWeek,
  isAfter,
  isBefore,
  isEqual,
  isFirstDayOfMonth,
  isFriday,
  isLastDayOfMonth,
  isLeapYear,
  isMonday,
  isSameDay,
  isSameMonth,
  isSameWeek,
  isSameYear,
  isSaturday,
  isSunday,
  isThisMonth,
  isThisWeek,
  isThisYear,
  isThursday,
  isToday,
  isTomorrow,
  isTuesday,
  isWednesday,
  isWeekend,
  isWithinInterval,
  isYesterday,
  startOfDay,
  startOfWeek,
  type NepaliInterval,
} from "./comparisons.js";

// ---------- start/end of month / year (standalone form) ----------
export {
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfYear,
} from "./bounds.js";

// ---------- Differences ----------
export {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarYears,
  differenceInDays,
  differenceInHours,
  differenceInMilliseconds,
  differenceInMinutes,
  differenceInMonths,
  differenceInSeconds,
  differenceInWeeks,
  differenceInYears,
} from "./diff.js";

// ---------- Interval enumerators ----------
export {
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekendOfInterval,
  eachWeekOfInterval,
  eachYearOfInterval,
} from "./intervals.js";

// ---------- Cross-calendar range conversion (the headline AD↔BS feature) ----------
export {
  type AdInput,
  type AdRangeFormatOptions,
  convertAdRangeToBs,
  convertBsRangeToAd,
  eachAdDayInBsRange,
  eachBsDayInAdRange,
  eachBsMonthInAdRange,
  type RangeConvertOptions,
} from "./range.js";

// ---------- Fiscal year ----------
export {
  endOfFiscalYear,
  FISCAL_YEAR_START_MONTH,
  formatFiscalYear,
  getFiscalQuarter,
  getFiscalYear,
  startOfFiscalYear,
} from "./fiscal.js";

// ---------- Distance / relative (locale-driven) ----------
export {
  type DateInput,
  type DistanceOptions,
  formatDistance,
  formatDistanceToNow,
  formatRelative,
  toNepaliDate,
} from "./distance.js";

// ---------- min/max/clamp/closestTo ----------
export {
  clamp,
  closestIndexTo,
  closestTo,
  isValid,
  max,
  min,
} from "./util.js";

// ---------- Calendar grid (UI-ready, for building Nepali calendar widgets) ----------
export {
  type CalendarDayCell,
  type CalendarMonth,
  type CalendarMonthOptions,
  type CalendarWeek,
  flattenCalendarMonth,
  getCalendarDay,
  getCalendarMonth,
  getCalendarYear,
} from "./calendar.js";

// ---------- Types ----------
export type {
  AdDate,
  BsDate,
  BsDateTime,
  NepaliDateDetails,
} from "./types.js";
