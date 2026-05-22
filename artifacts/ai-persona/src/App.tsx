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
import { setAdminKey } from "./lib/api";
import { Globe, AlertCircle, Eye, EyeOff } from "lucide-react";

const GOLD = "#c9a84c";
const GOLD_GRAD = "linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)";

export type Page = "dashboard" | "personas" | "training" | "live" | "chat" | "universal" | "analytics" | "settings" | "social";

export default function App() {
  const [apiUrl, setApiUrl] = useState<string>(() => localStorage.getItem("hb_api_url") || "");
  const [connectInput, setConnectInput] = useState("");
  const [connectError, setConnectError] = useState("");
  const [connectTesting, setConnectTesting] = useState(false);

  const [authed, setAuthed] = useState<boolean>(() => !!localStorage.getItem("persona_admin_key"));
  const [pwInput, setPwInput] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [page, setPage] = useState<Page>("dashboard");

  const handleConnect = async () => {
    const url = connectInput.trim().replace(/\/$/, "");
    if (!url) return;
    setConnectTesting(true);
    setConnectError("");
    try {
      const res = await fetch(`${url}/api/admin/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "__test__" }),
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok || res.status === 401) {
        localStorage.setItem("hb_api_url", url);
        setApiUrl(url);
      } else {
        setConnectError(`Server returned ${res.status}. Check the URL is correct.`);
      }
    } catch {
      setConnectError("Could not reach that URL. Make sure the server is running.");
    }
    setConnectTesting(false);
  };

  const handleLogin = async () => {
    if (!pwInput.trim()) return;
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch(`${apiUrl}/api/admin/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwInput }),
      });
      if (res.ok) {
        setAdminKey(pwInput);
        setAuthed(true);
      } else {
        setLoginError("Wrong password. Try again.");
      }
    } catch {
      setLoginError("Could not connect to the backend.");
    }
    setLoginLoading(false);
  };

  const disconnect = () => {
    localStorage.removeItem("hb_api_url");
    localStorage.removeItem("persona_admin_key");
    setApiUrl("");
    setConnectInput("");
    setConnectError("");
    setAuthed(false);
  };

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

  if (!apiUrl) {
    return (
      <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at top,#1a1000 0%,#060606 70%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 10 }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
              <Globe size={28} color={GOLD} />
            </div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", margin: 0 }}>Connect to Backend</h1>
            <p style={{ color: "rgba(255,255,255,0.3)", marginTop: 8, fontSize: 14 }}>Enter your public API URL to access the AI Persona Studio</p>
          </div>

          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 24, padding: "1.75rem", display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", display: "block", marginBottom: 8 }}>Backend URL</label>
              <input
                type="url"
                placeholder="https://your-app.replit.app"
                value={connectInput}
                onChange={e => { setConnectInput(e.target.value); setConnectError(""); }}
                onKeyDown={e => e.key === "Enter" && handleConnect()}
                style={{ width: "100%", height: 48, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", padding: "0 14px", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 6 }}>Your Replit app URL — no trailing slash needed</p>
            </div>

            {connectError && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "12px 14px", color: "#fca5a5", fontSize: 13 }}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{connectError}</span>
              </div>
            )}

            <button
              onClick={handleConnect}
              disabled={connectTesting || !connectInput.trim()}
              style={{ height: 48, borderRadius: 12, background: GOLD_GRAD, color: "#0d0b07", fontWeight: 800, fontSize: 14, letterSpacing: "0.05em", border: "none", cursor: connectTesting || !connectInput.trim() ? "not-allowed" : "pointer", opacity: connectTesting || !connectInput.trim() ? 0.5 : 1 }}>
              {connectTesting ? "Testing connection…" : "Connect & Continue →"}
            </button>
          </div>

          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.12)", fontSize: 11, marginTop: "2rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            AI PERSONA STUDIO · PRIVATE ACCESS
          </p>
        </div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at top,#1a1000 0%,#060606 70%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ width: "100%", maxWidth: 360, position: "relative", zIndex: 10 }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div style={{ width: 72, height: 72, borderRadius: 16, background: GOLD_GRAD, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem", boxShadow: "0 8px 32px rgba(201,168,76,0.4)", fontWeight: 900, fontSize: 22, color: "#0d0b07" }}>
              AP
            </div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", margin: 0 }}>AI Persona Studio</h1>
            <p style={{ color: "rgba(255,255,255,0.25)", marginTop: 8, fontSize: 13, letterSpacing: "0.15em", textTransform: "uppercase" }}>Hannah Brooks · Private</p>
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80" }} />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "monospace", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{apiUrl}</span>
              <button onClick={disconnect} style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}>Change</button>
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 24, padding: "1.75rem", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                placeholder="Enter admin password"
                value={pwInput}
                onChange={e => { setPwInput(e.target.value); setLoginError(""); }}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                style={{ width: "100%", height: 48, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", padding: "0 44px 0 14px", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
              <button onClick={() => setShowPw(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex" }}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {loginError && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "10px 14px", color: "#fca5a5", fontSize: 13 }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                <span>{loginError}</span>
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loginLoading || !pwInput.trim()}
              style={{ height: 48, borderRadius: 12, background: GOLD_GRAD, color: "#0d0b07", fontWeight: 800, fontSize: 14, letterSpacing: "0.05em", border: "none", cursor: loginLoading || !pwInput.trim() ? "not-allowed" : "pointer", opacity: loginLoading || !pwInput.trim() ? 0.5 : 1 }}>
              {loginLoading ? "Signing in…" : "Sign In to Studio"}
            </button>
          </div>

          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.12)", fontSize: 11, marginTop: "2rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            PROTECTED · NOT FOR PUBLIC ACCESS
          </p>
        </div>
      </div>
    );
  }

  return (
    <Layout page={page} onNavigate={setPage} onDisconnect={disconnect} apiUrl={apiUrl}>
      {renderPage()}
    </Layout>
  );
}
