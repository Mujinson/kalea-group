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
}

const Welcome = () => {
  const { language } = useTranslation();

  const cards: WelcomeCard[] = [
    {
      icon: Home,
      title: "Scopri Kalēa",
      description: "Esplora il nostro sistema integrato per superfici contemporanee",
      link: `/${language}`,
    },
    {
      icon: FileText,
      title: "Area Tecnica",
      description: "Schede tecniche, certificazioni e documentazione",
      link: `/${language}/area-tecnica`,
    },
    {
      icon: Users,
      title: "Diventa Partner",
      description: "Collabora con noi come rivenditore o professionista",
      link: `/${language}/diventa-partner`,
    },
    {
      icon: Mail,
      title: "Contattaci",
      description: "Richiedi informazioni o preventivi personalizzati",
      link: `/${language}/contatti`,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
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
          className="h-12 md:h-16 w-auto"
        />
      </motion.div>

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
          Benvenuto in Kalēa
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-md mx-auto">
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
              className="group relative block p-6 md:p-8 rounded-2xl bg-kalea-brown/90 hover:bg-kalea-brown transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
            >
              <card.icon className="w-8 h-8 text-white/80 mb-4 group-hover:text-white transition-colors" />
              
              <h3 className="text-xl md:text-2xl font-heading font-semibold text-white mb-2">
                {card.title}
              </h3>
              
              <p className="text-white/70 text-sm md:text-base mb-4 font-medium">
                {card.description}
              </p>
              
              <div className="flex items-center gap-2 text-white/60 group-hover:text-white transition-colors">
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
        className="mt-12 text-muted-foreground text-sm"
      >
        © {new Date().getFullYear()} Kalēa Surface System®
      </motion.p>
    </div>
  );
};

export default Welcome;
