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

const GOLD = "#c9a84c";
const GOLD_GRAD = "linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)";

export default function StatCard({ label, value, unit, icon, color = GOLD, trend, trendUp }: StatCardProps) {
  return (
    <div className="glass rounded-2xl p-5 relative overflow-hidden group"
      style={{ border: "1px solid rgba(201,168,76,0.12)" }}>
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: color }} />

      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", color: GOLD }}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-bold mono ${trendUp ? "text-green-400" : "text-red-400"}`}>
            {trendUp ? "↑" : "↓"} {trend}
          </span>
        )}
      </div>

      <div className="flex items-end gap-1">
        <span className="text-3xl font-bold" style={{ color: "#e8dfc8" }}>{value}</span>
        {unit && <span className="text-sm mb-1" style={{ color: GOLD }}>{unit}</span>}
      </div>
      <div className="text-xs mt-1 mono uppercase tracking-widest" style={{ color: "rgba(232,223,200,0.35)" }}>{label}</div>
    </div>
  );
}
