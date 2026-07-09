## Obiettivo
1. Rinominare "Operaio/Operai" in "Posatore/Posatori" in tutta l'app lato utente (label UI, titoli, testi). I ruoli tecnici nel DB (`operaio`, `ibrido`) restano invariati per non rompere policy/RLS.
2. Aggiungere un sistema di **timbratura giornaliera con geolocalizzazione** nella home del Posatore (sia "operaio" che "ibrido/commerciale"), con export mensile per lo studio paghe.

---

## 1. Rinomina Operaio → Posatore (solo UI)

Sostituzioni testuali in:
- `src/pages/role-app/OperaioApp.tsx` (titolo "Operaio" → "Posatore", nav "Cantieri" resta)
- `src/pages/role-app/IbridoApp.tsx` (badge "Operaio · Commerciale" → "Posatore · Commerciale")
- Componenti admin che mostrano la label del ruolo "operaio" all'utente finale (badge, select) → mostrare "Posatore".
- Nomi file/route/tabelle DB **non toccati**.

## 2. Timbrature giornaliere con GPS

### Nuova tabella `worker_time_entries`
Campi principali (oltre a id/created_at/updated_at):
- `user_id uuid` (auth.users)
- `worker_id uuid` (workers, nullable)
- `event_type text` — enum-like: `start_home` (partenza da casa), `arrive_site` (arrivo cantiere), `pause_start`, `pause_end`, `leave_site` (uscita cantiere), `arrive_home` (arrivo a casa)
- `event_at timestamptz default now()`
- `latitude numeric`, `longitude numeric`, `accuracy_m numeric`
- `site_id uuid` nullable (cantiere di riferimento se conosciuto)
- `distance_from_site_m numeric` nullable (calcolato se site_id presente)
- `is_at_site boolean` nullable (true se entro raggio ~150m)
- `notes text`

RLS: il posatore vede/inserisce solo i propri record; admin vede tutto. Grant a `authenticated` e `service_role`.

### Nuova view/logica calcolo ore giornaliere
Vista `worker_daily_hours` che aggrega per `user_id + date`:
- ora inizio = primo `start_home` del giorno
- ora fine = ultimo `arrive_home`
- pausa = somma intervalli `pause_start`→`pause_end`
- ore lavorate = (fine - inizio) - pausa
- ore in cantiere = somma intervalli `arrive_site`→(pause o leave_site)

### UI Home Posatore (`OperaioHome` e `CommercialeHome`)
Nuova card **"Timbratura di oggi"** in cima:
- Mostra sequenza eventi già timbrati con orario + icona ✅/📍 se al cantiere.
- Un unico bottone grande contestuale che mostra il **prossimo step logico**:
  - stato iniziale → "🚐 Parto da casa"
  - dopo start_home → "📍 Arrivato in cantiere"
  - dopo arrive_site → "☕ Inizio pausa" + "🚪 Esco dal cantiere"
  - dopo pause_start → "▶️ Fine pausa"
  - dopo pause_end → "☕ Inizio pausa" + "🚪 Esco dal cantiere"
  - dopo leave_site → "🏠 Arrivato a casa"
  - dopo arrive_home → giornata chiusa, riepilogo ore
- Al click: richiede GPS (`navigator.geolocation`), inserisce riga in `worker_time_entries`. Se GPS negato: salva senza coordinate ma mostra warning.
- Se `event_type` in [`arrive_site`, `pause_*`, `leave_site`] e c'è un cantiere assegnato oggi, calcola distanza haversine (già in `src/lib/geo.ts`) e salva `distance_from_site_m` + `is_at_site` (≤150m).

### Admin: nuova pagina `/admin/timbrature`
Tabella filtrabile per posatore + mese con:
- riga per giorno: ore totali, ore in cantiere, timestamp eventi, mappa mini
- badge rosso se un `arrive_site` è stato timbrato lontano dal cantiere assegnato
- **Export CSV mensile** per studio paghe (colonne: data, posatore, ora inizio, ora fine, pausa min, ore totali, note)
- Link nel sidebar admin.

---

## Dettagli tecnici

**File nuovi**
- `supabase/migrations/*_worker_time_entries.sql` (tabella + RLS + grants + funzione `calc_daily_hours`)
- `src/components/role-app/TimbratureCard.tsx` (UI timbratura riutilizzabile)
- `src/lib/timbrature.ts` (helper: nextStep, insertEvent con GPS, aggregazione giornaliera)
- `src/pages/admin/AdminTimbrature.tsx` (dashboard + export CSV)

**File modificati**
- `src/pages/role-app/OperaioApp.tsx` — label "Posatore" + montaggio `<TimbratureCard/>` in home
- `src/pages/role-app/CommercialeHome.tsx` + `IbridoApp.tsx` — label "Posatore · Commerciale" + `<TimbratureCard/>`
- `src/components/admin/AdminSidebar.tsx` — voce "Timbrature"
- `src/App.tsx` — route admin
- Altri punti UI che mostrano "Operaio/Operai" agli utenti → "Posatore/Posatori"

**Note**
- I ruoli DB (`user_roles.role = 'operaio'`) restano invariati; cambia solo l'etichetta mostrata.
- Coordinate salvate ad ogni click per verifica anti-frode ("era davvero in cantiere?").
- Export CSV via `blob` lato client, nessuna edge function necessaria.
