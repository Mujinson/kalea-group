# Economics commessa: utile / perdita / pari con tutti i costi

## Cosa vedrà Gabriel
Nella scheda "Economics commessa" del cantiere: Ricavo netto, Materiali, Manodopera (giornate, ore normali, straordinari), Spese sostenute, Spese previste, poi due righe di margine. In alto un badge colorato: verde "In utile", rosso "In perdita", grigio "In pari" (entro ±1 €). Sotto la manodopera, un elenco "Giornate da confermare" con le presenze vicine al cantiere da ammettere o escludere con una spunta.

## Passi (piccoli e reversibili, ciascuno da approvare)

1. **Funzione di calcolo pura + test** — nuovo `src/lib/siteEconomics.ts`, nessuna modifica a pagine o dati.
   - Ricavo: `jobRevenue` di `src/lib/margin.ts` (invariato).
   - Materiali: somma `site_materials.total_cost` (fallback `quantity × unit_cost`), come la tabella Materiali.
   - Manodopera: per operaio/giorno da `worker_time_entries`; presente se almeno una timbratura entro 3.000 m dalle coordinate del cantiere (`construction_sites.latitude/longitude`, distanza ricalcolata con haversine, non solo `site_id`/`is_at_site`). Tariffa giornata 260 € normale / 350 € trasferta, oraria = giornata ÷ 8; ore oltre 8 = straordinario alla stessa tariffa oraria. `workers.hourly_cost × 8` solo se manca la tariffa giornaliera.
   - Spese: `site_expenses` divise in previste (`notes` che inizia con "PREVISTO", senza distinzione maiuscole/spazi) e sostenute.
   - Margine = ricavo − materiali − manodopera − spese sostenute; margine con previste = margine − previste; esito utile/perdita/pari.
   - Test in `src/lib/siteEconomics.test.ts`: 3 km dentro/fuori, 8h esatte, 10h (2h straordinario), trasferta 350, fallback hourly_cost, split PREVISTO, tre esiti.

2. **Collegare la scheda** — `src/components/admin/cantieri/SiteEconomics.tsx`: aggiungere letture di `site_materials`, `worker_time_entries` (con `fetchAllRows`, filtro su finestra date del cantiere), `workers`, coordinate cantiere; `site_expenses` legge anche `notes`. Mostrare righe, due margini e badge. Solo lettura.

3. **Trasferta**: interruttore per cantiere "In trasferta" (default automatico: distanza dalla sede in `crew_cost_settings.origin` ≥ `trasferta_km`, come in `src/lib/crewCosts.ts`). Finché non esiste la colonna, il valore automatico è solo calcolato, non salvato.

4. **Presente vicino ma non ammesso** (richiede database, approvazione separata):
   - Nuova tabella `site_attendance_overrides` (site_id, worker_id, work_date, decision 'ammessa'|'esclusa', note, decided_by, timestamps), solo admin, con GRANT e RLS.
   - Regola: presenza entro 3 km conta di default; Gabriel può spuntare "Escludi" (es. 26–27 novembre, operaio non entrato) o "Ammetti" una giornata fuori raggio/senza cantiere (es. 11–25 novembre). La spunta vince sempre sul GPS.
   - Opzionale nella stessa migrazione: `construction_sites.travel_mode` ('auto'|'on'|'off') per salvare il passo 3.
   - Nessuna modifica a `worker_time_entries`: le timbrature originali restano intatte.

5. **UI spunte** in `SiteEconomics.tsx`: elenco giornate con operaio, data, ore, distanza minima, stato (GPS / ammessa / esclusa) e due pulsanti; ricalcolo immediato.

6. **Verifica**: test unitari + controllo nel browser su un cantiere reale con le date 11–27 novembre; confronto valori prima/dopo.

## Dettagli tecnici
- Distanza: haversine su lat/lng della timbratura vs cantiere; timbrature senza coordinate → solo ammissione manuale.
- Ore per giorno: come `summarizeDay` di `src/lib/workedHours.ts` (esclusi pausa e viaggio), per non divergere da timbrature e ore.
- Questa regola vale solo per la scheda commessa; Margini/Marginalità restano su `workedHours.ts` finché non decidi di allinearle (eventuale passo successivo).
- Rischi: nessuno su PDF, preventivi, campagne, Telegram, form pubblici; il passo 4 è additivo.

## Domande aperte
- Tariffe 260/350 fisse per tutti o personalizzabili per operaio (colonna futura su `workers`)?
- Un cantiere è tutto in trasferta o si decide giorno per giorno?
