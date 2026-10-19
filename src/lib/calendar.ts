export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

export const WEEKDAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export interface CalendarDay {
  year: number;
  month: number; // 1-12
  day: number;
  inMonth: boolean;
  weekdayIndex: number; // 0 = Mon ... 6 = Sun
}

/** Days in a 1-indexed month (handles leap years). */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Weekday of the 1st of the month, Monday-first (0 = Mon ... 6 = Sun). */
export function getFirstWeekdayIndex(year: number, month: number): number {
  return (new Date(year, month - 1, 1).getDay() + 6) % 7;
}

/** Returns 1-indexed month/year shifted by `delta` months (handles Dec/Jan rollover). */
export function shiftMonth(year: number, month: number, delta: number) {
  const d = new Date(year, month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

/** Builds whole Monday-first weeks (35 or 42 cells) including adjacent-month padding days. */
export function buildMonthWeeks(year: number, month: number): CalendarDay[][] {
  const lead = getFirstWeekdayIndex(year, month);
  const total = getDaysInMonth(year, month);
  const cellCount = Math.ceil((lead + total) / 7) * 7;
  const cells: CalendarDay[] = [];

  for (let i = 0; i < cellCount; i++) {
    // Date handles negative / overflow day numbers, so padding days and year changes are exact.
    const d = new Date(year, month - 1, 1 - lead + i);
    cells.push({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      inMonth: d.getMonth() + 1 === month && d.getFullYear() === year,
      weekdayIndex: i % 7,
    });
  }

  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function dateKey(year: number, month: number, day: number): string {
  return `${year}-${month}-${day}`;
}

/** Parses "09:30 AM" into minutes since midnight for sorting; unknown formats sort last. */
export function timeToMinutes(time: string): number {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time.trim());
  if (!m) return Number.MAX_SAFE_INTEGER;
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === "PM") h += 12;
  return h * 60 + Number(m[2]);
}

export function formatLongDate(year: number, month: number, day: number): string {
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
