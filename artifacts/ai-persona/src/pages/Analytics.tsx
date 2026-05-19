import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";
import StatCard from "../components/StatCard";
import GlassCard from "../components/GlassCard";
import { MessageSquare, Zap, Brain, Clock } from "lucide-react";

const DAILY = Array.from({ length: 14 }, (_, i) => ({
  day: `${i + 6}/5`,
  messages: Math.floor(80 + Math.random() * 120),
  auto: Math.floor(60 + Math.random() * 100),
  latency: Math.floor(75 + Math.random() * 40),
}));

const PERSONA_STATS = [
  { name: "Hannah (Main)", messages: 847, accuracy: 96, platform: "var(--gold)" },
  { name: "Hannah (Business)", messages: 89, accuracy: 94, platform: "#00ff88" },
  { name: "Aria (Alt)", messages: 234, accuracy: 91, platform: "var(--gold2)" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 border" style={{ borderColor: "rgba(201,168,76,0.2)" }}>
      <p className="text-xs text-white/50 mono mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-white/60">{p.name}:</span>
          <span className="font-bold text-white">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-white/40 text-sm mt-1">Performance insights across all personas and platforms</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Messages" value="1,170" icon={<MessageSquare size={16} />} color="var(--gold)" trend="23%" trendUp />
        <StatCard label="Avg Latency" value={87} unit="ms" icon={<Zap size={16} />} color="#00ff88" trend="12ms" trendUp={false} />
        <StatCard label="AI Accuracy" value="95.3" unit="%" icon={<Brain size={16} />} color="var(--gold2)" trend="1.2%" trendUp />
        <StatCard label="Auto-reply Rate" value="84" unit="%" icon={<Clock size={16} />} color="#ffaa00" trend="8%" trendUp />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h2 className="font-bold text-white mb-1">Messages Over Time</h2>
          <p className="text-xs text-white/30 mb-5">Total vs auto-handled</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={DAILY}>
              <defs>
                <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(201,168,76,0.3)" />
                  <stop offset="100%" stopColor="rgba(201,168,76,0)" />
                </linearGradient>
                <linearGradient id="gAuto" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(240,208,128,0.3)" />
                  <stop offset="100%" stopColor="rgba(240,208,128,0)" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: "rgba(232,223,200,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(232,223,200,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="messages" name="Total" stroke="rgba(201,168,76,0.8)" fill="url(#gTotal)" strokeWidth={2} />
              <Area type="monotone" dataKey="auto" name="Auto-handled" stroke="rgba(240,208,128,0.8)" fill="url(#gAuto)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="font-bold text-white mb-1">Latency Trend</h2>
          <p className="text-xs text-white/30 mb-5">Real-time transformation latency (ms)</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={DAILY}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: "rgba(232,223,200,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(232,223,200,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="latency" name="Latency (ms)" stroke="#00ff88" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Persona comparison */}
      <GlassCard className="p-6">
        <h2 className="font-bold text-white mb-5">Persona Performance</h2>
        <div className="space-y-4">
          {PERSONA_STATS.map((p) => (
            <div key={p.name} className="flex items-center gap-4">
              <div className="w-32 text-sm text-white/70 shrink-0">{p.name}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white/30 mono">{p.messages} msgs</span>
                  <span className="text-xs mono font-bold" style={{ color: "#00ff88" }}>{p.accuracy}% acc</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${(p.messages / 850) * 100}%`, background: `linear-gradient(90deg,${p.platform}80,${p.platform})` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
