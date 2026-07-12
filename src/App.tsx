import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { isCrmHost } from "@/lib/host";
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
import Sopraelevati from "./pages/Sopraelevati";

import SustainabilityImpact from "./pages/SustainabilityImpact";
import SustainabilityDurability from "./pages/SustainabilityDurability";
import SustainabilityMaintenance from "./pages/SustainabilityMaintenance";
import Normative from "./pages/Normative";
import Realizzazioni from "./pages/Realizzazioni";
import Welcome from "./pages/Welcome";
import DiscoverKalea from "./pages/DiscoverKalea";
import { I18nProvider } from "./i18n/context";
import ScrollToTop from "./components/ScrollToTop";
import { useEffect } from "react";
import { initAnalytics, trackPageView } from "@/lib/analytics";

// GA4 page_view on every SPA navigation. Init runs once.
const AnalyticsRouteTracker = () => {
  const location = useLocation();
  useEffect(() => { initAnalytics(); }, []);
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);
  return null;
};


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
import AdminContabilita from "./pages/admin/AdminContabilita";
import AdminFatturazione from "./pages/admin/AdminFatturazione";
import AdminImport from "./pages/admin/AdminImport";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminLangRedirect from "./pages/admin/AdminLangRedirect";
import AppLangRedirect from "./pages/AppLangRedirect";
import AdminQuotes from "./pages/admin/AdminQuotes";
import AdminQuoteCreate from "./pages/admin/AdminQuoteCreate";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminTimeOff from "./pages/admin/AdminTimeOff";
import AdminCommissions from "./pages/admin/AdminCommissions";
import AdminPipeline from "./pages/admin/AdminPipeline";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminChatbot from "./pages/admin/AdminChatbot";
import AdminMap from "./pages/admin/AdminMap";
import AdminCantieri from "./pages/admin/AdminCantieri";
import AdminPlanner from "./pages/admin/AdminPlanner";
import AdminCantiereDetail from "./pages/admin/AdminCantiereDetail";
import AdminMedia from "./pages/admin/AdminMedia";
import WorkerApp from "./pages/admin/WorkerApp";
import AdminWorkLogs from "./pages/admin/AdminWorkLogs";
import AdminTimbrature from "./pages/admin/AdminTimbrature";
import CantieriDashboard from "./pages/admin/cantieri/CantieriDashboard";
import CantieriOperaiOre from "./pages/admin/cantieri/CantieriOperaiOre";
import CantieriMateriali from "./pages/admin/cantieri/CantieriMateriali";
import CantieriBudget from "./pages/admin/cantieri/CantieriBudget";
import CantieriReport from "./pages/admin/cantieri/CantieriReport";
import AdminCatalog from "./pages/admin/AdminCatalog";
import CatalogPlaceholder from "./pages/admin/catalog/CatalogPlaceholder";
import CatalogBrands from "./pages/admin/catalog/CatalogBrands";
import CatalogCollections from "./pages/admin/catalog/CatalogCollections";
import CatalogCategories from "./pages/admin/catalog/CatalogCategories";
import CatalogPriceLists from "./pages/admin/catalog/CatalogPriceLists";
import CatalogAuditLog from "./pages/admin/catalog/CatalogAuditLog";

import WorkerDetail from "./pages/admin/cantieri/WorkerDetail";
import CostoOperaio from "./pages/admin/strumenti/CostoOperaio";
import Sostenibilita from "./pages/admin/strumenti/Sostenibilita";
import PricingFlow from "./pages/admin/strumenti/PricingFlow";
import PricingKronos from "./pages/admin/strumenti/PricingKronos";
import PricingBerryAlloc from "./pages/admin/strumenti/PricingBerryAlloc";
import PricingParquet from "./pages/admin/strumenti/PricingParquet";
import PricingSignature from "./pages/admin/strumenti/PricingSignature";
import PricingExterno from "./pages/admin/strumenti/PricingExterno";
import Preventivatore from "./pages/admin/strumenti/Preventivatore";
import SistemaPreventivi from "./pages/admin/strumenti/SistemaPreventivi";
import CreaPreventivo from "./pages/admin/strumenti/CreaPreventivo";
import CommercialeApp from "./pages/role-app/CommercialeApp";
import OperaioApp from "./pages/role-app/OperaioApp";
import IbridoApp from "./pages/role-app/IbridoApp";
import OAuthConsent from "./pages/OAuthConsent";
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

