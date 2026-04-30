/**
 * Aggregate utilities — `min`, `max`, `clamp`, `closestTo`, `closestIndexTo`.
 * date-fns-style.
 */

import { NepaliDate } from "./nepali-date.js";

/** Earliest of the given `NepaliDate`s. Returns `undefined` for an empty array. */
export function min(dates: readonly NepaliDate[]): NepaliDate | undefined {
  if (dates.length === 0) return undefined;
  let best = dates[0]!;
  for (let i = 1; i < dates.length; i++) {
    if (dates[i]!.isBefore(best)) best = dates[i]!;
  }
  return best;
}

/** Latest of the given `NepaliDate`s. Returns `undefined` for an empty array. */
export function max(dates: readonly NepaliDate[]): NepaliDate | undefined {
  if (dates.length === 0) return undefined;
  let best = dates[0]!;
  for (let i = 1; i < dates.length; i++) {
    if (dates[i]!.isAfter(best)) best = dates[i]!;
  }
  return best;
}

/**
 * Clamp `date` to the inclusive `[start, end]` interval.
 * Returns `start` if `date < start`, `end` if `date > end`, otherwise `date`.
 */
export function clamp(
  date: NepaliDate,
  interval: { start: NepaliDate; end: NepaliDate },
): NepaliDate {
  if (interval.start.isAfter(interval.end)) {
    throw new RangeError("clamp: interval start is after end");
  }
  if (date.isBefore(interval.start)) return interval.start;
  if (date.isAfter(interval.end)) return interval.end;
  return date;
}

/** Returns the date in `candidates` closest to `target`. `undefined` if empty. */
export function closestTo(
  target: NepaliDate,
  candidates: readonly NepaliDate[],
): NepaliDate | undefined {
  const idx = closestIndexTo(target, candidates);
  return idx === undefined ? undefined : candidates[idx];
}

/** Returns the index of the closest date in `candidates`. */
export function closestIndexTo(
  target: NepaliDate,
  candidates: readonly NepaliDate[],
): number | undefined {
  if (candidates.length === 0) return undefined;
  let bestIdx = 0;
  let bestDiff = Math.abs(target.diffDays(candidates[0]!));
  for (let i = 1; i < candidates.length; i++) {
    const diff = Math.abs(target.diffDays(candidates[i]!));
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIdx = i;
    }
  }
  return bestIdx;
}

/** True if `date` is a valid `NepaliDate` instance. */
export function isValid(date: unknown): date is NepaliDate {
  return date instanceof NepaliDate;
}
