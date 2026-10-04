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
  fallbackYear: number = new Date().getFullYear() + 1
): number {
  if (!validityPeriod) return fallbackYear;

  // Look for 4-digit years between 2020 and 2050 (e.g. 2026, 2027, 2028, etc.)
  const matches = validityPeriod.match(/\b(20[2-5][0-9])\b/g);
  if (matches && matches.length > 0) {
    // If multiple years found (e.g. "2026-2027"), the expire year is the latest / highest one
    const years = matches.map(m => parseInt(m, 10));
    return Math.max(...years);
  }

  // Common duration phrases
  if (/\b1\s*(year|yr|နှစ်)\b/i.test(validityPeriod)) {
    return new Date().getFullYear() + 1;
  }
  if (/\b2\s*(years|yrs)\b/i.test(validityPeriod)) {
    return new Date().getFullYear() + 2;
  }

  return fallbackYear;
}
