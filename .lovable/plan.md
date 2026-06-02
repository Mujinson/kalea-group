
# Redesign CRM Kalea + Gestione Operai

Lavoro grande: lo divido in **2 fasi consegnabili**. Fase 1 = nuova Gestione Operai completa (CRUD + ore + assegnazioni + dashboard). Fase 2 = redesign trasversale UX/UI del CRM.

Confermami se procedo con **Fase 1 subito** o vuoi che parta dalla Fase 2.

---

## FASE 1 — Gestione Operai (priorità)

### 1.1 Database
Nuova tabella `workers` (anagrafica reale operai, separata da `site_workers` che resta come tabella di assegnazione):

```text
workers
- id, first_name, last_name, email, phone
- fiscal_code, role (mansione), hourly_cost
- hire_date, status (attivo|ferie|sospeso|non_attivo)
- photo_url, notes
- deleted_at (soft delete), created_at, updated_at
```

Estensioni:
- `site_workers.worker_id` → FK a `workers` (oltre a `worker_user_id` esistente, opzionale)
- `site_work_logs`: aggiungo `worker_id`, `start_time`, `end_time`, `break_minutes` (calcolo ore automatico)
- Tabella `worker_documents` (contratti, patenti, certificazioni) → bucket esistente `customer-documents` o nuovo `worker-documents`

RLS: admin full; commerciali/operai read limitato.

### 1.2 Schermate

**`/admin/cantieri/operai`** — Dashboard rinnovata
- 6 KPI cards: Attivi · Assegnati · Ore oggi · Ore mese · Costo manodopera mese · Costo medio/cantiere
- Tabs: **Operai** (cards) · **Registro Ore** (tabella) · **Calendario** · **Assegnazioni**
- Pulsante "+ Nuovo Operaio" e "+ Registra Ore" sempre visibili

**Cards Operai**
- Foto, nome, mansione, cantiere attuale, ore mese, costo mese, badge stato
- Azioni: Visualizza · Modifica · Registra ore · Elimina (conferma)

**Drawer "Nuovo/Modifica Operaio"** (sheet laterale)
- Tutti i campi richiesti + upload foto

**Drawer "Registra Ore"**
- Operaio, cantiere, data, ora inizio/fine, pausa min, note
- Calcolo live: `ore = (fine-inizio) - pausa/60`, `costo = ore * hourly_cost`

**Registro Ore** — tabella pro
- Sorting, filtri (operaio/cantiere/data range), ricerca, edit inline, delete
- Export CSV/Excel (xlsx) e PDF (jsPDF)

**Calendario** (react-day-picker già presente, vista mese; settimana/giorno custom semplice)
- Eventi = ore registrate, colore per operaio

**Assegnazioni Cantieri**
- Vista 2 colonne: Operai disponibili ↔ Cantieri, multi-select + bottone "Assegna"

**Scheda Operaio** `/admin/cantieri/operai/:id`
- Tabs: Anagrafica · Ore · Cantieri · Costi · Documenti

### 1.3 Componenti riusabili nuovi
`WorkerCard`, `WorkerFormDrawer`, `WorkLogFormDrawer`, `WorkLogsTable`, `WorkersKpiGrid`, `AssignmentBoard`, `WorkerCalendar`, `ExportMenu` (csv/xlsx/pdf).

---

## FASE 2 — Redesign trasversale CRM

- **Sidebar**: collapse, icone Lucide pulite, ricerca menu (Cmd+K), gruppi
- **Dashboard `/admin`**: widget con grafici Recharts (lead trend, fatturato, margine, ore, costi materiali/manodopera)
- **Tabelle globali**: wrapper `DataTable` con sorting/filtri/ricerca/colonne toggle/export
- **UX system**: skeleton loaders, empty states illustrati, toast (sonner), bulk actions, optimistic updates con React Query
- **Mobile**: sidebar offcanvas, cards responsive
- **Dark mode**: già presenti i token, attivo toggle in header
- **Design tokens**: rifinisco palette su `index.css` (bianco, cream, dark text — coerente con memoria CRM)

---

## Tecnico

- Stack: React + Vite + shadcn + TanStack Query + Supabase (Cloud)
- Nuove dipendenze: `xlsx` (export Excel), `jspdf` + `jspdf-autotable` (PDF), `@dnd-kit/core` (drag&drop assegnazioni)
- File principali nuovi:
  - `src/pages/admin/cantieri/CantieriOperaiOre.tsx` (riscritto)
  - `src/pages/admin/cantieri/WorkerDetail.tsx`
  - `src/components/admin/workers/*` (WorkerCard, WorkerFormDrawer, WorkLogFormDrawer, WorkLogsTable, AssignmentBoard, WorkerCalendar, WorkersKpiGrid)
  - `src/lib/exports.ts` (csv/xlsx/pdf helpers)
- Migration: tabella `workers`, `worker_documents`, alter `site_work_logs` + `site_workers`, RLS, GRANTs

---

## Domande prima di partire

1. **Procedo subito con Fase 1 (Operai completa) + base del redesign sidebar/dashboard**, e Fase 2 piena la facciamo dopo? Oppure vuoi tutto insieme (richiederà più iterazioni)?
2. Gli **operai devono avere login** all'app `/cantieri-app` (collegati a `auth.users` via `worker_user_id`) o sono solo anagrafica gestita dall'admin? Attualmente esiste già il flusso operaio loggato — mantengo entrambi: `workers` come anagrafica + collegamento opzionale a un utente auth.
3. **Costo orario**: prendo dal campo nuovo `workers.hourly_cost` (sostituisce il `COSTO_ORARIO_DEFAULT = 25` hardcoded). OK?
