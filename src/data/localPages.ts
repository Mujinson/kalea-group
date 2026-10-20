import heroSpc from "@/assets/hero-indoor.jpg";
import heroParquet from "@/assets/card-parquet-ambient.jpg";
import heroLaminato from "@/assets/hero-indoor-wood.jpg";
import heroMgo from "@/assets/hero-biomag-floor.jpg";
import heroEsterni from "@/assets/hero-outdoor.jpg";
import heroPosa from "@/assets/realizzazione-soggiorno-terram.jpg";

export interface LocalCity {
  slug: string;
  name: string;
  prov: string;
  km: number; // distanza indicativa dalla sede
  note: string; // paragrafo specifico della zona
  areas: string[];
}

export interface LocalProduct {
  slug: string;
  keyword: string; // es. "Pavimenti SPC"
  short: string;
  hero: string;
  link: string;
  linkLabel: string;
  intro: string;
  benefits: string[];
  ideal: string;
  faq: { q: string; a: string }[];
}

export const localCities: LocalCity[] = [
  { slug: "desenzano-del-garda", name: "Desenzano del Garda", prov: "BS", km: 0,
    note: "La nostra sede è in Via Generale Bernasconi 8A, a Desenzano: qui puoi vedere i campioni dal vivo e fissare un sopralluogo in giornata. Lavoriamo spesso in appartamenti vista lago, case vacanza e attività del centro storico, dove contano tempi rapidi e pochissima polvere.",
    areas: ["Rivoltella", "San Martino della Battaglia", "Centro storico", "Lungolago"] },
  { slug: "lago-di-garda", name: "Lago di Garda", prov: "BS/VR/TN", km: 0,
    note: "Copriamo tutta la sponda bresciana e veronese del Garda. Le case sul lago vivono umidità, sbalzi di temperatura e affitti brevi: per questo proponiamo superfici stabili, impermeabili e facili da pulire, sia dentro che su terrazze e bordi piscina.",
    areas: ["Sirmione", "Peschiera", "Salò", "Manerba", "Padenghe", "Bardolino", "Lazise", "Garda"] },
  { slug: "bergamo", name: "Bergamo", prov: "BG", km: 50,
    note: "Bergamo è una delle nostre province di riferimento: seguiamo ristrutturazioni di appartamenti, case indipendenti e attività commerciali, con squadre nostre e un unico referente dal sopralluogo alla consegna.",
    areas: ["Città Alta", "Bergamo centro", "Seriate", "Grumello del Monte", "Dalmine", "Stezzano", "Curno"] },
  { slug: "milano", name: "Milano", prov: "MI", km: 110,
    note: "A Milano e provincia lavoriamo su appartamenti, uffici e show room: soluzioni rapide e pulite, ideali per ristrutturazioni da consegnare in tempi stretti, tra un affitto e l'altro.",
    areas: ["Città Studi", "Porta Romana", "Isola", "San Siro", "Sesto San Giovanni", "Rho", "Monza"] },
  { slug: "como", name: "Como", prov: "CO", km: 90,
    note: "Sul lago di Como e nel comasco seguiamo ville, case di pregio e ristrutturazioni: superfici impermeabili e resistenti per case sul lago, parquet vero per gli interni di carattere.",
    areas: ["Como città", "Como nord", "Erba", "Cantù", "Mariano Comense", "Cernobbio"] },
  { slug: "sirmione", name: "Sirmione", prov: "BS", km: 10,
    note: "A Sirmione seguiamo ville, hotel e appartamenti per affitti turistici. Organizziamo i lavori fuori stagione o in finestre brevi, così la struttura resta chiusa il meno possibile.",
    areas: ["Colombare", "Lugana", "Centro storico"] },
  { slug: "lonato-del-garda", name: "Lonato del Garda", prov: "BS", km: 7,
    note: "Lonato è a pochi minuti dalla sede: sopralluogo, campionatura e preventivo arrivano in tempi brevissimi, anche per ristrutturazioni di case indipendenti e cascine.",
    areas: ["Centenaro", "Esenta", "Sedena", "Castel Venzago"] },
  { slug: "peschiera-del-garda", name: "Peschiera del Garda", prov: "VR", km: 18,
    note: "Lavoriamo regolarmente a Peschiera e nell'entroterra veronese del lago, su abitazioni, campeggi e strutture ricettive che hanno bisogno di pavimenti resistenti al traffico intenso.",
    areas: ["San Benedetto di Lugana", "Broglie", "Centro"] },
  { slug: "salo", name: "Salò", prov: "BS", km: 25,
    note: "A Salò e in Valtenesi seguiamo ristrutturazioni di case d'epoca e ville: spesso posiamo sopra il pavimento esistente, senza demolire, per non rovinare scale e soglie originali.",
    areas: ["Valtenesi", "Gardone Riviera", "Puegnago", "Roè Volciano"] },
  { slug: "brescia", name: "Brescia", prov: "BS", km: 30,
    note: "Serviamo Brescia città e provincia: appartamenti, uffici, negozi e studi professionali. Per gli spazi commerciali possiamo posare anche in orari serali o nel weekend.",
    areas: ["Centro", "Brescia Due", "Mompiano", "Franciacorta", "Rezzato", "Castenedolo", "Montichiari"] },
  { slug: "verona", name: "Verona", prov: "VR", km: 40,
    note: "Arriviamo a Verona e provincia con squadre nostre. Seguiamo appartamenti in centro, uffici e locali, con preventivo chiaro e un unico referente dal sopralluogo alla consegna.",
    areas: ["Centro storico", "Borgo Trento", "Valpolicella", "Villafranca", "Sona", "Castelnuovo del Garda"] },
];

