// Listino Flow 2025 — fonte: LISTINO_FLOW_2025 (Woodco).
// Prezzi €/mq IVA esclusa. Sconto fornitore standard: 50+10 (coefficiente 0.45).
export interface FlowProduct {
  code: string;
  name: string;
  collection: "Flow 40" | "Flow 55" | "Flow XL" | "Flow Spina" | "Flow 55 GD" | "Flow+ XL" | "Flow+ Spina";
  category: "SPC a secco" | "Vinilico colla";
  format: string;
  thickness: string;
  packPieces: number;
  packMq: number;
  palletMq: number;
  listPrice: number;        // €/mq paletta
  overPalletPrice: number;  // €/mq oltre la paletta
  delivery: string;
  notes?: string;
}

export const flowProducts: FlowProduct[] = [
  // Flow 40
  { code: "FLOW-40", name: "Flow 40", collection: "Flow 40", category: "SPC a secco",
    format: "1524×228,6 mm", thickness: "4+1 mm", packPieces: 5, packMq: 1.742, palletMq: 118.456,
    listPrice: 43.80, overPalletPrice: 41.50, delivery: "Pronta" },

  // Flow 55
  { code: "FLOW-55-WOOD", name: "Flow 55 Wood", collection: "Flow 55", category: "SPC a secco",
    format: "1524×228,6 mm", thickness: "4,5+1 mm", packPieces: 5, packMq: 1.742, palletMq: 111.488,
    listPrice: 49.00, overPalletPrice: 46.70, delivery: "Pronta" },
  { code: "FLOW-55-CEMENT", name: "Flow 55 Cement", collection: "Flow 55", category: "SPC a secco",
    format: "920×460 mm", thickness: "5,5+1 mm", packPieces: 5, packMq: 2.116, palletMq: 101.168,
    listPrice: 52.70, overPalletPrice: 50.40, delivery: "Pronta" },

  // Flow XL
  { code: "FLOW-XL", name: "Flow XL", collection: "Flow XL", category: "SPC a secco",
    format: "1800×228,6 mm", thickness: "5+1 mm", packPieces: 4, packMq: 1.645, palletMq: 111.860,
    listPrice: 53.00, overPalletPrice: 50.70, delivery: "Pronta" },

  // Flow Spina
  { code: "FLOW-SPINA-ANDE", name: "Flow Spina Ande", collection: "Flow Spina", category: "SPC a secco",
    format: "640×128 mm", thickness: "4,5+1 mm", packPieces: 14, packMq: 1.146, palletMq: 64.176,
    listPrice: 51.20, overPalletPrice: 48.90, delivery: "Pronta",
    notes: "Fornito equamente tra pacchi destri e sinistri" },

  // Flow 55 GD (vinilico da incollare)
  { code: "FLOW-55-GD-WOOD", name: "Flow 55 GD Wood", collection: "Flow 55 GD", category: "Vinilico colla",
    format: "1500×230 mm", thickness: "2,5 mm", packPieces: 10, packMq: 3.450, palletMq: 220.800,
    listPrice: 32.10, overPalletPrice: 29.80, delivery: "Pronta", notes: "Novità 2025" },
  { code: "FLOW-55-GD-CEMENT", name: "Flow 55 GD Cement", collection: "Flow 55 GD", category: "Vinilico colla",
    format: "914,4×457,2 mm", thickness: "2,5 mm", packPieces: 8, packMq: 3.345, palletMq: 233.80,
    listPrice: 31.40, overPalletPrice: 29.10, delivery: "Pronta", notes: "Novità 2025" },

  // Flow+ XL
  { code: "FLOW-PLUS-XL-WOOD", name: "Flow+ XL Wood", collection: "Flow+ XL", category: "SPC a secco",
    format: "1800×228,6 mm", thickness: "5,5+1 mm", packPieces: 4, packMq: 1.645, palletMq: 105.344,
    listPrice: 54.10, overPalletPrice: 51.80, delivery: "Pronta", notes: "Novità 2025" },
  { code: "FLOW-PLUS-XL-TILE", name: "Flow+ XL Tile", collection: "Flow+ XL", category: "SPC a secco",
    format: "1200×600 mm", thickness: "5,5+1 mm", packPieces: 2, packMq: 1.440, palletMq: 76.320,
    listPrice: 55.30, overPalletPrice: 53.00, delivery: "Pronta", notes: "Novità 2025" },

  // Flow+ Spina
  { code: "FLOW-PLUS-SPINA-ITALIANA", name: "Flow+ Spina Italiana", collection: "Flow+ Spina", category: "SPC a secco",
    format: "640×128 mm", thickness: "5,5+1 mm", packPieces: 14, packMq: 1.146, palletMq: 72.198,
    listPrice: 54.40, overPalletPrice: 52.10, delivery: "Pronta", notes: "Novità 2025 · pacchi destri+sinistri" },
  { code: "FLOW-PLUS-SPINA-FRANCESE", name: "Flow+ Spina Francese", collection: "Flow+ Spina", category: "SPC a secco",
    format: "625×127 mm", thickness: "5,5+1 mm", packPieces: 14, packMq: 1.111, palletMq: 62.22,
    listPrice: 61.80, overPalletPrice: 59.50, delivery: "Pronta", notes: "Novità 2025 · pacchi destri+sinistri" },
];

