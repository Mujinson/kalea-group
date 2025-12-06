import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import StoneCore10 from "./pages/StoneCore10";
import EdgeLine from "./pages/EdgeLine";
import OneWall from "./pages/OneWall";
import AreaTecnica from "./pages/AreaTecnica";
import ChiSiamo from "./pages/ChiSiamo";
import Contatti from "./pages/Contatti";
import DiventaPartner from "./pages/DiventaPartner";
import Privacy from "./pages/Privacy";
import Termini from "./pages/Termini";
import NotFound from "./pages/NotFound";
import ColorProductPage from "./pages/ColorProductPage";
import { I18nProvider } from "./i18n/context";
import ScrollToTop from "./components/ScrollToTop";
import { useEffect } from "react";

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
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <I18nProvider>
          <ScrollToTop />
          <SEOHandler />
          <Routes>
            {/* Redirect root to /it */}
            <Route path="/" element={<Navigate to="/it" replace />} />
            
            {/* Italian routes */}
            <Route path="/it" element={<Layout><Home /></Layout>} />
            <Route path="/it/stonecore-10" element={<Layout><StoneCore10 /></Layout>} />
            <Route path="/it/edgeline" element={<Layout><EdgeLine /></Layout>} />
            <Route path="/it/onewall" element={<Layout><OneWall /></Layout>} />
            <Route path="/it/area-tecnica" element={<Layout><AreaTecnica /></Layout>} />
            <Route path="/it/chi-siamo" element={<Layout><ChiSiamo /></Layout>} />
            <Route path="/it/contatti" element={<Layout><Contatti /></Layout>} />
            <Route path="/it/diventa-partner" element={<Layout><DiventaPartner /></Layout>} />
            <Route path="/it/privacy" element={<Layout><Privacy /></Layout>} />
            <Route path="/it/termini" element={<Layout><Termini /></Layout>} />
            <Route path="/it/colore/:colorSlug" element={<Layout><ColorProductPage /></Layout>} />
            
            {/* English routes */}
            <Route path="/en" element={<Layout><Home /></Layout>} />
            <Route path="/en/stonecore-10" element={<Layout><StoneCore10 /></Layout>} />
            <Route path="/en/edgeline" element={<Layout><EdgeLine /></Layout>} />
            <Route path="/en/onewall" element={<Layout><OneWall /></Layout>} />
            <Route path="/en/area-tecnica" element={<Layout><AreaTecnica /></Layout>} />
            <Route path="/en/chi-siamo" element={<Layout><ChiSiamo /></Layout>} />
            <Route path="/en/contatti" element={<Layout><Contatti /></Layout>} />
            <Route path="/en/diventa-partner" element={<Layout><DiventaPartner /></Layout>} />
            <Route path="/en/privacy" element={<Layout><Privacy /></Layout>} />
            <Route path="/en/termini" element={<Layout><Termini /></Layout>} />
            <Route path="/en/colore/:colorSlug" element={<Layout><ColorProductPage /></Layout>} />
            
            {/* German routes */}
            <Route path="/de" element={<Layout><Home /></Layout>} />
            <Route path="/de/stonecore-10" element={<Layout><StoneCore10 /></Layout>} />
            <Route path="/de/edgeline" element={<Layout><EdgeLine /></Layout>} />
            <Route path="/de/onewall" element={<Layout><OneWall /></Layout>} />
            <Route path="/de/area-tecnica" element={<Layout><AreaTecnica /></Layout>} />
            <Route path="/de/chi-siamo" element={<Layout><ChiSiamo /></Layout>} />
            <Route path="/de/contatti" element={<Layout><Contatti /></Layout>} />
            <Route path="/de/diventa-partner" element={<Layout><DiventaPartner /></Layout>} />
            <Route path="/de/privacy" element={<Layout><Privacy /></Layout>} />
            <Route path="/de/termini" element={<Layout><Termini /></Layout>} />
            <Route path="/de/colore/:colorSlug" element={<Layout><ColorProductPage /></Layout>} />
            
            {/* French routes */}
            <Route path="/fr" element={<Layout><Home /></Layout>} />
            <Route path="/fr/stonecore-10" element={<Layout><StoneCore10 /></Layout>} />
            <Route path="/fr/edgeline" element={<Layout><EdgeLine /></Layout>} />
            <Route path="/fr/onewall" element={<Layout><OneWall /></Layout>} />
            <Route path="/fr/area-tecnica" element={<Layout><AreaTecnica /></Layout>} />
            <Route path="/fr/chi-siamo" element={<Layout><ChiSiamo /></Layout>} />
            <Route path="/fr/contatti" element={<Layout><Contatti /></Layout>} />
            <Route path="/fr/diventa-partner" element={<Layout><DiventaPartner /></Layout>} />
            <Route path="/fr/privacy" element={<Layout><Privacy /></Layout>} />
            <Route path="/fr/termini" element={<Layout><Termini /></Layout>} />
            <Route path="/fr/colore/:colorSlug" element={<Layout><ColorProductPage /></Layout>} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </I18nProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
