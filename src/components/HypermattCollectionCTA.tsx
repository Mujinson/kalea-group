import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";

import ctaXlAmbient from "@/assets/hero-hypermatt-xl.jpg";
import ctaSpinaAmbient from "@/assets/hero-hypermatt-spina.jpg";
import cta55Ambient from "@/assets/hero-hypermatt55.jpg";

interface CollectionLink {
  title: string;
  image: string;
  path: string;
}

const allCollections: Record<string, CollectionLink> = {
  xl: { title: "Hypermatt XL", image: ctaXlAmbient, path: "hypermatt-xl" },
  spina: { title: "Hypermatt Spina", image: ctaSpinaAmbient, path: "hypermatt-spina" },
  "55": { title: "Hypermatt 55", image: cta55Ambient, path: "hypermatt-55" },
};

interface Props {
  /** Which collection page we're currently on – these will be excluded */
  current: "xl" | "spina" | "55";
}

const HypermattCollectionCTA = ({ current }: Props) => {
  const { language } = useTranslation();
  const others = Object.entries(allCollections).filter(([key]) => key !== current);

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h3 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-3">
            Scopri le altre collezioni Hypermatt
          </h3>
          <p className="text-muted-foreground">
            Trova la soluzione perfetta per il tuo progetto
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {others.map(([key, col], i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                to={`/${language}/${col.path}`}
                className="group block relative overflow-hidden rounded-2xl shadow-lg aspect-[16/10]"
              >
                <img
                  src={col.image}
                  alt={col.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <span className="absolute bottom-5 left-6 text-xl md:text-2xl font-heading font-bold text-white tracking-wide">
                  {col.title}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HypermattCollectionCTA;
