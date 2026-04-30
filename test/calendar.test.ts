import { describe, expect, it } from "vitest";
import {
  flattenCalendarMonth,
  getCalendarDay,
  getCalendarMonth,
  getCalendarYear,
  NepaliDate,
} from "../src/index.js";

describe("getCalendarMonth", () => {
  it("produces a complete grid (multiple of 7 cells)", () => {
    const cal = getCalendarMonth(2081, 1);
    cal.weeks.forEach((w) => expect(w.days.length).toBe(7));
    expect(cal.weeks.length).toBeGreaterThanOrEqual(5);
    expect(cal.weeks.length).toBeLessThanOrEqual(6);
  });

  it("each row of 7 starts on the configured weekStartsOn", () => {
    const cal = getCalendarMonth(2081, 1, { weekStartsOn: 0 });
    cal.weeks.forEach((w) => expect(w.days[0]!.weekday).toBe(0));
    const cal2 = getCalendarMonth(2081, 1, { weekStartsOn: 1 });
    cal2.weeks.forEach((w) => expect(w.days[0]!.weekday).toBe(1));
  });

  it("includes leading and trailing adjacent-month days when padding is true", () => {
    const cal = getCalendarMonth(2081, 1); // Baishakh 1, 2081 = Saturday
    const flat = flattenCalendarMonth(cal);
    const first = flat[0]!;
    const last = flat[flat.length - 1]!;
    // BS 2081-01-01 is Saturday → 6 leading cells from previous BS year
    expect(first.isCurrentMonth).toBe(false);
    expect(first.bs.year).toBe(2080);
    expect(first.bs.month).toBe(12);
    // Last cell should be in month 2 (Jestha) of 2081 or later
    expect(last.isCurrentMonth).toBe(false);
    expect(last.bs.month).toBeGreaterThanOrEqual(2);
  });

  it("contains exactly daysInMonth current-month cells", () => {
    const cal = getCalendarMonth(2081, 1);
    const currentMonthCells = flattenCalendarMonth(cal).filter(
      (c) => c.isCurrentMonth,
    );
    expect(currentMonthCells.length).toBe(cal.daysInMonth);
    expect(currentMonthCells[0]!.bs).toEqual({ year: 2081, month: 1, day: 1 });
    expect(currentMonthCells[currentMonthCells.length - 1]!.bs.day).toBe(
      cal.daysInMonth,
    );
  });

  it("provides English and Devanagari names + headers", () => {
    const en = getCalendarMonth(2081, 1, { locale: "en" });
    const ne = getCalendarMonth(2081, 1, { locale: "ne" });
    expect(en.monthName).toBe("Baishakh");
    expect(en.monthNameNepali).toBe("बैशाख");
    expect(en.weekdayHeaders).toEqual([
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ]);
    expect(ne.weekdayHeaders[0]).toBe("आइतबार");
    expect(ne.weekdayHeaders[6]).toBe("शनिबार");
  });

  it("marks Saturday cells", () => {
    const cal = getCalendarMonth(2081, 1);
    const sat = flattenCalendarMonth(cal).find(
      (c) => c.isCurrentMonth && c.weekday === 6,
    )!;
    expect(sat.isSaturday).toBe(true);
    expect(sat.isWeekend).toBe(true);
  });

  it("default weekend is Saturday only", () => {
    const cal = getCalendarMonth(2081, 1);
    const sun = flattenCalendarMonth(cal).find(
      (c) => c.isCurrentMonth && c.weekday === 0,
    )!;
    expect(sun.isWeekend).toBe(false);
  });

  it("custom weekendDays marks Sundays as weekend", () => {
    const cal = getCalendarMonth(2081, 1, { weekendDays: [0, 6] });
    const sun = flattenCalendarMonth(cal).find(
      (c) => c.isCurrentMonth && c.weekday === 0,
    )!;
    expect(sun.isWeekend).toBe(true);
  });

  it("isToday flag is set when today option is provided", () => {
    const today = NepaliDate.fromBs(2081, 1, 15);
    const cal = getCalendarMonth(2081, 1, { today });
    const todayCell = flattenCalendarMonth(cal).find((c) => c.isToday)!;
    expect(todayCell.bs).toEqual({ year: 2081, month: 1, day: 15 });
  });

  it("provides BS day in both ASCII and Devanagari", () => {
    const cal = getCalendarMonth(2081, 1);
    const day15 = flattenCalendarMonth(cal).find(
      (c) => c.isCurrentMonth && c.bsDay === 15,
    )!;
    expect(day15.bsDayNepali).toBe("१५");
  });

  it("provides matching AD day", () => {
    const cal = getCalendarMonth(2081, 1);
    const day1 = flattenCalendarMonth(cal).find(
      (c) => c.isCurrentMonth && c.bsDay === 1,
    )!;
    expect(day1.adDay).toBe(13); // 2024-04-13
    expect(day1.ad.year).toBe(2024);
    expect(day1.ad.month).toBe(4);
  });

  it("respects weekStartsOn for header order", () => {
    const cal = getCalendarMonth(2081, 1, { weekStartsOn: 1 });
    expect(cal.weekdayHeaders[0]).toBe("Monday");
    expect(cal.weekdayHeaders[6]).toBe("Sunday");
  });

  it("rejects invalid weekStartsOn", () => {
    expect(() => getCalendarMonth(2081, 1, { weekStartsOn: 7 })).toThrow();
    expect(() => getCalendarMonth(2081, 1, { weekStartsOn: -1 })).toThrow();
  });

  it("validates BS year and month", () => {
    expect(() => getCalendarMonth(1900, 1)).toThrow();
    expect(() => getCalendarMonth(2081, 13)).toThrow();
  });
});

describe("getCalendarYear", () => {
  it("returns 12 months", () => {
    const yr = getCalendarYear(2081);
    expect(yr.length).toBe(12);
    expect(yr[0]!.month).toBe(1);
    expect(yr[11]!.month).toBe(12);
    expect(yr[0]!.monthNameNepali).toBe("बैशाख");
  });
});

describe("getCalendarDay", () => {
  it("provides a single-cell view", () => {
    const cell = getCalendarDay(NepaliDate.fromBs(2081, 1, 1));
    expect(cell.bs).toEqual({ year: 2081, month: 1, day: 1 });
    expect(cell.weekdayName).toBe("Saturday");
    expect(cell.weekdayNameNepali).toBe("शनिबार");
    expect(cell.isSaturday).toBe(true);
    expect(cell.isWeekend).toBe(true);
    expect(cell.isCurrentMonth).toBe(true);
  });
});

describe("flattenCalendarMonth", () => {
  it("returns the cells in row-major order", () => {
    const cal = getCalendarMonth(2081, 1);
    const flat = flattenCalendarMonth(cal);
    expect(flat.length).toBe(cal.weeks.length * 7);
    expect(flat[0]).toBe(cal.weeks[0]!.days[0]);
    expect(flat[7]).toBe(cal.weeks[1]!.days[0]);
  });
});
