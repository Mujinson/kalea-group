## Obiettivo
Portare la gestione Lead al livello (e oltre) di Geopietra CRM: form nuovo lead completo, lista avanzata con filtri/colonne configurabili, dettaglio lead ricco, mappa geolocalizzata. Sia lato Admin desktop sia app mobile Commerciale/Ibrido.

## 1. Schema DB (migrazione)
Estendo la tabella `leads` con i campi mancanti (mantenendo `pipeline_stage` attuale):
- `contact_type` (azienda | privato), `vat_number`, `first_name`, `last_name`, `profession`
- `linkedin_url`, `website`, `address`, `postal_code`, `country`
- `site_address`, `site_city`, `site_province`, `site_postal_code`, `site_country`
- `project_name`, `has_thermal_insulation` (bool), `visited_showroom` (bool)
- `language` (it/en/de/fr), `referrer_id` (segnalatore → salespeople)
- `archived_at`, `deleted_at` (soft archive/delete)
- `code` (identificatore leggibile tipo `WEJFO6A8-26`, generato via trigger)
- `latitude`, `longitude` (per mappa, geocode client-side)

Nuova tabella `lead_attachments` (file allegati su bucket privato `lead-attachments`) + `lead_activities` (timeline: nota, chiamata, email, cambio stato, meeting) con RLS coerenti con `leads`.

## 2. Form Nuovo/Modifica Lead (`LeadFormDrawer`)
Un unico componente riutilizzabile con sezioni collassabili:
- **Provenienza & Lingua** (source, language)
- **Contatto** — toggle Azienda/Privato → mostra campi giusti (ragione sociale + P.IVA vs cognome/nome/professione), email, telefono, LinkedIn, sito
- **Indirizzo contatto** (paese, indirizzo, CAP, città, provincia)
- **Indirizzo cantiere** (stessi campi + bottone "Copia indirizzo dal contatto")
- **Progetto** (nome progetto, richiesta rich-text, toggle isolamento termico, toggle sala mostra)
- **Allegati** (drag & drop → storage)
- **Note**
- **Sidebar destra sticky**: Stato, Segnalatore, Responsabile, bottoni Annulla / Salva
- Validazione zod, salvataggio ottimistico, geocoding automatico dell'indirizzo cantiere.

## 3. Lista Lead avanzata (`AdminLeads` + `CommercialeLeads`)
- Colonne: Codice, Nome contatto, Cliente, Stato, Responsabile, Creato il — con dropdown "Colonne" per aggiungere Email, Tipologia, Città, Provenienza (persistenza in localStorage).
- Ricerca full-text (nome, email, città, codice, ragione sociale).
- Popover **Filtri**: Stato, Cliente, Provenienza, Paese, Segnalatore, Responsabile, Lead archiviati (senza/solo/tutti), Record eliminati (senza/solo/tutti) + "Reimposta". Badge con conteggio filtri attivi.
- Ordinamento colonne, paginazione, azioni riga (Modifica, Archivia, Elimina soft, Ripristina, Converti in cliente).
- Bottone "Nuovo" apre il drawer.
- Mobile (Commerciale/Ibrido): card list con filtri in bottom-sheet.

## 4. Dettaglio Lead (`LeadDetail`)
Layout 2 colonne desktop / stack mobile:
- **Header**: codice, nome, badge stato con quick-change, azioni (Modifica, Archivia, Converti in Cliente, Crea Preventivo, Crea Appuntamento).
- **Tabs**: Panoramica · Timeline attività · Allegati · Preventivi · Appuntamenti · Cantieri collegati.
- Timeline con inserimento rapido nota/chiamata/email (usa `lead_activities`).
- Sidebar destra: dati contatto cliccabili (tel/mail/WhatsApp), indirizzo cantiere con mini-mappa Leaflet + pin.

## 5. Mappa Lead
Riutilizzo componente Leaflet esistente (già usato in CRM Interactive Map): pin colorati per stato pipeline, popup con nome/città/responsabile e link al dettaglio. Filtro rapido per stato/responsabile in overlay.

## 6. Mobile (Commerciale/Ibrido)
- `CommercialeLeads.tsx`: lista con stessi filtri (bottom-sheet), FAB "+" apre `LeadFormDrawer` full-screen mobile.
- `CommercialeLeadDetail.tsx`: stesse tab in versione mobile-first.

## Dettagli tecnici
- Riuso `useAdminAuth` e RLS esistenti (admin vede tutto; commerciale vede solo assegnati/creati/territorio).
- Geocoding via Nominatim (già in `src/lib/geo.ts`).
- Codice lead: trigger PL/pgSQL `BEFORE INSERT` che genera 8 char random + `-YY`.
- Rich text: `@tiptap/react` (già in stack? verifico; fallback a textarea con markdown).
- Nessuna modifica ad AdminSidebar/route esistenti.

## Ordine di implementazione
1. Migrazione DB (schema + trigger + bucket + RLS)
2. `LeadFormDrawer` + hook `useLead`
3. `AdminLeads` lista avanzata
4. `LeadDetail` + `lead_activities`
5. Aggiornamento mobile `CommercialeLeads` / `CommercialeLeadDetail`
6. Vista mappa

Confermi che procedo?
