import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Flame, Droplets, ShieldOff, Layers, AudioWaveform, Leaf, Heart, Home as HomeIcon, Building2, ShowerHead, ThermometerSun, Baby, PawPrint, Recycle, Shield, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";

const MgoBook = () => {
  const { t, language } = useTranslation();
  const [currentSpread, setCurrentSpread] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
  const [hasOpened, setHasOpened] = useState(false);
  const bookRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasOpened) {
          setHasOpened(true);
        }
      },
      { threshold: 0.5 }
    );

    if (bookRef.current) {
      observer.observe(bookRef.current);
    }

    return () => observer.disconnect();
  }, [hasOpened]);

  const mgoAdvantages = [
    { icon: Flame, text: t('home.mgoAdvantages.fireproof') },
    { icon: Droplets, text: t('home.mgoAdvantages.waterproof') },
    { icon: Layers, text: t('home.mgoAdvantages.stability') },
    { icon: ShieldOff, text: t('home.mgoAdvantages.antimold') },
    { icon: AudioWaveform, text: t('home.mgoAdvantages.acoustic') },
  ];

  const additionalBenefits = [
    { icon: ThermometerSun, title: t('home.mgoBook.additionalBenefits.floorHeating.title'), description: t('home.mgoBook.additionalBenefits.floorHeating.description') },
    { icon: Baby, title: t('home.mgoBook.additionalBenefits.childSafe.title'), description: t('home.mgoBook.additionalBenefits.childSafe.description') },
    { icon: PawPrint, title: t('home.mgoBook.additionalBenefits.petFriendly.title'), description: t('home.mgoBook.additionalBenefits.petFriendly.description') },
    { icon: Recycle, title: t('home.mgoBook.additionalBenefits.zeroFormaldehyde.title'), description: t('home.mgoBook.additionalBenefits.zeroFormaldehyde.description') },
    { icon: Shield, title: t('home.mgoBook.additionalBenefits.antibacterial.title'), description: t('home.mgoBook.additionalBenefits.antibacterial.description') },
    { icon: Timer, title: t('home.mgoBook.additionalBenefits.extremeDurability.title'), description: t('home.mgoBook.additionalBenefits.extremeDurability.description') },
  ];

  const sustainabilityBullets = [
    t('home.mgoBook.sustainability.bullet1'),
    t('home.mgoBook.sustainability.bullet2'),
    t('home.mgoBook.sustainability.bullet3'),
    t('home.mgoBook.sustainability.bullet4'),
  ];

  const applicationItems = [
    { icon: HomeIcon, label: t('home.mgoBook.applications.residential') },
    { icon: Building2, label: t('home.mgoBook.applications.commercial') },
    { icon: Heart, label: t('home.mgoBook.applications.hospitality') },
    { icon: ShowerHead, label: t('home.mgoBook.applications.humid') },
  ];


  const handleNext = () => {
    if (currentSpread < 1 && !isFlipping) {
      setFlipDirection('next');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentSpread(1);
        setIsFlipping(false);
      }, 600);
    }
  };

  const handlePrev = () => {
    if (currentSpread > 0 && !isFlipping) {
      setFlipDirection('prev');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentSpread(0);
        setIsFlipping(false);
      }, 600);
    }
  };

  // Page 1 - Why MgO
  const Page1 = () => (
    <div className="h-full flex flex-col p-6 lg:p-8">
      <h3 className="text-2xl lg:text-3xl font-heading font-bold text-foreground mb-4">
        {t('home.mgoTitle')}
      </h3>
      <p className="text-sm lg:text-base text-muted-foreground mb-6 leading-relaxed">
        {t('home.mgoDescription')}
      </p>
      <div className="space-y-3 flex-1">
        {mgoAdvantages.map((advantage) => (
          <div key={advantage.text} className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[hsl(var(--kalea-logo))]/10">
              <advantage.icon className="w-4 h-4 text-[hsl(var(--kalea-logo))]" strokeWidth={1.5} />
            </div>
            <span className="text-sm text-foreground font-medium">{advantage.text}</span>
          </div>
        ))}
      </div>
      <Button asChild variant="outline" size="sm" className="mt-4 w-fit rounded-lg border-border hover:bg-muted">
        <Link to={`/${language}/area-tecnica`}>{t('home.mgoButton')}</Link>
      </Button>
    </div>
  );

  // Page 2 - Additional Benefits
  const Page2 = () => (
    <div className="h-full flex flex-col p-6 lg:p-8">
      <h3 className="text-xl lg:text-2xl font-heading font-semibold text-foreground mb-4">
        {t('home.mgoBook.exclusiveAdvantages')}
      </h3>
      <div className="flex-1 space-y-3">
        {additionalBenefits.map((benefit) => (
          <div key={benefit.title} className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[hsl(var(--kalea-logo))]/10 shrink-0">
              <benefit.icon className="w-4 h-4 text-[hsl(var(--kalea-logo))]" strokeWidth={1.5} />
            </div>
            <div>
              <span className="text-sm text-foreground font-medium block">{benefit.title}</span>
              <span className="text-xs text-foreground/60">{benefit.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Page 3 - Sustainability
  const Page3 = () => (
    <div className="h-full flex flex-col p-6 lg:p-8">
      <h3 className="text-2xl lg:text-3xl font-heading font-bold text-foreground mb-4">
        {t('home.mgoBook.sustainability.title')}
      </h3>
      <p className="text-sm lg:text-base text-muted-foreground mb-6 leading-relaxed">
        {t('home.mgoBook.sustainability.description')}
      </p>
      <div className="space-y-4 flex-1">
        {sustainabilityBullets.map((bullet, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-foreground/40 mt-1.5 shrink-0" />
            <span className="text-sm text-foreground/80">{bullet}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-foreground/10">
        <Leaf className="w-8 h-8 text-foreground/30" strokeWidth={1} />
      </div>
    </div>
  );

  // Page 4 - Applications
  const Page4 = () => (
    <div className="h-full flex flex-col p-6 lg:p-8">
      <h3 className="text-xl lg:text-2xl font-heading font-semibold text-foreground mb-6">
        {t('home.mgoBook.applications.title')}
      </h3>
      <div className="grid grid-cols-2 gap-4 flex-1">
        {applicationItems.map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-foreground/5 hover:bg-foreground/8 transition-colors"
          >
            <item.icon className="w-8 h-8 text-foreground/60 mb-2" strokeWidth={1.5} />
            <span className="text-xs lg:text-sm text-foreground/80 text-center font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const pages = [
    { left: <Page1 />, right: <Page2 /> },
    { left: <Page3 />, right: <Page4 /> },
  ];

  // Mobile single page view
  const mobilePages = [<Page1 />, <Page2 />, <Page3 />, <Page4 />];
  const [mobilePageIndex, setMobilePageIndex] = useState(0);

  if (isMobile) {
    return (
      <section 
        className="h-full w-full flex flex-col items-center justify-center overflow-hidden relative"
      >
        <div className="container-custom relative z-10">
          {/* Section Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
              {t('home.mgoTitle')}
            </h2>
            <p className="text-sm md:text-base text-foreground/70 max-w-md mx-auto">
              {t('home.mgoDescription')}
            </p>
          </div>
          <motion.div
            ref={bookRef}
            initial={{ opacity: 0, y: 30 }}
            animate={hasOpened ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Mobile Page */}
            <div
              className="relative mx-auto rounded-2xl overflow-hidden"
              style={{
                background:
                  "radial-gradient(circle at top left, rgba(255, 255, 255, 0.97), rgba(250, 248, 245, 0.95))",
                boxShadow:
                  "0 20px 60px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08)",
                minHeight: "420px",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={mobilePageIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  {mobilePages[mobilePageIndex]}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Mobile Navigation */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setMobilePageIndex(Math.max(0, mobilePageIndex - 1))}
                disabled={mobilePageIndex === 0}
                className="p-2 rounded-full bg-foreground/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-foreground/15 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              <div className="flex gap-2">
                {mobilePages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMobilePageIndex(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      idx === mobilePageIndex
                        ? "bg-foreground"
                        : "bg-foreground/25 hover:bg-foreground/45"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() =>
                  setMobilePageIndex(Math.min(mobilePages.length - 1, mobilePageIndex + 1))
                }
                disabled={mobilePageIndex === mobilePages.length - 1}
                className="p-2 rounded-full bg-foreground/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-foreground/15 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className="h-full w-full flex flex-col items-center justify-center overflow-hidden relative"
    >
      <div className="w-full px-6 md:px-12 lg:px-20 relative z-10">
        {/* Section Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-3">
            {t('home.mgoTitle')}
          </h2>
          <p className="text-base md:text-lg text-foreground/70 max-w-2xl mx-auto">
            {t('home.mgoDescription')}
          </p>
        </div>
        <motion.div
          ref={bookRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={hasOpened ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, ease: [0.22, 0.61, 0.36, 1] }}
          className="relative max-w-[1200px] mx-auto"
          style={{ perspective: "1200px" }}
        >
          {/* Book Container */}
          <div className="relative flex" style={{ minHeight: "480px" }}>
            {/* Left Page */}
            <motion.div
              className="w-1/2 relative"
              style={{
                transformStyle: "preserve-3d",
                transformOrigin: "right center",
              }}
              animate={{
                rotateY: hasOpened ? -4 : -30,
              }}
              transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
            >
              <div
                className="absolute inset-0 rounded-l-[32px] overflow-hidden"
                style={{
                  background:
                    "radial-gradient(circle at top left, rgba(255, 255, 255, 0.97), rgba(250, 248, 245, 0.95))",
                  boxShadow:
                    "-8px 0 30px rgba(0, 0, 0, 0.08), inset -2px 0 8px rgba(0, 0, 0, 0.03)",
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`left-${currentSpread}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: isFlipping ? 0.3 : 0 }}
                    className="h-full"
                  >
                    {pages[currentSpread].left}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Center Spine Shadow */}
            <div
              className="absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2 z-10 pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.02) 30%, rgba(0,0,0,0.02) 70%, rgba(0,0,0,0.12) 100%)",
              }}
            />

            {/* Right Page */}
            <motion.div
              className="w-1/2 relative"
              style={{
                transformStyle: "preserve-3d",
                transformOrigin: "left center",
              }}
              animate={{
                rotateY: hasOpened ? 4 : 30,
              }}
              transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
            >
              <div
                className="absolute inset-0 rounded-r-[32px] overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255, 255, 255, 0.97), rgba(250, 248, 245, 0.95))",
                  boxShadow:
                    "8px 0 30px rgba(0, 0, 0, 0.1), inset 2px 0 8px rgba(0, 0, 0, 0.02)",
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`right-${currentSpread}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: isFlipping ? 0.3 : 0 }}
                    className="h-full"
                  >
                    {pages[currentSpread].right}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Page flip overlay during animation */}
              <AnimatePresence>
                {isFlipping && (
                  <motion.div
                    className="absolute inset-0 rounded-r-[32px] overflow-hidden z-20"
                    style={{
                      transformOrigin: "left center",
                      background:
                        "linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(245, 242, 238, 0.7))",
                      boxShadow: "8px 0 40px rgba(0, 0, 0, 0.2)",
                    }}
                    initial={{ rotateY: flipDirection === 'next' ? 0 : -180 }}
                    animate={{ rotateY: flipDirection === 'next' ? -180 : 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              onClick={handlePrev}
              disabled={currentSpread === 0 || isFlipping}
              className="p-3 rounded-full bg-foreground/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-foreground/15 transition-all duration-200 hover:scale-105"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>

            <div className="flex gap-3">
              {[0, 1].map((idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (idx !== currentSpread && !isFlipping) {
                      setFlipDirection(idx > currentSpread ? 'next' : 'prev');
                      setIsFlipping(true);
                      setTimeout(() => {
                        setCurrentSpread(idx);
                        setIsFlipping(false);
                      }, 600);
                    }
                  }}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    idx === currentSpread
                      ? "bg-foreground scale-110"
                      : "bg-foreground/25 hover:bg-foreground/45"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={currentSpread === 1 || isFlipping}
              className="p-3 rounded-full bg-foreground/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-foreground/15 transition-all duration-200 hover:scale-105"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MgoBook;
