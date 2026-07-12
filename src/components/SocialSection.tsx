import { motion } from "framer-motion";
import { Instagram, Facebook, Linkedin, ArrowUpRight } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { useDragScroll } from "@/hooks/useDragScroll";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.11-1.46-.01 2.31 0 4.62-.01 6.93-.01 1.27-.19 2.53-.74 3.71-.56 1.28-1.54 2.39-2.75 3.12-1.37.8-2.93 1.18-4.51 1.13-1.41-.01-2.81-.35-4.04-1.05-1.44-.81-2.58-2.09-3.11-3.66-.56-1.64-.42-3.48.33-5.01.73-1.57 2.13-2.84 3.79-3.37 1.15-.38 2.37-.47 3.56-.25v4.11c-.72-.14-1.48-.11-2.16.14-.96.34-1.74 1.09-2.09 2.03-.39 1.03-.18 2.22.5 3.06.6.76 1.55 1.2 2.51 1.22.99.03 2.01-.31 2.74-1.02.66-.67.97-1.59.97-2.52V0h-.01z" />
  </svg>
);

const PinterestIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.966 1.406-5.966s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.261 7.929-7.261 4.164 0 7.398 2.967 7.398 6.93 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
  </svg>
);

interface SocialChannel {
  id: string;
  name: string;
  handle: string;
  url: string;
  icon: React.ReactNode;
  gradient: string;
}

const SocialSection = () => {
  const { t } = useTranslation();
  const { containerRef, handlers, isDragging } = useDragScroll({
    autoScrollSpeed: 0.6,
    direction: "left",
  });

  const channels: SocialChannel[] = [
    {
      id: "instagram",
      name: t("social.instagram"),
      handle: "@kalea.group",
      url: "https://www.instagram.com/kalea.group/",
      icon: <Instagram className="w-7 h-7" strokeWidth={1.5} />,
      gradient: "from-[#C4A882] via-[#B08D6B] to-[#8C7B6B]",
    },
    {
      id: "tiktok",
      name: t("social.tiktok"),
      handle: "@kaleagroup",
      url: "#tiktok-url-needed",
      icon: <TikTokIcon className="w-7 h-7" />,
      gradient: "from-[#A89882] via-[#8C7B6B] to-[#6B5B4F]",
    },
    {
      id: "pinterest",
      name: t("social.pinterest"),
      handle: "@Kalea_Group",
      url: "https://it.pinterest.com/Kalea_Group/_created/",
      icon: <PinterestIcon className="w-7 h-7" />,
      gradient: "from-[#D4B896] via-[#B08D6B] to-[#8C7B6B]",
    },
    {
      id: "facebook",
      name: t("social.facebook"),
      handle: "Kalēa Group",
      url: "https://www.facebook.com/people/Kalea/61585013655612/",
      icon: <Facebook className="w-7 h-7" strokeWidth={1.5} />,
      gradient: "from-[#BFA78C] via-[#A08B6E] to-[#7A6A58]",
    },
    {
      id: "linkedin",
      name: t("social.linkedin"),
      handle: "Kalēa Group",
      url: "https://www.linkedin.com/in/kalea-group-4bb7583b6/",
      icon: <Linkedin className="w-7 h-7" strokeWidth={1.5} />,
      gradient: "from-[#9A8A74] via-[#7D6D5B] to-[#5E5044]",
    },
  ];

  return (
    <section className="relative bg-background overflow-hidden py-16 md:py-24">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-14"
        >
          <span className="block text-[10px] md:text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
            {t("social.overline")}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
            {t("social.title")}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            {t("social.subtitle")}
          </p>
        </motion.div>
      </div>

      {/* Swipeable row */}
      <div className="relative">
        <div
          ref={containerRef}
          {...handlers}
          className={`flex gap-4 md:gap-6 overflow-x-auto px-6 md:px-12 lg:px-20 pb-4 snap-x snap-mandatory ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {channels.map((channel, index) => (
            <motion.a
              key={channel.id}
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative shrink-0 w-[260px] md:w-[300px] aspect-[4/5] rounded-2xl overflow-hidden snap-start"
              aria-label={`${t("social.follow")} ${channel.name}`}
            >
              {/* Background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${channel.gradient}`}
              />

              {/* Subtle texture overlay */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 1px, transparent 1px, transparent 12px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 16px)",
                }}
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-between p-6 md:p-7 text-white">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
                    {channel.icon}
                  </div>
                  <ArrowUpRight
                    className="w-5 h-5 text-white/70 group-hover:text-white transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    strokeWidth={1.5}
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                    {channel.name}
                  </p>
                  <p className="text-lg md:text-xl font-medium">{channel.handle}</p>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 md:w-16 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 md:w-16 bg-gradient-to-l from-background to-transparent z-10" />
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="container-custom text-center mt-10 md:mt-14"
      >
        <p className="text-sm text-muted-foreground">
          {t("social.cta")}{" "}
          <span className="text-foreground font-medium">#KaleaSurfaces</span>
        </p>
      </motion.div>
    </section>
  );
};

export default SocialSection;
