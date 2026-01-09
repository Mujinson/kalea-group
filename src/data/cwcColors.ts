// Data for CWC (Carbon Wood Composite) color collection - BIOWOOD FLOOR®

// Import images
import biowoodNexa from "@/assets/biowood-nexa.png";
import biowoodOrama from "@/assets/biowood-orama.png";
import biowoodNuvia from "@/assets/biowood-nuvia.png";
import biowoodMielea from "@/assets/biowood-mielea.png";
import biowoodArgilla from "@/assets/biowood-argilla.png";
import biowoodRadice from "@/assets/biowood-radice.png";
import biowoodVetra from "@/assets/biowood-vetra.png";

export interface CWCColor {
  id: string;
  name: string;
  number: number;
  colorHex: string;
  image: string;
}

export const cwcColors: CWCColor[] = [
  {
    id: 'nexa',
    name: 'Nexa',
    number: 1,
    colorHex: '#c9c4be',
    image: biowoodNexa,
  },
  {
    id: 'orama',
    name: 'Orama',
    number: 2,
    colorHex: '#6b6058',
    image: biowoodOrama,
  },
  {
    id: 'nuvia',
    name: 'Nuvia',
    number: 3,
    colorHex: '#c9a55c',
    image: biowoodNuvia,
  },
  {
    id: 'mielea',
    name: 'Mielea',
    number: 4,
    colorHex: '#d8c9a8',
    image: biowoodMielea,
  },
  {
    id: 'argilla',
    name: 'Argilla',
    number: 5,
    colorHex: '#a09690',
    image: biowoodArgilla,
  },
  {
    id: 'radice',
    name: 'Radice',
    number: 6,
    colorHex: '#8b5a3c',
    image: biowoodRadice,
  },
  {
    id: 'vetra',
    name: 'Vetra',
    number: 7,
    colorHex: '#c4bdb5',
    image: biowoodVetra,
  },
];
