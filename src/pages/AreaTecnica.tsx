import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import LeadCaptureDialog, { checkLeadCaptured, setLeadCaptured } from "@/components/LeadCaptureDialog";
import { Link } from "react-router-dom";

interface ProductCertification {
  id: string;
  nameKey: string;
  descriptionKey: string;
  standard: string;
  fileSize: string;
  downloadUrl?: string;
}

interface ProductLine {
  id: string;
  labelKey: string;
  certifications: ProductCertification[];
}

const productLines: ProductLine[] = [
  {
    id: 'biomag',
    labelKey: 'technicalArea.products.biomag',
    certifications: [
      { id: 'fireproof-sgs', nameKey: 'technicalArea.certs.fireproof.name', descriptionKey: 'technicalArea.certs.fireproof.desc', standard: 'ASTM E84-23', fileSize: '1.2 MB', downloadUrl: '/certificates/Zolway-for-Kalea-StoneCore10-Fireproof-SGS.pdf' },
      { id: 'formaldehyde-sgs', nameKey: 'technicalArea.certs.formaldehyde.name', descriptionKey: 'technicalArea.certs.formaldehyde.desc', standard: 'GB 18580-2017 / EN 717-1', fileSize: '0.8 MB', downloadUrl: '/certificates/Zolway-for-Kalea-StoneCore10-Formaldehyde-SGS.pdf' },
      { id: 'ce-certificate', nameKey: 'technicalArea.certs.ce.name', descriptionKey: 'technicalArea.certs.ce.desc', standard: 'EN 14041:2018', fileSize: '0.5 MB', downloadUrl: '/certificates/Zolway-for-Kalea-StoneCore10-CE-Certificate.pdf' },
      { id: 'iso9001', nameKey: 'technicalArea.certs.iso9001.name', descriptionKey: 'technicalArea.certs.iso9001.desc', standard: 'ISO 9001:2015', fileSize: '0.4 MB', downloadUrl: '/certificates/Zolway-for-Kalea-StoneCore10-ISO9001.pdf' },
      { id: 'sgs-testing', nameKey: 'technicalArea.certs.sgsTesting.name', descriptionKey: 'technicalArea.certs.sgsTesting.desc', standard: 'EN 14041', fileSize: '2.8 MB', downloadUrl: '/certificates/Zolway-for-Kalea-StoneCore10-SGS-Testing.pdf' },
      { id: 'biomag-catalog', nameKey: 'technicalArea.certs.biomagCatalog.name', descriptionKey: 'technicalArea.certs.biomagCatalog.desc', standard: '', fileSize: '4.8 MB' },
      { id: 'biomag-datasheet', nameKey: 'technicalArea.certs.biomagDatasheet.name', descriptionKey: 'technicalArea.certs.biomagDatasheet.desc', standard: '', fileSize: '2.4 MB' },
      { id: 'biomag-install', nameKey: 'technicalArea.certs.biomagInstall.name', descriptionKey: 'technicalArea.certs.biomagInstall.desc', standard: '', fileSize: '3.2 MB' },
    ],
  },
  {
    id: 'edgeline',
    labelKey: 'technicalArea.products.edgeline',
    certifications: [
      { id: 'edge-catalog', nameKey: 'technicalArea.certs.edgeCatalog.name', descriptionKey: 'technicalArea.certs.edgeCatalog.desc', standard: '', fileSize: '5.6 MB' },
      { id: 'edge-datasheet', nameKey: 'technicalArea.certs.edgeDatasheet.name', descriptionKey: 'technicalArea.certs.edgeDatasheet.desc', standard: '', fileSize: '1.9 MB' },
      { id: 'edge-install', nameKey: 'technicalArea.certs.edgeInstall.name', descriptionKey: 'technicalArea.certs.edgeInstall.desc', standard: '', fileSize: '2.3 MB' },
    ],
  },
  {
    id: 'biowall',
    labelKey: 'technicalArea.products.biowall',
    certifications: [
      { id: 'biowall-catalog', nameKey: 'technicalArea.certs.biowallCatalog.name', descriptionKey: 'technicalArea.certs.biowallCatalog.desc', standard: '', fileSize: '7.2 MB' },
      { id: 'biowall-datasheet', nameKey: 'technicalArea.certs.biowallDatasheet.name', descriptionKey: 'technicalArea.certs.biowallDatasheet.desc', standard: '', fileSize: '2.1 MB' },
      { id: 'biowall-install', nameKey: 'technicalArea.certs.biowallInstall.name', descriptionKey: 'technicalArea.certs.biowallInstall.desc', standard: '', fileSize: '3.8 MB' },
    ],
  },
  {
    id: 'kaleabase',
    labelKey: 'technicalArea.products.kaleabase',
    certifications: [
      { id: 'kaleabase-datasheet', nameKey: 'technicalArea.certs.kaleabaseDatasheet.name', descriptionKey: 'technicalArea.certs.kaleabaseDatasheet.desc', standard: '', fileSize: '1.8 MB' },
      { id: 'kaleabase-install', nameKey: 'technicalArea.certs.kaleabaseInstall.name', descriptionKey: 'technicalArea.certs.kaleabaseInstall.desc', standard: '', fileSize: '2.0 MB' },
    ],
  },
  {
    id: 'kaleadeck',
    labelKey: 'technicalArea.products.kaleadeck',
    certifications: [
      { id: 'kaleadeck-datasheet', nameKey: 'technicalArea.certs.kaleadeckDatasheet.name', descriptionKey: 'technicalArea.certs.kaleadeckDatasheet.desc', standard: '', fileSize: '2.2 MB' },
      { id: 'kaleadeck-install', nameKey: 'technicalArea.certs.kaleadeckInstall.name', descriptionKey: 'technicalArea.certs.kaleadeckInstall.desc', standard: '', fileSize: '1.5 MB' },
    ],
  },
  {
    id: 'kaleaceiling',
    labelKey: 'technicalArea.products.kaleaceiling',
    certifications: [
      { id: 'kaleaceiling-datasheet', nameKey: 'technicalArea.certs.kalealingDatasheet.name', descriptionKey: 'technicalArea.certs.kalealingDatasheet.desc', standard: '', fileSize: '1.6 MB' },
    ],
  },
];

