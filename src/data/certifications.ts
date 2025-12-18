export interface Certification {
  id: string;
  characteristic: {
    it: string;
    en: string;
    de: string;
    fr: string;
  };
  performance: string;
  standard: string;
  tooltip: {
    it: string;
    en: string;
    de: string;
    fr: string;
  };
}

export const certifications: Certification[] = [
  {
    id: 'fire-reaction',
    characteristic: {
      it: 'Reazione al fuoco',
      en: 'Fire reaction',
      de: 'Brandverhalten',
      fr: 'Réaction au feu',
    },
    performance: 'Bfl-s1 / Cfl-s1',
    standard: 'EN 13501-1',
    tooltip: {
      it: 'Bfl-s1 – Classe europea di sicurezza per interni. Indica materiale a bassa infiammabilità con produzione di fumo minima.',
      en: 'Bfl-s1 – European safety class for interiors. Indicates low flammability material with minimal smoke production.',
      de: 'Bfl-s1 – Europäische Sicherheitsklasse für Innenräume. Zeigt Material mit geringer Entflammbarkeit und minimaler Rauchentwicklung an.',
      fr: 'Bfl-s1 – Classe de sécurité européenne pour intérieurs. Indique un matériau à faible inflammabilité avec production de fumée minimale.',
    },
  },
  {
    id: 'formaldehyde',
    characteristic: {
      it: 'Emissione di formaldeide',
      en: 'Formaldehyde emission',
      de: 'Formaldehydemission',
      fr: 'Émission de formaldéhyde',
    },
    performance: 'Classe E1',
    standard: 'EN 717-1',
    tooltip: {
      it: 'E1 – Livello più basso di emissione di formaldeide consentito dalla normativa europea. Garantisce ambienti salubri.',
      en: 'E1 – Lowest formaldehyde emission level allowed by European regulations. Ensures healthy environments.',
      de: 'E1 – Niedrigste von europäischen Vorschriften erlaubte Formaldehydemissionsstufe. Gewährleistet gesunde Umgebungen.',
      fr: 'E1 – Niveau d\'émission de formaldéhyde le plus bas autorisé par la réglementation européenne. Garantit des environnements sains.',
    },
  },
  {
    id: 'slip-resistance',
    characteristic: {
      it: 'Resistenza allo scivolamento',
      en: 'Slip resistance',
      de: 'Rutschfestigkeit',
      fr: 'Résistance au glissement',
    },
    performance: 'DS',
    standard: 'EN 13893',
    tooltip: {
      it: 'DS – Coefficiente di attrito dinamico conforme per uso residenziale e commerciale. Sicurezza al calpestio.',
      en: 'DS – Dynamic friction coefficient compliant for residential and commercial use. Safe to walk on.',
      de: 'DS – Dynamischer Reibungskoeffizient für Wohn- und Gewerbenutzung. Sicher beim Begehen.',
      fr: 'DS – Coefficient de friction dynamique conforme pour usage résidentiel et commercial. Sécurité au passage.',
    },
  },
  {
    id: 'water-absorption',
    characteristic: {
      it: 'Assorbimento d\'acqua',
      en: 'Water absorption',
      de: 'Wasseraufnahme',
      fr: 'Absorption d\'eau',
    },
    performance: '≈ 0%',
    standard: 'EN ISO 62',
    tooltip: {
      it: 'Assorbimento d\'acqua praticamente nullo. Ideale per bagni, cucine e ambienti umidi.',
      en: 'Practically zero water absorption. Ideal for bathrooms, kitchens and humid environments.',
      de: 'Praktisch keine Wasseraufnahme. Ideal für Badezimmer, Küchen und feuchte Umgebungen.',
      fr: 'Absorption d\'eau pratiquement nulle. Idéal pour salles de bains, cuisines et environnements humides.',
    },
  },
  {
    id: 'dimensional-stability',
    characteristic: {
      it: 'Stabilità dimensionale',
      en: 'Dimensional stability',
      de: 'Dimensionsstabilität',
      fr: 'Stabilité dimensionnelle',
    },
    performance: '≤ 0,15%',
    standard: 'EN ISO 23997',
    tooltip: {
      it: 'Variazione dimensionale minima. Il pavimento non si espande né si contrae con le temperature.',
      en: 'Minimal dimensional variation. The floor does not expand or contract with temperature changes.',
      de: 'Minimale Dimensionsschwankung. Der Boden dehnt sich nicht aus oder zieht sich bei Temperaturänderungen zusammen.',
      fr: 'Variation dimensionnelle minimale. Le sol ne se dilate ni ne se contracte avec les changements de température.',
    },
  },
  {
    id: 'humidity-stability',
    characteristic: {
      it: 'Stabilità dimensionale (umidità)',
      en: 'Dimensional stability (humidity)',
      de: 'Dimensionsstabilität (Feuchtigkeit)',
      fr: 'Stabilité dimensionnelle (humidité)',
    },
    performance: 'Conforme',
    standard: 'EN ISO 23999 / EN 434',
    tooltip: {
      it: 'Resistenza alle variazioni di umidità. Perfetto per ambienti con condizioni climatiche variabili.',
      en: 'Resistant to humidity variations. Perfect for environments with variable climate conditions.',
      de: 'Beständig gegen Feuchtigkeitsschwankungen. Perfekt für Umgebungen mit variablen Klimabedingungen.',
      fr: 'Résistant aux variations d\'humidité. Parfait pour les environnements aux conditions climatiques variables.',
    },
  },
  {
    id: 'wear-resistance',
    characteristic: {
      it: 'Resistenza all\'usura',
      en: 'Wear resistance',
      de: 'Verschleißfestigkeit',
      fr: 'Résistance à l\'usure',
    },
    performance: 'Classe T',
    standard: 'EN 660-2',
    tooltip: {
      it: 'Classe T – Massima resistenza all\'usura. Adatto a traffico intenso commerciale e residenziale.',
      en: 'Class T – Maximum wear resistance. Suitable for heavy commercial and residential traffic.',
      de: 'Klasse T – Maximale Verschleißfestigkeit. Geeignet für starken gewerblichen und privaten Verkehr.',
      fr: 'Classe T – Résistance maximale à l\'usure. Convient au trafic commercial et résidentiel intensif.',
    },
  },
  {
    id: 'residual-indentation',
    characteristic: {
      it: 'Impronta residua',
      en: 'Residual indentation',
      de: 'Resteindrucktiefe',
      fr: 'Empreinte résiduelle',
    },
    performance: '≤ 0,10 mm',
    standard: 'EN ISO 24343-1',
    tooltip: {
      it: 'Recupero quasi totale dopo pressione. Mobili pesanti non lasciano segni permanenti.',
      en: 'Almost total recovery after pressure. Heavy furniture does not leave permanent marks.',
      de: 'Fast vollständige Erholung nach Druck. Schwere Möbel hinterlassen keine dauerhaften Spuren.',
      fr: 'Récupération presque totale après pression. Les meubles lourds ne laissent pas de marques permanentes.',
    },
  },
  {
    id: 'use-classes',
    characteristic: {
      it: 'Classi di utilizzo',
      en: 'Use classes',
      de: 'Nutzungsklassen',
      fr: 'Classes d\'utilisation',
    },
    performance: 'Classe 23 / 33',
    standard: 'EN ISO 10874',
    tooltip: {
      it: 'Classe 23 residenziale intensivo + Classe 33 commerciale intensivo. Massima versatilità applicativa.',
      en: 'Class 23 intensive residential + Class 33 intensive commercial. Maximum application versatility.',
      de: 'Klasse 23 intensive Wohnnutzung + Klasse 33 intensive Gewerbenutzung. Maximale Anwendungsvielseitigkeit.',
      fr: 'Classe 23 résidentiel intensif + Classe 33 commercial intensif. Polyvalence d\'application maximale.',
    },
  },
  {
    id: 'liquid-resistance',
    characteristic: {
      it: 'Resistenza ai liquidi',
      en: 'Liquid resistance',
      de: 'Flüssigkeitsbeständigkeit',
      fr: 'Résistance aux liquides',
    },
    performance: 'Conforme',
    standard: 'EN ISO 175',
    tooltip: {
      it: 'Resistente a sostanze chimiche comuni e liquidi domestici. Facile manutenzione quotidiana.',
      en: 'Resistant to common chemicals and household liquids. Easy daily maintenance.',
      de: 'Beständig gegen gängige Chemikalien und Haushaltsflüssigkeiten. Einfache tägliche Pflege.',
      fr: 'Résistant aux produits chimiques courants et aux liquides ménagers. Entretien quotidien facile.',
    },
  },
  {
    id: 'underfloor-heating',
    characteristic: {
      it: 'Compatibilità riscaldamento a pavimento',
      en: 'Underfloor heating compatibility',
      de: 'Fußbodenheizungskompatibilität',
      fr: 'Compatibilité chauffage au sol',
    },
    performance: 'Conforme',
    standard: 'EN 12667',
    tooltip: {
      it: 'Ottima conduttività termica. Ideale per impianti radianti a pavimento con massima efficienza.',
      en: 'Excellent thermal conductivity. Ideal for underfloor radiant systems with maximum efficiency.',
      de: 'Ausgezeichnete Wärmeleitfähigkeit. Ideal für Fußbodenheizungen mit maximaler Effizienz.',
      fr: 'Excellente conductivité thermique. Idéal pour les systèmes radiants au sol avec une efficacité maximale.',
    },
  },
];

export const dopInfo = {
  productCode: 'KALEA-SC10-001',
  productName: {
    it: 'Kalēa StoneCore 10 – Pavimento in MgO texture wood',
    en: 'Kalēa StoneCore 10 – MgO wood texture flooring',
    de: 'Kalēa StoneCore 10 – MgO Bodenbelag mit Holzstruktur',
    fr: 'Kalēa StoneCore 10 – Revêtement de sol MgO texture bois',
  },
  intendedUse: {
    it: 'Rivestimento per pavimenti in ambienti interni residenziali e commerciali',
    en: 'Floor covering for residential and commercial indoor environments',
    de: 'Bodenbelag für Wohn- und Gewerbeinnenräume',
    fr: 'Revêtement de sol pour environnements intérieurs résidentiels et commerciaux',
  },
  harmonizedStandard: 'EN 14041:2004 + A1:2011',
  notifiedBody: {
    name: 'TÜV Rheinland',
    number: '0197',
  },
  manufacturer: {
    name: 'Kalēa S.r.l.',
    address: 'Via Example, 123 – 00100 Roma, Italia',
  },
  declarationDate: '2024-01-15',
};
