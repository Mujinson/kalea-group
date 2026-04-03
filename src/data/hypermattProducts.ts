// Hypermatt product data organized by 3 sub-collections: XL, Spina, 55

export interface HypermattProduct {
  id: string;
  name: string;
  image: string; // plank/swatch image URL
  subcategory?: string; // e.g. "wood", "tile", "italiana", "francese", "cement"
}

export interface HypermattCollection {
  id: string;
  title: string;
  subtitle: string;
  products: HypermattProduct[];
}

// === HYPERMATT XL ===
const xlWood: HypermattProduct[] = [
  { id: "xl-cordillera", name: "Cordillera", image: "https://www.pavimentoflow.it/wp-content/uploads/2025/09/flow_xl_wood_cordillera_228x1800-1.jpg", subcategory: "wood" },
  { id: "xl-rocky", name: "Rocky", image: "https://www.pavimentoflow.it/wp-content/uploads/2025/09/flow_xl_wood_rocky_228x1800-1.jpg", subcategory: "wood" },
  { id: "xl-ararat", name: "Ararat", image: "https://www.pavimentoflow.it/wp-content/uploads/2025/09/flow_xl_wood_ararat_228x1800-1.jpg", subcategory: "wood" },
  { id: "xl-whitney", name: "Whitney", image: "https://www.pavimentoflow.it/wp-content/uploads/2025/09/flow_xl_wood_whitney_228x1800-1.jpg", subcategory: "wood" },
  { id: "xl-meru", name: "Meru", image: "https://www.pavimentoflow.it/wp-content/uploads/2025/09/flow_xl_wood_meru_228x1800-1.jpg", subcategory: "wood" },
  { id: "xl-logan", name: "Logan", image: "https://www.pavimentoflow.it/wp-content/uploads/2025/09/flow_xl_wood_logan_228x1800-1.jpg", subcategory: "wood" },
  { id: "xl-caucaso", name: "Caucaso", image: "https://www.pavimentoflow.it/wp-content/uploads/2025/09/flow_xl_wood_caucaso_228x1800-1.jpg", subcategory: "wood" },
];

const xlTile: HypermattProduct[] = [
  { id: "xl-ambrym", name: "Ambrym", image: "https://www.pavimentoflow.it/wp-content/uploads/2025/09/flow_xl_tile_ambrym_600x1200-1.jpg", subcategory: "tile" },
  { id: "xl-aso", name: "Aso", image: "https://www.pavimentoflow.it/wp-content/uploads/2025/09/flow_xl_tile_aso_600x1200-1.jpg", subcategory: "tile" },
  { id: "xl-vesuvio", name: "Vesuvio", image: "https://www.pavimentoflow.it/wp-content/uploads/2025/09/flow_xl_tile_vesuvio_600x1200-1.jpg", subcategory: "tile" },
  { id: "xl-nabro", name: "Nabro", image: "https://www.pavimentoflow.it/wp-content/uploads/2025/09/flow_xl_tile_nabro_600x1200-1.jpg", subcategory: "tile" },
  { id: "xl-kibo", name: "Kibo", image: "https://www.pavimentoflow.it/wp-content/uploads/2025/09/flow_xl_tile_kibo_600x1200-1.jpg", subcategory: "tile" },
];

// === HYPERMATT SPINA ===
const spinaItaliana: HypermattProduct[] = [
  { id: "spina-karu", name: "Karu", image: "https://www.pavimentoflow.it/wp-content/uploads/2025/09/flow_spina_italiana_karu_01.jpg", subcategory: "italiana" },
  { id: "spina-zagros", name: "Zagros", image: "https://www.pavimentoflow.it/wp-content/uploads/2025/09/flow_spina_italiana_zagros_01.jpg", subcategory: "italiana" },
  { id: "spina-ural", name: "Ural", image: "https://www.pavimentoflow.it/wp-content/uploads/2025/09/flow_spina_italiana_ural_01.jpg", subcategory: "italiana" },
];

const spinaFrancese: HypermattProduct[] = [
  { id: "spina-taurus", name: "Taurus", image: "https://www.pavimentoflow.it/wp-content/uploads/2025/09/flow_spina_francese_taurus_01.jpg", subcategory: "francese" },
  { id: "spina-jura", name: "Jura", image: "https://www.pavimentoflow.it/wp-content/uploads/2025/09/flow_spina_francese_jura_01.jpg", subcategory: "francese" },
];

// === HYPERMATT 55 ===
const h55Wood: HypermattProduct[] = [
  { id: "55-annapurna", name: "Annapurna", image: "https://www.pavimentoflow.it/wp-content/uploads/2023/08/annapurna_1-3.jpg", subcategory: "wood" },
  { id: "55-nanga-parbat", name: "Nanga Parbat", image: "https://www.pavimentoflow.it/wp-content/uploads/2023/08/nanga_parbat_1-3.jpg", subcategory: "wood" },
  { id: "55-himalaya", name: "Himalaya", image: "https://www.pavimentoflow.it/wp-content/uploads/2023/08/himalaya_1-3.jpg", subcategory: "wood" },
  { id: "55-kilimangiaro", name: "Kilimangiaro", image: "https://www.pavimentoflow.it/wp-content/uploads/2023/08/kilimangiaro_1-3.jpg", subcategory: "wood" },
  { id: "55-cerro-torre", name: "Cerro Torre", image: "https://www.pavimentoflow.it/wp-content/uploads/2023/08/cerro_torre_1-3.jpg", subcategory: "wood" },
  { id: "55-atlante", name: "Atlante", image: "https://www.pavimentoflow.it/wp-content/uploads/2023/08/atlante_1-3.jpg", subcategory: "wood" },
  { id: "55-dolomiti", name: "Dolomiti", image: "https://www.pavimentoflow.it/wp-content/uploads/2023/08/dolomiti_1-3.jpg", subcategory: "wood" },
  { id: "55-monte-bianco", name: "Monte Bianco", image: "https://www.pavimentoflow.it/wp-content/uploads/2023/08/monte_bianco_1-3.jpg", subcategory: "wood" },
  { id: "55-k2", name: "K2", image: "https://www.pavimentoflow.it/wp-content/uploads/2023/08/k2_1-3.jpg", subcategory: "wood" },
  { id: "55-everest", name: "Everest", image: "https://www.pavimentoflow.it/wp-content/uploads/2023/08/everest_1-3.jpg", subcategory: "wood" },
];

const h55Cement: HypermattProduct[] = [
  { id: "55-teide", name: "Teide", image: "https://www.pavimentoflow.it/wp-content/uploads/2023/08/teide_1-3.jpg", subcategory: "cement" },
  { id: "55-fuji", name: "Fuji", image: "https://www.pavimentoflow.it/wp-content/uploads/2023/08/fuji_1-3.jpg", subcategory: "cement" },
  { id: "55-asama", name: "Asama", image: "https://www.pavimentoflow.it/wp-content/uploads/2023/08/asama_1-3.jpg", subcategory: "cement" },
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