const AreaTecnica = () => {
  const { t, language } = useTranslation();
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [showLeadDialog, setShowLeadDialog] = useState(false);
  const [pendingDownloadUrl, setPendingDownloadUrl] = useState<string | undefined>();
  const [leadCaptured, setLeadCapturedState] = useState(checkLeadCaptured());

  const handleDownloadClick = (downloadUrl: string) => {
    if (leadCaptured) {
      window.open(downloadUrl, "_blank");
    } else {
      setPendingDownloadUrl(downloadUrl);
      setShowLeadDialog(true);
    }
  };

  const handleLeadSuccess = () => {
    setLeadCapturedState(true);
  };

  const toggleProduct = (productId: string) => {
    setExpandedProduct(prev => prev === productId ? null : productId);
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="section-spacing bg-gradient-to-b from-muted/30 to-background">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              {t('technicalArea.title')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('technicalArea.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Product Lines */}
      <section className="section-spacing">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              {t('technicalArea.selectProduct')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('technicalArea.selectProductSub')}
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-4">
            {productLines.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                {/* Product Header */}
                <button
                  onClick={() => toggleProduct(product.id)}
                  className={`w-full flex items-center justify-between px-6 py-5 rounded-xl border transition-all duration-200 ${
                    expandedProduct === product.id
                      ? 'bg-primary text-primary-foreground border-primary shadow-md'
                      : 'bg-card text-foreground border-border hover:border-primary/40 hover:shadow-sm'
                  }`}
                >
                  <span className="text-lg font-heading font-semibold">{t(product.labelKey)}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${expandedProduct === product.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {product.certifications.length} {t('technicalArea.documents')}
                    </span>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${expandedProduct === product.id ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Expanded Certifications */}
                <AnimatePresence>
                  {expandedProduct === product.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 pb-2">
                        {product.certifications.map((cert) => (
                          <div
                            key={cert.id}
                            className={`group bg-card border rounded-xl p-5 flex flex-col h-full ${cert.downloadUrl ? 'border-primary/30 hover:border-primary/50 hover:shadow-lg' : 'border-border'} transition-all duration-200`}
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${cert.downloadUrl ? 'bg-primary/15' : 'bg-primary/10'}`}>
                                <FileText className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-heading font-semibold text-foreground mb-0.5 line-clamp-2">{t(cert.nameKey)}</h4>
                                {cert.standard && (
                                  <span className="text-xs font-medium text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded">{cert.standard}</span>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3 flex-grow">{t(cert.descriptionKey)}</p>
                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                              <span className="text-xs text-muted-foreground">{cert.fileSize}</span>
                              {cert.downloadUrl ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors"
                                  onClick={() => handleDownloadClick(cert.downloadUrl!)}
                                >
                                  <Download className="w-3.5 h-3.5 mr-1.5" />
                                  {t('technicalArea.download')}
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" className="text-xs" disabled>
                                  <Download className="w-3.5 h-3.5 mr-1.5" />
                                  {t('technicalArea.download')}
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-spacing bg-muted/30">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              {t('technicalArea.ctaTitle')}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('technicalArea.ctaSubtitle')}
            </p>
            <Button asChild size="lg" variant="default">
              <Link to={`/${language}/contatti`}>{t('technicalArea.ctaButton')}</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Lead Capture Dialog */}
      <LeadCaptureDialog
        open={showLeadDialog}
        onOpenChange={setShowLeadDialog}
        onSuccess={handleLeadSuccess}
        pendingDownloadUrl={pendingDownloadUrl}
      />
    </div>
  );
};

export default AreaTecnica;
