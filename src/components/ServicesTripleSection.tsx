import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import cardFornitura from "@/assets/hero-indoor.jpg";
import cardRigenerazione from "@/assets/hero-hypermatt-spina.jpg";
import cardLevigatura from "@/assets/card-parquet-ambient.jpg";

interface ServiceCard {
  image: string;
  title: string;
  link: string;
}

const ServicesTripleSection = () => {
  const { language } = useTranslation();

  const cards: ServiceCard[] = [
    {
      image: cardFornitura,
      title: "Fornitura e posa pavimenti Biomag, parquet, laminati, LVT-SPC e ceramiche",
      link: `/${language}/indoor`,
    },
    {
      image: cardRigenerazione,
      title: "Pulizia professionale e rigenerazione parquet esistenti",
      link: `/${language}/parquet`,
    },
    {
      image: cardLevigatura,
      title: "Levigatura, verniciatura e oliatura parquet",
      link: `/${language}/parquet`,
    },
  ];

  return (
    <section className="relative bg-background py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-foreground/50 font-medium mb-3">
            I nostri servizi
          </p>
          <h2 className="font-heading text-2xl md:text-4xl font-semibold text-foreground">
            Un unico partner, dall'idea al cantiere.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {cards.map((card) => (
            <Link
              key={card.title}
              to={card.link}
              className="group relative block overflow-hidden rounded-lg aspect-[4/5] md:aspect-[3/4]"
            >
              <img
                src={card.image}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                loading="lazy"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/70" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 md:p-8">
                <h3 className="font-heading text-xl md:text-2xl lg:text-[1.6rem] leading-tight font-semibold text-white drop-shadow-lg max-w-[90%]">
                  {card.title}
                </h3>
                <span className="mt-4 inline-flex items-center gap-1.5 text-white/90 text-sm tracking-wide border-b border-white/40 pb-1 group-hover:border-white transition-colors">
                  Scopri di più
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesTripleSection;
