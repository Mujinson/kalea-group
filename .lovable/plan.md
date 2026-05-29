## Attivazione Google Search Console su Lovable

Collego Google Search Console al progetto tramite il connector ufficiale, così possiamo gestire indicizzazione, sitemap e analytics di ricerca direttamente da qui.

### Passi

1. **Connessione del connector** Google Search Console (richiede login Google con l'account che gestirà il dominio `kalea.space`).
2. **Verifica della proprietà del dominio** `https://kalea.space/` tramite metodo META:
   - Genero un token di verifica via API.
   - Inserisco il `<meta name="google-site-verification" content="...">` nell'`<head>` di `index.html`.
   - Pubblichi il sito (necessario perché Google deve leggere il tag sul dominio live).
   - Lancio la verifica.
3. **Registrazione del sito** in Search Console (aggiunta come property).
4. **Submit della sitemap** `https://kalea.space/sitemap.xml`.
5. **Richiesta di re-indicizzazione** delle pagine con cache stale:
   - `/it/biomag-floor`, `/en/biomag-floor`, `/fr/biomag-floor`, `/de/biomag-floor`
   - `/it/hypermatt` (+ EN/DE/FR)
   - `/it/ceramiche-esterni` (+ EN/DE/FR)

### Note

- **Google Business Profile** è separato: non c'è un connector Lovable, va creato manualmente su [business.google.com](https://business.google.com). Posso prepararti una checklist dei dati da inserire (nome, indirizzo, categoria, orari, foto, descrizione multilingua) ma l'iscrizione la fai tu lato Google. Lo facciamo in un secondo momento o adesso?
- Per la verifica META serve **pubblicare** dopo aver inserito il tag, altrimenti Google non lo trova.

### Cosa farò in codice

- Modifica di `index.html`: aggiunta del meta tag di verifica Google (1 riga nell'`<head>`).
- Nessun'altra modifica al codice.

Confermi che procedo con la connessione Google Search Console?
