# Changelog

## 1.0.0 — initial release of `nepali-date-pro-max`

### Conversion core
- Bikram Sambat ↔ Gregorian conversion across **BS 1975–2099** (≈ AD 1918-04-13 to 2043-04-13).
- Functional API: `bsToAd`, `adToBs`, `fromJsDate`, `bsWeekday`, `bsDayOfYear`, `bsFromDayOfYear`.
- Calendar metadata: `daysInBsMonth`, `daysInBsYear`, `isBsLeapYear`, `BS_YEAR_DATA`, `FIRST_BS_YEAR`, `LAST_BS_YEAR`.
- Token-based formatter (`formatBs`) supporting Devanagari output.
- Strict parser (`parseBs`) accepting ASCII or Devanagari digits and `-` / `/` / `.` separators.
- Devanagari helpers: `toDevanagariDigits`, `toAsciiDigits`.

### `NepaliDate` class
- Immutable BS datetime value with full date+time, arithmetic, comparison, formatting.
- Factories: `NepaliDate.now/fromBs/fromAd/fromJsDate/parse`.
- Predicates: `isWeekend`, `isLeapYear`, `isFirstDayOfMonth`, `isLastDayOfMonth`.
- Bounds: `startOfDay/endOfDay/startOfMonth/endOfMonth/startOfYear/endOfYear`.

### date-fns-style utility surface (90+ helpers)
- Arithmetic: `addDays/subDays`, `addMonths/subMonths`, `addYears/subYears`, plus hour/minute/second/ms variants.
- Setters: `setYear`, `setMonth`, `setDate`, `setDay`, `setDayOfYear`, `setHours/Minutes/Seconds/Milliseconds` — all immutable, day-clamping where appropriate.
- Comparisons: `isSameDay/Month/Year/Week`, `isToday/Yesterday/Tomorrow`, `isThisMonth/Year/Week`, `isWeekend`, weekday-named predicates, `isFirstDayOfMonth/LastDayOfMonth/LeapYear`, `isBefore/After/Equal`, `isWithinInterval`, `areIntervalsOverlapping`.
- Bounds: `startOfWeek/endOfWeek` (Sunday-start by default — Nepal standard).
- Differences: `differenceInMilliseconds/Seconds/Minutes/Hours/Days/Weeks/Months/Years` plus calendar variants.
- Interval enumerators: `eachDayOfInterval`, `eachWeekOfInterval`, `eachMonthOfInterval`, `eachYearOfInterval`, `eachWeekendOfInterval`.
- Distance / relative: `formatDistance`, `formatDistanceToNow`, `formatRelative` — English or Devanagari Nepali.
- Min/max/clamp: `min`, `max`, `clamp`, `closestTo`, `closestIndexTo`, `isValid`.

### Cross-calendar range conversion
- `convertAdRangeToBs` / `convertBsRangeToAd` — convert just the bounds.
- `eachBsDayInAdRange` / `eachAdDayInBsRange` — enumerate every day across a range.
- `eachBsMonthInAdRange` — enumerate every BS month touched by an AD range.
- All accept `format` and `nepali` options for direct string output.

### Calendar grid (UI-ready, Hamro-Patro–style)
- `getCalendarMonth(year, month, options?)` — returns a fully-prepared 7-column grid of weeks with per-cell metadata (`bs`, `ad`, `weekday`, `bsDayNepali`, `adDay`, `isToday`, `isSaturday`, `isSunday`, `isWeekend`, `isCurrentMonth`).
- `getCalendarYear(year, options?)` — full year of 12 month grids.
- `getCalendarDay(date, options?)` — single-cell metadata for day-detail views.
- `flattenCalendarMonth(month)` — drop the week grouping when not needed.
- Options: `weekStartsOn`, `padding`, `today`, `weekendDays`, `locale: "en" | "ne"`.
- Devanagari weekday headers, BS digits, and adjacent-month padding all pre-computed — UI code stays declarative.

### Nepali fiscal year
- `getFiscalYear`, `startOfFiscalYear`, `endOfFiscalYear`.
- `formatFiscalYear` (e.g. `"2081/82"` or `"२०८१/८२"`).
- `getFiscalQuarter`.

### Engineering
- TypeScript-first with strict + `noUncheckedIndexedAccess`.
- Dual ESM (53 KB) + CJS (59 KB) build via `tsup`, full type declarations.
- Zero runtime dependencies.
- **112 unit tests** (round-trip across the entire BS year range, weekday correctness, format/parse, range conversion, fiscal year, distance, intervals, calendar grid).
- MIT license.
