import { describe, expect, it } from "vitest";
import {
  addDays,
  addMonths,
  addYears,
  areIntervalsOverlapping,
  clamp,
  closestIndexTo,
  closestTo,
  convertAdRangeToBs,
  convertBsRangeToAd,
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInDays,
  differenceInMonths,
  differenceInWeeks,
  differenceInYears,
  eachAdDayInBsRange,
  eachBsDayInAdRange,
  eachBsMonthInAdRange,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  eachYearOfInterval,
  endOfFiscalYear,
  endOfWeek,
  formatDistance,
  formatDistanceNepali,
  formatDistanceToNow,
  formatDistanceToNowNepali,
  formatRelativeNepali,
  formatFiscalYear,
  formatRelative,
  getFiscalQuarter,
  getFiscalYear,
  isAfter,
  isFirstDayOfMonth,
  isLastDayOfMonth,
  isLeapYear,
  isMonday,
  isSameMonth,
  isSameWeek,
  isSameYear,
  isSaturday,
  isToday,
  isTomorrow,
  isValid,
  isWeekend,
  isWithinInterval,
  isYesterday,
  max,
  min,
  NepaliDate,
  setDate,
  setDay,
  setHours,
  setMonth,
  setYear,
  startOfFiscalYear,
  startOfWeek,
  subDays,
  subMonths,
} from "../src/index.js";

describe("standalone arithmetic helpers", () => {
  const d = NepaliDate.fromBs(2080, 1, 15);
  it("addDays / subDays", () => {
    expect(addDays(d, 7).getDate()).toBe(22);
    expect(subDays(d, 1).getDate()).toBe(14);
  });
  it("addMonths / subMonths", () => {
    expect(addMonths(d, 1).getMonth()).toBe(2);
    expect(subMonths(d, 1).getYear()).toBe(2079);
  });
  it("addYears", () => {
    expect(addYears(d, 1).getYear()).toBe(2081);
  });
});

describe("setters", () => {
  const d = NepaliDate.fromBs(2080, 1, 15);
  it("setYear / setMonth / setDate", () => {
    expect(setYear(d, 2081).getYear()).toBe(2081);
    expect(setMonth(d, 5).getMonth()).toBe(5);
    expect(setDate(d, 1).getDate()).toBe(1);
  });
  it("setMonth clamps day", () => {
    const last = NepaliDate.fromBs(2080, 1, 31);
    const moved = setMonth(last, 9); // Poush often has 29
    expect(moved.getDate()).toBeLessThanOrEqual(moved.daysInMonth());
  });
  it("setDay moves within current week", () => {
    const sat = NepaliDate.fromBs(2081, 1, 1); // Saturday
    expect(setDay(sat, 0).getDay()).toBe(0);
    expect(setDay(sat, 6).isSameDay(sat)).toBe(true);
  });
  it("setHours / setHours validation", () => {
    expect(setHours(d, 5).getHours()).toBe(5);
    expect(() => setHours(d, 24)).toThrow();
  });
});

describe("comparisons", () => {
  const a = NepaliDate.fromBs(2081, 1, 1); // Saturday
  const b = NepaliDate.fromBs(2081, 1, 15);
  const c = NepaliDate.fromBs(2081, 2, 1);

  it("isSameMonth / Year / Week", () => {
    expect(isSameMonth(a, b)).toBe(true);
    expect(isSameMonth(a, c)).toBe(false);
    expect(isSameYear(a, c)).toBe(true);
    expect(isSameWeek(a, a.addDays(2))).toBe(false); // Saturday → Monday crosses week
    expect(isSameWeek(a.addDays(-1), a.addDays(-3))).toBe(true);
  });

  it("isWeekend default = Saturday only", () => {
    expect(isWeekend(a)).toBe(true);             // Sat
    expect(isWeekend(a.addDays(1))).toBe(false); // Sun (not weekend by default)
    expect(isWeekend(a.addDays(1), { weekendDays: [0, 6] })).toBe(true);
  });

  it("weekday-named predicates", () => {
    expect(isSaturday(a)).toBe(true);
    expect(isMonday(a.addDays(2))).toBe(true);
  });

  it("isFirstDayOfMonth / isLastDayOfMonth", () => {
    expect(isFirstDayOfMonth(a)).toBe(true);
    expect(isLastDayOfMonth(a.endOfMonth())).toBe(true);
  });

  it("isLeapYear", () => {
    expect(isLeapYear(NepaliDate.fromBs(1976, 1, 1))).toBe(true);
    expect(isLeapYear(NepaliDate.fromBs(1975, 1, 1))).toBe(false);
  });

  it("isToday / isYesterday / isTomorrow", () => {
    const today = NepaliDate.now();
    expect(isToday(today)).toBe(true);
    expect(isYesterday(today.addDays(-1))).toBe(true);
    expect(isTomorrow(today.addDays(1))).toBe(true);
  });

  it("isAfter / isBefore standalone", () => {
    expect(isAfter(b, a)).toBe(true);
  });

  it("isWithinInterval and overlap", () => {
    const interval = { start: a, end: c };
    expect(isWithinInterval(b, interval)).toBe(true);
    expect(isWithinInterval(c.addDays(1), interval)).toBe(false);
    expect(
      areIntervalsOverlapping(
        { start: a, end: b },
        { start: b, end: c },
      ),
    ).toBe(true);
    expect(
      areIntervalsOverlapping(
        { start: a, end: a.addDays(2) },
        { start: a.addDays(5), end: a.addDays(7) },
      ),
    ).toBe(false);
  });

  it("startOfWeek / endOfWeek (Sun-start by default)", () => {
    const sat = NepaliDate.fromBs(2081, 1, 1); // Sat
    expect(startOfWeek(sat).getDay()).toBe(0);  // Sun
    expect(endOfWeek(sat).getDay()).toBe(6);    // Sat
  });
});

