/**
 * Calendar grid builders — the data shape every Nepali calendar UI needs.
 *
 * Nepali calendar widgets (Hamro Patro–style) typically render a 7-column grid
 * with rows of weeks, where each cell shows the BS day, the corresponding AD
 * day, and visual flags for "today", "weekend", "from another month", etc.
 *
 * `getCalendarMonth` returns exactly that, ready to drop into a React/Vue/
 * Svelte/HTML template — no further computation required.
 *
 * @example Render a BS month grid in React
 * ```tsx
 * import { getCalendarMonth, NepaliDate } from "nepali-date-pro-max";
 *
 * function NepaliCalendar({ year, month }: { year: number; month: number }) {
 *   const cal = getCalendarMonth(year, month);
 *   return (
 *     <div>
 *       <h2>{cal.monthNameNepali} {cal.yearNepali}</h2>
 *       <div className="grid grid-cols-7">
 *         {cal.weekdayHeaders.map(h => <div key={h}>{h}</div>)}
 *         {cal.weeks.flatMap(w => w.days).map(c => (
 *           <div
 *             key={`${c.bs.year}-${c.bs.month}-${c.bs.day}`}
 *             className={[
 *               !c.isCurrentMonth && "text-gray-400",
 *               c.isToday && "bg-red-500 text-white",
 *               c.isSaturday && "text-red-500",
 *             ].filter(Boolean).join(" ")}
 *           >
 *             <div>{c.bsDayNepali}</div>
 *             <div className="text-xs">{c.adDay}</div>
 *           </div>
 *         ))}
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */

import {
  BS_MONTH_NAMES_NP,
  toDevanagariDigits,
  WEEKDAY_NAMES,
  WEEKDAY_NAMES_NP,
} from "./constants.js";
import { daysInBsMonth } from "./data.js";
import { getLocale, type Locale, resolveGlobalLocale } from "./locale.js";
import { NepaliDate } from "./nepali-date.js";
import type { AdDate, BsDate } from "./types.js";

/**
 * One cell in the calendar grid. Pre-computed flags let UI code stay dumb —
 * just check booleans and render.
 */
export interface CalendarDayCell {
  /** BS calendar fields. */
  bs: BsDate;
  /** AD (Gregorian) calendar fields for the same day. */
  ad: AdDate;
  /** 0=Sunday … 6=Saturday */
  weekday: number;
  /** "Sunday" … "Saturday" */
  weekdayName: string;
  /** "आइतबार" … "शनिबार" */
  weekdayNameNepali: string;

  /** BS day-of-month, ASCII (e.g. `1`, `15`). */
  bsDay: number;
  /** BS day-of-month in Devanagari (e.g. `"१"`, `"१५"`). */
  bsDayNepali: string;
  /** AD day-of-month (e.g. `13`). */
  adDay: number;

  /** `false` for adjacent-month padding cells, `true` otherwise. */
  isCurrentMonth: boolean;
  /** `true` if this day equals today's BS date in Asia/Kathmandu time. */
  isToday: boolean;
  /** `true` if Saturday (Nepal's weekly holiday). */
  isSaturday: boolean;
  /** `true` if Sunday. */
  isSunday: boolean;
  /**
   * `true` if the day is in the configured weekend set. Defaults to Saturday only;
   * pass `weekendDays` to {@link getCalendarMonth} to customise.
   */
  isWeekend: boolean;

  /**
   * `NepaliDate` instance — handy if the consumer wants to do arithmetic from
   * the cell (e.g. on click, navigate to that day's detail page).
   */
  date: NepaliDate;
}

/** One row of seven `CalendarDayCell`s. */
export interface CalendarWeek {
  /** 1-based week index within the BS month. */
  weekNumber: number;
  /** Always exactly 7 cells (Sun–Sat by default; respects `weekStartsOn`). */
  days: CalendarDayCell[];
}

/** A full BS month, pre-shaped as a grid for direct UI rendering. */
export interface CalendarMonth {
  /** BS year (e.g. 2081). */
  year: number;
  /** BS year in Devanagari (e.g. "२०८१"). */
  yearNepali: string;
  /** BS month, 1..12. */
  month: number;
  /** "Baishakh" … "Chaitra". */
  monthName: string;
  /** "बैशाख" … "चैत". */
  monthNameNepali: string;
  /** Total number of BS days in this month (29..32). */
  daysInMonth: number;

