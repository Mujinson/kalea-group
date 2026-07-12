## Obiettivo
Permettere la modifica dei prezzi dei prodotti in catalogo, sia **singolarmente (inline)** sia in **bulk** (multi-selezione).

Attualmente le pagine `CatalogBrands`, `CatalogCollections`, `CatalogCategories` mostrano solo elenchi in sola lettura, e `CatalogImport` aggiorna i prezzi solo tramite import file. Non c'è ancora una UI per editare i prezzi direttamente.

## Cosa aggiungere

### 1. Nuova pagina "Prezzi & Margini" (`/admin/catalogo/prezzi`)
Tabella completa dei prodotti con colonne editabili:
- Codice · Nome · Brand · Categoria
- **Prezzo listino** (`list_price`) — editabile inline
- **Sconto fornitore %** (`supplier_discount_percentage`) — editabile
- **Markup %** (`markup_percentage`) — editabile
- **Prezzo vendita calcolato** (read-only, derivato)
- Attivo (toggle)

Funzioni:
- **Filtri**: brand, categoria, testo libero
- **Edit singolo**: click su cella → input → salva (auto-save on blur, con toast + log automatico in `catalog_price_history`)
- **Edit bulk**: checkbox multipla + barra azioni in alto con:
  - Applica **variazione %** (+/-) al prezzo listino dei selezionati
  - Imposta **sconto fornitore %** uguale per tutti
  - Imposta **markup %** uguale per tutti
  - Attiva/disattiva
- **Undo** ultima operazione bulk (nella sessione)

### 2. Sidebar
Aggiungere voce "Prezzi & Margini" sotto "Catalogo Generale".

## Dettagli tecnici

- Sfrutta i trigger già esistenti (`log_catalog_price_changes` scrive automaticamente in `catalog_price_history`, `log_catalog_audit` scrive in `catalog_audit_log`) → nessuna migration necessaria.
- Bulk = `UPDATE catalog_products SET ... WHERE id = ANY($ids)` in un'unica chiamata.
- Uso di `DataTable` esistente + editor inline custom.
- Paginazione lato client (già gestita da `DataTable`, `pageSize` 50).

## File
- `src/pages/admin/catalog/CatalogPrices.tsx` (nuovo)
- `src/components/admin/AdminSidebar.tsx` (voce menu)
- `src/App.tsx` (route)

## Fuori scope
- Import da file (già coperto da `/admin/catalogo/importa`).
- Listini multipli per cliente (già coperto da `catalog_price_lists`).
