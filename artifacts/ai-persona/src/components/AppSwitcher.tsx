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
    <div style={{ position: "relative" }}>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: "240px",
            background: "rgba(10,8,4,0.98)",
            border: "1px solid rgba(201,168,76,0.25)",
            borderRadius: "16px",
            padding: "8px",
            zIndex: 9999,
            backdropFilter: "blur(20px)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          }}
        >
          <div style={{ padding: "6px 12px 8px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(201,168,76,0.4)" }}>
            Switch App
          </div>
          {APPS.map((app) => {
            const url = urls[app.key];
            const isCurrent = app.key === "persona";
            return (
              <a
                key={app.key}
                href={url}
                target={app.key !== "persona" ? "_blank" : "_self"}
                rel="noreferrer"
                onClick={() => setOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "12px",
                  border: isCurrent ? `1px solid ${app.color}40` : "1px solid transparent",
                  background: isCurrent ? `${app.color}08` : "transparent",
                  textDecoration: "none",
                  transition: "background 0.15s",
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center",
                  justifyContent: "center", fontWeight: 700, fontSize: 11, flexShrink: 0,
                  background: `${app.color}18`, border: `1px solid ${app.color}30`, color: app.color,
                }}>
                  {app.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{app.label}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{app.sub}</div>
                </div>
                {isCurrent && (
                  <div style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 999, background: `${app.color}20`, color: app.color }}>
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
        style={{
          width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: 12, cursor: "pointer",
          background: open ? "rgba(201,168,76,0.1)" : GOLD_GRAD,
          border: "1px solid rgba(201,168,76,0.4)",
          color: open ? GOLD : "#000",
          transition: "all 0.15s",
        }}
        title="Switch App"
      >
        {open ? "✕" : "⊞"}
      </button>
    </div>
  );
}
