// App.tsx
import { HashRouter, Routes, Route } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Auth0Provider } from '@auth0/auth0-react';
import { ThemeProvider } from "@/components/theme-provider";

import Search from "@/pages/search";
import Results from "@/pages/results";
import NotFound from "@/pages/not-found";
import WingManPage from "@/pages/wingman"; // 👈 Add this
import Browser from "@/pages/browser";
import AuthPage from "@/pages/auth";
import SetupPage from "@/pages/setup";

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Search />} />
      <Route path="/search" element={<Search />} />
      <Route path="/sq/:searchId" element={<Results />} />
      <Route path="/wingman" element={<WingManPage />} />
      <Route path="/browser" element={<Browser />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/setup" element={<SetupPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
    >
      <ThemeProvider defaultTheme="system" storageKey="serqo-ui-theme">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <HashRouter>
              <Router />
            </HashRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </Auth0Provider>
  );
}

export default App;

