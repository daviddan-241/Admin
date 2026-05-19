import React, { useState } from "react";

const GOLD = "#c9a84c";
const GOLD_GRAD = "linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)";

function getAppUrls() {
  const h = window.location.hostname;
  const isReplit = h.includes(".replit.dev");
  if (isReplit) {
    const base = h.replace(/^\d+-/, "");
    return {
      fan: `https://${base}`,
      admin: `https://${base}/admin`,
      persona: `https://8082-${base}`,
    };
  }
  return {
    fan: "http://localhost:5000",
    admin: "http://localhost:5000/admin",
    persona: "http://localhost:8082",
  };
}

const APPS = [
  {
    key: "fan",
    label: "Fan Platform",
    sub: "Public site · Port 5000",
    icon: "HB",
    color: GOLD,
  },
  {
    key: "admin",
    label: "Creator Admin",
    sub: "Private portal · /admin",
    icon: "⚡",
    color: "#a78bfa",
  },
  {
    key: "persona",
    label: "AI Persona Studio",
    sub: "Avatar control · Port 8082",
    icon: "AP",
    color: "#00ff88",
  },
] as const;

export default function AppSwitcher() {
  const [open, setOpen] = useState(false);
  const urls = getAppUrls();

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-2">
      {open && (
        <div
          className="rounded-2xl p-2 shadow-2xl w-60 space-y-1"
          style={{
            background: "rgba(10,8,4,0.97)",
            border: `1px solid rgba(201,168,76,0.25)`,
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="px-3 py-2 text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgba(201,168,76,0.4)" }}>
            Switch App
          </div>
          {APPS.map((app) => {
            const url = urls[app.key];
            const isCurrent =
              app.key === "fan"
                ? !window.location.pathname.startsWith("/admin")
                : app.key === "admin"
                ? window.location.pathname.startsWith("/admin")
                : false;
            return (
              <a
                key={app.key}
                href={url}
                target={app.key === "persona" ? "_blank" : "_self"}
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-white/5"
                style={{
                  border: isCurrent ? `1px solid ${app.color}40` : "1px solid transparent",
                  background: isCurrent ? `${app.color}08` : "transparent",
                  textDecoration: "none",
                }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0"
                  style={{ background: `${app.color}18`, border: `1px solid ${app.color}30`, color: app.color }}
                >
                  {app.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{app.label}</div>
                  <div className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.3)" }}>{app.sub}</div>
                </div>
                {isCurrent && (
                  <div className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${app.color}20`, color: app.color }}>
                    HERE
                  </div>
                )}
              </a>
            );
          })}
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xs text-black shadow-2xl transition-all hover:scale-105 active:scale-95"
        style={{
          background: open ? "rgba(30,25,10,0.98)" : GOLD_GRAD,
          border: `1px solid rgba(201,168,76,0.4)`,
          boxShadow: open ? "0 4px 24px rgba(201,168,76,0.2)" : "0 4px 24px rgba(201,168,76,0.35)",
          color: open ? GOLD : "#000",
        }}
        title="Switch App"
      >
        {open ? "✕" : "⊞"}
      </button>
    </div>
  );
}