describe("differences", () => {
  const a = NepaliDate.fromBs(2081, 1, 1);
  const b = NepaliDate.fromBs(2082, 1, 1);
  it("differenceInDays / weeks / months / years", () => {
    expect(differenceInDays(b, a)).toBe(a.daysInYear());
    expect(differenceInWeeks(b, a)).toBe(Math.trunc(a.daysInYear() / 7));
    expect(differenceInCalendarMonths(b, a)).toBe(12);
    expect(differenceInMonths(b, a)).toBe(12);
    expect(differenceInYears(b, a)).toBe(1);
  });
  it("differenceInMonths reduces by 1 when day-of-month earlier", () => {
    const x = NepaliDate.fromBs(2081, 1, 15);
    const y = NepaliDate.fromBs(2081, 6, 10);
    expect(differenceInCalendarMonths(y, x)).toBe(5);
    expect(differenceInMonths(y, x)).toBe(4);
  });
  it("differenceInCalendarDays ignores time", () => {
    const x = NepaliDate.fromBs(2081, 1, 1, 23, 0);
    const y = NepaliDate.fromBs(2081, 1, 2, 0, 30);
    expect(differenceInCalendarDays(y, x)).toBe(1);
  });
});

describe("intervals", () => {
  const start = NepaliDate.fromBs(2081, 1, 1);
  const end = NepaliDate.fromBs(2081, 1, 7);

  it("eachDayOfInterval inclusive both ends", () => {
    const days = eachDayOfInterval({ start, end });
    expect(days.length).toBe(7);
    expect(days[0]!.isSameDay(start)).toBe(true);
    expect(days[6]!.isSameDay(end)).toBe(true);
  });

  it("eachMonthOfInterval", () => {
    const months = eachMonthOfInterval({
      start: NepaliDate.fromBs(2081, 1, 1),
      end: NepaliDate.fromBs(2081, 12, 1),
    });
    expect(months.length).toBe(12);
    expect(months[0]!.getMonth()).toBe(1);
    expect(months[11]!.getMonth()).toBe(12);
  });

  it("eachYearOfInterval", () => {
    const ys = eachYearOfInterval({
      start: NepaliDate.fromBs(2080, 1, 1),
      end: NepaliDate.fromBs(2082, 12, 1),
    });
    expect(ys.map(d => d.getYear())).toEqual([2080, 2081, 2082]);
  });

  it("eachWeekOfInterval (Sun-start)", () => {
    const ws = eachWeekOfInterval({
      start: NepaliDate.fromBs(2081, 1, 1),
      end: NepaliDate.fromBs(2081, 1, 21),
    });
    expect(ws.length).toBeGreaterThanOrEqual(3);
    ws.forEach(w => expect(w.getDay()).toBe(0));
  });
});

