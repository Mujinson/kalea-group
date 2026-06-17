# Planner Operativo Cantieri

Trasformo la card calendario statica della dashboard admin in un Planner Operativo completo con drag & drop, gestione squadre, conflitti, Gantt e KPI.

---

## 1) Database (una migrazione)

Nuove tabelle:

- **`crews`** — squadre operative
  - `name` (es. "Alpha"), `color` (hex per badge), `max_workers` (capienza), `lead_worker_id` (capocantiere), `notes`, `active`
- **`crew_members`** — operai dentro una squadra (associazione corrente, non storica)
  - `crew_id`, `worker_id`, `role` (capo/operaio), UNIQUE(worker_id) → un operaio in una sola squadra alla volta
- **`crew_assignments`** — assegnazione squadra → cantiere per intervallo di date
  - `crew_id`, `site_id`, `start_date`, `end_date`, `hours_per_day` (default 8), `notes`, `created_by`
  - Indici su (site_id, start_date), (crew_id, start_date)

Riuso esistenti:
- `construction_sites` ha già `priority`, `planned_start_date/end_date`, `estimated_hours`, `latitude/longitude`, status, ecc.
- `site_workers` rimane per assegnazioni storiche/dirette operaio-cantiere (compatibilità). Il planner lavora su squadre, ma può anche assegnare operai singoli tramite spostamento tra squadre.
- `workers` per anagrafica.

RLS: admin full access, commerciali/operai SELECT su crews e crew_assignments dei propri cantieri (pattern già in uso). GRANT a `authenticated` e `service_role`.

---

## 2) Pagina nuova: `AdminPlanner`

Nuova rotta `/admin/planner` (icona nel sidebar), e **la card calendario in dashboard diventa un widget di anteprima** che linka al planner.

Layout pagina:

```text
┌──────────────────────────────────────────────────────────┐
│ KPI BAR: Cantieri attivi · Operai oggi · Squadre libere  │
│          Cantieri in ritardo · Ore settimana · Saturaz.  │
├──────────────────────────────────────────────────────────┤
│ [Giorno|Settimana|Mese|Anno|Gantt|Carico] [< oggi >]     │
│ Filtri: Squadra ▾ Operaio ▾ Cliente ▾ Stato ▾ Priorità ▾ │
│         Zona ▾ Capocantiere ▾                            │
├──────────────────────────────────────────────────────────┤
│  AREA PLANNER (vista corrente)                           │
└──────────────────────────────────────────────────────────┘
```

### Viste

1. **Giorno** — colonne = cantieri attivi quel giorno; ogni colonna lista le squadre assegnate (card squadra droppabile)
2. **Settimana** — griglia 7 giorni × cantieri (riga); celle contengono badge squadra
3. **Mese** — griglia tipo calendario; ogni giorno mostra max 3 squadre+contatore
4. **Anno** — heatmap mensile con conteggio cantieri/giorno
5. **Gantt** — righe = cantieri, asse X = giorni; barre `crew_assignments` con resize/drag (sposta date, allunga durata)
6. **Carico squadre** — per ogni squadra: progress bar saturazione (ore settimana / capacità), n. cantieri attivi, giorni occupati, capacità residua

### Card cantiere (vista Giorno/Settimana)

```
📍 Piacenza                      🔴 Alta
🏠 Carla Romano
👥 Squadra Alpha (3)
   • Mario Rossi
   • Luca Bianchi  
   • Andrea Verdi
⏱ Scade tra 3 giorni · 📈 65%   🟡
```

Stato (Da iniziare/In corso/Pausa/Completato/Bloccato) come pill colorata top-right.
Click → drawer laterale con tab: Dettaglio · Chat · Foto · Documenti · Ore · Materiali · Attrezzatura. Pulsante "Apri pagina completa" naviga a `AdminCantiereDetail`.

### Drag & drop (dnd-kit)

Già in `package.json` controllo se presente, altrimenti `bun add @dnd-kit/core @dnd-kit/sortable`.

Casi gestiti:
- **Squadra tra giorni**: drag card squadra da giorno A → giorno B (Settimana/Mese) → update `crew_assignments.start_date/end_date` shift
- **Squadra tra cantieri**: drag card squadra da cantiere X → cantiere Y → cambia `site_id`
- **Più squadre stesso cantiere**: la card cantiere accetta più drop, mostra le squadre stackate
- **Operaio tra squadre**: drag chip operaio da Squadra Alpha → Squadra Beta → update `crew_members.crew_id` (e check unique)
- **Gantt resize**: handle ai bordi barra → aggiorna `start_date`/`end_date`

