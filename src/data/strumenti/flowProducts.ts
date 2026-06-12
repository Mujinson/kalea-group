// Prodotti Flow 2025 — popolare con dataset reale fornito dall'utente.
export interface FlowProduct {
  code: string;
  name: string;
  collection?: string;
  listPrice: number; // €/mq listino fornitore
  format?: string;
  notes?: string;
}

export const flowProducts: FlowProduct[] = [
  // TODO: incollare i dati JSON dei 11 prodotti Flow 2025
];
