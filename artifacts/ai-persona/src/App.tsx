import React, { useState } from "react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import PersonaManager from "./pages/PersonaManager";
import Training from "./pages/Training";
import LivePreview from "./pages/LivePreview";
import ChatControl from "./pages/ChatControl";
import Analytics from "./pages/Analytics";
import SettingsPage from "./pages/SettingsPage";
import UniversalChanger from "./pages/UniversalChanger";
import SocialFeed from "./pages/SocialFeed";

export type Page = "dashboard" | "personas" | "training" | "live" | "chat" | "universal" | "analytics" | "settings" | "social";

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard onNavigate={setPage} />;
      case "personas": return <PersonaManager />;
      case "training": return <Training />;
      case "live": return <LivePreview />;
      case "chat": return <ChatControl />;
      case "universal": return <UniversalChanger />;
      case "analytics": return <Analytics />;
      case "settings": return <SettingsPage />;
      case "social": return <SocialFeed />;
      default: return <Dashboard onNavigate={setPage} />;
    }
  };

  return (
    <Layout page={page} onNavigate={setPage}>
      {renderPage()}
    </Layout>
  );
}
