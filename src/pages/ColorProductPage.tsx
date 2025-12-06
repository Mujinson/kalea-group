import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { getColorBySlug, getRelatedColors, colorProducts } from "@/data/colorProducts";
import { ArrowRight, Check, Download, FileText, Home, Building2, Briefcase, Store, Heart, Hotel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import all finish images
import finishAurora from "@/assets/finish-aurora.jpg";
import finishCorteccia from "@/assets/finish-corteccia.jpg";
import finishPerla from "@/assets/finish-perla.jpg";
import finishSabbia from "@/assets/finish-sabbia.jpg";
import finishSilven from "@/assets/finish-silven.jpg";
import finishTerram from "@/assets/finish-terram.jpg";
import finishVelora from "@/assets/finish-velora.jpg";

const imageMap: Record<string, string> = {
  aurora: finishAurora,
  corteccia: finishCorteccia,
  cenere: finishCorteccia, // Fallback
  perla: finishPerla,
  sabbia: finishSabbia,
  silven: finishSilven,
  terram: finishTerram,
  velora: finishVelora,
};

const ColorProductPage = () => {
  const { colorSlug } = useParams<{ colorSlug: string }>();
  const { t, language } = useTranslation();
  
  const color = colorSlug ? getColorBySlug(colorSlug) : undefined;
  
  if (!color) {
    return <Navigate to={`/${language}`} replace />;
  }

  const translation = color.translations[language as keyof typeof color.translations];
  const relatedColors = getRelatedColors(color.slug, color.relatedColors);
  const colorImage = imageMap[color.slug] || finishCorteccia;

  const environments = [
    { icon: Home, label: language === 'it' ? 'Cucina' : language === 'en' ? 'Kitchen' : language === 'de' ? 'Küche' : 'Cuisine' },
    { icon: Home, label: language === 'it' ? 'Soggiorno' : language === 'en' ? 'Living Room' : language === 'de' ? 'Wohnzimmer' : 'Salon' },
    { icon: Home, label: language === 'it' ? 'Camere' : language === 'en' ? 'Bedrooms' : language === 'de' ? 'Schlafzimmer' : 'Chambres' },
    { icon: Briefcase, label: language === 'it' ? 'Studio' : language === 'en' ? 'Office' : language === 'de' ? 'Büro' : 'Bureau' },
    { icon: Store, label: 'Retail' },
    { icon: Hotel, label: 'Hotel' },
  ];

  const documents = [
    { icon: FileText, label: language === 'it' ? 'Scheda tecnica' : language === 'en' ? 'Technical sheet' : language === 'de' ? 'Technisches Datenblatt' : 'Fiche technique' },
    { icon: FileText, label: language === 'it' ? 'Manuale posa' : language === 'en' ? 'Installation manual' : language === 'de' ? 'Installationshandbuch' : 'Manuel de pose' },
    { icon: FileText, label: language === 'it' ? 'Istruzioni pulizia' : language === 'en' ? 'Cleaning instructions' : language === 'de' ? 'Reinigungsanweisungen' : 'Instructions de nettoyage' },
    { icon: FileText, label: language === 'it' ? 'Certificazioni' : language === 'en' ? 'Certifications' : language === 'de' ? 'Zertifizierungen' : 'Certifications' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={colorImage}
            alt={`Kalēa ${color.name}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/15" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center text-background px-6"
        >
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light mb-6 drop-shadow-lg">
            Kalēa — {color.name}
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto font-light opacity-95 drop-shadow-md">
            {language === 'it' && 'Pavimento in MgO 8,5 mm wood texture. Stabilità totale. Eleganza senza tempo.'}
            {language === 'en' && 'MgO 8.5 mm wood texture flooring. Total stability. Timeless elegance.'}
            {language === 'de' && 'MgO 8,5 mm Bodenbelag wood texture. Totale Stabilität. Zeitlose Eleganz.'}
            {language === 'fr' && 'Revêtement de sol MgO 8,5 mm wood texture. Stabilité totale. Élégance intemporelle.'}
          </p>
        </motion.div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl text-center mb-12 text-foreground"
          >
            {language === 'it' ? 'Galleria' : language === 'en' ? 'Gallery' : language === 'de' ? 'Galerie' : 'Galerie'}
          </motion.h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="aspect-square rounded-2xl overflow-hidden group cursor-pointer"
              >
                <img
                  src={colorImage}
                  alt={`${color.name} - ${i}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Color Story Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-3xl md:text-4xl mb-8 text-foreground"
            >
              {language === 'it' ? 'Storia del colore' : language === 'en' ? 'Color Story' : language === 'de' ? 'Farbgeschichte' : 'Histoire de la couleur'}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-muted-foreground leading-relaxed"
            >
              {translation.story}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Technical Specs Section */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl text-center mb-12 text-foreground"
          >
            {language === 'it' ? 'Specifiche tecniche' : language === 'en' ? 'Technical Specifications' : language === 'de' ? 'Technische Daten' : 'Spécifications techniques'}
          </motion.h2>

          <Tabs defaultValue="dimensions" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="dimensions">
                {language === 'it' ? 'Dimensioni' : language === 'en' ? 'Dimensions' : language === 'de' ? 'Abmessungen' : 'Dimensions'}
              </TabsTrigger>
              <TabsTrigger value="materials">
                {language === 'it' ? 'Materiali' : language === 'en' ? 'Materials' : language === 'de' ? 'Materialien' : 'Matériaux'}
              </TabsTrigger>
              <TabsTrigger value="installation">
                {language === 'it' ? 'Installazione' : language === 'en' ? 'Installation' : language === 'de' ? 'Installation' : 'Installation'}
              </TabsTrigger>
              <TabsTrigger value="performance">
                {language === 'it' ? 'Prestazioni' : language === 'en' ? 'Performance' : language === 'de' ? 'Leistung' : 'Performance'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dimensions" className="bg-gradient-to-br from-foreground/50 to-foreground/80 rounded-2xl p-8 text-background">
              <ul className="space-y-3">
                <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-background/60" />{language === 'it' ? 'Spessore: 8,5 mm' : language === 'en' ? 'Thickness: 8.5 mm' : language === 'de' ? 'Dicke: 8,5 mm' : 'Épaisseur: 8,5 mm'}</li>
                <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-background/60" />{language === 'it' ? 'Lunghezza: 1220 mm' : language === 'en' ? 'Length: 1220 mm' : language === 'de' ? 'Länge: 1220 mm' : 'Longueur: 1220 mm'}</li>
                <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-background/60" />{language === 'it' ? 'Larghezza: 183 mm' : language === 'en' ? 'Width: 183 mm' : language === 'de' ? 'Breite: 183 mm' : 'Largeur: 183 mm'}</li>
                <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-background/60" />{language === 'it' ? 'Peso: alta densità' : language === 'en' ? 'Weight: high density' : language === 'de' ? 'Gewicht: hohe Dichte' : 'Poids: haute densité'}</li>
              </ul>
            </TabsContent>

            <TabsContent value="materials" className="bg-gradient-to-br from-foreground/50 to-foreground/80 rounded-2xl p-8 text-background">
              <ul className="space-y-3">
                <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-background/60" />MgO premium</li>
                <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-background/60" />{language === 'it' ? 'Strato decorativo: 1,5 mm' : language === 'en' ? 'Decorative layer: 1.5 mm' : language === 'de' ? 'Dekorschicht: 1,5 mm' : 'Couche décorative: 1,5 mm'}</li>
                <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-background/60" />{language === 'it' ? 'Trattamento antibatterico' : language === 'en' ? 'Antibacterial treatment' : language === 'de' ? 'Antibakterielle Behandlung' : 'Traitement antibactérien'}</li>
                <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-background/60" />{language === 'it' ? 'Superficie antigraffio' : language === 'en' ? 'Scratch-resistant surface' : language === 'de' ? 'Kratzfeste Oberfläche' : 'Surface anti-rayures'}</li>
              </ul>
            </TabsContent>

            <TabsContent value="installation" className="bg-gradient-to-br from-foreground/50 to-foreground/80 rounded-2xl p-8 text-background">
              <ul className="space-y-3">
                <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-background/60" />{language === 'it' ? 'KalēaLock® – posa flottante rapida' : language === 'en' ? 'KalēaLock® – quick floating installation' : language === 'de' ? 'KalēaLock® – schnelle schwimmende Verlegung' : 'KalēaLock® – pose flottante rapide'}</li>
                <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-background/60" />{language === 'it' ? 'Nessuna colla' : language === 'en' ? 'No glue required' : language === 'de' ? 'Kein Kleber erforderlich' : 'Sans colle'}</li>
                <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-background/60" />{language === 'it' ? 'Può essere smontato e reinstallato' : language === 'en' ? 'Can be disassembled and reinstalled' : language === 'de' ? 'Kann demontiert und neu installiert werden' : 'Peut être démonté et réinstallé'}</li>
              </ul>
            </TabsContent>

            <TabsContent value="performance" className="bg-gradient-to-br from-foreground/50 to-foreground/80 rounded-2xl p-8 text-background">
              <ul className="space-y-3">
                <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-background/60" />{language === 'it' ? 'Impermeabile 100%' : language === 'en' ? '100% waterproof' : language === 'de' ? '100% wasserdicht' : '100% imperméable'}</li>
                <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-background/60" />Zero VOC</li>
                <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-background/60" />{language === 'it' ? 'Antimuffa' : language === 'en' ? 'Anti-mold' : language === 'de' ? 'Schimmelresistent' : 'Anti-moisissure'}</li>
                <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-background/60" />{language === 'it' ? 'Antiumidità' : language === 'en' ? 'Moisture resistant' : language === 'de' ? 'Feuchtigkeitsbeständig' : 'Résistant à l\'humidité'}</li>
                <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-background/60" />{language === 'it' ? 'Alta stabilità contro dilatazioni' : language === 'en' ? 'High stability against expansion' : language === 'de' ? 'Hohe Stabilität gegen Ausdehnung' : 'Haute stabilité contre la dilatation'}</li>
                <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-background/60" />{language === 'it' ? 'Compatibile riscaldamento a pavimento' : language === 'en' ? 'Underfloor heating compatible' : language === 'de' ? 'Fußbodenheizungskompatibel' : 'Compatible chauffage au sol'}</li>
              </ul>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-3xl md:text-4xl text-center mb-12 text-foreground"
            >
              {language === 'it' ? 'Perché sceglierlo' : language === 'en' ? 'Why Choose It' : language === 'de' ? 'Warum wählen' : 'Pourquoi le choisir'}
            </motion.h2>
            
            <div className="grid gap-4">
              {translation.whyChoose.map((reason, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 bg-background rounded-xl p-5 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-foreground text-lg">{reason}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Environments */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl text-center mb-12 text-foreground"
          >
            {language === 'it' ? 'Ambienti consigliati' : language === 'en' ? 'Recommended Environments' : language === 'de' ? 'Empfohlene Umgebungen' : 'Environnements recommandés'}
          </motion.h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {environments.map((env, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <env.icon className="w-8 h-8 text-primary" />
                <span className="text-sm font-medium text-foreground text-center">{env.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Sample Request */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl mb-6"
          >
            {language === 'it' ? `Richiedi un campione di ${color.name}` : language === 'en' ? `Request a sample of ${color.name}` : language === 'de' ? `Fordern Sie ein Muster von ${color.name} an` : `Demander un échantillon de ${color.name}`}
          </motion.h2>
          <Link to={`/${language}/diventa-partner`}>
            <Button size="lg" variant="secondary" className="group">
              {language === 'it' ? 'Ordina un campione' : language === 'en' ? 'Order a sample' : language === 'de' ? 'Ein Muster bestellen' : 'Commander un échantillon'}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Documents Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl text-center mb-12 text-foreground"
          >
            {language === 'it' ? 'Documenti' : language === 'en' ? 'Documents' : language === 'de' ? 'Dokumente' : 'Documents'}
          </motion.h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {documents.map((doc, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-background hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
              >
                <Download className="w-8 h-8 text-primary" />
                <span className="text-sm font-medium text-foreground text-center">{doc.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Related Colors */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl text-center mb-12 text-foreground"
          >
            {language === 'it' ? 'Colori correlati' : language === 'en' ? 'Related Colors' : language === 'de' ? 'Verwandte Farben' : 'Couleurs associées'}
          </motion.h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {relatedColors.map((relatedColor, index) => (
              <motion.div
                key={relatedColor.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/${language}/colore/${relatedColor.slug}`}
                  className="block group"
                >
                  <div className="aspect-square rounded-2xl overflow-hidden mb-4 shadow-lg">
                    <img
                      src={imageMap[relatedColor.slug] || finishCorteccia}
                      alt={relatedColor.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <h3 className="font-display text-xl text-center text-foreground group-hover:text-primary transition-colors">
                    {relatedColor.name}
                  </h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ColorProductPage;
