import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { label: "Home", path: "/" },
    { label: "StoneCore 10", path: "/stonecore-10" },
    { label: "EdgeLine", path: "/edgeline" },
    { label: "OneWall", path: "/onewall" },
    { label: "Area Tecnica", path: "/area-tecnica" },
    { label: "Chi Siamo", path: "/chi-siamo" },
    { label: "Contatti", path: "/contatti" },
  ];

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 w-full px-6 md:px-8 lg:px-12"
    >
      <div className="w-full bg-[rgba(23,26,31,0.8)] backdrop-blur-xl rounded-b-[32px] border-b border-white/10 shadow-lg">
        <div className="max-w-[1400px] mx-auto px-8 md:px-12">
          <div className="flex items-center justify-between h-[80px]">
            {/* Logo - Left */}
            <Link 
              to="/" 
              className="text-2xl font-heading font-bold text-white hover:opacity-80 transition-opacity duration-200 z-10"
            >
              Kalēa
            </Link>

            {/* Desktop Menu - Center */}
            <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-[15px] font-medium transition-all duration-200 relative ${
                    location.pathname === item.path 
                      ? "text-white" 
                      : "text-white/70 hover:text-white"
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
                className="inline-flex items-center justify-center px-8 h-[46px] bg-white text-[#171A1F] rounded-full font-medium text-[15px] hover:bg-white/90 hover:shadow-lg transition-all duration-200"
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
            className="lg:hidden bg-[rgba(23,26,31,0.95)] backdrop-blur-xl border-b border-white/10"
          >
            <div className="px-6 py-6 space-y-4">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block text-base font-medium transition-colors ${
                    location.pathname === item.path 
                      ? "text-white" 
                      : "text-white/70 hover:text-white"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/contatti"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center px-6 py-3 bg-white text-[#171A1F] rounded-full font-medium text-[15px] hover:bg-white/90 transition-all duration-200 mt-4"
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
