import React, { useState } from "react";
import {
  LayoutDashboard, Users, Brain, Monitor, MessageSquare,
  BarChart3, Settings, Menu, X, Zap, Activity
} from "lucide-react";
import type { Page } from "../App";

const NAV = [
  { id: "dashboard" as Page, label: "Dashboard", icon: <LayoutDashboard size={16} /> },
  { id: "personas" as Page, label: "Personas", icon: <Users size={16} /> },
  { id: "training" as Page, label: "Training", icon: <Brain size={16} /> },
  { id: "live" as Page, label: "Live Preview", icon: <Monitor size={16} />, badge: "LIVE" },
  { id: "chat" as Page, label: "Chat Control", icon: <MessageSquare size={16} /> },
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
      {/* Scan line effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute left-0 right-0 h-[2px] opacity-[0.03]"
          style={{ background: "linear-gradient(90deg,transparent,var(--neon),transparent)", animation: "scan-line 8s linear infinite" }} />
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 opacity-30" style={{ borderColor: "var(--neon)" }} />
        <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 opacity-30" style={{ borderColor: "var(--neon)" }} />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 opacity-30" style={{ borderColor: "var(--neon)" }} />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 opacity-30" style={{ borderColor: "var(--neon)" }} />
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-50 glass border-b flex items-center justify-between px-4 md:px-6 py-3"
        style={{ borderColor: "rgba(0,245,255,0.1)" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 rounded-lg text-white/40 hover:text-white transition-colors">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center relative overflow-hidden"
              style={{ background: "linear-gradient(135deg,rgba(0,245,255,0.2),rgba(191,0,255,0.2))", border: "1px solid rgba(0,245,255,0.3)" }}>
              <Zap size={14} style={{ color: "var(--neon)" }} />
            </div>
            <div>
              <span className="font-bold text-sm text-white tracking-wider">AI PERSONA</span>
              <span className="ml-2 text-[10px] mono" style={{ color: "var(--neon)" }}>STUDIO</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Live status */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg glass"
            style={{ border: "1px solid rgba(0,245,255,0.15)" }}>
            <div className="status-dot" style={{ background: "var(--neon)" }} />
            <span className="text-xs mono" style={{ color: "var(--neon)" }}>SYSTEM ONLINE</span>
          </div>
          {/* System time */}
          <div className="hidden md:block text-xs mono text-white/30">
            {new Date().toLocaleTimeString()}
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: "linear-gradient(135deg,var(--neon),var(--neon2))", color: "#000" }}>
            AP
          </div>
        </div>
      </header>

      <div className="flex relative z-10">
        {/* Sidebar */}
        <aside className={`fixed md:sticky top-[57px] h-[calc(100vh-57px)] w-60 shrink-0 glass border-r flex flex-col z-40 transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
          style={{ borderColor: "rgba(0,245,255,0.08)" }}>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => { onNavigate(n.id); setSidebarOpen(false); }}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group"
                style={page === n.id
                  ? { color: "var(--neon)", background: "rgba(0,245,255,0.08)", border: "1px solid rgba(0,245,255,0.2)", boxShadow: "0 0 12px rgba(0,245,255,0.1)" }
                  : { color: "rgba(255,255,255,0.4)", border: "1px solid transparent" }}>
                <span className="flex items-center gap-2.5">{n.icon}{n.label}</span>
                {n.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded mono animate-pulse"
                    style={{ background: "rgba(255,0,110,0.2)", color: "#ff006e", border: "1px solid rgba(255,0,110,0.3)" }}>
                    {n.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* System status panel */}
          <div className="p-3 border-t" style={{ borderColor: "rgba(0,245,255,0.08)" }}>
            <div className="glass rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40 mono">GPU LOAD</span>
                <span style={{ color: "var(--neon)" }} className="mono font-bold">72%</span>
              </div>
              <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: "72%", background: "linear-gradient(90deg,var(--neon),var(--neon2))" }} />
              </div>
              <div className="flex items-center justify-between text-xs mt-2">
                <span className="text-white/40 mono">LATENCY</span>
                <span className="mono font-bold text-green-400">87ms</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40 mono">PERSONAS</span>
                <span className="mono font-bold text-white/70">3 active</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main */}
        <main className="flex-1 overflow-x-hidden p-4 md:p-6 min-h-[calc(100vh-57px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
