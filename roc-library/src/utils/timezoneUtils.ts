/**
 * Timezone Utilities
 * All functions return dates in GMT+7 (Asia/Bangkok) timezone
 */

// Timezone offset in hours (GMT+7 for Thailand)
const THAILAND_TIMEZONE_OFFSET = 7;
const THAILAND_TIMEZONE = "Asia/Bangkok";

export const getThaiDateParts = (date: Date) => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: THAILAND_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value ?? 0);
  const month = Number(parts.find((part) => part.type === "month")?.value ?? 0);
  const day = Number(parts.find((part) => part.type === "day")?.value ?? 0);

  return { year, month, day };
};

/**
 * Get current time in GMT+7 (Thailand timezone)
 * Use this instead of `new Date()` when you need Thai time
 */
export const getCurrentThaiTime = (): Date => {
  const utcTime = new Date();
  const offset = THAILAND_TIMEZONE_OFFSET * 60 * 60 * 1000; // Convert to milliseconds
  return new Date(utcTime.getTime() + offset);
};

/**
 * Create a date in GMT+7 timezone
 * @param year - Full year (e.g., 2026)
 * @param month - Month (0-11, where 0 = January)
 * @param date - Day of month
 * @param hours - Hours (0-23)
 * @param minutes - Minutes (0-59)
 * @param seconds - Seconds (0-59)
 */
export const createThaiDate = (
  year: number,
  month: number,
  date: number,
  hours: number = 0,
  minutes: number = 0,
  seconds: number = 0
): Date => {
  const utcDate = new Date(Date.UTC(year, month, date, hours, minutes, seconds));
  const offset = THAILAND_TIMEZONE_OFFSET * 60 * 60 * 1000;
  return new Date(utcDate.getTime() + offset);
};

/**
 * Format date to readable Thai time string
 */
export const formatThaiTime = (date: Date): string => {
  return date.toLocaleString('th-TH', {
    timeZone: THAILAND_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * Convert any date to a date-only UTC value based on Thailand calendar day.
 * Useful for remaining-day calculations that must follow Thai local date.
 */
export const toThaiDateOnly = (date: Date): Date => {
  const { year, month, day } = getThaiDateParts(date);
  return new Date(Date.UTC(year, month - 1, day));
};

/**
 * Check whether today falls within a date range using Thailand calendar day.
 */
export const isWithinThaiDateRange = (
  target: Date,
  start: Date,
  end: Date,
): boolean => {
  const targetDate = toThaiDateOnly(target).getTime();
  const startDate = toThaiDateOnly(start).getTime();
  const endDate = toThaiDateOnly(end).getTime();

  return targetDate >= startDate && targetDate <= endDate;
};
