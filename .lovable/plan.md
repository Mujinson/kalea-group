
# Catalogo Generale — Piano di implementazione

Trasformo `catalog_products` nell'unica fonte di verità per prodotti/accessori/servizi in tutto il CRM (preventivi, offerte, fatture, magazzino, commissioni, statistiche). Vista l'ampiezza del lavoro lo consegno in **4 fasi**: ognuna funzionante e non-breaking. Confermami la Fase 1 e procedo in ordine.

## Stato attuale (verificato)

- Tabella `catalog_products` esiste già con ~2.579 prodotti, campi ricchi (codice, prezzo listino, sconto fornitore, markup, IVA, formato, spessore, colore, stock, ecc.) e `product_type` = article/accessory/service.
- `product_categories` esiste ma è piatta (name, slug, parent_id).
- `brand` e `collection` sono oggi campi testo liberi su `catalog_products` → nessuna anagrafica reale.
- La pagina `/admin/catalogo` esiste ma è basilare. I preventivi (Kalea + hybrid catalog sections) già leggono da `catalog_products` via `CatalogProductPicker`.
- Sales/site_materials/quotes.items memorizzano snapshot testuali dei prodotti (nome+prezzo) — corretto per storico prezzi, ma dovranno **sempre** partire dal catalogo.

---

## Fase 1 — Fondamenta dati (schema + menu)

### DB — nuove tabelle
- `catalog_brands` (name unique, logo_url, color, display_order, is_active)
- `catalog_collections` (brand_id FK, name, description, image_url, display_order, is_active — unique brand_id+name)
- `catalog_price_lists` (nome, versione auto-incrementale, data, source_file, status: draft/applied/archived, created_by, note)
- `catalog_price_list_items` (price_list_id, snapshot completo del prodotto + diff_type: new/updated/deleted/price_changed)
- Estendo `catalog_products`: `brand_id` FK, `collection_id` FK, `barcode`, `purchase_price`, `subcategory`, `image_url`, `technical_sheet_pdf_url`, `attributes jsonb`
- Estendo `product_categories`: `macro_category` enum ('articoli','accessori','servizi') per la gerarchia richiesta
- Nuova `catalog_audit_log` (product_id, user_id, field, old_value, new_value, action, ts)
- Trigger di audit su tutte le modifiche di `catalog_products`, `catalog_brands`, `catalog_collections`
- Backfill: derivo brand/collection dai campi testo esistenti in nuovi record delle tabelle anagrafica

### RLS/Grants
Tutti admin: full manage. Commerciali: SELECT. `catalog_price_lists` e `catalog_audit_log`: solo admin.

### Menu
Nuova voce sidebar **Catalogo** (icona `Library`, colore proprio) sopra Magazzino, con sotto-voci:
- Prodotti
- Marche
- Collezioni
- Categorie
- Listini & versioni
- Storico modifiche
- Importa

Rimuovo "Catalogo prodotti" da Magazzino (rimane "Lista articoli" = stock).

---

## Fase 2 — UI catalogo (CRUD completo)

- `/admin/catalog` — lista prodotti server-side con paginazione (25/50/100), lazy loading, ricerca istantanea (codice/SKU/barcode/nome/desc/marca/collezione via `ilike` + indici), filtri combinabili (macro, marca, collezione, categoria, sottocategoria, fornitore, stock, stato, fascia prezzo), selezione multipla + azioni bulk (sconto, IVA, categoria, marca, collezione, stato, disponibilità).
- `/admin/catalog/product/:id` — scheda completa modificabile (tutti i campi), upload immagine + scheda tecnica PDF su bucket `product-images` (nuovo `catalog-docs` per PDF), tab "Storico modifiche" dalla `catalog_audit_log`, tab "Storico prezzi" già esistente.
- `/admin/catalog/brands` — CRUD marche con logo/colore/ordine.
- `/admin/catalog/collections` — CRUD collezioni raggruppate per marca.
- `/admin/catalog/categories` — CRUD categorie con macro-categoria e sottocategorie.

---

## Fase 3 — Import listini con anteprima/versioni

- `/admin/catalog/import` — upload `.xlsx`, `.csv`, `.pdf`
  - XLSX/CSV: parsing con `xlsx` (già in progetto)
  - PDF: estrazione tabellare via edge function `catalog-import-parse` (Lovable AI Gemini per riconoscere colonne)
- **Auto-mapping** dei campi con euristica su nomi colonna; per ogni colonna non riconosciuta modale con dropdown "mappa a → codice / SKU / nome / …".
- **Anteprima diff** (nessuna scrittura): tab Nuovi / Aggiornati / Eliminati / Prezzi cambiati con conteggi e tabella dettaglio.
- Alla conferma: creo `catalog_price_lists` versione N+1 (per marca o globale), applico patch a `catalog_products`, popolo `catalog_price_list_items` per storico.
- `/admin/catalog/price-lists` — lista versioni + diff visuale fra due versioni.

---

## Fase 4 — Integrazione con moduli esistenti (compatibilità)

- **Preventivi Kalea** (`CreaPreventivo.tsx`): mantengo i calcoli automatici mq/posa (business logic Kalea) ma la selezione articoli/accessori/servizi già va via `CatalogProductPicker` — verifico che nessuna riga possa essere creata senza `catalog_product_id`.
- **Preventivi generali** (`AdminQuoteCreate.tsx`): ogni riga richiede product picker dal catalogo (manuale consentito solo per servizi custom, comunque marcato come "off-catalog"). Snapshot di nome/prezzo per storico.
- **Offerte, Ordini, Fatture** (`customer_invoices`, `sales`, `sale_items`): il picker prodotti punta a `catalog_products`. Nessun cambiamento di schema (già usano snapshot testuali che restano validi per compatibilità dati esistenti).
- **Magazzino** (`inventory`): collego `inventory.product_id` → `catalog_products.id` dove combacia via codice; conservo record esistenti.
- **Site materials/accessories**: già FK a `catalog_products`. Nessuna azione.
- **Commissioni/Statistiche**: già calcolano da `quotes.items` — nessun cambiamento.

**Compatibilità**: nessuna migrazione distruttiva. Tutti i campi nuovi sono nullable, i dati esistenti rimangono, i moduli esistenti continuano a funzionare mentre migrano progressivamente al picker.

---

## Domanda operativa

Confermi che procedo in ordine 1 → 2 → 3 → 4 (una fase per turno, così puoi testare fra una e l'altra)? Oppure preferisci che parta subito con Fasi 1+2 insieme?
