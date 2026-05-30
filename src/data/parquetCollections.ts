import dream from "@/assets/woodco/dream.webp";
import element from "@/assets/woodco/element.webp";
import ground from "@/assets/woodco/ground.webp";
import her from "@/assets/woodco/her.webp";
import him from "@/assets/woodco/him.webp";
import kalika from "@/assets/woodco/kalika.webp";
import sense from "@/assets/woodco/sense.webp";
import signature from "@/assets/woodco/signature.webp";
import star from "@/assets/woodco/star.webp";
import yles from "@/assets/parquet-extra/yles.webp";
import palladio from "@/assets/parquet-extra/palladio.webp";
import villa from "@/assets/parquet-extra/villa.webp";
import lumbertech205 from "@/assets/parquet-extra/lumbertech-205.webp";
import lumbertech270 from "@/assets/parquet-extra/lumbertech-270.webp";
import lumbertechS700 from "@/assets/parquet-extra/lumbertech-s700.webp";

export interface CaratteristicaParquet {
  label: string;
  description: string;
}

export interface ParquetCollection {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  formats: string[];
  finishes: string[];
  applicazioni?: string[];
  caratteristiche?: CaratteristicaParquet[];
  effectStoryTitle?: string;
  effectStory?: string;
}

const standardCaratteristiche = (extra?: CaratteristicaParquet): CaratteristicaParquet[] => [
  {
    label: "Tre strati",
    description:
      "Costruzione a tre strati con strato nobile in rovere europeo e supporto multistrato di betulla: massima stabilità dimensionale.",
  },
  {
    label: "Finiture sensoriali",
    description:
      "Spazzolatura, oliatura e verniciatura extra-opaca per superfici materiche che restituiscono la natura tattile del legno.",
  },
  extra ?? {
    label: "Posa flottante e incollata",
    description:
      "Compatibile con i principali sistemi di posa, ideale per progetti residenziali di alta gamma e contract di rappresentanza.",
  },
];

