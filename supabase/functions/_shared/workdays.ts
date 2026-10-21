// Italian working-day helpers (dates as YYYY-MM-DD strings, calendar-only).

const pad = (n: number) => String(n).padStart(2, "0");
export const ymd = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const parse = (s: string) => new Date(`${s}T12:00:00Z`);

export function easterSunday(year: number): string {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function italianHolidays(year: number): Set<string> {
  const fixed = ["01-01", "01-06", "04-25", "05-01", "06-02", "08-15", "11-01", "12-08", "12-25", "12-26"];
  const set = new Set(fixed.map((md) => `${year}-${md}`));
  const easter = parse(easterSunday(year));
  easter.setUTCDate(easter.getUTCDate() + 1);
  set.add(ymd(easter)); // Pasquetta
  return set;
}

export function isWorkingDay(date: string, opts = { weekdaysOnly: true, skipHolidays: true }): boolean {
  const d = parse(date);
  const dow = d.getUTCDay();
  if (opts.weekdaysOnly && (dow === 0 || dow === 6)) return false;
  if (opts.skipHolidays && italianHolidays(d.getUTCFullYear()).has(date)) return false;
  return true;
}

export function addWorkingDays(date: string, n: number): string {
  const d = parse(date);
  let added = 0;
  while (added < n) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (isWorkingDay(ymd(d))) added++;
  }
  return ymd(d);
}

/** Current date and HH:MM in a timezone. */
export function nowInTz(tz: string, now = new Date()): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(now);
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  const hour = g("hour") === "24" ? "00" : g("hour");
  return { date: `${g("year")}-${g("month")}-${g("day")}`, time: `${hour}:${g("minute")}` };
}

/** How many new first emails can go out today given follow-ups already planned. */
export function remainingSlots(dailyLimit: number, alreadySentToday: number, followUpsDue: number) {
  const left = Math.max(0, dailyLimit - alreadySentToday);
  const followUps = Math.min(left, followUpsDue);
  return { followUps, firstEmails: left - followUps };
}

export function greeting(name?: string | null) {
  const n = (name || "").trim();
  return n ? `Buongiorno ${n},` : "Buongiorno,";
}
