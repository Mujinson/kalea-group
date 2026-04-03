// Hypermatt product data organized by 3 sub-collections: XL, Spina, 55

// Local image imports - XL Wood
import xlCordillera from "@/assets/hypermatt/xl-cordillera.jpg";
import xlRocky from "@/assets/hypermatt/xl-rocky.jpg";
import xlArarat from "@/assets/hypermatt/xl-ararat.jpg";
import xlWhitney from "@/assets/hypermatt/xl-whitney.jpg";
import xlMeru from "@/assets/hypermatt/xl-meru.jpg";
import xlLogan from "@/assets/hypermatt/xl-logan.jpg";
import xlCaucaso from "@/assets/hypermatt/xl-caucaso.jpg";
// XL Tile
import xlAmbrym from "@/assets/hypermatt/xl-ambrym.jpg";
import xlAso from "@/assets/hypermatt/xl-aso.jpg";
import xlVesuvio from "@/assets/hypermatt/xl-vesuvio.jpg";
import xlNabro from "@/assets/hypermatt/xl-nabro.jpg";
import xlKibo from "@/assets/hypermatt/xl-kibo.jpg";
// Spina
import spinaKaru from "@/assets/hypermatt/spina-karu.jpg";
import spinaZagros from "@/assets/hypermatt/spina-zagros.jpg";
import spinaUral from "@/assets/hypermatt/spina-ural.jpg";
import spinaTaurus from "@/assets/hypermatt/spina-taurus.jpg";
import spinaJura from "@/assets/hypermatt/spina-jura.jpg";
// 55 Wood
import h55Annapurna from "@/assets/hypermatt/55-annapurna.jpg";
import h55NangaParbat from "@/assets/hypermatt/55-nanga-parbat.jpg";
import h55Himalaya from "@/assets/hypermatt/55-himalaya.jpg";
import h55Kilimangiaro from "@/assets/hypermatt/55-kilimangiaro.jpg";
import h55CerroTorre from "@/assets/hypermatt/55-cerro-torre.jpg";
import h55Atlante from "@/assets/hypermatt/55-atlante.jpg";
import h55Dolomiti from "@/assets/hypermatt/55-dolomiti.jpg";
import h55MonteBianco from "@/assets/hypermatt/55-monte-bianco.jpg";
import h55K2 from "@/assets/hypermatt/55-k2.jpg";
import h55Everest from "@/assets/hypermatt/55-everest.jpg";
// 55 Cement
import h55Teide from "@/assets/hypermatt/55-teide.jpg";
import h55Fuji from "@/assets/hypermatt/55-fuji.jpg";
import h55Asama from "@/assets/hypermatt/55-asama.jpg";

export interface HypermattProduct {
  id: string;
  name: string;
  image: string;
  subcategory?: string;
}

export interface HypermattCollection {
  id: string;
  title: string;
  subtitle: string;
  products: HypermattProduct[];
}

// === HYPERMATT XL ===
export const xlWood: HypermattProduct[] = [
  { id: "xl-cordillera", name: "Cordillera", image: xlCordillera, subcategory: "wood" },
  { id: "xl-rocky", name: "Rocky", image: xlRocky, subcategory: "wood" },
  { id: "xl-ararat", name: "Ararat", image: xlArarat, subcategory: "wood" },
  { id: "xl-whitney", name: "Whitney", image: xlWhitney, subcategory: "wood" },
  { id: "xl-meru", name: "Meru", image: xlMeru, subcategory: "wood" },
  { id: "xl-logan", name: "Logan", image: xlLogan, subcategory: "wood" },
  { id: "xl-caucaso", name: "Caucaso", image: xlCaucaso, subcategory: "wood" },
];

export const xlTile: HypermattProduct[] = [
  { id: "xl-ambrym", name: "Ambrym", image: xlAmbrym, subcategory: "tile" },
  { id: "xl-aso", name: "Aso", image: xlAso, subcategory: "tile" },
  { id: "xl-vesuvio", name: "Vesuvio", image: xlVesuvio, subcategory: "tile" },
  { id: "xl-nabro", name: "Nabro", image: xlNabro, subcategory: "tile" },
  { id: "xl-kibo", name: "Kibo", image: xlKibo, subcategory: "tile" },
];

// === HYPERMATT SPINA ===
export const spinaItaliana: HypermattProduct[] = [
  { id: "spina-karu", name: "Karu", image: spinaKaru, subcategory: "italiana" },
  { id: "spina-zagros", name: "Zagros", image: spinaZagros, subcategory: "italiana" },
  { id: "spina-ural", name: "Ural", image: spinaUral, subcategory: "italiana" },
];

export const spinaFrancese: HypermattProduct[] = [
  { id: "spina-taurus", name: "Taurus", image: spinaTaurus, subcategory: "francese" },
  { id: "spina-jura", name: "Jura", image: spinaJura, subcategory: "francese" },
];

// === HYPERMATT 55 ===
export const h55Wood: HypermattProduct[] = [
  { id: "55-annapurna", name: "Annapurna", image: h55Annapurna, subcategory: "wood" },
  { id: "55-nanga-parbat", name: "Nanga Parbat", image: h55NangaParbat, subcategory: "wood" },
  { id: "55-himalaya", name: "Himalaya", image: h55Himalaya, subcategory: "wood" },
  { id: "55-kilimangiaro", name: "Kilimangiaro", image: h55Kilimangiaro, subcategory: "wood" },
  { id: "55-cerro-torre", name: "Cerro Torre", image: h55CerroTorre, subcategory: "wood" },
  { id: "55-atlante", name: "Atlante", image: h55Atlante, subcategory: "wood" },
  { id: "55-dolomiti", name: "Dolomiti", image: h55Dolomiti, subcategory: "wood" },
  { id: "55-monte-bianco", name: "Monte Bianco", image: h55MonteBianco, subcategory: "wood" },
  { id: "55-k2", name: "K2", image: h55K2, subcategory: "wood" },
  { id: "55-everest", name: "Everest", image: h55Everest, subcategory: "wood" },
];

export const h55Cement: HypermattProduct[] = [
  { id: "55-teide", name: "Teide", image: h55Teide, subcategory: "cement" },
  { id: "55-fuji", name: "Fuji", image: h55Fuji, subcategory: "cement" },
  { id: "55-asama", name: "Asama", image: h55Asama, subcategory: "cement" },
];

// Collections
export const hypermattXL: HypermattCollection = {
  id: "xl",
  title: "Hypermatt XL",
  subtitle: "Formato grande, impatto straordinario",
  products: [...xlWood, ...xlTile],
};

export const hypermattSpina: HypermattCollection = {
  id: "spina",
  title: "Hypermatt Spina",
  subtitle: "Geometrie classiche, finitura contemporanea",
  products: [...spinaItaliana, ...spinaFrancese],
};

export const hypermatt55: HypermattCollection = {
  id: "55",
  title: "Hypermatt 55",
  subtitle: "Il formato versatile per ogni ambiente",
  products: [...h55Wood, ...h55Cement],
};

// All collections
export const hypermattCollections: HypermattCollection[] = [
  hypermattXL,
  hypermattSpina,
  hypermatt55,
];

// All products flat
export const allHypermattProducts: HypermattProduct[] = [
  ...hypermattXL.products,
  ...hypermattSpina.products,
  ...hypermatt55.products,
];
