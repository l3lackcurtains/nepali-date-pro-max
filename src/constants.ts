/** Nepali (Bikram Sambat) month names in Roman script. Index 0 = Baishakh. */
export const BS_MONTH_NAMES: readonly string[] = [
  "Baishakh",
  "Jestha",
  "Ashadh",
  "Shrawan",
  "Bhadra",
  "Ashwin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
];

/** Short Roman BS month names. */
export const BS_MONTH_NAMES_SHORT: readonly string[] = [
  "Bai",
  "Jes",
  "Ash",
  "Shr",
  "Bha",
  "Ashw",
  "Kar",
  "Man",
  "Pou",
  "Mag",
  "Fal",
  "Cha",
];

/** Nepali (Bikram Sambat) month names in Devanagari. Index 0 = बैशाख. */
export const BS_MONTH_NAMES_NP: readonly string[] = [
  "बैशाख",
  "जेठ",
  "असार",
  "साउन",
  "भदौ",
  "असोज",
  "कार्तिक",
  "मंसिर",
  "पौष",
  "माघ",
  "फाल्गुन",
  "चैत",
];

/** English Gregorian month names, 1-indexed lookup helper (BS_MONTH_NAMES is 0-indexed). */
export const AD_MONTH_NAMES: readonly string[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const AD_MONTH_NAMES_SHORT: readonly string[] = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Weekday names in English. Index 0 = Sunday … 6 = Saturday. */
export const WEEKDAY_NAMES: readonly string[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const WEEKDAY_NAMES_SHORT: readonly string[] = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

export const WEEKDAY_NAMES_MIN: readonly string[] = [
  "Su",
  "Mo",
  "Tu",
  "We",
  "Th",
  "Fr",
  "Sa",
];

/** Weekday names in Nepali (Devanagari). Index 0 = आइतबार (Sunday). */
export const WEEKDAY_NAMES_NP: readonly string[] = [
  "आइतबार",
  "सोमबार",
  "मंगलबार",
  "बुधबार",
  "बिहीबार",
  "शुक्रबार",
  "शनिबार",
];

export const WEEKDAY_NAMES_NP_SHORT: readonly string[] = [
  "आइत",
  "सोम",
  "मंगल",
  "बुध",
  "बिही",
  "शुक्र",
  "शनि",
];

/** Devanagari digits, indexed by ASCII digit value (0..9). */
export const DEVANAGARI_DIGITS: readonly string[] = [
  "०",
  "१",
  "२",
  "३",
  "४",
  "५",
  "६",
  "७",
  "८",
  "९",
];

/** Map of Devanagari digit → ASCII digit, used for parsing user input. */
export const DEVANAGARI_TO_ASCII: Readonly<Record<string, string>> = {
  "०": "0",
  "१": "1",
  "२": "2",
  "३": "3",
  "४": "4",
  "५": "5",
  "६": "6",
  "७": "7",
  "८": "8",
  "९": "9",
};

/**
 * Convert an ASCII-digit number or string to its Devanagari representation.
 * Non-digit characters are passed through unchanged.
 *
 * @example
 * toDevanagariDigits(2081) // "२०८१"
 * toDevanagariDigits("2081-01-15") // "२०८१-०१-१५"
 */
export function toDevanagariDigits(input: number | string): string {
  const s = String(input);
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c >= 48 && c <= 57) {
      out += DEVANAGARI_DIGITS[c - 48];
    } else {
      out += s[i];
    }
  }
  return out;
}

/**
 * Convert a string containing Devanagari digits to ASCII digits.
 * Non-Devanagari characters are passed through unchanged.
 *
 * @example
 * toAsciiDigits("२०८१-०१-१५") // "2081-01-15"
 */
export function toAsciiDigits(input: string): string {
  let out = "";
  for (let i = 0; i < input.length; i++) {
    const ch = input[i]!;
    out += DEVANAGARI_TO_ASCII[ch] ?? ch;
  }
  return out;
}
