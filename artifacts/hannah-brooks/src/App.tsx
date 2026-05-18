import React, { useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Members from "@/pages/members";
import Messages from "@/pages/messages";
import Calls from "@/pages/calls";
import Store from "@/pages/store";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/members" component={Members} />
      <Route path="/messages" component={Messages} />
      <Route path="/calls" component={Calls} />
      <Route path="/store" component={Store} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Force dark mode on the document element for the dark luxury theme
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
