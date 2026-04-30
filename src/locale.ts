/**
 * Locale system — Day.js-style global + per-instance locale switching.
 *
 * Two locales ship built-in:
 *
 *   - `"en"` — Roman script, ASCII digits (default)
 *   - `"ne"` — Devanagari script, Devanagari digits
 *
 * Set the global default once at app boot, and every new `NepaliDate` /
 * calendar call picks it up:
 *
 * ```ts
 * import { NepaliDate } from "nepali-date-pro-max";
 *
 * NepaliDate.locale("ne");
 * NepaliDate.now().format("DD MMMM YYYY"); // "१५ बैशाख २०८१"
 * ```
 *
 * Override per-instance for one-offs (returns a NEW immutable instance):
 *
 * ```ts
 * d.locale("en").format("DD MMMM YYYY"); // "15 Baishakh 2081"
 * ```
 *
 * Register custom locales (e.g. transliteration variants) with
 * {@link registerLocale}.
 */

import {
  BS_MONTH_NAMES,
  BS_MONTH_NAMES_NP,
  BS_MONTH_NAMES_SHORT,
  toDevanagariDigits,
  WEEKDAY_NAMES,
  WEEKDAY_NAMES_MIN,
  WEEKDAY_NAMES_NP,
  WEEKDAY_NAMES_NP_SHORT,
  WEEKDAY_NAMES_SHORT,
} from "./constants.js";

/**
 * Phrasebook used by `formatDistance`, `formatDistanceToNow`, and
 * `formatRelative`. Mirrors Day.js's `relativeTime` object.
 *
 * Functions take a count `n` so locales can pluralise. Numerals must already
 * be rendered in the target script (use `locale.digits` if needed).
 */
export interface LocaleRelativeTime {
  lessThanMinute: string;
  minute(n: number): string;
  aboutHour(n: number): string;
  aboutDay(n: number): string;
  day(n: number): string;
  aboutMonth(n: number): string;
  month(n: number): string;
  aboutYear(n: number): string;
  almostYear(n: number): string;
  overYear(n: number): string;
  year(n: number): string;
  /** Wrap a duration phrase as past tense (e.g. `"5 minutes ago"`). */
  ago(phrase: string): string;
  /** Wrap a duration phrase as future tense (e.g. `"in 5 minutes"`). */
  in(phrase: string): string;
  today: string;
  yesterday: string;
  tomorrow: string;
  inNDays(n: number): string;
  nDaysAgo(n: number): string;
}

/**
 * A locale describes how a `NepaliDate` renders to text: month/weekday names
 * in three lengths, a digit converter, and an optional relative-time
 * phrasebook used by `formatDistance` / `formatRelative`.
 *
 * Built-in locales are `"en"` and `"ne"`. Add your own with
 * {@link registerLocale}.
 */
export interface Locale {
  /** Locale identifier, e.g. `"en"`, `"ne"`. */
  readonly name: string;
  /** Full BS month names (length 12, 0=Baishakh). */
  readonly months: readonly string[];
  /** Short BS month names (length 12). */
  readonly monthsShort: readonly string[];
  /** Full weekday names (length 7, 0=Sunday). */
  readonly weekdays: readonly string[];
  /** Short weekday names (length 7). */
  readonly weekdaysShort: readonly string[];
  /** Minimum-width weekday names (length 7) — for compact calendar headers. */
  readonly weekdaysMin: readonly string[];
  /**
   * Convert an ASCII-digit number/string to this locale's numeral system.
   * For `"en"` this is the identity. For `"ne"` it returns Devanagari.
   */
  readonly digits: (input: number | string) => string;
  /**
   * Relative-time phrasebook. If omitted, distance/relative formatters fall
   * back to the `"en"` locale's phrasebook.
   */
  readonly relativeTime?: LocaleRelativeTime;
}

const asciiDigits = (input: number | string): string => String(input);

