import kUno from "@/assets/laminati/k-uno.webp";
import prestigeL from "@/assets/laminati/prestige-l.webp";
import prestigeGold from "@/assets/laminati/prestige-gold.webp";
import syncroParquet from "@/assets/laminati/syncro-parquet.webp";
import facile from "@/assets/laminati/facile.webp";
import visionTechnic from "@/assets/laminati/vision-technic.webp";
import visionOxid from "@/assets/laminati/vision-oxid.webp";

export interface CaratteristicaLaminato {
  label: string;
  description: string;
}

export interface LaminatoCollection {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  formats: string[];
  finishes: string[];
  applicazioni: string[];
  caratteristiche?: CaratteristicaLaminato[];
  effectStoryTitle?: string;
  effectStory?: string;
}

export const laminatiCollections: LaminatoCollection[] = [
  {
    slug: "k-uno",
    name: "K-Uno",
    tagline: "Maxi doga, realismo estremo",
    description:
      "Laminato top di gamma in formato maxi doga. Tecnologia Hydro per resistenza ai ristagni d'acqua, incastro 5G Dry ad altissima tenuta e superficie sincroporo che riproduce con realismo le venature del legno.",
    image: kUno,
    formats: ["245×2050 mm", "Spessore 10 mm"],
    finishes: ["Legno"],
    applicazioni: ["Residenziale alto", "Hotel", "Uffici direzionali", "Show-room"],
    caratteristiche: [
      {
        label: "Sincroporo",
        description:
          "La superficie segue in registro le venature del decoro: il tatto incontra esattamente quello che l'occhio vede, restituendo la sensazione del legno vero.",
      },
      {
        label: "Hydro",
        description:
          "Trattamento protettivo del bordo e del supporto HDF che garantisce resistenza ai ristagni d'acqua nelle normali attività domestiche.",
      },
      {
        label: "Incastro 5G Dry",
        description:
          "Sistema di posa rapido a click sui quattro lati, con tenuta meccanica elevata e stabilità del giunto nel tempo.",
      },
    ],
    effectStoryTitle: "Rovere maxi, l'eleganza della doga lunga",
    effectStory:
      "K-Uno nasce per chi cerca nel laminato la stessa nobiltà visiva del legno vero. La maxi doga 245×2050 mm restituisce ambienti distesi, dove la venatura corre per oltre due metri senza interruzioni.\n\nLa superficie sincroporo segue il disegno del decoro, creando un dialogo tra vista e tatto che è la firma dei laminati di alta gamma. Tonalità calibrate, dal rovere chiaro contemporaneo alle nuance brunite più calde.",
  },
  {
    slug: "prestige-l",
    name: "Prestige L",
    tagline: "Doga larga, effetto legno autentico",
    description:
      "Tra i laminati più richiesti per il realismo dell'effetto legno e l'eleganza della doga di grande formato. Superficie antistatica, bordo bisellato sui quattro lati, incastro TLS Plus ad alta tenuta.",
    image: prestigeL,
    formats: ["234×2050 mm", "Spessore 10 mm"],
    finishes: ["Legno"],
    applicazioni: ["Residenziale", "Hospitality", "Retail"],
    caratteristiche: [
      {
        label: "Doga di grande formato",
        description:
          "234 mm di larghezza per oltre due metri di lunghezza: una proporzione che amplifica la percezione dello spazio.",
      },
      {
        label: "Bordo bisellato 4 lati",
        description:
          "La micro-bisellatura sui quattro lati definisce ogni singola doga, esaltando il ritmo della posa e nascondendo le piccole tolleranze d'installazione.",
      },
      {
        label: "Incastro TLS Plus",
        description:
          "Sistema di blocco evoluto che assicura precisione e tenuta del giunto, riducendo al minimo aperture e disallineamenti.",
      },
    ],
    effectStoryTitle: "Il classico contemporaneo del laminato",
    effectStory:
      "Prestige L è la collezione che ha definito lo standard del laminato premium: doga larga, decoro realistico, posa pulita. È pensato per chi vuole l'estetica del parquet ma cerca un pavimento più semplice da posare e mantenere.\n\nL'ampia gamma di rovere, dal chiaro nordico all'affumicato profondo, lo rende adatto sia agli interni residenziali sia agli spazi hospitality di livello.",
  },
  {
    slug: "prestige-gold",
    name: "Prestige Gold",
    tagline: "Performance elevate per uso intenso",
    description:
      "Laminato dalle caratteristiche tecniche evolute, con un'ampia gamma di decorativi effetto legno dal rustico al contemporaneo. Resistenza superiore al calpestio e all'usura, ideale per ambienti pubblici e ad alta frequentazione.",
    image: prestigeGold,
    formats: ["170×1380 mm", "Spessore 9 mm"],
    finishes: ["Legno"],
    applicazioni: ["Contract", "Uffici", "Spazi pubblici", "Hotel"],
    caratteristiche: [
      {
        label: "Alta resistenza",
        description:
          "Classe AC5: resiste al calpestio intenso degli ambienti pubblici e commerciali ad alta frequentazione mantenendo l'aspetto originale nel tempo.",
      },
      {
        label: "Antistatico",
        description:
          "Trattamento permanente che riduce l'accumulo di cariche elettrostatiche, migliorando il comfort e la pulizia della superficie.",
      },
      {
        label: "Ampia gamma decorativa",
        description:
          "Decori che spaziano dal rustico tradizionale al rovere contemporaneo, per adattarsi a qualsiasi progetto contract.",
      },
    ],
    effectStoryTitle: "Il laminato che lavora tutti i giorni",
    effectStory:
      "Prestige Gold è studiato per gli ambienti che chiedono di più: uffici aperti, hotel, ristoranti, spazi di vendita. La superficie ad alta resistenza assorbe il transito quotidiano senza perdere uniformità.\n\nL'estetica resta calda e residenziale: una scelta che permette di dare carattere agli spazi pubblici senza rinunciare alla solidità tecnica del laminato professionale.",
  },
  {
    slug: "syncro-parquet",
    name: "Syncro Parquet",
    tagline: "Spina di pesce in laminato classe AC6",
    description:
      "Pavimento che unisce l'eleganza della posa a spina di pesce — classica italiana o ungherese — con la robustezza del laminato di ultima generazione. Massima resistenza all'abrasione (classe AC6), reazione al fuoco Bfl-s1.",
    image: syncroParquet,
    formats: ["120×600 mm", "Spessore 10 mm"],
    finishes: ["Legno"],
    applicazioni: ["Residenziale design", "Boutique", "Hospitality", "Contract"],
    caratteristiche: [
      {
        label: "Spina italiana e ungherese",
        description:
          "Il formato 120×600 mm permette di realizzare entrambi i disegni storici della tradizione del parquet, con la praticità del laminato.",
      },
      {
        label: "Classe AC6",
        description:
          "La massima classificazione di resistenza all'abrasione disponibile per i laminati: prestazioni superiori anche in scenari di uso intenso.",
      },
      {
        label: "Reazione al fuoco Bfl-s1",
        description:
          "Classificazione che ne consente l'utilizzo nei luoghi pubblici dove sono richieste prestazioni di sicurezza certificate.",
      },
    ],
    effectStoryTitle: "La spina che torna, in chiave contemporanea",
    effectStory:
      "Syncro Parquet riprende il disegno geometrico più iconico del parquet — la spina di pesce — e lo trasferisce nel laminato di ultima generazione. Il risultato è un pavimento che ha la grazia storica della spina italiana o ungherese e la praticità tecnica di un laminato AC6.\n\nUna soluzione per residenze d'autore, boutique e hospitality dove l'identità del progetto passa anche dal disegno del pavimento.",
  },
  {
    slug: "facile",
    name: "Facile+",
    tagline: "Posa rapida per ristrutturazioni lampo",
    description:
      "Il laminato ideale per ristrutturazioni e nuove realizzazioni dove servono tempi rapidi: trasforma una casa, un hotel o un negozio in pochissimo tempo, mantenendo un'estetica elegante e prestazioni affidabili.",
    image: facile,
    formats: ["254×1380 mm", "Spessore 8 mm"],
    finishes: ["Legno"],
    applicazioni: ["Residenziale", "Ristrutturazioni", "Hotel", "Retail"],
    caratteristiche: [
      {
        label: "Posa ultra-rapida",
        description:
          "Sistema di incastro ottimizzato per ridurre drasticamente i tempi di installazione, ideale nei cantieri di ristrutturazione.",
      },
      {
        label: "Doga 254 mm",
        description:
          "Larghezza generosa che velocizza la copertura della superficie e dona ariosità all'ambiente.",
      },
      {
        label: "Versatilità decorativa",
        description:
          "Ampia gamma di decori legno, dal chiaro al brunito, per integrarsi con qualsiasi linguaggio di interni esistente.",
      },
    ],
    effectStoryTitle: "Quando la ristrutturazione non può aspettare",
    effectStory:
      "Facile+ è il laminato pensato per i tempi del cantiere reale: ristrutturazioni che devono essere consegnate in pochi giorni, hotel da riportare in funzione, negozi che cambiano allestimento.\n\nLa doga larga 254 mm semplifica e velocizza la posa senza penalizzare l'estetica: il pavimento resta caldo, elegante, riconoscibilmente legno.",
  },
  {
    slug: "vision-technic",
    name: "Vision Technic",
    tagline: "Tiles effetto acciaio e pietra",
    description:
      "Collezione pensata per i settori allestitivo, contract e office: laminati con decori effetto acciaio o pietra nel formato tiles. Superficie rapida da posare, molto resistente all'abrasione e al calpestio.",
    image: visionTechnic,
    formats: ["327×655 mm", "Spessore 8 mm"],
    finishes: ["Pietra"],
    applicazioni: ["Allestimenti", "Contract", "Uffici", "Negozi"],
    caratteristiche: [
      {
        label: "Formato tiles",
        description:
          "Il formato 327×655 mm restituisce la modularità della piastrella, perfetto per ambienti di lavoro e spazi commerciali.",
      },
      {
        label: "Decori tecnici",
        description:
          "Effetti acciaio brunito, pietra grezza e materici contemporanei per un linguaggio architettonico essenziale.",
      },
      {
        label: "Resistenza al calpestio",
        description:
          "Pensato per il transito intenso di uffici, allestimenti fieristici e spazi retail con prestazioni costanti.",
      },
    ],
    effectStoryTitle: "Materia industriale, posa rapida",
    effectStory:
      "Vision Technic porta nel laminato l'estetica dei pavimenti industriali e tecnici: superfici in acciaio brunito e pietra grezza che riescono a dare carattere agli spazi di lavoro e agli ambienti retail.\n\nIl formato tiles asseconda il linguaggio architettonico contemporaneo, dove il pavimento diventa fondo neutro e materico al tempo stesso.",
  },
  {
    slug: "vision-oxid",
    name: "Vision Oxid",
    tagline: "Materico cemento, pietra e graniglia",
    description:
      "Effetti materici pietra, cemento e graniglia in formato tiles per un design moderno e industriale. Massima classe di resistenza all'abrasione AC6, protezione Hydro dai ristagni d'acqua e incastro tecnologico.",
    image: visionOxid,
    formats: ["644×644 mm", "Spessore 8 mm"],
    finishes: ["Cemento"],
    applicazioni: ["Contract", "Retail", "Uffici", "Ambienti industriali"],
    caratteristiche: [
      {
        label: "Maxi tile 644×644",
        description:
          "Il formato quadrato di grandi dimensioni amplia la percezione visiva e riduce il numero di fughe a vista.",
      },
      {
        label: "Classe AC6",
        description:
          "La massima resistenza all'abrasione disponibile per i laminati: ideale per ambienti pubblici e industriali ad altissimo transito.",
      },
      {
        label: "Hydro protection",
        description:
          "Protezione contro i ristagni d'acqua di breve durata, fondamentale per gli ambienti contract più esigenti.",
      },
    ],
    effectStoryTitle: "Cemento e graniglia nel formato del laminato",
    effectStory:
      "Vision Oxid è la risposta al desiderio di pavimenti materici — cemento, pietra, graniglia veneziana — in un supporto che si posa in giorni anziché in settimane. La superficie restituisce la tattilità del materiale originale.\n\nUna collezione che ha senso negli show-room, nei concept store, negli uffici contemporanei: spazi dove l'identità materica del pavimento racconta il brand prima ancora delle parole.",
  },
];

export const getLaminatoCollection = (slug: string) =>
  laminatiCollections.find((c) => c.slug === slug);
