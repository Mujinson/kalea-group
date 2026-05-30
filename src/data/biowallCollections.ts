import rawOak from "@/assets/biowall/raw-oak.webp";
import timber from "@/assets/biowall/timber.webp";
import nux from "@/assets/biowall/nux.webp";
import pattern from "@/assets/biowall/pattern.webp";
import paint from "@/assets/biowall/paint.webp";

export interface BiowallCollection {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  spessori: string[];
  finiture: string[];
  applicazioni: string[];
}

export const biowallCollections: BiowallCollection[] = [
  {
    slug: "raw-oak",
    name: "Raw Oak",
    tagline: "Rovere grezzo, materia viva",
    description:
      "Decorativo a parete con texture in rovere materico. Venature profonde, nodi e graffiature in registro per un effetto autentico e naturale. Disponibile nei tre spessori TW1, TW2 e TW3 per dare ritmo e profondità alle pareti.",
    image: rawOak,
    spessori: ["TW1 4 mm", "TW2 8 mm", "TW3 12 mm"],
    finiture: ["Rovere grezzo", "Effetto materico", "Registro superficie"],
    applicazioni: ["Living", "Hotel", "Reception", "Ristoranti"],
  },
  {
    slug: "timber",
    name: "Timber",
    tagline: "Doghe di legno tagliate a misura",
    description:
      "Famiglia decorativa in tonalità calde di legno cesellato. Effetto doga continua con sfumature naturali. Combinabile sulle tre profondità TW per creare boiserie tridimensionali, fasce o pareti accent.",
    image: timber,
    spessori: ["TW1 4 mm", "TW2 8 mm", "TW3 12 mm"],
    finiture: ["Legno caldo", "Doga continua", "Texture cesellata"],
    applicazioni: ["Residenziale alto", "Hospitality", "Showroom"],
  },
  {
    slug: "nux",
    name: "Nux",
    tagline: "Noce profondo, calore avvolgente",
    description:
      "Decoro a parete in noce dai toni intensi, perfetto per ambienti raffinati e di carattere. La profondità del colore e la grana del legno donano calore e identità a living, studi, suite e zone notte.",
    image: nux,
    spessori: ["TW1 4 mm", "TW2 8 mm", "TW3 12 mm"],
    finiture: ["Noce", "Grana profonda", "Toni caldi"],
    applicazioni: ["Suite", "Studi", "Living", "Boutique"],
  },
  {
    slug: "pattern",
    name: "Pattern",
    tagline: "Geometrie tridimensionali",
    description:
      "Decorativi a parete con disegni geometrici e tridimensionali. Linee scolpite e moduli rigorosi creano superfici scenografiche per reception, lobby e spazi corporate. Sviluppato sullo spessore TW2.",
    image: pattern,
    spessori: ["TW2 8 mm"],
    finiture: ["Geometrico", "Effetto 3D", "Modulare"],
    applicazioni: ["Reception", "Lobby", "Retail", "Uffici direzionali"],
  },
  {
    slug: "paint",
    name: "Paint",
    tagline: "Tinta piatta, design pulito",
    description:
      "Pannello a parete in finitura tinta pulita, ideale come fondale minimale o per accent walls cromatiche. Modulabile sui tre spessori TW per giocare con piani e sporgenze in un linguaggio architettonico essenziale.",
    image: paint,
    spessori: ["TW1 4 mm", "TW2 8 mm", "TW3 12 mm"],
    finiture: ["Tinta unita", "Superficie liscia", "Effetto pittura"],
    applicazioni: ["Residenziale", "Uffici", "Healthcare", "Education"],
  },
];

export const getBiowallCollection = (slug: string) =>
  biowallCollections.find((c) => c.slug === slug);
