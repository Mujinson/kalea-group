## Sistema Ruoli & Permessi CRM Kalēa — Piano di implementazione

Il lavoro è enorme. Lo divido in 8 step incrementali. Ogni step è auto-consistente: alla fine di ciascuno il CRM rimane funzionante. Dopo la tua approvazione del piano procedo con lo **Step 1** e ti aggiorno; tu mi dici "vai" e procedo al successivo (così possiamo correggere il tiro in corsa invece di scoprire problemi a fine lavoro).

---

### Stato attuale (rilevato)
- Ruoli già esistenti nel DB: `admin`, `commerciale`, `operaio` (enum `app_role`).
- Hook `useAdminAuth` già distingue i 3 ruoli.
- Manca: ruolo **ibrido**, RLS granulare per commerciale/operaio, dashboard dedicate, commissioni, ferie, chat cantiere, notifiche giornaliere, mobile-first per tutto.

---

### STEP 1 — Fondamenta DB & Ruoli (migrazione)
- Aggiungo enum value `ibrido` ad `app_role`.
- Tabella `user_profiles` (nome, cognome, avatar_url, attivo, preferenze notifiche, percentuale_commissione, is_commission_earner).
- Tabella `monthly_targets` (user_id, anno, mese, target_eur).
- Tabella `commissions` (preventivo_id, user_id, importo_base, percentuale, importo, stato: maturata/da_liquidare/liquidata, data_liquidazione).
- Tabella `time_off_requests` (user_id, data_inizio, data_fine, tipo, note, stato, approvato_da).
- Tabella `availability_blocks` (user_id, data, fascia, motivo).
- Tabella `site_chat_messages` (cantiere_id, user_id, testo, allegato_url).
- Tabella `site_assignments` (cantiere_id, operaio_id, data, orario_inizio, orario_fine, stato).
- Estensione `leads`/`customers`/`quotes` con `created_by` / `assigned_to` se mancanti.
- RLS granulare:
  - admin → tutto via `has_role(uid,'admin')`
  - commerciale/ibrido → solo righe dove `created_by = auth.uid()` o `assigned_to = auth.uid()`
  - operaio/ibrido → cantieri dove esiste `site_assignments` con `operaio_id = auth.uid()`
- GRANT corretti su tutte le nuove tabelle.
- Trigger: alla `UPDATE` di `quotes.stato = 'accettato'` calcola commissione (solo netto materiale, esclude posa) se l'utente ha `is_commission_earner=true`.

### STEP 2 — Gestione Utenti (Admin Settings)
- Estensione `AdminSettings.tsx`: tabella utenti con ruolo, attivo/disattivo, modifica % commissione, target mensili.
- Form "Nuovo utente" con scelta ruolo (admin/commerciale/operaio/ibrido), flag commissioni + %, upload avatar.
- Edge function `admin-create-user` (service role) per creare auth user + profilo + ruolo in una sola transazione.

### STEP 3 — Routing & Redirect per ruolo
- `useAdminAuth` riconosce `ibrido` e ritorna anche `is_commission_earner` + `commission_pct`.
- Login redirect:
  - admin → `/admin`
  - commerciale → `/app/commerciale`
  - operaio → `/app/operaio`
  - ibrido → `/app/ibrido`
- Guard route che blocca cross-access.
- Layout mobile-first con **Bottom Navigation** dedicata per ruolo.

### STEP 4 — Dashboard Commerciale (mobile-first)
- KPI mese (preventivi inviati/accettati/€/conversione) — query filtrate `created_by = uid`.
- Barra target mensile (verde/giallo/rosso).
- Lista miei lead + miei preventivi + prossimi appuntamenti.
- CTA "+ Nuovo Lead" / "+ Nuovo Preventivo".
- Riuso `CreaPreventivo` ma con flag che nasconde costi interni quando ruolo ≠ admin.

### STEP 5 — Dashboard Operaio (mobile-first)
- Header con stato turno.
- Card cantieri di oggi con: tel: link, Maps link, prodotto/mq, stato cambiabile, bottoni Foto/Chat.
- Vista settimanale calendario personale.
- Bottoni "Richiedi ferie" / "Segnala indisponibilità".
- Scheda cantiere mobile dettagliata (come da mockup ASCII).

### STEP 6 — Dashboard Ibrido + Commissioni
- 3 tab: Oggi (operaio) / Commerciale / Commissioni.
- Tab commissioni: lista, totali, filtro mese, **export PDF** (jsPDF).
- Pannello admin "Commissioni da liquidare" in `/admin/finanza/commissioni`: per persona, marca come liquidata, export CSV/PDF.

### STEP 7 — Ferie, Indisponibilità, Chat cantiere, Foto
- Form richiesta ferie + pannello admin approva/rifiuta con notifica.
- Calendario admin mostra giorni bloccati, warning su assegnazione conflittuale.
- Chat per cantiere (realtime via Supabase channel) con upload allegati su bucket `site-media`.
- Upload foto pre/post posa con thumbnail grid.

### STEP 8 — Notifiche giornaliere & rifiniture mobile
- Edge function `daily-briefing` schedulata via `pg_cron` alle 07:30 Europe/Rome → email tramite Lovable AI / Resend (decidiamo: email built-in o solo notifica in-app).
- `NotificationCenter` esteso con notifiche per: preventivo cambio stato, nuovo messaggio chat, ferie approvate/rifiutate, nuova assegnazione.
- Audit mobile su tutte le viste admin esistenti: hamburger menu, font 16px su input, target touch 52px.

---

### Note tecniche
- Stack: React + Vite + Tailwind + shadcn + Supabase (Lovable Cloud).
- RLS sempre via `has_role()` SECURITY DEFINER per evitare ricorsione.
- Commissioni calcolate **server-side** (trigger SQL), mai client-side.
- Nessuna nuova dipendenza pesante; per PDF uso `jspdf` (già usato altrove nel progetto, da verificare).
- Mobile-first: bottom nav fissa per ruolo non-admin; admin mantiene sidebar + hamburger.

### Costi / impatto
- ~10 nuove tabelle, ~25 nuove pagine/componenti, 2 edge function nuove.
- Tempo stimato totale: lungo. Ti consiglio fortemente di andare uno step alla volta con verifica.

---

**Procedo con lo Step 1 (migrazione DB) appena approvi?**
Se vuoi modifiche all'ordine o vuoi accorpare/dividere step diversamente, dimmelo ora.
