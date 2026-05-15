import { useTranslation } from "@/i18n/useTranslation";
import { useEffect } from "react";
import { FileText, AlertCircle, Scale, UserCheck, Ban, Gavel } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const Termini = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${t("terms.title")} - Kalēa`;
  }, [t]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Termini e Condizioni — Kalēa®"
        description="Termini e condizioni di utilizzo del sito Kalēa®: limiti di responsabilità, proprietà intellettuale, foro competente e regole del servizio."
        keywords="termini condizioni Kalēa, condizioni d'uso, terms of service"
      />
      {/* Hero */}
      <section className="py-16 md:py-24 bg-secondary/10">
        <div className="container-custom">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <Scale className="w-8 h-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground">
                {t("terms.title")}
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              {t("terms.lastUpdate")}: 26 novembre 2025
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-spacing">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Intro */}
            <div className="prose prose-lg max-w-none">
              <p className="text-body text-muted-foreground">
                {t("terms.intro")}
              </p>
            </div>

            {/* Section 1 - Acceptance */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <UserCheck className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                    {t("terms.section1.title")}
                  </h2>
                  <div className="space-y-3 text-body text-muted-foreground">
                    <p>{t("terms.section1.content1")}</p>
                    <p>{t("terms.section1.content2")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2 - Services */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <FileText className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                    {t("terms.section2.title")}
                  </h2>
                  <div className="space-y-3 text-body text-muted-foreground">
                    <p>{t("terms.section2.content1")}</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>{t("terms.section2.list1")}</li>
                      <li>{t("terms.section2.list2")}</li>
                      <li>{t("terms.section2.list3")}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3 - Intellectual Property */}
            <div>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                {t("terms.section3.title")}
              </h2>
              <div className="space-y-3 text-body text-muted-foreground">
                <p>{t("terms.section3.content1")}</p>
                <p>{t("terms.section3.content2")}</p>
              </div>
            </div>

            {/* Section 4 - Use of Website */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <AlertCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                    {t("terms.section4.title")}
                  </h2>
                  <div className="space-y-4 text-body text-muted-foreground">
                    <p>{t("terms.section4.content1")}</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>{t("terms.section4.list1")}</li>
                      <li>{t("terms.section4.list2")}</li>
                      <li>{t("terms.section4.list3")}</li>
                      <li>{t("terms.section4.list4")}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5 - Products and Orders */}
            <div>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                {t("terms.section5.title")}
              </h2>
              <div className="space-y-3 text-body text-muted-foreground">
                <p>{t("terms.section5.content1")}</p>
                <p>{t("terms.section5.content2")}</p>
                <p>{t("terms.section5.content3")}</p>
              </div>
            </div>

            {/* Section 6 - Prices and Payment */}
            <div>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                {t("terms.section6.title")}
              </h2>
              <div className="space-y-3 text-body text-muted-foreground">
                <p>{t("terms.section6.content1")}</p>
                <p>{t("terms.section6.content2")}</p>
              </div>
            </div>

            {/* Section 7 - Warranty */}
            <div>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                {t("terms.section7.title")}
              </h2>
              <div className="space-y-3 text-body text-muted-foreground">
                <p>{t("terms.section7.content1")}</p>
                <p>{t("terms.section7.content2")}</p>
              </div>
            </div>

            {/* Section 8 - Liability */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <Ban className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                    {t("terms.section8.title")}
                  </h2>
                  <div className="space-y-3 text-body text-muted-foreground">
                    <p>{t("terms.section8.content1")}</p>
                    <p>{t("terms.section8.content2")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 9 - Links */}
            <div>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                {t("terms.section9.title")}
              </h2>
              <div className="space-y-3 text-body text-muted-foreground">
                <p>{t("terms.section9.content1")}</p>
              </div>
            </div>

            {/* Section 10 - Applicable Law */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <Gavel className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                    {t("terms.section10.title")}
                  </h2>
                  <div className="space-y-3 text-body text-muted-foreground">
                    <p>{t("terms.section10.content1")}</p>
                    <p>{t("terms.section10.content2")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 11 - Changes */}
            <div>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                {t("terms.section11.title")}
              </h2>
              <div className="space-y-3 text-body text-muted-foreground">
                <p>{t("terms.section11.content1")}</p>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-primary/5 p-8 rounded-lg">
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                {t("terms.contact.title")}
              </h2>
              <p className="text-body text-muted-foreground mb-4">
                {t("terms.contact.content")}
              </p>
              <div className="space-y-3 text-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{t("footer.legalHQ")}</p>
                    <p className="text-muted-foreground">Via 4 Novembre, 15</p>
                    <p className="text-muted-foreground">25078 Vestone (BS) Italy</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{t("footer.operationalHQ")}</p>
                    <p className="text-muted-foreground">Via Generale Bernasconi, 8A</p>
                    <p className="text-muted-foreground">25015 Desenzano del Garda (BS)</p>
                  </div>
                </div>
                <div className="space-y-1 text-muted-foreground">
                  <p>P.IVA: 04203540986 | REA: BS - 596517</p>
                </div>
                <div className="pt-2 border-t border-foreground/10 space-y-1">
                  <p>
                    <strong>Email:</strong>{" "}
                    <a href="mailto:info@kalea.space" className="text-primary hover:underline">
                      info@kalea.space
                    </a>
                  </p>
                  <p>
                    <strong>Tel:</strong>{" "}
                    <a href="tel:+393520351738" className="text-primary hover:underline">
                      +39 352 035 1738
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Termini;
