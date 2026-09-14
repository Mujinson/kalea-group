# Preventivatore online per il cliente

Una pagina pubblica dove il cliente costruisce da solo una stima indicativa, lascia i suoi dati e riceve il PDF via email. Tu ricevi subito la notifica su Telegram e via email, e il lead entra nel CRM.

## Come lo vive il cliente

1. **Cosa ti serve** — sceglie una o più lavorazioni (anche tutte insieme):
   - Fornitura pavimento (parquet, SPC/laminato, WPC/esterni, ceramica)
   - Posa
   - Verifica e preparazione del sottofondo
   - Levigatura
   - Lamatura / rigenerazione
   - Finitura (olio / vernice)
   - Rimozione pavimento esistente
2. **Quanto** — metri quadri per ogni voce, più eventuale piano/accessibilità.
3. **Stima** — vede subito una fascia di prezzo (da X a Y €) per ogni voce e un totale indicativo, con IVA indicata a parte.
4. **I tuoi dati** — nome, email, telefono, città, tipo cliente, note. Consenso privacy obbligatorio.
5. **Ricevi la stima** — conferma a schermo e PDF inviato via email.

In ogni passaggio, e in evidenza sul PDF, il disclaimer: stima puramente indicativa, non vincolante; il preventivo definitivo viene emesso solo dopo il sopralluogo dei tecnici Kalēa.

## Cosa succede dietro le quinte

- La richiesta viene salvata e diventa un **lead** nel CRM (fonte "preventivatore online"), con tutte le voci scelte e la stima.
- **Notifica Telegram** immediata sul bot già collegato + **email** a Kalēa con il riepilogo.
- Il PDF della stima parte via email al cliente.
- Promemoria automatico nel CRM per richiamarlo il giorno dopo.

## Prezzi

Le fasce non vengono prese dal catalogo interno: crei un **listino pubblico separato** che gestisci tu da una nuova pagina in amministrazione (Strumenti → Listino pubblico). Per ogni voce: nome, descrizione breve, unità di misura, prezzo minimo, prezzo massimo, attiva sì/no, ordine. Così il pubblico non vede mai i prezzi interni e puoi aggiornare le fasce quando vuoi.

Al primo avvio carico un set iniziale di voci con fasce provvisorie: le rivedi tu prima di pubblicare.

## Dettagli tecnici

**Database**
- `public_quote_items`: codice, nome, descrizione, categoria (fornitura / posa / preparazione / trattamento / rimozione), unità, `price_min`, `price_max`, `is_active`, `sort_order`, note. Lettura pubblica (`anon`) solo delle righe attive; scrittura solo admin. GRANT espliciti + RLS.
- `public_quote_requests`: dati cliente, righe scelte (jsonb), totale min/max, lingua, consenso, `lead_id`, stato, timestamp. Nessuna lettura pubblica; inserimento solo tramite funzione server.

**Frontend**
- Nuova pagina pubblica `src/pages/PreventivoOnline.tsx` su `/:lang/preventivo-online`, wizard a 4 step, stile coerente con il sito (sfondo #F7F1E7, font New Order, nessun overlay sticky). Link nel menu e nelle CTA "Richiedi preventivo".
- Testi in IT, EN, DE, FR.
- SEO: title/description dedicati, H1 unico.

**Backend**
- Edge function `public-quote-estimate`: valida l'input con zod, ricalcola i totali lato server dai prezzi del listino (mai fidarsi del browser), salva la richiesta, crea/riusa il lead con `submit_public_lead`, crea il promemoria di richiamo, genera l'HTML della stima e invia:
  - email al cliente con la stima (Resend, stessa configurazione di `send-contact-email`);
  - email interna a Kalēa;
  - messaggio Telegram al chat ID già configurato.
- Rate limiting e honeypot come nella funzione contatti.

**PDF**
- Generato lato client al momento della conferma (stesso approccio html2canvas/jsPDF dei preventivi CRM) con logo Kalēa, P.IVA 04797310986 e disclaimer; l'email contiene la stessa stima in HTML così il cliente la riceve comunque.

**Admin**
- `src/pages/admin/strumenti/ListinoPubblico.tsx` per gestire le voci e le fasce.
- Le richieste arrivano tra i lead esistenti, filtrabili per fonte.

## Fase successiva (non in questa consegna)

Pagamenti e firma online, da fare dopo che il preventivatore è attivo:

- **Firma del contratto online** sul preventivo definitivo, con copia firmata archiviata nel CRM.
- **Acconto del 30%** pagabile online alla firma.
- **Link di pagamento della fattura** a fine lavori, inviato al cliente.
- Ogni pagamento ricevuto si registra da solo tra gli incassi del CRM.

Serve attivare un sistema di pagamenti integrato (Lovable lo fornisce senza bisogno di un tuo account) e un piano Pro. Ne parliamo quando arriviamo a quel passo.

## Fuori perimetro (per ora)

- Nessun pagamento nel preventivatore pubblico: è solo una stima.
- Nessun prezzo esatto al pubblico: solo fasce.
