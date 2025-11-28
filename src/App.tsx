import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import StoneCore10 from "./pages/StoneCore10";
import EdgeLine from "./pages/EdgeLine";
import OneWall from "./pages/OneWall";
import AreaTecnica from "./pages/AreaTecnica";
import ChiSiamo from "./pages/ChiSiamo";
import Contatti from "./pages/Contatti";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/stonecore-10" element={<Layout><StoneCore10 /></Layout>} />
          <Route path="/edgeline" element={<Layout><EdgeLine /></Layout>} />
          <Route path="/onewall" element={<Layout><OneWall /></Layout>} />
          <Route path="/area-tecnica" element={<Layout><AreaTecnica /></Layout>} />
          <Route path="/chi-siamo" element={<Layout><ChiSiamo /></Layout>} />
          <Route path="/contatti" element={<Layout><Contatti /></Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
