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

export interface CaratteristicaSpc {
  label: string;
  description: string;
}

export interface SpcCollection {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  formats: string[];
  finishes: string[];
  applicazioni: string[];
  caratteristiche?: CaratteristicaSpc[];
  effectStory?: string;
  effectStoryTitle?: string;
}

export const spcCollections: SpcCollection[] = [
  {
    slug: "star-k",
    name: "Star K",
    tagline: "Effetto legno, waterproof e grandi dimensioni",
    description:
      "Best seller di Skema, Star K è un pavimento con decoro legno e doghe di grandi dimensioni dall'eccellente stabilità dimensionale. Molto resistente all'usura, è ideale per ambienti ad alta frequentazione. Totalmente waterproof e antiscivolo, può essere posato in ambienti come bagni, spa e palestre.",
    image: stark,
    formats: ["1829×218 mm", "Spessore 6 mm"],
    finishes: ["Legno", "Antiscivolo", "Waterproof"],
    applicazioni: ["Residenziale", "Hotel", "Wellness", "Retail"],
    caratteristiche: [
      {
        label: "Grande formato",
        description:
          "Il formato maxi listone permette di ricreare anche nella posa la bellezza dei pavimenti in legno.",
      },
      {
        label: "Waterproof",
        description:
          "La superficie totalmente resistente all'acqua è perfetta per bagni e ambienti umidi.",
      },
      {
        label: "Stabilità dimensionale",
        description:
          "La doga è molto stabile anche se sottoposta a forti sbalzi di temperatura, senza deformarsi o dilatarsi.",
      },
    ],
    effectStoryTitle: "Un legno ampio, sicuro, infinito",
    effectStory:
      "Star K racconta il legno nella sua dimensione più generosa. Doghe extra-large che disegnano superfici continue, dove la venatura corre senza interruzioni e gli ambienti respirano un'aria più calma, più architettonica.\n\nLa superficie ultra matt restituisce il tocco caldo del rovere naturale, mentre la struttura SPC garantisce stabilità dimensionale assoluta: il pavimento non teme l'acqua, i passaggi intensi, gli sbalzi termici. È il legno che desideri ovunque — anche dove non avresti mai osato posarlo.",
  },
  {
    slug: "star-k-r",
    name: "Star K-R",
    tagline: "Pavimento tecnico dall'estetica ricercata",
    description:
      "Star KR è la collezione con tecnologia a registro applicata sulla superficie che aumenta il realismo dei pavimenti effetto legno. L'estetica accurata è enfatizzata dalla superficie ultra matt, dai cromatismi perfetti e dalla naturalità delle finiture nette e senza nodi. A tutto ciò si uniscono le elevate prestazioni dell'SPC: waterproof, stabilità dimensionale, sottopavimento acustico preaccoppiato e antiscivolo.",
    image: starkR,
    formats: ["1829×228 mm", "Spessore 6 mm"],
    finishes: ["Legno", "Ultra matt", "Registro superficie"],
    applicazioni: ["Residenziale alto", "Hospitality", "Contract"],
    caratteristiche: [
      {
        label: "Estetica ultra realistica",
        description:
          "La tecnologia sincroporo permette di avere una riproduzione accurata e realistica delle venature e dei nodi del legno, anche al tatto.",
      },
      {
        label: "Effetto matt",
        description:
          "La superficie è altamente definita e con effetto verniciato opaco.",
      },
      {
        label: "Spessore ridotto",
        description:
          "Ideale per le ristrutturazioni, anche su pavimenti esistenti.",
      },
    ],
    effectStoryTitle: "Il realismo del legno, alla perfezione",
    effectStory:
      "Star K-R porta la tecnologia del registro in superficie a un livello quasi tattile: ogni venatura del decoro si allinea perfettamente alla micro-spazzolatura fisica della superficie. Il risultato è un'illusione che inganna l'occhio e la mano.\n\nLa finitura ultra matt assorbe la luce come solo il legno naturale sa fare, eliminando ogni effetto plastico. Cromatismi profondi, nodi appena accennati, sfumature autentiche: un pavimento pensato per chi pretende il calore del rovere senza alcun compromesso prestazionale.",
  },
  {
    slug: "star-k-c",
    name: "Star K-C",
    tagline: "Elevato comfort termico e acustico",
    description:
      "Star KC è il pavimento in SPC con sottofondo in sughero che sintetizza design, stabilità, resistenza all'acqua, isolamento acustico e calore, in un pavimento di facile installazione. Il sottopavimento in sughero naturale regala una sensazione di comfort e di calore uniche. La combinazione SPC-sughero è ideale quando si vuole rinnovare rapidamente gli ambienti e allo stesso tempo migliorare l'efficientamento energetico e l'isolamento acustico.",
    image: starkC,
    formats: ["1500×228 mm", "Spessore 6 mm"],
    finishes: ["Legno", "Sottofondo sughero"],
    applicazioni: ["Residenziale", "Uffici", "Ristrutturazioni"],
    caratteristiche: [
      {
        label: "Maggiore comfort",
        description:
          "Grazie al sottofondo in sughero, il pavimento regala maggiore isolamento acustico e termico, oltre ad una sensazione di comfort al calpestio.",
      },
      {
        label: "Facilità di posa",
        description:
          "L'incastro PLS garantisce la tenuta della chiusura con un effetto meccanico a forcella lungo tutta la lunghezza dell'incastro, per una posa più rapida e facile.",
      },
      {
        label: "Waterproof",
        description:
          "La superficie totalmente resistente all'acqua è perfetta per bagni e ambienti umidi.",
      },
    ],
    effectStoryTitle: "Il silenzio caldo del sughero",
    effectStory:
      "Star K-C nasce dall'incontro tra due materie nobili: la stabilità dell'SPC e la morbidezza naturale del sughero. Camminare su questo pavimento è un'esperienza diversa — il passo è ovattato, la pianta del piede percepisce un calore vivo, ogni rumore si attenua.\n\nL'effetto legno in superficie mantiene tutta l'espressività del rovere contemporaneo: doghe ampie, finitura opaca, venature definite. Sotto, lo strato di sughero lavora in silenzio per restituire alla casa quel comfort acustico e termico che troppo spesso viene sacrificato in nome della praticità.",
  },
  {
    slug: "star-k-s",
    name: "Star K-S",
    tagline: "Totale resistenza all'acqua in formato spina",
    description:
      "Star KS è il pavimento in SPC con disegno a spina francese, dal design raffinato e performance superiori, ideale per spazi pubblici che non rinunciano all'estetica. Resistente all'acqua, sottile e con elevata resistenza al fuoco, la superficie si caratterizza per il micro bisello sui 4 lati e la tecnologia end-less del disegno che risulta sincronizzato, permettendo di semplificare la posa e al contempo creando un effetto di continuità dove le doghe si susseguono, senza stacchi.",
    image: starkS,
    formats: ["1498×300 mm", "Spina francese", "Spessore 6 mm"],
    finishes: ["Legno", "Micro-bisello 4 lati"],
    applicazioni: ["Spazi pubblici", "Boutique", "Residenziale design"],
    caratteristiche: [
      {
        label: "Decoro a spina",
        description:
          "L'SPC proposto nell'elegante disegno a spina di pesce francese.",
      },
      {
        label: "Effetto endless",
        description:
          "Disegno con tecnologia endless che risulta sincronizzato per un effetto visivo senza stacchi e una posa semplificata.",
      },
      {
        label: "Waterproof",
        description:
          "La superficie totalmente resistente all'acqua è perfetta per bagni e ambienti umidi.",
      },
    ],
    effectStoryTitle: "La spina francese, reinterpretata",
    effectStory:
      "Star K-S riprende uno dei pattern più nobili della tradizione parquettistica europea — la spina francese, tagliata a 45° — e lo traduce in una superficie SPC ad alta resa estetica. Le doghe si incontrano in diagonali precise, generando movimento e profondità in ogni ambiente.\n\nLa tecnologia end-less sincronizza il disegno del legno tra elemento ed elemento: nessun salto, nessuna ripetizione visibile. Il micro-bisello sui quattro lati definisce ogni doga senza appesantirla, restituendo quella raffinatezza artigianale che rende la spina francese sinonimo di eleganza senza tempo.",
  },
  {
    slug: "star-k-d",
    name: "Star K-D",
    tagline: "Estetica contemporanea e praticità senza compromessi",
    description:
      "Star KD è pensato per chi ama l'estetica della pietra, del cemento e del metallo, ma non vuole rinunciare alla sensazione di calore tipica dei pavimenti SPC. In formato tiles, è un pavimento che si ispira all'industrial design e offre un'estetica contemporanea e un comfort senza compromessi. Waterproof, è perfetto anche per creare bagni senza fughe e total look, grazie ai decorativi che si matchano con i rivestimenti per pareti Star KW.",
    image: starkD,
    formats: ["914×457 mm", "Spessore 6 mm"],
    finishes: ["Pietra", "Cemento", "Metallo"],
    applicazioni: ["Uffici", "Bagni", "Retail", "Wellness"],
    caratteristiche: [
      {
        label: "Decoro materico",
        description:
          "Effetto pietra, cemento e metallo: ideale per ambienti contemporanei.",
      },
      {
        label: "Total look",
        description:
          "Perfetto abbinamento con i decori del rivestimento a parete Star KW.",
      },
      {
        label: "Waterproof",
        description:
          "La superficie totalmente resistente all'acqua è perfetta per bagni e ambienti umidi.",
      },
    ],
    effectStoryTitle: "Mineralità urbana, comfort domestico",
    effectStory:
      "Star K-D porta in casa l'estetica delle superfici minerali — pietra grezza, cemento spatolato, ossidi metallici — senza la freddezza tipica dei materiali da cui prende ispirazione. Sotto i piedi il calore resta, l'acustica si addolcisce, il passo è elastico.\n\nIl formato tile rettangolare apre nuove possibilità compositive: posa diritta per ambienti rigorosi, sfalsata per dinamismo contemporaneo, total look se coordinata al rivestimento Star K-W. Una superficie che cancella i confini tra pavimento, parete, residenziale e contract.",
  },
  {
    slug: "star-k-w",
    name: "Star K-W",
    tagline: "Leggero e resistente all'acqua, ideale per bagni senza fughe",
    description:
      "Star KW è un rivestimento a parete in SPC a basso spessore, con decorativi effetto pietra e cemento in formato tiles, coordinati con i pavimenti Star KD. Ideale per rivestire le pareti anche di bagni e docce, permette di ristrutturare ambienti dove l'acqua è protagonista con uno stile contemporaneo, total look e senza fughe.",
    image: starkW,
    formats: ["1210×457 mm", "Spessore 4 mm"],
    finishes: ["Pietra", "Cemento"],
    applicazioni: ["Bagni", "Docce", "Spa", "Hall"],
    caratteristiche: [
      {
        label: "Spessore ridotto",
        description:
          "Il basso spessore permette di posare Star KW anche su rivestimenti esistenti, per ristrutturazioni rapide.",
      },
      {
        label: "Waterproof",
        description:
          "La superficie totalmente resistente all'acqua è perfetta per bagni e ambienti umidi, anche per rivestire le pareti delle docce.",
      },
      {
        label: "Total look",
        description:
          "Perfetto abbinamento con i decori del pavimento Star KD.",
      },
    ],
    effectStoryTitle: "La parete che continua il pavimento",
    effectStory:
      "Star K-W nasce per liberare la parete dalle fughe e dal vincolo della ceramica. Lastre SPC sottili, posabili anche dentro la doccia, che propongono in verticale gli stessi effetti pietra e cemento del pavimento Star K-D.\n\nIl risultato è un total look continuo, materico, contemporaneo: bagni che respirano come spa, hall che si trasformano in scenografie minerali, docce che diventano nicchie monolitiche. Una rivoluzione silenziosa, dove la parete smette di essere superficie e diventa atmosfera.",
  },
  {
    slug: "star-k-w-maxi",
    name: "Star K-W Maxi",
    tagline: "Un effetto marmo ultra realistico, leggero e super pratico",
    description:
      "Star KW Maxi è la scelta ideale per chi ama lo stile classico e ricerca l'eleganza del marmo, ma non rinuncia alla praticità, con l'SPC che è un materiale totalmente resistente all'acqua, igienico e facile da pulire. Queste grandi lastre sono state pensate per rivestire a tutta altezza bagni, docce, spa, aree benessere, ma anche hall di hotel, ingressi e aree di rappresentanza con eleganti decori effetto marmo ma che sono al contempo leggeri e facili da posare, anche su pareti già piastrellate.",
    image: starkWMaxi,
    formats: ["2800×950 mm", "Spessore 4 mm"],
    finishes: ["Marmo", "Graniglia"],
    applicazioni: ["Bagni", "Hall hotel", "Spa", "Ingressi"],
    caratteristiche: [
      {
        label: "Effetto marmo",
        description: "Eleganti lastre di grandi dimensioni dall'effetto marmo.",
      },
      {
        label: "Leggero e pratico da posare",
        description:
          "Leggero, pratico da trasportare e facile da posare, anche su rivestimenti già esistenti.",
      },
      {
        label: "Maxi formato",
        description:
          "Le lastre di grandi dimensioni permettono di rivestire a tutta altezza gli ambienti, compresi bagni, docce, spa, grazie alla sua totale resistenza all'acqua.",
      },
    ],
    effectStoryTitle: "Marmo in lastra, senza compromessi",
    effectStory:
      "Star K-W Maxi è il marmo che entra in scena senza fughe, senza tagli, senza interruzioni. Lastre da 2800×950 mm che restituiscono in scala 1:1 la grandiosità delle pietre più nobili — Calacatta, Bardiglio, Carrara, Orobico — con venature che disegnano paesaggi continui.\n\nLeggero, posabile anche su rivestimenti esistenti, idrorepellente per natura: trasforma bagni in suite, hall in scenografie museali, ingressi in dichiarazioni di stile. Il marmo nella sua versione più ambiziosa, finalmente alla portata di ogni progetto.",
  },
  {
    slug: "k-wood",
    name: "K-Wood",
    tagline: "L'ibrido legno e SPC",
    description:
      "K-Wood è il pavimento in legno che posi in qualsiasi ambiente, più igienico, più confortevole e più resistente. La sua natura ibrida permette di avere un pavimento in legno con le caratteristiche tecniche dell'SPC. Sottile, per essere posato su pavimenti esistenti, resistente all'acqua, ideale anche in bagno o in cucina, con sottofondo in sughero per un miglior comfort acustico.",
    image: starkWood,
    formats: ["1900×190 mm", "Spessore 7 mm"],
    finishes: ["Legno autentico", "Sottofondo sughero"],
    applicazioni: ["Residenziale", "Cucine", "Bagni"],
    caratteristiche: [
      {
        label: "Ibrido",
        description:
          "Autentico effetto legno con tecnologia SPC e sottofondo in sughero.",
      },
      {
        label: "Spessore ridotto",
        description:
          "Ideale per le ristrutturazioni, anche su pavimenti esistenti.",
      },
      {
        label: "Superficie silenziosa",
        description:
          "Il sottopavimento in sughero migliora l'isolamento acustico.",
      },
    ],
    effectStoryTitle: "Vero legno, vere prestazioni",
    effectStory:
      "K-Wood non simula il legno: è legno. Una lamella nobile di rovere autentico, spazzolato e oliato, applicata su un supporto SPC che gli regala stabilità assoluta e resistenza all'acqua. Due anime in una sola doga.\n\nLa superficie vive, cambia con la luce, invecchia con grazia come solo il legno vero sa fare. Sotto, lo strato di sughero e il cuore minerale tengono il pavimento perfettamente fermo in ogni stagione. Finalmente il rovere può varcare la porta della cucina e del bagno senza sacrificare nulla della sua autenticità.",
  },
  {
    slug: "k-wood-spina",
    name: "K-Wood Spina",
    tagline: "Il pattern più elegante in versione ibrida e super resistente",
    description:
      "L'eleganza della spina si fa ibrida e resistente con K-Wood Spina. Il disegno della spina classica con taglio a 90° si arricchisce di tutti i vantaggi della struttura in SPC, per posare la bellezza senza tempo della spina di pesce in tutti gli ambienti, non solo domestici, ma anche pubblici, come hotel, ristoranti e negozi.",
    image: starkWoodSpina,
    formats: ["600×100 mm", "Spina italiana 90°", "Spessore 7 mm"],
    finishes: ["Legno autentico", "Sottofondo sughero"],
    applicazioni: ["Residenziale", "Hotel", "Retail"],
    caratteristiche: [
      {
        label: "Decoro a spina",
        description:
          "Disponibile nella versione spina classica con taglio a 90°.",
      },
      {
        label: "Spessore ridotto",
        description:
          "Ideale per le ristrutturazioni, anche su pavimenti esistenti.",
      },
      {
        label: "Ibrido",
        description:
          "Autentico effetto legno con tecnologia SPC e sottofondo in sughero.",
      },
    ],
    effectStoryTitle: "Spina italiana, prestazioni contemporanee",
    effectStory:
      "K-Wood Spina riprende la spina di pesce italiana — taglio a 90°, geometria rigorosa — e la libera dai vincoli secolari del parquet tradizionale. Sotto la lamella di rovere autentico c'è un cuore SPC che la rende waterproof, dimensionalmente stabile, posabile su pavimenti esistenti.\n\nIl disegno conserva tutta l'energia visiva della spina classica: quel ritmo a zig-zag che dilata gli spazi e cattura lo sguardo, capace di rendere monumentale anche un ingresso minimo. Eleganza senza tempo, finalmente liberata dalle paure dell'acqua e dell'usura.",
  },
  {
    slug: "connex",
    name: "Connex",
    tagline: "Il pavimento ultra sottile e ultra resistente",
    description:
      "Connex è un unicum della gamma SPC. Reso flessibile dallo spessore ridotto di 5,5 mm e silenzioso dal sottopavimento preaccoppiato, è l'SPC più sottile della gamma ma anche tra i più resistenti, grazie all'overlay trasparente rinforzato applicato sulla superficie, che ne permette l'impiego in ambienti commerciali ad elevato traffico e lo rende facile da pulire.",
    image: connex,
    formats: ["1500×180 mm", "Spessore 5,5 mm"],
    finishes: ["Legno", "Overlay rinforzato"],
    applicazioni: ["Commerciale", "Uffici", "Negozi"],
    caratteristiche: [
      {
        label: "Ultra sottile",
        description:
          "Spessore ridotto a soli 5,5 mm, ideale per ristrutturazioni rapide con sovrapposizione su pavimenti esistenti.",
      },
      {
        label: "Resistente al calpestio",
        description:
          "La resistenza della superficie è maggiore, grazie all'overlay rinforzato, tale da avere la classe massima di resistenza al traffico da calpestio.",
      },
      {
        label: "Incastro ad alta tenuta",
        description:
          "L'incastro 5G ad alta tenuta rende la posa più rapida e semplice.",
      },
    ],
    effectStoryTitle: "Il rovere che resiste a tutto",
    effectStory:
      "Connex è il pavimento pensato per chi non può permettersi un'esitazione: uffici aperti, negozi affollati, spazi commerciali che vivono dodici ore al giorno. Sotto la superficie effetto rovere c'è un overlay trasparente rinforzato che protegge il decoro da graffi, tacchi, carrelli, sedie a rotelle.\n\nNonostante lo spessore minimo di 5,5 mm, il sottopavimento preaccoppiato assorbe il rumore del calpestio e restituisce un comfort acustico raro nei pavimenti contract. Un legno discreto, caldo, naturalmente vissuto — pronto a invecchiare bene insieme allo spazio che abita.",
  },
];

export const getSpcCollection = (slug: string) =>
  spcCollections.find((c) => c.slug === slug);