  /** First BS day of the month as a `NepaliDate`. */
  firstDay: NepaliDate;
  /** Last BS day of the month as a `NepaliDate`. */
  lastDay: NepaliDate;

  /**
   * 7 weekday headers in the configured week-start order. English by default;
   * pass `locale: "ne"` for Devanagari.
   */
  weekdayHeaders: string[];
  /** Short variant ("Sun"/"आइत"). */
  weekdayHeadersShort: string[];
  /** Min variant ("Su") — English only; Nepali short is reused. */
  weekdayHeadersMin: string[];

  /**
   * Each row is one week (always 7 cells). Includes leading/trailing
   * adjacent-month days when `padding` is `true` (the default), so the grid
   * is always rectangular for clean rendering.
   */
  weeks: CalendarWeek[];
}

/** Options for {@link getCalendarMonth}. */
export interface CalendarMonthOptions {
  /**
   * 0=Sunday (default — Nepal standard), 1=Monday, … 6=Saturday.
   * Affects the order of `weekdayHeaders` and the column each cell falls in.
   */
  weekStartsOn?: number;
  /**
   * When `true` (default), prefix and suffix weeks are filled with cells from
   * the previous/next BS month. Those cells have `isCurrentMonth: false`.
   *
   * When `false`, the first row may have leading-empty slots and the last row
   * may end early — but no out-of-range cells are emitted. (Useful when the
   * calendar straddles the supported BS year range boundary.)
   */
  padding?: boolean;
  /**
   * Override "today" — useful for tests or when displaying a calendar
   * relative to a date other than the wall-clock now.
   */
  today?: NepaliDate;
  /**
   * Custom weekend set (default `[6]` — Saturday only).
   * Pass `[0, 6]` to mark Sundays as weekends too.
   */
  weekendDays?: readonly number[];
  /**
   * Locale name (`"en"`, `"ne"`, or any registered custom locale) controlling
   * `monthName`, `monthNameNepali`, and `weekdayHeaders*`. Defaults to the
   * global locale set via `NepaliDate.locale(...)`.
   *
   * You can also pass a `Locale` object directly.
   */
  locale?: string | Locale;
}

/**
 * Build a calendar grid for a single BS month.
 *
 * @example Minimal — just the data
 * ```ts
 * const cal = getCalendarMonth(2081, 1);
 * cal.weeks.length;           // typically 5 or 6
 * cal.weeks[0].days.length;   // 7 (always)
 * cal.weeks[0].days[0].bs;    // first cell's BS date
 * ```
 *
 * @example With Monday-start weeks and Sunday/Saturday weekends
 * ```ts
 * getCalendarMonth(2081, 1, {
 *   weekStartsOn: 1,
 *   weekendDays: [0, 6],
 *   locale: "ne",
 * });
 * ```
 */
export function getCalendarMonth(
  year: number,
  month: number,
  options: CalendarMonthOptions = {},
): CalendarMonth {
  const weekStartsOn = options.weekStartsOn ?? 0;
  const padding = options.padding ?? true;
  const today = options.today ?? NepaliDate.now();
  const weekendDays = options.weekendDays ?? [6];
  const loc: Locale = options.locale === undefined
    ? resolveGlobalLocale()
    : typeof options.locale === "string"
      ? getLocale(options.locale)
      : options.locale;

  if (weekStartsOn < 0 || weekStartsOn > 6 || !Number.isInteger(weekStartsOn)) {
    throw new RangeError("weekStartsOn must be integer 0..6");
  }

  const dim = daysInBsMonth(year, month);
  const firstDay = NepaliDate.fromBs(year, month, 1);
  const lastDay = NepaliDate.fromBs(year, month, dim);

  // Number of leading adjacent-month cells:
  const leadingPad = (((firstDay.getDay() - weekStartsOn) % 7) + 7) % 7;

  // Build a flat list of cells: [leading...] + [current...] + [trailing...]
  const cells: CalendarDayCell[] = [];

  // Leading days
  if (padding) {
    for (let i = leadingPad; i > 0; i--) {
      const d = firstDay.addDays(-i);
      cells.push(buildCell(d, false, today, weekendDays));
    }
  } else {
    // emit empty placeholder cells via current month entry — handled below
    for (let i = 0; i < leadingPad; i++) {
      cells.push(EMPTY_CELL);
    }
  }

  // Current month days
  for (let d = 1; d <= dim; d++) {
    const date = NepaliDate.fromBs(year, month, d);
    cells.push(buildCell(date, true, today, weekendDays));
  }

  // Trailing days — fill until we have a multiple of 7
  const remainder = cells.length % 7;
  if (remainder !== 0) {
    const need = 7 - remainder;
    for (let i = 1; i <= need; i++) {
      if (padding) {
        const d = lastDay.addDays(i);
        cells.push(buildCell(d, false, today, weekendDays));
      } else {
        cells.push(EMPTY_CELL);
      }
    }
  }

  // Group into weeks of 7
  const weeks: CalendarWeek[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push({
      weekNumber: i / 7 + 1,
      days: cells.slice(i, i + 7),
    });
  }

  // Weekday headers in configured order
  const orderedHeader = (full: readonly string[]) => {
    const out: string[] = [];
    for (let i = 0; i < 7; i++) out.push(full[(weekStartsOn + i) % 7]!);
    return out;
  };
  const weekdayHeaders = orderedHeader(loc.weekdays);
  const weekdayHeadersShort = orderedHeader(loc.weekdaysShort);
  const weekdayHeadersMin = orderedHeader(loc.weekdaysMin);

  return {
    year,
    yearNepali: toDevanagariDigits(year),
    month,
    monthName: loc.months[month - 1]!,
    monthNameNepali: BS_MONTH_NAMES_NP[month - 1]!,
    daysInMonth: dim,
    firstDay,
    lastDay,
    weekdayHeaders,
    weekdayHeadersShort,
    weekdayHeadersMin,
    weeks,
  };
}

