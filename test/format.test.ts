import { describe, expect, it } from "vitest";
import { formatBs, parseBs, toAsciiDigits, toDevanagariDigits } from "../src/index.js";

describe("formatBs", () => {
  const date = { year: 2081, month: 1, day: 1 };

  it("renders ISO-style date", () => {
    expect(formatBs(date, "YYYY-MM-DD")).toBe("2081-01-01");
  });

  it("renders long Roman form", () => {
    expect(formatBs(date, "DD MMMM, YYYY")).toBe("01 Baishakh, 2081");
  });

  it("renders short forms", () => {
    expect(formatBs(date, "D MMM YY")).toBe("1 Bai 81");
  });

  it("renders weekday tokens", () => {
    expect(formatBs(date, "dddd")).toBe("Saturday");
    expect(formatBs(date, "ddd")).toBe("Sat");
    expect(formatBs(date, "dd")).toBe("Sa");
  });

  it("renders 12/24 hour and AM/PM", () => {
    const dt = { ...date, hour: 14, minute: 5, second: 9 };
    expect(formatBs(dt, "HH:mm:ss")).toBe("14:05:09");
    expect(formatBs(dt, "h:mm A")).toBe("2:05 PM");
    expect(formatBs({ ...date, hour: 0 }, "h:mm a")).toBe("12:00 am");
  });

  it("supports literal escapes in [brackets]", () => {
    expect(formatBs(date, "[year:] YYYY")).toBe("year: 2081");
  });

  it("renders Nepali (Devanagari) output via locale: 'ne'", () => {
    expect(formatBs(date, "YYYY-MM-DD", { locale: "ne" })).toBe(
      "२०८१-०१-०१",
    );
    expect(formatBs(date, "DD MMMM YYYY", { locale: "ne" })).toBe(
      "०१ बैशाख २०८१",
    );
    expect(formatBs(date, "dddd", { locale: "ne" })).toBe("शनिबार");
  });
});

describe("parseBs", () => {
  it("parses YYYY-MM-DD", () => {
    expect(parseBs("2081-01-15")).toEqual({ year: 2081, month: 1, day: 15 });
  });
  it("parses YYYY/MM/DD and YYYY.M.D", () => {
    expect(parseBs("2081/01/15")).toEqual({ year: 2081, month: 1, day: 15 });
    expect(parseBs("2081.1.5")).toEqual({ year: 2081, month: 1, day: 5 });
  });
  it("parses Devanagari digits", () => {
    expect(parseBs("२०८१-०१-१५")).toEqual({ year: 2081, month: 1, day: 15 });
  });
  it("rejects invalid format", () => {
    expect(() => parseBs("Apr 13, 2024")).toThrow();
    expect(() => parseBs("2081")).toThrow();
  });
  it("rejects invalid date", () => {
    expect(() => parseBs("2081-13-01")).toThrow();
    expect(() => parseBs("2081-01-32")).toThrow();
  });
  it("rejects out-of-range year", () => {
    expect(() => parseBs("1800-01-01")).toThrow();
  });
});

describe("digit helpers", () => {
  it("converts ASCII to Devanagari and back", () => {
    expect(toDevanagariDigits("2081-01-15")).toBe("२०८१-०१-१५");
    expect(toAsciiDigits("२०८१-०१-१५")).toBe("2081-01-15");
    expect(toDevanagariDigits(2081)).toBe("२०८१");
  });
});
