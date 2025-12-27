import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import cardIndoor from "@/assets/card-indoor.jpg";
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
    <section className="relative min-h-screen bg-background">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
        {sections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            className="relative group overflow-hidden min-h-[50vh] md:min-h-screen"
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
            <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-12 lg:p-16">
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.2 }}
                className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-4"
              >
                {section.title}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.2 }}
                className="text-base md:text-lg text-white/90 mb-6 max-w-md leading-relaxed"
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
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-full text-white font-medium transition-all duration-300 hover:bg-white hover:text-[#3F3B33] hover:border-white group/btn"
                >
                  {section.buttonText}
                  <ArrowRight 
                    size={18} 
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
