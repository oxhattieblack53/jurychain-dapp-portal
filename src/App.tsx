/**
 * JuryChain Application Router
 *
 * Routes:
 * - / (Index): Landing page with application overview
 * - /dapp: All cases list view
 * - /my-votes: User's voting history
 * - /create: Create new case form
 * - /case/:caseId: Individual case detail page
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DApp from "./pages/DApp";
import MyVotes from "./pages/MyVotes";
import CreateCase from "./pages/CreateCase";
import CaseDetail from "./pages/CaseDetail";
import NotFound from "./pages/NotFound";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<Index />} />

        {/* Main application routes */}
        <Route path="/dapp" element={<DApp />} />
        <Route path="/my-votes" element={<MyVotes />} />
        <Route path="/create" element={<CreateCase />} />
        <Route path="/case/:caseId" element={<CaseDetail />} />

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
