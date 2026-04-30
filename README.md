# nepali-date-pro-max

### नेपाली डेट प्रो म्याक्स — for the Nepali developer community 🇳🇵

> The all-in-one Bikram Sambat library every Nepali project needs.
> BS ↔ AD conversion, full date+time, Devanagari I/O, calendar grids, fiscal year, AD↔BS range conversion, and 100+ date-fns-style helpers — all in one tight TypeScript package with **zero dependencies**.

[![npm](https://img.shields.io/npm/v/nepali-date-pro-max.svg)](https://www.npmjs.com/package/nepali-date-pro-max)
[![types](https://img.shields.io/npm/types/nepali-date-pro-max.svg)](https://www.npmjs.com/package/nepali-date-pro-max)
[![license](https://img.shields.io/npm/l/nepali-date-pro-max.svg)](LICENSE)

---

## नमस्ते 👋

Whether you're building the next **Hamro Patro**, a **payroll** app for a Nepali employer, a **fiscal-year report** for a सरकारी office, or just trying to show "आज को मिति" on a website — this library is built for you.

We took the best of every Nepali date package on npm, fixed what was missing, and shipped it MIT-licensed so it's ready for both your weekend hobby project and your enterprise dashboard.

---

## ✨ Why `nepali-date-pro-max`?

| Feature | **`nepali-date-pro-max`** | [`nepali-date-converter`](https://www.npmjs.com/package/nepali-date-converter) | [`bikram-sambat`](https://www.npmjs.com/package/bikram-sambat) | [`nepali-datetime`](https://www.npmjs.com/package/nepali-datetime) | [`@sbmdkl/nepali-date-converter`](https://www.npmjs.com/package/@sbmdkl/nepali-date-converter) |
|---|---|---|---|---|---|
| Weekly downloads | new | ~9.6k | ~6.9k | ~700 | ~750 |
| BS year range | **1975–2099** | 1975–2099 | 1970–2090 | 2000–2099 | 1978–2099 |
| Time-of-day support | ✅ | ❌ | ❌ | ✅ | ❌ |
| Immutable API | ✅ | ❌ | ✅ | ❌ | n/a |
| **Calendar grid builder** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **AD↔BS range conversion** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Fiscal year (Shrawan-Ashad)** | ✅ | ❌ | ❌ | ❌ | ❌ |
| date-fns-style utilities | ✅ (100+) | ❌ | ❌ | ❌ | partial |
| TypeScript-first | ✅ | ✅ | ❌ | ✅ | ✅ |
| Dual ESM + CJS | ✅ | UMD only | CJS only | ✅ | ✅ |
| Devanagari output | ✅ | ✅ | ✅ | ✅ | ❌ |
| Devanagari **input** parsing | ✅ | ❌ | ❌ | ❌ | ❌ |
| `formatDistance` (en + नेपाली) | ✅ | ❌ | ❌ | ❌ | ❌ |
| License | **MIT** | MIT | Apache-2.0 | GPL-3.0 | MIT |
| Zero dependencies | ✅ | ✅ | ❌ | ✅ | ✅ |

---

## 📦 Install

```sh
# npm
npm install nepali-date-pro-max

# pnpm
pnpm add nepali-date-pro-max

# yarn
yarn add nepali-date-pro-max

# bun
bun add nepali-date-pro-max
```

Works with Node.js 14+, Deno, and Bun out of the box. Ships dual ESM + CJS, so any module system works.

### Bun example

```ts
// hello.ts
import { NepaliDate, getCalendarMonth } from "nepali-date-pro-max";

const today = NepaliDate.now();
console.log(today.formatNepali("dddd, DD MMMM YYYY"));

const cal = getCalendarMonth(today.getYear(), today.getMonth(), { locale: "ne" });
console.log(`${cal.monthNameNepali} ${cal.yearNepali} — ${cal.daysInMonth} दिन`);
```

```sh
bun run hello.ts
```

No transpiler config needed — Bun loads the package's ESM entry directly.

---

## 🚀 60-second tour

```ts
import {
  bsToAd, adToBs,
  NepaliDate,
  addDays, differenceInDays, isWeekend,
  formatDistance,
  convertAdRangeToBs,
  getCalendarMonth,
  getFiscalYear, formatFiscalYear,
} from "nepali-date-pro-max";

// Conversion
bsToAd(2081, 1, 1);                          // → { year: 2024, month: 4, day: 13 }
adToBs(2024, 4, 13);                         // → { year: 2081, month: 1, day: 1 }

// Class
const d = NepaliDate.fromBs(2081, 1, 1);
d.format("DD MMMM, YYYY (dddd)");            // "01 Baishakh, 2081 (Saturday)"
d.formatNepali("DD MMMM YYYY");              // "०१ बैशाख २०८१"

// Utilities
addDays(d, 30).toString();                   // "2081-01-31"
differenceInDays(addDays(d, 30), d);         // 30
isWeekend(d);                                // true (Saturday)
formatDistance(d, addDays(d, 90));           // "3 months"

// Calendar grid (UI-ready)
const cal = getCalendarMonth(2081, 1);
cal.weeks[0].days.forEach(c => console.log(c.bsDayNepali, c.weekdayNameNepali));

// Fiscal year
formatFiscalYear(getFiscalYear(NepaliDate.now())); // e.g. "2083/84"
```

---

## 📅 Building a Nepali calendar (the hero use case)

This is what most Nepali apps need first. `getCalendarMonth()` returns a fully-prepared grid — every cell already knows its BS day, AD day, weekday, "is today", "is Saturday/weekend", and "is in current month". Drop it straight into your template — no further computation required.

### React example — a Hamro Patro–style month view

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

### What you get back

```ts
{
  year: 2081,
  yearNepali: "२०८१",
  month: 1,
  monthName: "Baishakh",
  monthNameNepali: "बैशाख",
  daysInMonth: 31,
  firstDay: NepaliDate { … },
  lastDay: NepaliDate { … },

  weekdayHeaders: ["Sunday", "Monday", … , "Saturday"],
  weekdayHeadersShort: ["Sun", "Mon", …, "Sat"],
  weekdayHeadersMin: ["Su", "Mo", …, "Sa"],

  weeks: [
    {
      weekNumber: 1,
      days: [
        {
          bs: { year: 2080, month: 12, day: 26 },  // adjacent-month padding
          ad: { year: 2024, month: 4, day: 7 },
          weekday: 0,
          weekdayName: "Sunday",
          weekdayNameNepali: "आइतबार",
          bsDay: 26,
          bsDayNepali: "२६",
          adDay: 7,
          isCurrentMonth: false,
          isToday: false,
          isSaturday: false,
          isSunday: true,
          isWeekend: false,
          date: NepaliDate { … }
        },
        // ... 6 more cells
      ]
    },
    // ... more weeks (typically 5 or 6)
  ]
}
```

### Calendar options

```ts
getCalendarMonth(year, month, {
  weekStartsOn: 0,         // 0=Sunday (default — Nepal standard), 1=Monday, …
  padding: true,           // include leading/trailing adjacent-month cells
  today: NepaliDate.now(), // override "today" (useful for tests)
  weekendDays: [6],        // [6] = Saturday only (default), [0, 6] = Sun+Sat
  locale: "ne",            // "en" (default) or "ne" — affects header strings
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

## 🔁 AD ↔ BS range conversion

Forms, reports, analytics — anywhere you have a date range in one calendar and need it in the other.

```ts
import { convertAdRangeToBs, eachBsDayInAdRange } from "nepali-date-pro-max";

// Just the bounds — fast
convertAdRangeToBs(
  { year: 2024, month: 1, day: 1 },
  { year: 2024, month: 12, day: 31 },
  { format: "DD MMMM YYYY" },
);
// → { start: "16 Poush 2080", end: "16 Poush 2081" }

// Devanagari, every day
eachBsDayInAdRange(
  new Date("2024-04-13"),
  new Date("2024-04-15"),
  { format: "YYYY-MM-DD", nepali: true },
);
// → ["२०८१-०१-०१", "२०८१-०१-०२", "२०८१-०१-०३"]

// Inverse: BS → AD
import { convertBsRangeToAd, eachAdDayInBsRange } from "nepali-date-pro-max";
convertBsRangeToAd(
  { year: 2081, month: 1, day: 1 },
  { year: 2082, month: 1, day: 1 },
  { format: "MMM D, YYYY" },
);
// → { start: "Apr 13, 2024", end: "Apr 14, 2025" }
```

When `format` is omitted, you get raw `BsDate[]` / `AdDate[]`. When provided, `string[]`. TypeScript overloads handle the narrowing for you.

---

## 🏛️ Fiscal year (आर्थिक वर्ष)

Nepal's fiscal year runs **Shrawan 1 → Ashad-end** of the next year. FY 2081/82 starts on Shrawan 1, 2081 (mid-July 2024 AD).

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
formatFiscalYear(2081, { nepali: true });        // "२०८१/८२"
getFiscalQuarter(NepaliDate.fromBs(2081, 7, 1)); // 2 (Kartik-Poush)
```

---

## 🧰 Full API surface

### Core conversion
```ts
bsToAd(year, month, day)             // BS → AD
adToBs(year, month, day)             // AD → BS
fromJsDate(date)                     // JS Date → BS (shifted to NPT)
bsWeekday(year, month, day)          // 0=Sun..6=Sat
bsDayOfYear(year, month, day)        // 1..(365|366)
bsFromDayOfYear(year, dayOfYear)     // → { month, day }
```

### Calendar metadata
```ts
FIRST_BS_YEAR     // 1975
LAST_BS_YEAR      // 2099
daysInBsMonth(year, month)
daysInBsYear(year)
isBsLeapYear(year)
BS_YEAR_DATA      // raw [m1..m12, total] table
```

### Parsing & formatting
```ts
parseBs("2081-01-15")                      // -, /, .  +  ASCII or Devanagari
parseBs("२०८१-०१-१५")
formatBs(bs, "DD MMMM YYYY")               // "01 Baishakh 2081"
formatBs(bs, "DD MMMM YYYY", { nepali: true })  // "०१ बैशाख २०८१"
toDevanagariDigits(2081)                   // "२०८१"
toAsciiDigits("२०८१")                      // "2081"
```

#### Format tokens

| Token | Output | Example |
|---|---|---|
| `YYYY` / `YY` | year | `2081` / `81` |
| `MMMM` / `MMM` / `MM` / `M` | month | `Baishakh` / `Bai` / `01` / `1` |
| `DD` / `D` | day-of-month | `05` / `5` |
| `dddd` / `ddd` / `dd` | weekday | `Saturday` / `Sat` / `Sa` |
| `HH` / `H` / `hh` / `h` | hour (24h or 12h) | `09` / `9` |
| `mm` / `m` / `ss` / `s` | minute / second | `03` / `3` |
| `A` / `a` | AM/PM | `PM` / `pm` |
| `[…]` | literal | `[year:] YYYY` → `year: 2081` |

### `NepaliDate` class (immutable, full date+time)

```ts
NepaliDate.now() / fromBs() / fromAd() / fromJsDate() / parse()

// Reading
getYear() / getMonth() / getDate() / getDay() / getDayOfYear()
getHours() / getMinutes() / getSeconds() / getMilliseconds()
getMonthName() / getMonthNameNepali() / getDayName() / getDayNameNepali()
daysInMonth() / daysInYear()

// Predicates
isWeekend() / isLeapYear() / isFirstDayOfMonth() / isLastDayOfMonth()
isBefore() / isAfter() / isSameDay()

// Conversion
toBs() / toAd() / toJsDate() / toString() / toJSON() / getDetails()

// Formatting
format(pattern, options?) / formatNepali(pattern?)

// Arithmetic — ALL return a NEW instance
addDays() / addMonths() / addYears()
addHours() / addMinutes() / addSeconds() / addMilliseconds()
startOfDay() / endOfDay()
startOfMonth() / endOfMonth()
startOfYear() / endOfYear()

// Diff
diffDays(other)
```

### date-fns-style functional helpers

```ts
// Arithmetic
addDays / subDays, addMonths / subMonths, addYears / subYears, +hour/min/sec/ms

// Setters (immutable)
setYear, setMonth, setDate, setDay, setDayOfYear,
setHours, setMinutes, setSeconds, setMilliseconds

// Comparisons
isBefore / isAfter / isEqual
isSameDay / isSameMonth / isSameYear / isSameWeek
isToday / isYesterday / isTomorrow
isThisMonth / isThisYear / isThisWeek
isMonday / … / isSaturday / isSunday / isWeekend
isFirstDayOfMonth / isLastDayOfMonth / isLeapYear
isWithinInterval / areIntervalsOverlapping

// Bounds
startOfDay / endOfDay
startOfWeek / endOfWeek (Sunday-start by default)
startOfMonth / endOfMonth
startOfYear / endOfYear

// Differences
differenceInMilliseconds / Seconds / Minutes / Hours / Days / Weeks
differenceInCalendarDays / CalendarMonths / CalendarYears
differenceInMonths / Years (calendar-aware)

// Interval enumerators
eachDayOfInterval / eachWeekOfInterval / eachMonthOfInterval / eachYearOfInterval
eachWeekendOfInterval

// Distance / relative — English or Devanagari Nepali
formatDistance(a, b, { addSuffix?, locale? })
formatDistanceToNow(d, { addSuffix?, locale? })
formatRelative(d, base?, { locale? })

// Min / max / clamp
min(arr) / max(arr) / clamp(d, interval)
closestTo / closestIndexTo / isValid

// Calendar grid (UI-ready)
getCalendarMonth(year, month, options?)
getCalendarYear(year, options?)
getCalendarDay(date, options?)
flattenCalendarMonth(month)

// Fiscal year (आर्थिक वर्ष)
getFiscalYear / startOfFiscalYear / endOfFiscalYear
formatFiscalYear / getFiscalQuarter
```

---

## 🎯 Real-world recipes

### "आज को मिति" header

```tsx
import { NepaliDate } from "nepali-date-pro-max";

export function TodayHeader() {
  const d = NepaliDate.now();
  return (
    <div>
      <div>{d.formatNepali("dddd, DD MMMM YYYY")}</div>
      <div className="text-xs">{d.format("dddd, DD MMMM YYYY")}</div>
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
const label = formatFiscalYear(fy, { nepali: true });
// "आर्थिक वर्ष २०८३/८४"
```

### Form: AD date-range picker → BS strings for the API

```ts
import { convertAdRangeToBs } from "nepali-date-pro-max";

function onSubmit({ startAd, endAd }: { startAd: Date; endAd: Date }) {
  const bs = convertAdRangeToBs(startAd, endAd, { format: "YYYY-MM-DD" });
  api.post("/reports", { startBs: bs.start, endBs: bs.end });
}
```

### Show all Saturdays this month (बिदा / weekly holidays)

```ts
import { NepaliDate, eachWeekendOfInterval } from "nepali-date-pro-max";
const m = NepaliDate.now();
const saturdays = eachWeekendOfInterval(
  { start: m.startOfMonth(), end: m.endOfMonth() },
  6,
);
```

### "५ दिन अघि" — relative time in Nepali

```ts
import { formatDistanceToNow, NepaliDate } from "nepali-date-pro-max";
formatDistanceToNow(
  NepaliDate.now().addDays(-5),
  { addSuffix: true, locale: "ne" },
);
// "५ दिन अघि"
```

---

## 📐 Range & accuracy

This package supports **BS 1975 → 2099** — a span of 125 BS years, corresponding to roughly AD 1918-04-13 → 2043-04-13.

The Bikram Sambat calendar is **not** algorithmic. Month lengths are determined astronomically and ratified each year by the **Nepali calendar committee** (पंचाङ्ग निर्णायक समिति), so every BS↔AD library — ours included — relies on a hand-curated lookup table. The table shipped here covers the full 125-year range and is verified by 112 unit tests including round-trip checks against well-known reference dates (Nepal New Year, Republic Day, Constitution Day, etc.) and full BS↔AD↔BS round-trips on every year boundary.

If you ever spot a date that converts incorrectly, please open an issue with the BS and AD pair — calendar-data fixes ship as patch releases.

---

## 🤝 Contributing

Bugs, suggestions, calendar-data corrections, and new helpers are very welcome — open an issue or PR. If your team uses this in production, we'd love to hear about it.

---

## 📜 License

[MIT](LICENSE) © l3lackcurtains

---

<p align="center">
  <strong>Made with ❤️ for the Nepali developer community</strong><br/>
  <em>नेपाली डेभलपर समुदायका लागि माया साथ बनाइएको</em><br/><br/>
  धन्यवाद! 🙏
</p>
