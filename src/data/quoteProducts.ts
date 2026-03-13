// Catalogo prodotti Kalea per preventivi

export interface CatalogProduct {
  code: string;
  name: string;
  category: 'article' | 'accessory' | 'service';
  defaultPrice: number;
  defaultUnit: string;
  hasColor: boolean;
}

export const PRODUCT_CATALOG: CatalogProduct[] = [
  // --- ARTICOLI (Pavimenti) ---
  { code: 'SC10-PAV', name: 'StoneCore 10 - Pavimento', category: 'article', defaultPrice: 45.00, defaultUnit: 'Metro quadro', hasColor: true },
  { code: 'SC10-PAV-PLUS', name: 'StoneCore 10 Plus - Pavimento', category: 'article', defaultPrice: 52.00, defaultUnit: 'Metro quadro', hasColor: true },
  { code: 'BC-PAV', name: 'BioCore Floor - Pavimento', category: 'article', defaultPrice: 55.00, defaultUnit: 'Metro quadro', hasColor: true },
  { code: 'BM-PAV', name: 'BioMag Floor - Pavimento', category: 'article', defaultPrice: 48.00, defaultUnit: 'Metro quadro', hasColor: true },
  { code: 'BW-PAR', name: 'BioWall - Parete', category: 'article', defaultPrice: 42.00, defaultUnit: 'Metro quadro', hasColor: true },
  { code: 'KC-CEIL', name: 'KaleaCeiling - Soffitto', category: 'article', defaultPrice: 50.00, defaultUnit: 'Metro quadro', hasColor: true },
  { code: 'KD-DECK', name: 'KaleaDeck - Outdoor', category: 'article', defaultPrice: 65.00, defaultUnit: 'Metro quadro', hasColor: true },
  { code: 'OW-PAR', name: 'OneWall - Pannello parete', category: 'article', defaultPrice: 58.00, defaultUnit: 'Metro quadro', hasColor: true },

  // --- ACCESSORI ---
  { code: 'EL-BATT', name: 'EdgeLine Battiscopa', category: 'accessory', defaultPrice: 12.00, defaultUnit: 'Metro lineare', hasColor: true },
  { code: 'EL-GIUN', name: 'EdgeLine Giunto', category: 'accessory', defaultPrice: 8.50, defaultUnit: 'Metro lineare', hasColor: true },
  { code: 'EL-PROF', name: 'EdgeLine Profilo Terminale', category: 'accessory', defaultPrice: 10.00, defaultUnit: 'Metro lineare', hasColor: true },
  { code: 'EL-ESP', name: 'EdgeLine Profilo Espansione', category: 'accessory', defaultPrice: 9.50, defaultUnit: 'Metro lineare', hasColor: true },
  { code: 'KB-SIL', name: 'KaleaBase Silence Cork', category: 'accessory', defaultPrice: 6.00, defaultUnit: 'Metro quadro', hasColor: false },
  { code: 'KB-HYD', name: 'KaleaBase Hydro Vapor', category: 'accessory', defaultPrice: 4.50, defaultUnit: 'Metro quadro', hasColor: false },
  { code: 'KB-PRO', name: 'KaleaBase Pro Rubber', category: 'accessory', defaultPrice: 7.00, defaultUnit: 'Metro quadro', hasColor: false },
  { code: 'KB-THR', name: 'KaleaBase Therm XPO', category: 'accessory', defaultPrice: 8.00, defaultUnit: 'Metro quadro', hasColor: false },
  { code: 'KB-OUT', name: 'KaleaBase Outdoor', category: 'accessory', defaultPrice: 9.00, defaultUnit: 'Metro quadro', hasColor: false },
  { code: 'COLLA-MGO', name: 'Colla MGO specifica', category: 'accessory', defaultPrice: 25.00, defaultUnit: 'Sacco', hasColor: false },
  { code: 'KIT-POSA', name: 'Kit posa pavimento', category: 'accessory', defaultPrice: 35.00, defaultUnit: 'Pezzo', hasColor: false },
  { code: 'DIST-PAV', name: 'Distanziatori pavimento', category: 'accessory', defaultPrice: 5.00, defaultUnit: 'Confezione', hasColor: false },

  // --- SERVIZI ---
  { code: 'SRV-POSA', name: 'Posa in opera pavimento', category: 'service', defaultPrice: 18.00, defaultUnit: 'Metro quadro', hasColor: false },
  { code: 'SRV-POSA-PAR', name: 'Posa in opera parete', category: 'service', defaultPrice: 22.00, defaultUnit: 'Metro quadro', hasColor: false },
  { code: 'SRV-POSA-CEIL', name: 'Posa in opera soffitto', category: 'service', defaultPrice: 25.00, defaultUnit: 'Metro quadro', hasColor: false },
  { code: 'SRV-POSA-DECK', name: 'Posa in opera outdoor', category: 'service', defaultPrice: 20.00, defaultUnit: 'Metro quadro', hasColor: false },
  { code: 'SRV-TRASP', name: 'Trasporto e consegna', category: 'service', defaultPrice: 150.00, defaultUnit: 'Pezzo', hasColor: false },
  { code: 'SRV-SOPR', name: 'Sopralluogo tecnico', category: 'service', defaultPrice: 100.00, defaultUnit: 'Pezzo', hasColor: false },
  { code: 'SRV-PROG', name: 'Progettazione layout posa', category: 'service', defaultPrice: 200.00, defaultUnit: 'Pezzo', hasColor: false },
  { code: 'SRV-RIMOZIONE', name: 'Rimozione pavimento esistente', category: 'service', defaultPrice: 10.00, defaultUnit: 'Metro quadro', hasColor: false },
  { code: 'SRV-PREP', name: 'Preparazione sottofondo', category: 'service', defaultPrice: 8.00, defaultUnit: 'Metro quadro', hasColor: false },
];
