import CategoryPageTemplate from "@/components/CategoryPageTemplate";
import { Cpu, Lightbulb, Wifi, Thermometer } from "lucide-react";
import heroImg from "@/assets/category-tecnologia-new.jpg";
import SEOHead from "@/components/SEOHead";

const TecnologiaImpianti = () => (
  <>
    <SEOHead
      title="Tecnologia & Impianti | Kalēa®"
      description="Domotica, illuminazione LED, termoarredo e comfort integrato per la casa intelligente con Kalēa®."
    />
    <CategoryPageTemplate
      heroImage={heroImg}
      title="Tecnologia & Impianti"
      subtitle="Domotica, illuminazione e comfort integrato per la casa intelligente."
      introTitle="Intelligenza Abitativa"
      introText={[
        "La tecnologia deve essere invisibile e intuitiva. Integriamo sistemi domotici, illuminazione architetturale e soluzioni di climatizzazione che si adattano al tuo stile di vita senza compromessi estetici.",
        "Ogni impianto è progettato per integrarsi perfettamente nell'architettura, con controllo centralizzato e automazioni che migliorano il comfort quotidiano."
      ]}
      subcategories={[
        { title: "Domotica & Automazione", description: "Sistemi di controllo centralizzato per luci, clima, sicurezza e intrattenimento.", icon: Cpu },
        { title: "Illuminazione Architetturale", description: "Profili LED, strip incassate, faretti e scenografie luminose per ogni ambiente.", icon: Lightbulb },
        { title: "Climatizzazione Integrata", description: "Sistemi di riscaldamento e raffrescamento a scomparsa con massima efficienza energetica.", icon: Thermometer },
        { title: "Connettività & Audio", description: "Impianti multiroom, sistemi audio integrati e infrastruttura di rete avanzata.", icon: Wifi },
      ]}
    />
  </>
);

export default TecnologiaImpianti;
