import CategoryPageTemplate from "@/components/CategoryPageTemplate";
import { PenTool, Monitor, Palette, FileCheck } from "lucide-react";
import heroImg from "@/assets/category-progettazione.jpg";
import SEOHead from "@/components/SEOHead";

const ProgettazioneConsulenza = () => (
  <>
    <SEOHead
      title="Progettazione & Consulenza | Kalēa®"
      description="Dalla visione al progetto esecutivo. Concept design, render 3D, scelta materiali e gestione pratiche edilizie con Kalēa®."
    />
    <CategoryPageTemplate
      heroImage={heroImg}
      title="Progettazione & Consulenza"
      subtitle="Dalla visione al progetto esecutivo, con soluzioni su misura per ogni esigenza."
      introTitle="Il Nostro Approccio"
      introText={[
        "Ogni grande progetto nasce da un'idea. Il nostro team di architetti e designer lavora al tuo fianco per trasformare la tua visione in un progetto esecutivo dettagliato, garantendo coerenza estetica e fattibilità tecnica.",
        "Dalla consulenza iniziale alla scelta dei materiali, dalla modellazione 3D alla gestione delle pratiche: un servizio completo che semplifica ogni fase del processo."
      ]}
      subcategories={[
        { title: "Concept Design", description: "Sviluppo del concept creativo e dell'identità progettuale, con moodboard e proposte estetiche personalizzate.", icon: PenTool },
        { title: "Render 3D & Visualizzazione", description: "Visualizzazioni fotorealistiche per anticipare il risultato finale e prendere decisioni consapevoli.", icon: Monitor },
        { title: "Scelta Materiali & Finiture", description: "Selezione curata dei materiali, campionature dedicate e consulenza tecnica sulle finiture.", icon: Palette },
        { title: "Gestione Pratiche Edilizie", description: "Supporto completo nella gestione di permessi, autorizzazioni e documentazione tecnica.", icon: FileCheck },
      ]}
    />
  </>
);

export default ProgettazioneConsulenza;
