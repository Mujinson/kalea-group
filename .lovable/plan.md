# Visualizzatore pavimenti Kalēa® (/visualizzatore)

Tutto gira nel browser: la foto del cliente non viene mai caricata e non costa nulla per foto. Va su un server solo se il cliente sceglie di allegare l'immagine a una richiesta di preventivo.

## Cosa esiste già (verificato)
- I pavimenti pubblici **non** stanno nel database: sono file dati statici (`src/data/hypermattProducts.ts`, `externoProducts.ts`, `spcCollections.ts`, `laminatiCollections.ts`, `parquetCollections.ts`, `collectionColors.ts`, `colorProducts.ts`) con immagini locali in `src/assets/{hypermatt,hypermatt-xl,externo,spc,laminati,parquet-extra,colors}` (circa 86 file solo in quelle cartelle).
- La tabella `product_images` (product_slug, image_url) esiste e si legge pubblicamente. `catalog_products` è il catalogo interno del CRM (prezzi/listini) e non è collegato alle schede del sito.
- Esiste `/preventivo-online` (`PreventivoOnline.tsx`, legge `public_quote_items`, chiama `public-quote-estimate`). Il modulo contatti/lead invia già i dati al CRM.
- Transformers.js/onnx non sono ancora installati.

Quindi il "catalogo" del visualizzatore sarà un **registro unico** costruito da quei file dati, con eventuali texture caricate dal CRM in sovrimpressione.

## Fasi

