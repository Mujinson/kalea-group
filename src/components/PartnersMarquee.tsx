import kronosAsset from "@/assets/partners/kronos.svg.asset.json";
import woodcoAsset from "@/assets/partners/woodco.svg.asset.json";
import skemaAsset from "@/assets/partners/skema.svg.asset.json";
import flowAsset from "@/assets/partners/flow.png.asset.json";
import ravaioliAsset from "@/assets/partners/ravaioli.png.asset.json";

const partners = [
  { name: "Kronos Ceramiche", src: kronosAsset.url },
  { name: "Woodco", src: woodcoAsset.url },
  { name: "Skema", src: skemaAsset.url },
  { name: "Flow", src: flowAsset.url },
  { name: "Ravaioli Legnami", src: ravaioliAsset.url },
];

const PartnersMarquee = () => {
  const loop = [...partners, ...partners];

  return (
    <section className="relative bg-background py-16 md:py-20 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 mb-10 md:mb-12 text-center">
        <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-foreground/50 font-medium">
          I nostri partner
        </p>
      </div>

      <div className="relative w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 md:w-40 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 md:w-40 bg-gradient-to-l from-background to-transparent z-10" />

        <div className="flex w-max animate-kalea-marquee">
          {loop.map((p, i) => (
            <div
              key={`${p.name}-${i}`}
              className="flex items-center justify-center px-10 md:px-16 shrink-0"
              style={{ minWidth: "240px", height: "80px" }}
              title={p.name}
              aria-label={p.name}
            >
              <span
                className="block partner-logo-mask"
                style={{
                  WebkitMaskImage: `url(${p.src})`,
                  maskImage: `url(${p.src})`,
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  backgroundColor: "hsl(var(--kalea-tan, 34 28% 63%))",
                  width: "160px",
                  height: "60px",
                  opacity: 0.75,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes kalea-marquee-anim {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-kalea-marquee {
          animation: kalea-marquee-anim 35s linear infinite;
        }
        .animate-kalea-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default PartnersMarquee;
