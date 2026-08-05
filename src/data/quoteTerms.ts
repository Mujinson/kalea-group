// Termini e condizioni per tipologia di preventivo Kalēa
// Il tipo "fornitura_posa" usa il testo storico presente nel dizionario i18n
// (t.termini_testo) e qui non viene duplicato.

export type QuoteType = "fornitura_posa" | "fornitura" | "posa" | "servizi";

export const QUOTE_TYPE_LABELS: Record<QuoteType, string> = {
  fornitura_posa: "Fornitura e Posa",
  fornitura: "Solo Fornitura",
  posa: "Solo Posa",
  servizi: "Servizi",
};


export const QUOTE_TYPES: { value: QuoteType; label: string }[] = [
  { value: "fornitura_posa", label: "Fornitura e Posa" },
  { value: "fornitura", label: "Solo Fornitura" },
  { value: "posa", label: "Solo Posa" },
  { value: "servizi", label: "Servizi" },
];

const PRIVACY = `PRIVACY
Consento al trattamento dei miei dati personali ai sensi dell'art. 13 del Regolamento UE n. 2016/679.
Autorizzo il trattamento dei dati personali per l'invio di materiale informativo e pubblicitario come indicato nell'Informativa.

Le parti dichiarano di aver preso visione e di approvare espressamente, ai sensi e per gli effetti degli artt. 1341 e 1342 del codice civile, tutti gli articoli del presente documento.`;

const SOLO_FORNITURA = `Premesse
1) Il presente documento ha ad oggetto la sola fornitura dei materiali indicati, con esclusione di ogni attività di posa in opera, che resta a totale carico e responsabilità del Committente.
2) I materiali "Kalea" sono prodotti a finalità estetica: non hanno proprietà di isolamento né di impermeabilizzazione e come tali devono essere considerati e impiegati.
3) Obblighi del Committente: a) verificare, prima della posa, l'idoneità del fondo (piano, asciutto, privo di risalite di umidità) e la compatibilità del materiale con la destinazione d'uso; b) verificare quantità, tonalità, lotto e integrità del materiale al momento della consegna; c) provvedere allo scarico, alla movimentazione e allo stoccaggio in ambiente asciutto e areato; d) far eseguire la posa da personale qualificato nel rispetto delle schede tecniche del produttore.
4) Obblighi del Fornitore: a) consegnare materiali conformi per tipologia, quantità e qualità a quanto ordinato; b) fornire schede tecniche, dichiarazioni di prestazione e istruzioni di posa; c) rispettare i tempi di consegna indicati, salvo cause di forza maggiore o ritardi imputabili al produttore.
5) Consegna e trasporto: la consegna si intende secondo la modalità indicata nel preventivo. La merce viaggia a rischio e pericolo del destinatario. Eventuali danni da trasporto devono essere contestati al vettore al momento della consegna con riserva scritta sul documento di trasporto.
6) Contestazioni: eventuali difetti visibili (tonalità, dimensioni, superficie) devono essere contestati per iscritto entro 8 giorni dal ricevimento e comunque prima della posa. La posa del materiale costituisce accettazione dello stesso: nessuna contestazione estetica sarà accolta su materiale già posato.
7) Quantità e sfrido: le quantità sono calcolate sulle misure comunicate dal Committente. Si raccomanda una maggiorazione del 5% per sfrido di lavorazione, non compresa salvo diversa indicazione. Kalēa non risponde di ammanchi derivanti da metrature errate fornite dal Committente.
8) Riserva di proprietà: i materiali restano di proprietà di Kalea Group Srl fino al loro integrale pagamento, ai sensi dell'art. 1523 c.c.
9) Garanzia: si applica la garanzia del produttore sul prodotto. È esclusa ogni garanzia su vizi derivanti da posa non corretta, da fondo non idoneo o da uso e manutenzione difformi dalle istruzioni.
10) Prezzi e pagamento: i prezzi si intendono IVA esclusa. Il pagamento avviene secondo le modalità indicate nel preventivo. In caso di ritardo si applicano gli interessi di mora ex D. Lgs. 231/2002.
11) Validità: il presente preventivo ha validità 30 giorni dalla data di emissione, salvo diversa indicazione e salvo variazioni dei listini del produttore.
12) Foro competente: per ogni controversia è competente in via esclusiva il Foro di Brescia.

` + PRIVACY;

