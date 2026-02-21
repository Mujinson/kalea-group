import CategoryPageTemplate from "@/components/CategoryPageTemplate";
import { Armchair, Sofa, Lamp, BookOpen } from "lucide-react";
import heroImg from "@/assets/category-arredamento.jpg";
import SEOHead from "@/components/SEOHead";

const ArredamentoComplementi = () => (
  <>
    <SEOHead
      title="Arredamento & Complementi | Kalēa®"
      description="Pezzi unici, soluzioni su misura e complementi d'arredo selezionati per ogni ambiente con Kalēa®."
    />
    <CategoryPageTemplate
      heroImage={heroImg}
      title="Arredamento & Complementi"
      subtitle="Pezzi unici e soluzioni su misura per ogni ambiente."
      introTitle="Arredi d'Autore"
      introText={[
        "L'arredamento è il tocco finale che trasforma uno spazio in un luogo. Selezioniamo mobili di design, complementi d'arredo e soluzioni su misura dai migliori brand e artigiani, garantendo coerenza con il progetto d'insieme.",
        "Dal divano al tavolo da pranzo, dalla libreria alla cucina su misura: ogni pezzo è scelto per qualità costruttiva, estetica e capacità di dialogare con l'architettura."
      ]}
      subcategories={[
        { title: "Mobili di Design", description: "Selezione curata di arredi dei migliori brand italiani e internazionali.", icon: Armchair },
        { title: "Divani & Imbottiti", description: "Imbottiti di alta gamma con tessuti e pelli selezionate, personalizzabili in ogni dettaglio.", icon: Sofa },
        { title: "Illuminazione d'Arredo", description: "Lampade, sospensioni e sistemi luminosi che diventano elementi scultorei.", icon: Lamp },
        { title: "Cucine Su Misura", description: "Progetti cucina personalizzati con materiali premium e tecnologia integrata.", icon: BookOpen },
      ]}
    />
  </>
);

export default ArredamentoComplementi;
