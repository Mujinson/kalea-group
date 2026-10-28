# Costi squadra e trasferta nel preventivo + dashboard

## Cosa ho capito
- Ogni cantiere ha un costo di squadra che oggi manca: operai, gasolio, Telepass, pranzo e, se si va lontano, albergo e cena.
- La partenza è sempre **Alzano Lombardo**. Si scrive l'indirizzo del cantiere e il sistema calcola da solo km e pedaggi, andata e ritorno.
- Si inseriscono i **giorni di lavoro** e il **numero di operai**. Il sistema moltiplica e dà il costo totale della squadra.
- I 300 €/giorno sono una media: cantiere vicino costa meno, lontano o in trasferta costa di più.
- Gli stessi numeri vanno anche nel CRM, per vedere il costo medio giornaliero per operaio/squadra e il costo giorno per giorno.

## 1. Nel preventivo: blocco "Costi squadra e trasferta"
Va nella Contabilità interna, visibile solo agli admin e mai nel PDF del cliente.
- **Partenza:** Alzano Lombardo, fissa (modificabile solo nelle impostazioni).
- **Arrivo:** indirizzo del cantiere, preso dai dati cantiere del preventivo. Si può correggere.
- **Pulsante "Calcola percorso":** km, tempo di viaggio e pedaggio Telepass stimato, andata e ritorno, tramite Google Maps.
- **Giorni di lavoro** e **numero operai**.
- **Costi giornalieri** (precompilati dalle impostazioni, correggibili solo per quel preventivo):
  - costo operaio al giorno (per persona)
  - gasolio = km A/R × consumo furgone × prezzo gasolio
  - Telepass giornaliero = pedaggio A/R
  - pranzo per persona
- **Trasferta (on/off):** si attiva da sola sopra una distanza o un tempo di viaggio che scegli tu. Aggiunge albergo e cena per persona per notte, e con la trasferta si paga un solo viaggio A/R invece di uno al giorno.
- **Risultato:** costo al giorno, costo totale squadra e confronto con la media di 300 €. Il totale entra nelle spese del preventivo, così utile e margine tornano giusti.

## 2. Impostazioni costi (CRM, solo admin)
Valori standard: costo operaio al giorno, consumo del furgone (l/100 km), prezzo del gasolio, pranzo, albergo, cena e soglia della trasferta.

## 3. Nel CRM: costi reali giorno per giorno
- Quando il preventivo diventa vendita e cantiere, la stima viene copiata nel cantiere.
- Nel cantiere c'è un **registro giornaliero**: data, operai presenti, gasolio, Telepass, pranzo, albergo e altre spese reali. Si può partire dalle ore timbrate degli operai già registrate.
- **Dashboard, nuovo riquadro "Costo squadra":**
  - costo medio giornaliero per operaio e per squadra (mese o anno)
  - costo giorno per giorno, con un grafico
  - stimato contro reale per ogni cantiere, per vedere dove si spende più del previsto

## Mi servono da te
- **Costo fisso operaio (dato da te):** netto 2.000 € + tasse 1.297 € + Cape circa 300 € + altro F24 400 € = **3.997 € al mese**. Diviso per circa 22 giorni lavorativi fa **circa 182 € al giorno** per operaio, senza pranzo, gasolio e Telepass. Nelle impostazioni metto le quattro voci separate e il numero di giorni lavorativi al mese, così il costo al giorno si ricalcola da solo.

1. Confermi 22 giorni lavorativi al mese per il calcolo?
2. Consumo del furgone e prezzo del gasolio da usare (per esempio 10 l/100 km e 1,75 €/l).
3. Pranzo, albergo e cena: quanto spendete di solito.
4. Da che distanza o da quante ore di viaggio si fa trasferta invece di tornare a casa.
5. Il registro giornaliero reale: lo compila l'admin o il capo squadra dall'app cantieri?

## Dettagli tecnici
- Percorso e pedaggi: connettore Google Maps (Routes API `computeRoutes` con `tollInfo`, pedaggi in EUR), chiamato da una funzione backend protetta. Una sola richiesta quando si preme il pulsante e risultato salvato nel preventivo, così il costo resta basso.
- Stima salvata in `quote_data.crewCosts`; i calcoli sono funzioni pure con test (gasolio, Telepass, soglia trasferta, totali).
- Nuove tabelle: `crew_cost_settings` (valori standard) e `site_daily_costs` (registro giornaliero per cantiere), con accesso solo admin. Nessuna tabella esistente viene modificata.
- Il nuovo riquadro della dashboard legge `site_daily_costs` insieme alle ore di `worker_time_entries`.
