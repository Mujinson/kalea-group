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
    colorHex: '#d4cfc9', // Light gray/whitish wood
  },
  {
    id: 'orama',
    name: 'Orama',
    number: 2,
    colorHex: '#8b8278', // Dark gray wood
  },
  {
    id: 'nuvia',
    name: 'Nuvia',
    number: 3,
    colorHex: '#c9a96c', // Light golden/blonde wood
  },
  {
    id: 'mielea',
    name: 'Mielea',
    number: 4,
    colorHex: '#d4b896', // Honey/light brown wood
  },
  {
    id: 'argilla',
    name: 'Argilla',
    number: 5,
    colorHex: '#a89078', // Medium brown/beige wood
  },
  {
    id: 'radice',
    name: 'Radice',
    number: 6,
    colorHex: '#7a5d48', // Dark brown wood
  },
  {
    id: 'vetra',
    name: 'Vetra',
    number: 7,
    colorHex: '#c8c0b8', // Light gray/white wood
  },
];
