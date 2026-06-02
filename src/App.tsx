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
import BiocoreFloor from "./pages/BiocoreFloor";
import HypermattXL from "./pages/HypermattXL";
import HypermattSpina from "./pages/HypermattSpina";
import Hypermatt55 from "./pages/Hypermatt55";
import EdgeLine from "./pages/EdgeLine";
import Biowall from "./pages/Biowall";
import Kaleabase from "./pages/Kaleabase";
import Externo from "@/pages/Externo";
import Kaleaceiling from "./pages/Kaleaceiling";
import CeramicheInterni from "./pages/CeramicheInterni";
import CeramicheEsterni from "./pages/CeramicheEsterni";
import AreaTecnica from "./pages/AreaTecnica";
import ChiSiamo from "./pages/ChiSiamo";
import Contatti from "./pages/Contatti";
import DiventaPartner from "./pages/DiventaPartner";
import Privacy from "./pages/Privacy";
import Termini from "./pages/Termini";
import NotFound from "./pages/NotFound";
import CeramicaCollectionDetail from "./pages/CeramicaCollectionDetail";
import Parquet from "./pages/Parquet";
import ParquetCollectionDetail from "./pages/ParquetCollectionDetail";
import IndoorSpc from "./pages/IndoorSpc";
import SpcCollectionDetail from "./pages/SpcCollectionDetail";
import IndoorLaminati from "./pages/IndoorLaminati";
import LaminatoCollectionDetail from "./pages/LaminatoCollectionDetail";
import BiowallCollectionDetail from "./pages/BiowallCollectionDetail";
import OutdoorSelection from "./pages/OutdoorSelection";
import Fonoassorbenti from "./pages/Fonoassorbenti";
import Sopraelevati from "./pages/Sopraelevati";

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
import AdminQuoteCreate from "./pages/admin/AdminQuoteCreate";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminPipeline from "./pages/admin/AdminPipeline";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminChatbot from "./pages/admin/AdminChatbot";
import AdminMap from "./pages/admin/AdminMap";
import AdminCantieri from "./pages/admin/AdminCantieri";
import AdminCantiereDetail from "./pages/admin/AdminCantiereDetail";
import AdminMedia from "./pages/admin/AdminMedia";
import WorkerApp from "./pages/admin/WorkerApp";
import AdminWorkLogs from "./pages/admin/AdminWorkLogs";
import CantieriDashboard from "./pages/admin/cantieri/CantieriDashboard";
import CantieriOperaiOre from "./pages/admin/cantieri/CantieriOperaiOre";
import CantieriMateriali from "./pages/admin/cantieri/CantieriMateriali";
import CantieriBudget from "./pages/admin/cantieri/CantieriBudget";
import CantieriReport from "./pages/admin/cantieri/CantieriReport";
import AdminCatalog from "./pages/admin/AdminCatalog";
import WorkerDetail from "./pages/admin/cantieri/WorkerDetail";
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
  <MotionConfig reducedMotion="never">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <I18nProvider>
            <ScrollToTop />
            <Routes>
              {/* Redirect /it/admin/* to /admin/* */}
              <Route path="/:lang/admin/*" element={<AdminLangRedirect />} />

              {/* Worker app (standalone, no sidebar) */}
              <Route path="/cantieri-app" element={<WorkerApp />} />

              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminOverview />} />

                {/* Italian slugs (used in sidebar) */}
                <Route path="vendite" element={<AdminSales />} />
                <Route path="preventivi" element={<AdminQuotes />} />
                <Route path="preventivi/nuovo" element={<AdminQuoteCreate />} />
                <Route path="preventivi/modifica" element={<AdminQuoteCreate />} />
                <Route path="clienti" element={<AdminCustomers />} />
                <Route path="magazzino" element={<AdminInventory />} />
                <Route path="catalogo" element={<AdminCatalog />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="leads" element={<AdminLeads />} />
                <Route path="pipeline" element={<AdminPipeline />} />
                <Route path="appuntamenti" element={<AdminAppointments />} />
                <Route path="chatbot" element={<AdminChatbot />} />
                <Route path="mappa" element={<AdminMap />} />
                <Route path="cantieri" element={<AdminCantieri />} />
                <Route path="cantieri/:id" element={<AdminCantiereDetail />} />
                <Route path="cantieri-dashboard" element={<CantieriDashboard />} />
                <Route path="cantieri-operai" element={<CantieriOperaiOre />} />
                <Route path="cantieri-operai/:id" element={<WorkerDetail />} />
                <Route path="cantieri-materiali" element={<CantieriMateriali />} />
                <Route path="cantieri-budget" element={<CantieriBudget />} />
                <Route path="cantieri-report" element={<CantieriReport />} />
                <Route path="media" element={<AdminMedia />} />
                <Route path="registro-lavori" element={<AdminWorkLogs />} />
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
              {/* Welcome landing page (QR code access) */}
              <Route path="/welcome" element={<Welcome />} />
              
              {/* Redirect root to /it */}
              <Route path="/" element={<Navigate to="/it" replace />} />

              {/* Italian routes */}
              <Route path="/it" element={<><SEOHandler /><Layout><Home /></Layout></>} />
              <Route path="/it/indoor" element={<><SEOHandler /><Layout><Indoor /></Layout></>} />
              <Route path="/it/outdoor" element={<><SEOHandler /><Layout><Outdoor /></Layout></>} />
              <Route path="/it/biomag-floor" element={<><SEOHandler /><Layout><BiomagFloor /></Layout></>} />
              <Route path="/it/hypermatt" element={<><SEOHandler /><Layout><BiocoreFloor /></Layout></>} />
              <Route path="/it/biocore-floor" element={<Navigate to="/it/hypermatt" replace />} />
              <Route path="/it/hypermatt-xl" element={<><SEOHandler /><Layout><HypermattXL /></Layout></>} />
              <Route path="/it/hypermatt-spina" element={<><SEOHandler /><Layout><HypermattSpina /></Layout></>} />
              <Route path="/it/hypermatt-55" element={<><SEOHandler /><Layout><Hypermatt55 /></Layout></>} />
              <Route path="/it/edgeline" element={<><SEOHandler /><Layout><EdgeLine /></Layout></>} />
              <Route path="/it/biowall" element={<><SEOHandler /><Layout><Biowall /></Layout></>} />
              <Route path="/it/kaleabase" element={<><SEOHandler /><Layout><Kaleabase /></Layout></>} />
              <Route path="/it/externo" element={<><SEOHandler /><Layout><Externo /></Layout></>} />
              <Route path="/it/kaleaceiling" element={<><SEOHandler /><Layout><Kaleaceiling /></Layout></>} />
              <Route path="/it/ceramiche-interni" element={<><SEOHandler /><Layout><CeramicheInterni /></Layout></>} />
              <Route path="/it/ceramiche-esterni" element={<><SEOHandler /><Layout><CeramicheEsterni /></Layout></>} />
              <Route path="/it/area-tecnica" element={<><SEOHandler /><Layout><AreaTecnica /></Layout></>} />
              <Route path="/it/chi-siamo" element={<><SEOHandler /><Layout><ChiSiamo /></Layout></>} />
              <Route path="/it/contatti" element={<><SEOHandler /><Layout><Contatti /></Layout></>} />
              <Route path="/it/diventa-partner" element={<><SEOHandler /><Layout><DiventaPartner /></Layout></>} />
              <Route path="/it/privacy" element={<><SEOHandler /><Layout><Privacy /></Layout></>} />
              <Route path="/it/termini" element={<><SEOHandler /><Layout><Termini /></Layout></>} />

              <Route path="/it/sostenibilita/impatto-ambientale" element={<><SEOHandler /><Layout><SustainabilityImpact /></Layout></>} />
              <Route path="/it/sostenibilita/lunga-durata" element={<><SEOHandler /><Layout><SustainabilityDurability /></Layout></>} />
              <Route path="/it/sostenibilita/manutenzione" element={<><SEOHandler /><Layout><SustainabilityMaintenance /></Layout></>} />
              <Route path="/it/normative" element={<><SEOHandler /><Layout><Normative /></Layout></>} />
              <Route path="/it/realizzazioni" element={<><SEOHandler /><Layout><Realizzazioni /></Layout></>} />

              {/* English routes */}
              <Route path="/en" element={<><SEOHandler /><Layout><Home /></Layout></>} />
              <Route path="/en/indoor" element={<><SEOHandler /><Layout><Indoor /></Layout></>} />
              <Route path="/en/outdoor" element={<><SEOHandler /><Layout><Outdoor /></Layout></>} />
              <Route path="/en/biomag-floor" element={<><SEOHandler /><Layout><BiomagFloor /></Layout></>} />
              <Route path="/en/hypermatt" element={<><SEOHandler /><Layout><BiocoreFloor /></Layout></>} />
              <Route path="/en/biocore-floor" element={<Navigate to="/en/hypermatt" replace />} />
              <Route path="/en/hypermatt-xl" element={<><SEOHandler /><Layout><HypermattXL /></Layout></>} />
              <Route path="/en/hypermatt-spina" element={<><SEOHandler /><Layout><HypermattSpina /></Layout></>} />
              <Route path="/en/hypermatt-55" element={<><SEOHandler /><Layout><Hypermatt55 /></Layout></>} />
              <Route path="/en/edgeline" element={<><SEOHandler /><Layout><EdgeLine /></Layout></>} />
              <Route path="/en/biowall" element={<><SEOHandler /><Layout><Biowall /></Layout></>} />
              <Route path="/en/kaleabase" element={<><SEOHandler /><Layout><Kaleabase /></Layout></>} />
              <Route path="/en/externo" element={<><SEOHandler /><Layout><Externo /></Layout></>} />
              <Route path="/en/kaleaceiling" element={<><SEOHandler /><Layout><Kaleaceiling /></Layout></>} />
              <Route path="/en/ceramiche-interni" element={<><SEOHandler /><Layout><CeramicheInterni /></Layout></>} />
              <Route path="/en/ceramiche-esterni" element={<><SEOHandler /><Layout><CeramicheEsterni /></Layout></>} />
              <Route path="/en/area-tecnica" element={<><SEOHandler /><Layout><AreaTecnica /></Layout></>} />
              <Route path="/en/chi-siamo" element={<><SEOHandler /><Layout><ChiSiamo /></Layout></>} />
              <Route path="/en/contatti" element={<><SEOHandler /><Layout><Contatti /></Layout></>} />
              <Route path="/en/diventa-partner" element={<><SEOHandler /><Layout><DiventaPartner /></Layout></>} />
              <Route path="/en/privacy" element={<><SEOHandler /><Layout><Privacy /></Layout></>} />
              <Route path="/en/termini" element={<><SEOHandler /><Layout><Termini /></Layout></>} />

              <Route path="/en/sostenibilita/impatto-ambientale" element={<><SEOHandler /><Layout><SustainabilityImpact /></Layout></>} />
              <Route path="/en/sostenibilita/lunga-durata" element={<><SEOHandler /><Layout><SustainabilityDurability /></Layout></>} />
              <Route path="/en/sostenibilita/manutenzione" element={<><SEOHandler /><Layout><SustainabilityMaintenance /></Layout></>} />
              <Route path="/en/normative" element={<><SEOHandler /><Layout><Normative /></Layout></>} />
              <Route path="/en/realizzazioni" element={<><SEOHandler /><Layout><Realizzazioni /></Layout></>} />

              {/* German routes */}
              <Route path="/de" element={<><SEOHandler /><Layout><Home /></Layout></>} />
              <Route path="/de/indoor" element={<><SEOHandler /><Layout><Indoor /></Layout></>} />
              <Route path="/de/outdoor" element={<><SEOHandler /><Layout><Outdoor /></Layout></>} />
              <Route path="/de/biomag-floor" element={<><SEOHandler /><Layout><BiomagFloor /></Layout></>} />
              <Route path="/de/hypermatt" element={<><SEOHandler /><Layout><BiocoreFloor /></Layout></>} />
              <Route path="/de/biocore-floor" element={<Navigate to="/de/hypermatt" replace />} />
              <Route path="/de/hypermatt-xl" element={<><SEOHandler /><Layout><HypermattXL /></Layout></>} />
              <Route path="/de/hypermatt-spina" element={<><SEOHandler /><Layout><HypermattSpina /></Layout></>} />
              <Route path="/de/hypermatt-55" element={<><SEOHandler /><Layout><Hypermatt55 /></Layout></>} />
              <Route path="/de/edgeline" element={<><SEOHandler /><Layout><EdgeLine /></Layout></>} />
              <Route path="/de/biowall" element={<><SEOHandler /><Layout><Biowall /></Layout></>} />
              <Route path="/de/kaleabase" element={<><SEOHandler /><Layout><Kaleabase /></Layout></>} />
              <Route path="/de/externo" element={<><SEOHandler /><Layout><Externo /></Layout></>} />
              <Route path="/de/kaleaceiling" element={<><SEOHandler /><Layout><Kaleaceiling /></Layout></>} />
              <Route path="/de/ceramiche-interni" element={<><SEOHandler /><Layout><CeramicheInterni /></Layout></>} />
              <Route path="/de/ceramiche-esterni" element={<><SEOHandler /><Layout><CeramicheEsterni /></Layout></>} />
              <Route path="/de/area-tecnica" element={<><SEOHandler /><Layout><AreaTecnica /></Layout></>} />
              <Route path="/de/chi-siamo" element={<><SEOHandler /><Layout><ChiSiamo /></Layout></>} />
              <Route path="/de/contatti" element={<><SEOHandler /><Layout><Contatti /></Layout></>} />
              <Route path="/de/diventa-partner" element={<><SEOHandler /><Layout><DiventaPartner /></Layout></>} />
              <Route path="/de/privacy" element={<><SEOHandler /><Layout><Privacy /></Layout></>} />
              <Route path="/de/termini" element={<><SEOHandler /><Layout><Termini /></Layout></>} />

              <Route path="/de/sostenibilita/impatto-ambientale" element={<><SEOHandler /><Layout><SustainabilityImpact /></Layout></>} />
              <Route path="/de/sostenibilita/lunga-durata" element={<><SEOHandler /><Layout><SustainabilityDurability /></Layout></>} />
              <Route path="/de/sostenibilita/manutenzione" element={<><SEOHandler /><Layout><SustainabilityMaintenance /></Layout></>} />
              <Route path="/de/normative" element={<><SEOHandler /><Layout><Normative /></Layout></>} />
              <Route path="/de/realizzazioni" element={<><SEOHandler /><Layout><Realizzazioni /></Layout></>} />

              {/* French routes */}
              <Route path="/fr" element={<><SEOHandler /><Layout><Home /></Layout></>} />
              <Route path="/fr/indoor" element={<><SEOHandler /><Layout><Indoor /></Layout></>} />
              <Route path="/fr/outdoor" element={<><SEOHandler /><Layout><Outdoor /></Layout></>} />
              <Route path="/fr/biomag-floor" element={<><SEOHandler /><Layout><BiomagFloor /></Layout></>} />
              <Route path="/fr/hypermatt" element={<><SEOHandler /><Layout><BiocoreFloor /></Layout></>} />
              <Route path="/fr/biocore-floor" element={<Navigate to="/fr/hypermatt" replace />} />
              <Route path="/fr/hypermatt-xl" element={<><SEOHandler /><Layout><HypermattXL /></Layout></>} />
              <Route path="/fr/hypermatt-spina" element={<><SEOHandler /><Layout><HypermattSpina /></Layout></>} />
              <Route path="/fr/hypermatt-55" element={<><SEOHandler /><Layout><Hypermatt55 /></Layout></>} />
              <Route path="/fr/edgeline" element={<><SEOHandler /><Layout><EdgeLine /></Layout></>} />
              <Route path="/fr/biowall" element={<><SEOHandler /><Layout><Biowall /></Layout></>} />
              <Route path="/fr/kaleabase" element={<><SEOHandler /><Layout><Kaleabase /></Layout></>} />
              <Route path="/fr/externo" element={<><SEOHandler /><Layout><Externo /></Layout></>} />
              <Route path="/fr/kaleaceiling" element={<><SEOHandler /><Layout><Kaleaceiling /></Layout></>} />
              <Route path="/fr/ceramiche-interni" element={<><SEOHandler /><Layout><CeramicheInterni /></Layout></>} />
              <Route path="/fr/ceramiche-esterni" element={<><SEOHandler /><Layout><CeramicheEsterni /></Layout></>} />
              <Route path="/fr/area-tecnica" element={<><SEOHandler /><Layout><AreaTecnica /></Layout></>} />
              <Route path="/fr/chi-siamo" element={<><SEOHandler /><Layout><ChiSiamo /></Layout></>} />
              <Route path="/fr/contatti" element={<><SEOHandler /><Layout><Contatti /></Layout></>} />
              <Route path="/fr/diventa-partner" element={<><SEOHandler /><Layout><DiventaPartner /></Layout></>} />
              <Route path="/fr/privacy" element={<><SEOHandler /><Layout><Privacy /></Layout></>} />
              <Route path="/fr/termini" element={<><SEOHandler /><Layout><Termini /></Layout></>} />

              <Route path="/fr/sostenibilita/impatto-ambientale" element={<><SEOHandler /><Layout><SustainabilityImpact /></Layout></>} />
              <Route path="/fr/sostenibilita/lunga-durata" element={<><SEOHandler /><Layout><SustainabilityDurability /></Layout></>} />
              <Route path="/fr/sostenibilita/manutenzione" element={<><SEOHandler /><Layout><SustainabilityMaintenance /></Layout></>} />
              <Route path="/fr/normative" element={<><SEOHandler /><Layout><Normative /></Layout></>} />
              <Route path="/fr/realizzazioni" element={<><SEOHandler /><Layout><Realizzazioni /></Layout></>} />

              {/* Ceramiche collection detail (all languages) */}
              <Route path="/it/ceramiche/:slug" element={<><SEOHandler /><Layout><CeramicaCollectionDetail /></Layout></>} />
              <Route path="/en/ceramiche/:slug" element={<><SEOHandler /><Layout><CeramicaCollectionDetail /></Layout></>} />
              <Route path="/de/ceramiche/:slug" element={<><SEOHandler /><Layout><CeramicaCollectionDetail /></Layout></>} />
              <Route path="/fr/ceramiche/:slug" element={<><SEOHandler /><Layout><CeramicaCollectionDetail /></Layout></>} />

              {/* Parquet hub + collection detail (all languages) */}
              <Route path="/it/parquet" element={<><SEOHandler /><Layout><Parquet /></Layout></>} />
              <Route path="/en/parquet" element={<><SEOHandler /><Layout><Parquet /></Layout></>} />
              <Route path="/de/parquet" element={<><SEOHandler /><Layout><Parquet /></Layout></>} />
              <Route path="/fr/parquet" element={<><SEOHandler /><Layout><Parquet /></Layout></>} />
              <Route path="/it/parquet/:slug" element={<><SEOHandler /><Layout><ParquetCollectionDetail /></Layout></>} />
              <Route path="/en/parquet/:slug" element={<><SEOHandler /><Layout><ParquetCollectionDetail /></Layout></>} />
              <Route path="/de/parquet/:slug" element={<><SEOHandler /><Layout><ParquetCollectionDetail /></Layout></>} />
              <Route path="/fr/parquet/:slug" element={<><SEOHandler /><Layout><ParquetCollectionDetail /></Layout></>} />

              {/* SPC hub + collection detail (all languages) */}
              <Route path="/it/indoor/spc" element={<><SEOHandler /><Layout><IndoorSpc /></Layout></>} />
              <Route path="/en/indoor/spc" element={<><SEOHandler /><Layout><IndoorSpc /></Layout></>} />
              <Route path="/de/indoor/spc" element={<><SEOHandler /><Layout><IndoorSpc /></Layout></>} />
              <Route path="/fr/indoor/spc" element={<><SEOHandler /><Layout><IndoorSpc /></Layout></>} />
              <Route path="/it/spc/:slug" element={<><SEOHandler /><Layout><SpcCollectionDetail /></Layout></>} />
              <Route path="/en/spc/:slug" element={<><SEOHandler /><Layout><SpcCollectionDetail /></Layout></>} />
              <Route path="/de/spc/:slug" element={<><SEOHandler /><Layout><SpcCollectionDetail /></Layout></>} />
              <Route path="/fr/spc/:slug" element={<><SEOHandler /><Layout><SpcCollectionDetail /></Layout></>} />

              {/* Laminati hub + collection detail (all languages) */}
              <Route path="/it/indoor/laminati" element={<><SEOHandler /><Layout><IndoorLaminati /></Layout></>} />
              <Route path="/en/indoor/laminati" element={<><SEOHandler /><Layout><IndoorLaminati /></Layout></>} />
              <Route path="/de/indoor/laminati" element={<><SEOHandler /><Layout><IndoorLaminati /></Layout></>} />
              <Route path="/fr/indoor/laminati" element={<><SEOHandler /><Layout><IndoorLaminati /></Layout></>} />
              <Route path="/it/laminati/:slug" element={<><SEOHandler /><Layout><LaminatoCollectionDetail /></Layout></>} />
              <Route path="/en/laminati/:slug" element={<><SEOHandler /><Layout><LaminatoCollectionDetail /></Layout></>} />
              <Route path="/de/laminati/:slug" element={<><SEOHandler /><Layout><LaminatoCollectionDetail /></Layout></>} />
              <Route path="/fr/laminati/:slug" element={<><SEOHandler /><Layout><LaminatoCollectionDetail /></Layout></>} />

              {/* BIOWALL collection detail (all languages) */}
              <Route path="/it/biowall/:slug" element={<><SEOHandler /><Layout><BiowallCollectionDetail /></Layout></>} />
              <Route path="/en/biowall/:slug" element={<><SEOHandler /><Layout><BiowallCollectionDetail /></Layout></>} />
              <Route path="/de/biowall/:slug" element={<><SEOHandler /><Layout><BiowallCollectionDetail /></Layout></>} />
              <Route path="/fr/biowall/:slug" element={<><SEOHandler /><Layout><BiowallCollectionDetail /></Layout></>} />

              {/* Outdoor Selection (Skema alternative to Externo) */}
              <Route path="/it/outdoor/selection" element={<><SEOHandler /><Layout><OutdoorSelection /></Layout></>} />
              <Route path="/en/outdoor/selection" element={<><SEOHandler /><Layout><OutdoorSelection /></Layout></>} />
              <Route path="/de/outdoor/selection" element={<><SEOHandler /><Layout><OutdoorSelection /></Layout></>} />
              <Route path="/fr/outdoor/selection" element={<><SEOHandler /><Layout><OutdoorSelection /></Layout></>} />

              {/* Fonoassorbenti */}
              <Route path="/it/fonoassorbenti" element={<><SEOHandler /><Layout><Fonoassorbenti /></Layout></>} />
              <Route path="/en/fonoassorbenti" element={<><SEOHandler /><Layout><Fonoassorbenti /></Layout></>} />
              <Route path="/de/fonoassorbenti" element={<><SEOHandler /><Layout><Fonoassorbenti /></Layout></>} />
              <Route path="/fr/fonoassorbenti" element={<><SEOHandler /><Layout><Fonoassorbenti /></Layout></>} />

              <Route path="/it/sopraelevati" element={<><SEOHandler /><Layout><Sopraelevati /></Layout></>} />
              <Route path="/en/sopraelevati" element={<><SEOHandler /><Layout><Sopraelevati /></Layout></>} />
              <Route path="/de/sopraelevati" element={<><SEOHandler /><Layout><Sopraelevati /></Layout></>} />
              <Route path="/fr/sopraelevati" element={<><SEOHandler /><Layout><Sopraelevati /></Layout></>} />






              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </I18nProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </MotionConfig>
);

export default App;
