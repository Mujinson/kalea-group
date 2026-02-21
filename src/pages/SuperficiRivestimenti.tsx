import CategoryPageTemplate from "@/components/CategoryPageTemplate";
import { Layers, TreeDeciduous, Grid3x3, Paintbrush, Waves } from "lucide-react";
import heroImg from "@/assets/category-superfici-new.jpg";
import SEOHead from "@/components/SEOHead";

const SuperficiRivestimenti = () => (
  <>
    <SEOHead
      title="Superfici & Rivestimenti | Kalēa®"
      description="L'eccellenza dei materiali: pavimenti BioMag, parquet, gres porcellanato, rivestimenti murali e resine con Kalēa®."
    />
    <CategoryPageTemplate
      heroImage={heroImg}
      title="Superfici & Rivestimenti"
      subtitle="L'eccellenza dei materiali, dai pavimenti BioMag alle finiture di pregio."
      introTitle="Materiali Selezionati"
      introText={[
        "Le superfici definiscono il carattere di ogni ambiente. Offriamo una selezione curata che spazia dai nostri pavimenti proprietari BioMag® a parquet naturali, gres porcellanato di design e rivestimenti murali di lusso.",
        "Ogni materiale è selezionato per le sue qualità estetiche, tecniche e di sostenibilità, con campionature dedicate e supporto alla posa."
      ]}
      subcategories={[
        { title: "Pavimenti BioMag®", description: "La nostra tecnologia proprietaria in ossido di magnesio: sostenibile, resistente e di design.", icon: Layers },
        { title: "Pavimenti in Legno & Parquet", description: "Essenze pregiate e lavorazioni artigianali per pavimenti in legno di carattere.", icon: TreeDeciduous },
        { title: "Gres Porcellanato & Ceramiche", description: "Grandi lastre e formati speciali dai migliori produttori europei.", icon: Grid3x3 },
        { title: "Rivestimenti Murali", description: "Carte da parati di design, boiserie e pannelli decorativi per pareti d'effetto.", icon: Paintbrush },
        { title: "Resine & Microcemento", description: "Superfici continue e senza fughe per ambienti contemporanei e raffinati.", icon: Waves },
      ]}
    />
  </>
);

export default SuperficiRivestimenti;
