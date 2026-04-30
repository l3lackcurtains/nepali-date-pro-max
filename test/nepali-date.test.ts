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
    expect(d.getDayNameNepali()).toBe("शनिबार");
    expect(d.getMonthName()).toBe("Baishakh");
    expect(d.getMonthNameNepali()).toBe("बैशाख");
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

describe("NepaliDate format / toJSON", () => {
  const d = NepaliDate.fromBs(2081, 1, 1, 14, 30);

  it("toString gives ISO-like BS", () => {
    expect(d.toString()).toBe("2081-01-01");
  });

  it("format and formatNepali", () => {
    expect(d.format("YYYY-MM-DD HH:mm")).toBe("2081-01-01 14:30");
    expect(d.formatNepali("YYYY-MM-DD")).toBe("२०८१-०१-०१");
  });

  it("toJSON returns bs/ad/iso", () => {
    const j = d.toJSON();
    expect(j.bs).toEqual({ year: 2081, month: 1, day: 1 });
    expect(j.ad).toEqual({ year: 2024, month: 4, day: 13 });
    expect(typeof j.iso).toBe("string");
  });
});
