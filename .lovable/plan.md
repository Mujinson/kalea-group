# Revisione CRM: doppioni e piano di unificazione (solo lettura)

Nessun codice o dato è stato modificato. I numeri vengono da query di sola lettura eseguite oggi.

## 1. Doppioni trovati

Pagine e voci di menu (`src/components/admin/AdminSidebar.tsx`)
- **Lead + Pipeline**: stessa tabella `leads` mostrata in lista e kanban → resta `/admin/leads` (`AdminLeads.tsx`); Pipeline diventa una vista dentro Lead.
- **Lista cantieri + Riepilogo cantieri + Report + Budget vs Consuntivo + Marginalità cantieri**: cinque schermate su `construction_sites`, `site_*` → resta `AdminCantieri` / `AdminCantiereDetail`; le altre diventano schede.
- **Fatturazione & Incassi + Pagamenti + Contabilità**: `customer_invoices`, `payment_schedules`, `customer_payments` → il calcolo comune è già `src/lib/revenueSources.ts`; la schermata da tenere è Fatturazione.
- **Margini + Marginalità cantieri + Analytics**: calcolo già unico in `src/lib/margin.ts`, ma tre schermate.
- **Timbrature + Operai & Ore + Planner**: `worker_time_entries`, `site_work_logs` → calcolo unico `src/lib/workedHours.ts`.
- **Catalogo prodotti + Prezzi & Margini + Listini + Importa + 5 voci "Catalogo:" in Impostazioni**: `catalog_*`.
- **Squadre**: `crews` / `crew_members` (0 righe) e `workers` (2) / `site_workers` sono due anagrafiche dello stesso concetto; quella usata davvero è `workers`.

Moduli che creano lo stesso record in più punti
- **Cliente**: `AdminCustomers.tsx`, `AdminFatturazione.tsx`, `src/lib/quoteCrm.ts` (dal preventivo), `supabase/functions/ai-assistant` → quella da tenere è `quoteCrm.ts`.
- **Lead**: `LeadFormDrawer.tsx`, `quoteCrm.ts`, la funzione `submit_public_lead` (sito, Diventa Partner) e il chatbot.
- **Preventivo**: un solo editor (`CreaPreventivo.tsx`); la tabella `_deprecated_preventivi` è vuota.

Campi che salvano la stessa informazione
- Nome cliente: `customers.company_name/first_name/last_name`, `quotes.client_name`, `sales.customer_name`, `construction_sites.contact_name/contact_surname` → vince `customers`.
- Indirizzo del cantiere: `quotes.site_address/site_city` e `construction_sites.address/city` → vince il cantiere dopo la firma, il preventivo prima.
- Totali: `quotes.total_amount`, `sales.total_amount/subtotal_amount`, `construction_sites.budget_amount`, `customer_invoices.total` → vince il preventivo accettato per il venduto e la fattura per il fatturato.
- Margine salvato: `sales.margin_amount` contro il calcolo di `margin.ts` → vince il calcolo.
- Collegamento al cliente: `customer_id` ripetuto su `quotes`, `sales`, `construction_sites` e `customer_invoices` → vince `quotes.customer_id`.

## 2. Doppioni con dati davvero diversi
- `construction_sites.budget_amount` diverso da `quotes.total_amount`: **5 su 5** cantieri collegati (probabile budget netto o costi, da verificare).
- Città del cantiere diversa da `quotes.site_city`: **1**.
- Preventivi senza `customer_id`: **22** (21 con solo il lead, 1 senza né cliente né lead).
- Allineati (0 differenze): `client_name` del preventivo contro il cliente, cliente e totale tra vendita e preventivo, `sales.customer_name`, cliente tra fattura e preventivo, cliente tra cantiere e preventivo.

## 3. Record presenti due volte nel database
- `leads` con la stessa email: **53 gruppi, 71 righe in più**. Esempi: `xx` (16 righe segnaposto, es. fc4feb21…, 76027e5b…), gianluca.ruggi@frassociati.it (a3c0614f, ceef7ab5, 375c6527), architetto@marcoturati.it (17ea9d12, b3f4980d, 670e6e97).
- `leads` con lo stesso telefono: **62 gruppi**.
- Lead che sono già clienti (stessa email): **4**. Sono Nava (f5a84d43 → cliente 8d8049ac), Metroquadro (f8529dc4 → 63873e04), Danesi (3a9be09b → 4d66698d) e Rusconi (70d3756c → 99e265a0).
- `customers` con la stessa email o lo stesso telefono: 0. `quotes.quote_number`: 0. `customer_invoices.invoice_number`: 0. `supplier_invoices` (stesso fornitore e numero): 0.