/**
 * Sentinel used when `padding: false` leaves a slot empty.
 * Detect via `bs.year === 0`. In practice most users keep `padding: true`,
 * so they will never see this.
 */
const EMPTY_CELL: CalendarDayCell = Object.freeze({
  bs: { year: 0, month: 0, day: 0 },
  ad: { year: 0, month: 0, day: 0 },
  weekday: -1,
  weekdayName: "",
  weekdayNameNepali: "",
  bsDay: 0,
  bsDayNepali: "",
  adDay: 0,
  isCurrentMonth: false,
  isToday: false,
  isSaturday: false,
  isSunday: false,
  isWeekend: false,
  date: null as unknown as NepaliDate,
}) as CalendarDayCell;

function buildCell(
  date: NepaliDate,
  isCurrentMonth: boolean,
  today: NepaliDate,
  weekendDays: readonly number[],
): CalendarDayCell {
  const bs = date.toBs();
  const ad = date.toAd();
  const weekday = date.getDay();
  return {
    bs,
    ad,
    weekday,
    weekdayName: WEEKDAY_NAMES[weekday]!,
    weekdayNameNepali: WEEKDAY_NAMES_NP[weekday]!,
    bsDay: bs.day,
    bsDayNepali: toDevanagariDigits(bs.day),
    adDay: ad.day,
    isCurrentMonth,
    isToday: date.isSameDay(today),
    isSaturday: weekday === 6,
    isSunday: weekday === 0,
    isWeekend: weekendDays.includes(weekday),
    date,
  };
}

/**
 * Build calendar data for an entire BS year (12 months).
 *
 * @example
 * const months = getCalendarYear(2081);
 * months[0].monthNameNepali; // "बैशाख"
 * months[0].weeks.length;    // ~5
 */
export function getCalendarYear(
  year: number,
  options: CalendarMonthOptions = {},
): CalendarMonth[] {
  const out: CalendarMonth[] = [];
  for (let m = 1; m <= 12; m++) out.push(getCalendarMonth(year, m, options));
  return out;
}

/**
 * Build the cell metadata for a single day. Useful for "day detail" views.
 *
 * @example
 * const cell = getCalendarDay(NepaliDate.fromBs(2081, 1, 1));
 * cell.weekdayNameNepali; // "शनिबार"
 * cell.adDay;             // 13
 */
export function getCalendarDay(
  date: NepaliDate,
  options: { today?: NepaliDate; weekendDays?: readonly number[] } = {},
): CalendarDayCell {
  return buildCell(
    date,
    true,
    options.today ?? NepaliDate.now(),
    options.weekendDays ?? [6],
  );
}

/**
 * Flatten a month grid back to a plain `CalendarDayCell[]`.
 * Convenience for consumers who don't need the week-row grouping.
 */
export function flattenCalendarMonth(month: CalendarMonth): CalendarDayCell[] {
  return month.weeks.flatMap((w) => w.days);
}
