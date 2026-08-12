import heroFornitura from "@/assets/hero-indoor.jpg";
import heroRigenerazione from "@/assets/hero-hypermatt-spina.jpg";
import heroLevigatura from "@/assets/card-parquet-ambient.jpg";

import galFornitura1 from "@/assets/realizzazione-soggiorno-terram.jpg";
import galFornitura2 from "@/assets/realizzazione-cucina-sabbia.jpg";
import galFornitura3 from "@/assets/realizzazione-ufficio-perla-v2.jpg";

import galRigenerazione1 from "@/assets/realizzazione-cucina-floor-focus.jpg";
import galRigenerazione2 from "@/assets/realizzazione-camera-aurora.jpg";
import galRigenerazione3 from "@/assets/realizzazione-hotel-corteccia.jpg";

import galLevigatura1 from "@/assets/hero-indoor-wood.jpg";
import galLevigatura2 from "@/assets/realizzazione-soggiorno-aurora.jpg";
import galLevigatura3 from "@/assets/realizzazione-ristorante-corteccia-v2.jpg";

export type Lang = "it" | "en" | "de" | "fr";

export interface ServizioStep {
  title: string;
  text: string;
}

export interface ServizioContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  intro: string;
  stepsTitle: string;
  steps: ServizioStep[];
  bulletsTitle: string;
  bullets: string[];
  closing: string;
  seoTitle: string;
  seoDescription: string;
}

export interface ServizioPage {
  slug: string;
  hero: string;
  gallery: string[];
  content: Record<Lang, ServizioContent>;
}

