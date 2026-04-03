import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AnimatedTitle from "@/components/AnimatedTitle";
import SEOHead from "@/components/SEOHead";
import { useTranslation } from "@/i18n/useTranslation";
import { useIsMobile } from "@/hooks/use-mobile";
import { h55Wood, h55Cement, type HypermattProduct } from "@/data/hypermattProducts";
import heroImage from "@/assets/hero-biomag-floor-new.webp";
import icon5G from "@/assets/hypermatt/5g-valinge.png";
import formatoWood from "@/assets/hypermatt/formato-wood.jpg";
import formatoGlue from "@/assets/hypermatt/formato-glue.jpg";

const Hypermatt55 = () => {
  const { language } = useTranslation();
  const isMobile = useIsMobile();
  const [selectedProduct, setSelectedProduct] = useState<HypermattProduct | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroScale = useTransform(heroProgress, [0, 1], isMobile ? [1, 0.96] : [1, 0.88]);
  const heroBorderRadius = useTransform(heroProgress, [0, 0.5], ["0px", isMobile ? "16px" : "28px"]);
  const heroContentOpacity = useTransform(heroProgress, [0, 0.3], [1, 0]);
  const heroContentY = useTransform(heroProgress, [0, 0.4], [0, isMobile ? -40 : -80]);
  const heroImageY = useTransform(heroProgress, [0, 1], ["0%", isMobile ? "8%" : "15%"]);

  const renderGallery = (title: string, description: string, products: HypermattProduct[]) => (
    <div className="mb-16 md:mb-24">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-10">
        <h3 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-3">{title}</h3>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">{description}</p>
      </motion.div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12">
        {products.map((product, index) => (
          <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.05 }} className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-32 h-32 md:w-44 md:h-44 lg:w-52 lg:h-52 rounded-full overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <button onClick={() => setSelectedProduct(product)} className="absolute -top-1 -right-1 md:top-0 md:right-0 w-8 h-8 md:w-10 md:h-10 bg-foreground/60 hover:bg-foreground/80 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm shadow-md" aria-label={`Visualizza ${product.name}`}>
                <Search className="w-4 h-4 md:w-5 md:h-5 text-background" />
              </button>
            </div>
            <h4 className="mt-4 text-sm md:text-base font-semibold text-foreground uppercase tracking-wider whitespace-nowrap">{product.name}</h4>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="relative bg-background">
      <SEOHead
        title="Hypermatt 55 — Collezione SPC Versatile | Kalēa®"
        description="Hypermatt 55: caldo ed elegante, l'alleato ideale per progetti di interior design. Effetto legno e cemento."
        keywords="hypermatt 55, spc versatile, pavimento effetto legno, pavimento effetto cemento"
      />

      {/* Hero — sticky parallax */}
      <section ref={heroRef} className="relative h-screen sticky top-0 z-[0]">
        <motion.div className="absolute inset-0 overflow-hidden origin-center will-change-transform" style={{ scale: heroScale, borderRadius: heroBorderRadius }}>
          <motion.img src={heroImage} alt="Hypermatt 55" className="absolute inset-0 w-full h-full object-cover will-change-transform" style={{ y: heroImageY, scale: 1.1 }}
            initial={{ filter: "blur(10px)", scale: 1.15 }} animate={{ filter: "blur(0px)", scale: 1.1 }} transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
        </motion.div>
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-24 md:pb-32">
          <motion.div style={{ opacity: heroContentOpacity, y: heroContentY }} className="container-custom text-center will-change-transform">
            <div className="max-w-4xl mx-auto">
              <AnimatedTitle text="Hypermatt 55" className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white font-bold mb-4 tracking-tight" />
              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} className="text-lg md:text-xl lg:text-2xl text-white/90 font-light mb-8 max-w-2xl mx-auto">
                Il formato versatile per ogni ambiente
              </motion.p>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} style={{ opacity: heroContentOpacity }}>
                <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} className="flex justify-center">
                  <ChevronDown className="w-6 h-6 text-white/60" />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* All content after hero — relative + z-index to cover the sticky hero */}
      <div className="relative z-[1]">
        {/* Description + Galleries */}
        <section className="bg-background py-20 md:py-32">
          <div className="container-custom">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">Caldo ed elegante allo stesso tempo</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Hypermatt 55 unisce estetica, resistenza e semplicità di posa, offrendo un pavimento che interpreta il calore del legno con un realismo sorprendente.
              </p>
              <p className="text-base text-muted-foreground/80 leading-relaxed mb-4">
                Le superfici riproducono venature e dettagli naturali, donando a ogni ambiente una sensazione autentica e accogliente. Il sistema d'incastro <strong>5G</strong> permette una posa flottante rapida e senza colla, ideale anche sopra pavimenti esistenti.
              </p>
              <p className="text-base text-muted-foreground/80 leading-relaxed">
                Grazie al suo spessore ridotto e al materassino integrato, Hypermatt 55 è la soluzione perfetta per ristrutturazioni e nuove installazioni. <strong>Resistente, realistico e confortevole.</strong>
              </p>
            </motion.div>

            {renderGallery(
              "Wood",
              "Nodi e venature esaltano l'esperienza tattile e visiva del legno.",
              h55Wood
            )}
            {renderGallery(
              "Cement",
              "La forza del cemento spicca nella matericità delle trame e nelle sfumature di colore.",
              h55Cement
            )}
          </div>
        </section>

        {/* Specifiche Tecniche */}
        <section className="bg-muted py-20 md:py-28">
          <div className="container-custom">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">Specifiche Tecniche</h2>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">Prestazioni certificate per ogni ambiente</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* SPC 5G */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="bg-card rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl font-heading font-bold text-foreground mb-4">SPECIFICHE TECNICHE</h3>
                <div className="mb-4">
                  <img src={formatoWood} alt="Formato tavola 228,6x1524 mm" className="max-w-[200px] h-auto" />
                </div>
                <p className="text-sm text-muted-foreground mb-6">228,6x1524 mm</p>

                <h4 className="text-lg font-heading font-semibold text-foreground mb-4">Specifiche tecniche</h4>
                <div className="space-y-0 divide-y divide-border">
                  {[
                    { label: "Formato", value: "228,6x1524 mm" },
                    { label: "Spessore", value: "5,5 mm" },
                    { label: "Classe D'uso", value: "23/33" },
                    { label: "Incastro", value: "5G" },
                    { label: "Resistenza Al Fuoco", value: "Bfl-s1" },
                    { label: "Materassino", value: "IXPE 1 mm" },
                    { label: "Strato D'usura", value: "0,55 mm" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center py-3">
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <span className="text-sm font-bold text-foreground">{value}</span>
                    </div>
                  ))}
                </div>

                {/* 5G Icon */}
                <div className="mt-8 flex items-center gap-4">
                  <img src={icon5G} alt="5G Välinge" className="w-12 h-12" />
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mt-4">
                  SPC effetto legno, tavole formato <strong>228,6 x 1524 mm</strong> con spessore ridotto <strong>5,5 mm</strong>.
                  Resistente ad acqua e usura. Facilità di installazione con <strong>aggancio a secco 5G</strong> e materassino fonoassorbente incorporato.
                  A questo straordinario livello di realismo si aggiunge l'innovativa <strong>Hypermatt Laser Technology</strong>.
                </p>
              </motion.div>

              {/* Glue Down */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-card rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl font-heading font-bold text-foreground mb-4">SPECIFICHE TECNICHE GLUE DOWN</h3>
                <div className="mb-4">
                  <img src={formatoGlue} alt="Formato Glue Down 230x1500 mm" className="max-w-[200px] h-auto" />
                </div>
                <p className="text-sm text-muted-foreground mb-6">230x1500 mm</p>

                <h4 className="text-lg font-heading font-semibold text-foreground mb-4">Specifiche tecniche</h4>
                <div className="space-y-0 divide-y divide-border">
                  {[
                    { label: "Formato", value: "230x1500 mm" },
                    { label: "Spessore", value: "2,5 mm" },
                    { label: "Classe D'uso", value: "23/33/42" },
                    { label: "Incastro", value: "-" },
                    { label: "Resistenza Al Fuoco", value: "Bfl-s1" },
                    { label: "Materassino", value: "-" },
                    { label: "Strato D'usura", value: "0,55 mm" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center py-3">
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <span className="text-sm font-bold text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary py-16 md:py-24">
          <div className="container-custom text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h3 className="text-2xl md:text-3xl font-heading font-bold text-primary-foreground mb-3">Scopri le altre collezioni Hypermatt</h3>
              <p className="text-primary-foreground/80 mb-8">Trova la soluzione perfetta per il tuo progetto</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button asChild variant="outline" className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"><Link to={`/${language}/hypermatt-xl`}>Hypermatt XL</Link></Button>
                <Button asChild variant="outline" className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"><Link to={`/${language}/hypermatt-spina`}>Hypermatt Spina</Link></Button>
                <Button asChild className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"><Link to={`/${language}/contatti`}>Richiedi Campionatura</Link></Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Lightbox */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-lg p-0 bg-transparent border-none shadow-none [&>button]:hidden">
          {selectedProduct && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative flex flex-col items-center">
              <button onClick={() => setSelectedProduct(null)} className="absolute -top-4 -right-4 w-10 h-10 bg-foreground/90 hover:bg-foreground rounded-full flex items-center justify-center z-50 shadow-lg" aria-label="Chiudi">
                <X className="w-5 h-5 text-background" />
              </button>
              <div className="bg-card/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-auto max-h-[70vh] object-contain rounded-xl" />
                <p className="text-center mt-4 text-lg font-semibold text-foreground uppercase tracking-wider">{selectedProduct.name}</p>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Hypermatt55;
