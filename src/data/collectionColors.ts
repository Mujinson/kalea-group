// Color palettes per collection slug. Used by CollectionColorsSection to render
// circle swatches via ColorCircleGallery. Hex values are realistic approximations
// of the manufacturer's color cards; can be swapped with real photos later.

export interface SwatchColor {
  name: string;
  hex: string;
}

export const collectionColors: Record<string, SwatchColor[]> = {
  // ============ SPC SELECTION ============
  "star-k": [
    { name: "Rovere Naturale", hex: "#c9a577" },
    { name: "Rovere Miele", hex: "#b6864c" },
    { name: "Rovere Sbiancato", hex: "#e3d4bc" },
    { name: "Rovere Fumé", hex: "#7a5a40" },
    { name: "Rovere Cenere", hex: "#a59786" },
    { name: "Rovere Tabacco", hex: "#8b5a36" },
  ],
  "star-k-r": [
    { name: "Quercia Alba", hex: "#dcc6a4" },
    { name: "Quercia Sabbia", hex: "#c9a87b" },
    { name: "Quercia Terra", hex: "#9c7a4f" },
    { name: "Quercia Smoke", hex: "#6b5440" },
    { name: "Quercia Carbon", hex: "#3e342a" },
    { name: "Quercia Avorio", hex: "#e6d8bf" },
  ],
  "star-k-c": [
    { name: "Sughero Natural", hex: "#b88e5c" },
    { name: "Sughero Caramel", hex: "#a07347" },
    { name: "Sughero Espresso", hex: "#5d3c24" },
    { name: "Sughero Sand", hex: "#cba373" },
  ],
  "star-k-s": [
    { name: "Pietra Bianca", hex: "#d9d3c8" },
    { name: "Pietra Sabbia", hex: "#bca987" },
    { name: "Pietra Grigia", hex: "#7d7873" },
    { name: "Pietra Antracite", hex: "#3a3936" },
    { name: "Pietra Cemento", hex: "#9a9590" },
  ],
  "star-k-d": [
    { name: "Marmo Calacatta", hex: "#e8e3da" },
    { name: "Marmo Statuario", hex: "#dcd6cb" },
    { name: "Marmo Pietra Serena", hex: "#9da19a" },
    { name: "Marmo Nero", hex: "#2a2826" },
  ],
  "star-k-w": [
    { name: "Wide Oak", hex: "#c8a574" },
    { name: "Wide Walnut", hex: "#6a4630" },
    { name: "Wide Smoke", hex: "#7d6651" },
    { name: "Wide Ash", hex: "#b3a797" },
    { name: "Wide Sand", hex: "#d6bf99" },
  ],
  "star-k-w-maxi": [
    { name: "Maxi Bianco", hex: "#e9dec6" },
    { name: "Maxi Naturale", hex: "#c19c70" },
    { name: "Maxi Tabacco", hex: "#8a5d3a" },
    { name: "Maxi Fumé", hex: "#6b5544" },
    { name: "Maxi Antracite", hex: "#3f3b35" },
  ],
  "k-wood": [
    { name: "K-Wood Natural", hex: "#b88b58" },
    { name: "K-Wood Caramel", hex: "#9a6c40" },
    { name: "K-Wood Smoke", hex: "#6d5238" },
    { name: "K-Wood Sand", hex: "#d5b88a" },
    { name: "K-Wood Greige", hex: "#a89886" },
    { name: "K-Wood Carbon", hex: "#3a3128" },
  ],
  "k-wood-spina": [
    { name: "Spina Rovere", hex: "#c1986a" },
    { name: "Spina Noce", hex: "#6e4a30" },
    { name: "Spina Sbiancato", hex: "#e1d2b6" },
    { name: "Spina Fumé", hex: "#5d4836" },
  ],
  connex: [
    { name: "Connex Ice", hex: "#e7e1d4" },
    { name: "Connex Sand", hex: "#c8b18b" },
    { name: "Connex Oak", hex: "#a4814f" },
    { name: "Connex Walnut", hex: "#6a4730" },
    { name: "Connex Slate", hex: "#5a5751" },
    { name: "Connex Coal", hex: "#2d2a26" },
  ],

  // ============ LAMINATI TECNICI ============
  "k-uno": [
    { name: "Rovere Sciara", hex: "#a07a4b" },
    { name: "Rovere Patmos", hex: "#c7a273" },
    { name: "Rovere Mykonos", hex: "#e2cca7" },
    { name: "Rovere Stromboli", hex: "#5b4330" },
    { name: "Rovere Lipari", hex: "#8a6a48" },
    { name: "Rovere Salina", hex: "#bca085" },
  ],
  "prestige-l": [
    { name: "Quercia Naturale", hex: "#bf9866" },
    { name: "Quercia Miele", hex: "#a6783f" },
    { name: "Quercia Sbiancata", hex: "#e0cfb2" },
    { name: "Quercia Tabacco", hex: "#7d5436" },
    { name: "Quercia Cenere", hex: "#a89c8a" },
    { name: "Quercia Carbone", hex: "#3c3530" },
  ],
  "prestige-gold": [
    { name: "Gold Honey", hex: "#c69654" },
    { name: "Gold Champagne", hex: "#dcc294" },
    { name: "Gold Amber", hex: "#9d6c34" },
    { name: "Gold Bronze", hex: "#7a5530" },
    { name: "Gold Smoke", hex: "#5e4936" },
  ],
  "syncro-parquet": [
    { name: "Syncro Natural", hex: "#b58a5a" },
    { name: "Syncro Caramel", hex: "#8e6238" },
    { name: "Syncro Espresso", hex: "#4f3623" },
    { name: "Syncro Sand", hex: "#cdb088" },
    { name: "Syncro Greige", hex: "#a4978a" },
  ],
  facile: [
    { name: "Facile Bianco", hex: "#e8dec8" },
    { name: "Facile Naturale", hex: "#bf9b6e" },
    { name: "Facile Caramello", hex: "#9b6c40" },
    { name: "Facile Wengé", hex: "#3f2f24" },
  ],
  "vision-technic": [
    { name: "Technic Ice", hex: "#dcd6cb" },
    { name: "Technic Sand", hex: "#c2a981" },
    { name: "Technic Oak", hex: "#9d7a4d" },
    { name: "Technic Walnut", hex: "#6b4a32" },
    { name: "Technic Coal", hex: "#312c26" },
  ],
  "vision-oxid": [
    { name: "Oxid Pearl", hex: "#cdc7be" },
    { name: "Oxid Bronze", hex: "#8a6c4a" },
    { name: "Oxid Copper", hex: "#a06a44" },
    { name: "Oxid Iron", hex: "#5a544c" },
    { name: "Oxid Black", hex: "#2a2724" },
  ],

  // ============ BIOWALL ============
  "raw-oak": [
    { name: "Rovere Crudo", hex: "#b48a5b" },
    { name: "Rovere Tabacco", hex: "#825536" },
    { name: "Rovere Cenere", hex: "#9c8c78" },
    { name: "Rovere Cotto", hex: "#a0613a" },
    { name: "Rovere Fumé", hex: "#5d4734" },
    { name: "Rovere Sbiancato", hex: "#dcc8ad" },
  ],
  timber: [
    { name: "Timber Honey", hex: "#bb8a55" },
    { name: "Timber Caramel", hex: "#a06a40" },
    { name: "Timber Walnut", hex: "#6a4630" },
    { name: "Timber Smoke", hex: "#5b483a" },
    { name: "Timber Sand", hex: "#d4b687" },
  ],
  nux: [
    { name: "Nux Naturale", hex: "#8a5e3c" },
    { name: "Nux Scuro", hex: "#5d3d28" },
    { name: "Nux Miele", hex: "#a37544" },
    { name: "Nux Tortora", hex: "#a59686" },
  ],
  pattern: [
    { name: "Pattern Sand", hex: "#cab193" },
    { name: "Pattern Greige", hex: "#a39685" },
    { name: "Pattern Carbon", hex: "#3a3530" },
    { name: "Pattern Bronze", hex: "#876a45" },
    { name: "Pattern Pearl", hex: "#dcd2c2" },
  ],
  paint: [
    { name: "Paint Bianco", hex: "#ece5d4" },
    { name: "Paint Avorio", hex: "#e0d2b6" },
    { name: "Paint Tortora", hex: "#a89a87" },
    { name: "Paint Salvia", hex: "#8a9b85" },
    { name: "Paint Argilla", hex: "#b0856a" },
    { name: "Paint Carbone", hex: "#3c3833" },
  ],

  // ============ PARQUET (nuove collezioni Skema) ============
  yles: [
    { name: "Yles Naturale", hex: "#bd9362" },
    { name: "Yles Miele", hex: "#a07440" },
    { name: "Yles Sbiancato", hex: "#dccfb6" },
    { name: "Yles Tabacco", hex: "#7a5236" },
    { name: "Yles Fumé", hex: "#5c4838" },
  ],
  palladio: [
    { name: "Palladio Veneziano", hex: "#b88553" },
    { name: "Palladio Sabbia", hex: "#cfa979" },
    { name: "Palladio Antico", hex: "#8a6238" },
    { name: "Palladio Bruno", hex: "#5e3f28" },
  ],
  villa: [
    { name: "Villa Classica", hex: "#a87a4a" },
    { name: "Villa Toscana", hex: "#8d5d33" },
    { name: "Villa Patinato", hex: "#705438" },
    { name: "Villa Bianca", hex: "#e1cfae" },
    { name: "Villa Cenere", hex: "#a09484" },
  ],
  "lumbertech-205": [
    { name: "L205 Sand", hex: "#c4a275" },
    { name: "L205 Oak", hex: "#9a7548" },
    { name: "L205 Smoke", hex: "#6c5238" },
    { name: "L205 Carbon", hex: "#3b342c" },
  ],
  "lumbertech-270": [
    { name: "L270 Pearl", hex: "#dcd1bb" },
    { name: "L270 Honey", hex: "#b48852" },
    { name: "L270 Caramel", hex: "#8c5d34" },
    { name: "L270 Walnut", hex: "#5e3e28" },
    { name: "L270 Greige", hex: "#a0938a" },
  ],
  "lumbertech-s700": [
    { name: "S700 Ice", hex: "#e2d8c2" },
    { name: "S700 Natural", hex: "#bd9263" },
    { name: "S700 Bronze", hex: "#876444" },
    { name: "S700 Espresso", hex: "#4e3624" },
    { name: "S700 Coal", hex: "#2d2823" },
  ],

  // ============ OUTDOOR SELECTION ============
  compact: [
    { name: "Pietra Bianca", hex: "#d6cdbc" },
    { name: "Pietra Beige", hex: "#b6a07e" },
    { name: "Pietra Grigia", hex: "#7c7872" },
    { name: "Pietra Antracite", hex: "#383530" },
  ],
  pacto: [
    { name: "Lipari", hex: "#7a5b40" },
    { name: "Linosa", hex: "#b08358" },
    { name: "Panarea", hex: "#5a4836" },
    { name: "Salina", hex: "#a89784" },
  ],
  real: [
    { name: "Teak Naturale", hex: "#a87648" },
    { name: "Teak Ossidato", hex: "#7d6e5c" },
    { name: "Ipe Lapacho", hex: "#5e3a24" },
  ],

  // ============ FONOASSORBENTI ============
  "decor-akustika": [
    { name: "Neve", hex: "#ece5d4" },
    { name: "Noce Aurora", hex: "#9a6c40" },
    { name: "Noce Dogale", hex: "#6a4630" },
    { name: "Rovere Ambrato", hex: "#b6864c" },
    { name: "Tortora", hex: "#a89a87" },
    { name: "Carbone", hex: "#3a3530" },
  ],
  mikro: [
    { name: "Bianco Microforato", hex: "#ece5d4" },
    { name: "Grigio Microforato", hex: "#8b8780" },
    { name: "Rovere Microforato", hex: "#b88a5b" },
    { name: "Antracite Microforato", hex: "#363330" },
  ],

  // ============ SOPRAELEVATI ============
  access: [
    { name: "HPL Bianco", hex: "#e5dccb" },
    { name: "HPL Tortora", hex: "#a89986" },
    { name: "HPL Rovere", hex: "#b88a5b" },
    { name: "HPL Antracite", hex: "#3a3631" },
    { name: "Vinilico Sand", hex: "#c8b08a" },
  ],
  tech: [
    { name: "Gres Bianco", hex: "#dcd3c2" },
    { name: "Gres Beige", hex: "#b9a380" },
    { name: "Gres Pietra", hex: "#7c7972" },
    { name: "Gres Antracite", hex: "#383532" },
    { name: "Gres Rovere", hex: "#a07744" },
    { name: "Gres Cotto", hex: "#9d6240" },
  ],
};

export const getCollectionColors = (slug: string): SwatchColor[] =>
  collectionColors[slug] ?? [];
