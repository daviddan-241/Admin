import React from "react";
import { Brain, Monitor, MessageSquare, Users, Zap, Activity, Shield, Clock } from "lucide-react";
import StatCard from "../components/StatCard";
import GlassCard from "../components/GlassCard";
import type { Page } from "../App";

const RECENT_ACTIVITY = [
  { time: "2m ago", text: "Persona 'Hannah AI' replied to 3 messages autonomously", color: "var(--gold)" },
  { time: "15m ago", text: "Voice conversion latency: 84ms average over last 100 frames", color: "#00ff88" },
  { time: "1h ago", text: "Face model retrained with 2 new reference frames", color: "var(--gold2)" },
  { time: "2h ago", text: "Auto-reply mode: 12 messages sent, 0 flagged", color: "#ffaa00" },
  { time: "3h ago", text: "OBS virtual camera connected — streaming active", color: "var(--gold)" },
];

const SYSTEM_METRICS = [
  { label: "GPU VRAM", value: 72, color: "var(--gold)", max: 100 },
  { label: "CPU Load", value: 34, color: "#00ff88", max: 100 },
  { label: "Memory", value: 58, color: "var(--gold2)", max: 100 },
  { label: "Uptime", value: 99.8, color: "#ffaa00", max: 100 },
];

export default function Dashboard({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">System Overview</h1>
          <p className="text-white/40 text-sm mt-1">AI Digital Persona Platform · Production</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-xl" style={{ border: "1px solid rgba(0,255,136,0.2)" }}>
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs mono text-green-400 font-bold">ALL SYSTEMS OPERATIONAL</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Personas" value={3} icon={<Users size={16} />} color="var(--gold)" trend="1 this week" trendUp />
        <StatCard label="Avg Latency" value={87} unit="ms" icon={<Zap size={16} />} color="#00ff88" trend="12ms" trendUp={false} />
        <StatCard label="Auto-replies Today" value={142} icon={<MessageSquare size={16} />} color="var(--gold2)" trend="38%" trendUp />
        <StatCard label="Sessions Live" value={1} icon={<Monitor size={16} />} color="#e05050" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold mono uppercase tracking-widest" style={{ color: "rgba(232,223,200,0.35)" }}>Quick Actions</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { page: "live" as Page, icon: <Monitor size={20} />, title: "Live Preview", desc: "Start face & voice transformation", color: "#e05050", badge: "WEBCAM" },
              { page: "training" as Page, icon: <Brain size={20} />, title: "Train Persona", desc: "Upload video & audio samples", color: "var(--gold2)", badge: null },
              { page: "chat" as Page, icon: <MessageSquare size={20} />, title: "Chat Control", desc: "Manage auto-reply engine", color: "var(--gold)", badge: "142 queued" },
              { page: "personas" as Page, icon: <Users size={20} />, title: "Persona Manager", desc: "Create & switch personas", color: "#00ff88", badge: null },
            ].map((a) => (
              <GlassCard key={a.page} onClick={() => onNavigate(a.page)} className="p-5"
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

          {/* Recent activity */}
          <h2 className="text-sm font-bold mono uppercase tracking-widest pt-2" style={{ color: "rgba(232,223,200,0.35)" }}>Recent Activity</h2>
          <GlassCard className="overflow-hidden">
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              {RECENT_ACTIVITY.map((a, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                  <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: a.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/70 leading-snug">{a.text}</p>
                  </div>
                  <span className="text-xs mono text-white/25 shrink-0">{a.time}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* System health */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold mono uppercase tracking-widest" style={{ color: "rgba(232,223,200,0.35)" }}>System Health</h2>
          <GlassCard className="p-5 space-y-5">
            {SYSTEM_METRICS.map((m) => (
              <div key={m.label}>
                <div className="flex items-center justify-between text-xs mono mb-2">
                  <span className="text-white/40">{m.label}</span>
                  <span style={{ color: m.color }} className="font-bold">{m.value}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${m.value}%`, background: `linear-gradient(90deg,${m.color}80,${m.color})` }} />
                </div>
              </div>
            ))}
            <div className="pt-3 border-t space-y-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {[
                { label: "Face Model", status: "Ready", color: "#00ff88" },
                { label: "Voice Engine", status: "Active", color: "var(--gold)" },
                { label: "LLM (GPT-4o)", status: "Connected", color: "var(--gold)" },
                { label: "OBS Camera", status: "Running", color: "#00ff88" },
                { label: "Auto-Reply", status: "Autonomous", color: "var(--gold2)" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between text-xs">
                  <span className="text-white/40 mono">{s.label}</span>
                  <span className="font-semibold mono" style={{ color: s.color }}>● {s.status}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Security */}
          <GlassCard className="p-5" style={{ border: "1px solid rgba(0,255,136,0.15)" } as React.CSSProperties}>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={16} className="text-green-400" />
              <span className="text-sm font-semibold text-white">Consent & Security</span>
            </div>
            <div className="space-y-1.5 text-xs text-white/40">
              {["Consent verified ✓", "Media encrypted ✓", "Audit log active ✓", "Abuse filter: ON ✓"].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-green-400" />
                  {t}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
