// Costi squadra e trasferta: costo operaio, gasolio, Telepass, pasti, albergo.
export interface CrewSettings {
  origin: string;
  net_salary: number; taxes: number; cape: number; other_f24: number; work_days_month: number;
  fuel_l_100km: number; fuel_price: number;
  lunch: number; hotel: number; dinner: number;
  trasferta_km: number; reference_daily: number;
}

export const DEFAULT_CREW_SETTINGS: CrewSettings = {
  origin: "Alzano Lombardo (BG)",
  net_salary: 2000, taxes: 1297, cape: 300, other_f24: 400, work_days_month: 22,
  fuel_l_100km: 10, fuel_price: 1.75, lunch: 15, hotel: 80, dinner: 25,
  trasferta_km: 150, reference_daily: 300,
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
}

const n = (v: unknown) => Number(v) || 0;

export const workerMonthlyCost = (s: CrewSettings) => n(s.net_salary) + n(s.taxes) + n(s.cape) + n(s.other_f24);
export const workerDailyCost = (s: CrewSettings) => (n(s.work_days_month) > 0 ? workerMonthlyCost(s) / n(s.work_days_month) : 0);

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
  const workerDay = trip.workerDayOverride != null ? n(trip.workerDayOverride) : workerDailyCost(s);

  const labor = workerDay * workers * days;
  const fuelPerTrip = kmAR * n(s.fuel_l_100km) / 100 * n(s.fuel_price);
  const fuel = (fuelPerTrip * trips + localKm * n(s.fuel_l_100km) / 100 * n(s.fuel_price)) * vans;
  const tolls = tollAR * vans * trips;
  const meals = n(s.lunch) * workers * days + n(s.dinner) * workers * nights;
  const hotel = n(s.hotel) * workers * nights;
  const total = labor + fuel + tolls + meals + hotel;
  const perDay = days > 0 ? total / days : 0;
  const perWorkerDay = days > 0 && workers > 0 ? total / (days * workers) : 0;
  return { days, workers, vans, kmAR, tollAR, isTrasferta, nights, trips, localKm, workerDay, labor, fuel, tolls, meals, hotel, total, perDay, perWorkerDay };
}

/** Ripartisce la stima in righe giornaliere (per il registro cantiere). */
export function splitDaily(c: ReturnType<typeof computeCrew>) {
  const d = c.days || 1;
  return { labor: c.labor / d, fuel: c.fuel / d, tolls: c.tolls / d, meals: c.meals / d, hotel: c.hotel / d };
}
