/**
 * Standalone bounds helpers (start/end of month/year). For the day and week
 * variants see {@link comparisons}.
 */

import { NepaliDate } from "./nepali-date.js";

export function startOfMonth(date: NepaliDate): NepaliDate {
  return date.startOfMonth();
}
export function endOfMonth(date: NepaliDate): NepaliDate {
  return date.endOfMonth();
}
export function startOfYear(date: NepaliDate): NepaliDate {
  return date.startOfYear();
}
export function endOfYear(date: NepaliDate): NepaliDate {
  return date.endOfYear();
}
