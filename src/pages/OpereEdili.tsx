import CategoryPageTemplate from "@/components/CategoryPageTemplate";
import { Hammer, Ruler, ShieldCheck, Wrench } from "lucide-react";
import heroImg from "@/assets/category-opere-edili.jpg";
import SEOHead from "@/components/SEOHead";

const OpereEdili = () => (
  <>
    <SEOHead
      title="Opere Edili & Strutturali | Kalēa®"
      description="La base solida per ogni trasformazione. Demolizioni, cartongesso, impermeabilizzazioni e ristrutturazioni con Kalēa®."
    />
    <CategoryPageTemplate
      heroImage={heroImg}
      title="Opere Edili & Strutturali"
      subtitle="La base solida per ogni trasformazione, con precisione e sicurezza."
      introTitle="Costruire con Eccellenza"
      introText={[
        "Ogni ristrutturazione di pregio richiede una base strutturale impeccabile. Coordiniamo le opere edili con maestranze qualificate, garantendo tempi certi e qualità superiore.",
        "Dalla demolizione controllata alla preparazione dei sottofondi, dalla posa del cartongesso alle impermeabilizzazioni: ogni intervento è eseguito con standard di cantiere premium."
      ]}
      subcategories={[
        { title: "Demolizioni & Preparazione", description: "Demolizioni controllate, rimozione materiali e preparazione degli ambienti per la nuova configurazione.", icon: Hammer },
        { title: "Cartongesso & Controsoffitti", description: "Pareti divisorie, velette, nicchie illuminanti e soluzioni architettoniche in cartongesso.", icon: Ruler },
        { title: "Impermeabilizzazioni", description: "Sistemi di impermeabilizzazione per bagni, terrazze e locali tecnici con materiali certificati.", icon: ShieldCheck },
        { title: "Sottofondi & Massetti", description: "Preparazione di sottofondi livellati e massetti tecnici per la posa perfetta dei pavimenti.", icon: Wrench },
      ]}
    />
  </>
);

export default OpereEdili;