const EN_RELATIVE: LocaleRelativeTime = {
  lessThanMinute: "less than a minute",
  minute: (n) => `${n} minute${n === 1 ? "" : "s"}`,
  aboutHour: (n) => `about ${n} hour${n === 1 ? "" : "s"}`,
  aboutDay: (n) => `about ${n} day${n === 1 ? "" : "s"}`,
  day: (n) => `${n} day${n === 1 ? "" : "s"}`,
  aboutMonth: (n) => `about ${n} month${n === 1 ? "" : "s"}`,
  month: (n) => `${n} month${n === 1 ? "" : "s"}`,
  aboutYear: (n) => `about ${n} year${n === 1 ? "" : "s"}`,
  almostYear: (n) => `almost ${n} year${n === 1 ? "" : "s"}`,
  overYear: (n) => `over ${n} year${n === 1 ? "" : "s"}`,
  year: (n) => `${n} year${n === 1 ? "" : "s"}`,
  ago: (s) => `${s} ago`,
  in: (s) => `in ${s}`,
  today: "today",
  yesterday: "yesterday",
  tomorrow: "tomorrow",
  inNDays: (n) => `in ${n} days`,
  nDaysAgo: (n) => `${n} days ago`,
};

const NE_RELATIVE: LocaleRelativeTime = {
  lessThanMinute: "एक मिनेटभन्दा कम",
  minute: (n) => `${toDevanagariDigits(n)} मिनेट`,
  aboutHour: (n) => `लगभग ${toDevanagariDigits(n)} घण्टा`,
  aboutDay: (n) => `लगभग ${toDevanagariDigits(n)} दिन`,
  day: (n) => `${toDevanagariDigits(n)} दिन`,
  aboutMonth: (n) => `लगभग ${toDevanagariDigits(n)} महिना`,
  month: (n) => `${toDevanagariDigits(n)} महिना`,
  aboutYear: (n) => `लगभग ${toDevanagariDigits(n)} वर्ष`,
  almostYear: (n) => `झण्डै ${toDevanagariDigits(n)} वर्ष`,
  overYear: (n) => `${toDevanagariDigits(n)} वर्षभन्दा बढी`,
  year: (n) => `${toDevanagariDigits(n)} वर्ष`,
  ago: (s) => `${s} अघि`,
  in: (s) => `${s} पछि`,
  today: "आज",
  yesterday: "हिजो",
  tomorrow: "भोलि",
  inNDays: (n) => `${toDevanagariDigits(n)} दिनमा`,
  nDaysAgo: (n) => `${toDevanagariDigits(n)} दिन अघि`,
};

const EN_LOCALE: Locale = Object.freeze({
  name: "en",
  months: BS_MONTH_NAMES,
  monthsShort: BS_MONTH_NAMES_SHORT,
  weekdays: WEEKDAY_NAMES,
  weekdaysShort: WEEKDAY_NAMES_SHORT,
  weekdaysMin: WEEKDAY_NAMES_MIN,
  digits: asciiDigits,
  relativeTime: EN_RELATIVE,
});

const NE_LOCALE: Locale = Object.freeze({
  name: "ne",
  months: BS_MONTH_NAMES_NP,
  // Devanagari has no short form in common use — reuse full names.
  monthsShort: BS_MONTH_NAMES_NP,
  weekdays: WEEKDAY_NAMES_NP,
  weekdaysShort: WEEKDAY_NAMES_NP_SHORT,
  // Min-width Devanagari falls back to short — Devanagari short is already 2 chars.
  weekdaysMin: WEEKDAY_NAMES_NP_SHORT,
  digits: toDevanagariDigits,
  relativeTime: NE_RELATIVE,
});

/** Internal: resolve a locale's relative-time phrasebook, falling back to en. */
export function resolveRelativeTime(loc: Locale): LocaleRelativeTime {
  return loc.relativeTime ?? EN_RELATIVE;
}

const REGISTRY = new Map<string, Locale>([
  ["en", EN_LOCALE],
  ["ne", NE_LOCALE],
]);

let globalLocaleName = "en";

/**
 * Register a custom locale. After registering, refer to it by name in
 * `NepaliDate.locale("xx")` / `d.locale("xx")` / format calls.
 *
 * @example
 * registerLocale({
 *   name: "ne-rom",                    // romanised Nepali
 *   months: ["Baishak", "Jeth", ...],
 *   monthsShort: ["Bai", "Jet", ...],
 *   weekdays: ["Aaitabar", ...],
 *   weekdaysShort: ["Aai", ...],
 *   weekdaysMin: ["Aa", ...],
 *   digits: (n) => String(n),
 * });
 */