export interface FlowAccessory {
  code: string;
  name: string;
  unit: "ml" | "mq" | "pz" | "kg" | "lt";
  listPrice: number;
  notes?: string;
}

export const flowAccessories: FlowAccessory[] = [
  // Accessori coordinati (in tinta col pavimento)
  { code: "FL-BATT-70",   name: "Battiscopa PVC coordinato 70×12×2400 mm", unit: "ml", listPrice: 6.20 },
  { code: "FL-GIUNTOT",   name: "Giunto a T coordinato 32 mm (alu+PVC)",   unit: "ml", listPrice: 16.20 },
  { code: "FL-RACCORDO",  name: "Profilo di raccordo coordinato 31 mm",    unit: "ml", listPrice: 16.20 },
  { code: "FL-FINITURA",  name: "Profilo di finitura coordinato 25 mm",    unit: "ml", listPrice: 16.20 },
  { code: "FL-SCALA-XL",  name: "Profilo scale Flow XL 1800×40×188,6 mm",  unit: "pz", listPrice: 76.30, notes: "Consegna 2 settimane" },
  { code: "FL-SCALA-40",  name: "Profilo scale Flow 40 1524×40×188,6 mm",  unit: "pz", listPrice: 76.30, notes: "Consegna 2 settimane" },
  { code: "FL-SCALA-TILE",name: "Profilo scale Flow+ XL Tile 1200×40×560", unit: "pz", listPrice: 87.50, notes: "Consegna 2 settimane" },

  // Accessori alluminio (argento)
  { code: "FL-ALU-T32",   name: "Giunto a T alluminio 32 mm",              unit: "ml", listPrice: 9.90 },
  { code: "FL-ALU-R31",   name: "Profilo raccordo alluminio 31 mm",        unit: "ml", listPrice: 9.90 },
  { code: "FL-ALU-F25",   name: "Profilo finitura alluminio 25 mm",        unit: "ml", listPrice: 9.90 },
  { code: "FL-ALU-C",     name: "Profilo finitura a C 5/6 mm",             unit: "ml", listPrice: 9.10 },
  { code: "FL-PARAG-RIG", name: "Paragradino rigato 6 mm (max 6 mm)",      unit: "ml", listPrice: 14.10 },
  { code: "FL-PARAG-31",  name: "Paragradino 31 mm (max 5 mm)",            unit: "ml", listPrice: 13.90, notes: "Consegna 2 settimane" },
  { code: "FL-PARAG-26",  name: "Paragradino 26 mm (max 6 mm)",            unit: "ml", listPrice: 14.30, notes: "Consegna 2 settimane" },

  // Sottofondi / accessori posa
  { code: "FL-NYLON",     name: "Nylon Fitt Blu Sky barriera vapore 0,12 mm", unit: "mq", listPrice: 1.80 },
  { code: "FL-ISOLDRUM",  name: "Isoldrum LVT Plus 1,8 mm (conf. 7 mq)",   unit: "mq", listPrice: 10.20 },
  { code: "FL-NASTRO",    name: "Nastro alluminato 50 ml × 5 cm",          unit: "pz", listPrice: 9.30 },
  { code: "FL-ARDEX",     name: "Ardex Fix livellante rapido 5 kg",        unit: "kg", listPrice: 19.10 },

  // Sottoscrivanie
  { code: "FL-LASTRA-90", name: "Lastra antirotella 90×120 cm (2 mm)",     unit: "pz", listPrice: 120.80 },
  { code: "FL-LASTRA-120",name: "Lastra antirotella 120×150 cm (2 mm)",    unit: "pz", listPrice: 192.70 },

  // Manutenzione
  { code: "FL-CARE",      name: "Flow Care LVT Cleaner 1 lt",              unit: "lt", listPrice: 12.80 },
];
