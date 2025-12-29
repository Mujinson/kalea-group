import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { useScroll, useTransform } from "framer-motion";
import AnimatedTitle from "@/components/AnimatedTitle";
import { 
  Volume2, 
  Droplets, 
  Shield, 
  Flame, 
  Layers, 
  ChevronDown, 
  Download, 
  Phone, 
  CheckCircle,
  X,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";
import { useIsMobile } from "@/hooks/use-mobile";
import heroIndoor from "@/assets/hero-indoor.jpg";
import bgCtaCollabora from "@/assets/bg-cta-collabora.png";

// Product data for Kalea Base underlay systems
const underlayProducts = [
  {
    id: "silence",
    name: "Kalea Base Silence",
    material: "Sughero naturale",
    icon: Volume2,
    color: "#27AE60",
    shortDesc: "Comfort acustico premium",
    description: "Granulato di sughero naturale pressato per massima riduzione del rumore da calpestio.",
    specs: [
      "Spessore: 2mm (standard) o 3mm (premium)",
      "Densità: ≥ 180-220 kg/m³",
      "Formato: Rotoli 1m × 10m",
    ],
    benefits: ["Eco-sostenibile", "Isolamento acustico", "Naturale al 100%"],
    bestFor: "Appartamenti, camere da letto, uffici silenziosi",
  },
  {
    id: "hydro",
    name: "Kalea Base Hydro",
    material: "Film PE 200μm",
    icon: Droplets,
    color: "#3498DB",
    shortDesc: "Barriera vapore professionale",
    description: "Film in polietilene LDPE ad alta densità con resistenza al vapore certificata.",
    specs: [
      "Spessore: 200 micron (0,2mm)",
      "Valore SD: > 100m",
      "Formato: Rotoli 1.5m × 50m",
    ],
    benefits: ["Standard UE", "Protezione umidità", "Facile sovrapposizione"],
    bestFor: "Massetti nuovi, piani terra, ambienti umidi",
    note: "Si abbina sempre a un altro sottopavimento",
  },
  {
    id: "pro",
    name: "Kalea Base Pro",
    material: "Gomma HD tecnica",
    icon: Shield,
    color: "#2C3E50",
    shortDesc: "Stabilità estrema",
    description: "Gomma poliuretanica ad altissima densità per superfici ad alto traffico.",
    specs: [
      "Spessore: 1.5-2mm",
      "Densità: 800-1000 kg/m³",
      "Durezza: simile al legno",
    ],
    benefits: ["Alto traffico", "Zero cedimenti", "Durabilità estrema"],
    bestFor: "Uffici, retail, spazi commerciali",
  },
  {
    id: "therm",
    name: "Kalea Base Therm",
    material: "XPO a celle chiuse",
    icon: Flame,
    color: "#E74C3C",
    shortDesc: "Riscaldamento a pavimento",
    description: "Schiuma poliolefinica con resistenza termica minima per massima conduttività.",
    specs: [
      "Spessore: 1.5mm",
      "Resistenza termica (R): < 0,01 m²K/W",
      "Celle chiuse per isolamento",
    ],
    benefits: ["Conduttività ottimale", "Compatibile radiante", "Risparmio energetico"],
    bestFor: "Impianti radianti, pavimenti riscaldati",
  },
  {
    id: "ultimate",
    name: "Kalea Base Ultimate",
    material: "Sistema accoppiato",
    icon: Layers,
    color: "#9B59B6",
    shortDesc: "Premium All-in-One",
    description: "Sistema multifunzione: gomma HD + film PE argentato + banda adesiva integrata.",
    specs: [
      "Spessore: 2mm o 3mm",
      "3 strati integrati",
      "Banda adesiva pre-applicata",
    ],
    benefits: ["Zero errori di posa", "Soluzione completa", "Massima protezione"],
    bestFor: "Installatori professionali, clienti premium",
    premium: true,
  },
];

// Configurator questions
const configuratorQuestions = [
  {
    id: "floor_heating",
    question: "Hai un impianto di riscaldamento a pavimento?",
    options: [
      { value: "yes", label: "Sì" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: "humidity",
    question: "Il massetto è nuovo o ci sono problemi di umidità?",
    options: [
      { value: "new_screed", label: "Massetto nuovo" },
      { value: "humidity", label: "Problemi di umidità" },
      { value: "dry", label: "Massetto asciutto" },
    ],
  },
  {
    id: "noise",
    question: "L'isolamento acustico è una priorità?",
    options: [
      { value: "yes", label: "Sì, molto importante" },
      { value: "no", label: "No, non prioritario" },
    ],
  },
  {
    id: "traffic",
    question: "Qual è il livello di traffico previsto?",
    options: [
      { value: "residential", label: "Residenziale" },
      { value: "commercial", label: "Commerciale/Alto traffico" },
    ],
  },
];

const Kaleabase = () => {
  const { language } = useTranslation();
  const isMobile = useIsMobile();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [configuratorAnswers, setConfiguratorAnswers] = useState<Record<string, string>>({});
  const [showRecommendation, setShowRecommendation] = useState(false);
  
  const heroRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  
  const heroScale = useTransform(heroProgress, [0, 1], isMobile ? [1, 0.96] : [1, 0.88]);
  const heroBorderRadius = useTransform(heroProgress, [0, 0.5], ["0px", isMobile ? "16px" : "28px"]);
  const heroContentOpacity = useTransform(heroProgress, [0, 0.3], [1, 0]);
  const heroContentY = useTransform(heroProgress, [0, 0.4], [0, isMobile ? -40 : -80]);
  const heroImageY = useTransform(heroProgress, [0, 1], ["0%", isMobile ? "8%" : "15%"]);

  // Recommendation logic
  const getRecommendation = () => {
    const { floor_heating, humidity, noise, traffic } = configuratorAnswers;
    
    if (floor_heating === "yes") return "therm";
    if (traffic === "commercial") return "pro";
    if (humidity === "new_screed" || humidity === "humidity") {
      if (noise === "yes") return "ultimate";
      return "hydro";
    }
    if (noise === "yes") return "silence";
    return "ultimate";
  };

  const handleConfiguratorAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...configuratorAnswers, [questionId]: value };
    setConfiguratorAnswers(newAnswers);
    
    // Show recommendation when all questions answered
    if (Object.keys(newAnswers).length === configuratorQuestions.length) {
      setShowRecommendation(true);
    }
  };

  const resetConfigurator = () => {
    setConfiguratorAnswers({});
    setShowRecommendation(false);
  };

  const recommendedProductId = getRecommendation();
  const recommendedProduct = underlayProducts.find(p => p.id === recommendedProductId);

  return (
    <div className="relative bg-background">
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen sticky top-0 z-[0]">
        <motion.div 
          className="absolute inset-0 overflow-hidden origin-center will-change-transform"
          style={{ 
            scale: heroScale,
            borderRadius: heroBorderRadius,
          }}
        >
          <motion.img 
            src={heroIndoor} 
            alt="KALEA BASE" 
            className="absolute inset-0 w-full h-full object-cover will-change-transform"
            style={{ 
              y: heroImageY,
              scale: 1.1,
            }}
            initial={{ filter: "blur(10px)", scale: 1.15 }}
            animate={{ filter: "blur(0px)", scale: 1.1 }}
            transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
        </motion.div>

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-24 md:pb-32">
          <motion.div 
            style={{ opacity: heroContentOpacity, y: heroContentY }} 
            className="container-custom text-center will-change-transform"
          >
            <div className="max-w-4xl mx-auto">
              <AnimatedTitle
                text="KALEA BASE"
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white font-bold mb-4 tracking-tight"
              />

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="text-lg md:text-xl lg:text-2xl text-white/90 font-light mb-4 max-w-3xl mx-auto"
              >
                La stabilità inizia da sotto
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="text-sm md:text-base text-white/70 font-light mb-8 max-w-2xl mx-auto"
              >
                Non offriamo un tappetino universale perché ogni cantiere è una sfida diversa.<br />
                Progettiamo sistemi modulari per proteggere il tuo investimento.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                style={{ opacity: heroContentOpacity }}
              >
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="flex justify-center"
                >
                  <ChevronDown className="w-6 h-6 text-white/60" />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modularità Section */}
      <section className="relative z-[1] bg-background py-20 md:py-32">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
              Modularità vs Integrazione
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Perché il sottopavimento NON è integrato nei nostri prodotti? Una scelta tecnica consapevole.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Droplets,
                title: "Umidità",
                description: "Ogni massetto ha un livello di umidità diverso. Il sistema modulare permette di scegliere la barriera vapore corretta.",
                color: "#3498DB",
              },
              {
                icon: Volume2,
                title: "Rumore",
                description: "Appartamento al piano alto? Ufficio open space? Ogni contesto richiede un diverso livello di isolamento acustico.",
                color: "#27AE60",
              },
              {
                icon: Flame,
                title: "Calore",
                description: "Con riscaldamento a pavimento serve massima conduttività. Senza, puoi puntare su altri fattori.",
                color: "#E74C3C",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card-surface rounded-2xl p-6 md:p-8 text-center"
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <item.icon className="w-8 h-8" style={{ color: item.color }} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Catalog */}
      <section className="relative z-[2] bg-background py-20 md:py-32">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
              Catalogo Prodotti
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Cinque soluzioni professionali per ogni esigenza tecnica.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {underlayProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={() => setSelectedProduct(selectedProduct === product.id ? null : product.id)}
                className={`relative rounded-2xl p-6 cursor-pointer transition-all duration-300 border-2 ${
                  selectedProduct === product.id 
                    ? 'bg-card-surface border-[#27AE60]' 
                    : 'bg-card-surface border-transparent hover:border-white/20'
                } ${product.premium ? 'ring-2 ring-[#9B59B6]/30' : ''}`}
              >
                {product.premium && (
                  <div className="absolute top-3 right-3 bg-[#9B59B6] text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    PREMIUM
                  </div>
                )}
                
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${product.color}20` }}
                >
                  <product.icon className="w-7 h-7" style={{ color: product.color }} />
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-1">{product.name}</h3>
                <p className="text-sm text-white/60 mb-2">{product.material}</p>
                <p className="text-sm text-white/80 mb-4">{product.shortDesc}</p>
                
                {/* Expanded content */}
                <motion.div
                  initial={false}
                  animate={{ 
                    height: selectedProduct === product.id ? "auto" : 0,
                    opacity: selectedProduct === product.id ? 1 : 0 
                  }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-white/70 mb-4">{product.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      {product.specs.map((spec, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-white/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#27AE60] mt-1.5 flex-shrink-0" />
                          <span>{spec}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {product.benefits.map((benefit, i) => (
                        <span 
                          key={i}
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ backgroundColor: `${product.color}20`, color: product.color }}
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                    
                    <p className="text-xs text-white/50">
                      <strong>Ideale per:</strong> {product.bestFor}
                    </p>
                    
                    {product.note && (
                      <p className="text-xs text-amber-400/80 mt-2 italic">
                        ⚠️ {product.note}
                      </p>
                    )}
                  </div>
                </motion.div>
                
                <div className="flex items-center justify-between mt-4 text-xs text-white/40">
                  <span>Clicca per dettagli</span>
                  <ArrowRight className={`w-4 h-4 transition-transform ${selectedProduct === product.id ? 'rotate-90' : ''}`} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Configurator Section */}
      <section className="relative z-[3] bg-[#2C3E50] py-20 md:py-32">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-4">
              Trova la tua Base
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Rispondi a poche domande e ti consiglieremo il sistema perfetto per il tuo progetto.
            </p>
          </motion.div>

          {!showRecommendation ? (
            <div className="max-w-2xl mx-auto space-y-8">
              {configuratorQuestions.map((q, qIndex) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: qIndex * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-6"
                >
                  <p className="text-white font-medium mb-4">{qIndex + 1}. {q.question}</p>
                  <div className="flex flex-wrap gap-3">
                    {q.options.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleConfiguratorAnswer(q.id, option.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          configuratorAnswers[q.id] === option.value
                            ? 'bg-[#27AE60] text-white'
                            : 'bg-white/10 text-white/80 hover:bg-white/20'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-xl mx-auto bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center"
            >
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: `${recommendedProduct?.color}30` }}
              >
                {recommendedProduct && <recommendedProduct.icon className="w-10 h-10" style={{ color: recommendedProduct.color }} />}
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">Il nostro consiglio</h3>
              <p className="text-3xl font-heading font-bold text-[#27AE60] mb-4">
                {recommendedProduct?.name}
              </p>
              <p className="text-white/70 mb-6">{recommendedProduct?.description}</p>
              
              <div className="flex flex-wrap gap-2 justify-center mb-8">
                {recommendedProduct?.benefits.map((benefit, i) => (
                  <span 
                    key={i}
                    className="flex items-center gap-1 text-sm px-3 py-1 rounded-full bg-[#27AE60]/20 text-[#27AE60]"
                  >
                    <CheckCircle className="w-3 h-3" />
                    {benefit}
                  </span>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild variant="default" className="bg-[#27AE60] hover:bg-[#27AE60]/90">
                  <Link to={`/${language}/contatti`}>
                    <Phone className="w-4 h-4 mr-2" />
                    Contatta l'ufficio tecnico
                  </Link>
                </Button>
                <Button variant="outline" onClick={resetConfigurator} className="border-white/30 text-white hover:bg-white/10">
                  <X className="w-4 h-4 mr-2" />
                  Ricomincia
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Stratigraphy Section */}
      <section className="relative z-[4] bg-background py-20 md:py-32">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Stratigrafia Corretta
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              La sequenza tecnica per una posa perfetta.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {[
              { layer: 1, name: "Massetto", desc: "Base portante, deve essere asciutto e livellato" },
              { layer: 2, name: "Barriera Vapore", desc: "Protezione dall'umidità residua (Kalea Base Hydro)" },
              { layer: 3, name: "Sottopavimento", desc: "Isolamento acustico e termico (Kalea Base Silence/Pro/Therm)" },
              { layer: 4, name: "Pavimento Kalēa", desc: "Superficie flottante con sistema click" },
            ].map((item, index) => (
              <motion.div
                key={item.layer}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center gap-6 mb-4"
              >
                <div className="w-12 h-12 rounded-full bg-[#27AE60] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {item.layer}
                </div>
                <div className="flex-1 bg-card-surface rounded-xl p-4">
                  <h4 className="text-white font-semibold">{item.name}</h4>
                  <p className="text-white/60 text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-[5] py-20 md:py-32 overflow-hidden bg-background">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgCtaCollabora})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
        
        <div className="container-custom text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-white">
              Inizia con il piede giusto
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto text-white/90">
              Scarica la guida tecnica alla posa o contatta il nostro team per un supporto personalizzato.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link to={`/${language}/contatti`}>
                  <Phone className="w-4 h-4 mr-2" />
                  Contatta l'ufficio tecnico
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Link to={`/${language}/area-tecnica`}>
                  <Download className="w-4 h-4 mr-2" />
                  Scarica la guida alla posa
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Kaleabase;
