import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo-kalea-cream.png";
import { useTranslation } from "@/i18n/useTranslation";
import type { Language } from "@/i18n/translations";

interface CategoryItem {
  label: string;
  path: string | null;
  comingSoon?: boolean;
}

interface MacroCategory {
  label: string;
  items: CategoryItem[];
}

const Navbar = () => {
  const { language, setLanguage, t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isMobileProductsExpanded, setIsMobileProductsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const mobileMenuRef = React.useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = React.useRef<HTMLButtonElement>(null);

  const languages: Language[] = ['it', 'en', 'de', 'fr'];

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  const isOnHomePage = location.pathname === '/' || /^\/[a-z]{2}$/.test(location.pathname);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 80);
      if (isMobileMenuOpen) return;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isMobileMenuOpen]);

  const menuItems = [
    { label: t('nav.technicalArea'), path: `/${language}/area-tecnica` },
    { label: t('nav.projects'), path: `/${language}/realizzazioni` },
    { label: t('nav.contacts'), path: `/${language}/contatti` },
  ];

  const macroCategories: MacroCategory[] = [
    {
      label: 'Superfici',
      items: [
        { label: "BIOMAG FLOOR® (MgO)", path: `/${language}/biomag-floor` },
        { label: "Grandi Lastre", path: null, comingSoon: true },
        { label: "Parquet Bio", path: null, comingSoon: true },
        { label: "Microcemento", path: null, comingSoon: true },
      ],
    },
    {
      label: 'Sistemi di Accesso',
      items: [
        { label: "Porte Filo Muro", path: null, comingSoon: true },
        { label: "Sistemi Vetro/Alluminio", path: null, comingSoon: true },
        { label: "Blindati di Design", path: null, comingSoon: true },
      ],
    },
    {
      label: 'Bagno & Wellness',
      items: [
        { label: "Lavabi Custom", path: null, comingSoon: true },
        { label: "Rubinetteria PVD", path: null, comingSoon: true },
        { label: "Vasche Freestanding", path: null, comingSoon: true },
      ],
    },
    {
      label: 'Tecnologia',
      items: [
        { label: "Termoarredo Materico", path: null, comingSoon: true },
        { label: "Domotica Invisibile", path: null, comingSoon: true },
        { label: "Profili Luce LED", path: null, comingSoon: true },
      ],
    },
    {
      label: 'Outdoor',
      items: [
        { label: "Decking", path: null, comingSoon: true },
        { label: "Cucine da Esterno", path: null, comingSoon: true },
        { label: "Facciate Ventilate", path: null, comingSoon: true },
      ],
    },
  ];

  useEffect(() => {
    if (language === "de" || language === "fr") {
      document.body.classList.add("navbar-compact");
    } else {
      document.body.classList.remove("navbar-compact");
    }
    return () => { document.body.classList.remove("navbar-compact"); };
  }, [language]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen && mobileMenuRef.current && mobileMenuButtonRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) && !mobileMenuButtonRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
        setIsMobileProductsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const forceDarkNavbar = location.pathname.includes('/area-tecnica') || location.pathname.includes('/chi-siamo');
  const isHomePage = location.pathname === `/${language}` || location.pathname === `/${language}/`;
  const [isPastDarkSections, setIsPastDarkSections] = useState(false);

  useEffect(() => {
    const handler = () => {
      if (isHomePage) {
        setIsPastDarkSections(window.scrollY > window.innerHeight * 0.8);
      } else {
        setIsPastDarkSections(false);
      }
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [isHomePage]);

  const useDarkStyle = (isScrolled && !isHomePage) || forceDarkNavbar || (isHomePage && isPastDarkSections);
  const textColor = useDarkStyle ? "text-[#3F3B33]" : "text-white";
  const textColorMuted = useDarkStyle ? "text-[#3F3B33]/70" : "text-white/90";
  const textColorActive = useDarkStyle ? "text-[#3F3B33]" : "text-white";
  const underlineColor = useDarkStyle ? "bg-[#3F3B33]" : "bg-white";
  const dividerColor = useDarkStyle ? "text-[#3F3B33]/30" : "text-white/30";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-4 md:px-8 lg:px-16 xl:px-32 transition-all duration-300 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}>
      <div className={`max-w-[1280px] mx-auto rounded-b-[32px] transition-all duration-300 ${
        useDarkStyle 
          ? "bg-[rgba(255,255,255,0.94)] border-b border-x border-[#EBE2D8] shadow-[0_8px_32px_rgba(0,0,0,0.08)]" 
          : "bg-[rgba(255,255,255,0.08)] backdrop-blur-[18px] border-b border-x border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
      }`}>
        <div className="px-4 md:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between h-[80px] flex-nowrap">
            {/* Logo */}
            <Link to={`/${language}`} className="hover:opacity-80 transition-opacity duration-200 shrink-0">
              <img src={logo} alt="Kalēa®" className={`h-10 md:h-12 transition-all duration-300 ${useDarkStyle ? "brightness-0" : "brightness-0 invert"}`} />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden xl:flex items-center gap-5 2xl:gap-8 flex-nowrap shrink-0">
              <Link to={`/${language}`} className={`text-nav transition-all duration-200 relative whitespace-nowrap ${
                isHomePage ? textColorActive : `${textColorMuted} hover:${textColor}`
              }`}>
                {t('nav.home')}
                {isHomePage && <div className={`absolute -bottom-1 left-0 right-0 h-[1px] ${underlineColor}`} />}
              </Link>

              {/* Products Mega Dropdown */}
              <div className="relative"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => { setIsDropdownOpen(false); setActiveCategory(null); }}
              >
                <button className={`text-nav transition-all duration-200 flex items-center gap-1 whitespace-nowrap ${textColorMuted} hover:${textColor}`}>
                  {t('nav.lines')}
                  <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-4 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden z-50 bg-white border border-[#EBE2D8]"
                    >
                      <div className="flex min-w-[520px]">
                        {/* Left - categories */}
                        <div className="w-44 py-3 border-r border-[#EBE2D8]">
                          {macroCategories.map((cat) => (
                            <button
                              key={cat.label}
                              onMouseEnter={() => setActiveCategory(cat.label)}
                              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                                activeCategory === cat.label ? "text-[#1a1a1a] bg-[#EBE2D8]/50" : "text-[#1a1a1a]/70 hover:text-[#1a1a1a] hover:bg-[#EBE2D8]/30"
                              }`}
                            >
                              {cat.label}
                              <ChevronRight size={14} />
                            </button>
                          ))}
                        </div>

                        {/* Right - items */}
                        <div className="w-[340px] py-3">
                          <AnimatePresence mode="wait">
                            {activeCategory ? (
                              <motion.div
                                key={activeCategory}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.15 }}
                              >
                                {macroCategories.find(c => c.label === activeCategory)?.items.map(item => (
                                  item.comingSoon ? (
                                    <div key={item.label} className="flex items-center justify-between px-4 py-2 text-sm cursor-not-allowed text-[#1a1a1a]/50">
                                      <span>{item.label}</span>
                                      <span className="text-xs text-[#1a1a1a]/40 italic">Coming soon</span>
                                    </div>
                                  ) : (
                                    <Link
                                      key={item.path}
                                      to={item.path!}
                                      className={`block px-4 py-2 text-sm transition-all duration-200 ${
                                        location.pathname === item.path ? "text-[#1a1a1a] bg-[#EBE2D8]/50 font-medium" : "text-[#1a1a1a]/80 hover:text-[#1a1a1a] hover:bg-[#EBE2D8]/30"
                                      }`}
                                      onClick={() => setIsDropdownOpen(false)}
                                    >
                                      {item.label}
                                    </Link>
                                  )
                                ))}
                              </motion.div>
                            ) : (
                              <div className="px-4 py-8 text-center text-sm text-[#1a1a1a]/60">
                                {t('nav.hoverToExplore')}
                              </div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {menuItems.map((item) => (
                <Link key={item.path} to={item.path}
                  className={`text-nav transition-all duration-200 relative whitespace-nowrap ${
                    location.pathname === item.path ? textColorActive : `${textColorMuted} hover:${textColor}`
                  }`}
                >
                  {item.label}
                  {location.pathname === item.path && <div className={`absolute -bottom-1 left-0 right-0 h-[1px] ${underlineColor}`} />}
                </Link>
              ))}
            </div>

            {/* Language + CTA + Mobile */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Language Selector */}
              <div className="hidden xl:flex items-center gap-0.5 shrink-0">
                {languages.map((lang, i) => (
                  <React.Fragment key={lang}>
                    <button
                      onClick={() => handleLanguageChange(lang)}
                      className={`text-xs font-medium uppercase transition-all duration-200 px-1 ${
                        language === lang ? `${textColorActive} font-semibold` : `${dividerColor} hover:${textColor}`
                      }`}
                    >
                      {lang}
                    </button>
                    {i < languages.length - 1 && <span className={`text-xs ${dividerColor}`}>|</span>}
                  </React.Fragment>
                ))}
              </div>

              {/* CTA */}
              <Link to={`/${language}/diventa-partner`}
                className="hidden xl:inline-flex items-center justify-center gap-2 bg-white text-[#111] text-button rounded-xl px-6 py-2 hover:bg-[#F3F3F3] transition-all duration-150 text-xs font-medium whitespace-nowrap shrink-0"
              >
                {t('nav.requestQuote')}
              </Link>

              {/* Mobile Menu Button */}
              <button ref={mobileMenuButtonRef}
                onClick={() => { setIsMobileMenuOpen(!isMobileMenuOpen); if (isMobileMenuOpen) setIsMobileProductsExpanded(false); }}
                className={`xl:hidden p-2 ${textColor}`}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="xl:hidden overflow-hidden bg-white rounded-b-2xl border-t border-[#EBE2D8]"
            >
              <div className="px-4 py-4 space-y-1">
                <Link to={`/${language}`} className="block px-4 py-3 text-sm text-[#1a1a1a] font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                  {t('nav.home')}
                </Link>

                {/* Products accordion */}
                <button
                  onClick={() => setIsMobileProductsExpanded(!isMobileProductsExpanded)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm text-[#1a1a1a] font-medium"
                >
                  {t('nav.lines')}
                  <ChevronDown size={16} className={`transition-transform ${isMobileProductsExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isMobileProductsExpanded && (
                  <div className="pl-4 space-y-2 pb-2">
                    {macroCategories.map(cat => (
                      <div key={cat.label}>
                        <p className="px-4 py-1 text-xs font-semibold uppercase tracking-wider text-[#1a1a1a]/50">{cat.label}</p>
                        {cat.items.map(item => (
                          item.comingSoon ? (
                            <div key={item.label} className="flex items-center justify-between px-4 py-1.5 text-sm text-[#1a1a1a]/40">
                              <span>{item.label}</span>
                              <span className="text-[10px] italic">Coming soon</span>
                            </div>
                          ) : (
                            <Link key={item.path} to={item.path!} className="block px-4 py-1.5 text-sm text-[#1a1a1a]/80" onClick={() => setIsMobileMenuOpen(false)}>
                              {item.label}
                            </Link>
                          )
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {menuItems.map(item => (
                  <Link key={item.path} to={item.path} className="block px-4 py-3 text-sm text-[#1a1a1a] font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                    {item.label}
                  </Link>
                ))}

                {/* Language */}
                <div className="flex items-center gap-2 px-4 py-3 border-t border-[#EBE2D8] mt-2">
                  {languages.map((lang, i) => (
                    <React.Fragment key={lang}>
                      <button onClick={() => { handleLanguageChange(lang); setIsMobileMenuOpen(false); }}
                        className={`text-xs uppercase font-medium ${language === lang ? 'text-[#1a1a1a] font-bold' : 'text-[#1a1a1a]/40'}`}
                      >
                        {lang}
                      </button>
                      {i < languages.length - 1 && <span className="text-[#1a1a1a]/20 text-xs">|</span>}
                    </React.Fragment>
                  ))}
                </div>

                {/* CTA */}
                <Link to={`/${language}/diventa-partner`}
                  className="block mx-4 text-center bg-[#1a1a1a] text-white text-sm font-medium py-3 rounded-xl"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('nav.requestQuote')}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;