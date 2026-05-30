import stark from "@/assets/spc/stark.webp";
import starkR from "@/assets/spc/stark-r.webp";
import starkC from "@/assets/spc/stark-c.webp";
import starkS from "@/assets/spc/stark-s.webp";
import starkD from "@/assets/spc/stark-d.webp";
import starkW from "@/assets/spc/stark-w.webp";
import starkWMaxi from "@/assets/spc/stark-w-maxi.webp";
import starkWood from "@/assets/spc/stark-wood.webp";
import starkWoodSpina from "@/assets/spc/stark-wood-spina.webp";
import connex from "@/assets/spc/connex.webp";

export interface SpcCollection {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  formats: string[];
  finishes: string[];
  applicazioni: string[];
  effectStory?: string;
  effectStoryTitle?: string;
}

export const spcCollections: SpcCollection[] = [
  {
    slug: "star-k",
    name: "Star K",
    tagline: "Doghe ampie, stabilità estrema",
    description:
      "Pavimento SPC con decoro legno in doghe di grande formato. Eccellente stabilità dimensionale e resistenza all'usura, ideale per ambienti ad alta frequentazione. Totalmente waterproof e antiscivolo, posabile anche in bagni, spa e palestre.",
    image: stark,
    formats: ["228,6×1524 mm", "Spessore 6,5 mm"],
    finishes: ["Legno", "Antiscivolo", "Waterproof"],
    applicazioni: ["Residenziale", "Hotel", "Wellness", "Retail"],
    effectStoryTitle: "Un legno ampio, sicuro, infinito",
    effectStory:
      "Star K racconta il legno nella sua dimensione più generosa. Doghe extra-large che disegnano superfici continue, dove la venatura corre senza interruzioni e gli ambienti respirano un'aria più calma, più architettonica.\n\nLa superficie ultra matt restituisce il tocco caldo del rovere naturale, mentre la struttura SPC garantisce stabilità dimensionale assoluta: il pavimento non teme l'acqua, i passaggi intensi, gli sbalzi termici. È il legno che desideri ovunque — anche dove non avresti mai osato posarlo.",
  },
  {
    slug: "star-k-r",
    name: "Star K-R",
    tagline: "Registro superficie ultra realistico",
    description:
      "Tecnologia a registro applicata in superficie per un effetto legno di realismo assoluto. Finitura ultra matt, cromatismi precisi e venature senza nodi. Prestazioni SPC complete: waterproof, sottopavimento acustico preaccoppiato, antiscivolo.",
    image: starkR,
    formats: ["228,6×1524 mm", "Spessore 6,5 mm"],
    finishes: ["Legno", "Ultra matt", "Registro superficie"],
    applicazioni: ["Residenziale alto", "Hospitality", "Contract"],
    effectStoryTitle: "Il realismo del legno, alla perfezione",
    effectStory:
      "Star K-R porta la tecnologia del registro in superficie a un livello quasi tattile: ogni venatura del decoro si allinea perfettamente alla micro-spazzolatura fisica della superficie. Il risultato è un'illusione che inganna l'occhio e la mano.\n\nLa finitura ultra matt assorbe la luce come solo il legno naturale sa fare, eliminando ogni effetto plastico. Cromatismi profondi, nodi appena accennati, sfumature autentiche: un pavimento pensato per chi pretende il calore del rovere senza alcun compromesso prestazionale.",
  },
  {
    slug: "star-k-c",
    name: "Star K-C",
    tagline: "Sughero naturale, comfort silenzioso",
    description:
      "SPC con sottofondo in sughero che unisce design, stabilità, isolamento acustico e calore al tatto. Ideale per ristrutturazioni rapide con miglioramento del comfort termoacustico, mantenendo un effetto legno realistico e dettagliato.",
    image: starkC,
    formats: ["228,6×1524 mm", "Spessore 7 mm"],
    finishes: ["Legno", "Sottofondo sughero"],
    applicazioni: ["Residenziale", "Uffici", "Ristrutturazioni"],
    effectStoryTitle: "Il silenzio caldo del sughero",
    effectStory:
      "Star K-C nasce dall'incontro tra due materie nobili: la stabilità dell'SPC e la morbidezza naturale del sughero. Camminare su questo pavimento è un'esperienza diversa — il passo è ovattato, la pianta del piede percepisce un calore vivo, ogni rumore si attenua.\n\nL'effetto legno in superficie mantiene tutta l'espressività del rovere contemporaneo: doghe ampie, finitura opaca, venature definite. Sotto, lo strato di sughero lavora in silenzio per restituire alla casa quel comfort acustico e termico che troppo spesso viene sacrificato in nome della praticità.",
  },
  {
    slug: "star-k-s",
    name: "Star K-S",
    tagline: "Spina francese, eleganza tecnica",
    description:
      "SPC con disegno a spina francese, micro-bisello sui quattro lati e tecnologia end-less che sincronizza il disegno tra le doghe. Posa semplificata, effetto continuo, alta resistenza al fuoco e all'acqua.",
    image: starkS,
    formats: ["152,4×609,6 mm", "Spina francese", "Spessore 6 mm"],
    finishes: ["Legno", "Micro-bisello 4 lati"],
    applicazioni: ["Spazi pubblici", "Boutique", "Residenziale design"],
    effectStoryTitle: "La spina francese, reinterpretata",
    effectStory:
      "Star K-S riprende uno dei pattern più nobili della tradizione parquettistica europea — la spina francese, tagliata a 45° — e lo traduce in una superficie SPC ad alta resa estetica. Le doghe si incontrano in diagonali precise, generando movimento e profondità in ogni ambiente.\n\nLa tecnologia end-less sincronizza il disegno del legno tra elemento ed elemento: nessun salto, nessuna ripetizione visibile. Il micro-bisello sui quattro lati definisce ogni doga senza appesantirla, restituendo quella raffinatezza artigianale che rende la spina francese sinonimo di eleganza senza tempo.",
  },
  {
    slug: "star-k-d",
    name: "Star K-D",
    tagline: "Tiles industrial waterproof",
    description:
      "Pavimento in formato tiles ispirato all'industrial design, con estetiche pietra, cemento e metallo. Comfort tipico dell'SPC, waterproof e perfetto per bagni total look senza fughe, coordinabile con i rivestimenti Star K-W.",
    image: starkD,
    formats: ["457,2×457,2 mm", "Spessore 6 mm"],
    finishes: ["Pietra", "Cemento", "Metallo"],
    applicazioni: ["Uffici", "Bagni", "Retail", "Wellness"],
    effectStoryTitle: "Mineralità urbana, comfort domestico",
    effectStory:
      "Star K-D porta in casa l'estetica delle superfici minerali — pietra grezza, cemento spatolato, ossidi metallici — senza la freddezza tipica dei materiali da cui prende ispirazione. Sotto i piedi il calore resta, l'acustica si addolcisce, il passo è elastico.\n\nIl formato tile quadrato apre nuove possibilità compositive: posa diritta per ambienti rigorosi, sfalsata per dinamismo contemporaneo, total look se coordinata al rivestimento Star K-W. Una superficie che cancella i confini tra pavimento, parete, residenziale e contract.",
  },
  {
    slug: "star-k-w",
    name: "Star K-W",
    tagline: "Rivestimento parete coordinato",
    description:
      "Rivestimento a parete in SPC a basso spessore con decorativi effetto pietra e cemento in formato tiles, coordinati con i pavimenti Star K-D. Ideale per pareti di bagni e docce con stile contemporaneo, total look e senza fughe.",
    image: starkW,
    formats: ["457,2×457,2 mm", "Spessore 4 mm"],
    finishes: ["Pietra", "Cemento"],
    applicazioni: ["Bagni", "Docce", "Spa", "Hall"],
    effectStoryTitle: "La parete che continua il pavimento",
    effectStory:
      "Star K-W nasce per liberare la parete dalle fughe e dal vincolo della ceramica. Lastre SPC sottili, posabili anche dentro la doccia, che propongono in verticale gli stessi effetti pietra e cemento del pavimento Star K-D.\n\nIl risultato è un total look continuo, materico, contemporaneo: bagni che respirano come spa, hall che si trasformano in scenografie minerali, docce che diventano nicchie monolitiche. Una rivoluzione silenziosa, dove la parete smette di essere superficie e diventa atmosfera.",
  },
  {
    slug: "star-k-w-maxi",
    name: "Star K-W Maxi",
    tagline: "Lastre marmo grande formato",
    description:
      "Grandi lastre SPC per rivestimenti a tutta altezza con decori effetto marmo. Eleganza classica unita a praticità: resistente all'acqua, igienico, posabile anche su pareti esistenti. Ideale per bagni, hall hotel, aree di rappresentanza.",
    image: starkWMaxi,
    formats: ["1220×2800 mm", "Spessore 4 mm"],
    finishes: ["Marmo"],
    applicazioni: ["Bagni", "Hall hotel", "Spa", "Ingressi"],
    effectStoryTitle: "Marmo in lastra, senza compromessi",
    effectStory:
      "Star K-W Maxi è il marmo che entra in scena senza fughe, senza tagli, senza interruzioni. Lastre da 1220×2800 mm che restituiscono in scala 1:1 la grandiosità delle pietre più nobili — Calacatta, Bardiglio, Carrara, Orobico — con venature che disegnano paesaggi continui.\n\nLeggero, posabile anche su rivestimenti esistenti, idrorepellente per natura: trasforma bagni in suite, hall in scenografie museali, ingressi in dichiarazioni di stile. Il marmo nella sua versione più ambiziosa, finalmente alla portata di ogni progetto.",
  },
  {
    slug: "k-wood",
    name: "K-Wood",
    tagline: "Ibrido legno e SPC",
    description:
      "Vero pavimento in legno con caratteristiche tecniche dell'SPC. Superficie in legno autentico su supporto rigido, sottile per posa su pavimenti esistenti, resistente all'acqua, con sottofondo in sughero per comfort acustico ottimale.",
    image: starkWood,
    formats: ["190×1860 mm", "Spessore 8 mm"],
    finishes: ["Legno autentico", "Sottofondo sughero"],
    applicazioni: ["Residenziale", "Cucine", "Bagni"],
    effectStoryTitle: "Vero legno, vere prestazioni",
    effectStory:
      "K-Wood non simula il legno: è legno. Una lamella nobile di rovere autentico, spazzolato e oliato, applicata su un supporto SPC che gli regala stabilità assoluta e resistenza all'acqua. Due anime in una sola doga.\n\nLa superficie vive, cambia con la luce, invecchia con grazia come solo il legno vero sa fare. Sotto, lo strato di sughero e il cuore minerale tengono il pavimento perfettamente fermo in ogni stagione. Finalmente il rovere può varcare la porta della cucina e del bagno senza sacrificare nulla della sua autenticità.",
  },
  {
    slug: "k-wood-spina",
    name: "K-Wood Spina",
    tagline: "Spina di pesce ibrida",
    description:
      "Eleganza della spina di pesce classica con taglio a 90°, arricchita dai vantaggi del supporto SPC. La bellezza senza tempo del pattern a spina diventa posabile ovunque: residenziale, hotel, ristoranti, retail.",
    image: starkWoodSpina,
    formats: ["120×600 mm", "Spina italiana 90°", "Spessore 8 mm"],
    finishes: ["Legno autentico", "Sottofondo sughero"],
    applicazioni: ["Residenziale", "Hotel", "Retail"],
    effectStoryTitle: "Spina italiana, prestazioni contemporanee",
    effectStory:
      "K-Wood Spina riprende la spina di pesce italiana — taglio a 90°, geometria rigorosa — e la libera dai vincoli secolari del parquet tradizionale. Sotto la lamella di rovere autentico c'è un cuore SPC che la rende waterproof, dimensionalmente stabile, posabile su pavimenti esistenti.\n\nIl disegno conserva tutta l'energia visiva della spina classica: quel ritmo a zig-zag che dilata gli spazi e cattura lo sguardo, capace di rendere monumentale anche un ingresso minimo. Eleganza senza tempo, finalmente liberata dalle paure dell'acqua e dell'usura.",
  },
  {
    slug: "connex",
    name: "Connex",
    tagline: "Ultra sottile, ultra resistente",
    description:
      "L'SPC più sottile della gamma con spessore 5,5 mm. Reso silenzioso dal sottopavimento preaccoppiato e ultra resistente grazie all'overlay trasparente rinforzato. Pensato per ambienti commerciali ad elevato traffico, facile da pulire.",
    image: connex,
    formats: ["180×1220 mm", "Spessore 5,5 mm"],
    finishes: ["Legno", "Overlay rinforzato"],
    applicazioni: ["Commerciale", "Uffici", "Negozi"],
    effectStoryTitle: "Il rovere che resiste a tutto",
    effectStory:
      "Connex è il pavimento pensato per chi non può permettersi un'esitazione: uffici aperti, negozi affollati, spazi commerciali che vivono dodici ore al giorno. Sotto la superficie effetto rovere c'è un overlay trasparente rinforzato che protegge il decoro da graffi, tacchi, carrelli, sedie a rotelle.\n\nNonostante lo spessore minimo di 5,5 mm, il sottopavimento preaccoppiato assorbe il rumore del calpestio e restituisce un comfort acustico raro nei pavimenti contract. Un legno discreto, caldo, naturalmente vissuto — pronto a invecchiare bene insieme allo spazio che abita.",
  },
];

export const getSpcCollection = (slug: string) =>
  spcCollections.find((c) => c.slug === slug);
