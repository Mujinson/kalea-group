import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import cardIndoor from "@/assets/card-indoor-new.jpg";
import cardOutdoor from "@/assets/card-outdoor.jpg";

const IndoorOutdoorSection = () => {
  const { language } = useTranslation();

  const sections = [
    {
      title: "Indoor",
      description: "Soluzioni per interni ad alte prestazioni. Pavimenti e sistemi innovativi per abitazioni e spazi commerciali.",
      buttonText: "Scopri Indoor",
      link: `/${language}/indoor`,
      image: cardIndoor,
    },
    {
      title: "Outdoor",
      description: "Materiali progettati per resistere all'esterno. Design, durata e funzionalità per ogni ambiente outdoor.",
      buttonText: "Scopri Outdoor",
      link: `/${language}/outdoor`,
      image: cardOutdoor,
    },
  ];

  return (
    <section className="relative min-h-screen bg-background py-10 md:py-16 px-4 md:px-8 lg:px-12 overflow-x-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full max-w-full">
        {sections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            className="relative group overflow-hidden rounded-2xl md:rounded-3xl aspect-[4/3] md:aspect-[16/10]"
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={section.image}
                alt={section.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-10 lg:p-12">
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.2 }}
                className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-3"
              >
                {section.title}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.2 }}
                className="text-sm md:text-base text-white/90 mb-5 max-w-md leading-relaxed"
              >
                {section.description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.2 }}
              >
                <Link
                  to={section.link}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-full text-white text-sm font-medium transition-all duration-300 hover:bg-white hover:text-[#3F3B33] hover:border-white group/btn"
                >
                  {section.buttonText}
                  <ArrowRight 
                    size={16} 
                    className="transition-transform duration-300 group-hover/btn:translate-x-1" 
                  />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default IndoorOutdoorSection;
