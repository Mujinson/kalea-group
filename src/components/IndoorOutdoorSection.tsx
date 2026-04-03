import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import cardIndoor from "@/assets/card-indoor-new.jpg";
import cardOutdoor from "@/assets/card-outdoor.jpg";

const IndoorOutdoorSection = () => {
  const { language, t } = useTranslation();

  const sections = [
    {
      title: t('indoorOutdoor.indoor.title'),
      description: t('indoorOutdoor.indoor.description'),
      buttonText: t('indoorOutdoor.indoor.button'),
      link: `/${language}/indoor`,
      image: cardIndoor,
    },
    {
      title: t('indoorOutdoor.outdoor.title'),
      description: t('indoorOutdoor.outdoor.description'),
      buttonText: t('indoorOutdoor.outdoor.button'),
      link: `/${language}/outdoor`,
      image: cardOutdoor,
    },
  ];

  return (
    <section className="relative min-h-screen bg-background px-4 md:px-8 lg:px-12 flex flex-col justify-center overflow-hidden py-10">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 md:mb-12 max-w-3xl mx-auto"
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-3">
          {language === 'it' ? 'Soluzioni per Ogni Ambiente' :
           language === 'en' ? 'Solutions for Every Space' :
           language === 'de' ? 'Lösungen für jeden Raum' :
           'Solutions pour Chaque Espace'}
        </h2>
        <p className="text-base md:text-lg text-foreground/70">
          {language === 'it' ? 'Pavimenti flottanti di design per interni ed esterni, progettati per durare nel tempo' :
           language === 'en' ? 'Designer floating floors for indoor and outdoor, built to last' :
           language === 'de' ? 'Design-Schwimmböden für Innen- und Außenbereiche, gebaut für die Ewigkeit' :
           'Sols flottants design pour intérieur et extérieur, conçus pour durer'}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-h-[60vh] md:max-h-[55vh] lg:max-h-[65vh]">
        {sections.map((section, index) => (
          <Link
            key={section.title}
            to={section.link}
            className="block h-full"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="relative group overflow-hidden rounded-2xl md:rounded-3xl min-h-0 h-full cursor-pointer"
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
                  <span
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-full text-white text-sm font-medium transition-all duration-300 group-hover:bg-white group-hover:text-[#3F3B33] group-hover:border-white"
                  >
                    {section.buttonText}
                    <ArrowRight 
                      size={16} 
                      className="transition-transform duration-300 group-hover:translate-x-1" 
                    />
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default IndoorOutdoorSection;
