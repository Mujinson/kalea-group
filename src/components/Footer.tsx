import { Link } from "react-router-dom";
import { Mail, Phone, Linkedin, Facebook, Instagram } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import logoFooter from "@/assets/logo-kalea-k-cream.png";

// X (formerly Twitter) icon component
const XIcon = ({ size = 24, className = "", strokeWidth = 1.5 }: { size?: number; className?: string; strokeWidth?: number }) => (
  <svg 
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
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

const Footer = () => {
  const { t, language } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 bg-background border-t border-foreground/10">
      <div className="container-custom py-6 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          {/* Section 1: Logo Only */}
          <div className="md:col-span-1">
            <img src={logoFooter} alt="Kalēa®" className="h-20 mb-4" />
            <p className="text-muted-foreground text-sm leading-relaxed">{t("footer.tagline")}</p>
          </div>

          {/* Section 2: Sedi */}
          <div className="flex flex-col justify-start">
            <h4 className="text-sm font-heading font-semibold text-foreground mb-4 uppercase tracking-wider">
              {t("footer.legalHQ")}
            </h4>
            <div className="space-y-1 text-sm text-muted-foreground mb-5">
              <p>Via 4 Novembre, 15</p>
              <p>25078 Vestone (BS) Italy</p>
            </div>
            
            <h4 className="text-sm font-heading font-semibold text-foreground mb-4 uppercase tracking-wider">
              {t("footer.operationalHQ")}
            </h4>
            <div className="space-y-1 text-sm text-muted-foreground mb-5">
              <p>Via Generale Bernasconi, 8A</p>
              <p>25015 Desenzano del Garda (BS)</p>
            </div>
            
            <div className="text-sm text-muted-foreground pt-3 border-t border-foreground/5">
              <p>P.IVA: 04203540986</p>
              <p>REA: BS - 596517</p>
            </div>
          </div>

          {/* Section 3: Link Rapidi */}
          <div className="flex flex-col justify-start">
            <h4 className="text-sm font-heading font-semibold text-foreground mb-4 uppercase tracking-wider">
              {t("footer.quickLinks")}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to={`/${language}/biomag-floor`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  BIOMAG FLOOR®
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
              <li>
                <Link
                  to={`/${language}/normative`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("footer.certifications")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Section 4: Contatti & Social */}
          <div className="flex flex-col justify-start">
            <h4 className="text-sm font-heading font-semibold text-foreground mb-4 uppercase tracking-wider">
              {t("footer.contactsTitle")}
            </h4>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <a
                  href="mailto:info@kalea.space"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  info@kalea.space
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <a
                  href="tel:+393520351738"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  +39 352 035 1738
                </a>
              </li>
            </ul>

            <h4 className="text-sm font-heading font-semibold text-foreground mb-4 uppercase tracking-wider">
              {t("footer.followUs")}
            </h4>
            <div className="flex items-center gap-5">
              <a
                href="https://www.instagram.com/kalea.group/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 -m-2 group"
                aria-label="Instagram"
              >
                <Instagram size={22} className="text-foreground/80 group-hover:text-foreground transition-all duration-250 group-hover:scale-110" strokeWidth={1.5} />
              </a>
              <a
                href="https://www.facebook.com/people/Kalea/61585013655612/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 -m-2 group"
                aria-label="Facebook"
              >
                <Facebook size={22} className="text-foreground/80 group-hover:text-foreground transition-all duration-250 group-hover:scale-110" strokeWidth={1.5} />
              </a>
              <a
                href="https://it.pinterest.com/Kalea_Group/_created/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 -m-2 group"
                aria-label="Pinterest"
              >
                <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor" className="text-foreground/80 group-hover:text-foreground transition-all duration-250 group-hover:scale-110">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.466-6.227 7.466-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/kalea-group-4bb7583b6/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 -m-2 group"
                aria-label="LinkedIn"
              >
                <Linkedin size={22} className="text-foreground/80 group-hover:text-foreground transition-all duration-250 group-hover:scale-110" strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 pt-4 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Kalēa®. {t("footer.copyright")}
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