export const serviziPages: ServizioPage[] = [
  {
    slug: "fornitura-e-posa",
    hero: heroFornitura,
    gallery: [galFornitura1, galFornitura2, galFornitura3],
    content: {
      it: {
        eyebrow: "Servizio",
        title: "Fornitura e posa pavimenti",
        subtitle: "Biomag, parquet, laminati, LVT-SPC e ceramiche: un unico interlocutore dalla selezione al cantiere finito.",
        intro:
          "Selezioniamo, forniamo e posiamo pavimenti per residenze private, hospitality e spazi commerciali. Gestiamo l'intero processo: sopralluogo, verifica del sottofondo, scelta del materiale, logistica e posa eseguita dalle nostre squadre. Un solo referente, un solo cantiere, una sola responsabilità.",
        stepsTitle: "Come lavoriamo",
        steps: [
          { title: "Sopralluogo e misure", text: "Rilievo delle superfici, verifica di umidità, planarità e quote porte. Definiamo insieme la direzione di posa e gli allineamenti." },
          { title: "Selezione materiale", text: "Campionature in cantiere o in showroom fra BIOMAG FLOOR®, parquet, laminati, LVT-SPC e ceramiche, con confronto su prestazioni, manutenzione e budget." },
          { title: "Preparazione del sottofondo", text: "Rasature, primer, barriere al vapore e materassini acustici: la posa dura quanto il piano su cui appoggia." },
          { title: "Posa professionale", text: "Posa flottante con sistema Välinge 5G, incollata o su massetto radiante, eseguita dalle nostre squadre interne." },
          { title: "Finiture e consegna", text: "Battiscopa, profili, giunti di dilatazione, pulizia finale e consegna con istruzioni di manutenzione." },
        ],
        bulletsTitle: "Cosa comprende",
        bullets: [
          "Sopralluogo tecnico e preventivo dettagliato",
          "Fornitura materiali e accessori di posa",
          "Preparazione e livellamento del sottofondo",
          "Posa su riscaldamento a pavimento",
          "Battiscopa, profili e finiture su misura",
          "Pulizia di fine cantiere e garanzia sulla posa",
        ],
        closing: "Dalla prima misura alla consegna delle chiavi: un unico partner, tempi certi, cantiere pulito.",
        seoTitle: "Fornitura e posa pavimenti — Parquet, LVT-SPC, ceramiche | Kalēa®",
        seoDescription: "Fornitura e posa professionale di pavimenti Biomag, parquet, laminati, LVT-SPC e ceramiche. Sopralluogo, preparazione sottofondo, posa e finiture con squadre interne.",
      },
      en: {
        eyebrow: "Service",
        title: "Floor supply and installation",
        subtitle: "Biomag, wood, laminate, LVT-SPC and ceramics: one partner from selection to finished site.",
        intro:
          "We select, supply and install floors for private homes, hospitality and commercial spaces. We manage the whole process: survey, subfloor check, material selection, logistics and installation by our own crews. One contact, one site, one responsibility.",
        stepsTitle: "How we work",
        steps: [
          { title: "Survey and measurements", text: "Surface survey, moisture, flatness and door clearance checks. We define laying direction and alignments together." },
          { title: "Material selection", text: "Samples on site or in the showroom across BIOMAG FLOOR®, wood, laminate, LVT-SPC and ceramics, comparing performance, maintenance and budget." },
          { title: "Subfloor preparation", text: "Levelling, primers, vapour barriers and acoustic underlays: an installation lasts as long as the base it sits on." },
          { title: "Professional installation", text: "Floating installation with the Välinge 5G system, glue-down or over underfloor heating, carried out by our in-house teams." },
          { title: "Finishes and handover", text: "Skirtings, profiles, expansion joints, final cleaning and handover with maintenance instructions." },
        ],
        bulletsTitle: "What is included",
        bullets: [
          "Technical survey and detailed quotation",
          "Supply of materials and installation accessories",
          "Subfloor preparation and levelling",
          "Installation over underfloor heating",
          "Skirtings, profiles and bespoke finishes",
          "Final site cleaning and installation warranty",
        ],
        closing: "From the first measurement to handover: one partner, reliable timing, a clean site.",
        seoTitle: "Floor supply and installation — Wood, LVT-SPC, ceramics | Kalēa®",
        seoDescription: "Professional supply and installation of Biomag, wood, laminate, LVT-SPC and ceramic floors. Survey, subfloor preparation, installation and finishes by in-house crews.",
      },
      de: {
        eyebrow: "Leistung",
        title: "Lieferung und Verlegung von Böden",
        subtitle: "Biomag, Parkett, Laminat, LVT-SPC und Keramik: ein Ansprechpartner von der Auswahl bis zur fertigen Baustelle.",
        intro:
          "Wir wählen aus, liefern und verlegen Böden für Privathäuser, Hotellerie und Gewerbeflächen. Wir steuern den gesamten Prozess: Aufmaß, Untergrundprüfung, Materialauswahl, Logistik und Verlegung durch eigene Teams. Ein Ansprechpartner, eine Baustelle, eine Verantwortung.",
        stepsTitle: "So arbeiten wir",
        steps: [
          { title: "Aufmaß vor Ort", text: "Flächenaufnahme, Prüfung von Feuchte, Ebenheit und Türhöhen. Verlegerichtung und Ausrichtung legen wir gemeinsam fest." },
          { title: "Materialauswahl", text: "Muster auf der Baustelle oder im Showroom: BIOMAG FLOOR®, Parkett, Laminat, LVT-SPC und Keramik im Vergleich von Leistung, Pflege und Budget." },
          { title: "Untergrundvorbereitung", text: "Spachtelung, Grundierung, Dampfsperren und Trittschalldämmung: eine Verlegung hält so lange wie ihr Untergrund." },
          { title: "Professionelle Verlegung", text: "Schwimmende Verlegung mit Välinge 5G, verklebt oder auf Fußbodenheizung, ausgeführt von unseren eigenen Teams." },
          { title: "Abschluss und Übergabe", text: "Sockelleisten, Profile, Dehnfugen, Endreinigung und Übergabe mit Pflegehinweisen." },
        ],
        bulletsTitle: "Im Leistungsumfang",
        bullets: [
          "Technisches Aufmaß und detailliertes Angebot",
          "Lieferung von Material und Verlegezubehör",
          "Untergrundvorbereitung und Nivellierung",
          "Verlegung auf Fußbodenheizung",
          "Sockelleisten, Profile und Sonderabschlüsse",
          "Endreinigung und Gewährleistung auf die Verlegung",
        ],
        closing: "Vom ersten Aufmaß bis zur Übergabe: ein Partner, verlässliche Termine, saubere Baustelle.",
        seoTitle: "Lieferung und Verlegung von Böden — Parkett, LVT-SPC, Keramik | Kalēa®",
        seoDescription: "Professionelle Lieferung und Verlegung von Biomag-, Parkett-, Laminat-, LVT-SPC- und Keramikböden. Aufmaß, Untergrundvorbereitung, Verlegung und Abschlüsse.",
      },
      fr: {
        eyebrow: "Service",
        title: "Fourniture et pose de sols",
        subtitle: "Biomag, parquet, stratifiés, LVT-SPC et céramiques : un seul interlocuteur, de la sélection au chantier livré.",
        intro:
          "Nous sélectionnons, fournissons et posons des sols pour résidences privées, hôtellerie et espaces commerciaux. Nous gérons tout le processus : visite technique, contrôle du support, choix du matériau, logistique et pose par nos équipes. Un interlocuteur, un chantier, une responsabilité.",
        stepsTitle: "Notre méthode",
        steps: [
          { title: "Visite et relevés", text: "Relevé des surfaces, contrôle de l'humidité, de la planéité et des hauteurs de portes. Sens de pose et alignements définis ensemble." },
          { title: "Sélection du matériau", text: "Échantillons sur chantier ou en showroom : BIOMAG FLOOR®, parquet, stratifiés, LVT-SPC et céramiques, comparés en performance, entretien et budget." },
          { title: "Préparation du support", text: "Ragréage, primaires, pare-vapeur et sous-couches acoustiques : une pose dure autant que son support." },
          { title: "Pose professionnelle", text: "Pose flottante avec système Välinge 5G, collée ou sur plancher chauffant, réalisée par nos équipes internes." },
          { title: "Finitions et livraison", text: "Plinthes, profilés, joints de dilatation, nettoyage final et remise avec consignes d'entretien." },
        ],
        bulletsTitle: "Ce qui est inclus",
        bullets: [
          "Visite technique et devis détaillé",
          "Fourniture des matériaux et accessoires de pose",
          "Préparation et nivellement du support",
          "Pose sur plancher chauffant",
          "Plinthes, profilés et finitions sur mesure",
          "Nettoyage de fin de chantier et garantie de pose",
        ],
        closing: "Du premier relevé à la remise des clés : un seul partenaire, des délais tenus, un chantier propre.",
        seoTitle: "Fourniture et pose de sols — Parquet, LVT-SPC, céramiques | Kalēa®",
        seoDescription: "Fourniture et pose professionnelle de sols Biomag, parquet, stratifiés, LVT-SPC et céramiques. Visite technique, préparation du support, pose et finitions.",
      },
    },
  },
  {
    slug: "rigenerazione-parquet",
    hero: heroRigenerazione,
    gallery: [galRigenerazione1, galRigenerazione2, galRigenerazione3],
    content: {
      it: {
        eyebrow: "Servizio",
        title: "Pulizia professionale e rigenerazione parquet",
        subtitle: "Ridiamo vita ai pavimenti in legno esistenti, senza demolizioni e senza sostituire nulla.",
        intro:
          "Un parquet opaco, ingrigito o segnato non è un pavimento da buttare. Con una pulizia profonda e un ciclo di rigenerazione recuperiamo il colore, la protezione e la texture originale del legno, in pochi giorni e senza rimuovere il pavimento esistente.",
        stepsTitle: "Il ciclo di rigenerazione",
        steps: [
          { title: "Diagnosi del pavimento", text: "Identifichiamo essenza, finitura esistente (olio o vernice), spessore utile e stato di usura con test in zone campione." },
          { title: "Pulizia profonda", text: "Rimozione di residui, cere e film di detergenti stratificati con macchine monospazzola e prodotti specifici per legno." },
          { title: "Riparazioni puntuali", text: "Stuccatura di fughe e piccole fessurazioni, sostituzione di listelli danneggiati, fissaggio di doghe scricchiolanti." },
          { title: "Rigenerazione della finitura", text: "Applicazione di oli rigeneranti o cicli refresh a base acqua che ripristinano protezione e uniformità senza levigatura completa." },
          { title: "Consegna e manutenzione", text: "Consegna del pavimento pronto all'uso con protocollo di pulizia e prodotti consigliati." },
        ],
        bulletsTitle: "Perché rigenerare",
        bullets: [
          "Costo nettamente inferiore alla sostituzione",
          "Nessuna demolizione, nessun cantiere invasivo",
          "Intervento in pochi giorni, spesso senza svuotare gli ambienti",
          "Prodotti a basse emissioni, sicuri per case abitate",
          "Ideale per hotel, ristoranti e uffici in esercizio",
          "Allunga di anni la vita del pavimento esistente",
        ],
        closing: "Prima di sostituire un parquet, vale sempre la pena farlo valutare: nella maggior parte dei casi si può salvare.",
        seoTitle: "Rigenerazione e pulizia professionale parquet | Kalēa®",
        seoDescription: "Pulizia profonda e rigenerazione di parquet esistenti: recupero di colore e protezione senza demolizioni. Interventi rapidi per case, hotel, uffici e ristoranti.",
      },
      en: {
        eyebrow: "Service",
        title: "Professional cleaning and wood floor regeneration",
        subtitle: "We bring existing wood floors back to life, with no demolition and nothing to replace.",
        intro:
          "A dull, greyed or scratched wood floor is not a floor to throw away. With deep cleaning and a regeneration cycle we restore colour, protection and the original texture of the wood in a few days, without removing the existing floor.",
        stepsTitle: "The regeneration cycle",
        steps: [
          { title: "Floor diagnosis", text: "We identify species, existing finish (oil or lacquer), usable thickness and wear through sample-area tests." },
          { title: "Deep cleaning", text: "Removal of residues, waxes and layered detergent films using single-disc machines and wood-specific products." },
          { title: "Spot repairs", text: "Filling of gaps and small cracks, replacement of damaged strips, fixing of squeaking boards." },
          { title: "Finish regeneration", text: "Regenerating oils or water-based refresh cycles that restore protection and evenness without full sanding." },
          { title: "Handover and care", text: "Floor handed over ready to use with a cleaning protocol and recommended products." },
        ],
        bulletsTitle: "Why regenerate",
        bullets: [
          "Far lower cost than replacement",
          "No demolition, no invasive site works",
          "Completed in a few days, often without emptying rooms",
          "Low-emission products, safe for occupied homes",
          "Ideal for hotels, restaurants and offices in operation",
          "Adds years to the life of the existing floor",
        ],
        closing: "Before replacing a wood floor, always have it assessed: in most cases it can be saved.",
        seoTitle: "Wood floor regeneration and professional cleaning | Kalēa®",
        seoDescription: "Deep cleaning and regeneration of existing wood floors: colour and protection restored without demolition. Fast works for homes, hotels, offices and restaurants.",
      },
      de: {
        eyebrow: "Leistung",
        title: "Professionelle Reinigung und Parkettregeneration",
        subtitle: "Wir erwecken bestehende Holzböden zu neuem Leben – ohne Abbruch, ohne Austausch.",
        intro:
          "Ein stumpfes, vergrautes oder zerkratztes Parkett ist kein Fall für den Container. Mit Tiefenreinigung und einem Regenerationszyklus stellen wir Farbe, Schutz und die ursprüngliche Textur des Holzes wieder her – in wenigen Tagen und ohne den Boden zu entfernen.",
        stepsTitle: "Der Regenerationszyklus",
        steps: [
          { title: "Diagnose des Bodens", text: "Bestimmung von Holzart, vorhandener Oberfläche (Öl oder Lack), Nutzschicht und Abnutzung anhand von Musterflächen." },
          { title: "Tiefenreinigung", text: "Entfernung von Rückständen, Wachsen und Reinigerfilmen mit Einscheibenmaschinen und holzspezifischen Produkten." },
          { title: "Punktuelle Reparaturen", text: "Verspachteln von Fugen und feinen Rissen, Austausch beschädigter Stäbe, Fixieren knarrender Dielen." },
          { title: "Regeneration der Oberfläche", text: "Regenerationsöle oder wasserbasierte Refresh-Zyklen, die Schutz und Gleichmäßigkeit ohne komplette Schleifung zurückbringen." },
          { title: "Übergabe und Pflege", text: "Übergabe des nutzbereiten Bodens mit Reinigungsprotokoll und empfohlenen Produkten." },
        ],
        bulletsTitle: "Warum regenerieren",
        bullets: [
          "Deutlich günstiger als ein Austausch",
          "Kein Abbruch, keine invasive Baustelle",
          "Ausführung in wenigen Tagen, oft ohne Räumung",
          "Emissionsarme Produkte, sicher in bewohnten Räumen",
          "Ideal für Hotels, Restaurants und laufende Büros",
          "Verlängert die Lebensdauer des Bodens um Jahre",
        ],
        closing: "Vor dem Austausch lohnt immer eine Bewertung: meist lässt sich das Parkett retten.",
        seoTitle: "Parkettregeneration und professionelle Reinigung | Kalēa®",
        seoDescription: "Tiefenreinigung und Regeneration bestehender Parkettböden: Farbe und Schutz ohne Abbruch. Schnelle Ausführung für Wohnungen, Hotels, Büros und Restaurants.",
      },
      fr: {
        eyebrow: "Service",
        title: "Nettoyage professionnel et rénovation de parquet",
        subtitle: "Nous redonnons vie aux parquets existants, sans démolition ni remplacement.",
        intro:
          "Un parquet terne, grisé ou marqué n'est pas un sol à jeter. Grâce à un nettoyage en profondeur et à un cycle de rénovation, nous récupérons la couleur, la protection et la texture d'origine du bois en quelques jours, sans déposer le sol existant.",
        stepsTitle: "Le cycle de rénovation",
        steps: [
          { title: "Diagnostic du sol", text: "Identification de l'essence, de la finition existante (huile ou vernis), de l'épaisseur utile et de l'usure par zones test." },
          { title: "Nettoyage en profondeur", text: "Élimination des résidus, cires et films de détergents avec monobrosses et produits spécifiques bois." },
          { title: "Réparations ponctuelles", text: "Mastic des joints et microfissures, remplacement de lames abîmées, fixation des lames qui grincent." },
          { title: "Rénovation de la finition", text: "Huiles régénérantes ou cycles refresh à l'eau qui rétablissent protection et uniformité sans ponçage complet." },
          { title: "Livraison et entretien", text: "Sol livré prêt à l'usage avec protocole de nettoyage et produits conseillés." },
        ],
        bulletsTitle: "Pourquoi rénover",
        bullets: [
          "Coût bien inférieur au remplacement",
          "Aucune démolition, chantier non invasif",
          "Intervention en quelques jours, souvent sans vider les pièces",
          "Produits à faibles émissions, sûrs en logement occupé",
          "Idéal pour hôtels, restaurants et bureaux en activité",
          "Prolonge de plusieurs années la vie du sol existant",
        ],
        closing: "Avant de remplacer un parquet, faites-le évaluer : dans la plupart des cas, il peut être sauvé.",
        seoTitle: "Rénovation et nettoyage professionnel de parquet | Kalēa®",
        seoDescription: "Nettoyage en profondeur et rénovation de parquets existants : couleur et protection sans démolition. Interventions rapides pour maisons, hôtels, bureaux et restaurants.",
      },
    },
  },
  {
    slug: "levigatura-verniciatura-oliatura",
    hero: heroLevigatura,
    gallery: [galLevigatura1, galLevigatura2, galLevigatura3],
    content: {
      it: {
        eyebrow: "Servizio",
        title: "Levigatura, verniciatura e oliatura parquet",
        subtitle: "Il ciclo completo a legno nudo per riportare un parquet allo stato di nuovo, con la finitura che scegli tu.",
        intro:
          "Quando l'usura è profonda si torna al legno nudo. Levighiamo con macchine ad aspirazione integrata, quasi senza polvere, e riproteggiamo la superficie con vernici all'acqua o oli naturali. È il momento in cui puoi anche cambiare tono e grado di opacità del pavimento.",
        stepsTitle: "Le fasi di lavorazione",
        steps: [
          { title: "Levigatura", text: "Passaggi progressivi con grane crescenti, bordatura a muro e angoli rifiniti a mano fino a una superficie perfettamente planare." },
          { title: "Stuccatura", text: "Sigillatura di fughe e fessure con impasto ricavato dalla polvere dello stesso legno, per una continuità cromatica reale." },
          { title: "Scelta della finitura", text: "Vernice all'acqua opaca, satinata o lucida, oppure olio-cera naturale. Campioniamo il tono sul posto prima di procedere." },
          { title: "Applicazione", text: "Due o tre mani con carteggiature intermedie; oli applicati e lucidati a macchina per una penetrazione uniforme." },
          { title: "Asciugatura e consegna", text: "Tempi di calpestio e di ripristino arredi comunicati in anticipo, con indicazioni di manutenzione della nuova finitura." },
        ],
        bulletsTitle: "Punti di forza",
        bullets: [
          "Levigatura ad aspirazione, praticamente senza polvere",
          "Possibilità di cambiare colore e grado di opacità",
          "Vernici all'acqua a bassissime emissioni",
          "Oli naturali riparabili localmente nel tempo",
          "Adatto a parquet massello e prefiniti con nobile adeguato",
          "Cantiere organizzato per fasi in case e attività abitate",
        ],
        closing: "Un solo ciclo di levigatura può valere altri dieci anni di vita del pavimento.",
        seoTitle: "Levigatura, verniciatura e oliatura parquet | Kalēa®",
        seoDescription: "Levigatura parquet senza polvere, verniciatura all'acqua e oliatura naturale. Ciclo completo a legno nudo con scelta di tono e grado di opacità.",
      },
      en: {
        eyebrow: "Service",
        title: "Wood floor sanding, lacquering and oiling",
        subtitle: "The full bare-wood cycle that brings a floor back to new, with the finish you choose.",
        intro:
          "When wear runs deep, we go back to bare wood. We sand with integrated extraction machines, virtually dust-free, and re-protect the surface with water-based lacquers or natural oils. This is also the moment to change the tone and sheen of your floor.",
        stepsTitle: "Work stages",
        steps: [
          { title: "Sanding", text: "Progressive grit passes, edge sanding along walls and hand-finished corners until the surface is perfectly flat." },
          { title: "Filling", text: "Gaps and cracks sealed with a paste made from the dust of the same wood, for true colour continuity." },
          { title: "Choosing the finish", text: "Matt, satin or gloss water-based lacquer, or natural oil-wax. We sample the tone on site before proceeding." },
          { title: "Application", text: "Two or three coats with intermediate sanding; oils applied and buffed by machine for even penetration." },
          { title: "Drying and handover", text: "Walk-on and furniture times communicated in advance, with care instructions for the new finish." },
        ],
        bulletsTitle: "Key benefits",
        bullets: [
          "Dust-extraction sanding, virtually dust-free",
          "Option to change colour and sheen level",
          "Water-based lacquers with very low emissions",
          "Natural oils that can be spot-repaired over time",
          "Suitable for solid and engineered floors with adequate wear layer",
          "Phased works for occupied homes and businesses",
        ],
        closing: "A single sanding cycle can add another ten years to the life of your floor.",
        seoTitle: "Wood floor sanding, lacquering and oiling | Kalēa®",
        seoDescription: "Dust-free wood floor sanding, water-based lacquering and natural oiling. Full bare-wood cycle with your choice of tone and sheen.",
      },
      de: {
        eyebrow: "Leistung",
        title: "Parkett schleifen, lackieren und ölen",
        subtitle: "Der komplette Zyklus bis aufs rohe Holz – mit der Oberfläche, die Sie wählen.",
        intro:
          "Bei tiefer Abnutzung gehen wir zurück aufs rohe Holz. Wir schleifen mit Maschinen mit integrierter Absaugung nahezu staubfrei und schützen die Fläche neu mit Wasserlacken oder Naturölen. Jetzt lassen sich auch Farbton und Glanzgrad verändern.",
        stepsTitle: "Arbeitsschritte",
        steps: [
          { title: "Schleifen", text: "Aufeinanderfolgende Körnungen, Randschliff an den Wänden und handverputzte Ecken bis zur perfekt ebenen Fläche." },
          { title: "Spachtelung", text: "Fugen und Risse werden mit einer Masse aus dem Staub desselben Holzes geschlossen – für echte Farbkontinuität." },
          { title: "Wahl der Oberfläche", text: "Wasserlack matt, seidenmatt oder glänzend oder natürliches Öl-Wachs. Den Ton bemustern wir vorab vor Ort." },
          { title: "Auftrag", text: "Zwei bis drei Aufträge mit Zwischenschliff; Öle maschinell aufgetragen und poliert für gleichmäßiges Eindringen." },
          { title: "Trocknung und Übergabe", text: "Begehbarkeit und Möblierungszeiten werden vorab kommuniziert, inklusive Pflegehinweisen." },
        ],
        bulletsTitle: "Stärken",
        bullets: [
          "Schleifen mit Absaugung, nahezu staubfrei",
          "Farbton und Glanzgrad frei wählbar",
          "Wasserlacke mit sehr geringen Emissionen",
          "Naturöle, punktuell reparierbar",
          "Für Massiv- und Fertigparkett mit ausreichender Nutzschicht",
          "Phasenweise Ausführung in bewohnten Objekten",
        ],
        closing: "Ein einziger Schleifzyklus kann dem Boden weitere zehn Jahre schenken.",
        seoTitle: "Parkett schleifen, lackieren und ölen | Kalēa®",
        seoDescription: "Staubfreies Parkettschleifen, Wasserlackierung und Naturölung. Kompletter Zyklus bis aufs rohe Holz mit freier Wahl von Farbton und Glanzgrad.",
      },
      fr: {
        eyebrow: "Service",
        title: "Ponçage, vitrification et huilage de parquet",
        subtitle: "Le cycle complet jusqu'au bois nu pour retrouver un parquet comme neuf, avec la finition de votre choix.",
        intro:
          "Quand l'usure est profonde, on revient au bois nu. Nous ponçons avec des machines à aspiration intégrée, quasiment sans poussière, puis nous protégeons la surface avec des vitrificateurs à l'eau ou des huiles naturelles. C'est aussi le moment de changer la teinte et le degré de brillance.",
        stepsTitle: "Les étapes",
        steps: [
          { title: "Ponçage", text: "Passages progressifs par grains croissants, bordure le long des murs et angles finis à la main jusqu'à une surface parfaitement plane." },
          { title: "Mastic", text: "Joints et fissures comblés avec une pâte issue de la poussière du même bois, pour une continuité chromatique réelle." },
          { title: "Choix de la finition", text: "Vitrificateur à l'eau mat, satiné ou brillant, ou huile-cire naturelle. Nous échantillonnons la teinte sur place." },
          { title: "Application", text: "Deux à trois couches avec égrenages intermédiaires ; huiles appliquées et lustrées à la machine pour une pénétration homogène." },
          { title: "Séchage et livraison", text: "Délais de circulation et de remise du mobilier communiqués à l'avance, avec consignes d'entretien." },
        ],
        bulletsTitle: "Points forts",
        bullets: [
          "Ponçage avec aspiration, quasiment sans poussière",
          "Possibilité de changer teinte et brillance",
          "Vitrificateurs à l'eau à très faibles émissions",
          "Huiles naturelles réparables localement",
          "Adapté aux parquets massifs et contrecollés à parement suffisant",
          "Chantier par phases en logement ou activité occupée",
        ],
        closing: "Un seul cycle de ponçage peut offrir dix années de vie supplémentaires au parquet.",
        seoTitle: "Ponçage, vitrification et huilage de parquet | Kalēa®",
        seoDescription: "Ponçage de parquet sans poussière, vitrification à l'eau et huilage naturel. Cycle complet jusqu'au bois nu avec choix de teinte et de brillance.",
      },
    },
  },
];

export const getServizioBySlug = (slug?: string) =>
  serviziPages.find((s) => s.slug === slug);
