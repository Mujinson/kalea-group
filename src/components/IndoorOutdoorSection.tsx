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
    <section className="relative h-[100svh] bg-background px-4 md:px-8 lg:px-12 py-8 md:py-16 flex flex-col overflow-hidden">
      <div className="grid flex-1 min-h-0 grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1 gap-4 md:gap-6">
        {sections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            className="relative group overflow-hidden rounded-2xl md:rounded-3xl min-h-0"
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
