# Changelog

## 2.0.1 — Locale-data convenience + richer calendar cells (additive)

> **Why:** consumers building bilingual calendar UIs were reaching into `getLocale("ne").months` and re-implementing per-cell digit conversion / AD month formatting on top of `getCalendarMonth`. Both have always been computable from existing primitives; this release exposes them directly.

### Added

- **Top-level locale-data helpers** — accept a locale name string or `Locale` object, default to the global locale:
  - `getMonthNames(locale?, length?: "long" | "short")` → 12-string array
  - `getWeekdayNames(locale?, length?: "long" | "short" | "min")` → 7-string array
  - `localizeDigits(value, locale?)` → numeric string in the locale's numeral system
- **`CalendarDayCell.bsDayLocalized`** — BS day in the *active locale's* digit system. (`bsDayNepali` is unchanged: always Devanagari.)
- **`CalendarDayCell.adMonthName`** + **`adMonthNameShort`** — full + short English Gregorian month name on every cell, so consumers can render an AD-month chip (e.g. `"Apr 13"`) without a separate `format()` pass.
- **`CalendarMonth.yearLocalized`** — BS year in the active locale's digit system. (`yearNepali` is unchanged: always Devanagari.)
- **`getCalendarDay(date, options)`** now accepts `options.locale`.
- **10 new tests** covering the helpers and the new cell/month fields.

### Changed

Nothing breaking. All previously documented field shapes and function signatures are preserved; new fields are additive on the existing objects.

---

## 2.0.0 — Day.js-style locale system (BREAKING)

> **Why:** the locale story was inconsistent across the API — some functions had a `nepali: true` flag, others had `*Nepali` siblings, and the `NepaliDate` class shipped both `format()` + `formatNepali()` plus `getMonthName()` + `getMonthNameNepali()`. Day.js solves this with a single locale registry and a chainable `.locale()` setter, and that's what the library now uses everywhere. Released only hours after `1.0.0`, so the cleanup ships as a hard break rather than a deprecation tail.

### Added

- **Locale registry.** `Locale` interface with `name`, `months`/`monthsShort`, `weekdays`/`weekdaysShort`/`weekdaysMin`, a `digits` converter, and an optional `relativeTime` phrasebook (used by `formatDistance` / `formatRelative`).
- **Built-in `"en"` and `"ne"` locales** — Roman + ASCII digits and Devanagari + Devanagari digits, respectively.
- **Global locale**: `NepaliDate.locale()` / `NepaliDate.locale(name)` (Day.js-style getter/setter), with functional aliases `getGlobalLocale` / `setGlobalLocale`.
- **Per-instance locale**: `d.locale()` reads the resolved locale, `d.locale(name)` returns a NEW immutable instance — locale is **threaded through every chained operation** (`addDays`, `addMonths`, `setYear`, `startOfMonth`, `addMilliseconds`, …).
- **Custom locales** via `registerLocale(locale)`; inspect with `getLocale` / `hasLocale` / `listLocales`.
- **`DistanceOptions`** type — `formatDistance`, `formatDistanceToNow`, and `formatRelative` now accept `{ locale }`.
- **README "🌐 Locale" section** and updated `llms.txt` covering the new model.
- **24 new locale tests** covering global default, instance override, chain propagation, custom locale registration, and calendar pickup.

### Changed (BREAKING)

- `formatBs(date, pattern, options?)` — `options.nepali` removed. Use `options.locale: "en" | "ne" | Locale`.
- `NepaliDate#format(pattern, options?)` — uses the instance's locale by default; `options.locale` overrides.
- `NepaliDate#getMonthName()` / `getDayName()` — now follow the active locale instead of always returning Roman.
- `formatFiscalYear(fy, options?)` — `options.nepali` removed. Use `options.locale`.
- `RangeConvertOptions.nepali` removed; use `RangeConvertOptions.locale` (inherited from `FormatOptions`).
- `getCalendarMonth/Year/Day` — `options.locale` defaults from the global locale (was hard-coded `"en"`).
- `NepaliDateDetails` — dropped `weekdayNameNepali` and `monthNameNepali`; added `locale` field. Use `.locale("ne").getDetails()` if you need both forms.

### Removed (BREAKING)

- `NepaliDate#formatNepali()` → `d.locale("ne").format(...)`.
- `NepaliDate#getMonthNameNepali()` → `d.locale("ne").getMonthName()`.
- `NepaliDate#getDayNameNepali()` → `d.locale("ne").getDayName()`.
- `formatDistanceNepali(a, b)` → `formatDistance(a, b, { locale: "ne" })`.
- `formatDistanceToNowNepali(x)` → `formatDistanceToNow(x, { locale: "ne" })`.
- `formatRelativeNepali(x, base?)` → `formatRelative(x, base, { locale: "ne" })`.

### Migration

```ts
// before
NepaliDate.now().formatNepali("DD MMMM YYYY");
formatBs(d, "YYYY-MM-DD", { nepali: true });
formatDistanceToNowNepali(post.createdAt);
formatFiscalYear(2081, { nepali: true });

// after — option A: per-call locale
NepaliDate.now().locale("ne").format("DD MMMM YYYY");
formatBs(d, "YYYY-MM-DD", { locale: "ne" });
formatDistanceToNow(post.createdAt, { locale: "ne" });
formatFiscalYear(2081, { locale: "ne" });

// after — option B: set once globally
NepaliDate.locale("ne");
NepaliDate.now().format("DD MMMM YYYY");
formatBs(d, "YYYY-MM-DD");
formatDistanceToNow(post.createdAt);
formatFiscalYear(2081);
```

The `CalendarMonth` / `CalendarDayCell` shapes still expose locale-independent `monthNameNepali` / `weekdayNameNepali` / `bsDayNepali` fields for bilingual UIs that want both forms in one render — those are *not* removed.

---

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
