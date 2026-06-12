// Prodotti Kronos 2026 — popolare con dataset reale fornito dall'utente.
export type KronosCollection =
  | 'Pierre Vive'
  | 'Materia'
  | 'Piasentina'
  | 'Nativa'
  | 'Metallique'
  | 'Le Reverse'
  | 'Les Bois'
  | 'Outdoor';

export interface KronosProduct {
  code: string;
  name: string;
  collection: KronosCollection;
  listPrice: number; // €/mq listino fornitore
  format?: string;
  skirtingPrice?: number; // €/ml battiscopa
  notes?: string;
}

export const kronosProducts: KronosProduct[] = [
  // TODO: incollare il dataset 40+ prodotti Kronos 2026
];

export const kronosCollections: KronosCollection[] = [
  'Pierre Vive',
  'Materia',
  'Piasentina',
  'Nativa',
  'Metallique',
  'Le Reverse',
  'Les Bois',
  'Outdoor',
];
