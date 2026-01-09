// Data for CWC (Carbon Wood Composite) color collection

export interface CWCColor {
  id: string;
  name: string;
  number: number;
  // Colors extracted from reference image - will use gradient approximations
  colorHex: string;
}

export const cwcColors: CWCColor[] = [
  {
    id: 'nexa',
    name: 'Nexa',
    number: 1,
    colorHex: '#c9c4be', // Beige chiaro/rovere sbiancato
  },
  {
    id: 'orama',
    name: 'Orama',
    number: 2,
    colorHex: '#6b6058', // Grigio-marrone scuro
  },
  {
    id: 'nuvia',
    name: 'Nuvia',
    number: 3,
    colorHex: '#c9a55c', // Miele dorato
  },
  {
    id: 'mielea',
    name: 'Mielea',
    number: 4,
    colorHex: '#d8c9a8', // Beige naturale chiaro
  },
  {
    id: 'argilla',
    name: 'Argilla',
    number: 5,
    colorHex: '#a09690', // Grigio medio
  },
  {
    id: 'radice',
    name: 'Radice',
    number: 6,
    colorHex: '#8b5a3c', // Marrone caramello scuro
  },
  {
    id: 'vetra',
    name: 'Vetra',
    number: 7,
    colorHex: '#c4bdb5', // Grigio chiaro naturale
  },
];
