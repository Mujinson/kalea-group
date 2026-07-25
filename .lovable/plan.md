# Pricing pages → catalogo Supabase (fonte unica)

Obiettivo: le 6 pagine in `src/pages/admin/strumenti/Pricing*.tsx` smettono di usare array hardcoded e leggono i prezzi da `catalog_products`, filtrati per brand del listino. Layout e stile invariati — cambia solo la fonte dati.

## 1. Mapping brand per listino (in `_shared.tsx`)

Aggiungo una costante esportata:

```ts
export const PRICING_BRAND_MATCH: Record<string, (brand: string, collection: string) => boolean> = {
  flow:        (b, c) => b.includes("flow"),
  kronos:      (b, c) => b.includes("kronos"),
  berryalloc:  (b, c) => b.includes("berry"),
  parquet:     (b, c) => b.includes("woodco") || c.includes("parquet"),
  signature:   (b, c) => b.includes("signature") || c.includes("signature"),
  externo:     (b, c) => b.includes("externo") || c.includes("externo"),
};
```
Match case-insensitive (lowercase in confronto).

## 2. Hook condiviso `usePricingCatalog(key)` in `_shared.tsx`

Esegue una sola volta la query (pattern identico a `CreaPreventivo.tsx` righe 1034-1094):

- `.from("catalog_products").select("product_code, name, collection, format, list_price, supplier_discount_percentage, unit_of_measure, is_active, catalog_brands(name)")`
- `.eq("is_active", true).gt("list_price", 0).order("name")`

Poi divide client-side in due liste applicando `PRICING_BRAND_MATCH[key]`:

- `prodotti`: righe la cui `collection` NON contiene "accessor"
- `accessori`: righe la cui `collection` contiene "accessor"

Ritorna `{ prodotti, accessori, loading, error }`. Ogni elemento è mappato in forma neutra:
`{ id: product_code, nome: name, dims: format, listino: list_price, unita: unit_of_measure ?? "mq", note: collection, brand: catalog_brands.name }`.

Lo sconto fornitore usato è quello scelto via `useToolSettings` (SCONTI locali già esistenti nelle pagine) — `supplier_discount_percentage` del DB NON viene applicato qui, per non rompere la logica corrente delle pagine.

## 3. Aggiornamento delle 6 pagine

Per ognuna di `PricingFlow`, `PricingKronos`, `PricingBerryAlloc`, `PricingParquet`, `PricingSignature`, `PricingExterno`:

- Rimuovo gli array `PRODOTTI` e `ACCESSORI` hardcoded.
- Chiamo `usePricingCatalog("flow" | "kronos" | ...)`.
- Mentre `loading === true`: skeleton (3-4 righe grigie animate, stesso stile del box card esistente).
- Se `!loading && prodotti.length === 0`: banner testuale
  > "Nessun prodotto trovato nel catalogo per questo listino — verifica i brand in Catalogo → Marche"
  al posto delle tabelle.
- Card riepilogo (listino/costo/prezzo/margine medio) ricalcolate su `prodotti` reali con `coeff` e `markup` correnti.
- Tabelle Prodotti e Accessori usano gli array caricati (le colonne/formattazioni restano identiche).
- Sconto fornitore (SCONTI locali) + markup + useToolSettings restano invariati.

## 4. Pulsante "Crea preventivo"

Nella card/riga prodotto (accanto al selettore già esistente per il calcolatore inline) aggiungo un bottone piccolo `Crea preventivo` che fa:

```ts
navigate(`/admin/preventivi/nuovo?product_code=${encodeURIComponent(id)}`);
```

## 5. `CreaPreventivo.tsx` — lettura query param

- Con `useSearchParams()` leggo `product_code`.
- Dentro l'effect che carica `PRODOTTI`, dopo `setPRODOTTI(mapped)`: se `product_code` presente e trovato in `mapped`, preseleziono quel prodotto e porto `step` allo step calcolo. Se non trovato, nessuna azione (utente parte dalla ricerca normale).

## 6. Cosa NON cambia

- Layout, stili inline, palette, dimensioni delle 6 pagine.
- Logica SCONTI/markup/useToolSettings.
- Route esistenti.
- Nessuna migration DB.

## File toccati

- `src/pages/admin/strumenti/_shared.tsx` (aggiunta `PRICING_BRAND_MATCH` + hook `usePricingCatalog`)
- `src/pages/admin/strumenti/PricingFlow.tsx`
- `src/pages/admin/strumenti/PricingKronos.tsx`
- `src/pages/admin/strumenti/PricingBerryAlloc.tsx`
- `src/pages/admin/strumenti/PricingParquet.tsx`
- `src/pages/admin/strumenti/PricingSignature.tsx`
- `src/pages/admin/strumenti/PricingExterno.tsx`
- `src/pages/admin/strumenti/CreaPreventivo.tsx` (solo lettura `product_code`)

## Rischio / da confermare

Il match "Signature" (brand+collection contengono "signature") potrebbe sovrapporsi a Woodco Parquet se in DB i prodotti Signature sono registrati sotto brand Woodco con collection "Signature". Se succede, i prodotti Signature apparirebbero anche in Parquet. Vuoi che escluda `signature` dal match Parquet? Procedo con questa esclusione salvo diversa indicazione.
