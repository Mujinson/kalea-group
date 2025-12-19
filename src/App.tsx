import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import StoneCore10 from "./pages/StoneCore10";
import EdgeLine from "./pages/EdgeLine";
// OneWall page is Coming Soon - routes redirect to home
import AreaTecnica from "./pages/AreaTecnica";
import ChiSiamo from "./pages/ChiSiamo";
import Contatti from "./pages/Contatti";
import DiventaPartner from "./pages/DiventaPartner";
import Privacy from "./pages/Privacy";
import Termini from "./pages/Termini";
import NotFound from "./pages/NotFound";
import ColorProductPage from "./pages/ColorProductPage";
import SustainabilityImpact from "./pages/SustainabilityImpact";
import SustainabilityDurability from "./pages/SustainabilityDurability";
import SustainabilityMaintenance from "./pages/SustainabilityMaintenance";
import Normative from "./pages/Normative";
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
    // Add hreflang tags
    const languages = ['it', 'en', 'de', 'fr'];
    const currentPath = window.location.pathname.replace(/^\/(it|en|de|fr)/, '');
    const baseUrl = window.location.origin;

    // Remove existing hreflang tags
    document.querySelectorAll('link[hreflang]').forEach(el => el.remove());

    // Add hreflang tags for each language
    languages.forEach(lang => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = lang;
      link.href = `${baseUrl}/${lang}${currentPath}`;
      document.head.appendChild(link);
    });

    // Add x-default hreflang
    const xDefault = document.createElement('link');
    xDefault.rel = 'alternate';
    xDefault.hreflang = 'x-default';
    xDefault.href = `${baseUrl}/en${currentPath}`;
    document.head.appendChild(xDefault);
  }, []);

  return null;
};