const SOLO_POSA = `Premesse
1) Il presente documento ha ad oggetto la sola prestazione di servizi di posa in opera. I materiali sono forniti dal Committente, che ne garantisce idoneità, quantità e qualità.
2) Il Committente dichiara di essere informato che la pavimentazione oggetto di posa è un prodotto a finalità estetica, privo di proprietà di isolamento e di impermeabilizzazione.
3) Obblighi del Committente: a) consegnare in cantiere, prima dell'inizio dei lavori, tutto il materiale necessario, comprensivo di sfrido, accessori e collanti idonei; b) garantire un fondo di posa piano, asciutto e conforme alle prescrizioni del produttore del materiale; c) garantire corrente elettrica 220V e acqua; d) garantire l'accesso al cantiere, la messa in quota del materiale con proprio personale e un'area di stoccaggio idonea; e) garantire l'assenza di interferenze con altre lavorazioni.
4) Obblighi del Fornitore: a) eseguire le lavorazioni a regola d'arte, nel rispetto delle schede tecniche del materiale; b) fornire i nominativi della squadra di posa e la documentazione di idoneità tecnico-professionale ai sensi del D. Lgs. 81/2008, incluso il DURC; c) mantenere pulita l'area di lavoro, stoccando scarti e rifiuti nei luoghi indicati dalla committenza; d) assicurare visite periodiche di un proprio tecnico.
5) Esclusioni di responsabilità: Kalēa non risponde di vizi, difetti estetici, differenze di tonalità o di lotto, ammanchi o inidoneità del materiale fornito dal Committente, né di problematiche derivanti da un fondo non conforme (umidità di risalita, planarità, fessurazioni, infiltrazioni).
6) Verifica del fondo e del materiale: l'avvio della posa presuppone la verifica visiva del fondo. Qualora emergessero criticità, i lavori saranno sospesi e ripresi solo dopo il ripristino a cura del Committente; i costi di fermo cantiere saranno addebitati in economia.
7) Modalità di misurazione: la posa della pavimentazione è calcolata al mq, gli accessori al metro lineare, in entrambi i casi con il 5% di sfrido di lavorazione. Prestazioni extra richieste in corso d'opera sono addebitate in economia a EURO 30,00/ora per persona impiegata, oltre al costo dei materiali utilizzati.
8) Il presente accordo si intende a misura e non a corpo. Qualora sopraggiungano impedimenti esterni che determinino interruzione o sospensione dei lavori per cause non imputabili a Kalēa, sarà fatturata la metratura effettivamente eseguita a regola d'arte.
9) Prezzi e pagamento: i prezzi si intendono IVA esclusa. Acconto alla firma del 50% + IVA, saldo a fine lavori, salvo diverso accordo indicato nel preventivo.
10) Prevalenza dell'obbligazione di fare: le parti concordano che il presente contratto ha natura di prestazione di servizi come attività prevalente.
11) Documentazione fotografica: durante le lavorazioni Kalea Group Srl potrà eseguire fotografie o riprese a fini pubblicitari e di marketing, eventualmente pubblicate sul sito internet o sui canali social.
12) Foro competente: per ogni controversia è competente in via esclusiva il Foro di Brescia.

` + PRIVACY;

const SERVIZI = `Premesse
1) Il presente documento ha ad oggetto l'esecuzione dei soli servizi e delle lavorazioni indicate in offerta (a titolo esemplificativo: sopralluogo, rilievo, progettazione, preparazione e sistemazione del sottofondo, levigatura, lamatura, verniciatura, manutenzione, rimozione e smaltimento di pavimentazioni esistenti). Nessuna fornitura di materiale è compresa, salvo quanto espressamente indicato tra le voci di offerta.
2) Obblighi del Committente: a) garantire ambienti sgombri, accessibili e liberi da arredi e da altre lavorazioni in corso; b) garantire corrente elettrica 220V e acqua; c) fornire le informazioni necessarie sullo stato dei supporti e su eventuali trattamenti pregressi; d) garantire un'area idonea al carico, allo scarico e allo stoccaggio delle attrezzature.
3) Obblighi del Fornitore: a) eseguire le lavorazioni a regola d'arte con personale qualificato; b) fornire la documentazione di idoneità tecnico-professionale ai sensi del D. Lgs. 81/2008, incluso il DURC; c) impiegare attrezzature conformi e prodotti idonei alla lavorazione; d) mantenere pulita l'area di lavoro al termine di ogni giornata.
4) Natura delle lavorazioni: interventi quali levigatura, lamatura e ripristino sono eseguiti su supporti esistenti; il risultato estetico finale dipende dallo stato, dall'essenza e dalla storia del supporto. Kalēa garantisce la corretta esecuzione tecnica, non l'uniformità estetica assoluta di un supporto preesistente.
5) Esclusioni: non sono compresi opere murarie, impiantistiche, smaltimenti speciali, ponteggi, oneri di sicurezza di cantiere di terzi e ogni onere non espressamente indicato in offerta.
6) Misurazione e prestazioni extra: le lavorazioni sono computate a misura sulle superfici effettivamente trattate. Prestazioni extra richieste in corso d'opera sono addebitate in economia a EURO 30,00/ora per persona impiegata, oltre al costo dei materiali utilizzati.
7) Tempi di esecuzione: le tempistiche indicate sono stimate in condizioni di cantiere ordinarie. Sospensioni dovute a cause non imputabili a Kalēa (accessi non disponibili, ambienti non sgomberi, interferenze con altre imprese) comportano l'addebito dei costi di fermo cantiere.
8) Il presente accordo si intende a misura e non a corpo; sarà fatturato quanto effettivamente eseguito a regola d'arte.
9) Prezzi e pagamento: i prezzi si intendono IVA esclusa. Il pagamento avviene secondo le modalità indicate nel preventivo. In caso di ritardo si applicano gli interessi di mora ex D. Lgs. 231/2002.
10) Validità: il presente preventivo ha validità 30 giorni dalla data di emissione.
11) Documentazione fotografica: durante le lavorazioni Kalea Group Srl potrà eseguire fotografie o riprese a fini pubblicitari e di marketing, eventualmente pubblicate sul sito internet o sui canali social.
12) Foro competente: per ogni controversia è competente in via esclusiva il Foro di Brescia.

` + PRIVACY;

/** Testo termini per tipo. `null` = usa il testo standard i18n (Fornitura e Posa). */
export const QUOTE_TERMS: Record<QuoteType, string | null> = {
  fornitura_posa: null,
  fornitura: SOLO_FORNITURA,
  posa: SOLO_POSA,
  servizi: SERVIZI,
};
