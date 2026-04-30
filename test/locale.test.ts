import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  formatBs,
  getCalendarMonth,
  getGlobalLocale,
  getLocale,
  hasLocale,
  listLocales,
  NepaliDate,
  registerLocale,
  setGlobalLocale,
} from "../src/index.js";

const date = { year: 2081, month: 1, day: 1 };

describe("locale registry", () => {
  afterEach(() => {
    setGlobalLocale("en");
  });

  it("ships en + ne built-in", () => {
    expect(hasLocale("en")).toBe(true);
    expect(hasLocale("ne")).toBe(true);
    expect(listLocales()).toEqual(expect.arrayContaining(["en", "ne"]));
  });

  it("global default is en", () => {
    expect(getGlobalLocale()).toBe("en");
  });

  it("getLocale throws on unknown", () => {
    expect(() => getLocale("zz")).toThrow(/Unknown locale/);
  });

  it("setGlobalLocale switches the global default", () => {
    setGlobalLocale("ne");
    expect(getGlobalLocale()).toBe("ne");
    setGlobalLocale("en");
    expect(getGlobalLocale()).toBe("en");
  });

  it("setGlobalLocale rejects unregistered name", () => {
    expect(() => setGlobalLocale("zz")).toThrow(/Unknown locale/);
  });

  it("registerLocale validates shape", () => {
    expect(() =>
      registerLocale({
        name: "bad",
        // @ts-expect-error intentionally wrong
        months: ["only-one"],
      }),
    ).toThrow();
  });

  it("custom registered locale is usable everywhere", () => {
    registerLocale({
      name: "ne-rom",
      months: [
        "Baishak", "Jeth", "Asar", "Saun", "Bhadau", "Asoj",
        "Kartik", "Mangsir", "Push", "Magh", "Falgun", "Chait",
      ],
      monthsShort: [
        "Bai", "Jet", "Asa", "Sau", "Bha", "Aso",
        "Kar", "Man", "Pus", "Mag", "Fal", "Cha",
      ],
      weekdays: [
        "Aaitabar", "Sombar", "Mangalbar", "Budhabar",
        "Bihibar", "Sukrabar", "Sanibar",
      ],
      weekdaysShort: ["Aai", "Som", "Man", "Bud", "Bih", "Suk", "San"],
      weekdaysMin: ["Aa", "So", "Ma", "Bu", "Bi", "Su", "Sa"],
      digits: (n) => String(n),
    });

    expect(formatBs(date, "DD MMMM YYYY", { locale: "ne-rom" })).toBe(
      "01 Baishak 2081",
    );
    expect(NepaliDate.fromBs(2081, 1, 1).locale("ne-rom").format("dddd")).toBe(
      "Sanibar",
    );
  });
});

describe("formatBs locale option", () => {
  afterEach(() => {
    setGlobalLocale("en");
  });

  it("uses global locale by default", () => {
    setGlobalLocale("ne");
    expect(formatBs(date, "DD MMMM YYYY")).toBe("०१ बैशाख २०८१");
  });

  it("locale: 'ne' produces Devanagari", () => {
    expect(formatBs(date, "DD MMMM YYYY", { locale: "ne" })).toBe(
      "०१ बैशाख २०८१",
    );
    expect(formatBs(date, "dddd", { locale: "ne" })).toBe("शनिबार");
  });

  it("locale option overrides global", () => {
    setGlobalLocale("ne");
    expect(formatBs(date, "DD MMMM YYYY", { locale: "en" })).toBe(
      "01 Baishakh 2081",
    );
  });

});

describe("NepaliDate.locale (global)", () => {
  afterEach(() => setGlobalLocale("en"));

  it("returns current name when called bare", () => {
    expect(NepaliDate.locale()).toBe("en");
  });

  it("sets and returns the new global", () => {
    expect(NepaliDate.locale("ne")).toBe("ne");
    expect(NepaliDate.locale()).toBe("ne");
  });

  it("rejects unknown name", () => {
    expect(() => NepaliDate.locale("zz")).toThrow();
  });
});

describe("NepaliDate#locale (instance)", () => {
  afterEach(() => setGlobalLocale("en"));

  it("getter returns resolved name (instance → global)", () => {
    const d = NepaliDate.fromBs(2081, 1, 1);
    expect(d.locale()).toBe("en");

    setGlobalLocale("ne");
    expect(d.locale()).toBe("ne");
  });

  it("setter returns NEW immutable instance", () => {
    const d = NepaliDate.fromBs(2081, 1, 1);
    const ne = d.locale("ne");
    expect(ne).not.toBe(d);
    expect(d.locale()).toBe("en");
    expect(ne.locale()).toBe("ne");
  });

  it("instance locale beats global default", () => {
    setGlobalLocale("ne");
    const d = NepaliDate.fromBs(2081, 1, 1).locale("en");
    expect(d.format("DD MMMM YYYY")).toBe("01 Baishakh 2081");
  });

  it("locale flows through chained operations", () => {
    const d = NepaliDate.fromBs(2081, 1, 1).locale("ne");
    expect(d.addDays(7).format("DD MMMM YYYY")).toBe("०८ बैशाख २०८१");
    expect(d.addMonths(1).format("DD MMMM YYYY")).toBe("०१ जेठ २०८१");
    expect(d.addYears(1).format("DD MMMM YYYY")).toBe("०१ बैशाख २०८२");
    expect(d.startOfMonth().format("DD MMMM")).toBe("०१ बैशाख");
    expect(d.endOfMonth().format("DD MMMM")).toBe("३१ बैशाख");
    expect(d.setYear(2082).format("YYYY")).toBe("२०८२");
    expect(d.setHours(14).addMinutes(30).format("HH:mm")).toBe("१४:३०");
  });

  it("getMonthName / getDayName follow instance locale", () => {
    const d = NepaliDate.fromBs(2081, 1, 1);
    expect(d.getMonthName()).toBe("Baishakh");
    expect(d.getDayName()).toBe("Saturday");
    expect(d.locale("ne").getMonthName()).toBe("बैशाख");
    expect(d.locale("ne").getDayName()).toBe("शनिबार");
  });

  it("toString stays ASCII regardless of locale", () => {
    setGlobalLocale("ne");
    expect(NepaliDate.fromBs(2081, 1, 1).toString()).toBe("2081-01-01");
  });
});

describe("calendar locale", () => {
  afterEach(() => setGlobalLocale("en"));

  it("defaults to global locale", () => {
    setGlobalLocale("ne");
    const cal = getCalendarMonth(2081, 1);
    expect(cal.weekdayHeaders[0]).toBe("आइतबार");
    expect(cal.monthName).toBe("बैशाख");
  });

  it("explicit locale option overrides global", () => {
    setGlobalLocale("ne");
    const cal = getCalendarMonth(2081, 1, { locale: "en" });
    expect(cal.weekdayHeaders[0]).toBe("Sunday");
    expect(cal.monthName).toBe("Baishakh");
  });

  it("monthNameNepali stays Devanagari regardless of locale", () => {
    const cal = getCalendarMonth(2081, 1, { locale: "en" });
    expect(cal.monthNameNepali).toBe("बैशाख");
  });
});
