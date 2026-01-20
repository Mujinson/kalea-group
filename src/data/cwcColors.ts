// Data for CWC (Carbon Wood Composite) color collection - BIOCORE FLOOR®

// Import images
import biocoreNexa from "@/assets/biocore-nexa.png";
import biocoreOrama from "@/assets/biocore-orama.png";
import biocoreNuvia from "@/assets/biocore-nuvia.png";
import biocoreMielea from "@/assets/biocore-mielea.png";
import biocoreArgilla from "@/assets/biocore-argilla.png";
import biocoreRadice from "@/assets/biocore-radice.png";
import biocoreVetra from "@/assets/biocore-vetra.png";

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
    image: biocoreNexa,
  },
  {
    id: 'orama',
    name: 'Orama',
    number: 2,
    colorHex: '#6b6058',
    image: biocoreOrama,
  },
  {
    id: 'nuvia',
    name: 'Nuvia',
    number: 3,
    colorHex: '#c9a55c',
    image: biocoreNuvia,
  },
  {
    id: 'mielea',
    name: 'Mielea',
    number: 4,
    colorHex: '#d8c9a8',
    image: biocoreMielea,
  },
  {
    id: 'argilla',
    name: 'Argilla',
    number: 5,
    colorHex: '#a09690',
    image: biocoreArgilla,
  },
  {
    id: 'radice',
    name: 'Radice',
    number: 6,
    colorHex: '#8b5a3c',
    image: biocoreRadice,
  },
  {
    id: 'vetra',
    name: 'Vetra',
    number: 7,
    colorHex: '#c4bdb5',
    image: biocoreVetra,
  },
];
