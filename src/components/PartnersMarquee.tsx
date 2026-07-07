const partners = [
  "Kronos Ceramiche",
  "Woodco",
  "Skema",
  "Flow",
  "Ravaioli Legnami",
];

const PartnersMarquee = () => {
  // duplicate list for seamless loop
  const loop = [...partners, ...partners];

  return (
    <section className="relative bg-background py-16 md:py-20 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 mb-8 md:mb-10 text-center">
        <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-foreground/50 font-medium">
          I nostri partner
        </p>
      </div>

      <div className="relative w-full overflow-hidden">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 md:w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 md:w-32 bg-gradient-to-l from-background to-transparent z-10" />

        <div className="flex w-max animate-marquee">
          {loop.map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="flex items-center justify-center px-10 md:px-16"
              style={{ minWidth: "220px" }}
            >
              <span
                className="font-heading font-semibold tracking-[0.15em] uppercase text-foreground/70 whitespace-nowrap"
                style={{ fontSize: "clamp(1.1rem, 1.8vw, 1.6rem)" }}
              >
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes kalea-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: kalea-marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default PartnersMarquee;
