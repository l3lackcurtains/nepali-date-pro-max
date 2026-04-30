/**
 * Parse a BS date string. Accepts both ASCII and Devanagari digits and the
 * common separators `-`, `/`, `.`. Strict order: `YYYY{sep}MM{sep}DD`.
 *
 * @example
 * parseBs("2081-01-15")  // { year: 2081, month: 1, day: 15 }
 * parseBs("२०८१/०१/१५") // { year: 2081, month: 1, day: 15 }
 * parseBs("2081.1.5")    // { year: 2081, month: 1, day: 5 }
 *
 * @throws RangeError when the string is malformed or the date is invalid.
 */

import { toAsciiDigits } from "./constants.js";
import { daysInBsMonth, FIRST_BS_YEAR, LAST_BS_YEAR } from "./data.js";
import type { BsDate } from "./types.js";

const PARSE_RE = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/;

export function parseBs(input: string): BsDate {
  if (typeof input !== "string") {
    throw new TypeError("parseBs: input must be a string");
  }
  const ascii = toAsciiDigits(input).trim();
  const m = PARSE_RE.exec(ascii);
  if (!m) {
    throw new RangeError(
      `parseBs: cannot parse "${input}" — expected YYYY-MM-DD (also accepts / or . separators)`,
    );
  }
  const year = parseInt(m[1]!, 10);
  const month = parseInt(m[2]!, 10);
  const day = parseInt(m[3]!, 10);
  if (year < FIRST_BS_YEAR || year > LAST_BS_YEAR) {
    throw new RangeError(
      `parseBs: BS year ${year} is outside supported range [${FIRST_BS_YEAR}, ${LAST_BS_YEAR}]`,
    );
  }
  if (month < 1 || month > 12) {
    throw new RangeError(`parseBs: BS month ${month} must be 1..12`);
  }
  const dim = daysInBsMonth(year, month);
  if (day < 1 || day > dim) {
    throw new RangeError(
      `parseBs: BS day ${day} is invalid for ${year}-${month} (1..${dim})`,
    );
  }
  return { year, month, day };
}
