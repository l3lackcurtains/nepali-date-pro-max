/**
 * Bikram Sambat (BS) calendar data — days in each month for every supported BS year.
 *
 * Each entry is `[m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, totalDays]`
 * where m1=Baishakh, m2=Jestha, m3=Ashadh, m4=Shrawan, m5=Bhadra, m6=Ashwin,
 * m7=Kartik, m8=Mangsir, m9=Poush, m10=Magh, m11=Falgun, m12=Chaitra.
 *
 * Range: BS 1975 → 2099 (125 years), corresponding to roughly
 *        AD 1918-04-13 → 2043-04-13.
 *
 * The BS calendar is set astronomically by the Nepali calendar committee, so
 * this is a hand-curated lookup table. Verified by round-trip tests across
 * the entire range plus well-known reference dates (Nepal New Year,
 * Republic Day, Constitution Day, etc.).
 */

export const FIRST_BS_YEAR = 1975;
export const LAST_BS_YEAR = 2099;

/** AD anchor: BS 1975-01-01 = AD 1918-04-13 (Saturday). */
export const ANCHOR_AD_YEAR = 1918;
export const ANCHOR_AD_MONTH = 4; // April (1-indexed)
export const ANCHOR_AD_DAY = 13;
export const ANCHOR_WEEKDAY = 6; // Saturday (0=Sunday … 6=Saturday)

const Y: number[][] = [];
Y[1975] = [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30, 365];
Y[1976] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31, 366];
Y[1977] = [30, 32, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31, 365];
Y[1978] = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30, 365];
Y[1979] = Y[1975]!;
Y[1980] = Y[1976]!;
Y[1981] = [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31, 365];
Y[1982] = Y[1978]!;
Y[1983] = Y[1975]!;
Y[1984] = Y[1976]!;
Y[1985] = [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30, 365];
Y[1986] = Y[1978]!;
Y[1987] = [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30, 365];
Y[1988] = Y[1976]!;
Y[1989] = [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30, 365];
Y[1990] = Y[1978]!;
Y[1991] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30, 365];
Y[1992] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31, 366];
Y[1993] = Y[1989]!;
Y[1994] = Y[1978]!;
Y[1995] = Y[1991]!;
Y[1996] = Y[1992]!;
Y[1997] = Y[1978]!;
Y[1998] = [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30, 365];
Y[1999] = Y[1976]!;
Y[2000] = [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31, 365];
Y[2001] = Y[1978]!;
Y[2002] = Y[1975]!;
Y[2003] = Y[1976]!;
Y[2004] = Y[2000]!;
Y[2005] = Y[1978]!;
Y[2006] = Y[1975]!;
Y[2007] = Y[1976]!;
Y[2008] = Y[1981]!;
Y[2009] = Y[1978]!;
Y[2010] = Y[1975]!;
Y[2011] = Y[1976]!;
Y[2012] = Y[1985]!;
Y[2013] = Y[1978]!;
Y[2014] = Y[1975]!;
Y[2015] = Y[1976]!;
Y[2016] = Y[1985]!;
Y[2017] = Y[1978]!;
Y[2018] = Y[1987]!;
Y[2019] = Y[1992]!;
Y[2020] = Y[1989]!;
Y[2021] = Y[1978]!;
Y[2022] = Y[1991]!;
Y[2023] = Y[1992]!;
Y[2024] = Y[1989]!;
Y[2025] = Y[1978]!;
Y[2026] = Y[1976]!;
Y[2027] = Y[2000]!;
Y[2028] = Y[1978]!;
Y[2029] = Y[1998]!;
Y[2030] = Y[1976]!;
Y[2031] = Y[2000]!;
Y[2032] = Y[1978]!;
Y[2033] = Y[1975]!;
Y[2034] = Y[1976]!;
Y[2035] = Y[1977]!;
Y[2036] = Y[1978]!;
Y[2037] = Y[1975]!;
Y[2038] = Y[1976]!;
Y[2039] = Y[1985]!;
Y[2040] = Y[1978]!;
Y[2041] = Y[1975]!;
Y[2042] = Y[1976]!;
Y[2043] = Y[1985]!;
Y[2044] = Y[1978]!;
Y[2045] = Y[1987]!;
Y[2046] = Y[1976]!;
Y[2047] = Y[1989]!;
Y[2048] = Y[1978]!;
Y[2049] = Y[1991]!;
Y[2050] = Y[1992]!;
Y[2051] = Y[1989]!;
Y[2052] = Y[1978]!;
Y[2053] = Y[1991]!;
Y[2054] = Y[1992]!;
Y[2055] = Y[1978]!;
Y[2056] = Y[1998]!;
Y[2057] = Y[1976]!;
Y[2058] = Y[2000]!;
Y[2059] = Y[1978]!;
Y[2060] = Y[1975]!;
Y[2061] = Y[1976]!;
Y[2062] = [30, 32, 31, 32, 31, 31, 29, 30, 29, 30, 29, 31, 365];
Y[2063] = Y[1978]!;
Y[2064] = Y[1975]!;
Y[2065] = Y[1976]!;
Y[2066] = Y[1981]!;
Y[2067] = Y[1978]!;
Y[2068] = Y[1975]!;
Y[2069] = Y[1976]!;
Y[2070] = Y[1985]!;
Y[2071] = Y[1978]!;
Y[2072] = Y[1987]!;
Y[2073] = Y[1976]!;
Y[2074] = Y[1989]!;
Y[2075] = Y[1978]!;
Y[2076] = Y[1991]!;
Y[2077] = Y[1992]!;
Y[2078] = Y[1989]!;
Y[2079] = Y[1978]!;
Y[2080] = Y[1991]!;
Y[2081] = Y[1992]!;
Y[2082] = Y[1978]!;
Y[2083] = Y[1978]!;
Y[2084] = Y[1976]!;
Y[2085] = Y[2000]!;
Y[2086] = Y[1978]!;
Y[2087] = Y[1975]!;
Y[2088] = Y[1976]!;
Y[2089] = Y[2000]!;
Y[2090] = Y[1978]!;
Y[2091] = Y[1975]!;
Y[2092] = Y[1976]!;
Y[2093] = Y[1981]!;
Y[2094] = Y[1978]!;
Y[2095] = Y[1975]!;
Y[2096] = Y[1976]!;
Y[2097] = Y[1985]!;
Y[2098] = Y[1978]!;
Y[2099] = Y[1975]!;

