import rawOak from "@/assets/biowall/raw-oak.webp";
import timber from "@/assets/biowall/timber.webp";
import nux from "@/assets/biowall/nux.webp";
import pattern from "@/assets/biowall/pattern.webp";
import paint from "@/assets/biowall/paint.webp";

export interface CaratteristicaBiowall {
  label: string;
  description: string;
}

export interface BiowallCollection {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  spessori: string[];
  finiture: string[];
  applicazioni: string[];
  caratteristiche?: CaratteristicaBiowall[];
  effectStoryTitle?: string;
  effectStory?: string;
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
    finiture: ["Legno"],
    applicazioni: ["Living", "Hotel", "Reception", "Ristoranti"],
    caratteristiche: [
      {
        label: "Tre profondità TW",
        description:
          "Spessori 4, 8 e 12 mm modulabili nella stessa parete per generare giochi di pieni e vuoti tridimensionali.",
      },
      {
        label: "Registro in superficie",
        description:
          "Venature, nodi e graffi sono in registro con la grafica: l'effetto materico è coerente sotto la luce radente.",
      },
      {
        label: "Posa a parete diretta",
        description:
          "Sistema dedicato di incollaggio Hypermatt per applicazione veloce su parete senza opere murarie.",
      },
    ],
    effectStoryTitle: "La parete che torna a essere materia",
    effectStory:
      "Raw Oak è la parete che cancella l'idea del rivestimento decorativo: torna a essere materia. Il rovere è grezzo, segnato dai nodi e dai tagli della sega, restituito in tre profondità che si possono combinare nello stesso ambiente.\n\nÈ una superficie che cambia con la luce: al mattino sembra disegno, alla sera diventa scultura. Trova il suo posto nei living d'autore, nelle reception alberghiere e nei ristoranti dove la parete è parte del racconto.",
  },
  {
    slug: "timber",
    name: "Timber",
    tagline: "Doghe di legno tagliate a misura",
    description:
      "Famiglia decorativa in tonalità calde di legno cesellato. Effetto doga continua con sfumature naturali. Combinabile sulle tre profondità TW per creare boiserie tridimensionali, fasce o pareti accent.",
    image: timber,
    spessori: ["TW1 4 mm", "TW2 8 mm", "TW3 12 mm"],
    finiture: ["Legno"],
    applicazioni: ["Residenziale alto", "Hospitality", "Showroom"],
    caratteristiche: [
      {
        label: "Doga continua",
        description:
          "La grafica si sviluppa per tutta la lunghezza del pannello, senza interruzioni visive: l'occhio legge una boiserie unica.",
      },
      {
        label: "Tonalità calibrate",
        description:
          "Una gamma cromatica costruita sulle tonalità calde del legno, dal miele al brunito profondo.",
      },
      {
        label: "Modularità TW",
        description:
          "Combinabile sulle tre profondità per generare fasce, accent walls e boiserie tridimensionali.",
      },
    ],
    effectStoryTitle: "Le doghe che disegnano la parete",
    effectStory:
      "Timber è la boiserie contemporanea: doghe di legno cesellato che corrono lungo la parete e ne ridisegnano la proporzione. È un classico architettonico riportato al presente attraverso le tre profondità TW di Skema.\n\nNelle suite alberghiere e negli showroom diventa lo sfondo che riscalda lo spazio; nel residenziale di alta gamma costruisce un accento che fa da quinta all'arredo.",
  },
  {
    slug: "nux",
    name: "Nux",
    tagline: "Noce profondo, calore avvolgente",
    description:
      "Decoro a parete in noce dai toni intensi, perfetto per ambienti raffinati e di carattere. La profondità del colore e la grana del legno donano calore e identità a living, studi, suite e zone notte.",
    image: nux,
    spessori: ["TW1 4 mm", "TW2 8 mm", "TW3 12 mm"],
    finiture: ["Legno"],
    applicazioni: ["Suite", "Studi", "Living", "Boutique"],
    caratteristiche: [
      {
        label: "Toni profondi del noce",
        description:
          "Cromia satura ispirata al noce nazionale: una tonalità calda che dona identità immediata all'ambiente.",
      },
      {
        label: "Grana definita",
        description:
          "Le venature scure sono leggibili sotto qualsiasi condizione di luce, mantenendo intatta la matericità del legno.",
      },
      {
        label: "Versatilità TW",
        description:
          "Disponibile nelle tre profondità: si presta a pareti accent, librerie d'ambiente e quinte direzionali.",
      },
    ],
    effectStoryTitle: "Il calore del noce, tradotto in parete",
    effectStory:
      "Nux è il noce: tono caldo, profondo, autoritario. È la parete che chiude lo studio direzionale, che incornicia il letto della suite, che firma la boutique di moda con un'eleganza senza tempo.\n\nLa grana definita e i toni saturi rendono Nux la scelta dei progetti che cercano carattere senza concedere nulla alla moda passeggera.",
  },
  {
    slug: "pattern",
    name: "Pattern",
    tagline: "Geometrie tridimensionali",
    description:
      "Decorativi a parete con disegni geometrici e tridimensionali. Linee scolpite e moduli rigorosi creano superfici scenografiche per reception, lobby e spazi corporate. Sviluppato sullo spessore TW2.",
    image: pattern,
    spessori: ["TW2 8 mm"],
    finiture: ["Geometrico"],
    applicazioni: ["Reception", "Lobby", "Retail", "Uffici direzionali"],
    caratteristiche: [
      {
        label: "Disegno geometrico",
        description:
          "Linee scolpite e moduli ricorrenti che generano un ritmo visivo continuo, ideale per pareti scenografiche.",
      },
      {
        label: "Effetto tridimensionale",
        description:
          "La lavorazione sulla superficie restituisce profondità reale, non simulata: la parete vive di ombre proprie.",
      },
      {
        label: "Sviluppo TW2",
        description:
          "Spessore 8 mm dedicato: il giusto compromesso tra rilievo plastico e leggerezza di applicazione.",
      },
    ],
    effectStoryTitle: "Geometria che si fa parete",
    effectStory:
      "Pattern è la collezione che fa della parete una superficie scolpita. I moduli ricorrenti generano un disegno che cambia di intensità con la luce: in piena illuminazione è grafica, in luce radente diventa rilievo.\n\nNasce per gli spazi corporate, le reception alberghiere e le lobby dove la parete deve dire qualcosa prima ancora che si arrivi al bancone.",
  },
  {
    slug: "paint",
    name: "Paint",
    tagline: "Tinta piatta, design pulito",
    description:
      "Pannello a parete in finitura tinta pulita, ideale come fondale minimale o per accent walls cromatiche. Modulabile sui tre spessori TW per giocare con piani e sporgenze in un linguaggio architettonico essenziale.",
    image: paint,
    spessori: ["TW1 4 mm", "TW2 8 mm", "TW3 12 mm"],
    finiture: ["Tinta unita"],
    applicazioni: ["Residenziale", "Uffici", "Healthcare", "Education"],
    caratteristiche: [
      {
        label: "Tinta unita uniforme",
        description:
          "Superficie liscia in tinta piena: il pannello diventa un piano cromatico puro, calibrato per l'architettura essenziale.",
      },
      {
        label: "Modulabile TW",
        description:
          "Le tre profondità consentono di giocare con piani sporgenti e arretrati creando ritmo visivo anche nel monocromo.",
      },
      {
        label: "Adatto ad ambienti tecnici",
        description:
          "Pulibilità, regolarità della superficie e tenuta del colore lo rendono idoneo a healthcare ed education.",
      },
    ],
    effectStoryTitle: "Il colore come materia architettonica",
    effectStory:
      "Paint è la parete portata alla sua essenza: una tinta unita, piena, costante. Niente texture, niente decoro: solo il colore che diventa volume grazie ai tre spessori TW.\n\nÈ la scelta dell'architettura minimalista, degli uffici contemporanei, degli ambienti healthcare ed education dove la pulizia visiva è anche pulizia funzionale.",
  },
];

export const getBiowallCollection = (slug: string) =>
  biowallCollections.find((c) => c.slug === slug);