// On crm.kalea.space: force every non-admin path into /admin
// and inject a noindex meta tag so the CRM isn't crawled.
const CrmHostGate = () => {
  const location = useLocation();

  useEffect(() => {
    if (!isCrmHost()) return;
    let tag = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!tag) {
      tag = document.createElement("meta");
      tag.name = "robots";
      document.head.appendChild(tag);
    }
    tag.content = "noindex,nofollow";
  }, []);

  if (!isCrmHost()) return null;

  const previewCrmPrefix = "/crm.kalea.space";
  const isPreviewCrmPath =
    location.pathname === previewCrmPrefix ||
    location.pathname.startsWith(`${previewCrmPrefix}/`);
  const p = isPreviewCrmPath
    ? location.pathname.slice(previewCrmPrefix.length) || "/"
    : location.pathname;
  const allowed =
    p === "/admin" ||
    p.startsWith("/admin/") ||
    p === "/app" ||
    p.startsWith("/app/") ||
    p === "/cantieri-app" ||
    p.startsWith("/cantieri-app/") ||
    p.startsWith("/.lovable/");

  if (allowed) return null;

  // Root → admin overview
  if (p === "/" || p === "") {
    return <Navigate to="/admin" replace />;
  }

  // Block public-site language prefixes on the CRM host
  if (/^\/(it|en|de|fr)(\/|$)/.test(p)) {
    return <Navigate to="/admin" replace />;
  }

  // Clean URL rewrite: crm.kalea.space/leads → /admin/leads
  return <Navigate to={`/admin${p}${location.search}${location.hash}`} replace />;
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
            <AnalyticsRouteTracker />
            <CrmHostGate />
            <Routes>
              {/* Redirect /it/admin/* to /admin/* */}
              <Route path="/:lang/admin/*" element={<AdminLangRedirect />} />
              {/* Redirect /it/app/* and /it/cantieri-app to non-prefixed equivalents */}
              <Route path="/:lang/app/*" element={<AppLangRedirect />} />
              <Route path="/:lang/cantieri-app" element={<AppLangRedirect />} />


              {/* Legacy worker app → unified under /app/operaio */}
              <Route path="/cantieri-app" element={<Navigate to="/app/operaio" replace />} />
              <Route path="/cantieri-app/*" element={<Navigate to="/app/operaio" replace />} />

              {/* Role-based mobile apps */}
              <Route path="/app/commerciale/*" element={<CommercialeApp />} />
              <Route path="/app/operaio/*" element={<OperaioApp />} />
              <Route path="/app/ibrido/*" element={<IbridoApp />} />

              {/* OAuth consent (MCP) */}
              <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />

              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminOverview />} />

                {/* Italian slugs (used in sidebar) */}
                <Route path="vendite" element={<AdminSales />} />
                <Route path="preventivi" element={<AdminQuotes />} />
                <Route path="preventivi/nuovo" element={<CreaPreventivo />} />
                <Route path="preventivi/modifica" element={<CreaPreventivo />} />
                <Route path="clienti" element={<AdminCustomers />} />
                <Route path="magazzino" element={<AdminInventory />} />
                <Route path="catalogo" element={<AdminCatalog />} />
                <Route path="catalogo/marche" element={<CatalogBrands />} />
                <Route path="catalogo/collezioni" element={<CatalogCollections />} />
                <Route path="catalogo/categorie" element={<CatalogCategories />} />
                <Route path="catalogo/listini" element={<CatalogPriceLists />} />
                <Route path="catalogo/storico" element={<CatalogAuditLog />} />

                <Route path="catalogo/importa" element={<CatalogPlaceholder title="Importa listino" description="Upload di file XLSX / CSV / PDF con anteprima diff e versioning. In arrivo nella Fase 3." />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="leads" element={<AdminLeads />} />
                <Route path="pipeline" element={<AdminPipeline />} />
                <Route path="appuntamenti" element={<AdminAppointments />} />
                <Route path="chatbot" element={<AdminChatbot />} />
                <Route path="mappa" element={<AdminMap />} />
                <Route path="cantieri" element={<AdminCantieri />} />
                <Route path="planner" element={<AdminPlanner />} />
                <Route path="cantieri/:id" element={<AdminCantiereDetail />} />
                <Route path="cantieri-dashboard" element={<CantieriDashboard />} />
                <Route path="cantieri-operai" element={<CantieriOperaiOre />} />
                <Route path="cantieri-operai/:id" element={<WorkerDetail />} />
                <Route path="cantieri-materiali" element={<CantieriMateriali />} />
                <Route path="cantieri-budget" element={<CantieriBudget />} />
                <Route path="cantieri-report" element={<CantieriReport />} />
                <Route path="media" element={<AdminMedia />} />
                <Route path="registro-lavori" element={<AdminWorkLogs />} />
                <Route path="timbrature" element={<AdminTimbrature />} />
                <Route path="costi" element={<AdminCosts />} />
                <Route path="pagamenti" element={<AdminPayments />} />
                <Route path="contabilita" element={<AdminContabilita />} />
                <Route path="fatturazione" element={<AdminFatturazione />} />
                <Route path="import" element={<AdminImport />} />
                <Route path="ferie" element={<AdminTimeOff />} />
                <Route path="time-off" element={<AdminTimeOff />} />
                <Route path="commissioni" element={<AdminCommissions />} />
                <Route path="commissions" element={<AdminCommissions />} />

                <Route path="impostazioni" element={<AdminSettings />} />

                {/* Strumenti */}
                <Route path="strumenti/preventivatore" element={<Preventivatore />} />
                <Route path="strumenti/sistema-preventivi" element={<SistemaPreventivi />} />
                <Route path="strumenti/crea-preventivo" element={<Navigate to="/admin/preventivi/nuovo" replace />} />
                <Route path="strumenti/costo-operaio" element={<CostoOperaio />} />
                <Route path="strumenti/sostenibilita" element={<Sostenibilita />} />
                <Route path="strumenti/pricing-flow" element={<PricingFlow />} />
                <Route path="strumenti/pricing-kronos" element={<PricingKronos />} />
                <Route path="strumenti/pricing-berryalloc" element={<PricingBerryAlloc />} />
                <Route path="strumenti/pricing-parquet" element={<PricingParquet />} />
                <Route path="strumenti/pricing-signature" element={<PricingSignature />} />
                <Route path="strumenti/pricing-externo" element={<PricingExterno />} />

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
              <Route path="/it/edgeline" element={<Navigate to="/it/indoor" replace />} />
              <Route path="/it/biowall" element={<Navigate to="/it/indoor" replace />} />
              <Route path="/it/kaleabase" element={<Navigate to="/it/indoor" replace />} />
              <Route path="/it/externo" element={<><SEOHandler /><Layout><Externo /></Layout></>} />
              <Route path="/it/kaleaceiling" element={<Navigate to="/it/outdoor" replace />} />
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
              <Route path="/en/edgeline" element={<Navigate to="/en/indoor" replace />} />
              <Route path="/en/biowall" element={<Navigate to="/en/indoor" replace />} />
              <Route path="/en/kaleabase" element={<Navigate to="/en/indoor" replace />} />
              <Route path="/en/externo" element={<><SEOHandler /><Layout><Externo /></Layout></>} />
              <Route path="/en/kaleaceiling" element={<Navigate to="/en/outdoor" replace />} />
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
              <Route path="/de/edgeline" element={<Navigate to="/de/indoor" replace />} />
              <Route path="/de/biowall" element={<Navigate to="/de/indoor" replace />} />
              <Route path="/de/kaleabase" element={<Navigate to="/de/indoor" replace />} />
              <Route path="/de/externo" element={<><SEOHandler /><Layout><Externo /></Layout></>} />
              <Route path="/de/kaleaceiling" element={<Navigate to="/de/outdoor" replace />} />
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
              <Route path="/fr/edgeline" element={<Navigate to="/fr/indoor" replace />} />
              <Route path="/fr/biowall" element={<Navigate to="/fr/indoor" replace />} />
              <Route path="/fr/kaleabase" element={<Navigate to="/fr/indoor" replace />} />
              <Route path="/fr/externo" element={<><SEOHandler /><Layout><Externo /></Layout></>} />
              <Route path="/fr/kaleaceiling" element={<Navigate to="/fr/outdoor" replace />} />
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
              <Route path="/it/biowall/:slug" element={<Navigate to="/it/indoor" replace />} />
              <Route path="/en/biowall/:slug" element={<Navigate to="/en/indoor" replace />} />
              <Route path="/de/biowall/:slug" element={<Navigate to="/de/indoor" replace />} />
              <Route path="/fr/biowall/:slug" element={<Navigate to="/fr/indoor" replace />} />

              {/* Outdoor Selection (Skema alternative to Externo) */}
              <Route path="/it/outdoor/selection" element={<><SEOHandler /><Layout><OutdoorSelection /></Layout></>} />
              <Route path="/en/outdoor/selection" element={<><SEOHandler /><Layout><OutdoorSelection /></Layout></>} />
              <Route path="/de/outdoor/selection" element={<><SEOHandler /><Layout><OutdoorSelection /></Layout></>} />
              <Route path="/fr/outdoor/selection" element={<><SEOHandler /><Layout><OutdoorSelection /></Layout></>} />

              {/* Fonoassorbenti */}
              <Route path="/it/fonoassorbenti" element={<Navigate to="/it/indoor" replace />} />
              <Route path="/en/fonoassorbenti" element={<Navigate to="/en/indoor" replace />} />
              <Route path="/de/fonoassorbenti" element={<Navigate to="/de/indoor" replace />} />
              <Route path="/fr/fonoassorbenti" element={<Navigate to="/fr/indoor" replace />} />

              <Route path="/it/sopraelevati" element={<><SEOHandler /><Layout><Sopraelevati /></Layout></>} />
              <Route path="/en/sopraelevati" element={<><SEOHandler /><Layout><Sopraelevati /></Layout></>} />
              <Route path="/de/sopraelevati" element={<><SEOHandler /><Layout><Sopraelevati /></Layout></>} />
              <Route path="/fr/sopraelevati" element={<><SEOHandler /><Layout><Sopraelevati /></Layout></>} />

              {/* Discover Kalēa */}
              <Route path="/discover-kalea" element={<Navigate to="/it/discover-kalea" replace />} />
              <Route path="/it/discover-kalea" element={<><SEOHandler /><Layout><DiscoverKalea /></Layout></>} />
              <Route path="/en/discover-kalea" element={<><SEOHandler /><Layout><DiscoverKalea /></Layout></>} />
              <Route path="/de/discover-kalea" element={<><SEOHandler /><Layout><DiscoverKalea /></Layout></>} />
              <Route path="/fr/discover-kalea" element={<><SEOHandler /><Layout><DiscoverKalea /></Layout></>} />








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
