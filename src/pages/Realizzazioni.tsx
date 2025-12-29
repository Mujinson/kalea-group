import { useState } from "react";
import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import { useTranslation } from "@/i18n/useTranslation";

// Hero image
import heroImage from "@/assets/hero-biomag-floor.jpg";

// Realizzazioni images - Available images
import bagnoAurora from "@/assets/realizzazione-bagno-aurora.jpg";
import hotelCorteccia from "@/assets/realizzazione-hotel-corteccia.jpg";
import cucinaSabbia from "@/assets/realizzazione-cucina-sabbia.jpg";
import ufficioSilven from "@/assets/realizzazione-ufficio-silven.jpg";
import soggiornoTerram from "@/assets/realizzazione-soggiorno-terram.jpg";
import negozioVelora from "@/assets/realizzazione-negozio-velora.jpg";
import cameraPerla from "@/assets/realizzazione-camera-perla.jpg";

interface Project {
  id: string;
  image: string;
  category: string;
  color: string;
  title: string;
  location: string;
}

const projects: Project[] = [
  // Soggiorni
  {
    id: "1",
    image: heroImage,
    category: "Soggiorno",
    color: "Aurora",
    title: "Villa Nordica",
    location: "Copenhagen, Danimarca"
  },
  {
    id: "2",
    image: soggiornoTerram,
    category: "Soggiorno",
    color: "Terram",
    title: "Living Room Hygge",
    location: "Stoccolma, Svezia"
  },
  
  // Bagni
  {
    id: "3",
    image: bagnoAurora,
    category: "Bagno",
    color: "Aurora",
    title: "Suite Spa Privata",
    location: "Milano, Italia"
  },
  
  // Cucine
  {
    id: "4",
    image: cucinaSabbia,
    category: "Cucina",
    color: "Sabbia",
    title: "Cucina Contemporanea",
    location: "Zurigo, Svizzera"
  },
  
  // Camere
  {
    id: "5",
    image: cameraPerla,
    category: "Camera",
    color: "Perla",
    title: "Master Bedroom Suite",
    location: "Vienna, Austria"
  },
  
  // Hotel
  {
    id: "6",
    image: hotelCorteccia,
    category: "Hotel",
    color: "Corteccia",
    title: "Boutique Hotel Suite",
    location: "Firenze, Italia"
  },
  
  // Uffici
  {
    id: "7",
    image: ufficioSilven,
    category: "Ufficio",
    color: "Silven",
    title: "Headquarters Corporate",
    location: "Monaco, Germania"
  },
  
  // Retail
  {
    id: "8",
    image: negozioVelora,
    category: "Retail",
    color: "Velora",
    title: "Fashion Boutique",
    location: "Parigi, Francia"
  }
];

const categories = ["Tutti", "Soggiorno", "Bagno", "Cucina", "Camera", "Hotel", "Ufficio", "Retail"];

const Realizzazioni = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("Tutti");

  const filteredProjects = activeCategory === "Tutti" 
    ? projects 
    : projects.filter(p => p.category === activeCategory);

  return (
    <main className="bg-background">
      {/* Hero Section */}
      <HeroSection
        title="REALIZZAZIONI"
        subtitle="Progetti che raccontano la qualità delle nostre superfici"
        backgroundImage={heroImage}
        overlayClassName="bg-gradient-to-b from-black/30 via-black/20 to-black/40"
      />

      {/* Projects Grid */}
      <section className="bg-background py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-5xl font-light text-foreground mb-6">
              I Nostri Progetti
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Ogni ambiente racconta una storia unica, dove le nostre superfici 
              diventano protagoniste del design d'interni contemporaneo.
            </p>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all
                  ${activeCategory === category 
                    ? "bg-foreground text-background" 
                    : "bg-card-beige/30 text-foreground hover:bg-card-beige/60"
                  }`}
              >
                {category}
              </button>
            ))}
          </motion.div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                layout
                className="group relative overflow-hidden rounded-xl cursor-pointer"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={project.image}
                    alt={`${project.title} - ${project.category}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent 
                  opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                      {project.category}
                    </span>
                    <span className="px-3 py-1 bg-card-beige/80 backdrop-blur-sm rounded-full text-xs text-foreground font-medium">
                      {project.color}
                    </span>
                  </div>
                  <h3 className="text-white text-xl font-display font-medium mb-1">
                    {project.title}
                  </h3>
                  <p className="text-white/70 text-sm">
                    {project.location}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-card-beige py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display text-3xl md:text-5xl font-light text-foreground mb-6">
              Vuoi realizzare il tuo progetto?
            </h2>
            <p className="text-foreground/80 text-lg max-w-2xl mx-auto mb-10">
              Contattaci per una consulenza personalizzata e scopri come le nostre 
              superfici possono trasformare i tuoi spazi.
            </p>
            <a
              href="/it/contatti"
              className="inline-flex items-center px-8 py-4 bg-foreground text-background 
                font-medium rounded-full hover:bg-foreground/90 transition-colors"
            >
              Contattaci
            </a>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default Realizzazioni;
