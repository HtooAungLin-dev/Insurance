/**
 * Helper to extract the expiration year from a validity period string.
 * Examples:
 * - "2026-2027" -> 2027
 * - "Jan 2026 to Dec 2027" -> 2027
 * - "31/12/2027" -> 2027
 * - "2028" -> 2028
 * - "1 Year" -> next year
 */
export function extractExpireYear(
  validityPeriod: string = '',
  fallbackYear: number = 2027
): number {
  if (!validityPeriod) return fallbackYear;

  // Look for 4-digit years between 2020 and 2050 (e.g. 2026, 2027, 2028, etc.)
  const matches = validityPeriod.match(/\b(20[2-5][0-9])\b/g);
  if (matches && matches.length > 0) {
    const years = matches.map(m => parseInt(m, 10));
    const maxYear = Math.max(...years);

    // If only one year is found and duration "1 Year" is specified (e.g. "2026-10-11 - 1 Year"),
    // then expiration year is start year + 1
    if (years.length === 1 && /\b1\s*(year|yr|နှစ်)\b/i.test(validityPeriod)) {
      return maxYear + 1;
    }
    if (years.length === 1 && /\b2\s*(years|yrs)\b/i.test(validityPeriod)) {
      return maxYear + 2;
    }

    return maxYear;
  }

  // Common duration phrases without explicit year
  if (/\b1\s*(year|yr|နှစ်)\b/i.test(validityPeriod)) {
    return fallbackYear;
  }
  if (/\b2\s*(years|yrs)\b/i.test(validityPeriod)) {
    return fallbackYear + 1;
  }

  return fallbackYear;
}
