// Localization layer for ceramiche collections.
// Only textual fields. Images, slugs, formats, and structural data come from ceramicheCollections.ts.
// DE and FR currently fall back to IT — to be properly translated later.

import type { Language } from "@/i18n/translations";
import { ceramicheCollections, type CeramicaCollection } from "./ceramicheCollections";

export interface CeramicaText {
  effect: string;
  tagline: string;
  description: string;
  longDescription: string;
  applications: string[];
}

type CeramicheTextDict = Record<string, Partial<Record<Language, CeramicaText>>>;

// Translations: slug -> language -> textual fields
const dict: CeramicheTextDict = {
  "prima-materia": {
    en: {
      effect: "Concrete effect",
      tagline: "The essence of industrial concrete reinterpreted",
      description: "Develops the material suggestions of the concrete surface for differentiated and creative solutions.",
      longDescription: "Prima Materia expresses the elegance of contemporary concrete in a top-quality porcelain stoneware, selected by Kalēa® for its extraordinary versatility between residential interiors, contract and outdoor. Neutral and deep tones, matt finishes that enhance the material depth of the surface and make it the protagonist of minimal or strong-character environments.",
      applications: ["Residential", "Contract", "Hotel", "Commercial spaces", "Outdoor (20mm thick.)"],
    },
  },
  "carriere": {
    en: {
      effect: "Antiqued stone effect",
      tagline: "Ancient stones, eternal charm",
      description: "Surfaces that evoke the charm of ancient European stone quarries.",
      longDescription: "Carrière is a tribute to the historic Belgian stone quarries. Six chromatic interpretations divided between natural and antique finishes, perfect for projects seeking a balance between material character and minimal sophistication. Selected by Kalēa® for its deep texture and authentic rendering of Northern European stones.",
      applications: ["Residential", "Hospitality", "Retail", "Outdoor flooring (20mm thick.)"],
    },
  },
  "rocks": {
    en: {
      effect: "Rock effect",
      tagline: "The primordial force of rock",
      description: "Rocky and vibrant textures bringing the strength of nature to the most demanding interiors.",
      longDescription: "Rocks brings to contemporary projects the expressive power of natural rock. Two chromatic interpretations — Porfido and Silverblack — designed for high-impact floors, distinctive coverings and outdoor applications with strong personality. Selected by Kalēa® for its vibrant material rendering.",
      applications: ["Residential", "Mountain hotels", "Outdoor", "Wellness areas"],
    },
  },
  "materia": {
    en: {
      effect: "Material concrete effect",
      tagline: "Sensory, alive, material, engaging",
      description: "A porcelain stoneware project that translates the material essence of concrete into surface.",
      longDescription: "Materia is a sensory, alive, material and engaging project — selected by Kalēa® for its extraordinary ability to transform any environment into a tactile experience. Nine chromatic variants, from chalk to concrete to the warm accents of peach and olive, designed to dialogue with contemporary architecture, high-end hotels and residential spaces of character.",
      applications: ["Residential", "Contract", "Hotel", "Retail"],
    },
  },
  "pierre-vive": {
    en: {
      effect: "Natural stone effect",
      tagline: "The living soul of natural stone",
      description: "A collection that captures the essence of French natural stone with extraordinary material depth.",
      longDescription: "Pierre Vive evokes the nobility of French stones in a dual soul: Noble for refined surfaces and Ancienne for aged, antique finishes. Eight chromatic variants selected by Kalēa® for top-tier residential and contract projects, in ideal continuity with outdoor spaces.",
      applications: ["Residential", "Hospitality", "Contract", "Outdoor (20mm thick.)"],
    },
  },
  "nativa": {
    en: {
      effect: "Travertine effect",
      tagline: "The warm and delicate charm of travertine",
      description: "From the dialogue between the natural universe and the human dimension comes a timeless material.",
      longDescription: "Nativa is a porcelain stoneware collection that translates the charm of travertine with two cuts — Falda and Vena — and three warm tones: Lux, Aurum, Tibur, plus the darker Lapillo version. Selected by Kalēa® for its authentic chromatic rendering and depth of veining, it is ideal for environments seeking essential elegance.",
      applications: ["Residential", "Hotel", "Wellness", "SPA"],
    },
  },
  "piasentina-stone": {
    en: {
      effect: "Piasentina stone effect",
      tagline: "The nobility of Piasentina stone",
      description: "Porcelain stoneware reinterpretation of one of the most sought-after stones in Italian architecture.",
      longDescription: "Piasentina Stone reinterprets in porcelain stoneware the famous Friulian stone, symbol of Italian architecture. Three finishes — Velvet, Flamed and Milled — for an authentic and versatile material rendering, capable of responding to character projects in both residential and commercial sectors.",
      applications: ["Residential", "Contract", "Public architecture"],
    },
  },
  "essence": {
    en: {
      effect: "Oak wood effect",
      tagline: "The timeless elegance of oak wood",
      description: "The authentic warmth of wood transferred to top-quality porcelain stoneware.",
      longDescription: "Essence brings to contemporary floors the nobility of oak wood with the durability of porcelain stoneware. A palette of four main shades — Pure, Ambre, Musk, Moka — flanked by Strip versions and Deck variants for outdoor, perfect for high-end residential and contract projects.",
      applications: ["Residential", "Hospitality", "Retail", "Terraces (Deck)"],
    },
  },
  "le-reverse": {
    en: {
      effect: "Antique stone effect",
      tagline: "The dual soul of stone",
      description: "From the primordial and ancient appearance to the most intimate and hidden one of natural stone.",
      longDescription: "Le Reverse arises from the study of the natural element to discover the dual soul of stone. Four chromatic families — Opal, Dune, Taupe, Nuit — declined in three finishes (Elegance, Antique, Carved) for twelve total variants. Selected by Kalēa® for its design uniqueness.",
      applications: ["Residential", "Hospitality", "Contemporary architecture"],
    },
  },
  "metallique": {
    en: {
      effect: "Metal effect",
      tagline: "Metallic matter at the service of design",
      description: "Porcelain stoneware with iridescent reflections and contemporary industrial textures.",
      longDescription: "Metallique is a collection that translates the materiality of metal into architectural surfaces. Three base shades — Noir, Lame, Brune — flanked by Oxyde versions for an aged effect of strong character. Selected by Kalēa® for contemporary projects, luxury retail and signature hospitality.",
      applications: ["Retail", "Hospitality", "Contemporary architecture"],
    },
  },
  "terra-crea": {
    en: {
      effect: "Clay / terracotta effect",
      tagline: "The authenticity of shaped earth",
      description: "A collection inspired by hand-worked clay earth.",
      longDescription: "Terra Crea is the collection that brings to contemporary environments the primordial charm of natural materials. Five warm tones — Calce, Corda, Limo, Pomice, Mattone — selected by Kalēa® for projects seeking material authenticity, chromatic balance and an engaging tactile dimension.",
      applications: ["Residential", "Hospitality", "Wellness", "Outdoor (20mm thick.)"],
    },
  },
  "talco": {
    en: {
      effect: "Material white effect",
      tagline: "The purity of absolute white",
      description: "Bright, candid surfaces for coverings that enhance natural light.",
      longDescription: "Talco is a monochromatic collection selected by Kalēa® for projects where aesthetic purity is the primary value. A delicate and minimalist surface that plays with natural light to create clean, ethereal and deeply contemporary environments.",
      applications: ["Bathrooms", "SPA", "Retail", "Showroom"],
    },
  },
  "les-bois": {
    en: {
      effect: "Wood effect",
      tagline: "The elegance of wood in porcelain stoneware",
      description: "The charm of natural wood translated into stoneware with surprising fidelity.",
      longDescription: "Les Bois is the collection that combines the warmth of wood with the resistance of porcelain stoneware. Four precious essences — Slavonia, Bocote, Mogano, Cobolo — selected by Kalēa® for residential and commercial projects requiring aesthetic authenticity and high performance.",
      applications: ["Residential", "Hospitality", "Retail"],
    },
  },
  "evolution": {
    en: {
      effect: "Contemporary stone effect",
      tagline: "The evolution of contemporary stone",
      description: "A modern vision of natural stone in minimalist and sophisticated surfaces.",
      longDescription: "Evolution is the collection that reinterprets stone in a contemporary key through three neutral shades — Evo Noir, Evo Gris Foncé, Evo Greyge. Selected by Kalēa® for high-profile architectures, it dialogues with minimal lines and rigorous compositions.",
      applications: ["Contemporary architecture", "Contract", "Retail"],
    },
  },
  "woodside": {
    en: {
      effect: "Natural wood effect",
      tagline: "The most authentic side of wood",
      description: "An interpretation of wood that enhances its natural imperfections and authentic character.",
      longDescription: "Woodside is the collection that celebrates wood in its most authentic dimension. Two essences — Oak and Nut — in plank format, selected by Kalēa® for high-end residential and commercial floors seeking warmth, naturalness and personality.",
      applications: ["Residential", "Hospitality", "Retail"],
    },
  },
  "ske-2-0": {
    en: {
      effect: "Outdoor 20 mm · Concrete, stone, chalk effect",
      tagline: "Aesthetic continuity between indoor and outdoor",
      description: "Porcelain stoneware 20mm thick to ensure high standards in outdoor spaces.",
      longDescription: "Ske 2.0 brings together all 20 mm porcelain stoneware outdoor surfaces selected by Kalēa®, available in finishes coordinated with the indoor collections to ensure perfect visual continuity between inside and outside. Eleven variants to meet every design need: from contemporary minimalism of concrete to the sensoriality of chalk.",
      applications: ["Terraces", "Pool edges", "Gardens", "Walkways", "Raised installation"],
    },
  },
  "block": {
    en: {
      effect: "Outdoor 20 mm · Maximum resistance",
      tagline: "Maximum resistance for every challenge",
      description: "20mm porcelain stoneware with extremely high mechanical resistance, to support heavy loads and intense traffic.",
      longDescription: "Block is the outdoor collection selected by Kalēa® for projects requiring extreme performance. Six variants — from Antique stones (Namur, Gent, Bruges) to Cotto, Porfido and Flamed textures — designed for drivable paving, commercial areas and high-traffic public spaces, without compromising on aesthetic quality.",
      applications: ["Driveways", "Commercial areas", "Industrial areas", "Public spaces"],
    },
  },
};

export function localizeCollection(
  collection: CeramicaCollection,
  language: Language
): CeramicaCollection {
  if (language === "it") return collection;
  const tx = dict[collection.slug]?.[language];
  if (!tx) return collection; // fallback to IT for DE/FR or missing
  return {
    ...collection,
    effect: tx.effect,
    tagline: tx.tagline,
    description: tx.description,
    longDescription: tx.longDescription,
    applications: tx.applications,
  };
}

export function getLocalizedCollectionBySlug(
  slug: string,
  language: Language
): CeramicaCollection | undefined {
  const c = getCollectionBySlug(slug);
  return c ? localizeCollection(c, language) : undefined;
}

export function getLocalizedCollectionsByCategory(
  category: "interni" | "esterni",
  language: Language
): CeramicaCollection[] {
  return getCollectionsByCategory(category).map((c) => localizeCollection(c, language));
}
