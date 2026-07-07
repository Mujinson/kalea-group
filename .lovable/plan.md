## Piano

1. **Centralizzare il link WhatsApp**
   - Creare/definire un unico URL costante per il preventivo con `https://wa.me/393520351738?text=Ciao%2C%20vorrei%20richiedere%20un%20preventivo%20gratuito%20per%20i%20vostri%20pavimenti.`.
   - Usare esattamente questo formato nelle CTA interessate.

2. **Correggere l’apertura del click**
   - Sostituire il comportamento del link con apertura esplicita in nuova scheda tramite `window.open(url, "_blank", "noopener,noreferrer")` oppure mantenere `<a>` ma aggiungere un handler che impedisca qualsiasi gestione interna/iframe.
   - Evitare che il preview/app intercetti il link e lo apra dentro la pagina.

3. **Applicare su entrambe le CTA**
   - Homepage: `src/components/MetodoKalea.tsx`.
   - Discover Kalēa: `src/pages/DiscoverKalea.tsx`.

4. **Verifica reale**
   - Cercare e confermare che non esistano più `api.whatsapp.com/send` o `web.whatsapp.com/send` nel codice.
   - Testare il click nel browser verificando che venga aperta una nuova scheda con dominio `wa.me`, non `api.whatsapp.com` dentro l’app.