import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Indoor from "./pages/Indoor";
import Outdoor from "./pages/Outdoor";
import BiomagFloor from "./pages/BiomagFloor";
import EdgeLine from "./pages/EdgeLine";
import Biowall from "./pages/Biowall";
import Kaleabase from "./pages/Kaleabase";
import Kaleadeck from "./pages/Kaleadeck";
import Kaleaceiling from "./pages/Kaleaceiling";
import AreaTecnica from "./pages/AreaTecnica";
import ChiSiamo from "./pages/ChiSiamo";
import Contatti from "./pages/Contatti";
import DiventaPartner from "./pages/DiventaPartner";
import Privacy from "./pages/Privacy";
import Termini from "./pages/Termini";
import NotFound from "./pages/NotFound";

import SustainabilityImpact from "./pages/SustainabilityImpact";
import SustainabilityDurability from "./pages/SustainabilityDurability";
import SustainabilityMaintenance from "./pages/SustainabilityMaintenance";
import Normative from "./pages/Normative";
import Realizzazioni from "./pages/Realizzazioni";
import Welcome from "./pages/Welcome";
import { I18nProvider } from "./i18n/context";
import ScrollToTop from "./components/ScrollToTop";
import { useEffect } from "react";


// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminSales from "./pages/admin/AdminSales";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminCosts from "./pages/admin/AdminCosts";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminImport from "./pages/admin/AdminImport";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminLangRedirect from "./pages/admin/AdminLangRedirect";
import AdminQuotes from "./pages/admin/AdminQuotes";
import AdminLeads from "./pages/admin/AdminLeads";


const queryClient = new QueryClient();

// Component to handle SEO meta tags
const SEOHandler = () => {
  useEffect(() => {
    const languages = ['it', 'en', 'de', 'fr'];
    const currentPath = window.location.pathname.replace(/^\/(it|en|de|fr)/, '');
    const baseUrl = window.location.origin;

    document.querySelectorAll('link[hreflang]').forEach(el => el.remove());

    languages.forEach(lang => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = lang;
      link.href = `${baseUrl}/${lang}${currentPath}`;
      document.head.appendChild(link);
    });

    const xDefault = document.createElement('link');
    xDefault.rel = 'alternate';
    xDefault.hreflang = 'x-default';
    xDefault.href = `${baseUrl}/en${currentPath}`;
    document.head.appendChild(xDefault);
  }, []);

  return null;
};

const LangRoute = ({ children }: { children: React.ReactNode }) => (
  <><SEOHandler /><Layout>{children}</Layout></>
);

const App = () => (
  <MotionConfig reducedMotion="never">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <I18nProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Redirect /it/admin/* to /admin/* */}
              <Route path="/:lang/admin/*" element={<AdminLangRedirect />} />

              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="vendite" element={<AdminSales />} />
                <Route path="preventivi" element={<AdminQuotes />} />
                <Route path="clienti" element={<AdminCustomers />} />
                <Route path="magazzino" element={<AdminInventory />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="leads" element={<AdminLeads />} />
                <Route path="costi" element={<AdminCosts />} />
                <Route path="pagamenti" element={<AdminPayments />} />
                <Route path="import" element={<AdminImport />} />
                <Route path="impostazioni" element={<AdminSettings />} />
                <Route path="sales" element={<AdminSales />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="costs" element={<AdminCosts />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* Welcome landing page */}
              <Route path="/welcome" element={<Welcome />} />
              
              {/* Redirect root to /it */}
              <Route path="/" element={<Navigate to="/it" replace />} />

              {/* Language routes - all 4 languages share same structure */}
              {['it', 'en', 'de', 'fr'].map(lang => [
                <Route key={`${lang}-home`} path={`/${lang}`} element={<LangRoute><Home /></LangRoute>} />,
                <Route key={`${lang}-indoor`} path={`/${lang}/indoor`} element={<LangRoute><Indoor /></LangRoute>} />,
                <Route key={`${lang}-outdoor`} path={`/${lang}/outdoor`} element={<LangRoute><Outdoor /></LangRoute>} />,
                <Route key={`${lang}-biomag`} path={`/${lang}/biomag-floor`} element={<LangRoute><BiomagFloor /></LangRoute>} />,
                <Route key={`${lang}-edgeline`} path={`/${lang}/edgeline`} element={<LangRoute><EdgeLine /></LangRoute>} />,
                <Route key={`${lang}-biowall`} path={`/${lang}/biowall`} element={<LangRoute><Biowall /></LangRoute>} />,
                <Route key={`${lang}-kaleabase`} path={`/${lang}/kaleabase`} element={<LangRoute><Kaleabase /></LangRoute>} />,
                <Route key={`${lang}-kaleadeck`} path={`/${lang}/kaleadeck`} element={<LangRoute><Kaleadeck /></LangRoute>} />,
                <Route key={`${lang}-kaleaceiling`} path={`/${lang}/kaleaceiling`} element={<LangRoute><Kaleaceiling /></LangRoute>} />,
                <Route key={`${lang}-area`} path={`/${lang}/area-tecnica`} element={<LangRoute><AreaTecnica /></LangRoute>} />,
                <Route key={`${lang}-chi`} path={`/${lang}/chi-siamo`} element={<LangRoute><ChiSiamo /></LangRoute>} />,
                <Route key={`${lang}-contatti`} path={`/${lang}/contatti`} element={<LangRoute><Contatti /></LangRoute>} />,
                <Route key={`${lang}-partner`} path={`/${lang}/diventa-partner`} element={<LangRoute><DiventaPartner /></LangRoute>} />,
                <Route key={`${lang}-privacy`} path={`/${lang}/privacy`} element={<LangRoute><Privacy /></LangRoute>} />,
                <Route key={`${lang}-termini`} path={`/${lang}/termini`} element={<LangRoute><Termini /></LangRoute>} />,
                <Route key={`${lang}-sust-impact`} path={`/${lang}/sostenibilita/impatto-ambientale`} element={<LangRoute><SustainabilityImpact /></LangRoute>} />,
                <Route key={`${lang}-sust-dur`} path={`/${lang}/sostenibilita/lunga-durata`} element={<LangRoute><SustainabilityDurability /></LangRoute>} />,
                <Route key={`${lang}-sust-maint`} path={`/${lang}/sostenibilita/manutenzione`} element={<LangRoute><SustainabilityMaintenance /></LangRoute>} />,
                <Route key={`${lang}-norm`} path={`/${lang}/normative`} element={<LangRoute><Normative /></LangRoute>} />,
                <Route key={`${lang}-real`} path={`/${lang}/realizzazioni`} element={<LangRoute><Realizzazioni /></LangRoute>} />,
              ]).flat()}

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </I18nProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </MotionConfig>
);

export default App;