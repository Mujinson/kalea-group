import { motion } from "framer-motion";
import { FileText, Download, Layers, ShieldCheck, Leaf, Home, Building2, Wrench, BookOpen, Video, HelpCircle, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import FeatureCard from "@/components/FeatureCard";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";
import { downloadableCertifications } from "@/data/downloadableCertifications";
import LeadCaptureDialog, { checkLeadCaptured, setLeadCaptured } from "@/components/LeadCaptureDialog";
import SEOHead from "@/components/SEOHead";

const AreaTecnica = () => {
  const { t, language } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showLeadDialog, setShowLeadDialog] = useState(false);
  const [pendingDownloadUrl, setPendingDownloadUrl] = useState<string | undefined>();
  const [leadCaptured, setLeadCapturedState] = useState(checkLeadCaptured());

  const handleDownloadClick = (downloadUrl: string) => {
    if (leadCaptured) {
      // Already captured, allow direct download
      window.open(downloadUrl, "_blank");
    } else {
      // Show lead capture dialog
      setPendingDownloadUrl(downloadUrl);
      setShowLeadDialog(true);
    }
  };

  const handleLeadSuccess = () => {
    setLeadCapturedState(true);
  };

  // Static documents without downloadable files
  const staticDocuments = [
    {
      name: "Catalogo BIOMAG FLOOR®",
      category: "BIOMAG FLOOR®",
      description: "Gamma completa finiture e colori disponibili",
      size: "4.8 MB",
    },
    {
      name: "Scheda tecnica BIOMAG FLOOR®",
      category: "BIOMAG FLOOR®",
      description: "Specifiche complete del pavimento in MgO",
      size: "2.4 MB",
    },
    {
      name: "Guida di posa BIOMAG FLOOR®",
      category: "BIOMAG FLOOR®",
      description: "Istruzioni dettagliate per l'installazione",
      size: "3.2 MB",
    },
    {
      name: "Catalogo EdgeLine",
      category: "EdgeLine",
      description: "Gamma completa profili e battiscopa",
      size: "5.6 MB",
    },
    {
      name: "Scheda tecnica EdgeLine",
      category: "EdgeLine",
      description: "Specifiche tecniche profili in alluminio",
      size: "1.9 MB",
    },
    {
      name: "Guida di posa EdgeLine",
      category: "EdgeLine",
      description: "Istruzioni installazione profili e giunti",
      size: "2.3 MB",
    },
    {
      name: "Catalogo BIOWALL®",
      category: "BIOWALL®",
      description: "Finiture e applicazioni pannelli in ossido di magnesio",
      size: "7.2 MB",
    },
    {
      name: "Scheda tecnica BIOWALL®",
      category: "BIOWALL®",
      description: "Specifiche tecniche pannelli per pareti",
      size: "2.1 MB",
    },
    {
      name: "Guida di posa BIOWALL®",
      category: "BIOWALL®",
      description: "Istruzioni installazione pareti e soffitti",
      size: "3.8 MB",
    },
  ];

  // Combine downloadable certifications with static documents
  const allDocuments = [
    // Add downloadable certifications first (BIOMAG FLOOR®)
    ...downloadableCertifications.map(cert => ({
      name: cert.name[language as keyof typeof cert.name] || cert.name.en,
      category: cert.category,
      description: cert.description[language as keyof typeof cert.description] || cert.description.en,
      size: cert.fileSize,
      downloadUrl: cert.downloadUrl,
      standard: cert.standard,
      isDownloadable: true,
    })),
    // Add static documents
    ...staticDocuments.map(doc => ({
      ...doc,
      downloadUrl: undefined,
      standard: undefined,
      isDownloadable: false,
    })),
  ];

  const categories = ["all", "BIOMAG FLOOR®", "EdgeLine", "BIOWALL®", "Certificazioni"];

  const filteredDocuments = selectedCategory === "all" 
    ? allDocuments 
    : allDocuments.filter(doc => doc.category === selectedCategory);

  return (
    <div className="min-h-screen pt-20">
      <SEOHead
        title={language === 'it' ? "Area Tecnica — Certificazioni e Schede Tecniche | Kalēa®" :
               language === 'en' ? "Technical Area — Certifications & Data Sheets | Kalēa®" :
               language === 'de' ? "Technischer Bereich — Zertifizierungen & Datenblätter | Kalēa®" :
               "Espace Technique — Certifications et Fiches Techniques | Kalēa®"}
        description={language === 'it' ? "Scarica certificazioni CE, SGS, ISO 9001 e schede tecniche dei pavimenti flottanti Kalēa®. Documentazione completa per professionisti e progettisti." :
                     language === 'en' ? "Download CE, SGS, ISO 9001 certifications and technical data sheets for Kalēa® floating floors." :
                     language === 'de' ? "CE-, SGS-, ISO 9001-Zertifizierungen und technische Datenblätter für Kalēa® Schwimmböden herunterladen." :
                     "Téléchargez les certifications CE, SGS, ISO 9001 et fiches techniques des sols flottants Kalēa®."}
        keywords="certificazioni pavimenti, schede tecniche pavimento, CE pavimenti, SGS pavimenti, ISO 9001 pavimenti, documentazione tecnica pavimenti flottanti"
      />
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

      {/* Filtri */}
      <section className="section-spacing">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap gap-3 justify-center mb-12"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {category === "all" ? t('technicalArea.allDocuments') : category}
              </button>
            ))}
          </motion.div>

          {/* Lista documenti */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc, index) => (
              <motion.div
                key={doc.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className={`kalea-card group bg-card border rounded-xl p-6 flex flex-col h-full ${doc.isDownloadable ? 'border-primary/30 hover:border-primary/50 hover:shadow-lg' : 'border-border'}`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors ${doc.isDownloadable ? 'bg-primary/15' : 'bg-primary/10'}`}>
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-heading font-semibold text-foreground mb-1 line-clamp-2">
                      {doc.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs text-muted-foreground">{doc.category}</p>
                      {doc.standard && (
                        <span className="text-xs font-medium text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded">
                          {doc.standard}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4 flex-grow">{doc.description}</p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground">{doc.size}</span>
                  {doc.isDownloadable && doc.downloadUrl ? (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors"
                      onClick={() => handleDownloadClick(doc.downloadUrl!)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t('technicalArea.download')}
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors" disabled>
                      <Download className="w-4 h-4 mr-2" />
                      {t('technicalArea.download')}
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-spacing bg-background">
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
              <a href="mailto:tecnico@kalea.space">{t('technicalArea.ctaButton')}</a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* 1. Struttura del pavimento in MgO */}
      <section className="section-spacing">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Colonna sinistra - Testo */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl md:text-4xl font-heading font-semibold text-foreground mb-6">
                Struttura del pavimento in MgO
              </h2>
              <p className="text-body text-muted-foreground mb-6">
                Il pavimento BIOMAG FLOOR® è composto da 5 strati funzionali che garantiscono prestazioni superiori:
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  "Strato antiusura",
                  "Strato decorativo",
                  "Core in MgO",
                  "Strato di compensazione",
                  "Strato di supporto"
                ].map((layer, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-body text-foreground">{layer}</span>
                  </li>
                ))}
              </ul>
              <p className="text-body text-muted-foreground">
                Questa struttura innovativa garantisce stabilità dimensionale superiore, resistenza al fuoco classe A1, 
                zero formaldeide, zero plastiche e compatibilità perfetta con sistemi di riscaldamento a pavimento.
              </p>
            </motion.div>

            {/* Colonna destra - Placeholder immagine */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative aspect-square rounded-2xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center"
            >
              <div className="text-center">
                <Layers className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Schema tecnico pavimento</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Prestazioni & Normative */}
      <section className="section-spacing bg-muted/30">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-semibold text-foreground mb-8 text-center">
              Prestazioni & normative di riferimento
            </h2>
            
            <div className="max-w-4xl mx-auto mb-8">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Classe al fuoco A1 / A1fl EN 13501-1",
                  "Resistenza al fuoco superiore a SPC/HPL/MFC",
                  "Zero formaldeide, zero VOC, zero plastiche",
                  "Impermeabile, antimuffa, antibatterico",
                  "Resistente ai graffi",
                  "Compatibile con riscaldamento radiante",
                  "Composizione inorganica",
                  "Emissioni nocive pari a zero"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-body text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tabella tecnica */}
            <div className="overflow-x-auto">
              <table className="w-full max-w-4xl mx-auto bg-card rounded-xl border border-border">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Caratteristica</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Valore</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Normativa</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { char: "Reazione al fuoco", val: "A1 / A1fl", norm: "EN 13501-1" },
                    { char: "Spessore plancia", val: "8,5 mm", norm: "EN 428" },
                    { char: "Resistenza all'abrasione", val: "Classe AC5", norm: "EN 13329" },
                    { char: "Stabilità dimensionale", val: "≤ 0,10%", norm: "EN 434" },
                    { char: "Emissioni VOC", val: "A+", norm: "ISO 16000" }
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-border last:border-b-0">
                      <td className="px-6 py-4 text-sm text-foreground">{row.char}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{row.val}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{row.norm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. MgO vs SPC/MFC/HPL */}
      <section className="section-spacing relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/src/assets/bg-products.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.4)',
          }}
        />
        
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-semibold text-foreground md:text-white mb-4">
              MgO vs SPC / MFC / HPL
            </h2>
            <p className="text-subtitle text-muted-foreground md:text-white/80 max-w-2xl mx-auto">
              Perché il MgO rappresenta la scelta superiore per pavimenti e rivestimenti
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={ShieldCheck}
              title="Sicurezza antincendio"
              description="MgO raggiunge la classe A1 (massima sicurezza), mentre SPC, MFC e HPL si fermano alla classe B."
              index={0}
            />
            <FeatureCard
              icon={Wrench}
              title="Stabilità termica"
              description="Perfetto su riscaldamento a pavimento grazie alla composizione inorganica e alla stabilità dimensionale superiore."
              index={1}
            />
            <FeatureCard
              icon={Leaf}
              title="Salute & ambiente"
              description="Zero plastica, zero formaldeide, zero VOC. Composizione 100% inorganica e naturale."
              index={2}
            />
            <FeatureCard
              icon={Home}
              title="Comfort e utilizzo reale"
              description="Resistente ai graffi, antimuffa, impermeabile. Ideale per famiglie con animali domestici."
              index={3}
            />
          </div>
        </div>
      </section>

      {/* 4. Applicazioni consigliate */}
      <section className="section-spacing">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-semibold text-foreground mb-4">
              Applicazioni consigliate
            </h2>
            <p className="text-subtitle text-muted-foreground max-w-2xl mx-auto">
              Il pavimento in MgO è versatile e adatto a ogni contesto
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Home, title: "Residenziale", desc: "Abitazioni private, ville e appartamenti" },
              { icon: Building2, title: "Hotel e ospitalità", desc: "Strutture ricettive e turistiche" },
              { icon: Building2, title: "Retail e uffici", desc: "Spazi commerciali e direzionali" },
              { icon: Wrench, title: "Cucine e bagni", desc: "Ambienti umidi e ad alto traffico" },
              { icon: ShieldCheck, title: "Strutture sanitarie", desc: "Ospedali, cliniche e RSA" },
              { icon: BookOpen, title: "Scuole e spazi pubblici", desc: "Istruzione e aree comuni" },
              { icon: Home, title: "Case con animali", desc: "Resistenza a graffi e usura" },
              { icon: Wrench, title: "Progetti con riscaldamento", desc: "Compatibilità perfetta con sistemi radianti" }
            ].map((app, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="kalea-card flex items-start gap-4 p-6 rounded-xl border border-border bg-card"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <app.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-semibold text-foreground mb-1">{app.title}</h3>
                  <p className="text-sm text-muted-foreground">{app.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Consulenza tecnica */}
      <section className="section-spacing relative overflow-hidden">
        {/* Background image - only visible on md+ */}
        <div 
          className="absolute inset-0 z-0 hidden md:block"
          style={{
            backgroundImage: 'url(/src/assets/bg-products.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.4)',
          }}
        />
        
        {/* Mobile background */}
        <div className="absolute inset-0 z-0 md:hidden bg-[#F8F6F3]" />
        
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto"
          >
            <div
              className="relative overflow-hidden transition-all duration-200 rounded-[32px] p-8 md:p-12 bg-white/95 md:bg-white/[0.08] md:backdrop-blur-[22px] border border-border md:border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.08)] md:shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
            >
              <h2 className="text-3xl md:text-4xl font-heading font-semibold text-foreground md:text-white mb-6">
                Consulenza tecnica dedicata
              </h2>
              <p className="text-body text-muted-foreground md:text-white/80 mb-6">
                Il nostro ufficio tecnico offre supporto completo per progettisti, imprese e studi di architettura.
              </p>
              
              <ul className="space-y-3 mb-8">
                {[
                  "Analisi progetto e scelta della soluzione ottimale",
                  "Supporto tecnico per la posa in opera",
                  "Indicazioni per sistemi di riscaldamento radiante",
                  "Assistenza nella redazione di capitolati",
                  "Supporto tecnico dedicato per imprese e progettisti"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-foreground md:bg-white mt-2 flex-shrink-0" />
                    <span className="text-body text-foreground md:text-white/90">{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/contatti"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-button transition-all duration-150 px-10 py-3.5 bg-foreground md:bg-white text-background md:text-[#111] hover:opacity-90 hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
              >
                Richiedi consulenza tecnica
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 6. Risorse tecniche */}
      <section className="section-spacing">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-semibold text-foreground mb-4">
              Risorse tecniche
            </h2>
            <p className="text-subtitle text-muted-foreground max-w-2xl mx-auto">
              Tutto ciò che ti serve per lavorare con i nostri prodotti
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, title: "Manuale tecnico", desc: "Guida completa alle specifiche" },
              { icon: Video, title: "Video di posa", desc: "Tutorial passo-passo" },
              { icon: HelpCircle, title: "FAQ tecniche", desc: "Risposte alle domande frequenti" },
              { icon: FileCode, title: "Risorse CAD/BIM", desc: "File per progettazione" }
            ].map((resource, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center"
              >
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <resource.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-foreground mb-2">{resource.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{resource.desc}</p>
                <Button size="sm" variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                  Scarica
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CTA finale */}
      <section className="section-spacing bg-muted/30">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-semibold text-foreground mb-4">
              Parliamo del tuo progetto in MgO
            </h2>
            <p className="text-subtitle text-muted-foreground mb-8">
              Il nostro team è pronto ad aiutarti a realizzare il tuo progetto con le soluzioni Kalēa
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contatti"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-button transition-all duration-150 px-10 py-3.5 bg-white text-[#111] hover:bg-[#F3F3F3] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
              >
                Contatta l'ufficio tecnico
              </Link>
              <Link
                to="/contatti"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-button transition-all duration-150 px-10 py-3.5 bg-white text-[#111] hover:bg-[#F3F3F3] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
              >
                Richiedi un preventivo
              </Link>
            </div>
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
