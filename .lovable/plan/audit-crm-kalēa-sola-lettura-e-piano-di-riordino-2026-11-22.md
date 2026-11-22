# Audit CRM Kalēa (sola lettura) e piano di riordino

Nessuna modifica a codice o dati è stata fatta. Conteggi letti dal database il 22/11/2026.

## 1. Pagine del menu attuale (10 gruppi, ~50 voci)

| Voce | Rotta / file | Tabelle |
|---|---|---|
| Dashboard | `/admin` AdminOverview.tsx | sales, quotes, customer_invoices, customer_payments, payment_schedules, payment_agreements, fixed_costs, inventory, leads, appointments, construction_sites, customer_reminders |
| Assistente | `/admin/assistente` | crm_assistant_* |
| Lead: Lista, Pipeline | AdminLeads, AdminPipeline | leads, salespeople |
| Appuntamenti | AdminAppointments | appointments, crew_assignments, leads |
| Chatbot, Campagne | AdminChatbot, AdminCampagne | chatbot_conversations, email_campaigns/recipients/templates |
| Vendite | AdminSales (1.457 righe) | sales, sale_items, sale_salespeople, sale_additional_costs, payment_schedules, customer_invoices, invoice_sales, customer_contracts, inventory |
| Preventivi | AdminQuotes, CreaPreventivo, CreaContabilita | quotes, customers, sales, static_costs |
| Commissioni | AdminCommissions | commissions |
| Clienti, Mappa, Media | AdminCustomers, AdminMap, AdminMedia | customers, leads, construction_sites, site_media |
| Documenti aziendali | AdminDocumenti | company_documents |
| Cantieri (9 voci) | AdminCantieri, AdminCantiereDetail, cantieri/*, AdminPlanner, AdminTimbrature, AdminTimeOff | construction_sites, site_*, crews, crew_assignments, worker_time_entries, workers, time_off_requests |
| Catalogo (10 voci) | AdminCatalog, catalog/* | catalog_*, product_categories, product_suppliers |
| Magazzino | AdminInventory | inventory, catalog_products |
| Statistiche | AdminAnalytics, AdminMargini, CantieriMarginalita | sales, static_costs, site_*, supplier_invoices, fixed_costs |
| Finanza (6 voci) | AdminFatturazione, AdminContabilita, AdminCosts, AdminFornitori, AdminOrdiniFornitori, AdminPayments | customer_invoices/payments, payment_schedules, fixed_costs, variable_costs, static_costs, suppliers, supplier_invoices/orders/payments, payment_agreements |
| Strumenti (9 voci) | strumenti/* (pricing Flow/Kronos/BerryAlloc/Parquet/Signature/Externo, Costo operaio, Sostenibilità, Listino pubblico) | calcolatori statici |
| Impostazioni | AdminSettings, AdminImport | app_settings, telegram_allowed_chats |

Rotte doppie: `ferie`/`time-off`, `commissioni`/`commissions`, `cantieri-marginalita`/`cantieri/marginalita`; `AdminQuoteCreate.tsx` è un editor vecchio non usato dal menu (la rotta va a CreaPreventivo).

## 2. Funzioni duplicate o sovrapposte

- **Squadre vs operai**: `crews`/`crew_members` (0 membri) e `crew_assignments` nel Planner, contro `workers` + `site_workers` in Cantieri e "Operai & Ore". Due modelli per la stessa cosa.
- **Ore**: `site_work_logs` (Registro lavori, Budget, Report, Operai & Ore) contro `worker_time_entries` (Timbrature, Planner, costi giornalieri). Due fonti di ore.
- **Costi**: `fixed_costs` (Contabilità, Dashboard, Marginalità) contro `static_costs` (Analytics, Preventivi, Import) contro `crew_cost_settings` (costo operaio) contro strumento "Costo Operaio" statico.
- **Margini**: 4 posti — Margini (AdminMargini), Marginalità cantieri, Budget vs Consuntivo, Prezzi & Margini catalogo — più SiteEconomics nel dettaglio cantiere.
- **Pagamenti**: "Pagamenti" (payment_agreements, supplier_payments) e "Fatturazione & Incassi" (customer_payments, payment_schedules); payment_agreements letti anche in Dashboard.
- **Documenti**: company_documents, customer_documents, customer_contracts (0 righe), lead_attachments, site_attachments: cinque archivi.
- **Prezzi**: 6 strumenti pricing statici + catalogo con listini = due listini paralleli.
- **Dashboard**: Dashboard generale e Dashboard cantieri e Analytics mostrano fatturato/margini con regole diverse.

## 3. Dati non collegati / calcoli diversi

- **Fatturato**: Dashboard usa `src/lib/revenueSources.ts` (rate + fatture); Analytics somma `sales.total`; Contabilità somma propria logica su customer_invoices/payments. Tre numeri possibili.
- **Margine**: AdminMargini calcola da sale_items + site_* + worker_time_entries; CantieriMarginalita da customer_invoices − supplier_invoices − site_expenses − quota fixed_costs; Budget da site_materials + site_work_logs; non usano `companyProfit.ts` né `crewCosts.ts`.
- **Costo manodopera**: Budget/Report valutano `site_work_logs`; costi giornalieri usano `worker_time_entries` + `crew_cost_settings`. 397 timbrature senza cantiere non entrano in nessun margine.
- **Costi fissi**: Analytics e Preventivi leggono `static_costs` (2 righe), Contabilità/Dashboard `fixed_costs` (10 righe): costi diversi a seconda della pagina.
- **Ordini fornitori**: `supplier_orders` vanno a magazzino (trigger), ma non generano `supplier_invoices` né entrano nella Marginalità cantiere finché non c'è la fattura.
- **Fatture → cantiere**: 4 fatture clienti senza cantiere e 3 senza collegamento vendita (invoice_sales): spariscono dai margini per cantiere.
- **Totale preventivo → vendita**: la vendita copia il totale al momento della conversione; se il preventivo cambia dopo, i due restano diversi (nessun ricalcolo).
- **Prezzi catalogo vs strumenti pricing**: un prezzo modificato in Pricing Kronos non aggiorna catalog_products e viceversa.

## 4. Record orfani (solo conteggi)

| Caso | Numero |
|---|---|
| Clienti senza preventivo, vendita o cantiere | 4 |
| Preventivi senza cliente né lead | 1 |
| Fatture clienti senza cantiere | 4 |
| Fatture clienti senza vendita collegata | 3 |
| Timbrature senza cantiere | 397 |
| Squadre senza membri (crew_members = 0) | tutte |
| Contratti cliente (customer_contracts) | 0, sezione vuota |
| Lead ancora "Nuovo" | 1.030 |
| Vendite senza cliente, cantieri senza cliente, ordini/fatture fornitori senza fornitore, incassi senza fattura | 0 |

Esempi nominativi verranno estratti nel passo 1 del piano.

## 5. Nuova struttura del menu (7 voci)

```text
1 Oggi                 Dashboard unica + Assistente + promemoria/rate scadute
2 Clienti e preventivi Lead (lista/pipeline in schede), Clienti, Preventivi, Vendite, Mappa, Campagne
3 Cantieri             Lista + dettaglio (economia, materiali, media, ore, documenti in schede)
4 Calendario posa      Planner + Appuntamenti + Timbrature + Ferie
5 Fatture e incassi    Fatturazione, Pagamenti, Contabilità, Costi, Margini (una pagina a schede), Commissioni
6 Magazzino e fornitori Catalogo, Magazzino, Fornitori, Ordini fornitori
7 Impostazioni         Generali, Telegram, Import, Costo squadra, Strumenti pricing, Documenti aziendali, Chatbot
```

- Unire: Dashboard cantieri + Report + Budget dentro il dettaglio cantiere; Margini + Marginalità + Analytics in "Fatture e incassi → Margini".
- Spostare: Media e Materiali come schede del cantiere; Operai & Ore in Calendario posa.
- Nascondere (rotte restano attive): Strumenti pricing, Sostenibilità, Squadre vuote, Contratti, rotte doppie, AdminQuoteCreate.
- Nessuna eliminazione di tabelle o pagine.

## 6. Piano di intervento (passi piccoli e indipendenti)

1. Estrarre l'elenco nominativo degli orfani in un file scaricabile (sola lettura).
2. Riorganizzare solo `AdminSidebar.tsx` nei 7 gruppi; tutte le rotte esistenti restano raggiungibili.
3. Unificare il fatturato: Analytics e Contabilità usano `revenueSources.ts`; test di non regressione.
4. Unificare il margine: una funzione in `companyProfit.ts` usata da Margini, Marginalità e SiteEconomics; test con valori reali.
5. Costi fissi: far leggere `fixed_costs` anche ad Analytics e Preventivi; `static_costs` lasciato intatto ma non più letto.
6. Ore: Budget/Report leggono anche `worker_time_entries` tramite `timesheetSiteCosts.ts`.
7. Schermata "Da collegare": elenco di timbrature, fatture e preventivi orfani con pulsante per assegnarli a mano (solo aggiunta di collegamenti, nessuna cancellazione).
8. Dettaglio cantiere a schede che riusa le pagine Materiali/Budget/Report/Media esistenti.
9. Avviso nel preventivo quando il totale differisce dalla vendita collegata (senza riscrivere importi).
10. Nascondere dal menu le voci duplicate e vuote.

Ogni passo è applicabile e verificabile da solo; dimmi da quale partire.
