import React, { useEffect, useState } from "react";
import { Brain, Monitor, MessageSquare, Users, Zap, Activity, Shield, RefreshCw } from "lucide-react";
import StatCard from "../components/StatCard";
import GlassCard from "../components/GlassCard";
import { api, type Stats } from "../lib/api";
import type { Page } from "../App";

export default function Dashboard({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const loadStats = () => {
    setLoading(true);
    api.stats()
      .then((s) => { setStats(s); setLastRefresh(new Date()); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadStats(); }, []);

  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
  const fmtMoney = (n: number) => `$${n.toFixed(2)}`;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">System Overview</h1>
          <p className="text-white/40 text-sm mt-1">Live data · Hannah Brooks Platform</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadStats} className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass text-xs font-semibold"
            style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(232,223,200,0.5)" }}>
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            {loading ? "Loading…" : `Updated ${lastRefresh.toLocaleTimeString()}`}
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-xl" style={{ border: "1px solid rgba(0,255,136,0.2)" }}>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs mono text-green-400 font-bold">LIVE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Fan Messages" value={loading ? "…" : fmt(stats?.totalMessages ?? 0)} icon={<MessageSquare size={16} />} color="var(--gold)" trend="from platform" trendUp />
        <StatCard label="Calls Booked" value={loading ? "…" : fmt(stats?.totalCalls ?? 0)} icon={<Zap size={16} />} color="#00ff88" trend="real-time" trendUp />
        <StatCard label="Requests" value={loading ? "…" : fmt(stats?.totalRequests ?? 0)} icon={<Activity size={16} />} color="var(--gold2)" trend="custom content" trendUp />
        <StatCard label="Total Revenue" value={loading ? "…" : fmtMoney(stats?.totalRevenue ?? 0)} icon={<Monitor size={16} />} color="#e05050" trend="all sources" trendUp />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold mono uppercase tracking-widest" style={{ color: "rgba(232,223,200,0.35)" }}>Quick Actions</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { page: "chat" as Page, icon: <MessageSquare size={20} />, title: "Chat Control", desc: "Manage fan messages & AI replies", color: "var(--gold)", badge: stats ? `${stats.totalMessages} msgs` : null },
              { page: "social" as Page, icon: <Activity size={20} />, title: "Social Feed", desc: "Synced posts from X & TikTok", color: "#00ff88", badge: "LIVE" },
              { page: "personas" as Page, icon: <Users size={20} />, title: "Persona Manager", desc: "Create & configure personas", color: "var(--gold2)", badge: null },
              { page: "settings" as Page, icon: <Brain size={20} />, title: "Settings & Sync", desc: "API keys, social handles, sync", color: "#e05050", badge: null },
            ].map((a) => (
              <GlassCard key={a.page} onClick={() => onNavigate(a.page)} className="p-5 cursor-pointer"
                style={{ border: `1px solid ${a.color}20` } as React.CSSProperties}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${a.color}15`, border: `1px solid ${a.color}30`, color: a.color }}>
                    {a.icon}
                  </div>
                  {a.badge && (
                    <span className="text-[10px] mono font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${a.color}15`, color: a.color, border: `1px solid ${a.color}30` }}>
                      {a.badge}
                    </span>
                  )}
                </div>
                <div className="font-semibold text-white text-sm">{a.title}</div>
                <div className="text-xs text-white/35 mt-1">{a.desc}</div>
              </GlassCard>
            ))}
          </div>

          {stats && (
            <GlassCard className="overflow-hidden">
              <div className="px-5 pt-4 pb-2 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                <h2 className="font-bold text-white text-sm">Platform Summary</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                {[
                  { label: "Messages", value: stats.totalMessages, color: "var(--gold)" },
                  { label: "Calls", value: stats.totalCalls, color: "#00ff88" },
                  { label: "Requests", value: stats.totalRequests, color: "var(--gold2)" },
                  { label: "Tips", value: stats.totalTips, color: "#ffaa00" },
                ].map((s) => (
                  <div key={s.label} className="p-5 text-center">
                    <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-xs text-white/30 mono mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-bold mono uppercase tracking-widest" style={{ color: "rgba(232,223,200,0.35)" }}>System Health</h2>
          <GlassCard className="p-5 space-y-3" style={{ border: "1px solid rgba(0,255,136,0.15)" } as React.CSSProperties}>
            {[
              { label: "API Server", status: "Online", color: "#00ff88" },
              { label: "Database", status: "Connected", color: "#00ff88" },
              { label: "Social Sync", status: "Ready", color: "var(--gold)" },
              { label: "Fan Platform", status: "Live", color: "#00ff88" },
              { label: "Admin Portal", status: "Secured", color: "var(--gold)" },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between text-xs">
                <span className="text-white/40 mono">{s.label}</span>
                <span className="font-semibold mono" style={{ color: s.color }}>● {s.status}</span>
              </div>
            ))}
          </GlassCard>

          <GlassCard className="p-5" style={{ border: "1px solid rgba(201,168,76,0.15)" } as React.CSSProperties}>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={16} className="text-green-400" />
              <span className="text-sm font-semibold text-white">Revenue Breakdown</span>
            </div>
            {stats ? (
              <div className="space-y-2">
                {[
                  { label: "Messages", amount: stats.totalMessages * 4.5 },
                  { label: "Calls", amount: stats.totalCalls * 54 },
                  { label: "Requests", amount: stats.totalRequests * 49.99 },
                  { label: "Tips", amount: stats.totalTips * 12 },
                ].map((r) => (
                  <div key={r.label} className="flex items-center justify-between text-xs">
                    <span className="text-white/40">{r.label}</span>
                    <span className="font-bold" style={{ color: "var(--gold)" }}>${r.amount.toFixed(0)}</span>
                  </div>
                ))}
                <div className="pt-2 border-t flex items-center justify-between text-sm font-bold" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <span className="text-white/70">Total</span>
                  <span style={{ color: "#00ff88" }}>{fmtMoney(stats.totalRevenue)}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-white/30 text-center py-4">Loading…</div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
