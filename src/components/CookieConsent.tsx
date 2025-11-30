import { useState, useEffect } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Checkbox } from "./ui/checkbox";
import { X, Cookie } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CookiePreferences {
  necessary: boolean;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
}

const CookieConsent = () => {
  const { t } = useTranslation();
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    preferences: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Delay banner appearance for smooth experience
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      preferences: true,
      analytics: true,
      marketing: true,
    };
    localStorage.setItem("cookie-consent", JSON.stringify(allAccepted));
    setShowBanner(false);
    setShowPreferences(false);
  };

  const savePreferences = () => {
    localStorage.setItem("cookie-consent", JSON.stringify(preferences));
    setShowBanner(false);
    setShowPreferences(false);
  };

  const rejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      preferences: false,
      analytics: false,
      marketing: false,
    };
    localStorage.setItem("cookie-consent", JSON.stringify(onlyNecessary));
    setShowBanner(false);
    setShowPreferences(false);
  };

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed z-50 w-[94%] max-w-[420px] left-1/2 -translate-x-1/2 bottom-6 md:w-full md:bottom-6 md:right-6 md:left-auto md:translate-x-0"
          >
            <div className="bg-background/80 backdrop-blur-xl border border-border/40 rounded-[18px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-5">
              <div className="flex items-start gap-3 mb-4">
                <Cookie className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-foreground mb-1">
                    {t('cookies.title')}
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {t('cookies.description')}
                  </p>
                </div>
                
                <button
                  onClick={rejectAll}
                  className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors -mt-1"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button
                  onClick={acceptAll}
                  size="sm"
                  className="w-full font-medium"
                >
                  {t('cookies.acceptAll')}
                </Button>
                <Button
                  onClick={() => setShowPreferences(true)}
                  variant="outline"
                  size="sm"
                  className="w-full font-medium"
                >
                  {t('cookies.managePreferences')}
                </Button>
                <button
                  onClick={rejectAll}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                >
                  {t('cookies.rejectAll')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Cookie className="w-6 h-6 text-primary" />
              {t('cookies.preferences.title')}
            </DialogTitle>
            <DialogDescription className="text-base">
              {t('cookies.preferences.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Necessary Cookies */}
            <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">
                    {t('cookies.preferences.necessary.title')}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t('cookies.preferences.necessary.description')}
                  </p>
                </div>
                <Checkbox
                  checked={preferences.necessary}
                  disabled
                  className="mt-1"
                />
              </div>
            </div>

            {/* Preferences Cookies */}
            <div className="space-y-3 p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">
                    {t('cookies.preferences.functional.title')}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t('cookies.preferences.functional.description')}
                  </p>
                </div>
                <Checkbox
                  checked={preferences.preferences}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, preferences: !!checked })
                  }
                  className="mt-1"
                />
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="space-y-3 p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">
                    {t('cookies.preferences.analytics.title')}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t('cookies.preferences.analytics.description')}
                  </p>
                </div>
                <Checkbox
                  checked={preferences.analytics}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, analytics: !!checked })
                  }
                  className="mt-1"
                />
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="space-y-3 p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">
                    {t('cookies.preferences.marketing.title')}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t('cookies.preferences.marketing.description')}
                  </p>
                </div>
                <Checkbox
                  checked={preferences.marketing}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, marketing: !!checked })
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button onClick={acceptAll} size="lg" className="flex-1">
              {t('cookies.acceptAll')}
            </Button>
            <Button onClick={savePreferences} variant="outline" size="lg" className="flex-1">
              {t('cookies.savePreferences')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CookieConsent;
