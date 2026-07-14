Stato attuale del redesign CRM (base: `.lovable/plan.md`).

## Fatto
- **Fase 1 — Design System**: token `--crm-*`, `tailwind.config` esteso, primitive CRM (`KpiCard`, `StatusPill`, `PageHeader`, `CrmToolbar`, `EmptyState`), `AdminSidebar` bianco con tile colorate + fix posizionamento sotto header, `AdminLayout` sticky bianco con search ⌘K, `CrmShell`, `DataTable` restilizzata.
- **Fase 2 — Overview**: `AdminOverview` migrata al nuovo palette indigo/Monday (KPI, gauge, panel, tab bar, stage colors).

## Fase 2 — completata (palette swap globale)
- Global sed su tutte le pagine admin: warm-brown → indigo/Monday token
- Fix white-on-white buttons in catalog (Brands/Collections/Categories), CrmAssistantChat, LeadFormDrawer
- Strumenti (`Preventivatore`, `SistemaPreventivi`, `CostoOperaio`, `Sostenibilità`, tutti i `Pricing*`) allineati al nuovo palette

## Da fare — Fase 3 (role apps + rifinitura fine)

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