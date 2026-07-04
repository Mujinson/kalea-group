
# Preventivi flessibili: prezzi al centesimo + righe libere

## Il problema
Oggi il preventivo calcola tutto da listino + coefficienti + markup. Non puoi:
1. Modificare il prezzo finale di una riga per allinearlo a quello concordato col cliente
2. Aggiungere voci fuori catalogo (accessori, extra, sconti one-shot) con prezzo al centesimo
3. "Chiudere" il totale a una cifra tonda pattuita col cliente

Risultato: usi ancora il PDF Excel vecchio perché il nuovo strumento è rigido.

## Cosa costruisco (solo UI + salvataggio, nessun cambio DB)

### 1. Override prezzo per ogni riga esistente
Su **ogni** riga generata dal calcolatore (fornitura, posa, tappetino, accessori Woodco, trasferta, extra) aggiungo:
- Campo `Prezzo unitario cliente` editabile al centesimo (2 decimali)
- Campo `Quantità` editabile
- Icona 🔒 se stai usando il calcolo automatico, 🔓 quando hai fatto override manuale
- Bottone "↺ Ripristina automatico" per tornare al prezzo calcolato

Il costo interno resta quello di sistema (per il margine), cambia solo il prezzo cliente.
Semaforo margine (verde/giallo/rosso) resta attivo anche con override.

### 2. Righe libere ("Voci personalizzate")
Nuova sezione **"+ Aggiungi voce libera"** dove digiti:
- Descrizione (testo libero, es. "Sconto fedeltà", "Sopralluogo tecnico", "Rimozione pavimento esistente")
- Unità (pz / mq / ml / ore / corpo / a forfait)
- Quantità
- Prezzo unitario (al centesimo, anche negativo per sconti)
- Categoria opzionale (fornitura / posa / accessori / altro) per raggrupparle nel PDF

Nessun costo interno richiesto → margine non calcolato su queste righe (o assunto = prezzo).

### 3. "Chiudi totale a…"
In fondo, campo **"Totale finale desiderato € ___"** con bottone **Applica**:
- Calcola la differenza vs totale attuale
- Aggiunge automaticamente una riga "Adeguamento commerciale" (positiva o negativa) per far quadrare il totale al centesimo
- Oppure, con toggle, distribuisce proporzionalmente lo scarto sulle righe fornitura

### 4. Persistenza
Tutto salvato dentro `quote_data` (JSONB già esistente sulla tabella `quotes`) — zero migrazioni.
Struttura: `{ lineOverrides: { [lineKey]: { prezzoUn, qta, locked } }, customLines: [...], totaleTarget }`.

### 5. PDF
Il PDF esistente legge le righe già calcolate: passo la lista finale (con override + custom lines applicati), così l'output rispecchia esattamente quello che vedi a schermo, al centesimo.

## Cosa NON tocco
- Catalogo prodotti, listini, coefficienti fornitori
- Logica margine/anti-perdita (resta come warning, non come blocco su righe custom)
- Collegamento lead/cliente CRM (già sistemato)
- Fatturazione & incassi (già separati)
- Tabella `quotes` schema (uso `quote_data` esistente)

## File toccati
- `src/pages/admin/strumenti/CreaPreventivo.tsx` → aggiungo colonne editabili nella tabella righe, sezione custom lines, campo "chiudi totale"
- Nessun altro file, nessuna migrazione

## Cosa ti serve confermare
Solo una cosa: quando fai override del prezzo su una riga, il **margine calcolato** deve:
- **(A)** aggiornarsi automaticamente col nuovo prezzo (vedi subito se stai perdendo)
- **(B)** restare bloccato al valore originale (l'override è "commerciale", non tocca la marginalità mostrata)

Consiglio **(A)**: è più onesto verso te stesso quando tratti col cliente.
