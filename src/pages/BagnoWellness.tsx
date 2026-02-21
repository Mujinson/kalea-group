import CategoryPageTemplate from "@/components/CategoryPageTemplate";
import { Bath, Droplets, Gem, Thermometer } from "lucide-react";
import heroImg from "@/assets/category-bagno-wellness.jpg";
import SEOHead from "@/components/SEOHead";

const BagnoWellness = () => (
  <>
    <SEOHead
      title="Arredo Bagno & Wellness | Kalēa®"
      description="Oasi di benessere con lavabi custom, rubinetteria PVD, vasche freestanding e cabine spa con Kalēa®."
    />
    <CategoryPageTemplate
      heroImage={heroImg}
      title="Arredo Bagno & Wellness"
      subtitle="Oasi di benessere con design e tecnologie all'avanguardia."
      introTitle="Wellness di Design"
      introText={[
        "Il bagno è il luogo più intimo della casa. Progettiamo ambienti wellness che uniscono materiali pregiati, tecnologia e comfort sensoriale, trasformando la routine quotidiana in un'esperienza di lusso.",
        "Dai lavabi su misura alla rubinetteria con finiture PVD, dalle vasche freestanding ai sistemi doccia multisensoriali: ogni elemento è selezionato per creare un'oasi di benessere."
      ]}
      subcategories={[
        { title: "Lavabi & Sanitari Custom", description: "Lavabi in materiali naturali, sanitari rimless e soluzioni su misura per ogni configurazione.", icon: Droplets },
        { title: "Rubinetteria PVD", description: "Finiture di pregio in PVD: oro, bronzo, nero e cromo con garanzia di durata nel tempo.", icon: Gem },
        { title: "Vasche & Cabine Doccia", description: "Vasche freestanding, piatti doccia a filo pavimento e cabine con funzioni spa integrate.", icon: Bath },
        { title: "Termoarredo & Accessori", description: "Scaldasalviette di design, specchi retroilluminati e accessori coordinati.", icon: Thermometer },
      ]}
    />
  </>
);

export default BagnoWellness;
