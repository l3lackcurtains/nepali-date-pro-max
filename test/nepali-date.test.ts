import { describe, expect, it } from "vitest";
import { NepaliDate } from "../src/index.js";

describe("NepaliDate construction", () => {
  it("fromBs / fromAd produce equivalent values", () => {
    const a = NepaliDate.fromBs(2081, 1, 1);
    const b = NepaliDate.fromAd(2024, 4, 13);
    expect(a.toBs()).toEqual(b.toBs());
    expect(a.toAd()).toEqual(b.toAd());
  });

  it("parse is equivalent to fromBs", () => {
    expect(NepaliDate.parse("2081-01-15").toBs()).toEqual({
      year: 2081,
      month: 1,
      day: 15,
    });
  });

  it("rejects invalid inputs", () => {
    expect(() => NepaliDate.fromBs(2080, 1, 32)).toThrow();
    expect(() => NepaliDate.fromBs(2080, 13, 1)).toThrow();
    expect(() => NepaliDate.fromAd(1900, 1, 1)).toThrow();
  });

  it("now() returns a current Nepal date", () => {
    const n = NepaliDate.now();
    expect(n.getYear()).toBeGreaterThanOrEqual(2080);
    expect(n.getYear()).toBeLessThanOrEqual(2099);
  });
});

describe("NepaliDate accessors", () => {
  const d = NepaliDate.fromBs(2081, 1, 1);

  it("returns BS fields", () => {
    expect(d.getYear()).toBe(2081);
    expect(d.getMonth()).toBe(1);
    expect(d.getDate()).toBe(1);
  });

  it("returns weekday & names", () => {
    expect(d.getDay()).toBe(6); // Saturday
    expect(d.getDayName()).toBe("Saturday");
    expect(d.locale("ne").getDayName()).toBe("शनिबार");
    expect(d.getMonthName()).toBe("Baishakh");
    expect(d.locale("ne").getMonthName()).toBe("बैशाख");
  });

  it("returns AD conversion", () => {
    expect(d.toAd()).toEqual({ year: 2024, month: 4, day: 13 });
  });

  it("returns details object", () => {
    const det = d.getDetails();
    expect(det.bs).toEqual({ year: 2081, month: 1, day: 1 });
    expect(det.ad).toEqual({ year: 2024, month: 4, day: 13 });
    expect(det.weekday).toBe(6);
    expect(det.dayOfYear).toBe(1);
    expect(det.daysInMonth).toBe(31);
  });
});

describe("NepaliDate immutable arithmetic", () => {
  const d = NepaliDate.fromBs(2080, 6, 15); // mid-Ashwin

  it("addDays returns a new instance and does not mutate", () => {
    const next = d.addDays(7);
    expect(next.diffDays(d)).toBe(7);
    expect(d.getDate()).toBe(15); // unchanged
  });

  it("addDays handles negative", () => {
    expect(d.addDays(-15).getDate()).toBeGreaterThan(0);
    expect(d.addDays(-15).addDays(15).isSameDay(d)).toBe(true);
  });

  it("addMonths clamps day for shorter months", () => {
    const last = NepaliDate.fromBs(2080, 1, 31);
    const next = last.addMonths(3); // BS 2080 month 4 has 31 days, varies by year
    expect(next.getMonth()).toBe(4);
    expect(next.getDate()).toBeLessThanOrEqual(31);
  });

  it("addYears", () => {
    const a = NepaliDate.fromBs(2080, 1, 1);
    expect(a.addYears(1).getYear()).toBe(2081);
  });

  it("addHours/Minutes/Seconds cross midnight correctly", () => {
    const dt = NepaliDate.fromBs(2081, 1, 1, 23, 30);
    const next = dt.addHours(2);
    expect(next.getHours()).toBe(1);
    expect(next.getDate()).toBe(2);
  });

  it("startOfMonth / endOfMonth / startOfYear / endOfYear", () => {
    expect(d.startOfMonth().getDate()).toBe(1);
    expect(d.endOfMonth().getDate()).toBe(d.daysInMonth());
    expect(d.startOfYear().toBs()).toEqual({ year: 2080, month: 1, day: 1 });
    expect(d.endOfYear().getMonth()).toBe(12);
  });
});

describe("NepaliDate comparison", () => {
  const a = NepaliDate.fromBs(2080, 1, 1);
  const b = NepaliDate.fromBs(2080, 1, 2);
  const a2 = NepaliDate.fromBs(2080, 1, 1, 5);

  it("isBefore / isAfter", () => {
    expect(a.isBefore(b)).toBe(true);
    expect(b.isAfter(a)).toBe(true);
    expect(a.isBefore(a)).toBe(false);
  });

  it("isSameDay ignores time", () => {
    expect(a.isSameDay(a2)).toBe(true);
  });

  it("diffDays signed", () => {
    expect(b.diffDays(a)).toBe(1);
    expect(a.diffDays(b)).toBe(-1);
  });
});

