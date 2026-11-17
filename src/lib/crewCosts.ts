// Costi squadra e trasferta: costo operaio, gasolio, Telepass, pasti, albergo.
export interface CrewSettings {
  origin: string;
  net_salary: number; taxes: number; cape: number; other_f24: number; work_days_month: number;
  fuel_l_100km: number; fuel_price: number;
  lunch: number; hotel: number; dinner: number;
  trasferta_km: number; reference_daily: number;
  toll_eur_km: number;
  van_eur_km?: number; // usura furgone €/km (gomme, tagliandi, svalutazione, assicurazione, bollo)
}

export const DEFAULT_CREW_SETTINGS: CrewSettings = {
  origin: "Alzano Lombardo (BG)",
  net_salary: 2000, taxes: 1297, cape: 300, other_f24: 400, work_days_month: 22,
  fuel_l_100km: 10, fuel_price: 1.75, lunch: 15, hotel: 80, dinner: 25,
  trasferta_km: 150, reference_daily: 300, toll_eur_km: 0.10, van_eur_km: 0.30,
};

export interface CrewTrip {
  enabled?: boolean;
  destination?: string;
  kmOneWay?: number;
  minutesOneWay?: number;
  tollOneWay?: number;
  days?: number;
  workers?: number;
  vans?: number;
  trasferta?: "auto" | "on" | "off";
  nights?: number | null; // null = giorni − 1
  workerDayOverride?: number | null;
  tripsOverride?: number | null; // viaggi A/R totali in trasferta
  localKmDay?: number | null; // km al giorno sul posto (albergo ↔ cantiere) in trasferta
  vanEurKm?: number | null; // override €/km furgone
  startDate?: string | null; // YYYY-MM-DD: costo operaio sui giorni lavorativi reali del mese
}

const n = (v: unknown) => Number(v) || 0;

export const workerMonthlyCost = (s: CrewSettings) => n(s.net_salary) + n(s.taxes) + n(s.cape) + n(s.other_f24);
const pad = (v: number) => String(v).padStart(2, "0");
function easter(y: number) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  return new Date(Date.UTC(y, Math.floor((h + l - 7 * m + 114) / 31) - 1, ((h + l - 7 * m + 114) % 31) + 1));
}
const iso = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
export function isItalianWorkingDay(date: string) {
  const d = new Date(`${date}T12:00:00Z`), dow = d.getUTCDay();
  if (dow === 0 || dow === 6) return false;
  const y = d.getUTCFullYear();
  const fixed = ["01-01", "01-06", "04-25", "05-01", "06-02", "08-15", "11-01", "12-08", "12-25", "12-26"].map((md) => `${y}-${md}`);
  const pq = easter(y); pq.setUTCDate(pq.getUTCDate() + 1);
  return !fixed.includes(date) && iso(pq) !== date;
}
/** Giorni lavorativi (lun–ven, senza festività italiane) del mese. month 1–12 */
export function workingDaysInMonth(year: number, month: number) {
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  let c = 0;
  for (let d = 1; d <= last; d++) if (isItalianWorkingDay(`${year}-${pad(month)}-${pad(d)}`)) c++;
  return c;
}
/** Le prossime `count` giornate lavorative a partire da `start` (incluso). */
export function nextWorkingDays(start: string, count: number) {
  const out: string[] = []; const d = new Date(`${start}T12:00:00Z`);
  while (out.length < count) { const k = iso(d); if (isItalianWorkingDay(k)) out.push(k); d.setUTCDate(d.getUTCDate() + 1); }
  return out;
}
/** Costo giornaliero operaio: costo mensile / giorni lavorativi reali del mese (se data nota), altrimenti media impostata. */
export const workerDailyCost = (s: CrewSettings, date?: string | null) => {
  if (date) { const [y, m] = date.split("-").map(Number); const wd = workingDaysInMonth(y, m); if (wd > 0) return workerMonthlyCost(s) / wd; }
  return n(s.work_days_month) > 0 ? workerMonthlyCost(s) / n(s.work_days_month) : 0;
};

export function computeCrew(trip: CrewTrip, s: CrewSettings) {
  const days = Math.max(0, n(trip.days));
  const workers = Math.max(0, n(trip.workers ?? 1));
  const vans = Math.max(0, n(trip.vans ?? 1));
  const kmAR = n(trip.kmOneWay) * 2;
  const tollAR = n(trip.tollOneWay) * 2;
  const isTrasferta = trip.trasferta === "on" || (trip.trasferta !== "off" && n(trip.kmOneWay) > 0 && n(trip.kmOneWay) >= n(s.trasferta_km));
  const nights = isTrasferta ? (trip.nights != null ? Math.max(0, n(trip.nights)) : Math.max(0, days - 1)) : 0;
  const trips = days === 0 ? 0 : isTrasferta ? (trip.tripsOverride != null ? Math.max(0, n(trip.tripsOverride)) : 1) : days;
  const localKm = isTrasferta ? (trip.localKmDay != null ? n(trip.localKmDay) : 20) * days : 0;
  const dates = trip.startDate && days > 0 ? nextWorkingDays(trip.startDate, days) : [];
  const dayRates = Array.from({ length: days }, (_, i) => trip.workerDayOverride != null ? n(trip.workerDayOverride) : workerDailyCost(s, dates[i]));
  const labor = dayRates.reduce((a, r) => a + r, 0) * workers;
  const workerDay = days > 0 ? labor / (workers * days || 1) : workerDailyCost(s);
  const vanEurKm = trip.vanEurKm != null ? n(trip.vanEurKm) : n(s.van_eur_km ?? 0.3);
  const totalKm = (kmAR * trips + localKm) * vans;
  const van = totalKm * vanEurKm;
  const fuelPerTrip = kmAR * n(s.fuel_l_100km) / 100 * n(s.fuel_price);
  const fuel = (fuelPerTrip * trips + localKm * n(s.fuel_l_100km) / 100 * n(s.fuel_price)) * vans;
  const tolls = tollAR * vans * trips;
  const meals = n(s.lunch) * workers * days + n(s.dinner) * workers * nights;
  const hotel = n(s.hotel) * workers * nights;
  const total = labor + fuel + tolls + meals + hotel + van;
  const perDay = days > 0 ? total / days : 0;
  const perWorkerDay = days > 0 && workers > 0 ? total / (days * workers) : 0;
  return { dates, dayRates, totalKm, vanEurKm, van, days, workers, vans, kmAR, tollAR, isTrasferta, nights, trips, localKm, workerDay, labor, fuel, tolls, meals, hotel, total, perDay, perWorkerDay };
}

/** Ripartisce la stima in righe giornaliere (per il registro cantiere). */
export function splitDaily(c: ReturnType<typeof computeCrew>) {
  const d = c.days || 1;
  return { labor: c.labor / d, fuel: c.fuel / d, tolls: c.tolls / d, meals: c.meals / d, hotel: c.hotel / d, van: c.van / d };
}
