import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, ChevronRight, Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo-new.png";
import { useTranslation } from "@/i18n/useTranslation";
import type { Language } from "@/i18n/translations";

interface ProductItem {
  label: string;
  path: string | null;
  comingSoon: boolean;
}

interface CategoryItem {
  label: string;
  products: ProductItem[];
}

interface EnvironmentItem {
  label: string;
  categories: CategoryItem[];
}

const Navbar = () => {
  const { language, setLanguage, t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isIndoorExpanded, setIsIndoorExpanded] = useState(false);
  const [isOutdoorExpanded, setIsOutdoorExpanded] = useState(false);
  const [isMobileProductsExpanded, setIsMobileProductsExpanded] = useState(false);
  const [mobileIndoorExpanded, setMobileIndoorExpanded] = useState(false);
  const [mobileOutdoorExpanded, setMobileOutdoorExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);
  const location = useLocation();
  const mobileMenuRef = React.useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = React.useRef<HTMLButtonElement>(null);

  const languages: Language[] = ['it', 'en', 'de', 'fr'];
  
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  // Check if on homepage for hero visibility logic
  const isOnHomePage = location.pathname === '/' || /^\/[a-z]{2}$/.test(location.pathname);

  // Auto-hide navbar on scroll + detect scroll position for style change
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Update scrolled state for style change
      setIsScrolled(currentScrollY > 80);
      
      // On homepage, navbar only appears after scrolling past WindowHero (300vh * 0.65 ≈ 1.95x viewport height)
      // This is when the hero image fully appears and CTA buttons show
      const heroThreshold = isOnHomePage ? window.innerHeight * 1.95 : 0;
      const pastHero = currentScrollY > heroThreshold;
      setIsPastHero(pastHero);
      
      // If on homepage and not past hero, always hide navbar
      if (isOnHomePage && !pastHero) {
        setIsVisible(false);
        setLastScrollY(currentScrollY);
        return;
      }
      
      // Don't hide navbar if mobile menu is open
      if (isMobileMenuOpen) {
        return;
      }

      // Determine scroll direction (only after passing hero on homepage)
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // Scrolling down & past navbar height
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    // Initial check
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isMobileMenuOpen, isOnHomePage]);

  const menuItems = [
    { label: t('nav.technicalArea'), path: `/${language}/area-tecnica` },
    { label: t('nav.projects'), path: `/${language}/realizzazioni` },
    { label: t('nav.contacts'), path: `/${language}/contatti` },
  ];

  // New hierarchical product structure
  const productStructure: EnvironmentItem[] = [
    {
      label: t('nav.indoor'),
      categories: [
        {
          label: t('nav.floors'),
          products: [
            { label: "BIOMAG FLOOR®", path: `/${language}/biomag-floor`, comingSoon: false },
            { label: "BIOWOOD FLOOR®", path: `/${language}/biowood-floor`, comingSoon: false },
          ]
        },
        {
          label: t('nav.accessories'),
          products: [
            { label: "KALEABASE®", path: null, comingSoon: true },
            { label: "KALEABASE SILENCE®", path: null, comingSoon: true },
            { label: "KALEABASE AQUA®", path: null, comingSoon: true },
            { label: "KALEABASE PRO®", path: null, comingSoon: true },
          ]
        },
        {
          label: t('nav.wallCladding'),
          products: [
            { label: "BIOWALL®", path: null, comingSoon: true },
          ]
        },
      ]
    },
    {
      label: t('nav.outdoor'),
      categories: [
        {
          label: t('nav.floors'),
          products: [
            { label: "KALEASTONE DECK®", path: null, comingSoon: true },
          ]
        },
        {
          label: t('nav.accessories'),
          products: [
            { label: "KALEABASE OUT®", path: null, comingSoon: true },
            { label: "KALEABASE DRAIN®", path: null, comingSoon: true },
          ]
        },
        {
          label: t('nav.wallCladding'),
          products: [
            { label: "KALEACLAD OUT®", path: null, comingSoon: true },
          ]
        },
        {
          label: t('nav.ceilingSystems'),
          products: [
            { label: "KALEACEILING OUT®", path: null, comingSoon: true },
          ]
        },
      ]
    },
  ];

  // Check if current page is a product page
  const isProductPage = productStructure.some(env => 
    env.categories.some(cat => 
      cat.products.some(prod => prod.path === location.pathname)
    )
  );

  // Adaptive font size for DE/FR languages
  useEffect(() => {
    if (language === "de" || language === "fr") {
      document.body.classList.add("navbar-compact");
    } else {
      document.body.classList.remove("navbar-compact");
    }
    
    return () => {
      document.body.classList.remove("navbar-compact");
    };
  }, [language]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        mobileMenuButtonRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !mobileMenuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
        setMobileIndoorExpanded(false);
        setMobileOutdoorExpanded(false);
        setIsMobileProductsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Pages that should always have dark navbar (no dark hero)
  const forceDarkNavbar = location.pathname.includes('/area-tecnica') || location.pathname.includes('/chi-siamo');
  
  // Homepage has dark backgrounds throughout, so keep light navbar style (white text on transparent)
  const isHomePage = location.pathname === `/${language}` || location.pathname === `/${language}/`;
  
  // Use scrolled style (light bg) if actually scrolled AND not on homepage OR if on pages without dark hero
  const useDarkStyle = (isScrolled && !isHomePage) || forceDarkNavbar;

  // Dynamic color classes based on scroll state
  const textColor = useDarkStyle ? "text-[#3F3B33]" : "text-white";
  const textColorMuted = useDarkStyle ? "text-[#3F3B33]/70" : "text-white/90";
  const textColorActive = useDarkStyle ? "text-[#3F3B33]" : "text-white";
  const underlineColor = useDarkStyle ? "bg-[#3F3B33]" : "bg-white";
  const dividerColor = useDarkStyle ? "text-[#3F3B33]/30" : "text-white/30";

  const renderProductItem = (product: ProductItem, isDropdownItem: boolean) => {
    if (product.comingSoon) {
      return (
        <Tooltip key={product.label}>
          <TooltipTrigger asChild>
            <div
              className="flex items-center gap-2 px-4 py-2 text-sm cursor-not-allowed text-[#1a1a1a]/50"
            >
              <Clock size={12} />
              {product.label}
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-foreground text-background text-xs px-3 py-1.5 rounded-lg">
            Coming soon
          </TooltipContent>
        </Tooltip>
      );
    }
    
    return (
      <Link
        key={product.path}
        to={product.path!}
        className={`block px-4 py-2 text-sm transition-all duration-200 ${
          location.pathname === product.path
            ? "text-[#1a1a1a] bg-[#EBE2D8]/50 font-medium"
            : "text-[#1a1a1a]/80 hover:text-[#1a1a1a] hover:bg-[#EBE2D8]/30"
        }`}
      >
        {product.label}
      </Link>
    );
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        transform: isVisible ? "translateY(0)" : "translateY(-100%)"
      }}
      transition={{ 
        opacity: { duration: 0.6, ease: "easeOut" },
        y: { duration: 0.6, ease: "easeOut" },
        transform: { duration: 0.25, ease: "easeOut" }
      }}
      className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 lg:px-16 xl:px-32"
    >
      <div 
        className={`max-w-[1280px] mx-auto rounded-b-[32px] transition-all duration-300 ${
          useDarkStyle 
            ? "bg-[rgba(255,255,255,0.94)] border-b border-x border-[#EBE2D8] shadow-[0_8px_32px_rgba(0,0,0,0.08)]" 
            : "bg-[rgba(255,255,255,0.08)] backdrop-blur-[18px] border-b border-x border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
        }`}
      >
        <div className="px-4 md:px-6 lg:px-8 xl:px-12">
          {/* Main flex container - no wrap */}
          <div className="flex items-center justify-between h-[80px] flex-nowrap">
            {/* Logo - Left - shrink-0 to prevent shrinking */}
            <Link
              to={`/${language}`}
              className="hover:opacity-80 transition-opacity duration-200 shrink-0"
            >
              <img 
                src={logo} 
                alt="Kalēa" 
                className={`h-8 md:h-10 transition-all duration-300 ${
                  useDarkStyle ? "brightness-0" : "brightness-0 invert"
                }`} 
              />
            </Link>

            {/* Desktop Menu - Center */}
            <div className="hidden xl:flex items-center gap-5 2xl:gap-8 flex-nowrap shrink-0">
              <Link
                to={`/${language}`}
                className={`text-nav transition-all duration-200 relative whitespace-nowrap ${
                  location.pathname === `/${language}` || location.pathname === `/${language}/` 
                    ? textColorActive 
                    : `${textColorMuted} hover:${textColor}`
                }`}
              >
                {t('nav.home')}
                {(location.pathname === `/${language}` || location.pathname === `/${language}/`) && (
                  <motion.div
                    layoutId="navbar-underline"
                    className={`absolute -bottom-1 left-0 right-0 h-[1px] ${underlineColor} transition-colors duration-300`}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>

              {/* Products Mega Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => {
                  setIsDropdownOpen(false);
                  setIsIndoorExpanded(false);
                  setIsOutdoorExpanded(false);
                }}
              >
                <button
                  className={`text-nav transition-all duration-200 flex items-center gap-1 whitespace-nowrap ${
                    isProductPage ? textColorActive : `${textColorMuted} hover:${textColor}`
                  }`}
                >
                  {t('nav.lines')}
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                  {isProductPage && (
                    <motion.div
                      layoutId="navbar-underline"
                      className={`absolute -bottom-1 left-0 right-0 h-[1px] ${underlineColor} transition-colors duration-300`}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
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
                      <div className="flex min-w-[480px]">
                        {/* Left column - Indoor/Outdoor tabs */}
                        <div className="w-40 py-3 border-r border-[#EBE2D8]">
                          {productStructure.map((env, index) => (
                            <button
                              key={env.label}
                              onMouseEnter={() => {
                                if (index === 0) {
                                  setIsIndoorExpanded(true);
                                  setIsOutdoorExpanded(false);
                                } else {
                                  setIsOutdoorExpanded(true);
                                  setIsIndoorExpanded(false);
                                }
                              }}
                              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-all duration-200 ${
                                (index === 0 ? isIndoorExpanded : isOutdoorExpanded)
                                  ? "text-[#1a1a1a] bg-[#EBE2D8]/50"
                                  : "text-[#1a1a1a]/80 hover:text-[#1a1a1a] hover:bg-[#EBE2D8]/30"
                              }`}
                            >
                              {env.label}
                              <ChevronRight size={14} />
                            </button>
                          ))}
                        </div>

                        {/* Right column - Categories and products */}
                        <div className="w-[340px] py-3">
                          <AnimatePresence mode="wait">
                            {(isIndoorExpanded || isOutdoorExpanded) && (
                              <motion.div
                                key={isIndoorExpanded ? 'indoor' : 'outdoor'}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.15 }}
                              >
                                {productStructure[isIndoorExpanded ? 0 : 1].categories.map((category, catIndex) => (
                                  <div key={category.label} className={`${catIndex > 0 ? 'mt-3 pt-3 border-t border-[#EBE2D8]' : ''}`}>
                                    <div className="px-4 py-1 text-xs font-semibold uppercase tracking-wider text-[#1a1a1a]/60">
                                      {category.label}
                                    </div>
                                    {category.products.map(product => renderProductItem(product, true))}
                                  </div>
                                ))}
                              </motion.div>
                            )}
                            {!isIndoorExpanded && !isOutdoorExpanded && (
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
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-nav transition-all duration-200 relative whitespace-nowrap ${
                    location.pathname === item.path 
                      ? textColorActive 
                      : `${textColorMuted} hover:${textColor}`
                  }`}
                >
                  {item.label}
                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="navbar-underline"
                      className={`absolute -bottom-1 left-0 right-0 h-[1px] ${underlineColor} transition-colors duration-300`}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Language Selector + CTA Button - Right */}
            <div className="hidden xl:flex items-center gap-4 shrink-0">
              {/* Language Selector */}
              <div className="flex items-center gap-1.5 text-nav whitespace-nowrap">
                {languages.map((lang, index) => (
                  <React.Fragment key={lang}>
                    <button
                      onClick={() => handleLanguageChange(lang)}
                      className={`transition-all duration-200 ${
                        language === lang 
                          ? `${textColorActive} font-semibold` 
                          : `${useDarkStyle ? "text-[#3F3B33]/60 hover:text-[#3F3B33]" : "text-white/70 hover:text-white"}`
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                    {index < languages.length - 1 && (
                      <span className={dividerColor}>|</span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* CTA Button */}
              <Link
                to={`/${language}/diventa-partner`}
                className={`inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-button transition-all duration-150 whitespace-nowrap ${
                  useDarkStyle 
                    ? "bg-white text-[#3F3B33] border border-[#E0D7CB] hover:bg-[#EBE2D8]" 
                    : "bg-white text-[#111] hover:bg-[#F3F3F3] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
                }`}
              >
                {t('nav.requestQuote')}
              </Link>
            </div>

            {/* Mobile Menu Button - shown on < xl */}
            <button
              ref={mobileMenuButtonRef}
              className={`xl:hidden p-2 transition-colors shrink-0 ${
                useDarkStyle ? "text-[#3F3B33] hover:text-[#3F3B33]/70" : "text-white hover:text-white/70"
              }`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="xl:hidden mt-4 mx-4 md:mx-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] max-h-[70vh] overflow-y-auto bg-white border border-[#EBE2D8]"
          >
            <div className="px-6 py-6 space-y-2">
              <Link
                to={`/${language}`}
                className={`block text-base font-medium transition-colors py-2 ${
                  location.pathname === `/${language}` || location.pathname === `/${language}/` 
                    ? "text-[#3F3B33]" 
                    : "text-[#3F3B33]/70 hover:text-[#3F3B33]"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.home')}
              </Link>

              {/* Mobile Products Expandable */}
              <div>
                <button
                  onClick={() => setIsMobileProductsExpanded(!isMobileProductsExpanded)}
                  className={`flex items-center justify-between w-full text-base font-medium transition-colors py-2 ${
                    isProductPage ? "text-[#3F3B33]" : "text-[#3F3B33]/70 hover:text-[#3F3B33]"
                  }`}
                >
                  {t('nav.lines')}
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${isMobileProductsExpanded ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {isMobileProductsExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="pl-3 space-y-1 mt-2"
                    >
                      {/* Indoor Section */}
                      <div>
                        <button
                          onClick={() => setMobileIndoorExpanded(!mobileIndoorExpanded)}
                          className="flex items-center justify-between w-full text-sm font-medium py-2 text-[#3F3B33]"
                        >
                          {t('nav.indoor')}
                          <ChevronDown
                            size={14}
                            className={`transition-transform duration-200 ${mobileIndoorExpanded ? "rotate-180" : ""}`}
                          />
                        </button>
                        
                        <AnimatePresence>
                          {mobileIndoorExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.15 }}
                              className="pl-3 space-y-2"
                            >
                              {productStructure[0].categories.map((category) => (
                                <div key={category.label}>
                                  <div className="text-xs font-semibold uppercase tracking-wider py-1 text-[#3F3B33]/50">
                                    {category.label}
                                  </div>
                                  {category.products.map((product) => (
                                    product.comingSoon ? (
                                      <div
                                        key={product.label}
                                        className="flex items-center gap-2 py-1.5 text-sm cursor-not-allowed opacity-50 text-[#3F3B33]/60"
                                      >
                                        <Clock size={10} />
                                        {product.label}
                                      </div>
                                    ) : (
                                      <Link
                                        key={product.path}
                                        to={product.path!}
                                        className={`block py-1.5 text-sm transition-colors ${
                                          location.pathname === product.path 
                                            ? "text-[#3F3B33]" 
                                            : "text-[#3F3B33]/60 hover:text-[#3F3B33]"
                                        }`}
                                        onClick={() => {
                                          setIsMobileMenuOpen(false);
                                          setIsMobileProductsExpanded(false);
                                          setMobileIndoorExpanded(false);
                                        }}
                                      >
                                        {product.label}
                                      </Link>
                                    )
                                  ))}
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Outdoor Section */}
                      <div>
                        <button
                          onClick={() => setMobileOutdoorExpanded(!mobileOutdoorExpanded)}
                          className="flex items-center justify-between w-full text-sm font-medium py-2 text-[#3F3B33]"
                        >
                          {t('nav.outdoor')}
                          <ChevronDown
                            size={14}
                            className={`transition-transform duration-200 ${mobileOutdoorExpanded ? "rotate-180" : ""}`}
                          />
                        </button>
                        
                        <AnimatePresence>
                          {mobileOutdoorExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.15 }}
                              className="pl-3 space-y-2"
                            >
                              {productStructure[1].categories.map((category) => (
                                <div key={category.label}>
                                  <div className="text-xs font-semibold uppercase tracking-wider py-1 text-[#3F3B33]/50">
                                    {category.label}
                                  </div>
                                  {category.products.map((product) => (
                                    <div
                                      key={product.label}
                                      className="flex items-center gap-2 py-1.5 text-sm cursor-not-allowed opacity-50 text-[#3F3B33]/60"
                                    >
                                      <Clock size={10} />
                                      {product.label}
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block text-base font-medium transition-colors py-2 ${
                    location.pathname === item.path 
                      ? "text-[#3F3B33]" 
                      : "text-[#3F3B33]/70 hover:text-[#3F3B33]"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile Language Selector */}
              <div className="flex items-center justify-center gap-2 py-4 border-t mt-4 border-[#EBE2D8]">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      handleLanguageChange(lang);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-3 py-1 rounded-lg transition-all text-xs ${
                      language === lang 
                        ? "bg-[#3F3B33] text-white font-semibold" 
                        : "text-[#3F3B33]/70 hover:text-[#3F3B33] hover:bg-[#EBE2D8]"
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>

              <Link
                to={`/${language}/diventa-partner`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center px-6 py-2 rounded-xl text-sm transition-all duration-150 bg-[#3F3B33] text-white hover:bg-[#3F3B33]/90"
              >
                {t('nav.requestQuote')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