export const parquetCollections: ParquetCollection[] = [
  {
    slug: "signature",
    name: "Signature",
    tagline: "Plancia larga, carattere autentico",
    description:
      "Una collezione di rovere a plancia larga che esalta la naturalità della venatura. Finiture spazzolate e oliate per superfici materiche, dal segno deciso e dal calore tattile.",
    image: signature,
    formats: ["190×1900 mm", "Spessore 14 mm"],
    finishes: ["Legno"],
    applicazioni: ["Residenziale alto", "Hospitality", "Showroom"],
    caratteristiche: [
      {
        label: "Strato nobile 4 mm",
        description:
          "Spessore generoso dello strato di rovere: consente più cicli di levigatura nel tempo, prolungando la vita del pavimento.",
      },
      {
        label: "Plancia 190×1900",
        description:
          "Proporzione ampia che valorizza la lunghezza della venatura e amplia visivamente lo spazio.",
      },
      {
        label: "Finiture artigianali",
        description:
          "Spazzolatura profonda, oliatura naturale e verniciatura opaca eseguite con processi ad alto controllo manuale.",
      },
    ],
    effectStoryTitle: "La firma del rovere, plancia dopo plancia",
    effectStory:
      "Signature è il parquet che parla per primo nell'ambiente: la plancia larga, la venatura lunga, la materia spazzolata. È pensato per le residenze di alta gamma dove il pavimento diventa elemento architettonico, non sfondo.\n\nLo strato nobile di 4 mm garantisce decenni di vita utile, con la possibilità di rigenerare la superficie nel tempo senza sostituire il pavimento.",
  },
  {
    slug: "dream",
    name: "Dream",
    tagline: "Eleganza versatile in rovere",
    description:
      "Plance contemporanee dalla resa equilibrata, pensate per ambienti residenziali raffinati. Tonalità calibrate e finiture morbide che si integrano in qualsiasi linguaggio d'interni.",
    image: dream,
    formats: ["190×1900 mm", "Spessore 14 mm"],
    finishes: ["Legno"],
    applicazioni: ["Residenziale", "Hospitality", "Uffici"],
    caratteristiche: standardCaratteristiche(),
    effectStoryTitle: "Il rovere come fondo armonico dell'abitare",
    effectStory:
      "Dream è il parquet che non impone, accoglie. Tonalità rovere calibrate, finiture morbide, plancia in proporzione classica: la collezione che si adatta a qualsiasi linguaggio di interni senza perdere la propria identità.\n\nÈ la scelta del residenziale raffinato, dove il pavimento deve dialogare con arredi, tessuti e luce senza prendere la parola.",
  },
  {
    slug: "star",
    name: "Star",
    tagline: "Posa a spina iconica",
    description:
      "Spina italiana e spina ungherese dal disegno geometrico inconfondibile. Una collezione che cita la tradizione del parquet classico con sensibilità contemporanea.",
    image: star,
    formats: ["Spina italiana 90×450 mm", "Spina ungherese 90×600 mm", "Spessore 14 mm"],
    finishes: ["Legno"],
    applicazioni: ["Residenziale design", "Boutique", "Hospitality"],
    caratteristiche: [
      {
        label: "Spina italiana",
        description:
          "Disegno classico con elementi 90×450 mm posati a 90°: la spina di pesce nella sua forma più riconoscibile.",
      },
      {
        label: "Spina ungherese",
        description:
          "Elementi 90×600 mm con testa tagliata a 45°: un disegno più moderno, dal ritmo più ampio e contemporaneo.",
      },
      {
        label: "Finiture sensoriali",
        description:
          "Spazzolatura, affumicatura e oliatura per superfici tattili che valorizzano la geometria della posa.",
      },
    ],
    effectStoryTitle: "Il disegno classico del parquet, ripreso oggi",
    effectStory:
      "Star è il parquet della spina di pesce, quello che ha disegnato per secoli i pavimenti dei palazzi italiani e degli appartamenti haussmaniani. Star lo restituisce nelle due tradizioni — italiana e ungherese — con il linguaggio del rovere contemporaneo.\n\nÈ la collezione dei progetti che vogliono raccontare una storia precisa: residenze design, boutique, hospitality di carattere.",
  },
  {
    slug: "sense",
    name: "Sense",
    tagline: "Materia tattile e profonda",
    description:
      "Superfici dal rilievo accentuato e dalla texture viva. Sense valorizza i segni del legno con lavorazioni profonde e finiture matt per un effetto naturale e contemporaneo.",
    image: sense,
    formats: ["220×2200 mm", "Spessore 14 mm"],
    finishes: ["Legno"],
    applicazioni: ["Residenziale design", "Hospitality", "Showroom"],
    caratteristiche: [
      {
        label: "Piallato a mano",
        description:
          "Superficie lavorata con effetto piallatura artigianale: ogni plancia ha un rilievo proprio, irripetibile.",
      },
      {
        label: "Spazzolatura profonda",
        description:
          "Le venature più morbide vengono asportate e le dure restano in rilievo: il pavimento diventa materia tattile.",
      },
      {
        label: "Plancia 220×2200",
        description:
          "Formato extra large che amplifica la lettura del legno lavorato e dà respiro agli ambienti più ampi.",
      },
    ],
    effectStoryTitle: "Quando il legno torna a essere materia",
    effectStory:
      "Sense è il parquet che si tocca prima ancora di guardare. La piallatura a mano e la spazzolatura profonda rendono ogni plancia una superficie viva, dove il piede e la mano riconoscono la natura del rovere.\n\nÈ la scelta dei progetti che cercano nella materia un valore in più: residenze contemporanee, hotel di design, showroom dove il pavimento è prima esperienza tattile e poi visiva.",
  },
  {
    slug: "element",
    name: "Element",
    tagline: "Minimalismo essenziale",
    description:
      "Un parquet dal segno pulito, pensato per architetture rigorose. Tonalità neutre, superfici uniformi e finiture opache per ambienti sospesi tra natura e design.",
    image: element,
    formats: ["190×1900 mm", "Spessore 14 mm"],
    finishes: ["Legno"],
    applicazioni: ["Residenziale design", "Uffici", "Hospitality"],
    caratteristiche: [
      {
        label: "Finitura extra-opaca",
        description:
          "Verniciatura che azzera il riflesso e restituisce la naturalità del legno senza l'effetto laccato.",
      },
      {
        label: "Selezione uniforme",
        description:
          "Plance calibrate per cromia e venatura: il pavimento legge come una superficie continua e silenziosa.",
      },
      {
        label: "Posa flottante e incollata",
        description:
          "Compatibile con i principali sistemi di posa per integrarsi a qualsiasi tipologia di sottofondo.",
      },
    ],
    effectStoryTitle: "Il rovere ridotto all'essenziale",
    effectStory:
      "Element è il parquet dell'architettura minimalista: nessun segno superfluo, nessuna texture marcata. Il rovere è scelto e calibrato per restituire una superficie tranquilla, costante, che lascia parlare lo spazio e la luce.\n\nÈ la scelta dei progetti che vogliono un pavimento naturale ma silenzioso, dove il legno è materiale, non protagonista.",
  },
  {
    slug: "kalika",
    name: "Kalika",
    tagline: "Cromie ricercate, anima sartoriale",
    description:
      "Colorazioni esclusive e finiture artigianali. Kalika trasforma il rovere in una superficie d'autore, con tonalità calibrate per progetti d'arredo di alta gamma.",
    image: kalika,
    formats: ["190×1900 mm", "220×2200 mm", "Spessore 14 mm"],
    finishes: ["Legno"],
    applicazioni: ["Residenziale alto", "Boutique", "Hospitality"],
    caratteristiche: [
      {
        label: "Tinto in massa",
        description:
          "La colorazione penetra in profondità nello strato nobile: la cromia resta stabile anche dopo eventuali interventi di rigenerazione.",
      },
      {
        label: "Cromie esclusive",
        description:
          "Tonalità studiate per il progetto d'autore: dal grigio sospeso al brunito caldo, fuori dai cataloghi industriali.",
      },
      {
        label: "Doppia plancia",
        description:
          "Disponibile nei formati 190×1900 e 220×2200 per dare flessibilità progettuale agli ambienti più diversi.",
      },
    ],
    effectStoryTitle: "Il rovere come tela d'autore",
    effectStory:
      "Kalika è il parquet che esce dal catalogo standard: tonalità ricercate, finiture artigianali, una palette costruita per dialogare con l'arredo di alta gamma. Il rovere diventa supporto cromatico, materia che assume il colore del progetto.\n\nÈ la collezione che chiudono boutique di moda, residenze sartoriali e hospitality di nicchia: dove il pavimento è la firma, non l'arredo.",
  },
  {
    slug: "him",
    name: "Him",
    tagline: "Rovere classico, tono naturale",
    description:
      "La versione essenziale del parquet in rovere: selezione naturale, finiture leggere e una palette che valorizza la materia senza alterarla.",
    image: him,
    formats: ["190×1900 mm", "Spessore 14 mm"],
    finishes: ["Legno"],
    applicazioni: ["Residenziale", "Hospitality", "Uffici"],
    caratteristiche: standardCaratteristiche({
      label: "Selezione naturale AB",
      description:
        "Selezione che mantiene le caratteristiche naturali del rovere: piccoli nodi e variazioni cromatiche fanno parte del disegno.",
    }),
    effectStoryTitle: "Il rovere come natura lo restituisce",
    effectStory:
      "Him è il parquet della naturalezza dichiarata: il rovere viene lasciato leggere così com'è, con i suoi nodi, le sue variazioni di tono, le sue venature spontanee. Le finiture sono leggere, pensate per non interferire con la materia.\n\nÈ la scelta dei progetti che cercano nel pavimento un riferimento autentico, senza filtri estetici.",
  },
  {
    slug: "her",
    name: "Her",
    tagline: "Calde tonalità contemporanee",
    description:
      "Una collezione dalle nuance morbide e avvolgenti, studiata per ambienti dal mood caldo e accogliente. Finiture sensoriali e plance armoniose.",
    image: her,
    formats: ["190×1900 mm", "Spessore 14 mm"],
    finishes: ["Legno"],
    applicazioni: ["Residenziale", "Hospitality", "Boutique"],
    caratteristiche: standardCaratteristiche({
      label: "Cromie calde",
      description:
        "Palette costruita su tonalità ambrate, miele e brunito leggero: il pavimento porta calore visivo nell'ambiente.",
    }),
    effectStoryTitle: "Il calore come progetto",
    effectStory:
      "Her è il parquet pensato per gli ambienti che vogliono essere accoglienti: residenze familiari, suite alberghiere, boutique che curano l'esperienza del cliente. Le nuance morbide e avvolgenti danno mood caldo allo spazio.\n\nNon è un pavimento d'effetto, è un pavimento d'atmosfera: quello che si nota quando ci si toglie le scarpe, non quando si entra.",
  },
  {
    slug: "ground",
    name: "Ground",
    tagline: "Tonalità terrose e materiche",
    description:
      "Ispirata alla terra e ai minerali, Ground propone tinte profonde e finiture materiche per pavimenti dal carattere deciso e radicato.",
    image: ground,
    formats: ["190×1900 mm", "220×2200 mm", "Spessore 14 mm"],
    finishes: ["Legno"],
    applicazioni: ["Residenziale design", "Hospitality", "Retail"],
    caratteristiche: [
      {
        label: "Tinto torba",
        description:
          "Colorazione profonda ispirata alla terra umida: una tonalità calda e radicata che dà gravità all'ambiente.",
      },
      {
        label: "Spazzolatura profonda",
        description:
          "La lavorazione asporta le venature morbide del rovere: la superficie diventa fortemente materica.",
      },
      {
        label: "Doppia plancia",
        description:
          "Formati 190×1900 e 220×2200 mm per gestire scale d'ambiente diverse mantenendo la stessa cifra cromatica.",
      },
    ],
    effectStoryTitle: "Il pavimento che ha il colore della terra",
    effectStory:
      "Ground è il parquet che si ispira alla materia primaria: la terra, i minerali, i fondi naturali. La cromia profonda e la spazzolatura accentuata costruiscono un pavimento dal carattere deciso, radicato.\n\nÈ la scelta dei progetti che cercano gravità e identità: residenze design, hospitality con anima territoriale, retail che vuole un fondo materico.",
  },
  {
    slug: "yles",
    name: "Yles",
    tagline: "Plancia contemporanea, finitura essenziale",
    description:
      "Parquet in rovere a plancia, dal segno pulito e dalle tonalità essenziali. Yles unisce sensibilità contemporanea e qualità della selezione, ideale per progetti architettonici dal linguaggio rigoroso.",
    image: yles,
    formats: ["190×1900 mm", "Spessore 14 mm"],
    finishes: ["Legno"],
    applicazioni: ["Residenziale design", "Uffici", "Hospitality"],
    caratteristiche: standardCaratteristiche(),
    effectStoryTitle: "Il rovere dell'architettura rigorosa",
    effectStory:
      "Yles è il parquet dell'architettura che non vuole orpelli: plancia in proporzione contemporanea, finitura essenziale, cromia controllata. È pensato per chi vuole il legno vero ma cerca un segno pulito, non decorativo.\n\nTrova il suo posto nei progetti residenziali design e negli spazi di lavoro contemporanei dove il pavimento è materia, non ornamento.",
  },
  {
    slug: "palladio",
    name: "Palladio",
    tagline: "Tradizione italiana, plancia nobile",
    description:
      "Una collezione che reinterpreta la tradizione del parquet italiano: plance nobili, finiture artigianali e cromie calibrate per ambienti di alta rappresentanza.",
    image: palladio,
    formats: ["190×1900 mm", "220×2200 mm", "Spessore 14 mm"],
    finishes: ["Legno"],
    applicazioni: ["Residenziale alto", "Hospitality", "Spazi di rappresentanza"],
    caratteristiche: standardCaratteristiche({
      label: "Doppia plancia",
      description:
        "Formati 190×1900 e 220×2200 mm: la flessibilità della doppia misura per progetti di scala diversa.",
    }),
    effectStoryTitle: "Il parquet della tradizione italiana",
    effectStory:
      "Palladio è il parquet che cita la tradizione del legno italiano: plance nobili, finiture artigianali, cromie calibrate sulla cultura del progetto residenziale di alta rappresentanza.\n\nÈ la collezione che chiede di entrare nelle ville, negli appartamenti storici e negli ambienti dove il pavimento deve restituire un'identità culturale precisa.",
  },
  {
    slug: "villa",
    name: "Villa",
    tagline: "Eleganza residenziale di gran formato",
    description:
      "Plance di grande formato per residenze di pregio. Villa esalta la naturalità del rovere con superfici materiche e finiture morbide, pensate per spazi ampi e luminosi.",
    image: villa,
    formats: ["240×2400 mm", "Spessore 14 mm"],
    finishes: ["Legno"],
    applicazioni: ["Residenziale alto", "Ville", "Hospitality"],
    caratteristiche: [
      {
        label: "Maxi plancia 240×2400",
        description:
          "Il formato extra-grande dà ariosità agli ambienti ampi: la venatura del rovere si legge per oltre due metri senza giunzioni.",
      },
      {
        label: "Finiture morbide",
        description:
          "Oliature e verniciature opache pensate per ambienti luminosi: la superficie restituisce la luce senza rifletterla.",
      },
      {
        label: "Tre strati 14 mm",
        description:
          "Costruzione robusta con strato nobile generoso, pensata per durare nel tempo con la possibilità di rigenerazione.",
      },
    ],
    effectStoryTitle: "Il parquet che chiede ambienti grandi",
    effectStory:
      "Villa è il parquet pensato per gli ambienti residenziali di pregio: ville, attici, spazi ampi e luminosi. Il formato maxi 240×2400 mm dà respiro, la finitura morbida lascia parlare la luce.\n\nÈ la scelta dei progetti dove l'architettura ha generosità di spazio e il pavimento deve esserne all'altezza.",
  },
  {
    slug: "lumbertech-205",
    name: "Lumbertech 205",
    tagline: "Plancia tecnica a doga media",
    description:
      "Parquet tecnico a tre strati con plancia 205 mm di larghezza. Stabilità dimensionale superiore e ampia gamma di finiture, ideale per il residenziale di livello e il contract leggero.",
    image: lumbertech205,
    formats: ["205×2200 mm", "Spessore 14 mm"],
    finishes: ["Legno"],
    applicazioni: ["Residenziale", "Hospitality", "Uffici"],
    caratteristiche: [
      {
        label: "Plancia 205 mm",
        description:
          "La proporzione media tra plancia standard e maxi: equilibrata, adatta a moltissime tipologie di ambiente.",
      },
      {
        label: "Stabilità dimensionale",
        description:
          "Costruzione tecnica a tre strati: massima resistenza alle variazioni climatiche stagionali.",
      },
      {
        label: "Ampia gamma di finiture",
        description:
          "Disponibile in numerose tonalità e lavorazioni superficiali per adattarsi a qualsiasi progetto.",
      },
    ],
    effectStoryTitle: "Il rovere a misura di progetto",
    effectStory:
      "Lumbertech 205 è il parquet tecnico nella sua misura più versatile: la plancia da 205 mm dialoga con ambienti di qualsiasi scala, dal residenziale all'office leggero. La costruzione a tre strati garantisce stabilità nel tempo.\n\nÈ la scelta dei progetti che vogliono certezza tecnica senza rinunciare alla varietà espressiva del rovere.",
  },
  {
    slug: "lumbertech-270",
    name: "Lumbertech 270",
    tagline: "Plancia larga, comfort visivo",
    description:
      "Plancia tecnica larga 270 mm che amplifica la percezione dello spazio. Selezione rovere di pregio con finiture sensoriali e cromie naturali, pronta per i grandi progetti residenziali.",
    image: lumbertech270,
    formats: ["270×2400 mm", "Spessore 14 mm"],
    finishes: ["Legno"],
    applicazioni: ["Residenziale alto", "Ville", "Hospitality"],
    caratteristiche: [
      {
        label: "Plancia larga 270 mm",
        description:
          "Larghezza generosa che amplifica la percezione dello spazio e valorizza la venatura del rovere.",
      },
      {
        label: "Selezione di pregio",
        description:
          "Rovere selezionato per uniformità cromatica e qualità della grana, pensato per i progetti residenziali di alta gamma.",
      },
      {
        label: "Finiture sensoriali",
        description:
          "Spazzolature e oliature che restituiscono materialità tattile, senza coperture sintetiche pesanti.",
      },
    ],
    effectStoryTitle: "La plancia larga, comfort dello sguardo",
    effectStory:
      "Lumbertech 270 è il parquet che dà ariosità: la plancia larga 270 mm riduce il numero di giunti a vista e amplifica la percezione dello spazio. Negli ambienti residenziali di pregio diventa un fondo naturale che respira.\n\nLa selezione del rovere e le finiture sensoriali garantiscono che il comfort visivo si traduca anche in comfort tattile.",
  },
  {
    slug: "lumbertech-s700",
    name: "Lumbertech S700",
    tagline: "Maxi plancia, prestazioni contract",
    description:
      "La maxi plancia della linea tecnica: dimensioni generose, supporto stabile e finiture pensate per il contract di alta gamma. Calore del legno autentico unito a prestazioni costanti nel tempo.",
    image: lumbertechS700,
    formats: ["300×3000 mm", "Spessore 14 mm"],
    finishes: ["Legno"],
    applicazioni: ["Contract di alta gamma", "Hospitality", "Spazi di rappresentanza"],
    caratteristiche: [
      {
        label: "Maxi plancia",
        description:
          "Formato extra-grande pensato per i grandi ambienti contract: hospitality, spazi di rappresentanza, retail di lusso.",
      },
      {
        label: "Supporto stabile",
        description:
          "Costruzione tecnica calibrata sulle prestazioni di lunga durata richieste dal contract di alta gamma.",
      },
      {
        label: "Finiture contract",
        description:
          "Verniciature e oliature studiate per resistere al transito intenso senza perdere la naturalezza del rovere.",
      },
    ],
    effectStoryTitle: "Il parquet dei grandi spazi contract",
    effectStory:
      "Lumbertech S700 è la maxi plancia della linea tecnica: dimensioni generose pensate per gli ambienti contract più ampi. Hospitality, retail di lusso, spazi di rappresentanza dove il pavimento deve restituire identità e prestazione al tempo stesso.\n\nÈ la collezione che porta nel mondo contract il calore del legno vero, sostenuto da una costruzione tecnica calibrata per durare.",
  },
];

export const getParquetCollection = (slug: string) =>
  parquetCollections.find((c) => c.slug === slug);