## 4. Assetto proposto (7 voci di menu)
```text
1 Oggi          dashboard + prossime azioni + assistente
2 Contatti      Lead (lista/kanban/mappa) + Clienti; scheda unica
                cliente -> preventivi, cantieri, fatture, pagamenti
3 Preventivi    Preventivi + Vendite (la vendita è lo stato "accettato")
4 Cantieri      lista + scheda con tab Budget, Materiali, Media, Ore, Margine
5 Squadre       Planner, Appuntamenti, Timbrature, Operai, Ferie
6 Soldi         Fatturazione e incassi, Costi, Margini/Analytics, Commissioni
7 Catalogo      Prodotti, Listini, Magazzino, Fornitori, Ordini (Impostazioni nel menu utente)
```
Regole di unione
- Nome, telefono ed email si leggono sempre da `customers` tramite `customer_id`. Le copie (`client_name`, `sales.customer_name`) restano come istantanea del documento e non si mostrano come dato principale.
- Il cantiere mostra l'indirizzo del preventivo come collegamento, non come copia; `budget_amount` diventa "budget costi", con un'etichetta distinta dal totale del preventivo.
- I lead doppi si uniscono in quello più vecchio: le attività e i preventivi passano al lead tenuto e gli altri vengono archiviati (stato "duplicato"), non cancellati. I 16 "xx" vengono archiviati.
- I lead già clienti si chiudono come "convertito" con il collegamento al cliente.
- Le pagine tolte dal menu restano raggiungibili dal loro indirizzo e vengono reindirizzate alla scheda nuova.

## 5. Rischi
- **PDF del preventivo** (`premiumQuotePdf.ts`, `CreaPreventivo.tsx`): leggono `client_name` e `site_*` da `quote_data`, quindi non vanno toccati.
- **Visualizzatore**: non dipende dal CRM, nessun rischio.
- **Richiesta preventivo pubblica e form del sito** (`public_quote_requests`, `submit_public_lead`): continueranno a creare lead doppi. Serve un controllo che collega invece di duplicare.
- **Campagne email**: unire i lead cambia i destinatari, quindi va controllato `email_suppressions` per non ricontattare chi si è disiscritto.
- **Telegram** (`notify_lead_assignment`): le unioni non devono generare notifiche.
- **Trigger** `sync_customer_on_quote_won` e `create_site_from_accepted_quote`: ricopiano i campi, quindi vanno adeguati prima di nascondere le copie.

## Passi (ognuno piccolo e reversibile; mi fermo dopo ciascuno)
1. Export CSV dei 71 lead doppi, dei 4 lead già clienti, dei 22 preventivi senza cliente e dei 5 budget diversi (nessuna modifica).
2. Scheda cliente unica con preventivi, cantieri, fatture, pagamenti e prossima azione, tutti come collegamenti (solo interfaccia).
3. Pipeline come vista dentro Lead; voce Pipeline nascosta, indirizzo mantenuto.
4. Le schermate dei cantieri diventano schede del dettaglio cantiere; voci nascoste, indirizzi reindirizzati.
5. Pagamenti e Contabilità dentro Fatturazione; Margini, Marginalità e Analytics in un'unica pagina.
6. Etichetta "Budget costi" sul cantiere e nome cliente letto sempre da `customers`.
7. Un solo modulo per creare clienti (`quoteCrm.ts`), usato da Fatturazione, pagina Clienti e assistente.
8. Controllo anti-doppione in `submit_public_lead` e in `LeadFormDrawer` (collega il lead esistente). Richiede una migrazione.
9. Archiviazione dei lead doppi con stato "duplicato" e spostamento di attività e preventivi (modifica dati, con approvazione).
10. Collegamento dei 21 preventivi con solo lead al cliente corretto (modifica dati, con approvazione).
11. Menu ridotto alle 7 voci.
