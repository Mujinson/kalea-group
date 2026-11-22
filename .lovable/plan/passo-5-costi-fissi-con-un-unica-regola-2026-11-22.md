# Passo 5 — Costi fissi con un'unica regola

## Obiettivo
Oggi i costi fissi (`fixed_costs`) vengono trasformati in "costo mensile" in modo diverso in 5 punti. Dopo questo passo ogni pagina userà la stessa funzione, così Dashboard, Contabilità, Marginalità e Profitto mostrano lo stesso costo fisso mensile e annuo.

Nota: `static_costs` non è un doppione: è il costo materiale al m² usato da Preventivi, Vendite, Analytics e scheda cliente. Resta com'è; lo rinomino solo a schermo come "Costo materiale al m²" se l'etichetta oggi crea confusione.

## Pagine coinvolte
- Dashboard (`AdminOverview.tsx`, `FinanceOverviewBlock.tsx`)
- Contabilità (`AdminContabilita.tsx`)
- Marginalità cantieri (`CantieriMarginalita.tsx`)
- Profitto aziendale (`profitData.ts`)
- Scadenzario (`useScadenzario.ts`) — solo lettura scadenze, verifico che usi le stesse date

## Cosa faccio
1. Leggo come ogni pagina calcola oggi il mensile (frequenza mensile/trimestrale/annuale/una tantum, data inizio, pagato/non pagato) e annoto le differenze.
2. Creo `src/lib/fixedCosts.ts` con: costo mensile equivalente, totale nel periodo (mese/anno/YTD), quota giornaliera per cantiere. Mantengo la regola più usata; correggo solo errori evidenti e li elenco.
3. Sostituisco i calcoli nelle pagine sopra con la funzione unica.
4. Test in `src/lib/fixedCosts.test.ts`: mensile ×1, trimestrale ÷3, annuale ÷12, una tantum solo nel suo mese, costi futuri esclusi dal periodo.
5. Tabella finale per pagina: valore prima / dopo sui dati attuali, con motivo di ogni cambiamento.

## Cosa NON tocco
Nessuna modifica a righe, colonne, tabelle o migrazioni. Menu invariato. Non inizio il passo 6.
