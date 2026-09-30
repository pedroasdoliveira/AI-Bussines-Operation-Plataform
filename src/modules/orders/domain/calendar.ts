const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;

export function businessToday(now: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function addCalendarDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const utc = new Date(Date.UTC(year!, (month ?? 1) - 1, day));
  utc.setUTCDate(utc.getUTCDate() + days);
  return utc.toISOString().slice(0, 10);
}

export function calendarDaysBetween(earlierIso: string, laterIso: string): number {
  const earlier = Date.parse(`${earlierIso}T00:00:00.000Z`);
  const later = Date.parse(`${laterIso}T00:00:00.000Z`);
  return Math.round((later - earlier) / DAY_MS);
}

export function zonedDateTimeToUtc(
  isoDate: string,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  const utcGuess = new Date(Date.UTC(year!, (month ?? 1) - 1, day, hour, minute, 0));
  const offset = zoneOffsetMs(utcGuess, timeZone);
  const instant = new Date(utcGuess.getTime() - offset);
  const corrected = zoneOffsetMs(instant, timeZone);
  if (corrected !== offset) return new Date(utcGuess.getTime() - corrected);
  return instant;
}

export function hoursBetween(earlier: Date, later: Date): number {
  return (later.getTime() - earlier.getTime()) / HOUR_MS;
}

export function addHours(instant: Date, hours: number): Date {
  return new Date(instant.getTime() + hours * HOUR_MS);
}

function zoneOffsetMs(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const asUtc = Date.UTC(
    Number(value.year),
    Number(value.month) - 1,
    Number(value.day),
    Number(value.hour),
    Number(value.minute),
    Number(value.second),
  );
  return asUtc - date.getTime();
}
