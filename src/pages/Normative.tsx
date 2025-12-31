import { motion } from "framer-motion";
import { Shield, Download, ExternalLink, FileText, CheckCircle } from "lucide-react";
import { certifications, dopInfo } from "@/data/certifications";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Info } from "lucide-react";

const Normative = () => {
  const { language } = useTranslation();

  const texts = {
    it: {
      pageTitle: 'Normative e Certificazioni',
      pageSubtitle: 'Documentazione completa sulla conformità dei prodotti Kalēa',
      heroDescription: 'Tutti i pavimenti BIOMAG FLOOR® sono conformi al Regolamento UE 305/2011 (CPR) e alle norme armonizzate europee per i rivestimenti da pavimento.',
      
      dopTitle: 'Dichiarazione di Prestazione (DoP)',
      dopDescription: 'La Dichiarazione di Prestazione è il documento obbligatorio che attesta le caratteristiche essenziali del prodotto secondo il Regolamento UE 305/2011.',
      productCode: 'Codice prodotto',
      productName: 'Nome prodotto',
      intendedUse: 'Uso previsto',
      harmonizedStandard: 'Norma armonizzata',
      notifiedBody: 'Organismo notificato',
      manufacturer: 'Fabbricante',
      declarationDate: 'Data dichiarazione',
      
      certificationsTitle: 'Prestazioni Certificate',
      certificationsSubtitle: 'Caratteristiche essenziali testate secondo le norme europee',
      characteristic: 'Caratteristica essenziale',
      performance: 'Prestazione',
      standard: 'Norma di prova',
      
      downloadSection: 'Documenti Scaricabili',
      downloadDopIt: 'DoP Italiano (PDF)',
      downloadDopEn: 'DoP English (PDF)',
      downloadTechSheet: 'Scheda Tecnica',
      
      euRegulation: 'Regolamento UE 305/2011',
      euRegulationDesc: 'Il Regolamento sui Prodotti da Costruzione (CPR) stabilisce condizioni armonizzate per la commercializzazione dei prodotti da costruzione nell\'UE.',
      learnMore: 'Approfondisci',
      
      legalNote: 'Nota legale',
      legalNoteText: 'Tutti i nostri prodotti sono conformi al Regolamento UE 305/2011 e alle norme armonizzate riportate nelle DoP. Le prestazioni dichiarate sono state determinate secondo i metodi di prova specificati nelle rispettive norme europee.',
    },
    en: {
      pageTitle: 'Standards & Certifications',
      pageSubtitle: 'Complete documentation on Kalēa product compliance',
      heroDescription: 'All BIOMAG FLOOR® floors comply with EU Regulation 305/2011 (CPR) and European harmonized standards for floor coverings.',
      
      dopTitle: 'Declaration of Performance (DoP)',
      dopDescription: 'The Declaration of Performance is the mandatory document certifying the essential characteristics of the product according to EU Regulation 305/2011.',
      productCode: 'Product code',
      productName: 'Product name',
      intendedUse: 'Intended use',
      harmonizedStandard: 'Harmonized standard',
      notifiedBody: 'Notified body',
      manufacturer: 'Manufacturer',
      declarationDate: 'Declaration date',
      
      certificationsTitle: 'Certified Performance',
      certificationsSubtitle: 'Essential characteristics tested according to European standards',
      characteristic: 'Essential characteristic',
      performance: 'Performance',
      standard: 'Test standard',
      
      downloadSection: 'Downloadable Documents',
      downloadDopIt: 'DoP Italian (PDF)',
      downloadDopEn: 'DoP English (PDF)',
      downloadTechSheet: 'Technical Sheet',
      
      euRegulation: 'EU Regulation 305/2011',
      euRegulationDesc: 'The Construction Products Regulation (CPR) establishes harmonized conditions for the marketing of construction products in the EU.',
      learnMore: 'Learn more',
      
      legalNote: 'Legal notice',
      legalNoteText: 'All our products comply with EU Regulation 305/2011 and the harmonized standards indicated in the DoP. The declared performances have been determined according to the test methods specified in the respective European standards.',
    },
    de: {
      pageTitle: 'Normen & Zertifizierungen',
      pageSubtitle: 'Vollständige Dokumentation zur Kalēa Produktkonformität',
      heroDescription: 'Alle BIOMAG FLOOR® Böden entsprechen der EU-Verordnung 305/2011 (BauPVO) und den europäischen harmonisierten Normen für Bodenbeläge.',
      
      dopTitle: 'Leistungserklärung (DoP)',
      dopDescription: 'Die Leistungserklärung ist das obligatorische Dokument, das die wesentlichen Merkmale des Produkts gemäß EU-Verordnung 305/2011 bescheinigt.',
      productCode: 'Produktcode',
      productName: 'Produktname',
      intendedUse: 'Verwendungszweck',
      harmonizedStandard: 'Harmonisierte Norm',
      notifiedBody: 'Notifizierte Stelle',
      manufacturer: 'Hersteller',
      declarationDate: 'Erklärungsdatum',
      
      certificationsTitle: 'Zertifizierte Leistungen',
      certificationsSubtitle: 'Wesentliche Merkmale nach europäischen Normen geprüft',
      characteristic: 'Wesentliches Merkmal',
      performance: 'Leistung',
      standard: 'Prüfnorm',
      
      downloadSection: 'Herunterladbare Dokumente',
      downloadDopIt: 'DoP Italienisch (PDF)',
      downloadDopEn: 'DoP Englisch (PDF)',
      downloadTechSheet: 'Technisches Datenblatt',
      
      euRegulation: 'EU-Verordnung 305/2011',
      euRegulationDesc: 'Die Bauproduktenverordnung (BauPVO) legt harmonisierte Bedingungen für die Vermarktung von Bauprodukten in der EU fest.',
      learnMore: 'Mehr erfahren',
      
      legalNote: 'Rechtlicher Hinweis',
      legalNoteText: 'Alle unsere Produkte entsprechen der EU-Verordnung 305/2011 und den in der DoP angegebenen harmonisierten Normen. Die erklärten Leistungen wurden nach den in den jeweiligen europäischen Normen festgelegten Prüfverfahren ermittelt.',
    },
    fr: {
      pageTitle: 'Normes & Certifications',
      pageSubtitle: 'Documentation complète sur la conformité des produits Kalēa',
      heroDescription: 'Tous les sols BIOMAG FLOOR® sont conformes au Règlement UE 305/2011 (RPC) et aux normes harmonisées européennes pour les revêtements de sol.',
      
      dopTitle: 'Déclaration des Performances (DoP)',
      dopDescription: 'La Déclaration des Performances est le document obligatoire attestant les caractéristiques essentielles du produit selon le Règlement UE 305/2011.',
      productCode: 'Code produit',
      productName: 'Nom du produit',
      intendedUse: 'Usage prévu',
      harmonizedStandard: 'Norme harmonisée',
      notifiedBody: 'Organisme notifié',
      manufacturer: 'Fabricant',
      declarationDate: 'Date de déclaration',
      
      certificationsTitle: 'Performances Certifiées',
      certificationsSubtitle: 'Caractéristiques essentielles testées selon les normes européennes',
      characteristic: 'Caractéristique essentielle',
      performance: 'Performance',
      standard: 'Norme d\'essai',
      
      downloadSection: 'Documents Téléchargeables',
      downloadDopIt: 'DoP Italien (PDF)',
      downloadDopEn: 'DoP Anglais (PDF)',
      downloadTechSheet: 'Fiche Technique',
      
      euRegulation: 'Règlement UE 305/2011',
      euRegulationDesc: 'Le Règlement sur les Produits de Construction (RPC) établit des conditions harmonisées pour la commercialisation des produits de construction dans l\'UE.',
      learnMore: 'En savoir plus',
      
      legalNote: 'Note légale',
      legalNoteText: 'Tous nos produits sont conformes au Règlement UE 305/2011 et aux normes harmonisées indiquées dans les DoP. Les performances déclarées ont été déterminées selon les méthodes d\'essai spécifiées dans les normes européennes respectives.',
    },
  };

  const t = texts[language as keyof typeof texts] || texts.it;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-muted/50 to-background">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <Shield className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
              {t.pageTitle}
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              {t.pageSubtitle}
            </p>
            <p className="text-base text-muted-foreground">
              {t.heroDescription}
            </p>
          </motion.div>
        </div>
      </section>

      {/* DoP Info Section */}
      <section className="py-16 bg-background">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">
              {t.dopTitle}
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              {t.dopDescription}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-2 gap-6"
          >
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">{t.productCode}</p>
                  <p className="font-semibold text-foreground">{dopInfo.productCode}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">{t.productName}</p>
                  <p className="font-semibold text-foreground">
                    {dopInfo.productName[language as keyof typeof dopInfo.productName] || dopInfo.productName.it}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">{t.intendedUse}</p>
                  <p className="font-semibold text-foreground">
                    {dopInfo.intendedUse[language as keyof typeof dopInfo.intendedUse] || dopInfo.intendedUse.it}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">{t.harmonizedStandard}</p>
                  <p className="font-semibold text-foreground">{dopInfo.harmonizedStandard}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">{t.notifiedBody}</p>
                  <p className="font-semibold text-foreground">{dopInfo.notifiedBody.name} (n. {dopInfo.notifiedBody.number})</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">{t.manufacturer}</p>
                  <p className="font-semibold text-foreground">{dopInfo.manufacturer.name}</p>
                  <p className="text-sm text-muted-foreground">{dopInfo.manufacturer.address}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Full Certifications Table */}
      <section className="py-16 bg-muted/30">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">
              {t.certificationsTitle}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t.certificationsSubtitle}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm"
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-heading font-semibold text-foreground">
                      {t.characteristic}
                    </TableHead>
                    <TableHead className="font-heading font-semibold text-foreground text-center">
                      {t.performance}
                    </TableHead>
                    <TableHead className="font-heading font-semibold text-foreground text-center">
                      {t.standard}
                    </TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certifications.map((cert) => (
                    <TableRow 
                      key={cert.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-medium text-foreground">
                        {cert.characteristic[language as keyof typeof cert.characteristic] || cert.characteristic.it}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                          {cert.performance}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground text-sm">
                        {cert.standard}
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="p-2 hover:bg-muted rounded-full transition-colors">
                              <Info className="w-4 h-4 text-muted-foreground hover:text-primary" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent 
                            side="left" 
                            className="max-w-[300px] p-3 text-sm"
                          >
                            {cert.tooltip[language as keyof typeof cert.tooltip] || cert.tooltip.it}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Download Section */}
      <section className="py-16 bg-background">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">
              {t.downloadSection}
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Button variant="default" className="gap-2">
              <Download className="w-4 h-4" />
              {t.downloadDopIt}
            </Button>
            <Button variant="default" className="gap-2">
              <Download className="w-4 h-4" />
              {t.downloadDopEn}
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              {t.downloadTechSheet}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* EU Regulation Info */}
      <section className="py-16 bg-muted/30">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">
              {t.euRegulation}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t.euRegulationDesc}
            </p>
            <Button variant="outline" asChild className="gap-2">
              <a 
                href="https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX:32011R0305" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4" />
                {t.learnMore}
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Legal Note */}
      <section className="py-12 bg-background">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-6 rounded-2xl bg-muted/50 border border-border"
          >
            <h3 className="font-heading font-semibold text-foreground mb-2">
              {t.legalNote}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t.legalNoteText}
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Normative;
