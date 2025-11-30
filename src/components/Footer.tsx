import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Twitter, Linkedin, Facebook, Instagram } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import logoFooter from "@/assets/logo-footer.png";

const Footer = () => {
  const { t, language } = useTranslation();
  const currentYear = new Date().getFullYear();

  // Pinterest SVG Icon Component
  const PinterestIcon = ({ size = 24, className = "", strokeWidth = 1.5 }: { size?: number; className?: string; strokeWidth?: number }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M11 6v11M11 6c0 0 5 0 5 3.5s-2.5 4-5 4" />
      <path d="M10 17l-1.5 4" />
    </svg>
  );

  return (
    <footer className="bg-card border-t border-border">
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Logo & Tagline */}
          <div>
            <img src={logoFooter} alt="Kalēa" className="h-8 mb-3" />
            <p className="text-muted-foreground text-body">{t("footer.tagline")}</p>
          </div>

          {/* Link Rapidi */}
          <div>
            <h4 className="text-sm font-heading font-semibold text-foreground mb-4 uppercase tracking-wider">
              {t("footer.quickLinks")}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to={`/${language}/stonecore-10`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  StoneCore 10
                </Link>
              </li>
              <li>
                <Link
                  to={`/${language}/edgeline`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  EdgeLine
                </Link>
              </li>
              <li>
                <Link
                  to={`/${language}/onewall`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  OneWall
                </Link>
              </li>
              <li>
                <Link
                  to={`/${language}/area-tecnica`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("nav.technicalArea")}
                </Link>
              </li>
              <li>
                <Link
                  to={`/${language}/chi-siamo`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("nav.aboutUs")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contatti */}
          <div>
            <h4 className="text-sm font-heading font-semibold text-foreground mb-4 uppercase tracking-wider">
              {t("footer.contactsTitle")}
            </h4>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <a
                  href="mailto:info@kalea.space"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  info@kalea.space
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
                <span className="text-sm text-muted-foreground">{t("contacts.locationValue")}</span>
              </li>
            </ul>

            {/* Social Media */}
            <div className="footer-social">
              <h4 className="text-sm font-heading font-semibold text-foreground mb-4 uppercase tracking-wider">
                Seguici
              </h4>
              <div className="flex items-center gap-6">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 -m-2 group"
                  aria-label="Twitter"
                >
                  <Twitter size={24} className="text-foreground/80 group-hover:text-foreground transition-all duration-250 group-hover:scale-110" strokeWidth={1.5} />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 -m-2 group"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={24} className="text-foreground/80 group-hover:text-foreground transition-all duration-250 group-hover:scale-110" strokeWidth={1.5} />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 -m-2 group"
                  aria-label="Facebook"
                >
                  <Facebook size={24} className="text-foreground/80 group-hover:text-foreground transition-all duration-250 group-hover:scale-110" strokeWidth={1.5} />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 -m-2 group"
                  aria-label="Instagram"
                >
                  <Instagram size={24} className="text-foreground/80 group-hover:text-foreground transition-all duration-250 group-hover:scale-110" strokeWidth={1.5} />
                </a>
                <a
                  href="https://pinterest.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 -m-2 group"
                  aria-label="Pinterest"
                >
                  <PinterestIcon size={24} className="text-foreground/80 group-hover:text-foreground transition-all duration-250 group-hover:scale-110" strokeWidth={1.5} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Kalēa. {t("footer.copyright")}
          </p>
          <div className="flex gap-6">
            <Link
              to={`/${language}/privacy`}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {t("footer.privacy")}
            </Link>
            <Link
              to={`/${language}/termini`}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {t("footer.terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
