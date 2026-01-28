import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Home, FileText, Users, Mail, ArrowRight } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import logoImage from "@/assets/logo-new.png";

interface WelcomeCard {
  icon: typeof Home;
  title: string;
  description: string;
  link: string;
  gradient: string;
}

const Welcome = () => {
  const { language } = useTranslation();

  const cards: WelcomeCard[] = [
    {
      icon: Home,
      title: "Scopri Kalēa",
      description: "Esplora il nostro sistema integrato per superfici contemporanee",
      link: `/${language}`,
      gradient: "from-[#1a1a1a] to-[#2d2d2d]",
    },
    {
      icon: FileText,
      title: "Area Tecnica",
      description: "Schede tecniche, certificazioni e documentazione",
      link: `/${language}/area-tecnica`,
      gradient: "from-[#2d2d2d] to-[#3d3d3d]",
    },
    {
      icon: Users,
      title: "Diventa Partner",
      description: "Collabora con noi come rivenditore o professionista",
      link: `/${language}/diventa-partner`,
      gradient: "from-[#3d3d3d] to-[#4d4d4d]",
    },
    {
      icon: Mail,
      title: "Contattaci",
      description: "Richiedi informazioni o preventivi personalizzati",
      link: `/${language}/contatti`,
      gradient: "from-[#4d4d4d] to-[#5d5d5d]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <img 
          src={logoImage} 
          alt="Kalēa" 
          className="h-12 md:h-16 w-auto brightness-0 invert"
        />
      </motion.div>

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-4">
          Benvenuto in Kalēa
        </h1>
        <p className="text-white/60 text-lg md:text-xl max-w-md mx-auto">
          Surface System® — Superfici contemporanee per interni ed esterni
        </p>
      </motion.div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 w-full max-w-2xl">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
          >
            <Link
              to={card.link}
              className={`group relative block p-6 md:p-8 rounded-2xl bg-gradient-to-br ${card.gradient} border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}
            >
              <card.icon className="w-8 h-8 text-white/80 mb-4 group-hover:text-white transition-colors" />
              
              <h3 className="text-xl md:text-2xl font-heading font-semibold text-white mb-2">
                {card.title}
              </h3>
              
              <p className="text-white/60 text-sm md:text-base mb-4">
                {card.description}
              </p>
              
              <div className="flex items-center gap-2 text-white/50 group-hover:text-white/80 transition-colors">
                <span className="text-sm font-medium">Vai</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-12 text-white/40 text-sm"
      >
        © {new Date().getFullYear()} Kalēa Surface System®
      </motion.p>
    </div>
  );
};

export default Welcome;
