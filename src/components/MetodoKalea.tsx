import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import m1 from "@/assets/metodo/metodo-1.png.asset.json";
import m2 from "@/assets/metodo/metodo-2.png.asset.json";
import m3 from "@/assets/metodo/metodo-3.png.asset.json";
import m4 from "@/assets/metodo/metodo-4.png.asset.json";
import m5 from "@/assets/metodo/metodo-5.png.asset.json";
import m6 from "@/assets/metodo/metodo-6.png.asset.json";
import m7 from "@/assets/metodo/metodo-7.png.asset.json";
import m8 from "@/assets/metodo/metodo-8.png.asset.json";
import m9 from "@/assets/metodo/metodo-9.png.asset.json";
import m10 from "@/assets/metodo/metodo-10.png.asset.json";

const steps = [
  { n: "01", title: "L'Idea", subtitle: "Ogni grande progetto nasce da una visione.", img: m1.url },
  { n: "02", title: "Il Sopralluogo", subtitle: "Le scelte migliori iniziano da un'analisi accurata.", img: m2.url },
  { n: "03", title: "La Scelta", subtitle: "Ogni ambiente merita il pavimento giusto.", img: m3.url },
  { n: "04", title: "La Fornitura", subtitle: "Materiali selezionati. Consegna senza pensieri.", img: m4.url },
  { n: "05", title: "Il Fondo", subtitle: "La qualità di un pavimento inizia da ciò che non si vede.", img: m5.url },
  { n: "06", title: "La Posa", subtitle: "La precisione è il dettaglio che dura negli anni.", img: m6.url },
  { n: "07", title: "Le Finiture", subtitle: "È qui che una casa acquista carattere.", img: m7.url },
  { n: "08", title: "Il Controllo", subtitle: "Ogni dettaglio viene verificato.", img: m8.url },
  { n: "09", title: "La Consegna", subtitle: "La casa che avevi immaginato.", img: m9.url },
  { n: "10", title: "Il Risultato", subtitle: "Niente promesse. Solo risultati straordinari.", img: m10.url },
];

const MetodoKalea = () => {
  return (
    <section className="relative bg-background py-10 md:py-12 px-6 md:px-12 lg:px-20">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-10"
        >
          <p className="font-heading tracking-[0.3em] text-xs text-foreground/60 mb-3">
            IL METODO KALĒA<span className="whitespace-nowrap">®</span>
          </p>
          <div className="w-10 h-px bg-kalea-tan mx-auto mb-5" />
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-light text-foreground mb-3">
            Dieci passi. <span className="italic text-kalea-tan">Un risultato.</span>
          </h2>
          <p className="text-sm md:text-base text-foreground/70 max-w-xl mx-auto">
            Un processo sartoriale che accompagna ogni progetto dalla prima idea al pavimento posato.
          </p>
        </motion.div>

        {/* Editorial grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3">
          {steps.map((s, i) => (
            <motion.article
              key={s.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: (i % 5) * 0.06 }}
              className="group relative overflow-hidden rounded-lg aspect-[3/4] bg-kalea-cream/60"
            >
              <img
                src={s.img}
                alt={s.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-contain p-1 transition-transform duration-[1200ms] ease-out group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-between p-2.5 md:p-3">
                <div className="flex items-center gap-2 text-white/90">
                  <span className="font-heading text-[10px] tracking-[0.25em]">{s.n}</span>
                  <span className="h-px flex-1 bg-white/40" />
                </div>
                <div>
                  <h3 className="font-heading text-white text-sm md:text-base leading-tight mb-1">
                    {s.title}
                  </h3>
                  <p className="text-white/85 text-[10px] leading-snug line-clamp-2">
                    {s.subtitle}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* CTA WhatsApp */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mt-8 md:mt-10"
        >
          <a
            href="https://wa.me/393520351738?text=Ciao%2C%20vorrei%20richiedere%20un%20preventivo%20gratuito%20per%20i%20vostri%20pavimenti."
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-medium rounded-full px-8 py-3.5 shadow-[0_4px_20px_rgba(74,42,19,0.18)] ring-1 ring-kalea-tan/30 hover:bg-primary/90 hover:shadow-[0_6px_24px_rgba(74,42,19,0.24)] hover:ring-kalea-tan/50 transition-all duration-150"
          >
            <MessageCircle className="w-4 h-4" />
            Contattaci per un preventivo gratuito
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default MetodoKalea;
