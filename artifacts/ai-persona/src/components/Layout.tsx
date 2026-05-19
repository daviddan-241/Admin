import React, { useState } from "react";
import {
  LayoutDashboard, Users, Brain, Monitor, MessageSquare,
  BarChart3, Settings, Menu, X, Link2
} from "lucide-react";
import type { Page } from "../App";

const GOLD = "#c9a84c";
const GOLD_GRAD = "linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)";

const NAV = [
  { id: "dashboard" as Page, label: "Dashboard", icon: <LayoutDashboard size={16} /> },
  { id: "personas" as Page, label: "Personas", icon: <Users size={16} /> },
  { id: "training" as Page, label: "Training", icon: <Brain size={16} /> },
  { id: "live" as Page, label: "Live Preview", icon: <Monitor size={16} />, badge: "LIVE" },
  { id: "chat" as Page, label: "Chat Control", icon: <MessageSquare size={16} /> },
  { id: "universal" as Page, label: "Universal Changer", icon: <Link2 size={16} />, badge: "NEW" },
  { id: "analytics" as Page, label: "Analytics", icon: <BarChart3 size={16} /> },
  { id: "settings" as Page, label: "Settings", icon: <Settings size={16} /> },
];

export default function Layout({ children, page, onNavigate }: {
  children: React.ReactNode;
  page: Page;
  onNavigate: (p: Page) => void;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen grid-bg" style={{ background: "var(--bg)" }}>
      {/* Subtle gold corner accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-32 h-32 opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle at top left, rgba(201,168,76,0.2), transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-32 h-32 opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle at bottom right, rgba(201,168,76,0.2), transparent 70%)" }} />
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-50 glass border-b flex items-center justify-between px-4 md:px-6 py-3"
        style={{ borderColor: "rgba(201,168,76,0.15)" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: "rgba(232,223,200,0.5)" }}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-black"
              style={{ background: GOLD_GRAD, boxShadow: "0 2px 12px rgba(201,168,76,0.4)" }}>
              AP
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide" style={{ color: "#e8dfc8" }}>AI PERSONA</div>
              <div className="text-[10px] mono" style={{ color: GOLD }}>STUDIO · v3.0</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl glass"
            style={{ border: "1px solid rgba(201,168,76,0.2)" }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: GOLD }} />
            <span className="text-xs mono font-semibold" style={{ color: GOLD }}>SYSTEM ONLINE</span>
          </div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-black"
            style={{ background: GOLD_GRAD }}>
            HB
          </div>
        </div>
      </header>

      <div className="flex relative z-10">
        {/* Sidebar */}
        <aside className={`fixed md:sticky top-[57px] h-[calc(100vh-57px)] w-60 shrink-0 glass border-r flex flex-col z-40 transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
          style={{ borderColor: "rgba(201,168,76,0.1)" }}>

          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => { onNavigate(n.id); setSidebarOpen(false); }}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={page === n.id
                  ? { color: "#0d0b07", background: GOLD_GRAD, boxShadow: "0 2px 12px rgba(201,168,76,0.3)" }
                  : { color: "rgba(232,223,200,0.45)", border: "1px solid transparent" }}>
                <span className="flex items-center gap-2.5">{n.icon}{n.label}</span>
                {n.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded mono"
                    style={n.badge === "LIVE"
                      ? { background: "rgba(239,68,68,0.2)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }
                      : { background: "rgba(201,168,76,0.15)", color: GOLD, border: `1px solid rgba(201,168,76,0.3)` }}>
                    {n.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* System status */}
          <div className="p-3 border-t" style={{ borderColor: "rgba(201,168,76,0.1)" }}>
            <div className="rounded-xl p-3 space-y-2.5" style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.1)" }}>
              {[
                { label: "GPU LOAD", value: "72%", color: GOLD },
                { label: "LATENCY", value: "87ms", color: "#4ade80" },
                { label: "PERSONAS", value: "3 active", color: "rgba(232,223,200,0.6)" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between text-xs">
                  <span className="mono" style={{ color: "rgba(232,223,200,0.35)" }}>{s.label}</span>
                  <span className="mono font-bold" style={{ color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <main className="flex-1 overflow-x-hidden p-4 md:p-6 min-h-[calc(100vh-57px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
