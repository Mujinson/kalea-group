import { Link } from "react-router-dom";
import { Mail, Phone, Linkedin, Facebook, Instagram } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import logoFooter from "@/assets/logo-kalea-k-cream.png";

const XIcon = ({ size = 24, className = "", strokeWidth = 1.5 }: { size?: number; className?: string; strokeWidth?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
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
          {/* Logo */}
          <div className="md:col-span-1">
            <img src={logoFooter} alt="Kalēa®" className="h-20 mb-4" />
            <p className="text-muted-foreground text-sm leading-relaxed">
              Hub di Fornitura per l'Architettura d'Interni
            </p>
          </div>

          {/* Sedi */}
          <div className="flex flex-col justify-start">
            <h4 className="text-sm font-heading font-semibold text-foreground mb-4 uppercase tracking-wider">{t("footer.legalHQ")}</h4>
            <div className="space-y-1 text-sm text-muted-foreground mb-5">
              <p>Via 4 Novembre, 15</p>
              <p>25078 Vestone (BS) Italy</p>
            </div>
            <h4 className="text-sm font-heading font-semibold text-foreground mb-4 uppercase tracking-wider">{t("footer.operationalHQ")}</h4>
            <div className="space-y-1 text-sm text-muted-foreground mb-5">
              <p>Via Generale Bernasconi, 8A</p>
              <p>25015 Desenzano del Garda (BS)</p>
            </div>
            <div className="text-sm text-muted-foreground pt-3 border-t border-foreground/5">
              <p>P.IVA: 04203540986</p>
              <p>REA: BS - 596517</p>
            </div>
          </div>

          {/* Quick Links - updated for General Contractor */}
          <div className="flex flex-col justify-start">
            <h4 className="text-sm font-heading font-semibold text-foreground mb-4 uppercase tracking-wider">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2">
              <li><Link to={`/${language}/biomag-floor`} className="text-sm text-muted-foreground hover:text-primary transition-colors">BIOMAG FLOOR®</Link></li>
              <li><Link to={`/${language}/area-tecnica`} className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("nav.technicalArea")}</Link></li>
              <li><Link to={`/${language}/chi-siamo`} className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("nav.aboutUs")}</Link></li>
              <li><Link to={`/${language}/realizzazioni`} className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("nav.projects")}</Link></li>
              <li><Link to={`/${language}/normative`} className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.certifications")}</Link></li>
            </ul>
          </div>

          {/* Contatti & Social */}
          <div className="flex flex-col justify-start">
            <h4 className="text-sm font-heading font-semibold text-foreground mb-4 uppercase tracking-wider">{t("footer.contactsTitle")}</h4>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <a href="mailto:info@kalea.space" className="text-sm text-muted-foreground hover:text-primary transition-colors">info@kalea.space</a>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <a href="tel:+393520351738" className="text-sm text-muted-foreground hover:text-primary transition-colors">+39 352 035 1738</a>
              </li>
            </ul>
            <h4 className="text-sm font-heading font-semibold text-foreground mb-4 uppercase tracking-wider">{t("footer.followUs")}</h4>
            <div className="flex items-center gap-5">
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="p-2 -m-2 group" aria-label="X"><XIcon size={22} className="text-foreground/80 group-hover:text-foreground transition-all duration-250 group-hover:scale-110" strokeWidth={1.5} /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 -m-2 group" aria-label="LinkedIn"><Linkedin size={22} className="text-foreground/80 group-hover:text-foreground transition-all duration-250 group-hover:scale-110" strokeWidth={1.5} /></a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 -m-2 group" aria-label="Facebook"><Facebook size={22} className="text-foreground/80 group-hover:text-foreground transition-all duration-250 group-hover:scale-110" strokeWidth={1.5} /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 -m-2 group" aria-label="Instagram"><Instagram size={22} className="text-foreground/80 group-hover:text-foreground transition-all duration-250 group-hover:scale-110" strokeWidth={1.5} /></a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 pt-4 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© {currentYear} Kalēa®. {t("footer.copyright")}</p>
          <div className="flex gap-6">
            <Link to={`/${language}/privacy`} className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.privacy")}</Link>
            <Link to={`/${language}/termini`} className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.terms")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;