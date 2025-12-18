import { motion } from "framer-motion";
import { Shield, Info, Download, ExternalLink } from "lucide-react";
import { certifications, dopInfo } from "@/data/certifications";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
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

interface CertificationsSectionProps {
  variant?: 'compact' | 'full';
}

const CertificationsSection = ({ variant = 'compact' }: CertificationsSectionProps) => {
  const { t, language } = useTranslation();

  const texts = {
    it: {
      title: 'Certificazioni & Normative',
      subtitle: 'Conformità al Regolamento UE 305/2011',
      characteristic: 'Caratteristica essenziale',
      performance: 'Prestazione',
      standard: 'Norma di prova',
      harmonizedStandard: 'Norma armonizzata',
      downloadDop: 'Scarica DoP',
      viewAllCertifications: 'Vedi tutte le certificazioni',
      euCompliance: 'Tutti i nostri prodotti sono conformi al Regolamento UE 305/2011 e alle norme armonizzate riportate nelle DoP.',
    },
    en: {
      title: 'Certifications & Standards',
      subtitle: 'EU Regulation 305/2011 Compliance',
      characteristic: 'Essential characteristic',
      performance: 'Performance',
      standard: 'Test standard',
      harmonizedStandard: 'Harmonized standard',
      downloadDop: 'Download DoP',
      viewAllCertifications: 'View all certifications',
      euCompliance: 'All our products comply with EU Regulation 305/2011 and the harmonized standards indicated in the DoP.',
    },
    de: {
      title: 'Zertifizierungen & Normen',
      subtitle: 'Konformität mit EU-Verordnung 305/2011',
      characteristic: 'Wesentliches Merkmal',
      performance: 'Leistung',
      standard: 'Prüfnorm',
      harmonizedStandard: 'Harmonisierte Norm',
      downloadDop: 'DoP herunterladen',
      viewAllCertifications: 'Alle Zertifizierungen anzeigen',
      euCompliance: 'Alle unsere Produkte entsprechen der EU-Verordnung 305/2011 und den in der DoP angegebenen harmonisierten Normen.',
    },
    fr: {
      title: 'Certifications & Normes',
      subtitle: 'Conformité au Règlement UE 305/2011',
      characteristic: 'Caractéristique essentielle',
      performance: 'Performance',
      standard: 'Norme d\'essai',
      harmonizedStandard: 'Norme harmonisée',
      downloadDop: 'Télécharger DoP',
      viewAllCertifications: 'Voir toutes les certifications',
      euCompliance: 'Tous nos produits sont conformes au Règlement UE 305/2011 et aux normes harmonisées indiquées dans les DoP.',
    },
  };

  const currentTexts = texts[language as keyof typeof texts] || texts.it;

  // Show only first 6 certifications in compact mode
  const displayedCertifications = variant === 'compact' 
    ? certifications.slice(0, 6) 
    : certifications;

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              {currentTexts.title}
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {currentTexts.subtitle}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {currentTexts.harmonizedStandard}: <span className="font-medium">{dopInfo.harmonizedStandard}</span>
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
                    {currentTexts.characteristic}
                  </TableHead>
                  <TableHead className="font-heading font-semibold text-foreground text-center">
                    {currentTexts.performance}
                  </TableHead>
                  <TableHead className="font-heading font-semibold text-foreground text-center">
                    {currentTexts.standard}
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedCertifications.map((cert, index) => (
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

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button asChild variant="default" className="gap-2">
            <a href={`/${language}/area-tecnica`}>
              <Download className="w-4 h-4" />
              {currentTexts.downloadDop}
            </a>
          </Button>
          
          {variant === 'compact' && (
            <Button asChild variant="outline" className="gap-2">
              <Link to={`/${language}/normative`}>
                <ExternalLink className="w-4 h-4" />
                {currentTexts.viewAllCertifications}
              </Link>
            </Button>
          )}
        </motion.div>

        {/* EU Compliance note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 p-4 rounded-xl bg-muted/50 border border-border text-center"
        >
          <p className="text-sm text-muted-foreground">
            {currentTexts.euCompliance}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CertificationsSection;
