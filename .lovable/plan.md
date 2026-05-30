
# Fase A – Completamento SPC + Parquet con nomi originali

## Cambio di rotta sui nomi
Mantengo i nomi originali delle collezioni (Star K, K-Uno, K-Wood, Connex, Yles, Palladio, Villa, Lumbertech, ecc.) senza rebranding. Il posizionamento resta "Selezione Esclusiva Kalēa" — i nomi dei prodotti sono nomi di collezione, non marchi concorrenti, quindi possono essere mantenuti come nomenclatura tecnica della selezione.

## 1. Aggiornare `src/data/spcCollections.ts`
Riscrivere le 10 entry con i nomi reali:
- Star K, Star K-R, Star K-C, Star K-S, Star K-D
- Star K-W, Star K-W Maxi
- K-Wood, K-Wood Spina
- Connex

Mantenere slug semplici (`star-k`, `star-k-r`, `k-wood`, ecc.), descrizioni, formati, finiture e applicazioni già definite.

## 2. Routing in `src/App.tsx`
Aggiungere:
```
/indoor/spc          → IndoorSpc
/spc/:slug           → SpcCollectionDetail
```
Lazy import coerente con il pattern esistente.

## 3. Hub Indoor (`src/pages/Indoor.tsx`)
Aggiungere card "SPC – Selezione Esclusiva" che linka a `/indoor/spc`. Stesso stile delle card esistenti.

## 4. Navbar (`src/components/Navbar.tsx`)
Dropdown Indoor: aggiungere voce "SPC" → `/indoor/spc`. Tradurre in IT/EN/DE/FR.

## 5. Parquet – estendere `src/data/parquetCollections.ts`
Aggiungere 6 nuove collezioni con nomi originali:
- Yles
- Palladio
- Villa
- Lumbertech 205
- Lumbertech 270
- Lumbertech S700

Usare le immagini già scaricate in `src/assets/parquet-extra/`. Mantenere la struttura dati esistente del file (stessi campi delle collezioni Parquet attuali).

## 6. Localizzazione
Aggiungere chiavi i18n minime per:
- Titolo/sottotitolo pagina SPC
- Card hub Indoor "SPC"
- Voce navbar "SPC"
- Etichette tecniche generiche già non presenti

In IT, EN, DE, FR.

## 7. QA
- Verificare build
- Verificare che `/indoor/spc`, `/spc/star-k`, `/spc/k-wood`, ecc. carichino correttamente
- Verificare che le nuove card Parquet appaiano in `/parquet`
- Controllo visivo viewport desktop + mobile

## Fuori scope (Fase B successiva)
Laminati, Sopraelevati, alternativa Externo, Biowall rivestimenti, Fonoassorbenti — verranno trattati in fasi successive come da piano iniziale.

## Dettagli tecnici
- Nessuna modifica a `src/integrations/supabase/*`
- Nessuna nuova dipendenza
- Asset già presenti, nessun download aggiuntivo in questa fase
- Memoria di progetto: aggiornare la nota sulla nomenclatura prodotti per riflettere che le collezioni della selezione esclusiva mantengono i nomi originali del produttore
