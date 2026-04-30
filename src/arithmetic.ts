/**
 * Standalone arithmetic helpers — date-fns-style functional wrappers around
 * the immutable methods on `NepaliDate`. Each takes a `NepaliDate` plus an
 * amount and returns a NEW `NepaliDate`.
 *
 * @example
 * import { addDays, subMonths } from "nepali-date-pro-max";
 * addDays(d, 7);
 * subMonths(d, 3);
 */

import { NepaliDate } from "./nepali-date.js";

export function addDays(date: NepaliDate, n: number): NepaliDate {
  return date.addDays(n);
}
export function subDays(date: NepaliDate, n: number): NepaliDate {
  return date.addDays(-n);
}

export function addMonths(date: NepaliDate, n: number): NepaliDate {
  return date.addMonths(n);
}
export function subMonths(date: NepaliDate, n: number): NepaliDate {
  return date.addMonths(-n);
}

export function addYears(date: NepaliDate, n: number): NepaliDate {
  return date.addYears(n);
}
export function subYears(date: NepaliDate, n: number): NepaliDate {
  return date.addYears(-n);
}

export function addHours(date: NepaliDate, n: number): NepaliDate {
  return date.addHours(n);
}
export function subHours(date: NepaliDate, n: number): NepaliDate {
  return date.addHours(-n);
}

export function addMinutes(date: NepaliDate, n: number): NepaliDate {
  return date.addMinutes(n);
}
export function subMinutes(date: NepaliDate, n: number): NepaliDate {
  return date.addMinutes(-n);
}

export function addSeconds(date: NepaliDate, n: number): NepaliDate {
  return date.addSeconds(n);
}
export function subSeconds(date: NepaliDate, n: number): NepaliDate {
  return date.addSeconds(-n);
}

export function addMilliseconds(date: NepaliDate, n: number): NepaliDate {
  return date.addMilliseconds(n);
}
export function subMilliseconds(date: NepaliDate, n: number): NepaliDate {
  return date.addMilliseconds(-n);
}
