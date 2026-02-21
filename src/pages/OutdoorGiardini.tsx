import CategoryPageTemplate from "@/components/CategoryPageTemplate";
import { TreePine, UtensilsCrossed, Fence, Sun } from "lucide-react";
import heroImg from "@/assets/category-outdoor-new.jpg";
import SEOHead from "@/components/SEOHead";

const OutdoorGiardini = () => (
  <>
    <SEOHead
      title="Outdoor & Giardini | Kalēa®"
      description="Esterni di lusso: decking, cucine da esterno, facciate ventilate e arredi outdoor con Kalēa®."
    />
    <CategoryPageTemplate
      heroImage={heroImg}
      title="Outdoor & Giardini"
      subtitle="Esterni che diventano estensioni naturali degli spazi interni."
      introTitle="Vivere All'Aperto"
      introText={[
        "Gli spazi esterni sono un'estensione naturale della casa. Progettiamo terrazze, giardini e aree outdoor con la stessa cura e qualità degli interni, utilizzando materiali resistenti alle intemperie e di design.",
        "Dal decking KaleaDeck® alle cucine da esterno, dagli arredi outdoor alle facciate ventilate: ogni soluzione è pensata per durare nel tempo e creare ambienti da vivere tutto l'anno."
      ]}
      subcategories={[
        { title: "Decking & Pavimentazioni", description: "Pavimentazioni esterne in decking composito e materiali naturali, resistenti e di design.", icon: Fence },
        { title: "Cucine da Esterno", description: "Cucine outdoor professionali con barbecue, piani cottura e aree preparazione integrate.", icon: UtensilsCrossed },
        { title: "Arredi Outdoor", description: "Mobili da esterno di alta gamma, resistenti agli agenti atmosferici con design contemporaneo.", icon: Sun },
        { title: "Facciate & Rivestimenti Esterni", description: "Facciate ventilate e rivestimenti esterni che uniscono estetica e performance tecnica.", icon: TreePine },
      ]}
    />
  </>
);

export default OutdoorGiardini;
