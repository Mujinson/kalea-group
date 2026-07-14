# Redesign CRM — stile Monday.com premium

Ho analizzato le 6 immagini di riferimento (Monday CRM Deals/Leads dashboard, tabelle UX/UI Board, Marketing campaigns, Team Projects). Il linguaggio visivo è chiaro:

- Superfici bianche pulite su sfondo lavanda/crema tenuissimo (`#F6F7FB` / `#F7F1E7`)
- Card con `border-radius` grande (16–20px), ombra morbida diffusa, senza bordi duri
- Tabs sottili con underline colorato per la view attiva
- Header di tabella minimal, righe alte, hover leggero, badge di stato pieni con colori vivi (verde, blu, viola, rosso, arancione, giallo)
- Kanban con header colonna colorato pieno per stage, card interne bianche con micro-metadati "Owner / Value / Contact"
- KPI card con numeri **enormi** (48–72px), etichetta piccola sopra, mini-chart o battery indicator sotto
- Toolbar con pill buttons: `+ New`, `Search`, `Person`, `Filter`, `Sort`
- Tipografia sans neutra, gerarchia forte (titolo pagina 24–28px semibold, tutto il resto piccolo)
- Sidebar sinistra icon-only stretta con accento verticale sulla voce attiva

Considerata la scala (decine di pagine admin + role-app + drawer/modali/tabelle condivise), procedo in 3 fasi. Ogni fase è mergeabile da sola.

## Fase 1 — Design System (fondamenta)

Un'unica passata sui token e sulle primitive. Aggiornare questo strato ridipinge automaticamente gran parte del CRM.

**Token in `src/index.css`** — nuova palette CRM (namespace `--crm-*` per non toccare il sito pubblico Kalēa):
- Superfici: `--crm-bg` off-white lavanda `#F6F7FB`, `--crm-surface` bianco puro, `--crm-surface-2` `#FAFBFD`
- Testo: `--crm-ink` `#0F172A`, `--crm-ink-muted` `#64748B`, `--crm-ink-subtle` `#94A3B8`
- Bordi: `--crm-border` `#EEF0F4`, `--crm-border-strong` `#E2E6EE`
- Primario: `--crm-primary` indigo `#4F46E5`, `--crm-primary-600` `#4338CA`, con glow `#818CF8`
- Accenti semantici Monday-like: `--crm-success` `#00C875`, `--crm-warning` `#FDAB3D`, `--crm-danger` `#E44258`, `--crm-info` `#0086C0`, `--crm-purple` `#A25DDC`
- Ombre: `--crm-shadow-sm` soffusa 1px, `--crm-shadow-md` per card (`0 4px 20px -8px rgba(15,23,42,.08)`), `--crm-shadow-lg` per popover/modal
- Radius: `--crm-radius` 12px (input/badge), `--crm-radius-lg` 16px (card), `--crm-radius-xl` 20px (modal)
- Blur: `--crm-blur` 12px per glass overlay

**tailwind.config.ts** — estendere `colors.crm.*`, `boxShadow.crm-*`, `borderRadius.crm-*`, keyframes `fade-up`, `scale-in`, `shimmer`.

**Primitive shadcn da rifare** (varianti aggiuntive, non breaking):
- `Button` — nuove varianti `crm-primary`, `crm-secondary`, `crm-ghost`, `crm-danger`, `crm-success`, `crm-icon`, con animazioni press/hover fluide
- `Badge` — varianti Monday-status: `working`, `done`, `stuck`, `new`, `qualified`, `disqualified` (pill piena con testo bianco)
- `Card` / nuovo `CrmCard` — bianco, `shadow-crm-md`, radius-lg, hover-lift opzionale
- `Input`, `Textarea`, `Select` — altezza 40px, radius 12, focus ring indigo soft
- `Dialog` / `Sheet` — overlay blur 12px, contenuto radius-xl, animazioni scale-in+fade, header sticky con icona
- `Tooltip` — dark pill compatta, freccia
- `DropdownMenu` — radius-lg, shadow-lg, item hover indigo/5
- `Toast` (sonner) — theme con crm tokens
- `Tabs` — variant `crm-underline` (tab attivo con underline 2px indigo, hover ink)
- `Skeleton` — animazione shimmer verso destra

**Componenti CRM nuovi in `src/components/admin/crm-ui/`**:
- `KpiCard` — label piccola, valore XL, delta con freccia, mini sparkline opzionale
- `StatusPill` — mappa key→color coerente in tutto il CRM
- `DataTableV2` — sticky header, righe 56px, hover, sort elegante, empty state grafico, toolbar `+ New / Search / Person / Filter / Sort`
- `PageHeader` — titolo grande + breadcrumb + azioni + tabs sotto
- `KanbanBoard` — header colonna colorato con conteggio, card compatte con metadati
- `EmptyState` — illustrazione monocolore + titolo + CTA
- `GlobalCommandK` — command palette globale (Cmd+K) su tutta l'admin

