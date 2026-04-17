// Data file for ceramiche collection detail pages
// Naming policy: never mention the original manufacturer.
// All collections are presented as Kalēa® Surface System® exclusive selections.

import type { ColorItem } from "@/components/ColorCircleGallery";

// Prima Materia
import pmHero from "@/assets/ceramiche-collections/prima-materia/hero.jpeg";
import pmL1 from "@/assets/ceramiche-collections/prima-materia/lifestyle-1.jpeg";
import pmL2 from "@/assets/ceramiche-collections/prima-materia/lifestyle-2.jpg";
import pmL3 from "@/assets/ceramiche-collections/prima-materia/lifestyle-3.jpg";
import pmCemento from "@/assets/ceramiche-collections/prima-materia/variant-cemento.jpg";
import pmCenere from "@/assets/ceramiche-collections/prima-materia/variant-cenere.jpg";
import pmSandalo from "@/assets/ceramiche-collections/prima-materia/variant-sandalo.jpg";

// Carrière
import cHero from "@/assets/ceramiche-collections/carriere/hero.jpg";
import cL1 from "@/assets/ceramiche-collections/carriere/lifestyle-1.jpg";
import cL2 from "@/assets/ceramiche-collections/carriere/lifestyle-2.jpg";
import cL3 from "@/assets/ceramiche-collections/carriere/lifestyle-3.jpg";
import cNamur from "@/assets/ceramiche-collections/carriere/variant-namur.jpg";
import cGent from "@/assets/ceramiche-collections/carriere/variant-gent.jpg";
import cBruges from "@/assets/ceramiche-collections/carriere/variant-bruges.jpg";
import cAntiqueNamur from "@/assets/ceramiche-collections/carriere/variant-antique-namur.jpg";
import cAntiqueGent from "@/assets/ceramiche-collections/carriere/variant-antique-gent.jpg";
import cAntiqueBruges from "@/assets/ceramiche-collections/carriere/variant-antique-bruges.jpg";

// Rocks
import rHero from "@/assets/ceramiche-collections/rocks/hero.jpeg";
import rL1 from "@/assets/ceramiche-collections/rocks/lifestyle-1.jpg";
import rL2 from "@/assets/ceramiche-collections/rocks/lifestyle-2.jpg";
import rL3 from "@/assets/ceramiche-collections/rocks/lifestyle-3.jpg";
import rPorfido from "@/assets/ceramiche-collections/rocks/variant-porfido.jpg";
import rSilverblack from "@/assets/ceramiche-collections/rocks/variant-silverblack.jpg";

// Ske 2.0
import sHero from "@/assets/ceramiche-collections/ske-2-0/hero.jpg";
import sL1 from "@/assets/ceramiche-collections/ske-2-0/lifestyle-1.jpg";
import sGesso from "@/assets/ceramiche-collections/ske-2-0/variant-gesso.jpg";
import sCemento from "@/assets/ceramiche-collections/ske-2-0/variant-cemento.jpg";
import sSandalo from "@/assets/ceramiche-collections/ske-2-0/variant-sandalo.jpg";
import sSeta from "@/assets/ceramiche-collections/ske-2-0/variant-seta.jpg";
import sCenere from "@/assets/ceramiche-collections/ske-2-0/variant-cenere.jpg";
import sTortora from "@/assets/ceramiche-collections/ske-2-0/variant-tortora.jpg";
import sCalce from "@/assets/ceramiche-collections/ske-2-0/variant-calce.jpg";
import sCorda from "@/assets/ceramiche-collections/ske-2-0/variant-corda.jpg";
import sLimo from "@/assets/ceramiche-collections/ske-2-0/variant-limo.jpg";
import sPomice from "@/assets/ceramiche-collections/ske-2-0/variant-pomice.jpg";
import sMattone from "@/assets/ceramiche-collections/ske-2-0/variant-mattone.jpg";

export interface CeramicaCollection {
  slug: string;
  name: string;
  category: "interni" | "esterni";
  effect: string;
  tagline: string;
  description: string;
  longDescription: string;
  hero: string;
  lifestyle: string[];
  variants: ColorItem[];
  formats: string[];
  thickness: string;
  applications: string[];
  parentRoute: string; // index page route
}