**Fase 0 – Controllo delle texture (prima di scrivere codice per l'interfaccia)**
Script in /tmp che legge ogni immagine prodotto (dimensioni, peso, rapporto lati) e assegna un punteggio "adatta come texture": vista dall'alto vs foto d'ambiente (rilevamento della prospettiva tramite la varianza dell'orientamento dei bordi), continuità ai bordi (differenza tra i lati opposti, per vedere se si ripete senza cuciture), risoluzione minima ~1024px. Il risultato è una tabella CSV/PDF in Files: prodotto → ok / da ritagliare / non adatta. Molte immagini Hypermatt/Externo sono probabilmente "swatch" dall'alto (buone); le immagini d'ambiente non vanno bene e servono texture dedicate dal CRM.

**Fase 1 – Pagina base + segmentazione**
Percorso, voce di menu, caricamento/scatto foto, ridimensionamento a 1024px, worker con il modello, barra di avanzamento, maschera mostrata in sovrimpressione. 3 stanze demo con maschera e quadrilatero **pre-calcolati** (così non devono scaricare il modello).

**Fase 2 – Rendering WebGL + prospettiva**
Stima automatica del quadrilatero, 4 maniglie, omografia, shader con texture ripetuta, scala in cm, rotazione, luci/ombre, bordi sfumati.

**Fase 3 – Rifinitura e catalogo**
Pennello aggiungi/rimuovi, feather, undo; carosello con filtri per categoria; cambio pavimento istantaneo.

**Fase 4 – Uscita**
Slider prima/dopo, download PNG con logo e nome prodotto, "Richiedi preventivo per questo pavimento", pulsante "Provalo a casa tua" in ogni scheda pavimento.

**Fase 5 – CRM**
Campi texture e dimensione reale nella gestione prodotti, traduzioni EN/DE/FR (memoria: sito tutto localizzato; l'interfaccia principale resta in italiano come richiesto, con le traduzioni aggiunte per coerenza), SEO della pagina, test sulle formule.

## Dettagli tecnici

### Librerie
- `@huggingface/transformers` (v3, WebGPU + WASM). Modello: `Xenova/segformer-b0-finetuned-ade-512-512` (~15 MB quantizzato) come predefinito; b2 (~110 MB) **non** di default, sarebbe troppo per il mobile. Opzione "qualità alta" solo su desktop con WebGPU.
- Nessuna libreria 3D: WebGL2 scritto a mano (un quad a schermo intero + un fragment shader). Omografia con un solver DLT 8x8 piccolo scritto in casa.
- Classi ADE20K: floor(3), rug(28) opzionale; facoltativo includere anche road/ground per foto esterne Externo.

### File
```text
src/pages/Visualizzatore.tsx                 pagina, stato, layout mobile-first
src/components/visualizer/
  PhotoInput.tsx        file input capture="environment" + stanze demo
  ModelProgress.tsx     barra download/inferenza
  ViewerCanvas.tsx      canvas WebGL + livello maniglie/pennello
  QuadHandles.tsx       4 maniglie trascinabili (pointer events)
  MaskBrush.tsx         pennello aggiungi/rimuovi, dimensione, undo
  FloorCatalog.tsx      carosello + filtri categoria
  ControlsPanel.tsx     scala cm, rotazione, intensità ombre, feather
  BeforeAfter.tsx       slider divisorio
  ExportActions.tsx     scarica PNG, richiedi preventivo
src/workers/segmentation.worker.ts  Transformers.js, WebGPU→WASM, postMessage progress/mask
src/lib/visualizer/
  homography.ts         DLT, inversa, (testato)
  quadEstimate.ts       maschera → quadrilatero (testato)
  maskOps.ts            ridimensionamento, feather (blur separabile), pennello, stack undo
  renderer.ts           setup WebGL2, shader, texture mipmap + anisotropia
  lighting.ts           mappa luminanza / media sfocata
  floorRegistry.ts      registro unico dei pavimenti dai file src/data + override dal DB
  exportImage.ts        composizione PNG + logo + nome
src/assets/visualizer/demo-*.webp (+ maschere e quadrilateri in JSON)
```
Le texture vengono caricate in modo lazy (import dinamico per categoria) per non appesantire il bundle della pagina.

### Algoritmi
- **Quadrilatero automatico**: dalla maschera, per ogni riga si prendono gli estremi sinistro e destro; con una regressione robusta (RANSAC) sui bordi sinistro e destro si ottengono due rette, che si intersecano con la riga più alta e la più bassa della maschera e danno un trapezio. Si stringe al 90% per sicurezza. Se il fit è debole (stanza a L, mobili), si usa un trapezio di default (alto stretto al 60%). L'utente corregge con le maniglie.
- **Scala reale**: il quadrilatero corrisponde a un rettangolo L×P metri (stima predefinita 4×4, modificabile con "larghezza stanza (m)"), e la texture si ripete ogni `dimensione_cm/100`. Slider per la dimensione della doga/piastrella.
- **Shader**: `uv = H⁻¹·(x,y,1)`, divisione prospettica, rotazione, `fract`; nel fragment shader `colore = tex · mix(1, L/Lblur, intensità)`, alfa = maschera con feather. Mipmap con `textureGrad` per evitare l'effetto moiré in lontananza.
- **Luci**: luminanza della foto originale nella zona pavimento, sfocata in GPU (gaussiana ampia), rapporto limitato a [0.4, 1.6] per non trasferire le venature del vecchio pavimento.

### Database (solo aggiunte)
Nuova tabella `floor_visualizer_textures`: `product_slug` (unico), `texture_url`, `real_width_cm`, `real_height_cm`, `default_rotation`, `enabled`, timestamp. Lettura pubblica, scrittura solo admin (`has_role`), con GRANT. Bucket pubblico `visualizer-textures`. Nella gestione prodotti del CRM, sezione "Texture visualizzatore" con elenco dei pavimenti dal registro, caricamento e cm. Se manca la texture si usa l'immagine principale con una dimensione predefinita per categoria.

### Preventivo
"Richiedi preventivo" apre `/preventivo-online?prodotto=<slug>` precompilato (lettura di `useSearchParams`, nessun cambiamento alla logica di calcolo). Allegato immagine **opzionale e con consenso esplicito**: JPEG ridotto caricato su un bucket privato `visualizer-renders` tramite l'edge function di invio esistente, poi collegato al lead come attività. Questa è l'unica volta in cui un'immagine esce dal dispositivo.

### Test
bun test su `homography.ts` (gli angoli vanno sugli angoli, round-trip con l'inversa) e su `quadEstimate.ts` (maschera trapezio sintetica → angoli entro 2px).

## Rischi
- **Peso del modello**: b0 pesa circa 15 MB al primo accesso, poi resta nella cache del browser. Su 4G servono 5-15 s. Le demo pre-calcolate evitano il download.
- **Mobile**: WebGPU manca su molti iPhone e il fallback WASM richiede 3-8 s per foto; la RAM sui telefoni economici può essere un limite. Mitigazioni: input a 512px per il modello e maschera ingrandita con un filtro guidato, worker per non bloccare la pagina, timeout con messaggio "disegna il pavimento a mano".
- **Qualità della segmentazione**: b0 sbaglia con tappeti, pavimenti molto riflettenti e foto scure; il pennello è indispensabile.
- **Prospettiva automatica**: affidabile solo per stanze rettangolari viste frontalmente; nei casi complessi l'utente deve muovere le maniglie (guida visiva con griglia).
- **Texture**: le foto d'ambiente non funzionano come texture, e senza immagini seamless si vedono ripetizioni o cuciture. La Fase 0 lo quantifica; potrebbe servire fornire texture dai fornitori. Niente texture generate con l'IA (regola delle immagini reali).
- **App esistente**: impatto minimo. Pagina nuova, tabella nuova, e il preventivo online legge solo un parametro in più. Il bundle principale non cambia perché la pagina viene caricata solo quando serve. Le regole di layout del sito (niente sticky/sovrapposizioni) vanno rispettate anche nell'interfaccia: pannelli in flusso normale sotto il canvas su mobile.

## Da confermare
- Quali famiglie includere al lancio (Hypermatt, Externo, SPC, Laminati, Parquet, Ceramiche?).
- Le 3 foto demo: servono foto reali di ambienti (vostre o di realizzazioni), non generate.
