import CategoryPageTemplate from "@/components/CategoryPageTemplate";
import { DoorOpen, GlassWater, ShieldCheck, LayoutGrid } from "lucide-react";
import heroImg from "@/assets/category-sistemi-accesso.jpg";
import SEOHead from "@/components/SEOHead";

const SistemiAccesso = () => (
  <>
    <SEOHead
      title="Sistemi di Accesso & Partizioni | Kalēa®"
      description="Porte filo muro, sistemi in vetro e alluminio, blindati e partizioni per spazi fluidi e funzionali con Kalēa®."
    />
    <CategoryPageTemplate
      heroImage={heroImg}
      title="Sistemi di Accesso & Partizioni"
      subtitle="Soluzioni integrate per fluidità e funzionalità degli spazi."
      introTitle="Spazi Senza Confini"
      introText={[
        "I sistemi di accesso e le partizioni definiscono il ritmo degli ambienti. Dalle porte filo muro che scompaiono nell'architettura ai grandi sistemi scorrevoli in vetro, ogni soluzione è pensata per unire estetica e funzionalità.",
        "Selezioniamo i migliori partner per offrire porte blindate di design, sistemi scorrevoli a scomparsa e pareti vetrate che ridefiniscono la percezione dello spazio."
      ]}
      subcategories={[
        { title: "Porte Filo Muro", description: "Porte rasomuro con finiture coordinate alle pareti, per un effetto architettonico minimale.", icon: DoorOpen },
        { title: "Sistemi Vetro & Alluminio", description: "Pareti scorrevoli e partizioni in vetro strutturale con profili minimal.", icon: GlassWater },
        { title: "Porte Blindate di Design", description: "Sicurezza certificata con estetica di altissimo livello, personalizzabili in ogni dettaglio.", icon: ShieldCheck },
        { title: "Pareti Divisorie Mobili", description: "Sistemi modulari per configurare gli spazi con flessibilità e rapidità.", icon: LayoutGrid },
      ]}
    />
  </>
);

export default SistemiAccesso;
