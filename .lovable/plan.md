## Obiettivo
Estendere il modulo Cantiere esistente (Admin + App Operaio) con dati tecnici pavimento, accessori, attrezzatura, logistica, checklist, segnalazioni problemi, GPS sui turni, allegati e KPI. Nessuna nuova sezione del CRM, solo evoluzione di quello che già esiste.

---

## 1) Database (migrazione unica)

Estensione tabella `construction_sites` con nuove colonne:
- **Pavimento**: `floor_type`, `floor_brand`, `floor_model`, `floor_color`, `floor_thickness`, `floor_sqm`, `floor_lot`, `floor_tech_notes`
- **Tempistiche**: `planned_start_date`, `planned_end_date`, `available_days`, `estimated_hours`
- **Logistica**: `building_floor`, `has_elevator`, `access_difficulty` (facile/media/difficile), `parking_available`, `parking_distance_m`, `ztl_zone`, `permits_required`, `electricity_available`, `water_available`, `inhabited`, `construction_type` (nuova/ristrutturazione), `logistics_notes`
- **Contatti**: `contact_email` (gli altri esistono già)
- **Priorità**: `priority` (bassa/media/alta/urgente)
- **GPS**: `latitude`, `longitude` (per verifica distanza turno)

Nuove tabelle:
- `site_accessories` — accessorio (battiscopa/profili/sottopavimento/materassino/colla/silicone/stucco/giunti/altro), quantità, note
- `site_equipment` — attrezzatura richiesta (taglierina/sega/laser/trapano/aspiratore/miscelatore/martello/carrello/scala/prolunghe/DPI/altro)
- `site_checklist_items` — voce checklist + ordine + `completed_by` + `completed_at` (config admin, spunta operaio)
- `site_issues` — segnalazione operaio: tipo (materiale_mancante/tecnico/ritardo/cliente_assente/altro), descrizione, foto obbligatoria, stato (aperta/chiusa), `reported_by`, `resolved_at`
- `site_attachments` — file admin (planimetrie/disegni/PDF/foto iniziali/documenti) su bucket `site-media`

Estensione `site_work_logs` con colonne GPS:
- `start_latitude`, `start_longitude`, `end_latitude`, `end_longitude`, `start_distance_m`, `end_distance_m`

Estensione `site_media` con `phase` enum (`pre`|`during`|`post`) — già usato `description` per pre/post, aggiungiamo `during`.

RLS coerente con pattern esistente: admin gestisce, operai assegnati al cantiere leggono/inseriscono dove pertinente. GRANT a `authenticated` e `service_role`.

---

## 2) Lato Admin — `src/pages/admin/AdminCantiereDetail.tsx`

Riorganizzo in sezioni (accordion o tab interni alla pagina, mantenendo header attuale):
1. **Info pavimento** — form con tutti i campi tecnici
2. **Accessori** — tabella editabile (add/remove righe)
3. **Attrezzatura** — multi-select checklist
4. **Tempistiche** — date + ore + calcoli auto (giorni rimanenti, ritardo, avanzamento % da checklist)
5. **Caratteristiche cantiere** — form logistica completo
6. **Indirizzo & contatti** — campi + bottoni Chiama / Maps / WhatsApp
7. **Allegati** — upload multipli su `site-media` con `phase='attachment'`
8. **Checklist lavori** — builder voci ordinate
9. **Priorità** — selettore con badge colorato
10. **KPI** — pannello con: % avanzamento, giorni residui, ore lavorate vs previste, n. foto, n. segnalazioni aperte
11. **Segnalazioni** — lista issues con possibilità di chiuderle

---

## 3) Lato Operaio — `src/pages/role-app/OperaioCantiereDetail.tsx`

Estendo l'header con: stato, badge priorità, giorni rimanenti, referente, telefono, indirizzo, bottoni Chiama/Maps/WhatsApp.

Aggiungo nuovi tab (oltre a Ore/Foto/Chat esistenti):
- **Info** — pavimento, accessori, MQ, note tecniche, caratteristiche cantiere (sola lettura)
- **Attrezzatura** — checklist "portato / mancante" salvato per turno corrente
- **Checklist** — voci configurate da admin, operaio spunta (salva `completed_by`/`completed_at`)
- **Segnala** — bottone "Segnala problema" → sheet con tipo + descrizione + foto obbligatoria (upload su `site-media`)

Aggiornamenti tab esistenti:
- **Ore**: aggiungo riepilogo "totale sul cantiere", "oggi", "residue stimate" (estimated_hours - totale). Su `Inizia turno` richiedo geolocalizzazione browser, calcolo distanza haversine dal cantiere, salvo `start_latitude/longitude/distance_m`; idem `Termina turno`.
- **Foto**: aggiungo bottone "Durante lavori" oltre a PRE/POST; ogni foto già ha `created_at` come timestamp.

---

## 4) File toccati

- `supabase/migrations/<nuova>.sql` — schema + RLS + GRANT
- `src/pages/admin/AdminCantiereDetail.tsx` — esteso
- `src/pages/role-app/OperaioCantiereDetail.tsx` — esteso, nuovi tab
- Piccoli componenti nuovi: `src/components/admin/cantieri/SiteAccessoriesEditor.tsx`, `SiteEquipmentEditor.tsx`, `SiteChecklistEditor.tsx`, `SiteAttachmentsEditor.tsx`, `SiteKPIPanel.tsx`
- `src/components/role-app/SiteIssueSheet.tsx` — segnalazione operaio
- Helper: `src/lib/geo.ts` (haversine)

---

## 5) Cosa NON faccio
- Non tocco la struttura del CRM né le rotte
- Non rifaccio la chat (resta com'è, già per-cantiere)
- Non aggiungo i18n nuovi se non strettamente necessario (italiano come oggi nel modulo)

---

## Note tecniche
- Calcoli auto (giorni rimanenti, ritardo, avanzamento %) lato client da campi `planned_*` e checklist completata
- GPS: `navigator.geolocation.getCurrentPosition` con fallback graceful se utente rifiuta (turno parte comunque, distanza = null)
- Foto segnalazione: obbligo lato UI (submit disabilitato senza file)
- Bucket `site-media` già pubblico, riuso pattern upload esistente
- Storico cantiere: già coperto da tabelle esistenti (`site_work_logs`, `site_media`, `site_chat_messages`) + nuove `site_issues`

Confermi e procedo con la migrazione + codice?