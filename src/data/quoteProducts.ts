// Catalogo prodotti Kalea per preventivi

export interface CatalogProduct {
  code: string;
  name: string;
  description: string;
  category: 'article' | 'accessory' | 'service';
  defaultPrice: number;
  defaultUnit: string;
  hasColor: boolean;
}

export const PRODUCT_CATALOG: CatalogProduct[] = [
  // --- ARTICOLI (Pavimenti / Rivestimenti) ---
  { code: 'BM-PAV', name: 'BioMag Floor', description: 'Pavimento magnetico minerale', category: 'article', defaultPrice: 48.00, defaultUnit: 'Metro quadro', hasColor: true },
  { code: 'BC-PAV', name: 'BioCore Floor', description: 'Pavimento flottante organico', category: 'article', defaultPrice: 55.00, defaultUnit: 'Metro quadro', hasColor: true },
  { code: 'BW-PAR', name: 'BioWall', description: 'Rivestimento parete minerale', category: 'article', defaultPrice: 42.00, defaultUnit: 'Metro quadro', hasColor: true },
  { code: 'KC-CEIL', name: 'KaleaCeiling', description: 'Pannello soffitto minerale', category: 'article', defaultPrice: 50.00, defaultUnit: 'Metro quadro', hasColor: true },
  { code: 'KD-DECK', name: 'KaleaDeck', description: 'Pavimento outdoor composito', category: 'article', defaultPrice: 65.00, defaultUnit: 'Metro quadro', hasColor: true },
  { code: 'OW-PAR', name: 'OneWall', description: 'Pannello parete grande formato', category: 'article', defaultPrice: 58.00, defaultUnit: 'Metro quadro', hasColor: true },

  // --- ACCESSORI ---
  { code: 'EL-BATT', name: 'EdgeLine Battiscopa', description: 'Battiscopa coordinato', category: 'accessory', defaultPrice: 12.00, defaultUnit: 'Metro lineare', hasColor: true },
  { code: 'EL-GIUN', name: 'EdgeLine Giunto', description: 'Giunto di dilatazione', category: 'accessory', defaultPrice: 8.50, defaultUnit: 'Metro lineare', hasColor: true },
  { code: 'EL-PROF', name: 'EdgeLine Profilo Terminale', description: 'Profilo terminale', category: 'accessory', defaultPrice: 10.00, defaultUnit: 'Metro lineare', hasColor: true },
  { code: 'EL-ESP', name: 'EdgeLine Profilo Espansione', description: 'Profilo di espansione', category: 'accessory', defaultPrice: 9.50, defaultUnit: 'Metro lineare', hasColor: true },
  { code: 'KB-SIL', name: 'KaleaBase Silence Cork', description: 'Sottopavimento in sughero fonoassorbente', category: 'accessory', defaultPrice: 6.00, defaultUnit: 'Metro quadro', hasColor: false },
  { code: 'KB-HYD', name: 'KaleaBase Hydro Vapor', description: 'Barriera al vapore', category: 'accessory', defaultPrice: 4.50, defaultUnit: 'Metro quadro', hasColor: false },
  { code: 'KB-PRO', name: 'KaleaBase Pro Rubber', description: 'Sottopavimento in gomma professionale', category: 'accessory', defaultPrice: 7.00, defaultUnit: 'Metro quadro', hasColor: false },
  { code: 'KB-THR', name: 'KaleaBase Therm XPO', description: 'Sottopavimento termico XPS', category: 'accessory', defaultPrice: 8.00, defaultUnit: 'Metro quadro', hasColor: false },
  { code: 'KB-OUT', name: 'KaleaBase Outdoor', description: 'Sottostruttura outdoor', category: 'accessory', defaultPrice: 9.00, defaultUnit: 'Metro quadro', hasColor: false },
  { code: 'COLLA-MGO', name: 'Colla MGO specifica', description: 'Adesivo specifico per pannelli MGO', category: 'accessory', defaultPrice: 25.00, defaultUnit: 'Sacco', hasColor: false },
  { code: 'KIT-POSA', name: 'Kit posa pavimento', description: 'Kit completo per posa flottante', category: 'accessory', defaultPrice: 35.00, defaultUnit: 'Pezzo', hasColor: false },
  { code: 'DIST-PAV', name: 'Distanziatori pavimento', description: 'Set distanziatori per posa', category: 'accessory', defaultPrice: 5.00, defaultUnit: 'Confezione', hasColor: false },

  // --- SERVIZI ---
  { code: 'SRV-POSA', name: 'Posa in opera pavimento', description: 'Installazione pavimento', category: 'service', defaultPrice: 18.00, defaultUnit: 'Metro quadro', hasColor: false },
  { code: 'SRV-POSA-PAR', name: 'Posa in opera parete', description: 'Installazione rivestimento parete', category: 'service', defaultPrice: 22.00, defaultUnit: 'Metro quadro', hasColor: false },
  { code: 'SRV-POSA-CEIL', name: 'Posa in opera soffitto', description: 'Installazione pannelli soffitto', category: 'service', defaultPrice: 25.00, defaultUnit: 'Metro quadro', hasColor: false },
  { code: 'SRV-POSA-DECK', name: 'Posa in opera outdoor', description: 'Installazione pavimento esterno', category: 'service', defaultPrice: 20.00, defaultUnit: 'Metro quadro', hasColor: false },
  { code: 'SRV-TRASP', name: 'Trasporto e consegna', description: 'Trasporto al cantiere', category: 'service', defaultPrice: 150.00, defaultUnit: 'Pezzo', hasColor: false },
  { code: 'SRV-SOPR', name: 'Sopralluogo tecnico', description: 'Sopralluogo e rilievo misure', category: 'service', defaultPrice: 100.00, defaultUnit: 'Pezzo', hasColor: false },
  { code: 'SRV-PROG', name: 'Progettazione layout posa', description: 'Progetto di posa personalizzato', category: 'service', defaultPrice: 200.00, defaultUnit: 'Pezzo', hasColor: false },
  { code: 'SRV-RIMOZIONE', name: 'Rimozione pavimento esistente', description: 'Demolizione e smaltimento', category: 'service', defaultPrice: 10.00, defaultUnit: 'Metro quadro', hasColor: false },
  { code: 'SRV-PREP', name: 'Preparazione sottofondo', description: 'Livellamento e preparazione', category: 'service', defaultPrice: 8.00, defaultUnit: 'Metro quadro', hasColor: false },
];
