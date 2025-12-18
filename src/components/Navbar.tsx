import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo-new.png";
import { useTranslation } from "@/i18n/useTranslation";
import type { Language } from "@/i18n/translations";

const Navbar = () => {
  const { language, setLanguage, t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLineeExpanded, setIsLineeExpanded] = useState(false);
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

  // Auto-hide navbar on scroll + detect scroll position for style change
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Update scrolled state for style change
      setIsScrolled(currentScrollY > 80);
      
      // Don't hide navbar if mobile menu is open
      if (isMobileMenuOpen) {
        return;
      }

      // Determine scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // Scrolling down & past navbar height
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isMobileMenuOpen]);

  const menuItems = [
    { label: t('nav.technicalArea'), path: `/${language}/area-tecnica` },
    { label: t('nav.contacts'), path: `/${language}/contatti` },
  ];

  const lineeItems = [
    { label: t('nav.menuStonecore'), path: `/${language}/stonecore-10`, comingSoon: false },
    { label: t('nav.menuEdgeline'), path: `/${language}/edgeline`, comingSoon: false },
    { label: t('nav.menuOnewall'), path: `/${language}/onewall`, comingSoon: true },
  ];

  const isLineePage = lineeItems.some((item) => location.pathname === item.path);

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
        setIsLineeExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Pages that should always have dark navbar (no dark hero)
  const forceDarkNavbar = location.pathname.includes('/area-tecnica') || location.pathname.includes('/chi-siamo');
  
  // Use scrolled style if actually scrolled OR if on pages without dark hero
  const useDarkStyle = isScrolled || forceDarkNavbar;

  // Dynamic color classes based on scroll state
  const textColor = useDarkStyle ? "text-[#3F3B33]" : "text-white";
  const textColorMuted = useDarkStyle ? "text-[#3F3B33]/70" : "text-white/90";
  const textColorActive = useDarkStyle ? "text-[#3F3B33]" : "text-white";
  const underlineColor = useDarkStyle ? "bg-[#3F3B33]" : "bg-white";
  const dividerColor = useDarkStyle ? "text-[#3F3B33]/30" : "text-white/30";

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

            {/* Desktop Menu + Language - Center wrapper with flex-nowrap */}
            <div className="hidden xl:flex items-center gap-6 2xl:gap-8 flex-nowrap shrink-0">
              {/* Menu Links */}
              <div className="flex items-center gap-5 2xl:gap-8 flex-nowrap">
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

                {/* Dropdown Linee */}
                <div
                  className="relative"
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  <button
                    className={`text-nav transition-all duration-200 flex items-center gap-1 whitespace-nowrap ${
                      isLineePage ? textColorActive : `${textColorMuted} hover:${textColor}`
                    }`}
                  >
                    {t('nav.lines')}
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                    />
                    {isLineePage && (
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
                        className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 w-48 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.24)] overflow-hidden z-50 ${
                          useDarkStyle 
                            ? "bg-white border border-[#EBE2D8]" 
                            : "bg-[rgba(255,255,255,0.08)] backdrop-blur-[18px] border border-white/[0.08]"
                        }`}
                      >
                        {lineeItems.map((item, index) => (
                          item.comingSoon ? (
                            <Tooltip key={item.path}>
                              <TooltipTrigger asChild>
                                <div
                                  className={`block px-6 py-3 text-nav cursor-not-allowed opacity-50 ${
                                    useDarkStyle
                                      ? "text-[#3F3B33]/60"
                                      : "text-white/60"
                                  } ${index !== lineeItems.length - 1 ? `border-b ${useDarkStyle ? "border-[#EBE2D8]" : "border-white/5"}` : ""}`}
                                >
                                  {item.label}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="bg-foreground text-background text-xs px-3 py-1.5 rounded-lg">
                                Coming soon
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <Link
                              key={item.path}
                              to={item.path}
                              className={`block px-6 py-3 text-nav transition-all duration-200 ${
                                useDarkStyle
                                  ? location.pathname === item.path
                                    ? "text-[#3F3B33] bg-[#EBE2D8]/50"
                                    : "text-[#3F3B33]/80 hover:text-[#3F3B33] hover:bg-[#EBE2D8]/30"
                                  : location.pathname === item.path
                                    ? "text-white bg-white/10"
                                    : "text-white/90 hover:text-white hover:bg-white/5"
                              } ${index !== lineeItems.length - 1 ? `border-b ${useDarkStyle ? "border-[#EBE2D8]" : "border-white/5"}` : ""}`}
                            >
                              {item.label}
                            </Link>
                          )
                        ))}
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
              
              {/* Language Selector - shrink-0 to prevent shrinking */}
              <div className="flex items-center gap-1.5 text-nav whitespace-nowrap shrink-0">
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
            </div>

            {/* CTA Button - Right - shrink-0 */}
            <div className="hidden xl:block shrink-0">
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
            className={`xl:hidden mt-4 mx-4 md:mx-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.24)] ${
              useDarkStyle 
                ? "bg-white border border-[#EBE2D8]" 
                : "bg-[rgba(255,255,255,0.08)] backdrop-blur-[18px] border border-white/[0.08]"
            }`}
          >
            <div className="px-6 py-6 space-y-2">
              <Link
                to={`/${language}`}
                className={`block text-base font-medium transition-colors py-2 ${
                  useDarkStyle
                    ? location.pathname === `/${language}` || location.pathname === `/${language}/` 
                      ? "text-[#3F3B33]" 
                      : "text-[#3F3B33]/70 hover:text-[#3F3B33]"
                    : location.pathname === `/${language}` || location.pathname === `/${language}/` 
                      ? "text-white" 
                      : "text-white/70 hover:text-white"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.home')}
              </Link>

              {/* Mobile Linee Expandable */}
              <div>
                <button
                  onClick={() => setIsLineeExpanded(!isLineeExpanded)}
                  className={`flex items-center justify-between w-full text-base font-medium transition-colors py-2 ${
                    useDarkStyle
                      ? isLineePage ? "text-[#3F3B33]" : "text-[#3F3B33]/70 hover:text-[#3F3B33]"
                      : isLineePage ? "text-white" : "text-white/70 hover:text-white"
                  }`}
                >
                  {t('nav.lines')}
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${isLineeExpanded ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {isLineeExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="pl-4 space-y-2 mt-2"
                    >
                      {lineeItems.map((item) => (
                        item.comingSoon ? (
                          <div
                            key={item.path}
                            className={`block text-sm font-medium py-2 cursor-not-allowed opacity-50 ${
                              useDarkStyle
                                ? "text-[#3F3B33]/60"
                                : "text-white/60"
                            }`}
                          >
                            {item.label} – <span className="italic">Coming soon</span>
                          </div>
                        ) : (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={`block text-sm font-medium transition-colors py-2 ${
                              useDarkStyle
                                ? location.pathname === item.path 
                                  ? "text-[#3F3B33]" 
                                  : "text-[#3F3B33]/60 hover:text-[#3F3B33]"
                                : location.pathname === item.path 
                                  ? "text-white" 
                                  : "text-white/60 hover:text-white"
                            }`}
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setIsLineeExpanded(false);
                            }}
                          >
                            {item.label}
                          </Link>
                        )
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block text-base font-medium transition-colors py-2 ${
                    useDarkStyle
                      ? location.pathname === item.path 
                        ? "text-[#3F3B33]" 
                        : "text-[#3F3B33]/70 hover:text-[#3F3B33]"
                      : location.pathname === item.path 
                        ? "text-white" 
                        : "text-white/70 hover:text-white"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile Language Selector */}
              <div className={`flex items-center justify-center gap-2 py-4 border-t mt-4 ${
                useDarkStyle ? "border-[#EBE2D8]" : "border-white/10"
              }`}>
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      handleLanguageChange(lang);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-3 py-1 rounded-lg transition-all text-xs ${
                      useDarkStyle
                        ? language === lang 
                          ? "bg-[#3F3B33] text-white font-semibold" 
                          : "text-[#3F3B33]/70 hover:text-[#3F3B33] hover:bg-[#EBE2D8]"
                        : language === lang 
                          ? "bg-white text-[#111] font-semibold" 
                          : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>

              <Link
                to={`/${language}/diventa-partner`}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block w-full text-center px-6 py-2 rounded-xl text-sm transition-all duration-150 ${
                  useDarkStyle 
                    ? "bg-[#3F3B33] text-white hover:bg-[#3F3B33]/90" 
                    : "bg-white text-[#111] hover:bg-[#F3F3F3]"
                }`}
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
