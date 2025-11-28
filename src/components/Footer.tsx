import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Logo & Tagline */}
          <div>
            <h3 className="text-2xl font-heading font-bold text-foreground mb-3">Kalēa</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Superfici di nuova generazione in MgO. Pavimenti, profili e pannelli sviluppati in Italia per durare e
              trasformare gli spazi.
            </p>
          </div>

          {/* Link Rapidi */}
          <div>
            <h4 className="text-sm font-heading font-semibold text-foreground mb-4 uppercase tracking-wider">
              Link Rapidi
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/stonecore-10" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  StoneCore 10
                </Link>
              </li>
              <li>
                <Link to="/edgeline" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  EdgeLine
                </Link>
              </li>
              <li>
                <Link to="/onewall" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  OneWall
                </Link>
              </li>
              <li>
                <Link to="/area-tecnica" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Area Tecnica
                </Link>
              </li>
              <li>
                <Link to="/chi-siamo" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Chi Siamo
                </Link>
              </li>
            </ul>
          </div>

          {/* Contatti */}
          <div>
            <h4 className="text-sm font-heading font-semibold text-foreground mb-4 uppercase tracking-wider">
              Contatti
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <a
                  href="mailto:info@kalea.it"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  info@kalea.it
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <a
                  href="tel:+390123456789"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  +39 012 345 6789
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Italia</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© {currentYear} Kalēa. Tutti i diritti riservati.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/termini" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Termini e Condizioni
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