export function registerLocale(locale: Locale): void {
  if (!locale || typeof locale.name !== "string" || !locale.name) {
    throw new TypeError("registerLocale: locale.name is required");
  }
  if (
    !Array.isArray(locale.months) || locale.months.length !== 12 ||
    !Array.isArray(locale.monthsShort) || locale.monthsShort.length !== 12 ||
    !Array.isArray(locale.weekdays) || locale.weekdays.length !== 7 ||
    !Array.isArray(locale.weekdaysShort) || locale.weekdaysShort.length !== 7 ||
    !Array.isArray(locale.weekdaysMin) || locale.weekdaysMin.length !== 7 ||
    typeof locale.digits !== "function"
  ) {
    throw new TypeError(
      `registerLocale("${locale.name}"): months[12], monthsShort[12], weekdays[7], weekdaysShort[7], weekdaysMin[7], digits() are required`,
    );
  }
  REGISTRY.set(locale.name, locale);
}

/**
 * Look up a registered locale by name. Throws if unknown.
 */
export function getLocale(name: string): Locale {
  const loc = REGISTRY.get(name);
  if (!loc) {
    const known = [...REGISTRY.keys()].map((n) => `"${n}"`).join(", ");
    throw new RangeError(
      `Unknown locale "${name}". Known locales: ${known}. Use registerLocale() to add custom ones.`,
    );
  }
  return loc;
}

/** True if a locale with this name has been registered. */
export function hasLocale(name: string): boolean {
  return REGISTRY.has(name);
}

/** All registered locale names. */
export function listLocales(): string[] {
  return [...REGISTRY.keys()];
}

/**
 * Get the current global locale name (default `"en"`).
 *
 * Used as the fallback when a `NepaliDate` instance has no explicit locale,
 * and when `getCalendarMonth` etc. are called without a `locale` option.
 */
export function getGlobalLocale(): string {
  return globalLocaleName;
}

/**
 * Set the global locale by name. Must be a registered locale.
 *
 * @example
 * setGlobalLocale("ne");
 */
export function setGlobalLocale(name: string): void {
  if (!REGISTRY.has(name)) getLocale(name); // throws with message
  globalLocaleName = name;
}

/** Internal: the resolved global `Locale` object. */
export function resolveGlobalLocale(): Locale {
  return getLocale(globalLocaleName);
}

/** Internal: accept either a name string or a `Locale` object; default to global. */
function resolveLocaleArg(locale?: string | Locale): Locale {
  if (locale === undefined) return resolveGlobalLocale();
  return typeof locale === "string" ? getLocale(locale) : locale;
}

/**
 * BS month names in the given locale.
 *
 * `length` defaults to `"long"`. Pass `"short"` for the abbreviated set.
 *
 * @example
 * getMonthNames("ne");           // ["बैशाख", "जेठ", …]
 * getMonthNames("en", "short");  // ["Bai", "Jes", …]
 */
export function getMonthNames(
  locale?: string | Locale,
  length: "long" | "short" = "long",
): readonly string[] {
  const loc = resolveLocaleArg(locale);
  return length === "short" ? loc.monthsShort : loc.months;
}

/**
 * Weekday names in the given locale, ordered Sun..Sat.
 *
 * `length` defaults to `"long"`. Use `"short"` for the abbreviated set,
 * `"min"` for minimum-width labels (compact calendar headers).
 *
 * @example
 * getWeekdayNames("ne");            // ["आइतबार", "सोमबार", …]
 * getWeekdayNames("en", "short");   // ["Sun", "Mon", …]
 * getWeekdayNames("en", "min");     // ["Su", "Mo", …]
 */
export function getWeekdayNames(
  locale?: string | Locale,
  length: "long" | "short" | "min" = "long",
): readonly string[] {
  const loc = resolveLocaleArg(locale);
  if (length === "short") return loc.weekdaysShort;
  if (length === "min") return loc.weekdaysMin;
  return loc.weekdays;
}

/**
 * Render a number/string in the given locale's numeral system.
 *
 * Identity for `"en"` (ASCII digits), Devanagari for `"ne"`. Custom locales
 * use the `digits` function they registered.
 *
 * @example
 * localizeDigits(2081, "ne");           // "२०८१"
 * localizeDigits("2081-01-15", "ne");   // "२०८१-०१-१५"
 * localizeDigits(2081, "en");           // "2081"
 */
export function localizeDigits(
  value: number | string,
  locale?: string | Locale,
): string {
  return resolveLocaleArg(locale).digits(value);
}