describe("NepaliDate sub* methods", () => {
  const d = NepaliDate.fromBs(2081, 6, 15, 12, 30);

  it("subDays / subMonths / subYears mirror their add counterparts", () => {
    expect(d.subDays(7).diffDays(d)).toBe(-7);
    expect(d.subMonths(3).getMonth()).toBe(3);
    expect(d.subYears(1).getYear()).toBe(2080);
  });

  it("subHours / subMinutes / subSeconds / subMilliseconds round-trip", () => {
    expect(d.subHours(2).addHours(2).isSameDay(d)).toBe(true);
    expect(d.subMinutes(60).addMinutes(60).getHours()).toBe(d.getHours());
    expect(d.subSeconds(1).addSeconds(1).getSeconds()).toBe(d.getSeconds());
    expect(d.subMilliseconds(1).addMilliseconds(1).getMilliseconds()).toBe(
      d.getMilliseconds(),
    );
  });
});

describe("NepaliDate setters", () => {
  const d = NepaliDate.fromBs(2081, 1, 31, 9, 15, 30, 250);

  it("setYear preserves time and clamps day", () => {
    const r = d.setYear(2080);
    expect(r.getYear()).toBe(2080);
    expect(r.getMonth()).toBe(1);
    expect(r.getHours()).toBe(9);
    expect(r.getMilliseconds()).toBe(250);
  });

  it("setMonth clamps day if target month is shorter", () => {
    const r = d.setMonth(9);
    expect(r.getMonth()).toBe(9);
    expect(r.getDate()).toBeLessThanOrEqual(r.daysInMonth());
  });

  it("setDate throws on out-of-range", () => {
    expect(() => d.setDate(0)).toThrow();
    expect(() => d.setDate(d.daysInMonth() + 1)).toThrow();
  });

  it("setDay moves within the same week (Sunday-start)", () => {
    const r = d.setDay(1);
    expect(r.getDay()).toBe(1);
    expect(Math.abs(r.diffDays(d))).toBeLessThanOrEqual(6);
  });

  it("setDayOfYear lands on the right day", () => {
    const r = d.setDayOfYear(1);
    expect(r.getMonth()).toBe(1);
    expect(r.getDate()).toBe(1);
    expect(r.getDayOfYear()).toBe(1);
  });

  it("setHours / setMinutes / setSeconds / setMilliseconds replace only that field", () => {
    expect(d.setHours(0).getHours()).toBe(0);
    expect(d.setMinutes(45).getMinutes()).toBe(45);
    expect(d.setSeconds(0).getSeconds()).toBe(0);
    expect(d.setMilliseconds(999).getMilliseconds()).toBe(999);
    expect(d.setHours(0).getMinutes()).toBe(15);
  });

  it("setHours rejects out-of-range", () => {
    expect(() => d.setHours(24)).toThrow();
    expect(() => d.setMinutes(-1)).toThrow();
  });

  it("chains naturally", () => {
    const r = d.setMonth(5).setDate(1).startOfDay();
    expect(r.toBs()).toEqual({ year: 2081, month: 5, day: 1 });
    expect(r.getHours()).toBe(0);
  });
});

describe("NepaliDate week & fiscal boundaries", () => {
  const d = NepaliDate.fromBs(2081, 1, 15); // pick mid-month

  it("startOfWeek / endOfWeek default Sunday-start", () => {
    const s = d.startOfWeek();
    const e = d.endOfWeek();
    expect(s.getDay()).toBe(0);
    expect(e.getDay()).toBe(6);
    expect(e.diffDays(s)).toBe(6);
  });

  it("startOfWeek respects weekStartsOn", () => {
    const s = d.startOfWeek({ weekStartsOn: 1 });
    expect(s.getDay()).toBe(1);
  });

  it("getFiscalYear: month >= 4 keeps year, < 4 subtracts 1", () => {
    expect(NepaliDate.fromBs(2081, 4, 1).getFiscalYear()).toBe(2081);
    expect(NepaliDate.fromBs(2081, 3, 30).getFiscalYear()).toBe(2080);
  });

  it("getFiscalQuarter maps months correctly", () => {
    expect(NepaliDate.fromBs(2081, 4, 1).getFiscalQuarter()).toBe(1);
    expect(NepaliDate.fromBs(2081, 7, 1).getFiscalQuarter()).toBe(2);
    expect(NepaliDate.fromBs(2081, 10, 1).getFiscalQuarter()).toBe(3);
    expect(NepaliDate.fromBs(2081, 1, 1).getFiscalQuarter()).toBe(4);
  });

  it("startOfFiscalYear / endOfFiscalYear bracket the FY", () => {
    const mid = NepaliDate.fromBs(2081, 9, 10);
    const start = mid.startOfFiscalYear();
    const end = mid.endOfFiscalYear();
    expect(start.toBs()).toEqual({ year: 2081, month: 4, day: 1 });
    expect(end.getYear()).toBe(2082);
    expect(end.getMonth()).toBe(3);
    expect(start.isBefore(mid)).toBe(true);
    expect(end.isAfter(mid)).toBe(true);
  });
});