**Shell**:
- `AdminSidebar` rifatta: 240px espansa / 64px collapsed, gruppi, active state con pill indigo, avatar in basso
- Header sticky bianco con breadcrumb + search globale + notifiche + avatar

**Deliverable Fase 1**: tutte le pagine esistenti restano funzionanti, appaiono già più pulite grazie ai nuovi token; le pagine non ancora rifinite convivono con quelle finite senza rotture.

## Fase 2 — Pagine ad alta visibilità (Monday-style pieno)

Rifacimento visivo, zero cambi di logica/dati. Ordine:

1. **AdminOverview** — KPI grid con `KpiCard` (Fatturato mese, Leads aperti, Preventivi in corso, Cantieri attivi), sales trend chart, "Attività recenti" timeline, "Top commerciali" leaderboard con avatar
2. **AdminLeads** — toolbar Monday (`+ Nuovo Lead / Cerca / Persona / Filtro / Ordina`), tabs (Tutti / I miei / Nuovi / Qualificati / Persi), `DataTableV2` con `StatusPill` colorati per stato, colonna assegnatario con avatar-pill
3. **AdminPipeline** — kanban con header colonna colorato pieno per stage (`nuovo` viola, `contattato` blu, `qualificato` teal, `preventivo` giallo, `chiuso` verde, `perso` rosso), totale €/count nell'header, card drag ombreggiate
4. **LeadDetailSheet** — Sheet largo (600px), header con avatar+status pill+quick actions, sezioni collassabili (Info, Timeline attività, Preventivi, Note, Allegati)
5. **AdminCustomers** + `CustomerDetailSheet` — stessa grammatica di Leads
6. **AdminQuotes** + `AdminQuoteCreate` — tabella preventivi + wizard stepper elegante
7. **CatalogPrices / CatalogBrands / CatalogCollections / CatalogPriceLists** — tabelle unificate
8. **AdminPlanner / AdminAppointments / AdminCantieri** — calendar/board coerenti
9. **AdminCommissions / AdminPayments / AdminContabilita / AdminFatturazione** — dashboard finance con KPI card verdi/rossi
10. **AdminSettings / AdminImport / AdminMedia / AdminAnalytics / AdminMap / AdminChatbot** — pulizia layout
11. **Login / NotFound / empty states / loading states** — coerenza fino ai bordi

Ogni pagina: PageHeader → tabs → toolbar → contenuto → drawer/modal se applicabile.

## Fase 3 — Role apps + rifinitura

- `CommercialeApp`, `IbridoApp`, `OperaioApp` con RoleAppLayout aggiornato (topbar mobile-first, bottom nav, cards in stile CRM)
- `CommercialeHome`, `CommercialeLeads`, `CommercialeLeadDetail`, `CommercialeCalendario`, `CommercialeQuotes`
- `IbridoCommissioni`, `OperaioCalendario`, `OperaioSites`, `OperaioCantiereDetail`
- Notification center, CrmAssistantChat, CrmFaqDialog, NotificationsBell — allineati
- Pass finale: audit ogni pagina admin per stati vuoti, loading skeleton coerenti, toast, conferme di eliminazione (`AlertDialog` con icona rossa)

## Cosa NON cambia

- Nessuna modifica a query, RLS, edge functions, business logic, calcoli commissioni/prezzi
- Rotte invariate
- Il sito pubblico Kalēa (Home, Hypermatt, Externo, ecc.) non viene toccato: i token CRM sono in namespace separato `--crm-*`

## Dettagli tecnici

- Framework: React + Tailwind + shadcn già in uso, aggiungo Framer Motion (`framer-motion` è già dep) per transizioni Sheet/Dialog/tab switch (durata 180–240ms, easing spring soft)
- Font: mantengo lo stack sans di sistema (Inter-like) — coerente con Monday/Linear/Attio. Titoli 600, corpo 400/500
- Icone: solo `lucide-react`, stroke 1.75, size 16/18/20 coerenti
- Responsive: breakpoint md/lg testati; a `<768px` sidebar collapse in drawer, tabelle diventano card list
- Zero regressioni funzionali: ogni pagina rifatta viene aperta e verificata (screenshot Playwright su rotte chiave)

## Ordine di consegna proposto

Comincio subito con **Fase 1 completa** (design system + primitive + shell) in questo turno perché è la base su cui poggia tutto. Poi rispondo con la lista di pagine di Fase 2 da attaccare per prime — mi hai già indicato Overview + Leads + Pipeline come priorità dalle immagini.

Confermi? Se preferisci vedere prima 2-3 direzioni visive alternative (più Attio-clean vs più Monday-vivace vs più Linear-minimal) prima che tocchi i token, dimmelo e le genero come prototipi HTML da confrontare.