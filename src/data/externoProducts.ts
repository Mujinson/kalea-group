// Externo product data - Traditional and Skudo lines

// Traditional
import tradDarkGreyLevigato from "@/assets/externo/trad-dark-grey-levigato.jpg";
import tradDarkGreyZigrinato from "@/assets/externo/trad-dark-grey-zigrinato.jpg";
import tradLightBrownLevigato from "@/assets/externo/trad-light-brown-levigato.jpg";
import tradLightBrownZigrinato from "@/assets/externo/trad-light-brown-zigrinato.jpg";
// Skudo
import skudoGoldenLevigato from "@/assets/externo/skudo-golden-levigato.jpg";
import skudoGoldenSpazzolato from "@/assets/externo/skudo-golden-spazzolato.jpg";
import skudoSandLevigato from "@/assets/externo/skudo-sand-levigato.jpg";
import skudoSandSpazzolato from "@/assets/externo/skudo-sand-spazzolato.jpg";
import skudoAntiqueLevigato from "@/assets/externo/skudo-antique-levigato.jpg";
import skudoAntiqueSpazzolato from "@/assets/externo/skudo-antique-spazzolato.jpg";
import skudoTeakLevigato from "@/assets/externo/skudo-teak-levigato.jpg";
import skudoTeakSpazzolato from "@/assets/externo/skudo-teak-spazzolato.jpg";

export interface ExternoProduct {
  id: string;
  name: string;
  image: string;
  subcategory: "traditional" | "skudo";
  finish: string;
}

export interface ExternoCollection {
  id: string;
  title: string;
  subtitle: string;
  products: ExternoProduct[];
}

export const externoTraditional: ExternoCollection = {
  id: "traditional",
  title: "Externo Traditional",
  subtitle: "Composito WPC ad alta resistenza",
  products: [
    { id: "trad-dark-grey-levigato", name: "Dark Grey Levigato", image: tradDarkGreyLevigato, subcategory: "traditional", finish: "Levigato" },
    { id: "trad-dark-grey-zigrinato", name: "Dark Grey Zigrinato", image: tradDarkGreyZigrinato, subcategory: "traditional", finish: "Zigrinato" },
    { id: "trad-light-brown-levigato", name: "Light Brown Levigato", image: tradLightBrownLevigato, subcategory: "traditional", finish: "Levigato" },
    { id: "trad-light-brown-zigrinato", name: "Light Brown Zigrinato", image: tradLightBrownZigrinato, subcategory: "traditional", finish: "Zigrinato" },
  ],
};

export const externoSkudo: ExternoCollection = {
  id: "skudo",
  title: "Externo Skudo",
  subtitle: "Schermatura coestrusa con protezione UV avanzata",
  products: [
    { id: "skudo-golden-levigato", name: "Golden Levigato", image: skudoGoldenLevigato, subcategory: "skudo", finish: "Levigato" },
    { id: "skudo-golden-spazzolato", name: "Golden Spazzolato", image: skudoGoldenSpazzolato, subcategory: "skudo", finish: "Spazzolato" },
    { id: "skudo-sand-levigato", name: "Sand Levigato", image: skudoSandLevigato, subcategory: "skudo", finish: "Levigato" },
    { id: "skudo-sand-spazzolato", name: "Sand Spazzolato", image: skudoSandSpazzolato, subcategory: "skudo", finish: "Spazzolato" },
    { id: "skudo-antique-levigato", name: "Antique Levigato", image: skudoAntiqueLevigato, subcategory: "skudo", finish: "Levigato" },
    { id: "skudo-antique-spazzolato", name: "Antique Spazzolato", image: skudoAntiqueSpazzolato, subcategory: "skudo", finish: "Spazzolato" },
    { id: "skudo-teak-levigato", name: "Teak Levigato", image: skudoTeakLevigato, subcategory: "skudo", finish: "Levigato" },
    { id: "skudo-teak-spazzolato", name: "Teak Spazzolato", image: skudoTeakSpazzolato, subcategory: "skudo", finish: "Spazzolato" },
  ],
};

// All Externo products combined
export const allExternoProducts = [
  ...externoTraditional.products,
  ...externoSkudo.products,
];
