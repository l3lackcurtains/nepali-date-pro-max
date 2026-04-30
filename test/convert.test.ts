import { describe, expect, it } from "vitest";
import {
  adToBs,
  bsDayOfYear,
  bsFromDayOfYear,
  bsToAd,
  bsWeekday,
  daysInBsMonth,
  daysInBsYear,
  FIRST_BS_YEAR,
  isBsLeapYear,
  LAST_BS_YEAR,
} from "../src/index.js";

describe("BS ↔ AD anchor & well-known dates", () => {
  it("BS 1975-01-01 = AD 1918-04-13 (Saturday)", () => {
    expect(bsToAd(1975, 1, 1)).toEqual({ year: 1918, month: 4, day: 13 });
    expect(adToBs(1918, 4, 13)).toEqual({ year: 1975, month: 1, day: 1 });
    expect(bsWeekday(1975, 1, 1)).toBe(6); // Saturday
  });

  it("BS 2000-01-01 = AD 1943-04-14 (round-trip)", () => {
    const ad = bsToAd(2000, 1, 1);
    expect(adToBs(ad.year, ad.month, ad.day)).toEqual({
      year: 2000,
      month: 1,
      day: 1,
    });
  });

  it("Republic Day: AD 2008-05-28 = BS 2065-02-15", () => {
    expect(adToBs(2008, 5, 28)).toEqual({ year: 2065, month: 2, day: 15 });
    expect(bsToAd(2065, 2, 15)).toEqual({ year: 2008, month: 5, day: 28 });
  });

  it("Nepal New Year: AD 2024-04-13 = BS 2081-01-01", () => {
    expect(adToBs(2024, 4, 13)).toEqual({ year: 2081, month: 1, day: 1 });
    expect(bsToAd(2081, 1, 1)).toEqual({ year: 2024, month: 4, day: 13 });
  });

  it("Christmas Day examples round-trip", () => {
    const ad = { year: 2025, month: 12, day: 25 };
    const bs = adToBs(ad.year, ad.month, ad.day);
    expect(bsToAd(bs.year, bs.month, bs.day)).toEqual(ad);
  });
});

describe("BS calendar metadata", () => {
  it("supports the full advertised range", () => {
    expect(FIRST_BS_YEAR).toBe(1975);
    expect(LAST_BS_YEAR).toBe(2099);
  });

  it("daysInBsMonth obeys 1..12 bounds", () => {
    expect(() => daysInBsMonth(2080, 0)).toThrow();
    expect(() => daysInBsMonth(2080, 13)).toThrow();
    expect(() => daysInBsMonth(1974, 1)).toThrow();
    expect(() => daysInBsMonth(2100, 1)).toThrow();
  });

  it("each year totals 365 or 366 days", () => {
    for (let y = FIRST_BS_YEAR; y <= LAST_BS_YEAR; y++) {
      const total = daysInBsYear(y);
      expect(total === 365 || total === 366).toBe(true);
      let sum = 0;
      for (let m = 1; m <= 12; m++) sum += daysInBsMonth(y, m);
      expect(sum).toBe(total);
    }
  });

  it("isBsLeapYear reports 366-day years", () => {
    expect(isBsLeapYear(1976)).toBe(true);
    expect(isBsLeapYear(1975)).toBe(false);
  });
});

describe("BS ↔ AD round-trip across the entire range", () => {
  it("round-trips BS → AD → BS for every year boundary", () => {
    for (let y = FIRST_BS_YEAR; y <= LAST_BS_YEAR; y++) {
      const dim12 = daysInBsMonth(y, 12);
      for (const [m, d] of [
        [1, 1],
        [6, 15],
        [12, dim12],
      ] as const) {
        const ad = bsToAd(y, m, d);
        const back = adToBs(ad.year, ad.month, ad.day);
        expect(back).toEqual({ year: y, month: m, day: d });
      }
    }
  });

  it("monotonically increases by 1 day across each BS year", () => {
    // For a sample of years, verify consecutive days map to consecutive ADs.
    for (const y of [1975, 2000, 2050, 2080, 2099]) {
      let prev = bsToAd(y, 1, 1);
      let prevTs = Date.UTC(prev.year, prev.month - 1, prev.day);
      for (let m = 1; m <= 12; m++) {
        const dim = daysInBsMonth(y, m);
        for (let d = 1; d <= dim; d++) {
          if (m === 1 && d === 1) continue;
          const cur = bsToAd(y, m, d);
          const curTs = Date.UTC(cur.year, cur.month - 1, cur.day);
          expect(curTs - prevTs).toBe(86_400_000);
          prevTs = curTs;
          prev = cur;
        }
      }
    }
  });
});

describe("Weekday computation", () => {
  it("weekday matches JS Date for a sample of dates", () => {
    const samples: [number, number, number][] = [
      [1975, 1, 1],
      [2000, 1, 1],
      [2065, 2, 15],
      [2081, 1, 1],
      [2099, 12, 30],
    ];
    for (const [y, m, d] of samples) {
      const ad = bsToAd(y, m, d);
      const jsDow = new Date(Date.UTC(ad.year, ad.month - 1, ad.day)).getUTCDay();
      expect(bsWeekday(y, m, d)).toBe(jsDow);
    }
  });
});

describe("Day-of-year helpers", () => {
  it("first/last/middle day of a 366-day BS year", () => {
    expect(bsDayOfYear(1976, 1, 1)).toBe(1);
    expect(bsDayOfYear(1976, 12, daysInBsMonth(1976, 12))).toBe(366);
    expect(bsFromDayOfYear(1976, 1)).toEqual({ month: 1, day: 1 });
    expect(bsFromDayOfYear(1976, 366)).toEqual({
      month: 12,
      day: daysInBsMonth(1976, 12),
    });
  });

  it("rejects out-of-range dayOfYear", () => {
    expect(() => bsFromDayOfYear(2080, 0)).toThrow();
    expect(() => bsFromDayOfYear(2080, 400)).toThrow();
  });
});

describe("Validation", () => {
  it("rejects out-of-range BS years", () => {
    expect(() => bsToAd(1974, 1, 1)).toThrow(RangeError);
    expect(() => bsToAd(2100, 1, 1)).toThrow(RangeError);
  });

  it("rejects out-of-range BS months / days", () => {
    expect(() => bsToAd(2080, 0, 1)).toThrow();
    expect(() => bsToAd(2080, 13, 1)).toThrow();
    expect(() => bsToAd(2080, 1, 0)).toThrow();
    expect(() => bsToAd(2080, 1, 32)).toThrow();
  });

  it("rejects AD dates outside BS range", () => {
    expect(() => adToBs(1900, 1, 1)).toThrow(RangeError);
    expect(() => adToBs(2100, 1, 1)).toThrow(RangeError);
  });

  it("rejects invalid AD calendar dates", () => {
    expect(() => adToBs(2024, 2, 30)).toThrow();
    expect(() => adToBs(2024, 13, 1)).toThrow();
  });
});
