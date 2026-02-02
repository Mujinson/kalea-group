import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";
import heroImage from "@/assets/hero-home-new.jpg";
import logoImage from "@/assets/logo-kalea-cream.png";

const words = ["Innovate", "Living", "Nature"];

const HomeHero = () => {
  const { t, language } = useTranslation();

  return (
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
        {/* Centered Logo */}
        <motion.img
          src={logoImage}
          alt="Kalēa®"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="w-48 sm:w-64 md:w-80 lg:w-96 xl:w-[28rem] h-auto brightness-0 invert drop-shadow-2xl"
        />
        
        {/* Payoff with continuous zoom-out animation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="mt-1 text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium tracking-[0.2em] drop-shadow-lg flex items-center gap-1"
        >
          {words.map((word, index) => (
            <span key={word} className="flex items-center">
              <motion.span
                animate={{
                  scale: [1, 1.15, 1],
                  color: ["#FFFFFF", "#1a1a1a", "#FFFFFF"],
                }}
                transition={{
                  duration: 1.2,
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
  );
};

export default HomeHero;
