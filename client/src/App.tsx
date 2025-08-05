// App.tsx
import { Switch, Route } from "wouter";
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Search} />
      <Route path="/search" component={Search} />
      <Route path="/sq/:searchId" component={Results} />
      <Route path="/wingman" component={WingManPage} /> {/* 👈 Add route */}
      <Route path="/browser" component={Browser} />
      <Route component={NotFound} />
    </Switch>
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
            <Router />
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </Auth0Provider>
  );
}

export default App;

