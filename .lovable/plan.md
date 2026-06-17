
# Audit CRM & ricablaggio dati

Obiettivo: trasformare il CRM in un sistema unico dove ogni inserimento aggiorna automaticamente tutto. Lavoro in **5 fasi** con approvazione tra una e l'altra (troppo grande per un solo round).

---

## Stato attuale (verificato in DB ora)

| Modulo | Righe DB | Note |
|---|---|---|
| `construction_sites` | 1 (status `attivo`) | Il KPI "Cantieri attivi" del Planner mostra 0 → **bug di lettura/RLS, non di logica filtro** |
| `quotes` | 0 | nessun preventivo collegato a cantieri |
| `leads` | 1027 | non collegati a quotes/sites |
| `crews` / `crew_assignments` | 0 / 0 | KPI a 0 è corretto, mancano dati |
| `commissions` | trigger esiste su `quotes.status='accepted'` ma nessun quote → 0 commissioni |
| Debiti/crediti | tabelle `commercial_invoices`, `payment_schedules`, `supplier_payments` esistono ma scollegate | nessun KPI le legge |

Quindi i problemi sono **due famiglie**: (A) i dati esistono ma le pagine non li leggono (RLS/query sbagliate), (B) i moduli non si attivano a vicenda (manca la catena lead→quote→site→commission→invoice→payment).

---

## Fase 1 — Diagnosi & quick fix KPI (questa sessione)

Obiettivo: far comparire dati reali ovunque, **senza nuove tabelle**.

1. Verifico RLS su `construction_sites`, `leads`, `quotes`, `crew_assignments`, `commissions`, `commercial_invoices` — l'admin loggato deve poter `SELECT` tutto. Sistemo le policy che bloccano.
2. Riscrivo i 6 KPI del **Planner** e i KPI della **AdminOverview** usando query reali (count + sum), normalizzando i valori di `status` (`attivo`, `in_corso`, `pianificato`, `completato`, ecc.).
3. Aggiungo i KPI mancanti richiesti:
   - Cantieri completati / in ritardo
   - Lead ricevuti (totale + ultimi 30gg)
   - Preventivi inviati / accettati / valore
   - Valore cantieri attivi (somma `quotes.total_amount` dei quote accettati linkati al cantiere)
   - Crediti da incassare, Debiti fornitori, Pagamenti scaduti, Commissioni maturate

Output: dashboard admin e planner con numeri corretti. Niente modifiche di schema.

---

## Fase 2 — Catena lead → preventivo → cantiere → commissione (migrazione + trigger)

Una sola migrazione:

1. Colonne mancanti per chiudere il cerchio:
   - `quotes.lead_id` (FK leads)
   - `quotes.site_id` (FK construction_sites, popolato all'accettazione)
   - `construction_sites.quote_id` (FK quotes)
   - `construction_sites.salesperson_id` (FK salespeople)
   - `construction_sites.lead_id` (FK leads)
2. Trigger `quote_accepted_create_site`: quando `quotes.status` diventa `accettato`/`accepted` e non esiste già un cantiere collegato → crea `construction_sites` con cliente, commerciale, valore previsto, e collega `quotes.site_id`. (Il trigger commissioni esiste già e continua a funzionare.)
3. Trigger `lead_won_creates_quote_draft`: quando `leads.status` diventa `vinto`/`won` → crea bozza `quotes` collegata (opzionale, solo se non già presente).
4. Backfill: per i quote già accettati senza site, creo il cantiere; per i lead vinti senza quote, niente automazione retroattiva (evito spam).

---

## Fase 3 — Contabilità (debiti / crediti / pagamenti)

Una migrazione che riusa/estende l'esistente:

- **Crediti**: vista `customer_receivables` che unisce `quotes` accettati + `commercial_invoices` + `payment_schedules` con stato calcolato (`da_incassare` / `parziale` / `incassato` / `scaduto`).
- **Debiti**: vista `supplier_payables` da `site_materials` + `site_expenses` + `supplier_payments` con stesso stato calcolato.
- Trigger: quando si inserisce un `supplier_payment` o un `payment_schedule.paid_amount`, ricalcola lo stato sul record padre.
- Pagina **Contabilità** unica (`/admin/contabilita`) con 3 tab: Crediti · Debiti · Scaduti. KPI dashboard collegati a queste viste.

---

## Fase 4 — Ricablaggio pagine ruolo (Operaio · Commerciale · Ibrido)

Niente migrazione, solo codice:

- **Dashboard Operaio**: cantieri assegnati (join `site_workers` + `crew_members`), ore totali (`site_work_logs`), foto, segnalazioni aperte.
- **Dashboard Commerciale**: lead suoi, preventivi inviati/accettati, cantieri generati (`construction_sites.salesperson_id`), commissioni maturate/pagate.
- **Ibrido**: dashboard mista in base ai ruoli in `user_roles` (può avere `admin`+`commerciale`+`operaio`).
- Pulsante "Inizia turno" → già scrive in `site_work_logs`; aggiungo refresh delle KPI admin via React Query invalidation.

---

## Fase 5 — Permessi (RLS coerente per ruolo)

Audit finale RLS:

| Tabella | Admin | Commerciale | Operaio |
|---|---|---|---|
| leads | full | solo `assigned_*` = lui | — |
| quotes | full | solo creati da lui | — |
| construction_sites | full | solo `salesperson_id` = lui | solo se in `site_workers` o `crew_members` |
| site_work_logs | full | — | solo i propri |
| commissions | full | solo `user_id` = lui | — |
| commercial_invoices / supplier_payments | full | read se collegate ai suoi cantieri | — |

---

## Cosa NON tocco

- Layout/visual delle pagine esistenti (solo dati).
- Pagine pubbliche del sito Kalēa.
- Sistema preventivi PDF, chatbot, mappa — restano com'è.
- Localizzazione (modulo admin resta in italiano).

---

## Domanda prima di iniziare

Procedo con **Fase 1 (quick fix KPI + RLS)** subito, poi torno con il riepilogo prima di lanciare la migrazione di Fase 2? Oppure preferisci che parta direttamente con la pipeline lead→quote→cantiere (Fase 2) perché è quella che ti blocca di più?
