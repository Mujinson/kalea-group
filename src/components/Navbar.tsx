import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <nav className="fixed top-0 left-0 right-0 z-50 pt-6">
      <div className="container-custom">
        <div
          className={`flex items-center justify-between h-16 px-8 rounded-full transition-all duration-500 ${
            isScrolled
              ? "bg-card/90 backdrop-blur-xl shadow-large"
              : "bg-card/60 backdrop-blur-md"
          }`}
        >
          {/* Logo */}
          <Link to="/" className="text-xl font-heading font-bold text-foreground hover:text-muted-foreground transition-colors">
            Kalēa
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-foreground relative ${
                  location.pathname === item.path ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {item.label}
                {location.pathname === item.path && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-px bg-foreground"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Button asChild variant="default" size="default" className="rounded-full">
              <Link to="/contatti">Richiedi preventivo</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-foreground hover:text-muted-foreground transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-card/95 backdrop-blur-xl mt-4 rounded-3xl border border-border"
            >
              <div className="py-6 px-6 space-y-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`block text-base font-medium transition-colors hover:text-foreground ${
                      location.pathname === item.path ? "text-foreground" : "text-muted-foreground"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <Button asChild variant="default" size="default" className="w-full mt-4 rounded-full">
                  <Link to="/contatti" onClick={() => setIsMobileMenuOpen(false)}>
                    Richiedi preventivo
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
