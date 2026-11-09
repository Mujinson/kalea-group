# Timbrature: ore totali vs ore cantiere, export commercialista, numeri veri

## Cosa esiste oggi (verificato nel codice)

1. **Import CSV/XLSX delle timbrature: non esiste.** Esiste invece l'opposto: le timbrature nascono nell'app operaio e vengono **esportate**.
   - App operaio: `/app/operaio` → `OperaioApp.tsx` + `TimbratureCard.tsx` (sequenza obbligatoria con GPS), `MonthlyHoursCard.tsx` ("Le mie ore").
   - Admin: `/admin/timbrature` → `AdminTimbrature.tsx` (vista per giorno/operaio, modifica admin, export CSV e PDF "per studio paghe").
   - Tabella: `worker_time_entries` (un evento per riga: `start_home`, `arrive_site`, `pause_start`, `pause_end`, `leave_site`, `arrive_home`, con `event_at`, `event_date`, GPS, `site_id`).
   - Calcoli: `src/lib/timbrature.ts` → `summarizeDay` (totale, pausa, cantiere, viaggio).
   - Collegati: `/admin/cantieri-operai` (`CantieriOperaiOre.tsx`, registro ore `site_work_logs` con export CSV/XLSX), `WorkerDetail.tsx`, `AdminMargini.tsx`, `AdminPlanner.tsx`.
   - Le colonne del file che descrivi (Partenza casa … Arrivo casa, Pausa, Ore lavorate, Ore cantiere) sono proprio quelle dell'export CSV di `/admin/timbrature`.

2. **Perché la somma dà 0:** l'export scrive le ore con il punto (`8.50`) e gli orari come testo (`09:02`) in un CSV con `;`. Excel in italiano li legge come testo, quindi non li somma.

3. **Ore già separate in parte:** "Ore lavorate" = da Partenza casa ad Arrivo casa meno pausa (viaggio incluso). "Ore cantiere" oggi somma gli intervalli Arrivo cantiere → Inizio pausa e Fine pausa → Fine cantiere, quindi è già al netto pausa, ma va reso esplicito e testato.

4. **Parti riusabili:** ruolo operaio e flusso timbrature; `crewCosts.ts` e `crew_cost_settings` (costi squadra e trasferta nel preventivo); `site_daily_costs` (costi reali per giorno); `companyProfit.ts` e `AdminMargini.tsx` (utile); `exports.ts` (CSV/XLSX/PDF); il lettore XLSX di `CatalogImport.tsx` per un eventuale import.

## Piano

### a) Ore totali e ore cantiere separate
- In `summarizeDay` mantengo due valori chiari e testati:
  - **Ore totali** = Arrivo casa − Partenza casa − pausa.
  - **Ore cantiere** = Fine cantiere − Arrivo cantiere − pausa (solo la pausa che cade dentro il cantiere).
  - **Viaggio** = Ore totali − Ore cantiere.
- In `/admin/timbrature`, "Le mie ore" e negli export le colonne si chiamano "Ore totali (viaggio incluso)", "Ore cantiere", "Viaggio".
- Giornate incomplete restano segnalate come "Incompleto" e non inventano orari mancanti.

### b) Export per il commercialista (arrotondato a 30 minuti)
- Nuovo pulsante "Export commercialista" in `/admin/timbrature` (Excel XLSX).
- Ogni orario viene arrotondato alla mezz'ora più vicina **solo nel file**: 9:02, 9:07, 9:14 → 9:00; 9:16 → 9:30; 9:45 → 10:00 (a metà si arrotonda per eccesso).
- Le ore del file vengono ricalcolate dagli orari arrotondati, così i conti tornano.
- Le timbrature salvate non vengono toccate; l'export attuale resta con gli orari effettivi.

### c) Numeri veri nei file
- Gli export diventano XLSX con celle tipizzate: orari come veri orari (formato `hh:mm`), ore come numeri decimali (formato `0,00`), pausa in minuti come numero, riga TOTALE con somma funzionante.
- Il CSV resta, ma con virgola decimale per l'Excel italiano.
- **Import (opzionale, se ti serve davvero):** pagina per caricare un CSV/XLSX con quelle colonne; converte "09:02" in orario reale e "8,50"/"8.50"/"8:30" in numero, mostra un'anteprima con errori riga per riga e salva gli eventi in `worker_time_entries` solo dopo conferma. Ti chiedo prima se serve: oggi le timbrature nascono già nell'app.

## Dettagli tecnici
- Nuove funzioni pure in `src/lib/timbrature.ts`: `roundToHalfHour(date)`, `parseHHMM(text)`, `parseHours(text)`, `summarizeDay` con `totalMinutes`/`siteMinutes` espliciti.
- Test in `src/lib/timbrature.test.ts`: 9:02/9:07/9:14 → 9:00, 9:15 → 9:30, 9:44 → 9:30; ore totali vs cantiere su una giornata esempio; parsing "8,50" = 8.5 e "09:02" = 542 minuti.
- Export XLSX tramite `xlsx` (già nel progetto) con `t: 'n'` e `z: 'hh:mm'` / `'0.00'`.
- Nessuna modifica al database per a) e b); l'import userebbe la tabella esistente.
