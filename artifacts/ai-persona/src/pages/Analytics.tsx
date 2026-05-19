import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import StatCard from "../components/StatCard";
import GlassCard from "../components/GlassCard";
import { MessageSquare, DollarSign, Phone, Gift, RefreshCw } from "lucide-react";
import { api, type Stats } from "../lib/api";

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 border" style={{ borderColor: "rgba(201,168,76,0.2)" }}>
      <p className="text-xs text-white/50 mono mb-2">{label}</p>
      {payload.map((p) => (
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
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.stats().then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const barData = stats
    ? [
        { name: "Messages", value: stats.totalMessages, fill: "rgba(201,168,76,0.8)" },
        { name: "Calls", value: stats.totalCalls, fill: "rgba(0,255,136,0.8)" },
        { name: "Requests", value: stats.totalRequests, fill: "rgba(240,208,128,0.8)" },
        { name: "Tips", value: stats.totalTips, fill: "rgba(255,170,0,0.8)" },
      ]
    : [];

  const revBreakdown = stats
    ? [
        { name: "Msgs", value: parseFloat((stats.totalMessages * 4.5).toFixed(2)) },
        { name: "Calls", value: parseFloat((stats.totalCalls * 54).toFixed(2)) },
        { name: "Reqs", value: parseFloat((stats.totalRequests * 49.99).toFixed(2)) },
        { name: "Tips", value: parseFloat((stats.totalTips * 12).toFixed(2)) },
      ]
    : [];

  const fmtMoney = (n: number) => `$${n.toFixed(2)}`;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-white/40 text-sm mt-1">Live platform performance — real data from the Hannah Brooks platform</p>
        </div>
        <button onClick={() => { setLoading(true); api.stats().then(setStats).catch(() => {}).finally(() => setLoading(false)); }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass text-xs font-semibold"
          style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(232,223,200,0.5)" }}>
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Fan Messages" value={loading ? "…" : String(stats?.totalMessages ?? 0)} icon={<MessageSquare size={16} />} color="var(--gold)" trend="platform total" trendUp />
        <StatCard label="Calls Booked" value={loading ? "…" : String(stats?.totalCalls ?? 0)} icon={<Phone size={16} />} color="#00ff88" trend="all time" trendUp />
        <StatCard label="Content Requests" value={loading ? "…" : String(stats?.totalRequests ?? 0)} icon={<Gift size={16} />} color="var(--gold2)" trend="custom content" trendUp />
        <StatCard label="Total Revenue" value={loading ? "…" : fmtMoney(stats?.totalRevenue ?? 0)} icon={<DollarSign size={16} />} color="#ffaa00" trend="all sources" trendUp />
      </div>

      {stats ? (
        <div className="grid lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h2 className="font-bold text-white mb-1">Activity by Type</h2>
            <p className="text-xs text-white/30 mb-5">All-time counts per category</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: "rgba(232,223,200,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(232,223,200,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}
                  fill="rgba(201,168,76,0.8)"
                  label={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="font-bold text-white mb-1">Revenue by Source</h2>
            <p className="text-xs text-white/30 mb-5">Estimated earnings breakdown</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revBreakdown}>
                <defs>
                  <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(201,168,76,0.3)" />
                    <stop offset="100%" stopColor="rgba(201,168,76,0)" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: "rgba(232,223,200,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(232,223,200,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" name="Revenue ($)" stroke="rgba(201,168,76,0.8)" fill="url(#gRev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>
      ) : (
        <GlassCard className="p-10 text-center">
          <div className="text-white/30">{loading ? "Loading real data…" : "No data available yet."}</div>
        </GlassCard>
      )}

      {stats && (
        <GlassCard className="p-6">
          <h2 className="font-bold text-white mb-5">Platform Summary</h2>
          <div className="space-y-4">
            {[
              { name: "Fan Messages", value: stats.totalMessages, max: Math.max(stats.totalMessages, stats.totalCalls, stats.totalRequests, stats.totalTips, 1), color: "var(--gold)" },
              { name: "Calls Booked", value: stats.totalCalls, max: Math.max(stats.totalMessages, stats.totalCalls, stats.totalRequests, stats.totalTips, 1), color: "#00ff88" },
              { name: "Content Requests", value: stats.totalRequests, max: Math.max(stats.totalMessages, stats.totalCalls, stats.totalRequests, stats.totalTips, 1), color: "var(--gold2)" },
              { name: "Tips Received", value: stats.totalTips, max: Math.max(stats.totalMessages, stats.totalCalls, stats.totalRequests, stats.totalTips, 1), color: "#ffaa00" },
            ].map((p) => (
              <div key={p.name} className="flex items-center gap-4">
                <div className="w-36 text-sm text-white/70 shrink-0">{p.name}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/30 mono">{p.value} total</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${Math.max((p.value / p.max) * 100, p.value > 0 ? 3 : 0)}%`, background: `linear-gradient(90deg,${p.color}80,${p.color})` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
