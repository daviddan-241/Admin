import React, { useEffect, useState } from "react";
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
import Feed from "@/pages/feed";
import Admin from "@/pages/admin";
import Profile from "@/pages/profile";
import Studio from "@/pages/studio";
import Payment from "@/pages/payment";

const queryClient = new QueryClient();

export type Theme = "dark" | "light";

export const ThemeContext = React.createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({ theme: "dark", toggleTheme: () => {} });

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/members" component={Members} />
      <Route path="/messages" component={Messages} />
      <Route path="/calls" component={Calls} />
      <Route path="/store" component={Store} />
      <Route path="/feed" component={Feed} />
      <Route path="/profile" component={Profile} />
      <Route path="/studio" component={Studio} />
      <Route path="/admin" component={Admin} />
      <Route path="/payment" component={Payment} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("sr_theme");
    return (saved === "light" || saved === "dark") ? saved : "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
    localStorage.setItem("sr_theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeContext.Provider>
  );
}

export default App;
