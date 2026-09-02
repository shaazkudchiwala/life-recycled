import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SessionProvider } from "@/contexts/SessionContext";
import { ScrollToTop } from "@/components/ScrollToTop";

// Pages
import PledgePage from "./pages/PledgePage";
import UnderstandPage from "./pages/UnderstandPage";
import CommitPage from "./pages/CommitPage";
import VerifyPage from "./pages/VerifyPage";
import MethodologyPage from "./pages/MethodologyPage";
import MetricsPage from "./pages/MetricsPage";
import FormGuidancePage from "./pages/FormGuidancePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SessionProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Default redirect to life-recycled campaign */}
            <Route path="/" element={<Navigate to="/pledge/life-recycled" replace />} />
            
            {/* Main flow pages */}
            <Route path="/pledge/:sourceId" element={<PledgePage />} />
            <Route path="/understand" element={<UnderstandPage />} />
            <Route path="/commit" element={<CommitPage />} />
            <Route path="/verify" element={<VerifyPage />} />
            
            {/* Information pages */}
            <Route path="/metrics" element={<MetricsPage />} />
            <Route path="/form-guidance" element={<FormGuidancePage />} />
            <Route path="/methodology" element={<MethodologyPage />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SessionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