export const ceramicheCollections: Record<string, CeramicaCollection> = {
  "prima-materia": {
    slug: "prima-materia",
    name: "Prima Materia",
    category: "interni",
    effect: "Effetto cemento",
    tagline: "L'essenza del cemento industriale reinterpretata",
    description:
      "Sviluppa le suggestioni materiche della superficie cemento per soluzioni differenziate e creative.",
    longDescription:
      "Prima Materia esprime l'eleganza del cemento contemporaneo in un gres porcellanato di altissima qualità, selezionato da Kalēa® per la sua straordinaria versatilità tra interni residenziali, contract e outdoor. Tonalità neutre e profonde, finiture matt che esaltano la profondità materica della superficie e la rendono protagonista di ambienti minimal o di forte carattere.",
    hero: pmHero,
    lifestyle: [pmL1, pmL2, pmL3],
    variants: [
      { name: "Cemento", slug: "cemento", circleImage: pmCemento, plankImage: pmCemento },
      { name: "Cenere", slug: "cenere", circleImage: pmCenere, plankImage: pmCenere },
      { name: "Sandalo", slug: "sandalo", circleImage: pmSandalo, plankImage: pmSandalo },
    ],
    formats: ["60x60", "60x120", "80x80", "120x120", "120x280"],
    thickness: "9 mm · 20 mm",
    applications: ["Residenziale", "Contract", "Hotel", "Spazi commerciali", "Outdoor (sp. 20mm)"],
    parentRoute: "ceramiche-interni",
  },
  "carriere": {
    slug: "carriere",
    name: "Carrière",
    category: "interni",
    effect: "Effetto pietra anticata",
    tagline: "Pietre antiche, fascino eterno",
    description:
      "Superfici che evocano il fascino delle antiche cave di pietra europee.",
    longDescription:
      "Carrière è un omaggio alle storiche cave di pietra del Belgio. Sei interpretazioni cromatiche divise tra finiture naturali e antiche, perfette per progetti che cercano un equilibrio tra carattere materico e sofisticazione minimale. Selezionata da Kalēa® per la sua texture profonda e la resa autentica delle pietre nordeuropee.",
    hero: cHero,
    lifestyle: [cL1, cL2, cL3],
    variants: [
      { name: "Namur", slug: "namur", circleImage: cNamur, plankImage: cNamur },
      { name: "Gent", slug: "gent", circleImage: cGent, plankImage: cGent },
      { name: "Bruges", slug: "bruges", circleImage: cBruges, plankImage: cBruges },
      { name: "Antique Namur", slug: "antique-namur", circleImage: cAntiqueNamur, plankImage: cAntiqueNamur },
      { name: "Antique Gent", slug: "antique-gent", circleImage: cAntiqueGent, plankImage: cAntiqueGent },
      { name: "Antique Bruges", slug: "antique-bruges", circleImage: cAntiqueBruges, plankImage: cAntiqueBruges },
    ],
    formats: ["60x60", "60x120", "80x80", "120x120"],
    thickness: "9 mm · 20 mm",
    applications: ["Residenziale", "Hospitality", "Retail", "Pavimentazioni esterne (sp. 20mm)"],
    parentRoute: "ceramiche-interni",
  },
  "rocks": {
    slug: "rocks",
    name: "Rocks",
    category: "interni",
    effect: "Effetto roccia",
    tagline: "La forza primordiale della roccia",
    description:
      "Texture rocciose e vibranti che portano la forza della natura negli interni più esigenti.",
    longDescription:
      "Rocks porta nei progetti contemporanei la potenza espressiva della roccia naturale. Due interpretazioni cromatiche — Porfido e Silverblack — pensate per pavimenti ad alto impatto visivo, rivestimenti distintivi e applicazioni outdoor di forte personalità. Selezionata da Kalēa® per la sua resa materica vibrante.",
    hero: rHero,
    lifestyle: [rL1, rL2, rL3],
    variants: [
      { name: "Porfido", slug: "porfido", circleImage: rPorfido, plankImage: rPorfido },
      { name: "Silverblack", slug: "silverblack", circleImage: rSilverblack, plankImage: rSilverblack },
    ],
    formats: ["30x60", "60x60", "60x120"],
    thickness: "9 mm · 20 mm",
    applications: ["Residenziale", "Hotel di montagna", "Outdoor", "Aree wellness"],
    parentRoute: "ceramiche-interni",
  },
  "ske-2-0": {
    slug: "ske-2-0",
    name: "Ske 2.0",
    category: "esterni",
    effect: "Outdoor 20 mm · Effetto cemento, pietra, gesso",
    tagline: "Continuità estetica tra indoor e outdoor",
    description:
      "Gres porcellanato spessore 20mm per garantire standard elevati negli spazi esterni.",
    longDescription:
      "Ske 2.0 raccoglie tutte le superfici outdoor in gres porcellanato 20 mm selezionate da Kalēa®, disponibili in finiture coordinate con le collezioni indoor per garantire una continuità visiva perfetta tra dentro e fuori. Undici varianti per rispondere a ogni esigenza progettuale: dal contemporaneo minimalismo del cemento alla sensorialità del gesso.",
    hero: sHero,
    lifestyle: [sL1],
    variants: [
      { name: "Gesso", slug: "gesso", circleImage: sGesso, plankImage: sGesso },
      { name: "Cemento", slug: "cemento", circleImage: sCemento, plankImage: sCemento },
      { name: "Sandalo", slug: "sandalo", circleImage: sSandalo, plankImage: sSandalo },
      { name: "Seta", slug: "seta", circleImage: sSeta, plankImage: sSeta },
      { name: "Cenere", slug: "cenere", circleImage: sCenere, plankImage: sCenere },
      { name: "Tortora", slug: "tortora", circleImage: sTortora, plankImage: sTortora },
      { name: "Calce", slug: "calce", circleImage: sCalce, plankImage: sCalce },
      { name: "Corda", slug: "corda", circleImage: sCorda, plankImage: sCorda },
      { name: "Limo", slug: "limo", circleImage: sLimo, plankImage: sLimo },
      { name: "Pomice", slug: "pomice", circleImage: sPomice, plankImage: sPomice },
      { name: "Mattone", slug: "mattone", circleImage: sMattone, plankImage: sMattone },
    ],
    formats: ["60x60", "60x120", "80x80", "120x120"],
    thickness: "20 mm",
    applications: ["Terrazze", "Bordi piscina", "Giardini", "Camminamenti", "Posa sopraelevata"],
    parentRoute: "ceramiche-esterni",
  },
};

export const getCollectionBySlug = (slug: string): CeramicaCollection | undefined =>
  ceramicheCollections[slug];

export const getCollectionsByCategory = (category: "interni" | "esterni"): CeramicaCollection[] =>
  Object.values(ceramicheCollections).filter((c) => c.category === category);
