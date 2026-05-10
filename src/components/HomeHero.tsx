import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import heroImage from "@/assets/hero-home-new.jpg";
import logoImage from "@/assets/logo-kalea-cream.png";
import cardIndoor from "@/assets/card-indoor-new.jpg";
import cardOutdoor from "@/assets/card-outdoor.jpg";

const words = ["Innovate", "Living", "Nature"];

const HomeHero = () => {
  const { t, language } = useTranslation();

  return (
    <>
      <section className="relative h-screen w-full overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Kalēa® Surface System®" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center">
          {/* H1 for SEO - visually hidden but accessible */}
          <h1 className="sr-only">
            Kalēa® — Surface System® | Superfici di pregio per interni ed esterni
          </h1>
          
          {/* Centered Logo */}
          <motion.img
            src={logoImage}
            alt="Kalēa® Surface System®"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="w-48 sm:w-64 md:w-80 lg:w-96 xl:w-[28rem] h-auto brightness-0 invert drop-shadow-2xl"
          />


          {/* Payoff */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="mt-4 text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium tracking-[0.2em] drop-shadow-lg flex items-center gap-1"
          >
            {words.map((word, index) => (
              <span key={word} className="flex items-center">
                <motion.span
                  animate={{
                    scale: [1, 1.15, 1.15, 1],
                    color: ["#FFFFFF", "#1a1a1a", "#1a1a1a", "#FFFFFF"],
                  }}
                  transition={{
                    duration: 1.2,
                    times: [0, 0.2, 0.8, 1],
                    delay: index * 1.5,
                    repeat: Infinity,
                    repeatDelay: (words.length - 1) * 1.5,
                    ease: "easeInOut",
                  }}
                  className="inline-block origin-center"
                >
                  {word}
                </motion.span>
                {index < words.length - 1 && (
                  <span className="mx-2 sm:mx-3">|</span>
                )}
              </span>
            ))}
          </motion.div>
        </div>

        {/* CTA Buttons - positioned at bottom */}
        <div className="absolute bottom-16 md:bottom-24 left-0 right-0 z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link 
              to={`/${language}/diventa-partner`}
              className="group inline-flex items-center justify-center gap-2 bg-white text-[#111] text-sm font-medium rounded-xl px-8 py-3.5 hover:bg-[#F3F3F3] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-150"
            >
              {t('hero.home.ctaInfo')}
            </Link>
            <Link 
              to={`/${language}/indoor`}
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white text-sm font-medium rounded-xl px-8 py-3.5 hover:bg-white/10 transition-all duration-150 backdrop-blur-sm"
            >
              {t('hero.home.ctaProducts')}
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export const HomeDescription = () => {
  const { t, language } = useTranslation();
  return (
    <section className="bg-[#F7F1E7] min-h-screen flex items-center justify-center">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-[#4A2A13] text-2xl sm:text-3xl md:text-4xl font-light tracking-[0.12em] mb-4"
        >
          {t('homeHero.title')}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          className="text-[#4A2A13]/80 text-base sm:text-lg md:text-xl leading-relaxed font-light tracking-wide mb-10"
        >
          {t('homeHero.subtitle')}
        </motion.p>

        {/* Indoor / Outdoor Cards */}
        <div className="grid grid-cols-2 gap-4 md:gap-6 mb-10 w-full max-w-2xl mx-auto">
          {[
            { title: t('homeHero.indoorTitle'), desc: t('homeHero.indoorDesc'), link: `/${language}/indoor`, image: cardIndoor },
            { title: t('homeHero.outdoorTitle'), desc: t('homeHero.outdoorDesc'), link: `/${language}/outdoor`, image: cardOutdoor },
          ].map((card, i) => (
            <Link key={card.title} to={card.link} className="block">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
                whileHover={{ y: -6, boxShadow: "0 16px 48px rgba(0,0,0,0.2)" }}
                className="relative group overflow-hidden rounded-2xl min-h-[220px] sm:min-h-[250px] md:min-h-[280px] cursor-pointer"
              >
                <img src={card.image} alt={card.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.65) 100%)" }} />
                <div className="relative z-10 h-full flex flex-col items-center justify-end text-center p-4 md:p-6">
                  <h3 className="text-base md:text-lg lg:text-xl font-heading font-semibold text-white mb-1.5 tracking-wide" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>{card.title}</h3>
                  <p className="text-[11px] md:text-sm text-white/90 leading-relaxed line-clamp-3 mb-2 font-medium" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.85)" }}>{card.desc}</p>
                  <span className="inline-flex items-center gap-2 text-[10px] md:text-xs font-medium text-white" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.55)" }}>
                    {t('homeHero.discover')} <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="text-[#4A2A13] text-base sm:text-lg md:text-xl leading-relaxed font-light tracking-wide"
        >
          {t('homeHero.bottomText1')}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
          className="mt-6 text-[#4A2A13]/75 text-sm sm:text-base md:text-lg leading-relaxed font-light tracking-wide"
        >
          {t('homeHero.bottomText2')}
        </motion.p>
      </div>
    </section>
  );
};

export default HomeHero;
