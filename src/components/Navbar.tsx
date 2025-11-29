import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLineeExpanded, setIsLineeExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();

  // Auto-hide navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
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
    { label: "Area Tecnica", path: "/area-tecnica" },
    { label: "Chi Siamo", path: "/chi-siamo" },
    { label: "Contatti", path: "/contatti" },
  ];

  const lineeItems = [
    { label: "StoneCore 10", path: "/stonecore-10" },
    { label: "EdgeLine", path: "/edgeline" },
    { label: "OneWall", path: "/onewall" },
  ];

  const isLineePage = lineeItems.some((item) => location.pathname === item.path);

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
      className="fixed top-0 left-0 right-0 z-50 px-16 md:px-24 lg:px-32"
    >
      <div className="max-w-[1280px] mx-auto bg-[rgba(255,255,255,0.08)] backdrop-blur-[18px] rounded-b-[32px] border-b border-x border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        <div className="px-8 md:px-12">
          <div className="flex items-center justify-between h-[80px]">
            {/* Logo - Left */}
            <Link
              to="/"
              className="hover:opacity-80 transition-opacity duration-200 z-10"
            >
              <img src={logo} alt="Kalēa" className="h-8 md:h-10" />
            </Link>

            {/* Desktop Menu - Center */}
            <div className="hidden lg:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
              <Link
                to="/"
                className={`text-nav transition-all duration-200 relative ${
                  location.pathname === "/" ? "text-white" : "text-white/90 hover:text-white"
                }`}
              >
                Home
                {location.pathname === "/" && (
                  <motion.div
                    layoutId="navbar-underline"
                    className="absolute -bottom-1 left-0 right-0 h-[1px] bg-white"
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
                  className={`text-nav transition-all duration-200 flex items-center gap-1 ${
                    isLineePage ? "text-white" : "text-white/90 hover:text-white"
                  }`}
                >
                  Linee
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                  {isLineePage && (
                    <motion.div
                      layoutId="navbar-underline"
                      className="absolute -bottom-1 left-0 right-0 h-[1px] bg-white"
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
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-48 bg-[rgba(255,255,255,0.08)] backdrop-blur-[18px] rounded-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.24)] overflow-hidden z-50"
                    >
                      {lineeItems.map((item, index) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`block px-6 py-3 text-nav transition-all duration-200 ${
                            location.pathname === item.path
                              ? "text-white bg-white/10"
                              : "text-white/90 hover:text-white hover:bg-white/5"
                          } ${index !== lineeItems.length - 1 ? "border-b border-white/5" : ""}`}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-nav transition-all duration-200 relative ${
                    location.pathname === item.path ? "text-white" : "text-white/90 hover:text-white"
                  }`}
                >
                  {item.label}
                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="navbar-underline"
                      className="absolute -bottom-1 left-0 right-0 h-[1px] bg-white"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* CTA Button - Right */}
            <div className="hidden lg:block">
              <Link
                to="/contatti"
                className="inline-flex items-center justify-center px-9 py-3 bg-white text-[#111] rounded-xl text-button hover:bg-[#F3F3F3] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-150"
              >
                Richiedi preventivo
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-white hover:text-white/70 transition-colors"
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
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden mt-4 mx-6 bg-[rgba(255,255,255,0.08)] backdrop-blur-[18px] rounded-3xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.24)]"
          >
            <div className="px-6 py-6 space-y-2">
              <Link
                to="/"
                className={`block text-base font-medium transition-colors py-2 ${
                  location.pathname === "/" ? "text-white" : "text-white/70 hover:text-white"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>

              {/* Mobile Linee Expandable */}
              <div>
                <button
                  onClick={() => setIsLineeExpanded(!isLineeExpanded)}
                  className={`flex items-center justify-between w-full text-base font-medium transition-colors py-2 ${
                    isLineePage ? "text-white" : "text-white/70 hover:text-white"
                  }`}
                >
                  Linee
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
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`block text-sm font-medium transition-colors py-2 ${
                            location.pathname === item.path ? "text-white" : "text-white/60 hover:text-white"
                          }`}
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setIsLineeExpanded(false);
                          }}
                        >
                          {item.label}
                        </Link>
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
                    location.pathname === item.path ? "text-white" : "text-white/70 hover:text-white"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <Link
                to="/contatti"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center px-9 py-3 bg-white text-[#111] rounded-xl text-button hover:bg-[#F3F3F3] transition-all duration-150 mt-4"
              >
                Richiedi preventivo
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
