import dream from "@/assets/woodco/dream.webp";
import element from "@/assets/woodco/element.webp";
import ground from "@/assets/woodco/ground.webp";
import her from "@/assets/woodco/her.webp";
import him from "@/assets/woodco/him.webp";
import kalika from "@/assets/woodco/kalika.webp";
import sense from "@/assets/woodco/sense.webp";
import signature from "@/assets/woodco/signature.webp";
import star from "@/assets/woodco/star.webp";

export interface ParquetCollection {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  formats: string[];
  finishes: string[];
}

export const parquetCollections: ParquetCollection[] = [
  {
    slug: "signature",
    name: "Signature",
    tagline: "Plancia larga, carattere autentico",
    description:
      "Una collezione di rovere a plancia larga che esalta la naturalità della venatura. Finiture spazzolate e oliate per superfici materiche, dal segno deciso e dal calore tattile.",
    image: signature,
    formats: ["Plancia 190×1900 mm", "Spessore 14 mm", "Strato nobile 4 mm"],
    finishes: ["Spazzolato", "Oliato naturale", "Verniciato opaco"],
  },
  {
    slug: "dream",
    name: "Dream",
    tagline: "Eleganza versatile in rovere",
    description:
      "Plance contemporanee dalla resa equilibrata, pensate per ambienti residenziali raffinati. Tonalità calibrate e finiture morbide che si integrano in qualsiasi linguaggio d'interni.",
    image: dream,
    formats: ["Plancia 190×1900 mm", "Spessore 14 mm"],
    finishes: ["Spazzolato", "Verniciato opaco", "Oliato"],
  },
  {
    slug: "star",
    name: "Star",
    tagline: "Posa a spina iconica",
    description:
      "Spina italiana e spina ungherese dal disegno geometrico inconfondibile. Una collezione che cita la tradizione del parquet classico con sensibilità contemporanea.",
    image: star,
    formats: ["Spina italiana 90×450 mm", "Spina ungherese 90×600 mm"],
    finishes: ["Spazzolato", "Affumicato", "Oliato"],
  },
  {
    slug: "sense",
    name: "Sense",
    tagline: "Materia tattile e profonda",
    description:
      "Superfici dal rilievo accentuato e dalla texture viva. Sense valorizza i segni del legno con lavorazioni profonde e finiture matt per un effetto naturale e contemporaneo.",
    image: sense,
    formats: ["Plancia 220×2200 mm", "Spessore 14 mm"],
    finishes: ["Piallato a mano", "Spazzolato profondo", "Oliato"],
  },
  {
    slug: "element",
    name: "Element",
    tagline: "Minimalismo essenziale",
    description:
      "Un parquet dal segno pulito, pensato per architetture rigorose. Tonalità neutre, superfici uniformi e finiture opache per ambienti sospesi tra natura e design.",
    image: element,
    formats: ["Plancia 190×1900 mm", "Spessore 14 mm"],
    finishes: ["Verniciato extra-opaco", "Spazzolato"],
  },
  {
    slug: "kalika",
    name: "Kalika",
    tagline: "Cromie ricercate, anima sartoriale",
    description:
      "Colorazioni esclusive e finiture artigianali. Kalika trasforma il rovere in una superficie d'autore, con tonalità calibrate per progetti d'arredo di alta gamma.",
    image: kalika,
    formats: ["Plancia 190×1900 mm", "Plancia 220×2200 mm"],
    finishes: ["Tinto in massa", "Spazzolato", "Oliato pigmentato"],
  },
  {
    slug: "him",
    name: "Him",
    tagline: "Rovere classico, tono naturale",
    description:
      "La versione essenziale del parquet in rovere: selezione naturale, finiture leggere e una palette che valorizza la materia senza alterarla.",
    image: him,
    formats: ["Plancia 190×1900 mm"],
    finishes: ["Naturale AB", "Spazzolato", "Verniciato opaco"],
  },
  {
    slug: "her",
    name: "Her",
    tagline: "Calde tonalità contemporanee",
    description:
      "Una collezione dalle nuance morbide e avvolgenti, studiata per ambienti dal mood caldo e accogliente. Finiture sensoriali e plance armoniose.",
    image: her,
    formats: ["Plancia 190×1900 mm"],
    finishes: ["Spazzolato", "Oliato pigmentato"],
  },
  {
    slug: "ground",
    name: "Ground",
    tagline: "Tonalità terrose e materiche",
    description:
      "Ispirata alla terra e ai minerali, Ground propone tinte profonde e finiture materiche per pavimenti dal carattere deciso e radicato.",
    image: ground,
    formats: ["Plancia 190×1900 mm", "Plancia 220×2200 mm"],
    finishes: ["Tinto torba", "Spazzolato profondo", "Oliato"],
  },
];

export const getParquetCollection = (slug: string) =>
  parquetCollections.find((c) => c.slug === slug);
