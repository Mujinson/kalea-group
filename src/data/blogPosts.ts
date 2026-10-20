import imgSpc from "@/assets/hero-indoor.jpg";
import imgParquet from "@/assets/card-parquet-ambient.jpg";
import imgConfronto from "@/assets/realizzazione-cucina-sabbia.jpg";
import imgEsterni from "@/assets/hero-outdoor.jpg";
import imgLevigatura from "@/assets/hero-indoor-wood.jpg";
import imgSpc2 from "@/assets/realizzazione-soggiorno-terram.jpg";
import imgParquet2 from "@/assets/hero-hypermatt-spina.jpg";
import imgEsterni2 from "@/assets/card-externo-ambient.jpg";

export interface BlogSection {
  h2: string;
  p: string[];
  list?: string[];
  image?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  keyword: string;
  date: string;
  readMin: number;
  cover: string;
  problem: string;
  solution: string;
  sections: BlogSection[];
  cta: { text: string; link: string };
  related: { text: string; link: string }[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "pavimento-spc-cos-e-pro-contro",
    title: "Pavimento SPC: cos'è, pro e contro e quando sceglierlo",
    seoTitle: "Pavimento SPC: cos'è, pro e contro e quando conviene | Kalēa®",
    description: "Guida al pavimento SPC: cos'è, come è fatto, vantaggi, limiti e quando sceglierlo per rinnovare casa senza demolire. Consigli dei posatori Kalēa®.",
    keyword: "pavimento spc",
    date: "2026-10-20",
    readMin: 6,
    cover: imgSpc,
    problem: "Vuoi rinnovare il pavimento ma non vuoi demolire le vecchie piastrelle, vivere settimane nella polvere e spendere una fortuna in muratori.",
    solution: "Il pavimento SPC si posa a incastro sopra il pavimento esistente, è impermeabile e in pochi giorni la casa è pronta.",
    sections: [
      { h2: "Cos'è il pavimento SPC", p: [
        "SPC significa Stone Plastic Composite: è un pavimento a nucleo rigido composto in gran parte da polvere di pietra legata a un polimero. Sopra il nucleo c'è una pellicola decorativa (effetto legno o pietra) protetta da uno strato di usura trasparente.",
        "Rispetto ai vecchi vinilici morbidi, il nucleo rigido rende la plancia stabile: non si deforma con il caldo e copre meglio le piccole irregolarità del fondo.",
      ] },
      { h2: "I vantaggi principali", p: ["Sono i motivi per cui oggi l'SPC è uno dei pavimenti più cercati in Italia:"], list: [
        "Impermeabile: si può posare in cucina, in bagno e nelle case al lago",
        "Posa flottante a incastro (noi usiamo il sistema Välinge 5G), senza colla",
        "Si posa sopra piastrelle e marmette esistenti, se il fondo è planare",
        "Compatibile con il riscaldamento a pavimento",
        "Pulizia semplice: basta un panno umido",
      ], image: imgSpc2 },
      { h2: "I limiti da conoscere", p: [
        "L'SPC non è legno vero: non si leviga e, se un'asse si rovina in modo grave, si sostituisce la singola plancia. Il fondo deve essere planare, altrimenti va livellato prima della posa. Lo spessore aggiunto, di solito pochi millimetri, può richiedere di adattare alcune porte.",
        "Per questo facciamo sempre un sopralluogo: misuriamo, controlliamo la planarità e ti diciamo in anticipo se servono lavori sulle porte o sul fondo.",
      ] },
      { h2: "Quando conviene sceglierlo", p: [
        "L'SPC è la scelta giusta quando vuoi tempi rapidi e poca polvere: ristrutturazioni di appartamenti abitati, case vacanza, immobili in affitto, negozi e uffici. Se invece desideri il calore e la rigenerabilità del legno vero, valuta il parquet prefinito; se cerchi un nucleo minerale e ignifugo, guarda BIOMAG FLOOR® in ossido di magnesio.",
      ] },
      { h2: "Il problema risolto, in breve", p: [
        "Niente demolizione, niente macerie, niente settimane di cantiere: il pavimento nuovo si posa sopra il vecchio, resiste all'acqua e la casa torna abitabile in pochi giorni.",
      ] },
    ],
    cta: { text: "Calcola il preventivo per il tuo pavimento SPC", link: "/it/preventivo-online" },
    related: [
      { text: "Collezioni SPC Kalēa®", link: "/it/indoor/spc" },
      { text: "Pavimenti SPC a Desenzano del Garda", link: "/it/zone/pavimenti-spc-desenzano-del-garda" },
      { text: "Pavimenti SPC a Brescia", link: "/it/zone/pavimenti-spc-brescia" },
    ],
  },
  {
    slug: "parquet-prefinito-come-scegliere",
    title: "Parquet prefinito: come sceglierlo senza sbagliare",
    seoTitle: "Parquet prefinito: come sceglierlo (essenze, spessori, posa) | Kalēa®",
    description: "Parquet prefinito: come scegliere essenza, spessore dello strato nobile, finitura e tipo di posa. Gli errori più comuni e come evitarli.",
    keyword: "parquet prefinito",
    date: "2026-10-20",
    readMin: 6,
    cover: imgParquet,
    problem: "Davanti a decine di campioni di parquet tutti simili non sai cosa guardare, e hai paura di scegliere un legno che si rovina o che non si potrà mai rinnovare.",
    solution: "Bastano quattro criteri — essenza, strato nobile, finitura e posa — per scegliere un parquet prefinito che dura decenni.",
    sections: [
      { h2: "Cos'è il parquet prefinito", p: [
        "Il parquet prefinito è composto da uno strato superiore in legno pregiato (lo strato nobile) incollato su un supporto stabile. Arriva già levigato e verniciato o oliato dalla fabbrica: dopo la posa non servono lavorazioni in casa, quindi niente polvere e niente giorni di attesa per l'asciugatura.",
      ] },
      { h2: "1. L'essenza", p: [
        "Il rovere è il più richiesto: è resistente, stabile e si presta a molte tonalità, dal naturale chiaro allo spazzolato fumé. Essenze più tenere sono più delicate in zone di passaggio intenso o con animali.",
      ] },
      { h2: "2. Lo strato nobile", p: [
        "È lo spessore di legno vero in superficie. Più è spesso, più volte il parquet potrà essere levigato e rinnovato in futuro. È il dato tecnico più importante da chiedere, spesso più del prezzo al metro.",
      ], image: imgParquet2 },
      { h2: "3. La finitura", p: [], list: [
        "Verniciato: più protetto dalle macchie, manutenzione semplice",
        "Oliato: aspetto più naturale e caldo, si ritocca localmente",
        "Spazzolato: valorizza le venature e nasconde meglio i piccoli segni",
      ] },
      { h2: "4. Il formato e la posa", p: [
        "Plancia classica, spina italiana o spina ungherese cambiano l'effetto dell'ambiente. La posa può essere incollata o flottante: dipende dal fondo, dal riscaldamento a pavimento e dall'uso. Una posa sbagliata è la causa più comune di scricchiolii e fessure, più del legno stesso.",
      ] },
      { h2: "Il problema risolto, in breve", p: [
        "Scegli rovere per resistenza, chiedi lo spessore dello strato nobile, decidi tra vernice e olio in base a come vivi la casa e affida la posa a chi fa un sopralluogo sul fondo. Così il parquet dura decenni e si può rigenerare.",
      ] },
    ],
    cta: { text: "Richiedi campioni e sopralluogo", link: "/it/contatti" },
    related: [
      { text: "Collezioni parquet Kalēa®", link: "/it/parquet" },
      { text: "Parquet a Verona", link: "/it/zone/parquet-verona" },
      { text: "Parquet sul Lago di Garda", link: "/it/zone/parquet-lago-di-garda" },
    ],
  },
  {
    slug: "pavimento-vinilico-spc-o-laminato",
    title: "Pavimento vinilico, SPC o laminato: quale scegliere?",
    seoTitle: "Pavimento vinilico, SPC o laminato: differenze e quale scegliere | Kalēa®",
    description: "Vinilico, SPC o laminato? Confronto chiaro su resistenza all'acqua, rumore, posa e uso, per scegliere il pavimento giusto per ogni stanza.",
    keyword: "pavimento vinilico, spc o laminato",
    date: "2026-10-20",
    readMin: 5,
    cover: imgConfronto,
    problem: "Vinilico, SPC, LVT, laminato: i nomi si confondono e ogni negozio ti dice una cosa diversa. Rischi di mettere in bagno un pavimento che teme l'acqua.",
    solution: "Ecco le differenze reali in parole semplici, stanza per stanza.",
    sections: [
      { h2: "Il vinilico tradizionale (LVT)", p: [
        "È un pavimento flessibile in PVC, sottile e silenzioso. Resiste all'acqua, ma essendo morbido tende a 'copiare' le imperfezioni del fondo, che quindi deve essere perfetto. Spesso si incolla.",
      ] },
      { h2: "L'SPC", p: [
        "È un vinilico a nucleo rigido con polvere di pietra. Mantiene l'impermeabilità del vinilico, ma è stabile e si posa a incastro, anche sopra le piastrelle esistenti. È la scelta più versatile per chi ristruttura.",
      ] },
      { h2: "Il laminato", p: [
        "Ha un nucleo in fibra di legno ad alta densità e una superficie molto resistente ai graffi. È ottimo per camere, zone giorno e uffici, ma i laminati standard non vanno in bagno o in ambienti con acqua stagnante.",
      ], image: imgSpc },
      { h2: "Quale scegliere, stanza per stanza", p: [], list: [
        "Bagno e cucina: SPC o BIOMAG FLOOR® (MgO), impermeabili",
        "Zona giorno e camere: laminato, SPC o parquet",
        "Case al lago e affitti brevi: SPC o MgO, resistenti a umidità e traffico",
        "Uffici e negozi: laminato ad alta resistenza o SPC",
        "Con riscaldamento a pavimento: SPC, MgO o parquet adatto, con il materassino giusto",
      ] },
      { h2: "Il problema risolto, in breve", p: [
        "Se c'è acqua, scegli SPC o MgO. Se vuoi massima resistenza ai graffi a buon prezzo in zone asciutte, laminato. Se il fondo è perfetto e vuoi un pavimento sottile, vinilico incollato. In dubbio, un sopralluogo chiarisce tutto in mezz'ora.",
      ] },
    ],
    cta: { text: "Chiedi quale pavimento fa per te", link: "/it/contatti" },
    related: [
      { text: "Pavimenti SPC", link: "/it/indoor/spc" },
      { text: "Pavimenti laminati", link: "/it/indoor/laminati" },
      { text: "BIOMAG FLOOR®", link: "/it/biomag-floor" },
    ],
  },
  {
    slug: "pavimento-per-esterni-quale-scegliere",
    title: "Pavimento per esterni: quale resiste davvero a sole, gelo e umidità",
    seoTitle: "Pavimento per esterni: quale scegliere per terrazze e piscine | Kalēa®",
    description: "Pavimento per esterni: confronto tra decking, ceramica e sopraelevati per terrazze, giardini e bordi piscina. Come evitare scivolosità, macchie e manutenzione continua.",
    keyword: "pavimento per esterni",
    date: "2026-10-20",
    readMin: 5,
    cover: imgEsterni,
    problem: "Il legno della terrazza diventa grigio e va oliato ogni anno, le piastrelle del bordo piscina scivolano e d'inverno il gelo crea crepe.",
    solution: "Scegliendo il materiale giusto per l'uso, l'esterno resta bello per anni con una semplice pulizia.",
    sections: [
      { h2: "Le tre famiglie di pavimenti da esterno", p: [], list: [
        "Decking: plance per terrazze, pontili e bordi piscina, caldo al piede",
        "Ceramica da esterno: resistente al gelo, ideale per grandi superfici",
        "Pavimenti sopraelevati: lastre su supporti regolabili, perfetti per terrazze con impianti o pendenze",
      ] },
      { h2: "Decking senza manutenzione", p: [
        "Il legno naturale all'aperto ingrigisce e richiede trattamenti periodici. Il decking Externo nasce per evitare questo problema: non richiede oliature periodiche e resiste a sole, pioggia e umidità del lago con una pulizia ordinaria.",
      ], image: imgEsterni2 },
      { h2: "Bordo piscina: la sicurezza prima di tutto", p: [
        "Intorno alla piscina servono superfici antiscivolo e che non si scaldino troppo al sole. Scegli finiture strutturate e profili dedicati per il bordo vasca.",
      ] },
      { h2: "Terrazze sopra locali abitati", p: [
        "Se sotto la terrazza c'è un'abitazione, l'impermeabilizzazione è fondamentale. Il pavimento sopraelevato permette di non forare la guaina, di nascondere tubi e cavi e di ispezionare tutto in futuro.",
      ] },
      { h2: "Il problema risolto, in breve", p: [
        "Decking Externo dove vuoi il calore del legno senza manutenzione, ceramica da esterno per grandi superfici, sopraelevato per proteggere l'impermeabilizzazione. E sempre finiture antiscivolo vicino all'acqua.",
      ] },
    ],
    cta: { text: "Progetta il tuo esterno con noi", link: "/it/contatti" },
    related: [
      { text: "Decking Externo", link: "/it/externo" },
      { text: "Ceramiche da esterno", link: "/it/ceramiche-esterni" },
      { text: "Pavimenti per esterni sul Lago di Garda", link: "/it/zone/pavimenti-esterni-lago-di-garda" },
    ],
  },
  {
    slug: "levigatura-parquet-quando-conviene-costo",
    title: "Levigatura parquet: quando conviene e da cosa dipende il costo",
    seoTitle: "Levigatura parquet: costo, quando farla e alternative | Kalēa®",
    description: "Levigatura del parquet: quando serve, quanto dura il lavoro, da cosa dipende il costo e quando conviene verniciare, oliare o sostituire.",
    keyword: "levigatura parquet costo",
    date: "2026-10-20",
    readMin: 5,
    cover: imgLevigatura,
    problem: "Il parquet è graffiato, opaco e ingrigito: pensi di doverlo buttare e rifare tutto, con costi e disagi enormi.",
    solution: "Nella maggior parte dei casi una levigatura con nuova finitura lo riporta come nuovo, a una frazione del costo di un pavimento nuovo.",
    sections: [
      { h2: "Quando serve la levigatura", p: [], list: [
        "Graffi diffusi e segni di usura nelle zone di passaggio",
        "Vernice consumata, opaca o ingiallita",
        "Macchie superficiali e legno ingrigito",
        "Voglia di cambiare tonalità (più chiara, naturale o scura)",
      ] },
      { h2: "Da cosa dipende il costo", p: [
        "Ogni parquet è diverso, per questo un prezzo serio arriva solo dopo un sopralluogo. I fattori che lo determinano sono:",
      ], list: [
        "Metri quadri e numero di stanze",
        "Stato del legno: piccoli graffi o danni profondi, stuccature",
        "Spessore residuo dello strato nobile",
        "Tipo di finitura scelta: vernice, olio, colorazione",
        "Presenza di battiscopa e mobili da spostare",
      ] },
      { h2: "Vernice o olio dopo la levigatura?", p: [
        "La vernice crea una pellicola protettiva resistente e facile da pulire. L'olio penetra nel legno, dà un aspetto più naturale e si può ritoccare a zone senza rifare tutto. Ti consigliamo in base a figli, animali e uso degli ambienti.",
      ], image: imgParquet },
      { h2: "Quando invece conviene sostituire", p: [
        "Se lo strato nobile è troppo sottile, ci sono distacchi diffusi o danni da acqua importanti, la levigatura non basta. In quel caso valutiamo insieme un nuovo parquet o una soluzione da posare sopra senza demolire, come SPC o BIOMAG FLOOR®.",
      ] },
      { h2: "Il problema risolto, in breve", p: [
        "Prima di buttare il parquet, fallo valutare: spesso levigatura e nuova finitura bastano, in pochi giorni e senza demolire nulla.",
      ] },
    ],
    cta: { text: "Prenota un sopralluogo per il tuo parquet", link: "/it/contatti" },
    related: [
      { text: "Levigatura, verniciatura e oliatura", link: "/it/servizi/levigatura-verniciatura-oliatura" },
      { text: "Rigenerazione parquet", link: "/it/servizi/rigenerazione-parquet" },
      { text: "Parquet a Brescia", link: "/it/zone/parquet-brescia" },
    ],
  },
];

export const getBlogPost = (slug?: string) => blogPosts.find((p) => p.slug === slug);
