import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { useIsMobile } from "@/hooks/use-mobile";

// Import pages
import Search from "@/pages/search";
import Results from "@/pages/results";
import Auth from "@/pages/auth";
import Setup from "@/pages/setup";
import NotFound from "@/pages/not-found";
import Browser from "@/pages/browser";
import EnhancedBrowser from "@/pages/enhanced-browser";
import Wingman from "@/pages/wingman";

// Import mobile components
import { MobileBrowser } from "@/components/MobileBrowser";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function AppContent() {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<Navigate to="/search" replace />} />
        <Route path="/search" element={<Search />} />
        <Route path="/results" element={<Results />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/browser" element={<Browser />} />
        <Route path="/enhanced-browser" element={<EnhancedBrowser />} />
        <Route path="/wingman" element={<Wingman />} />
        <Route path="/mobile-browser" element={<MobileBrowser />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="sercrow-ui-theme">
        <Router>
          <AppContent />
          <Toaster />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;