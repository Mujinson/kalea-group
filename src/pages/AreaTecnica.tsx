import { motion } from "framer-motion";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const AreaTecnica = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const documents = [
    {
      name: "Scheda tecnica StoneCore 10",
      category: "StoneCore 10",
      description: "Specifiche complete del pavimento in MgO",
      size: "2.4 MB",
    },
    {
      name: "Certificazione Fireproof StoneCore 10",
      category: "StoneCore 10",
      description: "Certificato classe A2-s1, d0",
      size: "1.8 MB",
    },
    {
      name: "Guida di posa StoneCore 10",
      category: "StoneCore 10",
      description: "Istruzioni dettagliate per l'installazione",
      size: "3.2 MB",
    },
    {
      name: "Catalogo EdgeLine",
      category: "EdgeLine",
      description: "Gamma completa profili e battiscopa",
      size: "5.6 MB",
    },
    {
      name: "Scheda tecnica EdgeLine",
      category: "EdgeLine",
      description: "Specifiche tecniche profili in alluminio",
      size: "1.9 MB",
    },
    {
      name: "Catalogo OneWall",
      category: "OneWall",
      description: "Finiture e applicazioni pannelli MgO",
      size: "7.2 MB",
    },
    {
      name: "Scheda tecnica OneWall",
      category: "OneWall",
      description: "Specifiche tecniche pannelli per pareti",
      size: "2.1 MB",
    },
    {
      name: "Guida di posa OneWall",
      category: "OneWall",
      description: "Istruzioni installazione pareti e soffitti",
      size: "3.8 MB",
    },
    {
      name: "Certificazioni ambientali",
      category: "Certificazioni",
      description: "Certificati sostenibilità e eco-compatibilità",
      size: "2.7 MB",
    },
  ];

  const categories = ["all", "StoneCore 10", "EdgeLine", "OneWall", "Certificazioni"];

  const filteredDocuments = selectedCategory === "all" 
    ? documents 
    : documents.filter(doc => doc.category === selectedCategory);

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="section-spacing bg-gradient-to-b from-muted/30 to-background">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              Area Tecnica
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Scarica schede tecniche, certificazioni e guide di posa per tutti i prodotti Kalēa
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filtri */}
      <section className="section-spacing">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap gap-3 justify-center mb-12"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {category === "all" ? "Tutti i documenti" : category}
              </button>
            ))}
          </motion.div>

          {/* Lista documenti */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc, index) => (
              <motion.div
                key={doc.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-heading font-semibold text-foreground mb-1 line-clamp-2">
                      {doc.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">{doc.category}</p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{doc.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{doc.size}</span>
                  <Button size="sm" variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                    <Download className="w-4 h-4 mr-2" />
                    Scarica
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-spacing bg-card">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Hai bisogno di supporto tecnico?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Il nostro team è a disposizione per rispondere a tutte le tue domande tecniche
            </p>
            <Button asChild size="lg" variant="default">
              <a href="mailto:tecnico@kalea.it">Contatta il supporto tecnico</a>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AreaTecnica;
