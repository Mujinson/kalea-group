# Scheda "Contabilità" interna nel preventivo

Nuova scheda nel back office di ogni preventivo, visibile solo agli admin e mai nel PDF del cliente. Riprende la logica del foglio "Contabilità F" in Excel.

## Cosa vedrai
Una tabella con una riga per ogni voce del preventivo (prodotti, accessori, servizi, righe manuali) e queste colonne:

```text
Descrizione | Q.tà | U.M. | Prezzo fornitore | Sconto fornitore % | Costo netto unit. | Spese Kalēa (costo tot.) | Ricarico % | Prezzo cliente unit. | Totale cliente | Utile € | Incidenza %
```

- **Precompilata:** prezzo fornitore, sconto e ricarico arrivano dal catalogo, mentre quantità e prezzo cliente arrivano dal preventivo.
- **Modificabile:** puoi correggere a mano il costo e lo sconto fornitore per quel singolo preventivo. Il catalogo non cambia.
- **Costi extra** (righe gialle dell'Excel): trasporto (km andata+ritorno × €/km), scarico con gru, smaltimento rifiuti, riconoscenza o provvigione in %, posa interna o squadra. Ogni costo extra si può attivare o disattivare.
- **Riepilogo in fondo:**
  - spese Kalēa totali
  - totale cliente netto, considerando lo sconto e la cifra pattuita
  - utile in €
  - margine in %
  - incidenza dei costi extra
  - valore acconto e quanto copre delle spese
- Colori come nell'Excel: verde se il margine è ≥25%, giallo tra 10% e 25%, rosso sotto il 10%. È la stessa soglia del controllo margine che il preventivo usa già.
- **Esporta Excel:** scarica il foglio in .xlsx con le formule, come il vostro file attuale.

## Dove
Nell'editor del preventivo apri il pannello "Contabilità interna", accanto al controllo margine che esiste già. In più, la scheda è disponibile in sola lettura dalla vendita, una volta convertita.

## Note tecniche
- I dati restano nel preventivo stesso: nessuna nuova tabella, quindi niente rischi per le altre funzioni.
- I calcoli vanno in un unico file di calcolo con test: costo netto = prezzo fornitore × (1 − sconto), totale cliente, utile, margine e trasporto a km.
- L'esportazione Excel si fa direttamente dal browser.
