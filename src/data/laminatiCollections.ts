import kUno from "@/assets/laminati/k-uno.webp";
import prestigeL from "@/assets/laminati/prestige-l.webp";
import prestigeGold from "@/assets/laminati/prestige-gold.webp";
import syncroParquet from "@/assets/laminati/syncro-parquet.webp";
import facile from "@/assets/laminati/facile.webp";
import visionTechnic from "@/assets/laminati/vision-technic.webp";
import visionOxid from "@/assets/laminati/vision-oxid.webp";

export interface LaminatoCollection {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  formats: string[];
  finishes: string[];
  applicazioni: string[];
}

export const laminatiCollections: LaminatoCollection[] = [
  {
    slug: "k-uno",
    name: "K-Uno",
    tagline: "Maxi doga, realismo estremo",
    description:
      "Laminato top di gamma in formato maxi doga. Tecnologia Hydro per resistenza ai ristagni d'acqua, incastro 5G Dry ad altissima tenuta e superficie sincroporo che riproduce con realismo le venature del legno. Pensato per progetti residenziali di livello e contract di rappresentanza.",
    image: kUno,
    formats: ["Maxi doga 245×2050 mm", "Spessore 10 mm"],
    finishes: ["Sincroporo", "Hydro", "Bordo bisellato 4 lati"],
    applicazioni: ["Residenziale alto", "Hotel", "Uffici direzionali", "Show-room"],
  },
  {
    slug: "prestige-l",
    name: "Prestige L",
    tagline: "Doga larga, effetto legno autentico",
    description:
      "Tra i laminati più richiesti per il realismo dell'effetto legno e l'eleganza della doga di grande formato. Superficie antistatica, bordo bisellato sui quattro lati, incastro TLS Plus ad alta tenuta. Adatto a residenziale, hospitality e ambienti commerciali ad uso moderato.",
    image: prestigeL,
    formats: ["Doga 234×2050 mm", "Spessore 10 mm"],
    finishes: ["Antistatico", "Bisellato 4 lati", "Effetto legno"],
    applicazioni: ["Residenziale", "Hospitality", "Retail"],
  },
  {
    slug: "prestige-gold",
    name: "Prestige Gold",
    tagline: "Performance elevate per uso intenso",
    description:
      "Laminato dalle caratteristiche tecniche evolute, con un'ampia gamma di decorativi effetto legno dal rustico al contemporaneo. Resistenza superiore al calpestio e all'usura, ideale per ambienti pubblici e ad alta frequentazione dove servono prestazioni costanti nel tempo.",
    image: prestigeGold,
    formats: ["Doga 170×1380 mm", "Spessore 9 mm"],
    finishes: ["Sincroporo", "Alta resistenza", "Antistatico"],
    applicazioni: ["Contract", "Uffici", "Spazi pubblici", "Hotel"],
  },
  {
    slug: "syncro-parquet",
    name: "Syncro Parquet",
    tagline: "Spina di pesce in laminato classe AC6",
    description:
      "Pavimento che unisce l'eleganza della posa a spina di pesce — classica italiana o ungherese — con la robustezza del laminato di ultima generazione. Massima resistenza all'abrasione (classe AC6), reazione al fuoco Bfl-s1, sistemi di incastro PLS e TLS.PF per una posa rapida e stabile.",
    image: syncroParquet,
    formats: ["120×600 mm", "Spina italiana / ungherese", "Spessore 10 mm"],
    finishes: ["Legno", "AC6 antiabrasione", "Bfl-s1"],
    applicazioni: ["Residenziale design", "Boutique", "Hospitality", "Contract"],
  },
  {
    slug: "facile",
    name: "Facile+",
    tagline: "Posa rapida per ristrutturazioni lampo",
    description:
      "Il laminato ideale per ristrutturazioni e nuove realizzazioni dove servono tempi rapidi: trasforma una casa, un hotel o un negozio in pochissimo tempo. Molto versatile grazie all'ampia gamma di decorativi proposti, mantiene un'estetica elegante e prestazioni affidabili.",
    image: facile,
    formats: ["Doga 254×1380 mm", "Spessore 8 mm"],
    finishes: ["Posa rapida", "Effetto legno", "Antistatico"],
    applicazioni: ["Residenziale", "Ristrutturazioni", "Hotel", "Retail"],
  },
  {
    slug: "vision-technic",
    name: "Vision Technic",
    tagline: "Tiles effetto acciaio e pietra",
    description:
      "Collezione pensata per i settori allestitivo, contract e office: laminati con decori effetto acciaio o pietra nel formato tiles. Superficie rapida da posare, molto resistente all'abrasione e al calpestio, sicura e con elevata reazione al fuoco.",
    image: visionTechnic,
    formats: ["327×655 mm", "Spessore 8 mm"],
    finishes: ["Metallo", "Pietra"],
    applicazioni: ["Allestimenti", "Contract", "Uffici", "Negozi"],
  },
  {
    slug: "vision-oxid",
    name: "Vision Oxid",
    tagline: "Materico cemento, pietra e graniglia",
    description:
      "Effetti materici pietra, cemento e graniglia in formato tiles per un design moderno e industriale. Massima classe di resistenza all'abrasione AC6, protezione Hydro dai ristagni d'acqua e incastro tecnologico per una posa rapida, stabile e precisa.",
    image: visionOxid,
    formats: ["644×644 mm", "Spessore 8 mm"],
    finishes: ["Cemento", "Pietra", "Graniglia"],
    applicazioni: ["Contract", "Retail", "Uffici", "Ambienti industriali"],
  },
];

export const getLaminatoCollection = (slug: string) =>
  laminatiCollections.find((c) => c.slug === slug);