Ottimistico via React Query mutations + rollback su errore.

### Gestione conflitti

Calcolata client-side dopo ogni mutation, prima del commit:

| Conflitto | Severità | Check |
|---|---|---|
| Operaio in 2 cantieri stesso giorno | 🔴 | join crew_assignments overlap su giorno + crew_members |
| Squadra > max_workers | 🟡 | count crew_members > crews.max_workers |
| Cantiere non finirà entro deadline | 🟡 | ore_residue > ore_disponibili_dai_assignments fino a planned_end_date |
| Cantiere senza assegnazioni nei prossimi N giorni | 🔴 | nessun crew_assignment attivo |

Badge: 🟢/🟡/🔴 sulla card + toast warning + lista conflitti in pannello laterale.

### Automazioni intelligenti (pannello "Suggerimenti")

Calcolo client-side:
- Squadre senza assignment nei prossimi 7gg → "Disponibile"
- Operai senza crew → "Da assegnare"
- Cantieri in ritardo → propone squadra libera più vicina geograficamente (se lat/lng presenti)
- Sovraccarichi → segnala squadra > 100% saturazione

### Filtri rapidi

Stato globale via `useState` + `useMemo` filter su data fetched. Filtri: squadra (chip multi), operaio, cliente (lookup), stato cantiere, priorità, zona (regione/provincia da indirizzo cantiere), capocantiere.

### KPI bar (top)

Query React Query con `select count`:
- Cantieri attivi (status IN ...)
- Operai al lavoro oggi (distinct worker da crew_assignments oggi)
- Squadre libere oggi
- Cantieri in ritardo (planned_end_date < now AND status != completato)
- Ore totali settimana (sum hours_per_day × giorni assignment)
- Saturazione media squadre

---

## 3) File da creare

```
src/pages/admin/AdminPlanner.tsx                    # pagina principale + KPI + filtri + switch viste
src/components/admin/planner/PlannerDayView.tsx
src/components/admin/planner/PlannerWeekView.tsx
src/components/admin/planner/PlannerMonthView.tsx
src/components/admin/planner/PlannerYearView.tsx
src/components/admin/planner/PlannerGanttView.tsx
src/components/admin/planner/PlannerLoadView.tsx    # carico squadre
src/components/admin/planner/SiteCard.tsx           # card cantiere droppable
src/components/admin/planner/CrewChip.tsx           # squadra draggable
src/components/admin/planner/WorkerPill.tsx         # operaio draggable
src/components/admin/planner/SiteDetailDrawer.tsx   # drawer laterale (riusa parti AdminCantiereDetail)
src/components/admin/planner/PlannerFilters.tsx
src/components/admin/planner/PlannerKPIBar.tsx
src/components/admin/planner/ConflictsPanel.tsx
src/components/admin/planner/SuggestionsPanel.tsx
src/components/admin/planner/CrewManagerDialog.tsx  # crea/modifica squadre
src/lib/planner.ts                                  # helpers: overlap, conflicts, saturation, format scadenza
supabase/migrations/<new>.sql
```

File da modificare:
- `src/pages/admin/AdminOverview.tsx` — la card calendario diventa "Planner di settimana (anteprima)" con CTA "Apri Planner Operativo"
- `src/components/admin/AdminSidebar.tsx` — voce "Planner" con icona `CalendarRange`
- `src/App.tsx` — rotta `/admin/planner`

---

## 4) Cosa NON tocco

- Calendario operai (`AdminAppointments`, `OperaioCalendario`) — separato, resta com'è
- Pagine cantiere dettaglio — il drawer richiama dati esistenti
- RLS pattern già consolidato — replicato 1:1
- i18n — modulo admin è in italiano come oggi

---

## 5) Note tecniche

- DnD: `@dnd-kit/core` (mobile-friendly, accessibile) — se non installato lo aggiungo
- Date: `date-fns` (già usato altrove nel CRM)
- Gantt: implementazione custom con grid CSS (no librerie pesanti), barre assolute posizionate per giorno
- Realtime: opzionale fase 2 (subscribe a `crew_assignments`); per ora React Query refetch on mutation
- Performance: query con range filter per finestra visibile (es. ±1 mese)

Procedo con migrazione + codice?