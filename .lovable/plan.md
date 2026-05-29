## Obiettivo
Rendere tutti gli 8 swatch colore di BIOMAG FLOOR® come cerchi 3D uniformi nello stile del poster (sfera lucida con ombra, highlight e drop shadow), usando:
- La nuova texture Aurora appena caricata (rovere chiaro) come sorgente
- Le 7 immagini attuali in `src/assets/finish-*.jpg` come sorgenti per gli altri colori

## Passi
1. Copiare `user-uploads://ChatGPT_Image_May_29_2026_03_54_29_PM.png` come sorgente Aurora in `/tmp/`.
2. Per ognuno degli 8 colori (Aurora, Corteccia, Cenere, Sabbia, Silven, Terram, Perla, Velora):
   - Campionare la texture al centro dell'immagine sorgente per ottenere un tile pulito.
   - Applicare lo stesso trattamento 3D uniforme via Python/Pillow (no AI, deterministico, qualità identica):
     - Canvas 800×800 trasparente
     - Maschera circolare con texture tilata/ridimensionata
     - Inner shadow morbida sui bordi (effetto sfera)
     - Radial highlight in alto-sinistra (~30%, soft)
     - Drop shadow esterna morbida
     - Bordo sottile
   - Salvare come `src/assets/finish-{nome}.jpg` (800×800, <200kb, qualità 85).
3. Nessuna modifica al codice — `ColorCircleGallery` continua a usare gli stessi path.

## Note tecniche
- Uso Pillow (PIL) in `code--exec` per garantire uniformità pixel-perfect tra tutti gli 8 cerchi (stessa illuminazione/ombra/diametro), cosa non possibile con generazione AI.
- Aurora userà la texture appena caricata; gli altri 7 useranno la texture estratta dal cerchio attuale già presente in `src/assets/`.
- QA: genero un'anteprima 4×2 di tutti i cerchi affiancati per verificare uniformità prima di consegnare.

## Rischio
Le attuali `finish-*.jpg` sono già renderizzate come cerchi su sfondo: campionerò la zona texture interna evitando bordi/ombre esistenti. Se una sorgente risulta troppo piccola o rumorosa per il tile, lo segnalo invece di consegnare un risultato sfocato.