describe("cross-calendar range conversion", () => {
  it("convertAdRangeToBs (bounds, raw)", () => {
    const r = convertAdRangeToBs(
      { year: 2024, month: 4, day: 13 },
      { year: 2025, month: 4, day: 14 },
    );
    expect(r.start).toEqual({ year: 2081, month: 1, day: 1 });
    expect(r.end).toEqual({ year: 2082, month: 1, day: 1 });
  });

  it("convertAdRangeToBs (bounds, formatted)", () => {
    const r = convertAdRangeToBs(
      new Date("2024-04-13"),
      new Date("2024-04-15"),
      { format: "DD MMMM YYYY" },
    );
    expect(r.start).toBe("01 Baishakh 2081");
    expect(r.end).toBe("03 Baishakh 2081");
  });

  it("convertAdRangeToBs (Devanagari)", () => {
    const r = convertAdRangeToBs(
      { year: 2024, month: 4, day: 13 },
      { year: 2024, month: 4, day: 13 },
      { format: "YYYY-MM-DD", nepali: true },
    );
    expect(r.start).toBe("२०८१-०१-०१");
  });

  it("eachBsDayInAdRange returns one entry per day, inclusive", () => {
    const days = eachBsDayInAdRange(
      { year: 2024, month: 4, day: 13 },
      { year: 2024, month: 4, day: 17 },
    );
    expect(days.length).toBe(5);
    expect(days[0]).toEqual({ year: 2081, month: 1, day: 1 });
    expect(days[4]).toEqual({ year: 2081, month: 1, day: 5 });
  });

  it("eachBsDayInAdRange formatted", () => {
    const days = eachBsDayInAdRange(
      new Date("2024-04-13"),
      new Date("2024-04-15"),
      { format: "DD MMMM YYYY" },
    );
    expect(days).toEqual([
      "01 Baishakh 2081",
      "02 Baishakh 2081",
      "03 Baishakh 2081",
    ]);
  });

  it("eachBsMonthInAdRange", () => {
    const months = eachBsMonthInAdRange(
      new Date("2024-04-13"),
      new Date("2024-08-13"),
      { format: "MMMM YYYY" },
    );
    expect(months.length).toBeGreaterThanOrEqual(4);
    expect(months[0]).toBe("Baishakh 2081");
  });

  it("convertBsRangeToAd (bounds, formatted)", () => {
    const r = convertBsRangeToAd(
      { year: 2081, month: 1, day: 1 },
      { year: 2082, month: 1, day: 1 },
      { format: "YYYY-MM-DD" },
    );
    expect(r.start).toBe("2024-04-13");
  });

  it("eachAdDayInBsRange", () => {
    const days = eachAdDayInBsRange(
      { year: 2081, month: 1, day: 1 },
      { year: 2081, month: 1, day: 3 },
      { format: "MMM D, YYYY" },
    );
    expect(days).toEqual([
      "Apr 13, 2024",
      "Apr 14, 2024",
      "Apr 15, 2024",
    ]);
  });
});

describe("fiscal year", () => {
  it("getFiscalYear", () => {
    expect(getFiscalYear(NepaliDate.fromBs(2081, 4, 1))).toBe(2081); // Shrawan 1
    expect(getFiscalYear(NepaliDate.fromBs(2081, 3, 30))).toBe(2080); // last day of FY 2080/81
    expect(getFiscalYear(NepaliDate.fromBs(2081, 12, 1))).toBe(2081);
  });

  it("startOfFiscalYear / endOfFiscalYear", () => {
    expect(startOfFiscalYear(2081).toBs()).toEqual({ year: 2081, month: 4, day: 1 });
    expect(endOfFiscalYear(2081).getMonth()).toBe(3);
    expect(endOfFiscalYear(2081).getYear()).toBe(2082);
  });

  it("formatFiscalYear", () => {
    expect(formatFiscalYear(2081)).toBe("2081/82");
    expect(formatFiscalYear(2099)).toBe("2099/00");
    expect(formatFiscalYear(2081, { nepali: true })).toBe("२०८१/८२");
  });

  it("getFiscalQuarter", () => {
    expect(getFiscalQuarter(NepaliDate.fromBs(2081, 4, 1))).toBe(1);  // Shrawan
    expect(getFiscalQuarter(NepaliDate.fromBs(2081, 7, 1))).toBe(2);  // Kartik
    expect(getFiscalQuarter(NepaliDate.fromBs(2081, 10, 1))).toBe(3); // Magh
    expect(getFiscalQuarter(NepaliDate.fromBs(2081, 1, 1))).toBe(4);  // Baishakh
  });
});

describe("formatDistance — pure duration, no suffix", () => {
  it("English between two NepaliDates", () => {
    const a = NepaliDate.fromBs(2081, 1, 1);
    const b = NepaliDate.fromBs(2081, 1, 6);
    expect(formatDistance(b, a)).toBe("5 days");
    expect(formatDistance(a, b)).toBe("5 days"); // unsigned
  });

  it("Nepali (Devanagari)", () => {
    const a = NepaliDate.fromBs(2081, 1, 1);
    const b = NepaliDate.fromBs(2081, 1, 6);
    expect(formatDistanceNepali(b, a)).toBe("५ दिन");
  });

  it("never includes a suffix", () => {
    const now = NepaliDate.now();
    expect(formatDistance(now.addDays(-3), now)).not.toMatch(/ago/);
    expect(formatDistance(now, now.addDays(3))).not.toMatch(/in /);
  });
});

