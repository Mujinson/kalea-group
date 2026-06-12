## Obiettivo
Aggiungere una nuova sezione **"Strumenti"** nella sidebar admin con 4 pagine calcolatore/pricing, con persistenza dei parametri su Lovable Cloud.

## Struttura sidebar
Nuovo gruppo in `src/components/admin/AdminSidebar.tsx` (icona `Wrench`/`Calculator`, `adminOnly: true`):

- Costo Operaio → `/admin/strumenti/costo-operaio`
- Sostenibilità → `/admin/strumenti/sostenibilita`
- Pricing Flow → `/admin/strumenti/pricing-flow`
- Pricing Kronos → `/admin/strumenti/pricing-kronos`

## Pagine (scheletro)
Creo 4 file in `src/pages/admin/strumenti/`:

1. **CostoOperaio.tsx** — slider (netto mensile, giorni lavorativi, pasto, furgone, telepass, trasferta, albergo) → costo mese/anno/giorno/ora + pricing posa €/mq (break-even / target / premium).
2. **Sostenibilita.tsx** — slider costi fissi (operaio, commercialista, tools, ads, affitto, assicurazioni, varie, soci) + volumi (mq fornitura/posa, markup, prezzo posa) → conto economico mensile, 3 scenari, markup consigliato, accantonamento 15%.
3. **PricingFlow.tsx** — tabella prodotti Flow 2025 (dataset in attesa). Slider sconto fornitore (default 0,45 = 50+10) e markup Kalēa (default 60%). Per riga: costo, prezzo, margine %, sconto max cliente. Calcolatore preventivo (mq, sfrido, sconto cliente → totale, margine, break-even).
4. **PricingKronos.tsx** — tabella prodotti Kronos 2026 (dataset in attesa). Slider sconto fornitore (default 0,36 = 50+20+10) e markup (default 70%). Filtri per collezione (Pierre Vive, Materia, Piasentina, Nativa, Metallique, Le Reverse, Les Bois, Outdoor). Calcolatore preventivo con battiscopa incluso.

Tutte le pagine usano i componenti admin esistenti (`Card`, `Slider`, `DataTable`, palette `#F5F0EA` / `#3B2314` / `#C8A96E`, font New Order) per coerenza visiva.

## Dataset prodotti
Salvati come file statici in `src/data/strumenti/`:
- `flowProducts.ts`
- `kronosProducts.ts`

Inizializzati vuoti / con TODO; popolati appena mandi il JSON nei messaggi successivi.

## Persistenza parametri (Lovable Cloud)
Nuova tabella `public.tool_settings`:

| campo | tipo |
|---|---|
| `id` | uuid PK |
| `user_id` | uuid (auth.users) |
| `tool_key` | text (`costo_operaio` \| `sostenibilita` \| `pricing_flow` \| `pricing_kronos`) |
| `settings` | jsonb (slider values) |
| `created_at` / `updated_at` | timestamptz |

UNIQUE su `(user_id, tool_key)`. RLS: ogni utente vede/modifica solo i propri record; `service_role` ALL. GRANT a `authenticated` + `service_role`.

Hook `useToolSettings(toolKey, defaults)` con upsert debounced (~500ms) su modifica slider.

## Routing
Aggiungo le 4 route figlie sotto `AdminLayout` in `src/App.tsx`.

## Workflow incrementale
1. Confermi il piano → creo sidebar + 4 pagine scheletro + tabella `tool_settings` + hook persistenza, con UI funzionante ma dataset vuoti per Flow/Kronos.
2. Mi mandi JSON Flow → popolo `flowProducts.ts`.
3. Mi mandi JSON Kronos → popolo `kronosProducts.ts`.
4. Iterazioni HTML per pagina come da tuo workflow.

## Domande aperte
- I parametri devono essere **per utente** (ogni admin il suo set) o **globali** (condivisi tra tutti gli admin)? Default proposto: per utente.
- Per Sostenibilità i 3 scenari (prudente/realistico/ottimistico) li calcolo con quali moltiplicatori sui volumi? Proposta: −20% / baseline / +20% sui mq venduti. Confermi o mi dai i tuoi?