export const localProducts: LocalProduct[] = [
  { slug: "pavimenti-spc", keyword: "Pavimenti SPC", short: "SPC", hero: heroSpc,
    link: "/it/indoor/spc", linkLabel: "Scopri le collezioni SPC",
    intro: "L'SPC (Stone Plastic Composite) è un pavimento a nucleo rigido: impermeabile, stabile e con posa a incastro Välinge 5G, senza colla. Si posa anche sopra le piastrelle esistenti, in pochi giorni.",
    benefits: ["100% impermeabile: adatto a cucine, bagni e case sul lago", "Posa flottante a incastro Välinge 5G, senza colla", "Si posa sopra il pavimento esistente, senza demolire", "Compatibile con riscaldamento a pavimento", "Effetto legno o pietra realistico"],
    ideal: "Ristrutturazioni veloci, case vacanza, appartamenti in affitto, negozi.",
    faq: [
      { q: "Il pavimento SPC si può posare sopra le piastrelle?", a: "Sì, se il fondo è planare. Verifichiamo durante il sopralluogo ed eventualmente livelliamo prima della posa." },
      { q: "Quanto dura la posa?", a: "Per un appartamento medio di solito pochi giorni, senza polvere da demolizione." },
      { q: "Bisogna tagliare le porte?", a: "Dipende dallo spessore e dalle porte esistenti: lo valutiamo e lo indichiamo nel preventivo." },
    ] },
  { slug: "parquet", keyword: "Parquet", short: "parquet", hero: heroParquet,
    link: "/it/parquet", linkLabel: "Scopri le collezioni parquet",
    intro: "Parquet prefinito in vero legno, rovere e altre essenze, in plancia, spina e formati grandi. Forniamo, posiamo e rigeneriamo parquet esistenti con levigatura, verniciatura o oliatura.",
    benefits: ["Vero legno con finiture naturali o spazzolate", "Formati a plancia, spina italiana e spina ungherese", "Posa incollata o flottante in base al fondo", "Rigenerazione e levigatura di parquet esistenti", "Consulenza su essenze e tonalità"],
    ideal: "Abitazioni di pregio, ville, ristrutturazioni dove si vuole il calore del legno vero.",
    faq: [
      { q: "Meglio parquet prefinito o SPC?", a: "Il parquet offre il legno vero e si può rigenerare; l'SPC è impermeabile e più economico da mantenere. Ti consigliamo in base a ambienti e uso." },
      { q: "Rigenerate anche parquet vecchi?", a: "Sì: levigatura, verniciatura o oliatura, con sopralluogo per valutarne lo stato." },
    ] },
  { slug: "pavimenti-laminati", keyword: "Pavimenti laminati", short: "laminato", hero: heroLaminato,
    link: "/it/indoor/laminati", linkLabel: "Scopri i laminati",
    intro: "Laminati di alta gamma resistenti a graffi e usura, con effetto legno naturale e posa rapida a incastro. La soluzione con il miglior rapporto tra resa estetica e budget.",
    benefits: ["Alta resistenza a graffi e calpestio", "Posa flottante veloce", "Ampia scelta di effetti legno", "Ideale anche per uffici e locali commerciali", "Manutenzione semplice"],
    ideal: "Camere, zone giorno, uffici, negozi con budget controllato.",
    faq: [
      { q: "Il laminato teme l'acqua?", a: "I laminati standard non vanno in bagno; per ambienti umidi consigliamo SPC o BIOMAG FLOOR®." },
      { q: "Si può posare sul riscaldamento a pavimento?", a: "Sì, con i prodotti e il materassino adatti." },
    ] },
  { slug: "pavimenti-mgo", keyword: "Pavimenti in MgO BIOMAG FLOOR®", short: "BIOMAG FLOOR® (MgO)", hero: heroMgo,
    link: "/it/biomag-floor", linkLabel: "Scopri BIOMAG FLOOR®",
    intro: "BIOMAG FLOOR® è il nostro pavimento a base di ossido di magnesio (MgO): ignifugo, impermeabile, antimuffa e senza emissioni VOC. Un'alternativa minerale e stabile all'SPC.",
    benefits: ["Nucleo minerale in ossido di magnesio", "Ignifugo e impermeabile", "Antimuffa e senza VOC", "Ottima stabilità e comfort acustico", "Compatibile con riscaldamento a pavimento"],
    ideal: "Case con bambini, strutture ricettive, chi cerca un materiale più naturale e sicuro.",
    faq: [
      { q: "Che differenza c'è tra MgO e SPC?", a: "Entrambi sono impermeabili e stabili; l'MgO ha un nucleo minerale, è ignifugo e non contiene PVC nel nucleo." },
      { q: "Si posa come l'SPC?", a: "Sì, con sistema a incastro e posa flottante, anche sopra pavimenti esistenti." },
    ] },
  { slug: "pavimenti-esterni", keyword: "Pavimenti per esterni", short: "pavimenti da esterno", hero: heroEsterni,
    link: "/it/externo", linkLabel: "Scopri Externo",
    intro: "Decking Externo per terrazze, bordi piscina e giardini, più ceramiche da esterno e pavimenti sopraelevati. Superfici antiscivolo pensate per sole, pioggia e salsedine del lago.",
    benefits: ["Decking Externo senza manutenzione periodica", "Soluzioni antiscivolo per bordo piscina", "Pavimenti sopraelevati per terrazze", "Ceramiche da esterno di selezione Kalēa®", "Resistenti a sole, gelo e umidità"],
    ideal: "Terrazze vista lago, giardini, piscine, dehors di ristoranti e hotel.",
    faq: [
      { q: "Il decking va trattato ogni anno?", a: "Externo non richiede oliature periodiche: basta una pulizia ordinaria." },
      { q: "Fate anche bordi piscina?", a: "Sì, con profili e finiture antiscivolo adatte." },
    ] },
  { slug: "posa-pavimenti", keyword: "Fornitura e posa pavimenti", short: "posa pavimenti", hero: heroPosa,
    link: "/it/servizi/fornitura-e-posa", linkLabel: "Il servizio di fornitura e posa",
    intro: "Un unico referente per tutto: sopralluogo, scelta del materiale, preparazione del fondo, posa, battiscopa e smaltimento. Squadre nostre, preventivo chiaro e tempi rispettati.",
    benefits: ["Sopralluogo e misure in cantiere", "Preparazione e livellamento del fondo", "Posa di SPC, parquet, laminato, MgO, ceramica ed esterni", "Battiscopa, profili e finiture", "Un solo preventivo, un solo referente"],
    ideal: "Privati, imprese edili, architetti e strutture ricettive.",
    faq: [
      { q: "Fate solo la posa se il materiale ce l'ho già?", a: "Valutiamo caso per caso: contattaci con foto e misure." },
      { q: "Come si richiede un preventivo?", a: "Dal preventivo online in pochi minuti, oppure chiamandoci per un sopralluogo." },
    ] },
];

export const localSlug = (p: LocalProduct, c: LocalCity) => `${p.slug}-${c.slug}`;

export const allLocalPages = localProducts.flatMap((p) =>
  localCities.map((c) => ({ product: p, city: c, slug: localSlug(p, c) }))
);

export const getLocalPage = (slug?: string) => allLocalPages.find((x) => x.slug === slug);
