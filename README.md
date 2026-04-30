<div align="center">

# 🇳🇵 nepali-date-pro-max

### नेपाली डेट प्रो म्याक्स

**The all-in-one Bikram Sambat library for the Nepali developer community.**
BS ↔ AD conversion · full date+time · Devanagari I/O · calendar grids · fiscal year · 100+ date-fns-style helpers — in one tight TypeScript package with **zero dependencies**.

[![npm version](https://img.shields.io/npm/v/nepali-date-pro-max.svg?style=flat-square&color=cb3837)](https://www.npmjs.com/package/nepali-date-pro-max)
[![types](https://img.shields.io/npm/types/nepali-date-pro-max.svg?style=flat-square&color=3178c6)](https://www.npmjs.com/package/nepali-date-pro-max)
[![bundle size](https://img.shields.io/bundlephobia/minzip/nepali-date-pro-max?style=flat-square&color=success)](https://bundlephobia.com/package/nepali-date-pro-max)
[![license](https://img.shields.io/npm/l/nepali-date-pro-max.svg?style=flat-square&color=blue)](LICENSE)
[![tests](https://img.shields.io/badge/tests-120%20passing-brightgreen?style=flat-square)](#)

</div>

---

## 📑 Table of Contents

- [✨ Highlights](#-highlights)
- [📦 Install](#-install)
- [⚡ Quick Start](#-quick-start)
- [📊 Comparison](#-comparison)
- [🧠 Mental Model](#-mental-model)
- [🌐 Locale (Devanagari / Roman)](#-locale-devanagari--roman)
- [📅 Calendar Grid](#-calendar-grid--build-a-nepali-calendar) — *the hero use case*
- [🔁 AD ↔ BS Range Conversion](#-ad--bs-range-conversion)
- [⏱️ Distance & Relative Time](#️-distance--relative-time)
- [🏛️ Fiscal Year](#️-fiscal-year-आरथक-वरष)
- [🧰 Full API Reference](#-full-api-reference)
- [🎯 Recipes](#-recipes)
- [📐 Range & Accuracy](#-range--accuracy)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)

---

## ✨ Highlights

> **नमस्ते 👋** — whether you're building the next **Hamro Patro**, a **payroll** app, a सरकारी **fiscal-year report**, or just showing "आज को मिति" on your homepage — this library has you covered.

- 🎯 **125-year range** — BS 1975 → 2099 (≈ AD 1918 → 2043), the widest verified table on npm
- 📅 **Calendar grid builder** — drop-in data shape for any UI framework
- 🔁 **AD ↔ BS range conversion** — convert bounds or every day between
- 🏛️ **Fiscal year** helpers (आर्थिक वर्ष, Shrawan-Ashad)
- ⏱️ **Time-ago** in English & Nepali — pass `Date`, timestamp, ISO string, or `NepaliDate`
- 🇳🇵 **Devanagari I/O** — both input parsing AND output rendering
- 🧱 **Immutable** `NepaliDate` class — safe to share, no defensive copies
- 🪶 **100+ date-fns-style helpers** — `addDays`, `isWeekend`, `eachDayOfInterval`, `formatDistance`, …
- 🔒 **TypeScript-first** with full type definitions and JSDoc
- 📦 **Zero dependencies** · dual ESM + CJS · **MIT licensed**
- ✅ **120 unit tests** verifying round-trips across the full year range

---

## 📦 Install

```sh
npm  install nepali-date-pro-max
pnpm add     nepali-date-pro-max
yarn add     nepali-date-pro-max
bun  add     nepali-date-pro-max
```

Works in **Node.js 14+**, **Bun**, **Deno**, and modern browsers. Ships dual ESM + CJS — any module system works.

---

## ⚡ Quick Start

```ts
import {
  bsToAd, adToBs, NepaliDate,
  formatDistanceToNow,
  getCalendarMonth, getFiscalYear, formatFiscalYear,
} from "nepali-date-pro-max";

// 1. Convert
bsToAd(2081, 1, 1);                          // → { year: 2024, month: 4, day: 13 }
adToBs(2024, 4, 13);                         // → { year: 2081, month: 1, day: 1 }

// 2. The class — Day.js style, chainable, locale-aware
const d = NepaliDate.fromBs(2081, 1, 1);
d.format("DD MMMM, YYYY (dddd)");            // "01 Baishakh, 2081 (Saturday)"
d.locale("ne").format("DD MMMM YYYY");       // "०१ बैशाख २०८१"

// 3. Time-ago — locale-driven (set once globally, or pass per call)
NepaliDate.locale("ne");
formatDistanceToNow(post.createdAt);                       // "५ मिनेट अघि"
formatDistanceToNow(Date.now() - 5 * 60_000, { locale: "en" }); // "5 minutes ago"

// 4. UI-ready calendar grid — picks up the global locale automatically
const cal = getCalendarMonth(2081, 1);
//   → { weeks: [...], weekdayHeaders: ["आइतबार", ...], monthName: "बैशाख", ... }

// 5. Fiscal year
formatFiscalYear(getFiscalYear(NepaliDate.now()));    // "२०८३/८४" (under "ne")
```

---

## 📊 Comparison

| Feature | **`nepali-date-pro-max`** | [`nepali-date-converter`](https://www.npmjs.com/package/nepali-date-converter) | [`bikram-sambat`](https://www.npmjs.com/package/bikram-sambat) | [`nepali-datetime`](https://www.npmjs.com/package/nepali-datetime) | [`@sbmdkl/nepali-date-converter`](https://www.npmjs.com/package/@sbmdkl/nepali-date-converter) |
|---|:---:|:---:|:---:|:---:|:---:|
| Weekly downloads | new | ~9.6k | ~6.9k | ~700 | ~750 |
| BS year range | **1975–2099** | 1975–2099 | 1970–2090 | 2000–2099 | 1978–2099 |
| Time-of-day | ✅ | ❌ | ❌ | ✅ | ❌ |
| Immutable API | ✅ | ❌ | ✅ | ❌ | n/a |
| **Calendar grid builder** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **AD↔BS range conversion** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Fiscal year (Shrawan-Ashad)** | ✅ | ❌ | ❌ | ❌ | ❌ |
| date-fns-style utilities | ✅ 100+ | ❌ | ❌ | ❌ | partial |
| Time-ago accepts timestamp/`Date`/string | ✅ | ❌ | ❌ | ❌ | ❌ |
| TypeScript-first | ✅ | ✅ | ❌ | ✅ | ✅ |
| Dual ESM + CJS | ✅ | UMD only | CJS only | ✅ | ✅ |
| Devanagari output | ✅ | ✅ | ✅ | ✅ | ❌ |
| Devanagari **input** parsing | ✅ | ❌ | ❌ | ❌ | ❌ |
| `formatDistance` (en + नेपाली) | ✅ | ❌ | ❌ | ❌ | ❌ |
| License | **MIT** | MIT | Apache-2.0 | GPL-3.0 | MIT |
| Zero dependencies | ✅ | ✅ | ❌ | ✅ | ✅ |

---

## 🧠 Mental Model

A small list of rules that explain everything else:

| Rule | Detail |
|---|---|
| **1-indexed months** | `1 = Baishakh / January`, `12 = Chaitra / December`. Never JavaScript's 0-indexed style. |
| **Calendar values, not instants** | BS dates have no inherent timezone. The `NepaliDate` class additionally carries an optional time-of-day in **Asia/Kathmandu** (UTC+05:45) wall-clock. |
| **Immutable** | `NepaliDate` instances never change. Every "mutating" method (`addDays`, `setMonth`, …) returns a NEW instance. |
| **Range** | BS 1975 → 2099 inclusive. Out-of-range inputs throw `RangeError`. |
| **`Date` inputs use UTC fields** | `new Date("2024-04-13")` always means April 13. For local-time semantics, pass a `{ year, month, day }` object. |
| **Nepal-aware defaults** | Week starts Sunday (`weekStartsOn: 0`). Weekend = Saturday only (`[6]`). |

---

## 🌐 Locale (Devanagari / Roman)

Two locales ship built-in:

| Locale | Script | Digits | Example |
|---|---|---|---|
| `"en"` *(default)* | Roman | ASCII | `"15 Baishakh 2081 (Saturday)"` |
| `"ne"` | Devanagari | Devanagari | `"१५ बैशाख २०८१ (शनिबार)"` |

Set it once at app boot; everything else inherits — Day.js style:

```ts
import { NepaliDate, getCalendarMonth } from "nepali-date-pro-max";

NepaliDate.locale("ne");                          // global default

NepaliDate.now().format("DD MMMM YYYY (dddd)");   // "१५ बैशाख २०८१ (शनिबार)"
getCalendarMonth(2081, 1).weekdayHeaders[0];      // "आइतबार"
```

Override per-instance — chainable, returns a NEW immutable date:

```ts
const d = NepaliDate.fromBs(2081, 1, 15);

d.locale("ne").format("DD MMMM YYYY");      // "१५ बैशाख २०८१"
d.locale("en").format("DD MMMM YYYY");      // "15 Baishakh 2081"

// Locale flows through chained ops
d.locale("ne").addDays(7).format("dddd");   // "शनिबार"
```

Override per-call when you don't need to switch globally:

```ts
formatBs({ year: 2081, month: 1, day: 1 }, "DD MMMM YYYY", { locale: "ne" });
getCalendarMonth(2081, 1, { locale: "ne" });
```

For bilingual UIs that need both forms in the same view, the calendar grid (`getCalendarMonth`) populates each cell with both `weekdayName`/`monthName` (locale-driven) **and** locale-independent `weekdayNameNepali` / `monthNameNepali` / `bsDayNepali` fields — see the [calendar section](#-calendar-grid--build-a-nepali-calendar) below.

### Custom locales (e.g. romanised Nepali)

```ts
import { registerLocale } from "nepali-date-pro-max";

registerLocale({
  name: "ne-rom",
  months: ["Baishak", "Jeth", "Asar", "Saun", "Bhadau", "Asoj",
           "Kartik", "Mangsir", "Push", "Magh", "Falgun", "Chait"],
  monthsShort: ["Bai", "Jet", "Asa", "Sau", "Bha", "Aso",
                "Kar", "Man", "Pus", "Mag", "Fal", "Cha"],
  weekdays: ["Aaitabar", "Sombar", "Mangalbar", "Budhabar",
             "Bihibar", "Sukrabar", "Sanibar"],
  weekdaysShort: ["Aai", "Som", "Man", "Bud", "Bih", "Suk", "San"],
  weekdaysMin: ["Aa", "So", "Ma", "Bu", "Bi", "Su", "Sa"],
  digits: (n) => String(n),
});

NepaliDate.now().locale("ne-rom").format("DD MMMM YYYY (dddd)");
// → "15 Baishak 2081 (Sanibar)"
```

### Locale API

| Function | Purpose |
|---|---|
| `NepaliDate.locale()` | Get the current global locale name |
| `NepaliDate.locale(name)` | Set the global locale (returns the new name) |
| `d.locale()` | Resolved locale on this instance (instance → global → `"en"`) |
| `d.locale(name)` | NEW instance with the given locale |
| `registerLocale(locale)` | Add a custom locale to the registry |
| `getLocale(name)` / `hasLocale(name)` / `listLocales()` | Inspect the registry |
| `getGlobalLocale()` / `setGlobalLocale(name)` | Functional equivalents of `NepaliDate.locale()` |

> `format()`, the calendar functions, the distance/relative formatters, and `formatFiscalYear` all accept a one-off `{ locale: "ne" }` (or a `Locale` object) which always wins over the instance/global default.

---

## 📅 Calendar Grid — Build a Nepali Calendar

`getCalendarMonth()` returns a **fully-prepared 7-column grid** where every cell already knows its BS day, AD day, weekday, "is today", "is Saturday/weekend", and "is in current month". Drop it straight into your template — **no further computation needed**.

### React example — Hamro Patro–style month view

```tsx
import { getCalendarMonth } from "nepali-date-pro-max";

export function NepaliCalendar({ year, month }: { year: number; month: number }) {
  const cal = getCalendarMonth(year, month, { locale: "ne" });

  return (
    <div className="nepali-calendar">
      <h2>{cal.monthNameNepali} {cal.yearNepali}</h2>

      <div className="grid grid-cols-7 text-center">
        {cal.weekdayHeadersShort.map(h => (
          <div key={h} className="font-bold text-sm py-2">{h}</div>
        ))}

        {cal.weeks.flatMap(w => w.days).map(c => (
          <div
            key={`${c.bs.year}-${c.bs.month}-${c.bs.day}`}
            className={[
              "p-2 border",
              !c.isCurrentMonth && "text-gray-300",
              c.isToday && "bg-red-500 text-white rounded-full",
              c.isSaturday && c.isCurrentMonth && "text-red-600",
            ].filter(Boolean).join(" ")}
          >
            <div className="text-lg">{c.bsDayNepali}</div>
            <div className="text-xs opacity-60">{c.adDay}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Cell shape

```ts
{
  bs: { year: 2081, month: 1, day: 1 },
  ad: { year: 2024, month: 4, day: 13 },
  weekday: 6,                         // 0=Sun..6=Sat
  weekdayName: "Saturday",
  weekdayNameNepali: "शनिबार",
  bsDay: 1, bsDayNepali: "१", adDay: 13,
  isCurrentMonth: true,               // false = adjacent-month padding
  isToday: false,
  isSaturday: true, isSunday: false, isWeekend: true,
  date: NepaliDate { … }              // for click-handlers etc.
}
```

### Options

```ts
getCalendarMonth(year, month, {
  weekStartsOn: 0,         // 0=Sunday (default — Nepal standard), 1=Monday, …
  padding: true,           // include leading/trailing adjacent-month cells
  today: NepaliDate.now(), // override "today" (for tests)
  weekendDays: [6],        // [6]=Sat only (default), [0,6]=Sun+Sat
  locale: "ne",            // override locale for this call (defaults to NepaliDate.locale())
});
```

### Other calendar helpers

```ts
import { getCalendarYear, getCalendarDay, flattenCalendarMonth } from "nepali-date-pro-max";

getCalendarYear(2081);            // → 12 CalendarMonth objects (Baishakh..Chaitra)
getCalendarDay(NepaliDate.now()); // → single CalendarDayCell
flattenCalendarMonth(cal);        // → flat CalendarDayCell[] (no week grouping)
```

---

## 🔁 AD ↔ BS Range Conversion

Forms, reports, analytics — anywhere you have a date range in one calendar and need it in the other.

```ts
import {
  convertAdRangeToBs, convertBsRangeToAd,
  eachBsDayInAdRange, eachAdDayInBsRange, eachBsMonthInAdRange,
} from "nepali-date-pro-max";

// Just the bounds — fast, returns one pair
convertAdRangeToBs(
  { year: 2024, month: 1, day: 1 },
  { year: 2024, month: 12, day: 31 },
  { format: "DD MMMM YYYY" },
);
// → { start: "16 Poush 2080", end: "16 Poush 2081" }

// Devanagari, every day enumerated
eachBsDayInAdRange(
  new Date("2024-04-13"),
  new Date("2024-04-15"),
  { format: "YYYY-MM-DD", locale: "ne" },
);
// → ["२०८१-०१-०१", "२०८१-०१-०२", "२०८१-०१-०३"]

// Inverse: BS → AD
convertBsRangeToAd(
  { year: 2081, month: 1, day: 1 },
  { year: 2082, month: 1, day: 1 },
  { format: "MMM D, YYYY" },
);
// → { start: "Apr 13, 2024", end: "Apr 14, 2025" }
```

**Type-safe overloads:** when `format` is omitted, you get raw `BsDate[]` / `AdDate[]`; when provided, `string[]`.

---

## ⏱️ Distance & Relative Time

Three locale-driven functions. Pick by intent (`formatDistance` is a pure gap; `formatDistanceToNow` always carries an "ago"/"in" suffix; `formatRelative` is the smart phrasing). Every input accepts `NepaliDate | Date | number | string`. Locale defaults to `NepaliDate.locale()`; pass `{ locale: "ne" }` to override per call.

| Function | Suffix | en example | ne example |
|---|---|---|---|
| `formatDistance(a, b)`            | no    | `"5 days"`           | `"५ दिन"` |
| `formatDistanceToNow(x)`          | yes   | `"5 minutes ago"` / `"in 3 days"` | `"५ मिनेट अघि"` / `"३ दिन पछि"` |
| `formatRelative(x, base?)`        | smart | `"yesterday"` / `"in 3 days"`     | `"हिजो"` / `"३ दिनमा"` |

> **Suffix rule:** `formatDistance` is a *pure duration* — it's just the gap between two moments and never adds "ago"/"in". `formatDistanceToNow` always adds the suffix because the comparison is implicitly *to now*.

```ts
import {
  formatDistance, formatDistanceToNow, formatRelative, NepaliDate,
} from "nepali-date-pro-max";

// Time-ago vs. now — pass a timestamp, Date, ISO string, or NepaliDate
formatDistanceToNow(post.createdAt);                 // "5 minutes ago"
formatDistanceToNow(new Date("2024-04-13"));         // "2 years ago"
formatDistanceToNow(Date.now() + 86_400_000);        // "in 1 day"

// Devanagari output — set globally once, or per call
NepaliDate.locale("ne");
formatDistanceToNow(Date.now() - 5 * 60_000);                       // "५ मिनेट अघि"
formatDistanceToNow(Date.now() + 86_400_000, { locale: "en" });     // override → "in 1 day"

// Pure duration between two arbitrary moments — never has a suffix
formatDistance("2024-04-13", "2024-04-20");                         // "7 days"
formatDistance("2024-04-13", "2024-04-20", { locale: "ne" });       // "७ दिन"

// Smart relative phrasing
formatRelative(Date.now() - 86_400_000);                            // "yesterday"
formatRelative(Date.now() + 3 * 86_400_000);                        // "in 3 days"
formatRelative(Date.now() - 86_400_000, undefined, { locale: "ne" });        // "हिजो"
formatRelative(Date.now() + 3 * 86_400_000, undefined, { locale: "ne" });    // "३ दिनमा"
```

> **Strings are interpreted as Gregorian ISO** (matching `Date` behavior). For BS-format strings (e.g. `"2081-01-15"`), pre-parse with `NepaliDate.parse()` and pass the instance.

---

## 🏛️ Fiscal Year (आर्थिक वर्ष)

Nepal's fiscal year runs **Shrawan 1 → Ashad-end** of the next year. FY 2081/82 starts on Shrawan 1, 2081 (≈ mid-July 2024 AD).

```ts
import {
  getFiscalYear, startOfFiscalYear, endOfFiscalYear,
  formatFiscalYear, getFiscalQuarter,
} from "nepali-date-pro-max";

getFiscalYear(NepaliDate.fromBs(2081, 5, 1));    // 2081
getFiscalYear(NepaliDate.fromBs(2081, 3, 30));   // 2080 (still in FY 2080/81)
startOfFiscalYear(2081);                         // Shrawan 1, 2081
endOfFiscalYear(2081);                           // Ashad-end, 2082
formatFiscalYear(2081);                          // "2081/82"
formatFiscalYear(2081, { locale: "ne" });        // "२०८१/८२"
getFiscalQuarter(NepaliDate.fromBs(2081, 7, 1)); // 2 (Kartik-Poush)
```

---

## 🧰 Full API Reference

> Every public symbol is listed below in tables — `Ctrl+F` will hit any name. Detailed JSDoc is included in the TypeScript definitions.

<details open>
<summary><strong>🔄 Conversion</strong></summary>

| Symbol | Description |
|---|---|
| `bsToAd(year, month, day)` | BS → AD calendar |
| `adToBs(year, month, day)` | AD → BS calendar |
| `fromJsDate(date)` | JS `Date` → BS (shifted to NPT, UTC+05:45) |
| `bsWeekday(year, month, day)` | weekday: `0=Sun..6=Sat` |
| `bsDayOfYear(year, month, day)` | day-of-year: `1..(365 \| 366)` |
| `bsFromDayOfYear(year, dayOfYear)` | inverse of `bsDayOfYear` |
| `toNepaliDate(input)` | coerce `NepaliDate \| Date \| number \| string` → `NepaliDate` |

</details>

<details open>
<summary><strong>📆 Calendar Metadata</strong></summary>

| Symbol | Description |
|---|---|
| `FIRST_BS_YEAR` | `1975` |
| `LAST_BS_YEAR` | `2099` |
| `BS_YEAR_DATA` | raw `[m1..m12, total]` table per year |
| `ANCHOR_AD_YEAR` | `1918` (AD anchor for BS 1975-01-01) |
| `ANCHOR_AD_MONTH` | `4` (April) |
| `ANCHOR_AD_DAY` | `13` |
| `daysInBsMonth(year, month)` | days in a BS month (29..32) |
| `daysInBsYear(year)` | 365 or 366 |
| `isBsLeapYear(year)` | `true` if year has 366 days |

</details>

<details open>
<summary><strong>🔤 Names & Devanagari Digits</strong></summary>

| Symbol | Value / Description |
|---|---|
| `BS_MONTH_NAMES` | `["Baishakh", "Jestha", … , "Chaitra"]` |
| `BS_MONTH_NAMES_SHORT` | `["Bai", "Jes", … , "Cha"]` |
| `BS_MONTH_NAMES_NP` | `["बैशाख", "जेठ", … , "चैत"]` |
| `AD_MONTH_NAMES` | `["January", … , "December"]` |
| `AD_MONTH_NAMES_SHORT` | `["Jan", … , "Dec"]` |
| `WEEKDAY_NAMES` | `["Sunday", … , "Saturday"]` |
| `WEEKDAY_NAMES_SHORT` | `["Sun", … , "Sat"]` |
| `WEEKDAY_NAMES_MIN` | `["Su", … , "Sa"]` |
| `WEEKDAY_NAMES_NP` | `["आइतबार", … , "शनिबार"]` |
| `WEEKDAY_NAMES_NP_SHORT` | `["आइत", … , "शनि"]` |
| `DEVANAGARI_DIGITS` | `["०", "१", … , "९"]` |
| `toDevanagariDigits(input)` | ASCII → Devanagari (`2081` → `"२०८१"`) |
| `toAsciiDigits(input)` | Devanagari → ASCII (`"२०८१"` → `"2081"`) |

</details>

<details open>
<summary><strong>📝 Parsing & Formatting</strong></summary>

| Function | Description |
|---|---|
| `parseBs(string)` | Parse `YYYY-MM-DD` (also `/`, `.`; ASCII or Devanagari digits) → `BsDate` |
| `formatBs(date, pattern)` | Format with token pattern in the global locale |
| `formatBs(date, pattern, { locale: "ne" })` | Format in a specific locale (Devanagari for `"ne"`) |

**Format tokens** (case-sensitive):

| Token | Output | Token | Output |
|---|---|---|---|
| `YYYY` / `YY` | year | `dddd` / `ddd` / `dd` | weekday |
| `MMMM` / `MMM` / `MM` / `M` | month | `HH` / `H` | 24-hour |
| `DD` / `D` | day-of-month | `hh` / `h` | 12-hour |
| `mm` / `m` | minute | `ss` / `s` | second |
| `A` / `a` | AM/PM | `[…]` | literal escape |

</details>

<details open>
<summary><strong>🧱 <code>NepaliDate</code> Class (immutable)</strong></summary>

**Static factories**

| Method | Description |
|---|---|
| `NepaliDate.now()` | Current Nepal moment (UTC+05:45) |
| `NepaliDate.fromBs(y, m, d, h?, min?, s?, ms?)` | From BS year/month/day (+optional time) |
| `NepaliDate.fromAd(y, m, d, h?, min?, s?, ms?)` | From AD year/month/day (+optional time) |
| `NepaliDate.fromJsDate(date)` | From a JS `Date` (instant → BS calendar fields) |
| `NepaliDate.parse(string)` | Parse a BS string |

**Accessors**

| Method | Returns |
|---|---|
| `.getYear()` | BS year |
| `.getMonth()` | BS month, **1-indexed** (1=Baishakh) |
| `.getDate()` | BS day-of-month |
| `.getDay()` | weekday, `0=Sun..6=Sat` |
| `.getDayOfYear()` | `1..(365 \| 366)` |
| `.getHours()` / `.getMinutes()` / `.getSeconds()` / `.getMilliseconds()` | time-of-day fields |
| `.getMonthName()` | month name in active locale (`"Baishakh"` / `"बैशाख"`) |
| `.getDayName()` | weekday name in active locale (`"Saturday"` / `"शनिबार"`) |
| `.daysInMonth()` | days in this BS month |
| `.daysInYear()` | 365 or 366 |
| `.locale()` / `.locale(name)` | get/set locale (chainable) — see [Locale](#-locale-devanagari--roman) |

**Predicates**

| Method | Returns |
|---|---|
| `.isWeekend(weekendDays?)` | `true` if in weekend set (default `[6]` = Saturday) |
| `.isLeapYear()` | year has 366 days |
| `.isFirstDayOfMonth()` | day-of-month is 1 |
| `.isLastDayOfMonth()` | day-of-month is the month's last |
| `.isBefore(other)` / `.isAfter(other)` | ordering |
| `.isSameDay(other)` | same calendar day (ignores time) |

**Conversion**

| Method | Returns |
|---|---|
| `.toBs()` | `{ year, month, day }` |
| `.toAd()` | `{ year, month, day }` (Gregorian) |
| `.toJsDate()` | native JS `Date` |
| `.toString()` | `"YYYY-MM-DD"` |
| `.toJSON()` | `{ bs, ad, iso }` |
| `.getDetails()` | full breakdown — useful for UI/AI |

**Formatting**

| Method | Returns |
|---|---|
| `.format(pattern, options?)` | token-based string in the active locale |
| `.format(pattern, { locale: "ne" })` | one-off Devanagari output |

**Arithmetic** *(every method returns a NEW instance)*

| Method | Returns |
|---|---|
| `.addDays(n)` / `.addMonths(n)` / `.addYears(n)` | shifted instance (`addMonths` clamps day) |
| `.addHours(n)` / `.addMinutes(n)` / `.addSeconds(n)` / `.addMilliseconds(n)` | time-shifted instance |
| `.startOfDay()` / `.endOfDay()` | day boundaries |
| `.startOfMonth()` / `.endOfMonth()` | month boundaries |
| `.startOfYear()` / `.endOfYear()` | year boundaries |

**Diff**

| Method | Returns |
|---|---|
| `.diffDays(other)` | signed integer days (`this − other`) |

</details>

<details open>
<summary><strong>➕ Arithmetic Helpers (functional, immutable)</strong></summary>

| Add | Subtract | Description |
|---|---|---|
| `addDays(d, n)` | `subDays(d, n)` | shift by days |
| `addMonths(d, n)` | `subMonths(d, n)` | shift by BS months (clamps day) |
| `addYears(d, n)` | `subYears(d, n)` | shift by BS years |
| `addHours(d, n)` | `subHours(d, n)` | shift by hours |
| `addMinutes(d, n)` | `subMinutes(d, n)` | shift by minutes |
| `addSeconds(d, n)` | `subSeconds(d, n)` | shift by seconds |
| `addMilliseconds(d, n)` | `subMilliseconds(d, n)` | shift by milliseconds |

</details>

<details open>
<summary><strong>✏️ Setters (immutable)</strong></summary>

| Function | Description |
|---|---|
| `setYear(d, year)` | replace BS year (clamps day-of-month) |
| `setMonth(d, month)` | replace BS month (clamps day-of-month) |
| `setDate(d, day)` | replace day-of-month |
| `setDay(d, weekday, options?)` | move to a weekday within current week |
| `setDayOfYear(d, doy)` | jump to a day-of-year |
| `setHours(d, h)` | replace hour (0..23) |
| `setMinutes(d, m)` | replace minute (0..59) |
| `setSeconds(d, s)` | replace second (0..59) |
| `setMilliseconds(d, ms)` | replace millisecond (0..999) |

</details>

<details open>
<summary><strong>🔍 Comparisons / <code>is*</code> Predicates</strong></summary>

| Function | Returns `true` when… |
|---|---|
| `isBefore(a, b)` | `a` precedes `b` |
| `isAfter(a, b)` | `a` follows `b` |
| `isEqual(a, b)` | exactly the same instant |
| `isSameDay(a, b)` | same BS calendar day |
| `isSameMonth(a, b)` | same BS year + month |
| `isSameYear(a, b)` | same BS year |
| `isSameWeek(a, b, options?)` | same week (`weekStartsOn` default Sunday) |
| `isToday(d)` | today (Nepal time) |
| `isYesterday(d)` | yesterday |
| `isTomorrow(d)` | tomorrow |
| `isThisMonth(d)` | current BS month |
| `isThisYear(d)` | current BS year |
| `isThisWeek(d, options?)` | current week |
| `isSunday(d)` | weekday is Sunday |
| `isMonday(d)` | weekday is Monday |
| `isTuesday(d)` | weekday is Tuesday |
| `isWednesday(d)` | weekday is Wednesday |
| `isThursday(d)` | weekday is Thursday |
| `isFriday(d)` | weekday is Friday |
| `isSaturday(d)` | weekday is Saturday (Nepal's weekly holiday) |
| `isWeekend(d, options?)` | in weekend set (default `[6]`, Saturday only) |
| `isFirstDayOfMonth(d)` | day-of-month is 1 |
| `isLastDayOfMonth(d)` | day-of-month is month's last |
| `isLeapYear(d)` | year has 366 days |
| `isWithinInterval(d, interval)` | within `[start, end]` inclusive |
| `areIntervalsOverlapping(a, b)` | intervals share at least one day |
| `isValid(value)` | value is a `NepaliDate` instance |

</details>

<details open>
<summary><strong>📍 Bounds (start/end of …)</strong></summary>

| Start | End | Description |
|---|---|---|
| `startOfDay(d)` | `endOfDay(d)` | 00:00:00.000 / 23:59:59.999 |
| `startOfWeek(d, options?)` | `endOfWeek(d, options?)` | week boundaries (default Sunday-start) |
| `startOfMonth(d)` | `endOfMonth(d)` | first / last day of BS month |
| `startOfYear(d)` | `endOfYear(d)` | Baishakh 1 / Chaitra-end |

</details>

<details open>
<summary><strong>📏 Differences</strong></summary>

| Function | Returns |
|---|---|
| `differenceInMilliseconds(a, b)` | signed ms |
| `differenceInSeconds(a, b)` | signed whole seconds |
| `differenceInMinutes(a, b)` | signed whole minutes |
| `differenceInHours(a, b)` | signed whole hours |
| `differenceInDays(a, b)` | signed whole days |
| `differenceInWeeks(a, b)` | signed whole weeks |
| `differenceInMonths(a, b)` | calendar-aware whole months (matches date-fns) |
| `differenceInYears(a, b)` | calendar-aware whole years |
| `differenceInCalendarDays(a, b)` | day-boundary count (ignores time) |
| `differenceInCalendarMonths(a, b)` | month-boundary count |
| `differenceInCalendarYears(a, b)` | year-boundary count |

</details>

<details open>
<summary><strong>🔁 Interval Enumerators</strong></summary>

| Function | Returns |
|---|---|
| `eachDayOfInterval(interval)` | every day in `[start, end]` inclusive |
| `eachWeekOfInterval(interval, options?)` | every week-start in interval |
| `eachMonthOfInterval(interval)` | first day of each BS month |
| `eachYearOfInterval(interval)` | Baishakh 1 of each BS year |
| `eachWeekendOfInterval(interval, weekday = 6)` | every Nth weekday (default Saturday) |

</details>

<details open>
<summary><strong>⏱️ Distance / Relative (locale-driven)</strong></summary>

| Function | Suffix | en | ne |
|---|---|---|---|
| `formatDistance(a, b, options?)` | ❌ | `"5 days"` | `"५ दिन"` |
| `formatDistanceToNow(input, options?)` | ✅ | `"5 minutes ago"` | `"५ मिनेट अघि"` |
| `formatRelative(input, base?, options?)` | smart | `"yesterday"` / `"in 3 days"` | `"हिजो"` / `"३ दिनमा"` |

`options.locale` defaults to `NepaliDate.locale()`. All inputs accept `NepaliDate \| Date \| number \| string`.

**Related types:** `DateInput` · `DistanceOptions`

</details>

<details open>
<summary><strong>🌐 Locale</strong></summary>

| Function | Description |
|---|---|
| `NepaliDate.locale()` / `NepaliDate.locale(name)` | Get/set the global default locale |
| `d.locale()` / `d.locale(name)` | Get this instance's resolved locale, or return a new instance with `name` |
| `registerLocale(locale)` | Add a custom locale to the registry |
| `getLocale(name)` / `hasLocale(name)` / `listLocales()` | Inspect the registry |
| `getGlobalLocale()` / `setGlobalLocale(name)` | Functional equivalents of `NepaliDate.locale()` |

Built-in locales: `"en"` (Roman, ASCII digits) and `"ne"` (Devanagari).

**Related types:** `Locale` · `LocaleRelativeTime`

</details>

<details open>
<summary><strong>📊 Min / Max / Clamp / Closest</strong></summary>

| Function | Returns |
|---|---|
| `min(dates)` | earliest of array, or `undefined` if empty |
| `max(dates)` | latest of array, or `undefined` if empty |
| `clamp(d, { start, end })` | `start` if before, `end` if after, else `d` |
| `closestTo(target, candidates)` | candidate nearest to target by day-distance |
| `closestIndexTo(target, candidates)` | index of nearest candidate |

</details>

<details open>
<summary><strong>🔁 Cross-Calendar Range Conversion</strong></summary>

| Function | Description |
|---|---|
| `convertAdRangeToBs(start, end, options?)` | bounds-only AD → BS |
| `convertBsRangeToAd(start, end, options?)` | bounds-only BS → AD |
| `eachBsDayInAdRange(start, end, options?)` | every BS day across an AD range |
| `eachBsMonthInAdRange(start, end, options?)` | every BS month-start touched by AD range |
| `eachAdDayInBsRange(start, end, options?)` | every AD day across a BS range |

When `options.format` is provided → returns `string[]`. When omitted → returns raw `BsDate[]` / `AdDate[]`.

**Related types:** `AdInput` · `RangeConvertOptions` · `AdRangeFormatOptions`

</details>

<details open>
<summary><strong>📅 Calendar Grid (UI-ready)</strong></summary>

| Function | Returns |
|---|---|
| `getCalendarMonth(year, month, options?)` | `CalendarMonth` — weeks × 7 cells with all flags pre-computed |
| `getCalendarYear(year, options?)` | `CalendarMonth[]` — 12 entries (Baishakh..Chaitra) |
| `getCalendarDay(date, options?)` | `CalendarDayCell` — single-day view |
| `flattenCalendarMonth(month)` | `CalendarDayCell[]` — drop the week grouping |

**Related types:** `CalendarMonth` · `CalendarWeek` · `CalendarDayCell` · `CalendarMonthOptions`

</details>

<details open>
<summary><strong>🏛️ Fiscal Year (आर्थिक वर्ष)</strong></summary>

| Symbol | Description |
|---|---|
| `getFiscalYear(date)` | the FY a date belongs to (Shrawan-start) |
| `startOfFiscalYear(fy)` | Shrawan 1 of FY |
| `endOfFiscalYear(fy)` | Ashad-end of next BS year |
| `formatFiscalYear(fy, options?)` | `"2081/82"` or `"२०८१/८२"` |
| `getFiscalQuarter(date)` | 1..4 within the fiscal year |
| `FISCAL_YEAR_START_MONTH` | `4` (Shrawan) |

</details>

<details open>
<summary><strong>📐 TypeScript Types</strong></summary>

| Type | Shape |
|---|---|
| `BsDate` | `{ year, month, day }` (BS) |
| `AdDate` | `{ year, month, day }` (Gregorian) |
| `BsDateTime` | `BsDate` + optional `hour`, `minute`, `second`, `millisecond` |
| `NepaliDateDetails` | full breakdown returned by `getDetails()` |
| `NepaliInterval` | `{ start: NepaliDate, end: NepaliDate }` |
| `FormatOptions` | `{ nepali?: boolean }` |
| `DateInput` | `NepaliDate \| Date \| number \| string` |
| `AdInput` | `AdDate \| Date` |
| `RangeConvertOptions` | `{ format?: string, nepali?: boolean }` |
| `AdRangeFormatOptions` | `{ format?: string }` |
| `CalendarMonth` | full month grid (see Calendar Grid section) |
| `CalendarWeek` | `{ weekNumber, days: CalendarDayCell[] }` |
| `CalendarDayCell` | one cell with `bs`, `ad`, weekday, flags, etc. |
| `CalendarMonthOptions` | `{ weekStartsOn?, padding?, today?, weekendDays?, locale? }` |

</details>

---

## 🎯 Recipes

### "आज को मिति" header

```tsx
import { NepaliDate } from "nepali-date-pro-max";

export function TodayHeader() {
  const d = NepaliDate.now();
  return (
    <div>
      <div>{d.locale("ne").format("dddd, DD MMMM YYYY")}</div>
      <div className="text-xs">{d.locale("en").format("dddd, DD MMMM YYYY")}</div>
    </div>
  );
}
// → शनिबार, १७ बैशाख २०८३
//   Saturday, 17 Baishakh 2083
```

### Birthday → age in years

```ts
import { NepaliDate, differenceInYears } from "nepali-date-pro-max";
const dob = NepaliDate.fromAd(1990, 6, 15);
differenceInYears(NepaliDate.now(), dob);   // e.g. 35
```

### Fiscal-year report header

```ts
import { NepaliDate, getFiscalYear, formatFiscalYear } from "nepali-date-pro-max";
const fy = getFiscalYear(NepaliDate.now());
const label = formatFiscalYear(fy, { locale: "ne" });
// → "आर्थिक वर्ष २०८३/८४"
```

### Form: AD date-range → BS strings for the API

```ts
import { convertAdRangeToBs } from "nepali-date-pro-max";

function onSubmit({ startAd, endAd }: { startAd: Date; endAd: Date }) {
  const bs = convertAdRangeToBs(startAd, endAd, { format: "YYYY-MM-DD" });
  api.post("/reports", { startBs: bs.start, endBs: bs.end });
}
```

### All Saturdays this month (बिदा / weekly holidays)

```ts
import { NepaliDate, eachWeekendOfInterval } from "nepali-date-pro-max";
const m = NepaliDate.now();
const saturdays = eachWeekendOfInterval(
  { start: m.startOfMonth(), end: m.endOfMonth() },
  6,
);
```

### "५ मिनेट अघि" — relative time from any timestamp

```ts
import { formatDistanceToNow } from "nepali-date-pro-max";

formatDistanceToNow(post.createdAt);                       // "5 minutes ago"
formatDistanceToNow(post.createdAt, { locale: "ne" });     // "५ मिनेट अघि"
```

---

## 📐 Range & Accuracy

This package supports **BS 1975 → 2099** — a span of **125 years**, corresponding to roughly AD 1918-04-13 → 2043-04-13.

The Bikram Sambat calendar is **not algorithmic**. Month lengths are determined astronomically and ratified each year by the **Nepali calendar committee** (पंचाङ्ग निर्णायक समिति), so every BS↔AD library — ours included — relies on a hand-curated lookup table.

The table shipped here covers the full 125-year range and is verified by **120 unit tests** including:
- Round-trip BS→AD→BS on every year boundary across the entire range
- Day-by-day monotonic verification on sample years
- Well-known reference dates (Nepal New Year, Republic Day, Constitution Day, etc.)
- Weekday correctness against native `Date.getUTCDay()`

**Spot a wrong date?** Open an issue with the BS↔AD pair — calendar-data fixes ship as patch releases.

---

## 🤝 Contributing

Bugs, suggestions, calendar-data corrections, and new helpers are very welcome.

- 🐛 [Open an issue](https://github.com/l3lackcurtains/nepali-date-pro-max/issues)
- 🔧 [Send a PR](https://github.com/l3lackcurtains/nepali-date-pro-max/pulls)
- 💬 If your team uses this in production, we'd love to hear about it!

---

## 📜 License

[**MIT**](LICENSE) © l3lackcurtains

---

<div align="center">

### Made with ❤️ for the Nepali developer community

*नेपाली डेभलपर समुदायका लागि माया साथ बनाइएको*

**धन्यवाद! 🙏**

</div>
