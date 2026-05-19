import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  color?: string;
  trend?: string;
  trendUp?: boolean;
}

export default function StatCard({ label, value, unit, icon, color = "var(--neon)", trend, trendUp }: StatCardProps) {
  return (
    <div className="glass rounded-2xl p-5 relative overflow-hidden group"
      style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: color }} />

      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-bold mono ${trendUp ? "text-green-400" : "text-red-400"}`}>
            {trendUp ? "↑" : "↓"} {trend}
          </span>
        )}
      </div>

      <div className="flex items-end gap-1">
        <span className="text-3xl font-bold text-white">{value}</span>
        {unit && <span className="text-sm mb-1" style={{ color }}>{unit}</span>}
      </div>
      <div className="text-xs text-white/35 mt-1 mono uppercase tracking-widest">{label}</div>
    </div>
  );
}
