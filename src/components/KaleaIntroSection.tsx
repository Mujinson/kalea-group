import { motion } from "framer-motion";
import { Leaf, Zap, Shield, ShieldCheck, Award, Sparkles } from "lucide-react";

interface KaleaIntroSectionProps {
  variant?: "home" | "about";
}

const KaleaIntroSection = ({ variant = "home" }: KaleaIntroSectionProps) => {
  const bgStyle = variant === "about" 
    ? "bg-gradient-to-b from-muted/20 to-background" 
    : "";

  return (
    <section 
      className={`py-[110px] ${bgStyle}`}
      style={{
        background: variant === "home" 
          ? "linear-gradient(135deg, #F5F4F2 0%, #FFFFFF 40%, #F5F4F2 100%)" 
          : undefined
      }}
    >
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
              className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-10 leading-tight"
              style={{ color: "#2B2B2B" }}
            >
              Kalēa è la nuova generazione di superfici in MgO.
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
              style={{ maxWidth: "65ch" }}
            >
              <div>
                <h4 className="text-xl font-heading font-semibold mb-3" style={{ color: "#2B2B2B" }}>
                  Responsabilità verso il pianeta.
                </h4>
                <p className="text-lg leading-relaxed" style={{ color: "#2B2B2B", lineHeight: "1.6" }}>
                  La produzione dei nostri pannelli in MgO richiede fino a 1/10 dell'energia necessaria per realizzare SPC, laminati, legno ingegnerizzato o HPL. Meno energia significa meno emissioni, meno rifiuti e una filiera più trasparente.
                </p>
              </div>

              <div>
                <h4 className="text-xl font-heading font-semibold mb-3" style={{ color: "#2B2B2B" }}>
                  Superfici progettate per durare.
                </h4>
                <p className="text-lg leading-relaxed" style={{ color: "#2B2B2B", lineHeight: "1.6" }}>
                  Resistono al fuoco, all'acqua, agli urti, alla muffa e alle condizioni più estreme. Durano nel tempo, richiedono poca manutenzione e migliorano la qualità della vita in ogni ambiente.
                </p>
              </div>

              <div>
                <h4 className="text-xl font-heading font-semibold" style={{ color: "#2B2B2B" }}>
                  Kalēa è un modo nuovo di costruire: più intelligente, più sicuro, più sostenibile.
                </h4>
              </div>
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
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(245, 244, 242, 0.98))",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                boxShadow: "0 28px 80px rgba(0, 0, 0, 0.12)",
                padding: "48px 40px",
                border: "1px solid rgba(43, 43, 43, 0.08)",
              }}
              whileHover={{
                y: -6,
                scale: 1.015,
                boxShadow: "0 36px 90px rgba(0, 0, 0, 0.18)",
                transition: { duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }
              }}
            >
              <h3 className="text-2xl font-heading font-semibold mb-8" style={{ color: "#2B2B2B" }}>
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
                  <div className="p-2.5 rounded-xl bg-[#2B2B2B]/5 backdrop-blur-sm group-hover:bg-[#2B2B2B]/10 transition-all duration-200 flex-shrink-0">
                    <Leaf className="w-6 h-6" style={{ color: "#2B2B2B" }} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-medium text-lg leading-tight" style={{ color: "#2B2B2B" }}>
                      Materiali avanzati in MgO
                    </p>
                    <p className="text-sm mt-1 font-light" style={{ color: "rgba(43, 43, 43, 0.65)" }}>
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
                  <div className="p-2.5 rounded-xl bg-[#2B2B2B]/5 backdrop-blur-sm group-hover:bg-[#2B2B2B]/10 transition-all duration-200 flex-shrink-0">
                    <Zap className="w-6 h-6" style={{ color: "#2B2B2B" }} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-medium text-lg leading-tight" style={{ color: "#2B2B2B" }}>
                      Fino a 1/10 dell'energia produttiva
                    </p>
                    <p className="text-sm mt-1 font-light" style={{ color: "rgba(43, 43, 43, 0.65)" }}>
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
                  <div className="p-2.5 rounded-xl bg-[#2B2B2B]/5 backdrop-blur-sm group-hover:bg-[#2B2B2B]/10 transition-all duration-200 flex-shrink-0">
                    <Shield className="w-6 h-6" style={{ color: "#2B2B2B" }} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-medium text-lg leading-tight" style={{ color: "#2B2B2B" }}>
                      Superfici pensate per durare
                    </p>
                    <p className="text-sm mt-1 font-light" style={{ color: "rgba(43, 43, 43, 0.65)" }}>
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
                  <div className="p-2.5 rounded-xl bg-[#2B2B2B]/5 backdrop-blur-sm group-hover:bg-[#2B2B2B]/10 transition-all duration-200 flex-shrink-0">
                    <ShieldCheck className="w-6 h-6" style={{ color: "#2B2B2B" }} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-medium text-lg leading-tight" style={{ color: "#2B2B2B" }}>
                      Sicurezza superiore in ogni ambiente
                    </p>
                    <p className="text-sm mt-1 font-light" style={{ color: "rgba(43, 43, 43, 0.65)" }}>
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
                  <div className="p-2.5 rounded-xl bg-[#2B2B2B]/5 backdrop-blur-sm group-hover:bg-[#2B2B2B]/10 transition-all duration-200 flex-shrink-0">
                    <Award className="w-6 h-6" style={{ color: "#2B2B2B" }} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-medium text-lg leading-tight" style={{ color: "#2B2B2B" }}>
                      Garanzie fino a 25 anni
                    </p>
                    <p className="text-sm mt-1 font-light" style={{ color: "rgba(43, 43, 43, 0.65)" }}>
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
                  <div className="p-2.5 rounded-xl bg-[#2B2B2B]/5 backdrop-blur-sm group-hover:bg-[#2B2B2B]/10 transition-all duration-200 flex-shrink-0">
                    <Sparkles className="w-6 h-6" style={{ color: "#2B2B2B" }} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-medium text-lg leading-tight" style={{ color: "#2B2B2B" }}>
                      Design contemporaneo ispirato all'eccellenza italiana
                    </p>
                    <p className="text-sm mt-1 font-light" style={{ color: "rgba(43, 43, 43, 0.65)" }}>
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
