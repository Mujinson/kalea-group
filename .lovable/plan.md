# Utile aziendale e utile medio per lavoro

## Obiettivo
Mostrare in dashboard quanto rende ogni lavoro e quanto rimane all'azienda, includendo materiali, operai, viaggi e spese generali. Tutti i calcoli economici saranno al netto dell'IVA; incassi e pagamenti resteranno separati.

Il riepilogo sarà **gestionale, prima delle imposte sull'utile**, non un bilancio fiscale. Se mancano costi o documenti, il risultato sarà segnalato come incompleto, non presentato come utile definitivo.

## 1. Riepilogo in dashboard
- **Ricavi netti dei lavori vinti**: preventivi accettati, convertiti o fatturati, contando ciascun lavoro una sola volta.
- **Costi dei lavori**: materiali, manodopera, gasolio, pedaggi, pasti, alberghi, trasporti, gru, smaltimenti e altre spese.
- **Utile previsto dei lavori** e **utile medio per lavoro** in euro, con margine percentuale ponderato.
- **Costi generali aziendali** e **utile gestionale totale dopo i costi generali**.
- Due viste distinte: **Previsione lavori vinti** e **Consuntivo del periodo**. La seconda utilizza ricavi fatturati e costi effettivi di competenza, non l'intero valore di un preventivo ancora da eseguire.
- Filtro mese, anno o intervallo; ogni indicatore apre il dettaglio che lo compone.

## 2. Dettaglio per lavoro
Una riga per lavoro con cliente, preventivo/cantiere, netto concordato dopo sconto, costi previsti, costi registrati, previsione aggiornata a fine lavoro, utile e margine. Apertura del dettaglio con tutte le voci e relativi documenti.

I costi preventivati provengono dalla Contabilità interna, compresi squadra e trasferta. I costi effettivi provengono dalle fatture di acquisto collegate, dalle spese del cantiere e dai costi giornalieri.

Un costo effettivo **sostituisce solo la corrispondente quota preventivata**. Una fattura parziale non elimina il costo stimato dei materiali ancora da acquistare. Le spese aggiuntive non previste si sommano una sola volta. Per ottenere il consuntivo finale occorre confermare che tutti i costi del lavoro siano stati registrati.

## 3. Fatture di acquisto e costi generici
Estendere i moduli esistenti per assegnare ogni costo a:
- un lavoro, anche prima della creazione del cantiere;
- una spesa generale dell'azienda;
- un acquisto per magazzino.

Permettere di indicare categoria, importo netto/IVA, data di competenza e l'eventuale costo già registrato che il documento giustifica. Se una fattura riguarda più lavori, ripartire il netto tra essi, controllando che la somma non superi il documento.

Gli acquisti per magazzino non saranno sottratti anche come costi dei lavori: la quota utilizzata va attribuita al lavoro, lasciando il materiale inutilizzato nelle scorte. Collegamenti mancanti o ambigui appariranno tra **Costi da attribuire**, senza assegnazioni automatiche arbitrarie.

## 4. Operai e costi ricorrenti
Mantenere il costo fisso indicato: **3.997 €/mese per operaio**, esclusi pasti, carburante, pedaggi e pernottamenti. Per l'utile per lavoro usare la quota di manodopera attribuita al lavoro; per il consuntivo aziendale conteggiare l'intero costo mensile effettivo una sola volta, includendo la quota non attribuita ai cantieri.

Stipendi e contributi già presenti nei costi generali devono essere riconciliati con questa voce, non aggiunti nuovamente. Affitto, assicurazioni, software e altre spese ricorrenti saranno rapportati al periodo di competenza; le spese una tantum avranno la propria data.

## 5. Controlli di affidabilità
- Un preventivo convertito in vendita non raddoppia né ricavi né costi.
- IVA esclusa dai margini, reverse charge rispettato; eventuale IVA indetraibile trattata separatamente come costo.
- Pagare una fattura fornitore non crea un secondo costo.
- Nessun doppione tra fattura, spesa generica, spesa cantiere e costo giornaliero riconciliati.
- Costi mancanti, documenti non attribuiti e stime distinguibili dai dati effettivi.
- Perdite e lavori senza costi noti inclusi e segnalati, non nascosti dalla media.

## Dettagli tecnici
- Aggiungere un modulo di calcolo condiviso con test di regressione e un nuovo blocco dashboard riservato agli amministratori, usando le autorizzazioni esistenti.
- Riutilizzare quotes/quote_data.contabilita, sales, construction_sites, supplier_invoices, fixed_costs, variable_costs e site_daily_costs.
- Aggiungere collegamenti e ripartizioni dei costi senza eliminare dati o cambiare il funzionamento delle schermate esistenti; proteggere i nuovi dati con permessi amministrativi verificati lato database.
- Salvare uno snapshot dei costi preventivati per evitare che un futuro cambio del catalogo modifichi retroattivamente gli utili.
- Aggiornare il riepilogo dopo salvataggi e variazioni delle fonti economiche.
- Verificare con un lavoro reale: costi preventivati, fattura parziale, saldo acquisto, spesa extra e costo operaio; controllare dettaglio, medie e totale aziendale.

## Risultato
La dashboard distinguerà **quanto prevediamo di guadagnare sui lavori vinti** da **quanto risulta effettivamente dal periodo**, con utile medio per lavoro e utile aziendale dopo le spese generali.