# Integrazione catalogo Skema → Selezione esclusiva Kalēa

Approccio identico alle Ceramiche: i prodotti vengono presentati come **selezione esclusiva Kalēa**, senza menzionare Skema. Le foto prodotto/ambient vengono scaricate dal sito Skema (autorizzazione confermata come rivenditore) e salvate localmente in `src/assets/`.

## 1. Mapping collezioni → categorie Kalēa

| Linea Skema | Destinazione Kalēa | Tipo |
|---|---|---|
| Pavimenti SPC (es. Star K) | **Indoor → nuova sezione "SPC Selection"** | nuova pagina |
| Pavimenti in legno (parquet, es. Villa) | **`/parquet`** — aggiunte come collezioni extra | collezioni aggiuntive |
| Pavimenti tecnici (laminati: K-Uno, Prestige, Vision…) | **Indoor → nuova sezione "Laminati Tecnici"** | nuova pagina |
| Pavimenti sopraelevati | **Indoor → "Pavimenti Sopraelevati"** | nuova pagina |
| Rivestimenti a parete/soffitto (interni) | dentro **Biowall** come sotto-collezione | estensione esistente |
| Rivestimenti fonoassorbenti | dentro **Kaleaceiling** come sotto-collezione | estensione esistente |
| Pavimenti per esterni / Decking | dentro **Externo** come **"Alternativa Decking"** | estensione esistente |

## 2. Pagine nuove

- `/it/indoor/spc` — SPC Selection (hero + carousel collezioni + dettaglio)
- `/it/indoor/laminati` — Laminati Tecnici
- `/it/indoor/sopraelevati` — Pavimenti Sopraelevati
- `/it/spc/:collezione` — dettaglio singola collezione SPC (riutilizzabile)
- `/it/laminati/:collezione` — dettaglio laminato
- nuove voci dentro Biowall (tab "Rivestimenti parete") e Kaleaceiling (tab "Fonoassorbenti")
- nuova tab dentro Externo: "Alternativa" accanto a Traditional e Skudo
- nuove collezioni parquet dentro `parquetCollections.ts`

## 3. Data layer

Creo i seguenti file dati (stessa struttura di `externoProducts.ts`):
- `src/data/spcCollections.ts`
- `src/data/laminatiCollections.ts`
- `src/data/sopraelevatiCollections.ts`
- `src/data/biowallRivestimenti.ts`
- `src/data/fonoassorbenti.ts`
- estensione `externoProducts.ts` con linea "Alternativa"
- estensione `parquetCollections.ts`

Ogni voce: `{ slug, name (rebrand Kalēa), tagline, description, image, formats[], finishes[], applicazioni[] }`.

## 4. Asset

Scarico le foto da skema.eu (sezione collezioni + singoli prodotti), le converto in WebP < 200kb, salvataggio in:
- `src/assets/spc/`
- `src/assets/laminati/`
- `src/assets/sopraelevati/`
- `src/assets/biowall-rivestimenti/`
- `src/assets/fonoassorbenti/`
- `src/assets/externo/alternativa/`
- `src/assets/parquet-extra/`

## 5. Branding & contenuti

- **Nessuna menzione di Skema** in UI, testi, alt, metadata, SEO (regola "Ceramiche exclusive selection")
- Nomi prodotto **rebrandizzati Kalēa** dove necessario (es. "Star K" → nome neutro tipo "Stark", "K-Uno" → "Uno", da confermare con te a fine bozza)
- Stesso linguaggio editoriale già usato (tagline 4-parole, descrizioni sobrie)
- SEO: title/description IT, EN, DE, FR
- Card luxury, niente prezzi, lightbox standard

## 6. Navigazione

Aggiorno `Navbar.tsx`:
- Dropdown **Indoor**: aggiungo SPC, Laminati, Sopraelevati
- Dropdown **Outdoor**: Externo già ok (tab interna)
- Hub homepage: valuta se serve nuova card o aggiornare quelle esistenti

## 7. Localizzazione

Tutte le stringhe nuove in IT, EN, DE, FR via `i18n`.

## 8. Esecuzione in fasi (per non fare un PR monstre)

**Fase A — Setup & SPC** (questa sessione)
1. Scarico asset SPC + 1 collezione parquet di prova
2. Creo `spcCollections.ts` + pagine `/indoor/spc` e dettaglio
3. Aggiorno navbar
4. Aggiungo traduzioni base

**Fase B — Laminati + Sopraelevati** (sessione successiva)

**Fase C — Estensione Externo (alternativa decking) + nuovi parquet**

**Fase D — Rivestimenti Biowall + Fonoassorbenti Kaleaceiling**

**Fase E — QA visivo, SEO, traduzioni mancanti**

---

## Cose che mi servono da te prima di partire

1. **OK al rebranding nomi** prodotto (rimuovo riferimenti Star K, K-Uno, ecc. e uso nomi neutri tipo Stark, Uno, Prestige Kalēa)? Oppure preferisci mantenere i nomi originali?
2. **OK a procedere con la Fase A** (SPC + 1 parquet di prova) per validare il pattern prima di estenderlo a tutto?
3. Vuoi una **card "SPC"** nuova nell'hub homepage o l'SPC sta solo dentro Indoor?

Appena confermi questi 3 punti parto con la Fase A.