describe("formatDistance — polymorphic inputs", () => {
  it("accepts ms timestamp numbers", () => {
    const now = Date.now();
    expect(formatDistance(now - 5 * 60_000, now)).toBe("5 minutes");
  });

  it("accepts JS Date objects", () => {
    const a = new Date("2024-04-13T00:00:00Z");
    const b = new Date("2024-04-20T00:00:00Z");
    expect(formatDistance(a, b)).toBe("7 days");
  });

  it("accepts ISO date strings (Gregorian)", () => {
    expect(formatDistance("2024-04-13", "2024-04-20")).toBe("7 days");
    expect(formatDistanceNepali("2024-04-13", "2024-04-20")).toBe("७ दिन");
  });

  it("accepts mixed input types", () => {
    const ms = Date.UTC(2024, 3, 13);
    expect(formatDistance(ms, "2024-04-20")).toBe("7 days");
    expect(
      formatDistance(
        NepaliDate.fromAd(2024, 4, 13),
        new Date("2024-04-20T00:00:00Z"),
      ),
    ).toBe("7 days");
  });
});

describe("formatDistanceToNow — always includes ago/in suffix", () => {
  it("English: past timestamp → 'X ago'", () => {
    expect(formatDistanceToNow(Date.now() - 5 * 60_000)).toBe("5 minutes ago");
  });

  it("English: future timestamp → 'in X'", () => {
    expect(formatDistanceToNow(Date.now() + 86_400_000)).toMatch(/^in /);
  });

  it("Nepali: past timestamp → 'X अघि'", () => {
    expect(formatDistanceToNowNepali(Date.now() - 5 * 60_000)).toBe(
      "५ मिनेट अघि",
    );
  });

  it("Nepali: future timestamp → 'X पछि'", () => {
    expect(formatDistanceToNowNepali(Date.now() + 86_400_000)).toMatch(/पछि$/);
  });

  it("works with JS Date and ISO string", () => {
    expect(formatDistanceToNow(new Date(Date.now() - 5 * 60_000))).toBe(
      "5 minutes ago",
    );
  });
});

describe("formatRelative — smart phrasing", () => {
  it("English: yesterday/today/tomorrow", () => {
    const today = NepaliDate.now();
    expect(formatRelative(today)).toBe("today");
    expect(formatRelative(today.addDays(-1))).toBe("yesterday");
    expect(formatRelative(today.addDays(1))).toBe("tomorrow");
    expect(formatRelative(today.addDays(3))).toBe("in 3 days");
  });

  it("Nepali: हिजो / आज / भोलि / N दिनमा", () => {
    const today = NepaliDate.now();
    expect(formatRelativeNepali(today)).toBe("आज");
    expect(formatRelativeNepali(today.addDays(-1))).toBe("हिजो");
    expect(formatRelativeNepali(today.addDays(1))).toBe("भोलि");
    expect(formatRelativeNepali(today.addDays(3))).toBe("३ दिनमा");
  });

  it("accepts a timestamp", () => {
    expect(formatRelative(Date.now() - 86_400_000)).toBe("yesterday");
  });
});

describe("Distance helpers reject invalid inputs", () => {
  it("rejects a non-date string", () => {
    expect(() => formatDistance("not a date", Date.now())).toThrow(
      /cannot parse|invalid/i,
    );
  });
  it("rejects NaN", () => {
    expect(() => formatDistance(NaN, Date.now())).toThrow(/timestamp|invalid/i);
  });
  it("rejects an invalid Date", () => {
    expect(() => formatDistance(new Date("invalid"), Date.now())).toThrow(
      /invalid Date/i,
    );
  });
});

describe("min / max / clamp / closestTo / isValid", () => {
  const a = NepaliDate.fromBs(2080, 1, 1);
  const b = NepaliDate.fromBs(2081, 1, 1);
  const c = NepaliDate.fromBs(2082, 1, 1);

  it("min / max", () => {
    expect(min([b, c, a])!.isSameDay(a)).toBe(true);
    expect(max([b, c, a])!.isSameDay(c)).toBe(true);
    expect(min([])).toBeUndefined();
  });

  it("clamp", () => {
    const interval = { start: b, end: c };
    expect(clamp(a, interval).isSameDay(b)).toBe(true);
    expect(clamp(c.addDays(10), interval).isSameDay(c)).toBe(true);
    expect(clamp(b.addDays(5), interval).getDate()).toBe(6);
  });

  it("closestTo / closestIndexTo", () => {
    expect(closestTo(b.addDays(2), [a, c])!.isSameDay(c) || closestTo(b.addDays(2), [a, c])!.isSameDay(a))
      .toBe(true);
    expect(closestIndexTo(b, [a, b, c])).toBe(1);
  });

  it("isValid", () => {
    expect(isValid(a)).toBe(true);
    expect(isValid("2081-01-01")).toBe(false);
    expect(isValid(new Date())).toBe(false);
  });
});
