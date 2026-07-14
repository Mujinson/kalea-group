Stato attuale del redesign CRM (base: `.lovable/plan.md`).

## Fatto
- **Fase 1 — Design System**: token `--crm-*`, `tailwind.config` esteso, primitive CRM (`KpiCard`, `StatusPill`, `PageHeader`, `CrmToolbar`, `EmptyState`), `AdminSidebar` bianco con tile colorate + fix posizionamento sotto header, `AdminLayout` sticky bianco con search ⌘K, `CrmShell`, `DataTable` restilizzata.
- **Fase 2 — Overview**: `AdminOverview` migrata al nuovo palette indigo/Monday (KPI, gauge, panel, tab bar, stage colors).

## Da fare — Fase 2 (pagine ad alta visibilità)
1. `AdminLeads` — toolbar Monday, tabs, `DataTableV2` con `StatusPill`
2. `AdminPipeline` — kanban con header colonna colorato pieno per stage
3. `LeadDetailSheet` — sheet largo con sezioni collassabili
4. `AdminCustomers` + `CustomerDetailSheet`
5. `AdminQuotes` + `AdminQuoteCreate` (wizard stepper)
6. Catalogo: `CatalogPrices`, `CatalogBrands`, `CatalogCollections`, `CatalogPriceLists`, `CatalogCategories`, `CatalogHistory`, `CatalogImport`
7. `AdminPlanner`, `AdminAppointments`, `AdminCantieri` (+ dashboard, materiali, budget, report, operai, timbrature, ferie)
8. Finance: `AdminCommissions`, `AdminPayments`, `AdminContabilita`, `AdminFatturazione`, `AdminCosti`
9. Strumenti: `Preventivatore`, `SistemaPreventivi`, `CostoOperaio`, `Sostenibilità`, tutti i `Pricing*`
10. `AdminSettings`, `AdminImport`, `AdminMedia`, `AdminAnalytics`, `AdminMap`, `AdminChatbot`, `AdminVendite`, `AdminPreventivi`, `AdminMagazzino`
11. `Login`, `NotFound`, empty/loading states globali

## Da fare — Fase 3 (role apps + rifinitura)
- `RoleAppLayout` mobile-first, bottom nav in stile CRM
- `CommercialeApp` (Home, Leads, LeadDetail, Calendario, Quotes)
- `IbridoApp` (Commissioni + tutto Commerciale)
- `OperaioApp` (Calendario, Sites, CantiereDetail)
- Notification center, `CrmAssistantChat`, `CrmFaqDialog`, `NotificationsBell` allineati
- Audit finale: skeleton loading coerenti, toast, `AlertDialog` conferme eliminazione

## Vincoli invariati
- Zero cambi a logica, query, RLS, edge functions, calcoli
- Sito pubblico Kalēa non toccato (token `--crm-*` isolati)

## Prossimo passo proposto
Attaccare in un solo colpo il blocco **Leads + Pipeline + LeadDetailSheet + Customers + CustomerDetailSheet** (grammatica UI condivisa, massimo impatto visivo). Poi Quotes + Catalogo. Poi Finance/Strumenti. Poi role apps.

Confermi questo ordine o vuoi dare priorità diversa (es. Finance prima, o direttamente le role apps mobile)?