export const BS_YEAR_DATA: readonly (readonly number[])[] = Y;

/**
 * Days in a given BS month. Month is 1-indexed (1=Baishakh … 12=Chaitra).
 * @throws if year is outside [FIRST_BS_YEAR, LAST_BS_YEAR] or month is not 1..12.
 */
export function daysInBsMonth(year: number, month: number): number {
  if (year < FIRST_BS_YEAR || year > LAST_BS_YEAR) {
    throw new RangeError(
      `BS year ${year} is outside supported range [${FIRST_BS_YEAR}, ${LAST_BS_YEAR}]`,
    );
  }
  if (month < 1 || month > 12 || !Number.isInteger(month)) {
    throw new RangeError(`BS month ${month} is invalid (must be integer 1..12)`);
  }
  const row = BS_YEAR_DATA[year];
  if (!row) {
    throw new RangeError(`No calendar data for BS year ${year}`);
  }
  return row[month - 1]!;
}

/** Total days in a BS year. */
export function daysInBsYear(year: number): number {
  if (year < FIRST_BS_YEAR || year > LAST_BS_YEAR) {
    throw new RangeError(
      `BS year ${year} is outside supported range [${FIRST_BS_YEAR}, ${LAST_BS_YEAR}]`,
    );
  }
  const row = BS_YEAR_DATA[year];
  if (!row) {
    throw new RangeError(`No calendar data for BS year ${year}`);
  }
  return row[12]!;
}

/** True when the given BS year has 366 days (the "leap" year, not a Gregorian-style rule). */
export function isBsLeapYear(year: number): boolean {
  return daysInBsYear(year) === 366;
}