const App = () => (
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

              {/* Italian slugs (used in sidebar) */}
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

              {/* English aliases (keep compatibility) */}
              <Route path="sales" element={<AdminSales />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="inventory" element={<AdminInventory />} />
              <Route path="costs" element={<AdminCosts />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            
            {/* Main site routes */}
            {/* Redirect root to /it */}
            <Route path="/" element={<Navigate to="/it" replace />} />
            
            {/* Italian routes */}
            <Route path="/it" element={<><SEOHandler /><Layout><Home /></Layout></>} />
            <Route path="/it/stonecore-10" element={<><SEOHandler /><Layout><StoneCore10 /></Layout></>} />
            <Route path="/it/edgeline" element={<><SEOHandler /><Layout><EdgeLine /></Layout></>} />
            <Route path="/it/onewall" element={<Navigate to="/it" replace />} />
            <Route path="/it/area-tecnica" element={<><SEOHandler /><Layout><AreaTecnica /></Layout></>} />
            <Route path="/it/chi-siamo" element={<><SEOHandler /><Layout><ChiSiamo /></Layout></>} />
            <Route path="/it/contatti" element={<><SEOHandler /><Layout><Contatti /></Layout></>} />
            <Route path="/it/diventa-partner" element={<><SEOHandler /><Layout><DiventaPartner /></Layout></>} />
            <Route path="/it/privacy" element={<><SEOHandler /><Layout><Privacy /></Layout></>} />
            <Route path="/it/termini" element={<><SEOHandler /><Layout><Termini /></Layout></>} />
            <Route path="/it/colore/:colorSlug" element={<><SEOHandler /><Layout><ColorProductPage /></Layout></>} />
            <Route path="/it/sostenibilita/impatto-ambientale" element={<><SEOHandler /><Layout><SustainabilityImpact /></Layout></>} />
            <Route path="/it/sostenibilita/lunga-durata" element={<><SEOHandler /><Layout><SustainabilityDurability /></Layout></>} />
            <Route path="/it/sostenibilita/manutenzione" element={<><SEOHandler /><Layout><SustainabilityMaintenance /></Layout></>} />
            <Route path="/it/normative" element={<><SEOHandler /><Layout><Normative /></Layout></>} />
            
            {/* English routes */}
            <Route path="/en" element={<><SEOHandler /><Layout><Home /></Layout></>} />
            <Route path="/en/stonecore-10" element={<><SEOHandler /><Layout><StoneCore10 /></Layout></>} />
            <Route path="/en/edgeline" element={<><SEOHandler /><Layout><EdgeLine /></Layout></>} />
            <Route path="/en/onewall" element={<Navigate to="/en" replace />} />
            <Route path="/en/area-tecnica" element={<><SEOHandler /><Layout><AreaTecnica /></Layout></>} />
            <Route path="/en/chi-siamo" element={<><SEOHandler /><Layout><ChiSiamo /></Layout></>} />
            <Route path="/en/contatti" element={<><SEOHandler /><Layout><Contatti /></Layout></>} />
            <Route path="/en/diventa-partner" element={<><SEOHandler /><Layout><DiventaPartner /></Layout></>} />
            <Route path="/en/privacy" element={<><SEOHandler /><Layout><Privacy /></Layout></>} />
            <Route path="/en/termini" element={<><SEOHandler /><Layout><Termini /></Layout></>} />
            <Route path="/en/colore/:colorSlug" element={<><SEOHandler /><Layout><ColorProductPage /></Layout></>} />
            <Route path="/en/sostenibilita/impatto-ambientale" element={<><SEOHandler /><Layout><SustainabilityImpact /></Layout></>} />
            <Route path="/en/sostenibilita/lunga-durata" element={<><SEOHandler /><Layout><SustainabilityDurability /></Layout></>} />
            <Route path="/en/sostenibilita/manutenzione" element={<><SEOHandler /><Layout><SustainabilityMaintenance /></Layout></>} />
            <Route path="/en/normative" element={<><SEOHandler /><Layout><Normative /></Layout></>} />
            
            {/* German routes */}
            <Route path="/de" element={<><SEOHandler /><Layout><Home /></Layout></>} />
            <Route path="/de/stonecore-10" element={<><SEOHandler /><Layout><StoneCore10 /></Layout></>} />
            <Route path="/de/edgeline" element={<><SEOHandler /><Layout><EdgeLine /></Layout></>} />
            <Route path="/de/onewall" element={<Navigate to="/de" replace />} />
            <Route path="/de/area-tecnica" element={<><SEOHandler /><Layout><AreaTecnica /></Layout></>} />
            <Route path="/de/chi-siamo" element={<><SEOHandler /><Layout><ChiSiamo /></Layout></>} />
            <Route path="/de/contatti" element={<><SEOHandler /><Layout><Contatti /></Layout></>} />
            <Route path="/de/diventa-partner" element={<><SEOHandler /><Layout><DiventaPartner /></Layout></>} />
            <Route path="/de/privacy" element={<><SEOHandler /><Layout><Privacy /></Layout></>} />
            <Route path="/de/termini" element={<><SEOHandler /><Layout><Termini /></Layout></>} />
            <Route path="/de/colore/:colorSlug" element={<><SEOHandler /><Layout><ColorProductPage /></Layout></>} />
            <Route path="/de/sostenibilita/impatto-ambientale" element={<><SEOHandler /><Layout><SustainabilityImpact /></Layout></>} />
            <Route path="/de/sostenibilita/lunga-durata" element={<><SEOHandler /><Layout><SustainabilityDurability /></Layout></>} />
            <Route path="/de/sostenibilita/manutenzione" element={<><SEOHandler /><Layout><SustainabilityMaintenance /></Layout></>} />
            <Route path="/de/normative" element={<><SEOHandler /><Layout><Normative /></Layout></>} />
            
            {/* French routes */}
            <Route path="/fr" element={<><SEOHandler /><Layout><Home /></Layout></>} />
            <Route path="/fr/stonecore-10" element={<><SEOHandler /><Layout><StoneCore10 /></Layout></>} />
            <Route path="/fr/edgeline" element={<><SEOHandler /><Layout><EdgeLine /></Layout></>} />
            <Route path="/fr/onewall" element={<Navigate to="/fr" replace />} />
            <Route path="/fr/area-tecnica" element={<><SEOHandler /><Layout><AreaTecnica /></Layout></>} />
            <Route path="/fr/chi-siamo" element={<><SEOHandler /><Layout><ChiSiamo /></Layout></>} />
            <Route path="/fr/contatti" element={<><SEOHandler /><Layout><Contatti /></Layout></>} />
            <Route path="/fr/diventa-partner" element={<><SEOHandler /><Layout><DiventaPartner /></Layout></>} />
            <Route path="/fr/privacy" element={<><SEOHandler /><Layout><Privacy /></Layout></>} />
            <Route path="/fr/termini" element={<><SEOHandler /><Layout><Termini /></Layout></>} />
            <Route path="/fr/colore/:colorSlug" element={<><SEOHandler /><Layout><ColorProductPage /></Layout></>} />
            <Route path="/fr/sostenibilita/impatto-ambientale" element={<><SEOHandler /><Layout><SustainabilityImpact /></Layout></>} />
            <Route path="/fr/sostenibilita/lunga-durata" element={<><SEOHandler /><Layout><SustainabilityDurability /></Layout></>} />
            <Route path="/fr/sostenibilita/manutenzione" element={<><SEOHandler /><Layout><SustainabilityMaintenance /></Layout></>} />
            <Route path="/fr/normative" element={<><SEOHandler /><Layout><Normative /></Layout></>} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </I18nProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
