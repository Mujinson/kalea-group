export interface DownloadableCertification {
  id: string;
  name: {
    it: string;
    en: string;
    de: string;
    fr: string;
  };
  description: {
    it: string;
    en: string;
    de: string;
    fr: string;
  };
  standard: string;
  category: string;
  downloadUrl: string;
  fileSize: string;
}

export const downloadableCertifications: DownloadableCertification[] = [
  {
    id: 'fireproof-sgs',
    name: {
      it: 'Certificazione Fireproof',
      en: 'Fireproof Certification',
      de: 'Brandschutz-Zertifizierung',
      fr: 'Certification Ignifuge',
    },
    description: {
      it: 'Test SGS ASTM E84-23 - Classe A (FSI 0, SDI 0)',
      en: 'SGS Test ASTM E84-23 - Class A (FSI 0, SDI 0)',
      de: 'SGS Test ASTM E84-23 - Klasse A (FSI 0, SDI 0)',
      fr: 'Test SGS ASTM E84-23 - Classe A (FSI 0, SDI 0)',
    },
    standard: 'ASTM E84-23',
    category: 'StoneCore 10',
    downloadUrl: '/certificates/Zolway-for-Kalea-StoneCore10-Fireproof-SGS.pdf',
    fileSize: '1.2 MB',
  },
  {
    id: 'formaldehyde-sgs',
    name: {
      it: 'Certificazione Emissione Formaldeide',
      en: 'Formaldehyde Emission Certification',
      de: 'Formaldehyd-Emissions-Zertifizierung',
      fr: 'Certification Émission de Formaldéhyde',
    },
    description: {
      it: 'Test SGS GB 18580-2017 - Classe E₁ (ND < 0.124 mg/m³)',
      en: 'SGS Test GB 18580-2017 - Class E₁ (ND < 0.124 mg/m³)',
      de: 'SGS Test GB 18580-2017 - Klasse E₁ (ND < 0.124 mg/m³)',
      fr: 'Test SGS GB 18580-2017 - Classe E₁ (ND < 0.124 mg/m³)',
    },
    standard: 'GB 18580-2017 / EN 717-1',
    category: 'StoneCore 10',
    downloadUrl: '/certificates/Zolway-for-Kalea-StoneCore10-Formaldehyde-SGS.pdf',
    fileSize: '0.8 MB',
  },
  {
    id: 'ce-certificate',
    name: {
      it: 'Certificazione CE',
      en: 'CE Certification',
      de: 'CE-Zertifizierung',
      fr: 'Certification CE',
    },
    description: {
      it: 'Conformità EN 14041:2018 / EN 14342:2013 - Regolamento UE 305/2011',
      en: 'Conformity EN 14041:2018 / EN 14342:2013 - EU Regulation 305/2011',
      de: 'Konformität EN 14041:2018 / EN 14342:2013 - EU-Verordnung 305/2011',
      fr: 'Conformité EN 14041:2018 / EN 14342:2013 - Règlement UE 305/2011',
    },
    standard: 'EN 14041:2018',
    category: 'StoneCore 10',
    downloadUrl: '/certificates/Zolway-for-Kalea-StoneCore10-CE-Certificate.pdf',
    fileSize: '0.5 MB',
  },
  {
    id: 'iso9001',
    name: {
      it: 'Certificazione ISO 9001',
      en: 'ISO 9001 Certification',
      de: 'ISO 9001-Zertifizierung',
      fr: 'Certification ISO 9001',
    },
    description: {
      it: 'Sistema di Gestione Qualità GB/T19001-2016 / ISO 9001:2015',
      en: 'Quality Management System GB/T19001-2016 / ISO 9001:2015',
      de: 'Qualitätsmanagementsystem GB/T19001-2016 / ISO 9001:2015',
      fr: 'Système de Management de la Qualité GB/T19001-2016 / ISO 9001:2015',
    },
    standard: 'ISO 9001:2015',
    category: 'StoneCore 10',
    downloadUrl: '/certificates/Zolway-for-Kalea-StoneCore10-ISO9001.pdf',
    fileSize: '0.4 MB',
  },
  {
    id: 'sgs-testing',
    name: {
      it: 'Report Test SGS Completo',
      en: 'Complete SGS Testing Report',
      de: 'Vollständiger SGS-Testbericht',
      fr: 'Rapport de Test SGS Complet',
    },
    description: {
      it: 'Test prestazionali EN 14041 - Resistenza, stabilità, usura',
      en: 'Performance tests EN 14041 - Resistance, stability, wear',
      de: 'Leistungstests EN 14041 - Beständigkeit, Stabilität, Verschleiß',
      fr: 'Tests de performance EN 14041 - Résistance, stabilité, usure',
    },
    standard: 'EN 14041',
    category: 'StoneCore 10',
    downloadUrl: '/certificates/Zolway-for-Kalea-StoneCore10-SGS-Testing.pdf',
    fileSize: '2.8 MB',
  },
];
