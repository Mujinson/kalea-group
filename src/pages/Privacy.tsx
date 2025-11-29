import { useTranslation } from "@/i18n/useTranslation";
import { useEffect } from "react";
import { Shield, Mail, FileText, Lock, Eye, Cookie } from "lucide-react";

const Privacy = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${t("privacy.title")} - Kalēa`;
  }, [t]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-16 md:py-24 bg-secondary/10">
        <div className="container-custom">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground">
                {t("privacy.title")}
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              {t("privacy.lastUpdate")}: 26 novembre 2025
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
                {t("privacy.intro")}
              </p>
            </div>

            {/* Section 1 - Data Controller */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <FileText className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                    {t("privacy.section1.title")}
                  </h2>
                  <div className="space-y-3 text-body text-muted-foreground">
                    <p>{t("privacy.section1.content1")}</p>
                    <div className="bg-secondary/10 p-4 rounded-lg">
                      <p className="font-medium text-foreground mb-2">Kalēa</p>
                      <p>Email: info@kalea.space</p>
                      <p>Tel: +39 012 345 6789</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2 - Data Collected */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <Eye className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                    {t("privacy.section2.title")}
                  </h2>
                  <div className="space-y-4 text-body text-muted-foreground">
                    <p>{t("privacy.section2.content1")}</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>{t("privacy.section2.list1")}</li>
                      <li>{t("privacy.section2.list2")}</li>
                      <li>{t("privacy.section2.list3")}</li>
                      <li>{t("privacy.section2.list4")}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3 - Purpose */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <Lock className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                    {t("privacy.section3.title")}
                  </h2>
                  <div className="space-y-4 text-body text-muted-foreground">
                    <p>{t("privacy.section3.content1")}</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>{t("privacy.section3.list1")}</li>
                      <li>{t("privacy.section3.list2")}</li>
                      <li>{t("privacy.section3.list3")}</li>
                      <li>{t("privacy.section3.list4")}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4 - Legal Basis */}
            <div>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                {t("privacy.section4.title")}
              </h2>
              <div className="space-y-3 text-body text-muted-foreground">
                <p>{t("privacy.section4.content1")}</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>{t("privacy.section4.list1")}</li>
                  <li>{t("privacy.section4.list2")}</li>
                  <li>{t("privacy.section4.list3")}</li>
                </ul>
              </div>
            </div>

            {/* Section 5 - Data Sharing */}
            <div>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                {t("privacy.section5.title")}
              </h2>
              <div className="space-y-3 text-body text-muted-foreground">
                <p>{t("privacy.section5.content1")}</p>
                <p>{t("privacy.section5.content2")}</p>
              </div>
            </div>

            {/* Section 6 - Data Retention */}
            <div>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                {t("privacy.section6.title")}
              </h2>
              <div className="space-y-3 text-body text-muted-foreground">
                <p>{t("privacy.section6.content1")}</p>
              </div>
            </div>

            {/* Section 7 - User Rights */}
            <div>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                {t("privacy.section7.title")}
              </h2>
              <div className="space-y-4 text-body text-muted-foreground">
                <p>{t("privacy.section7.content1")}</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>{t("privacy.section7.list1")}</li>
                  <li>{t("privacy.section7.list2")}</li>
                  <li>{t("privacy.section7.list3")}</li>
                  <li>{t("privacy.section7.list4")}</li>
                  <li>{t("privacy.section7.list5")}</li>
                  <li>{t("privacy.section7.list6")}</li>
                </ul>
              </div>
            </div>

            {/* Section 8 - Cookies */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <Cookie className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                    {t("privacy.section8.title")}
                  </h2>
                  <div className="space-y-3 text-body text-muted-foreground">
                    <p>{t("privacy.section8.content1")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 9 - Security */}
            <div>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                {t("privacy.section9.title")}
              </h2>
              <div className="space-y-3 text-body text-muted-foreground">
                <p>{t("privacy.section9.content1")}</p>
              </div>
            </div>

            {/* Section 10 - Changes */}
            <div>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                {t("privacy.section10.title")}
              </h2>
              <div className="space-y-3 text-body text-muted-foreground">
                <p>{t("privacy.section10.content1")}</p>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-primary/5 p-8 rounded-lg">
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                    {t("privacy.contact.title")}
                  </h2>
                  <p className="text-body text-muted-foreground mb-4">
                    {t("privacy.contact.content")}
                  </p>
                  <div className="space-y-2 text-body">
                    <p>
                      <strong>Email:</strong>{" "}
                      <a href="mailto:info@kalea.space" className="text-primary hover:underline">
                        info@kalea.space
                      </a>
                    </p>
                    <p>
                      <strong>Tel:</strong> +39 012 345 6789
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Privacy;
