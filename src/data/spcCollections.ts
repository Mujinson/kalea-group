import stark from "@/assets/spc/stark.webp";
import starkR from "@/assets/spc/stark-r.webp";
import starkC from "@/assets/spc/stark-c.webp";
import starkS from "@/assets/spc/stark-s.webp";
import starkD from "@/assets/spc/stark-d.webp";
import starkW from "@/assets/spc/stark-w.webp";
import starkWMaxi from "@/assets/spc/stark-w-maxi.webp";
import starkWood from "@/assets/spc/stark-wood.webp";
import starkWoodSpina from "@/assets/spc/stark-wood-spina.webp";
import connex from "@/assets/spc/connex.webp";

export interface SpcCollection {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  formats: string[];
  finishes: string[];
  applicazioni: string[];
}

export const spcCollections: SpcCollection[] = [
  {
    slug: "stark",
    name: "Stark",
    tagline: "Doghe ampie, stabilità estrema",
    description:
      "Pavimento SPC con decoro legno in doghe di grande formato. Eccellente stabilità dimensionale e resistenza all'usura, ideale per ambienti ad alta frequentazione. Totalmente waterproof e antiscivolo, posabile anche in bagni, spa e palestre.",
    image: stark,
    formats: ["Doghe XL 1205 mm", "Spessore ridotto"],
    finishes: ["Decoro legno", "Antiscivolo", "Waterproof"],
    applicazioni: ["Residenziale", "Hotel", "Wellness", "Retail"],
  },
  {
    slug: "stark-r",
    name: "Stark R",
    tagline: "Registro superficie ultra realistico",
    description:
      "Tecnologia a registro applicata in superficie per un effetto legno di realismo assoluto. Finitura ultra matt, cromatismi precisi e venature senza nodi. Prestazioni SPC complete: waterproof, sottopavimento acustico preaccoppiato, antiscivolo.",
    image: starkR,
    formats: ["Doghe sincronizzate"],
    finishes: ["Ultra matt", "Registro superficie", "Antiscivolo"],
    applicazioni: ["Residenziale alto", "Hospitality", "Contract"],
  },
  {
    slug: "stark-c",
    name: "Stark C",
    tagline: "Sughero naturale, comfort silenzioso",
    description:
      "SPC con sottofondo in sughero che unisce design, stabilità, isolamento acustico e calore al tatto. Ideale per ristrutturazioni rapide con miglioramento del comfort termoacustico, mantenendo un effetto legno realistico e dettagliato.",
    image: starkC,
    formats: ["Doghe legno"],
    finishes: ["Sottofondo sughero", "Effetto legno"],
    applicazioni: ["Residenziale", "Uffici", "Ristrutturazioni"],
  },
  {
    slug: "stark-s",
    name: "Stark S",
    tagline: "Spina francese, eleganza tecnica",
    description:
      "SPC con disegno a spina francese, micro-bisello sui quattro lati e tecnologia end-less che sincronizza il disegno tra le doghe. Posa semplificata, effetto continuo, alta resistenza al fuoco e all'acqua.",
    image: starkS,
    formats: ["Spina francese"],
    finishes: ["Micro-bisello 4 lati", "End-less design"],
    applicazioni: ["Spazi pubblici", "Boutique", "Residenziale design"],
  },
  {
    slug: "stark-d",
    name: "Stark D",
    tagline: "Tiles industrial waterproof",
    description:
      "Pavimento in formato tiles ispirato all'industrial design, con estetiche pietra, cemento e metallo. Comfort tipico dell'SPC, waterproof e perfetto per bagni total look senza fughe, coordinabile con i rivestimenti Stark W.",
    image: starkD,
    formats: ["Tiles 1209 mm"],
    finishes: ["Pietra", "Cemento", "Metallo"],
    applicazioni: ["Uffici", "Bagni", "Retail", "Wellness"],
  },
  {
    slug: "stark-w",
    name: "Stark W",
    tagline: "Rivestimento parete coordinato",
    description:
      "Rivestimento a parete in SPC a basso spessore con decorativi effetto pietra e cemento in formato tiles, coordinati con i pavimenti Stark D. Ideale per pareti di bagni e docce con stile contemporaneo, total look e senza fughe.",
    image: starkW,
    formats: ["Tiles parete"],
    finishes: ["Pietra", "Cemento"],
    applicazioni: ["Bagni", "Docce", "Spa", "Hall"],
  },
  {
    slug: "stark-w-maxi",
    name: "Stark W Maxi",
    tagline: "Lastre marmo grande formato",
    description:
      "Grandi lastre SPC per rivestimenti a tutta altezza con decori effetto marmo. Eleganza classica unita a praticità: resistente all'acqua, igienico, posabile anche su pareti esistenti. Ideale per bagni, hall hotel, aree di rappresentanza.",
    image: starkWMaxi,
    formats: ["Lastre maxi"],
    finishes: ["Effetto marmo"],
    applicazioni: ["Bagni", "Hall hotel", "Spa", "Ingressi"],
  },
  {
    slug: "stark-wood",
    name: "Stark Wood",
    tagline: "Ibrido legno e SPC",
    description:
      "Vero pavimento in legno con caratteristiche tecniche dell'SPC. Superficie in legno autentico su supporto rigido, sottile per posa su pavimenti esistenti, resistente all'acqua, con sottofondo in sughero per comfort acustico ottimale.",
    image: starkWood,
    formats: ["Doghe 1605 mm"],
    finishes: ["Legno autentico", "Sottofondo sughero"],
    applicazioni: ["Residenziale", "Cucine", "Bagni"],
  },
  {
    slug: "stark-wood-spina",
    name: "Stark Wood Spina",
    tagline: "Spina di pesce ibrida",
    description:
      "Eleganza della spina di pesce classica con taglio a 90°, arricchita dai vantaggi del supporto SPC. La bellezza senza tempo del pattern a spina diventa posabile ovunque: residenziale, hotel, ristoranti, retail.",
    image: starkWoodSpina,
    formats: ["Spina italiana 90°"],
    finishes: ["Legno autentico", "Sottofondo sughero"],
    applicazioni: ["Residenziale", "Hotel", "Retail"],
  },
  {
    slug: "connex",
    name: "Connex",
    tagline: "Ultra sottile, ultra resistente",
    description:
      "L'SPC più sottile della gamma con spessore 5,5 mm. Reso silenzioso dal sottopavimento preaccoppiato e ultra resistente grazie all'overlay trasparente rinforzato. Pensato per ambienti commerciali ad elevato traffico, facile da pulire.",
    image: connex,
    formats: ["Spessore 5,5 mm"],
    finishes: ["Overlay rinforzato", "Sottopavimento integrato"],
    applicazioni: ["Commerciale", "Uffici", "Negozi"],
  },
];

export const getSpcCollection = (slug: string) =>
  spcCollections.find((c) => c.slug === slug);