describe("NepaliDate differenceIn* family", () => {
  const a = NepaliDate.fromBs(2081, 6, 15);
  const b = NepaliDate.fromBs(2080, 6, 15);

  it("differenceInDays / Weeks match diffDays", () => {
    expect(a.differenceInDays(b)).toBe(a.diffDays(b));
    expect(a.differenceInWeeks(b)).toBe(Math.trunc(a.diffDays(b) / 7));
  });

  it("differenceInMonths / Years signed", () => {
    expect(a.differenceInMonths(b)).toBe(12);
    expect(a.differenceInYears(b)).toBe(1);
    expect(b.differenceInYears(a)).toBe(-1);
  });

  it("differenceInMonths reduces when day-of-month is earlier", () => {
    const x = NepaliDate.fromBs(2081, 6, 10); // earlier day
    const y = NepaliDate.fromBs(2081, 5, 15);
    expect(x.differenceInMonths(y)).toBe(0); // not yet a full month
    expect(x.differenceInCalendarMonths(y)).toBe(1);
  });

  it("differenceInCalendarYears counts year boundaries", () => {
    expect(a.differenceInCalendarYears(b)).toBe(1);
  });

  it("differenceInHours / Minutes / Seconds / Milliseconds use elapsed time", () => {
    const t = NepaliDate.fromBs(2081, 1, 1, 12, 0, 0, 0);
    const u = NepaliDate.fromBs(2081, 1, 1, 10, 30, 30, 500);
    expect(t.differenceInHours(u)).toBe(1);
    expect(t.differenceInMinutes(u)).toBe(89);
    expect(t.differenceInSeconds(u)).toBe(89 * 60 + 29);
    expect(t.differenceInMilliseconds(u)).toBe(
      ((89 * 60 + 29) * 1000) + 500,
    );
  });
});

describe("NepaliDate format / toJSON", () => {
  const d = NepaliDate.fromBs(2081, 1, 1, 14, 30);

  it("toString gives ISO-like BS", () => {
    expect(d.toString()).toBe("2081-01-01");
  });

  it("format respects active locale", () => {
    expect(d.format("YYYY-MM-DD HH:mm")).toBe("2081-01-01 14:30");
    expect(d.locale("ne").format("YYYY-MM-DD")).toBe("२०८१-०१-०१");
  });

  it("toJsDate uses local-time semantics — same calendar day everywhere", () => {
    // The local Date's calendar fields must match the AD-equivalent BS date,
    // independent of host timezone (the prior bug was off-by-one west of UTC+5:45).
    const bs = NepaliDate.fromBs(2081, 1, 1);
    const ad = bs.toAd();
    const js = bs.toJsDate();
    expect(js.getFullYear()).toBe(ad.year);
    expect(js.getMonth()).toBe(ad.month - 1);
    expect(js.getDate()).toBe(ad.day);
  });

  it("toJsDateUTC returns midnight Asia/Kathmandu as a UTC instant", () => {
    // Midnight Kathmandu (UTC+05:45) is 18:15 UTC the previous day.
    const bs = NepaliDate.fromBs(2081, 1, 1);
    const utc = bs.toJsDateUTC();
    const ad = bs.toAd();
    const expectedMs =
      Date.UTC(ad.year, ad.month - 1, ad.day) - ((5 * 60 + 45) * 60 * 1000);
    expect(utc.getTime()).toBe(expectedMs);
  });

  it("toJSON returns bs/ad/iso", () => {
    const j = d.toJSON();
    expect(j.bs).toEqual({ year: 2081, month: 1, day: 1 });
    expect(j.ad).toEqual({ year: 2024, month: 4, day: 13 });
    expect(typeof j.iso).toBe("string");
  });
});
