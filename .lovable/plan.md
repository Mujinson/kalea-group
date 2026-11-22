# Dashboard: Ultimi preventivi e Cantieri in corso

## Problema
- **Ultimi preventivi** è vuoto perché il riquadro legge ancora una vecchia lista non più usata, invece dei preventivi reali già caricati dalla Dashboard.
- **Cantieri in corso** mostra solo il titolo del cantiere (es. "Cantiere da preventivo KAL-2026-033"), senza cliente né luogo.

## Modifiche (solo `src/pages/admin/AdminOverview.tsx`, nessun dato toccato)
1. **Ultimi preventivi**: usare i preventivi reali (`quotes`), ordinati dal più recente, primi 5. Per ognuno: numero (`quote_number`), cliente (`client_name`, oppure nome dal cliente collegato) + città del cantiere (`site_city`), importo (`total_amount`) e stato. Click apre il preventivo come oggi.
2. **Cantieri in corso**: per ogni cantiere mostrare
   - riga 1: **nome cliente** (da `customers` tramite `customer_id`, altrimenti dal preventivo/lead collegato, altrimenti il titolo)
   - riga 2: **luogo** (città + indirizzo del cantiere) e **Rif.** (titolo/numero preventivo, es. "Rif. KAL-2026-033")
   - barra di avanzamento e badge RITARDO invariati.
3. Correggere anche gli altri punti della Dashboard che leggevano la stessa lista vuota (conteggio "Preventivi" del periodo, attività recenti, classifica commerciali), così mostrano i dati reali.

## Verifica
Apertura della Dashboard con Playwright da utente admin: controllo che compaiano i preventivi recenti e che i cantieri mostrino cliente, città e riferimento.
