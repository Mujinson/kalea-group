import { motion } from "framer-motion";
import { Leaf, Zap, Shield, ShieldCheck, Award, Sparkles } from "lucide-react";

interface KaleaIntroSectionProps {
  variant?: "home" | "about";
}

const KaleaIntroSection = ({ variant = "home" }: KaleaIntroSectionProps) => {
  const bgStyle = variant === "about" 
    ? "bg-gradient-to-b from-muted/20 to-background" 
    : "bg-gradient-to-b from-background via-muted/10 to-background";

  return (
    <section className={`section-spacing ${bgStyle}`}>
      <div className="w-full px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-[1400px] mx-auto">
          {/* Left Column - Text Content (55%) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 flex flex-col justify-center"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-8 leading-tight"
            >
              Chi è Kalēa
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6 text-lg text-muted-foreground leading-relaxed"
              style={{ maxWidth: "65ch" }}
            >
              <p>
                Kalēa nasce per introdurre nel mercato italiano materiali avanzati, sicuri e realmente sostenibili.
                Combiniamo design contemporaneo, tecnologia e MgO di nuova generazione per offrire pavimentazioni e rivestimenti più stabili, più performanti e più duraturi rispetto ai materiali tradizionali.
              </p>

              <p>
                Crediamo nella responsabilità verso il pianeta.
                Per questo utilizziamo un materiale inorganico ad impatto ambientale estremamente ridotto: la produzione dei nostri pannelli e pavimenti in MgO richiede fino a 1/10 dell'energia necessaria per realizzare pavimenti SPC, laminati, legno ingegnerizzato, HPL o pannelli compositi tradizionali.
                Un processo produttivo più pulito significa meno emissioni, meno rifiuti e una filiera più trasparente.
              </p>

              <p>
                La nostra missione è portare negli spazi italiani superfici che durano nel tempo, resistono alle condizioni più estreme, riducono i costi di manutenzione e contribuiscono a migliorare la qualità della vita quotidiana.
                Materiali più intelligenti, più sicuri e più rispettosi dell'ambiente: questa è la nuova generazione di superfici Kalēa.
              </p>
            </motion.div>
          </motion.div>

          {/* Right Column - Glass Brand Card (45%) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="lg:col-span-5 flex items-center"
          >
            <motion.div
              className="kalea-brand-card w-full"
              style={{
                borderRadius: "32px",
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.18), rgba(0, 0, 0, 0.40))",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                boxShadow: "0 28px 80px rgba(0, 0, 0, 0.35)",
                padding: "48px 40px",
                border: "1px solid rgba(255, 255, 255, 0.12)",
              }}
              whileHover={{
                y: -6,
                scale: 1.015,
                boxShadow: "0 36px 90px rgba(0, 0, 0, 0.45)",
                transition: { duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }
              }}
            >
              <h3 className="text-2xl font-heading font-semibold text-white mb-8">
                La nostra visione
              </h3>

              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="flex items-start gap-4 group"
                >
                  <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm group-hover:bg-white/15 transition-all duration-200 flex-shrink-0">
                    <Leaf className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-white font-medium text-lg leading-tight">
                      Materiali avanzati in MgO
                    </p>
                    <p className="text-white/70 text-sm mt-1 font-light">
                      Nuova generazione di superfici
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.65 }}
                  className="flex items-start gap-4 group"
                >
                  <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm group-hover:bg-white/15 transition-all duration-200 flex-shrink-0">
                    <Zap className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-white font-medium text-lg leading-tight">
                      Fino a 1/10 dell'energia produttiva
                    </p>
                    <p className="text-white/70 text-sm mt-1 font-light">
                      Minori emissioni, minori rifiuti, maggiore sostenibilità
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="flex items-start gap-4 group"
                >
                  <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm group-hover:bg-white/15 transition-all duration-200 flex-shrink-0">
                    <Shield className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-white font-medium text-lg leading-tight">
                      Superfici pensate per durare
                    </p>
                    <p className="text-white/70 text-sm mt-1 font-light">
                      Massima resistenza e longevità
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.75 }}
                  className="flex items-start gap-4 group"
                >
                  <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm group-hover:bg-white/15 transition-all duration-200 flex-shrink-0">
                    <ShieldCheck className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-white font-medium text-lg leading-tight">
                      Sicurezza superiore in ogni ambiente
                    </p>
                    <p className="text-white/70 text-sm mt-1 font-light">
                      Ignifugo, impermeabile, antimuffa
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="flex items-start gap-4 group"
                >
                  <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm group-hover:bg-white/15 transition-all duration-200 flex-shrink-0">
                    <Award className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-white font-medium text-lg leading-tight">
                      Garanzie fino a 25 anni
                    </p>
                    <p className="text-white/70 text-sm mt-1 font-light">
                      25 anni residenziale — 15 anni commerciale
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.85 }}
                  className="flex items-start gap-4 group"
                >
                  <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm group-hover:bg-white/15 transition-all duration-200 flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-white font-medium text-lg leading-tight">
                      Design contemporaneo ispirato all'eccellenza italiana
                    </p>
                    <p className="text-white/70 text-sm mt-1 font-light">
                      Superfici curate, versatili e pensate per ogni ambiente
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default KaleaIntroSection;
