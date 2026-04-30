/**
 * Nepali fiscal-year helpers.
 *
 * Nepal's fiscal year runs **Shrawan 1 (month 4)** through **Ashad end (month 3
 * of the next BS year)**. The fiscal year is named after the BS year in which
 * Shrawan 1 falls — e.g. FY 2081/82 starts on Shrawan 1, 2081 BS.
 *
 * @example
 * getFiscalYear(NepaliDate.fromBs(2081, 5, 1))   // 2081
 * getFiscalYear(NepaliDate.fromBs(2081, 3, 30))  // 2080
 * formatFiscalYear(2081)                          // "2081/82"
 */

import { NepaliDate } from "./nepali-date.js";
import { daysInBsMonth } from "./data.js";

/** Month number where the Nepali fiscal year starts (Shrawan = 4). */
export const FISCAL_YEAR_START_MONTH = 4;

/** The BS fiscal year that `date` belongs to. */
export function getFiscalYear(date: NepaliDate): number {
  return date.getMonth() >= FISCAL_YEAR_START_MONTH
    ? date.getYear()
    : date.getYear() - 1;
}

/** First day of the fiscal year `fy`: Shrawan 1, BS `fy`. */
export function startOfFiscalYear(fy: number): NepaliDate {
  return NepaliDate.fromBs(fy, FISCAL_YEAR_START_MONTH, 1);
}

/** Last day of the fiscal year `fy`: Ashad-end (month 3) of BS `fy + 1`. */
export function endOfFiscalYear(fy: number): NepaliDate {
  const lastDay = daysInBsMonth(fy + 1, FISCAL_YEAR_START_MONTH - 1);
  return NepaliDate.fromBs(fy + 1, FISCAL_YEAR_START_MONTH - 1, lastDay);
}

/**
 * Format a fiscal year as `"YYYY/YY"` (e.g. `2081 → "2081/82"`).
 * Pass `nepali: true` to render in Devanagari digits.
 */
export function formatFiscalYear(
  fy: number,
  options: { nepali?: boolean } = {},
): string {
  const next = (fy + 1) % 100;
  const right = next < 10 ? `0${next}` : String(next);
  const out = `${fy}/${right}`;
  if (options.nepali) {
    let np = "";
    for (const ch of out) {
      const c = ch.charCodeAt(0);
      np +=
        c >= 48 && c <= 57
          ? "०१२३४५६७८९".charAt(c - 48)
          : ch;
    }
    return np;
  }
  return out;
}

/** Quarter (1..4) within the fiscal year that `date` belongs to. */
export function getFiscalQuarter(date: NepaliDate): number {
  const m = date.getMonth();
  // Q1: Shrawan-Ashwin (4-6), Q2: Kartik-Poush (7-9), Q3: Magh-Chaitra (10-12), Q4: Baishakh-Ashad (1-3)
  if (m >= 4 && m <= 6) return 1;
  if (m >= 7 && m <= 9) return 2;
  if (m >= 10 && m <= 12) return 3;
  return 4;
}
